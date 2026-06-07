import { ModalContext } from "@/provider/ModalContext";
import clsx from "clsx";
import { useEffect, useId, useRef, type JSX } from "react";
import { createPortal } from "react-dom";
import "@/assets/css/modal.css"
import { getFocusableElements } from "@/lib/focus";

export type DialogProps = Omit<JSX.IntrinsicElements["dialog"], "open"> & {
  open?: boolean,
  container?: HTMLElement|null,

  closeModal: () => void
}

function ModalPortal({ className, children, ...rest }: JSX.IntrinsicElements["dialog"]) {
  return (
    <dialog
      className={clsx("card modal", className)}
      aria-modal
      {...rest}
    >
      <div data-focustrap="start" aria-hidden tabIndex={0}></div>
      {children}
      <div data-focustrap="end" aria-hidden tabIndex={0}></div>
    </dialog>
  )
}

export default function Modal({ open, closeModal, container, id, ...rest }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalId = useId();
  const dialogId = id || `modal-${modalId}`;
  const modalTitleId = `modal-title-${modalId}`;

  useEffect(() => {
    const dialogElement = dialogRef.current!;
    let focusables = getFocusableElements(dialogElement);

    function onDomChange() {
      focusables = getFocusableElements(dialogElement);
    }

    function checkFocus(e: Event) {
      if (focusables.length === 0) return;
      const target = e.target as HTMLElement;
      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length-1] as HTMLElement;

      if (target.dataset.focustrap === "start") {
        e.preventDefault();
        last.focus();
      } else if (target.dataset.focustrap === "end") {
        e.preventDefault();
        first.focus();
      }
    }

    dialogElement.addEventListener("focusin", checkFocus);

    const observer = new MutationObserver(onDomChange);
    observer.observe(dialogElement, { childList: true, subtree: true });
    
    return () => {
      dialogElement.removeEventListener("focusin", checkFocus);
      observer.disconnect();
    }
  }, [])

  useEffect(() => {
    const dialogElement = dialogRef.current!;
    const focusStartEl = dialogElement.querySelector("[data-focustrap=\"start\"]")!;

    if (open) {
      dialogElement.showModal();
      (focusStartEl.nextElementSibling as HTMLElement)?.focus();
      document.body.style.overflow = "hidden";
      
    } else {
      dialogElement.close();
    }

    return () => { document.body.style.overflow = ""; };
  }, [open])

  useEffect(() => {
    const dialogElement = dialogRef.current!;

    function onClose(e: Event) {
      e.preventDefault();
      
      closeModal()
    }

    dialogElement.addEventListener("cancel", onClose);

    return () => {
      dialogElement.removeEventListener("cancel", onClose);
    }
  }, [closeModal])

  useEffect(() => {
    if (!open) return;

    let listenerAttached = false;
    const dialog = dialogRef.current!;
    
    function checkClickOutside(e: MouseEvent) {
      const  rect = dialog.getBoundingClientRect();

      // https://stackoverflow.com/questions/25864259/how-to-close-the-new-html-dialog-tag-by-clicking-on-its-backdrop
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      
      if (!isInDialog) {
        closeModal()
      }
    }
    
    // Hack to defer the listener
    const id = setTimeout(() => {
      listenerAttached = true;
      window.addEventListener("click", checkClickOutside);
    }, 0);

    return () => {
      clearTimeout(id);

      if (listenerAttached) {
        window.removeEventListener("click", checkClickOutside);
      }
    }
  }, [open, closeModal, modalId])
  
  return (
    <ModalContext.Provider value={{titleId: modalTitleId, closeModal}}>
      {createPortal(
        <ModalPortal id={dialogId} aria-labelledby={modalTitleId} ref={dialogRef} tabIndex={-1} {...rest} />,
        container || document.body
      )}
    </ModalContext.Provider>
  )
}