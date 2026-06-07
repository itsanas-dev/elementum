export function getFocusableElements(el: HTMLElement): HTMLElement[] {
  const focusableElements = Array.from(el.querySelectorAll(`a, button,input,textarea,select,details,iframe,embed,object,summary,dialog,audio[controls],video[controls],[contenteditable],[tabindex]:not([tabindex="-1"])`)) as HTMLElement[];

  return focusableElements.filter((e) => {
    if (e.hasAttribute("disabled")) return false;
    if (e.hasAttribute("hidden")) return false;
    if (e.hasAttribute("data-focustrap")) return false;
    if (window.getComputedStyle(e).display === "none") return false;

    return true;
  })
}