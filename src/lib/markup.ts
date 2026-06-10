import { getElectronsInSubshell } from "@/lib/periodicTable";
import type { SubshellType } from "@/lib/types";

function calculateCaretOffset(inputElement: HTMLElement) {
  const sel = window.getSelection();
  let caretOffset = 0;

  if (sel) {
    const range = sel.getRangeAt(0);
    const pre = document.createRange();
    pre.selectNodeContents(inputElement);
    pre.setEnd(range.startContainer, range.startOffset);
    caretOffset = pre.toString().length;
  }

  return caretOffset;
}

function applyMarkup(
  inputElement: HTMLElement,
  transform: (text: string) => DocumentFragment
) {

  const sel = window.getSelection();
  const isFocused = document.activeElement === inputElement;
  const caretOffset = isFocused ? calculateCaretOffset(inputElement) : -1;

  const beforeLen = inputElement.textContent.length;
  
  inputElement.replaceChildren(transform(inputElement.textContent ?? ""));
  
  const afterLen = inputElement.textContent.length;

  if (import.meta.env.DEV) {
    console.assert(beforeLen === afterLen, `applyMarkup warning: textContent of ${inputElement} has been changed.`)
  }

  if (isFocused) {
    const walker = document.createTreeWalker(inputElement, NodeFilter.SHOW_TEXT);
    let node;
    let counted = 0;

    while ((node = walker.nextNode())) {
      if (!node.nodeValue) continue;
      const len = node.nodeValue.length;

      if (counted + len >= caretOffset) {
        const range = document.createRange();
        range.setStart(node, caretOffset - counted);
        range.collapse(true);
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        break;
      }

      counted += len;
    }
  }
}

function buildFragment(
  text: string,
  regex: RegExp,
  markupPredicate: (regexMatch: RegExpExecArray) => boolean,
  transform: (fragment: DocumentFragment, match: RegExpExecArray) => void
) {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  if (!regex.global) {
    console.warn(`applyMarkup: expected global regex ${regex}.`)
    fragment.appendChild(document.createTextNode("non-global regex. Error"));
    return fragment;
  }

  for (const match of text.matchAll(regex)) {
    const index = match.index;
    const before = text.slice(lastIndex, index);
    if (before) fragment.appendChild(document.createTextNode(before));

    if (markupPredicate(match)) {
      transform(fragment, match);
    } else {
      fragment.appendChild(document.createTextNode(match[0]));
    }

    lastIndex = index + match[0].length;
  }

  const after = text.slice(lastIndex);
  if (after) fragment.appendChild(document.createTextNode(after));

  return fragment;
}

export function markupMolecularFormula(
  symbolLookup: Record<string, string>, 
  inputElement: HTMLElement
) {
  applyMarkup(inputElement, (text) => {
    return buildFragment(
      text,
      /([A-Z][a-z]*|\))(\d+)/g,

      (match: RegExpExecArray) => {
        const element = match[1];

        return symbolLookup[element] !== undefined || element === ")";
      },

      (fragment, match) => {
        const element = match[1];
        const n = match[2];

        fragment.appendChild(document.createTextNode(element));
        const sub = document.createElement("sub");
        sub.textContent = n;
        fragment.appendChild(sub);
      }
    );
  }); 
}

export function markupSubshell(
  element: HTMLElement
) {
  applyMarkup(element, (text) => {
    return buildFragment(
      text,
      /(\d)([spdf])(\d+)/g,
      (match) => {
        const subshell: SubshellType = match[2] as SubshellType;
        const electrons = Number.parseInt(match[3]);
        const maxElectrons = getElectronsInSubshell(subshell);

        return (electrons > 0 && electrons <= maxElectrons);
      },

      (fragment, match) => {
        const [_, shellNumber, subshellType, electrons] = match;

        fragment.appendChild(document.createTextNode(`${shellNumber}${subshellType}`));
        
        const sup = document.createElement("sup");
        sup.textContent = electrons;

        fragment.appendChild(sup);
      }
    )
  })
}