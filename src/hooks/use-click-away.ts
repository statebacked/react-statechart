import { useEffect, RefObject, useRef, useCallback } from "react";

export const useClickAway = (
  ref: RefObject<HTMLElement | null>,
  onClickAway: () => void
) => {
  const clickAwayRef = useRef(onClickAway);
  clickAwayRef.current = onClickAway;

  const ignoreTimestampRef = useRef(Date.now());

  const doClickAway = () => {
    setTimeout(clickAwayRef.current, 10);
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const clickHandler = (evt: MouseEvent) => {
      const elapsed = Date.now() - ignoreTimestampRef.current;
      if (elapsed < 250) {
        // ignore this click
        return;
      }

      const ourEl = ref.current;
      if (!ourEl || !(evt.target instanceof Node)) {
        doClickAway();
        return;
      }

      const isOurClick = ourEl.contains(evt.target);
      if (isOurClick) {
        return;
      }

      const clickTippy = (evt.target as HTMLElement)?.closest(
        "[data-tippy-root]"
      );

      const isTippyClick = !!clickTippy;

      if (isTippyClick) {
        // ignore clicks on popups unless we're in that popup
        const ourTippy = ourEl.closest("[data-tippy-root]");
        if (ourTippy !== clickTippy) {
          return;
        }
      }

      doClickAway();
    };

    const escHandler = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        doClickAway();
      }
    };

    timeout = setTimeout(() => {
      timeout = null;
      document.body.addEventListener("click", clickHandler);
      document.body.addEventListener("keydown", escHandler);
    }, 100);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      document.body.removeEventListener("click", clickHandler);
      document.body.removeEventListener("keydown", escHandler);
    };
  }, []);

  const ignoreMomentarily = useCallback(() => {
    ignoreTimestampRef.current = Date.now();
  }, []);

  return ignoreMomentarily;
};
