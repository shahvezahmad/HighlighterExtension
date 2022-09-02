//This utility function takes in contents and wraps them in a span with given background colour
let makeHighlitedNode = (sel, color, id) => {
  // if (range.commonAncestorContainer.)
  //   return false;
  let info = {
    anchor: sel.anchorNode,
    focus: sel.focusNode,
    anchorOffset: sel.anchorOffset,
    focusOffset: sel.focusOffset,
    color: color,
    highlightIndex: id,
    selectionString: sel.toString(),
  };
  let container = sel.getRangeAt(0).commonAncestorContainer;

  while (!container.innerHTML) {
    container = container.parentNode;
  }
  let rt = recursiveWrapper(container, info);
  if (sel.removeAllRanges) sel.removeAllRanges();

  return rt;
};

function recursiveWrapper(container, highlightInfo) {
  // Initialize the values of 'startFound' and 'charsHighlighted'
  return _recursiveWrapper(container, highlightInfo, false, 0);
}

function _recursiveWrapper(
  container,
  highlightInfo,
  startFound,
  charsHighlighted
) {
  const {
    anchor,
    focus,
    anchorOffset,
    focusOffset,
    color,
    highlightIndex,
    selectionString,
  } = highlightInfo;
  const selectionLength = selectionString.length;
  let children = [...container.childNodes];
  children.forEach((ele) => {
    // let ele = children[idx];
    if (charsHighlighted >= selectionLength) return; // Stop early if we are done highlighting

    if (ele.nodeType !== Node.TEXT_NODE) {
      // Only look at visible nodes because invisible nodes aren't included in the selected text
      // from the Window.getSelection() API
      if (ele.offsetWidth > 0 && ele.offsetHeight > 0) {
        [startFound, charsHighlighted] = _recursiveWrapper(
          ele,
          highlightInfo,
          startFound,
          charsHighlighted
        );
      }
      return;
    }

    // Step 1:
    // The first element to appear could be the anchor OR the focus node,
    // since you can highlight from left to right or right to left
    let startIndex = 0;
    if (!startFound) {
      if (anchor !== ele && focus !== ele) return; // If the element is not the anchor or focus, continue

      startFound = true;
      startIndex = Math.min(
        ...[
          ...(anchor == ele ? [anchorOffset] : []),
          ...(focus == ele ? [focusOffset] : []),
        ]
      );
    }

    // Step 2:
    // If we get here, we are in a text node, the start was found and we are not done highlighting
    let { nodeValue, parentElement: parent } = ele;

    if (startIndex > nodeValue.length) {
      // Start index is beyond the length of the text node, can't find the highlight
      // NOTE: we allow the start index to be equal to the length of the text node here just in case
      throw new Error(
        `No match found for highlight string '${selectionString}'`
      );
    }

    // Split the text content into three parts, the part before the highlight, the highlight and the part after the highlight:
    const highlightTextEl = ele.splitText(startIndex);

    // Instead of simply blindly highlighting the text by counting characters,
    // we check if the text is the same as the selection string.
    let i = startIndex;
    for (; i < nodeValue.length; i++) {
      // Skip any whitespace characters in the selection string as there can
      // be more than in the text node:
      while (
        charsHighlighted < selectionLength &&
        selectionString[charsHighlighted].match(/\s/u)
      ) {
        charsHighlighted++;
      }

      if (charsHighlighted >= selectionLength) break;

      const char = nodeValue[i];
      if (char === selectionString[charsHighlighted]) {
        charsHighlighted++;
      } else if (!char.match(/\s/u)) {
        // FIXME: Here, this is where the issue happens
        // Similarly, if the char in the text node is a whitespace, ignore any differences
        // Otherwise, we can't find the highlight text; throw an error
        console.log(nodeValue, i, selectionString, charsHighlighted);
        throw new Error(
          `No match found for highlight string '${selectionString}'`
        );
      }
    }

    // If textElement is wrapped in a .highlighted span, do not add this highlight
    // as it is already highlighted, but still count the number of charsHighlighted
    if (parent.classList.contains('highlighted')) return;

    const elementCharCount = i - startIndex; // Number of chars to highlight in this particular element
    const insertBeforeElement = highlightTextEl.splitText(elementCharCount);
    const highlightText = highlightTextEl.nodeValue;

    // If the text is all whitespace, ignore it
    if (highlightText.match(/^\s*$/u)) {
      parent.normalize(); // Undo any 'splitText' operations
      return;
    }

    // If we get here, highlight!
    // Wrap the highlighted text in a span with the highlight class name
    const highlightNode = document.createElement('span');
    highlightNode.classList.add('hilighted');
    highlightNode.style.backgroundColor = color;
    highlightNode.style.color = Luminance(color) > 0.3 ? 'black' : 'white';
    highlightNode.dataset.highlightId = highlightIndex;
    highlightNode.textContent = highlightTextEl.nodeValue;
    highlightTextEl.remove();
    parent.insertBefore(highlightNode, insertBeforeElement);
  });
  return [startFound, charsHighlighted];
}

let Luminance = (hex) => {
  let color = {
    r: ('0x' + hex[1] + hex[2]) | 0,
    g: ('0x' + hex[3] + hex[4]) | 0,
    b: ('0x' + hex[5] + hex[6]) | 0,
  };
  let { r, g, b } = color;
  r = r / 255;
  g = g / 255;
  b = b / 255;
  let mn = Math.min(r, g, b);
  let mx = Math.max(r, g, b);
  return (mx + mn) / 2;
};
