import { MutableRefObject, useEffect, useRef, useState } from "react";

type Adjustments = { xAdjustment: number; yAdjustment: number };

export const useRepositionVisibly = <T extends HTMLElement | null>(
  ref: MutableRefObject<T>,
  idealPadding?: number
): Adjustments => {
  const [adjustments, setAdjustments] = useState<Adjustments>({
    xAdjustment: 0,
    yAdjustment: 0,
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const visibilityContainer = getVisibilityContainer(ref.current);
    if (!visibilityContainer) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const visibleRect = visibilityContainer.getBoundingClientRect();
    const inverseZoom =
      parseFloat(
        (window.getComputedStyle &&
          window
            .getComputedStyle(ref.current)
            ?.getPropertyValue("--inverse-zoom")) ??
          1
      ) || 1;
    const xAdjustment =
      getXAdjustment(rect, visibleRect, idealPadding ?? 0) * inverseZoom;
    const yAdjustment =
      getYAdjustment(rect, visibleRect, idealPadding ?? 0) * inverseZoom;

    setAdjustments({
      xAdjustment,
      yAdjustment,
    });
  }, []);

  return adjustments;
};

const getXAdjustment = (
  inner: DOMRect,
  outer: DOMRect,
  idealPadding: number
): number => {
  const tooFarLeft = inner.left < outer.left + idealPadding;
  const tooFarRight = inner.right > outer.right - idealPadding;

  if (inner.width > outer.width + 2 * idealPadding) {
    // nothing we can do
    return 0;
  }

  if (tooFarLeft) {
    return outer.left - inner.left + idealPadding;
  }

  if (tooFarRight) {
    return outer.right - inner.right - idealPadding;
  }

  return 0;
};

const getYAdjustment = (
  inner: DOMRect,
  outer: DOMRect,
  idealPadding: number
): number => {
  const tooFarUp = inner.top < outer.top + idealPadding;
  const tooFarDown = inner.bottom > outer.bottom - idealPadding;

  if (inner.height > outer.height) {
    // nothing we can do
    return 0;
  }

  if (tooFarUp) {
    return outer.top - inner.top + idealPadding;
  }

  if (tooFarDown) {
    return outer.bottom - inner.bottom - idealPadding;
  }

  return 0;
};

const getVisibilityContainer = (el: HTMLElement): HTMLElement | null => {
  const parent = el.parentElement;
  if (!parent) {
    return null;
  }

  if (!window.getComputedStyle) {
    return null;
  }

  const styles = window.getComputedStyle(parent);
  const overflowX = styles?.overflowX;
  const overflowY = styles?.overflowY;

  if (
    overflowX === "clip" ||
    overflowX === "hidden" ||
    overflowY === "clip" ||
    overflowY === "hidden"
  ) {
    return parent;
  }

  return getVisibilityContainer(parent);
};
