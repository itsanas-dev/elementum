export function handleInputSubscripts(symbolLookup: Record<string, string>|null, inputElement: HTMLDivElement) {
  if (!symbolLookup) return;

  const text = inputElement.textContent;
  
  const sel = window.getSelection()
  let caretOffset = 0;
  
  if (sel) {
    const range = sel.getRangeAt(0)
    const pre = document.createRange()
    pre.selectNodeContents(inputElement)

    pre.setEnd(range.startContainer, range.startOffset)
    caretOffset = pre.toString().length
  }

  const textFragment = document.createDocumentFragment();
  let lastIndex = 0;

  // I can't be bothered to write a whole parser for this even though
  // it will be nicer and better.
  for (const match of text.matchAll(/([A-Z][a-z]*|\))(\d+)/g)) {
    const [full, element, n] = match;
    const index = match.index;

    const beforeMatch = text.slice(lastIndex, index);

    if (beforeMatch.length > 0) {
      textFragment.appendChild(document.createTextNode(beforeMatch))
    }

    if (symbolLookup[element] || element === ")") {
      textFragment.appendChild(document.createTextNode(element))
      const sub = document.createElement('sub')
      sub.textContent = n

      textFragment.appendChild(sub)
    } else {
      textFragment.appendChild(document.createTextNode(full));
    }

    lastIndex = index + full.length;
  }

  const afterMatch = text.slice(lastIndex);

  if (afterMatch.length > 0) {
    textFragment.appendChild(document.createTextNode(afterMatch))
  }

  inputElement.replaceChildren(textFragment);

  const walker = document.createTreeWalker(inputElement, NodeFilter.SHOW_TEXT);
  let node;
  let counted = 0;

  while ((node = walker.nextNode())) {
    if (!node.nodeValue) continue;
    const len = node.nodeValue.length;

    if (counted + len >= caretOffset) {
      const range = document.createRange()
      range.setStart(node, caretOffset - counted)
      range.collapse(true)
      
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(range)
      }

      break
    }

    counted += len
  }
}