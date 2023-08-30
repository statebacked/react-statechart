import { MutableRefObject, Ref, useEffect, useRef } from "react";
import { idempotentDebounce } from "../debounce-utils";

export type Position = { x: number; y: number; width: number; height: number };

export const usePosition = <
  T extends HTMLElement,
  S extends HTMLElement = HTMLElement
>(
  updatePosition: (pos: Position) => void,
  scrollerRef?: MutableRefObject<S | null>
): Ref<T> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const handler = () => {
      if (!ref.current) {
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      updatePosition(rect);
    };

    // we want to schedule a final handler run a few ms after we're last invoked
    // because we don't always get invoked with the absolute most updated data
    const handlerWithDebounceScheduler = () => {
      handler();
      debouncedHandler();
    };

    const debouncedHandler = idempotentDebounce(20, handler);

    scrollerRef?.current?.addEventListener(
      "scroll",
      handlerWithDebounceScheduler,
      { passive: true }
    );

    const resizeObserver = new ResizeObserver(handlerWithDebounceScheduler);
    resizeObserver.observe(ref.current);

    handler();

    return () => {
      resizeObserver.disconnect();
      scrollerRef?.current?.removeEventListener(
        "scroll",
        handlerWithDebounceScheduler
      );
    };
  }, [updatePosition]);

  return ref;
};
