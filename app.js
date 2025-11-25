// Wire up all page interactions once the DOM is ready so queries never run on a missing element.
document.addEventListener('DOMContentLoaded', () => {
  // Cache handles for the two textareas where users provide input.
  const originalInput = document.getElementById('originalText');
  const modifiedInput = document.getElementById('modifiedText');
  // Buttons that trigger comparison and clearing.
  const compareBtn = document.getElementById('compareBtn');
  const clearBtn = document.getElementById('clearBtn');
  // Summary and diff containers that get updated on each compare run.
  const summaryEl = document.getElementById('summary');
  const diffOutput = document.getElementById('diffOutput');

  // Perform a comparison every time the user clicks Compare.
  compareBtn.addEventListener('click', () => {
    // Normalize both text blocks into arrays of lines.
    const originalLines = toLines(originalInput.value);
    const modifiedLines = toLines(modifiedInput.value);
    // Run the line-level LCS diff to classify each line operation.
    const diff = computeDiff(originalLines, modifiedLines);
    // Render the diff (including word-level details for modified pairs).
    const changedPairs = renderDiff(diffOutput, diff);
    // Update the summary counts so users see quick totals.
    renderSummary(summaryEl, {
      originalTotal: originalLines.length,
      modifiedTotal: modifiedLines.length,
      same: countType(diff, 'same'),
      added: countType(diff, 'added'),
      removed: countType(diff, 'removed'),
      changedPairs
    });
  });

  // Reset all UI state when Clear is clicked.
  clearBtn.addEventListener('click', () => {
    originalInput.value = '';
    modifiedInput.value = '';
    summaryEl.textContent = '';
    diffOutput.innerHTML = '';
  });
});

// Convert a raw textarea string into an array of lines; return an empty array for empty input.
function toLines(text) {
  if (text === '') return [];
  return text.split(/\r?\n/);
}

// Simple LCS-based diff to classify lines as same/added/removed.
function computeDiff(aLines, bLines) {
  const m = aLines.length;
  const n = bLines.length;
  // dp[i][j] holds the LCS length for the first i lines of aLines and first j lines of bLines.
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Fill the DP table by comparing every pair of prefixes.
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aLines[i - 1] === bLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack through the DP table to recover the operations.
  const ops = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (aLines[i - 1] === bLines[j - 1]) {
      ops.push({ type: 'same', value: aLines[i - 1] });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'removed', value: aLines[i - 1] });
      i -= 1;
    } else {
      ops.push({ type: 'added', value: bLines[j - 1] });
      j -= 1;
    }
  }

  // Any remaining lines in aLines are removals.
  while (i > 0) {
    ops.push({ type: 'removed', value: aLines[i - 1] });
    i -= 1;
  }

  // Any remaining lines in bLines are additions.
  while (j > 0) {
    ops.push({ type: 'added', value: bLines[j - 1] });
    j -= 1;
  }

  // Reverse because we built the operations from the end toward the start.
  return ops.reverse();
}

// Count how many operations of a given type appear in the diff result.
function countType(diffOps, type) {
  let count = 0;
  for (const op of diffOps) {
    if (op.type === type) count += 1;
  }
  return count;
}

// Render the full diff (line level and word level) and return how many modified pairs were found.
function renderDiff(container, diffOps) {
  // Reset the output container before drawing new content.
  container.innerHTML = '';
  // Build into a fragment to minimize layout thrash.
  const frag = document.createDocumentFragment();
  let changedPairs = 0;
  let i = 0;

  // Walk the operations and look for modified pairs or plain lines.
  while (i < diffOps.length) {
    const current = diffOps[i];
    const next = diffOps[i + 1];

    // Classic removed+added pair; treat as a modified line with word-level highlighting.
    if (current.type === 'removed' && next && next.type === 'added') {
      renderModifiedPair(frag, current.value, next.value);
      changedPairs += 1;
      i += 2;
      continue;
    }

    // Added+removed pair (alternative LCS ordering); still render as modified with old then new.
    if (current.type === 'added' && next && next.type === 'removed') {
      renderModifiedPair(frag, next.value, current.value);
      changedPairs += 1;
      i += 2;
      continue;
    }

    // Anything else is rendered as a simple line with a prefix.
    renderPlainLine(frag, current);
    i += 1;
  }

  container.appendChild(frag);
  return changedPairs;
}

// Update the summary bar with counts for both files and operation breakdown.
function renderSummary(el, stats) {
  const { originalTotal, modifiedTotal, same, added, removed, changedPairs } = stats;
  el.textContent =
    'Original: ' + originalTotal + ' lines | ' +
    'Modified: ' + modifiedTotal + ' lines | ' +
    'Same: ' + same + ' | ' +
    'Added: ' + added + ' | ' +
    'Removed: ' + removed + ' | ' +
    'Changed pairs: ' + changedPairs;
}

// Provide the visible prefix for each diff line type.
function prefixFor(type) {
  if (type === 'added') return '+ ';
  if (type === 'removed') return '- ';
  return '  ';
}

// Render a single plain line (same/added/removed) without word-level detail.
function renderPlainLine(frag, op) {
  const lineEl = document.createElement('div');
  lineEl.className = 'diff-line ' + op.type;
  lineEl.textContent = prefixFor(op.type) + op.value;
  frag.appendChild(lineEl);
}

// Render a modified line pair with inline word-level highlights.
function renderModifiedPair(frag, oldLine, newLine) {
  // Compute word-level operations between the two line strings.
  const wordOps = diffWords(oldLine, newLine);

  // Old version (removed) line with inline removed spans.
  const removedLine = document.createElement('div');
  removedLine.className = 'diff-line removed modified';
  removedLine.appendChild(createPrefix('- '));
  appendWordTokens(removedLine, wordOps, 'removed');
  frag.appendChild(removedLine);

  // New version (added) line with inline added spans.
  const addedLine = document.createElement('div');
  addedLine.className = 'diff-line added modified';
  addedLine.appendChild(createPrefix('+ '));
  appendWordTokens(addedLine, wordOps, 'added');
  frag.appendChild(addedLine);
}

// Create a simple span prefix (e.g., "+ " or "- ").
function createPrefix(text) {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

// Append word-level tokens to a line element, filtered to the type we care about.
function appendWordTokens(lineEl, tokens, focusType) {
  for (const token of tokens) {
    // Skip empty tokens to avoid extra spans.
    if (!token.value) continue;
    // Only render "same" tokens and tokens matching the focus (added for new lines, removed for old lines).
    if (token.type !== 'same' && token.type !== focusType) continue;

    const span = document.createElement('span');
    if (token.type === 'same') {
      // Shared words render plainly to preserve context.
      span.textContent = token.value;
    } else if (token.type === 'added' && focusType === 'added') {
      // Added tokens get the "added" highlight on the added line.
      span.className = 'diff-word diff-word-added';
      span.textContent = token.value;
    } else if (token.type === 'removed' && focusType === 'removed') {
      // Removed tokens get the "removed" highlight on the removed line.
      span.className = 'diff-word diff-word-removed';
      span.textContent = token.value;
    } else {
      continue;
    }
    lineEl.appendChild(span);
  }
}

// Word-level LCS diff between two line strings to drive inline highlighting.
function diffWords(oldLine, newLine) {
  const a = tokenizeWords(oldLine);
  const b = tokenizeWords(newLine);
  const m = a.length;
  const n = b.length;
  // dp[i][j] stores the LCS length for the first i tokens of a and first j tokens of b.
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Populate the table with token matches and best substructure choices.
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Walk backward through the table to produce token-level operations.
  const ops = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: 'same', value: a[i - 1] });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'removed', value: a[i - 1] });
      i -= 1;
    } else {
      ops.push({ type: 'added', value: b[j - 1] });
      j -= 1;
    }
  }

  // Residual tokens in a are removals.
  while (i > 0) {
    ops.push({ type: 'removed', value: a[i - 1] });
    i -= 1;
  }

  // Residual tokens in b are additions.
  while (j > 0) {
    ops.push({ type: 'added', value: b[j - 1] });
    j -= 1;
  }

  return ops.reverse();
}

// Tokenize a line into words and whitespace segments so spacing is preserved during diffing.
function tokenizeWords(line) {
  if (line === '') return [];
  return line.split(/(\s+)/);
}
