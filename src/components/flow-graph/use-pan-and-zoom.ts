import { MouseEvent, useEffect, useReducer, useRef } from "react";
import { debounceWithLimit } from "../../debounce-utils";

type ZoomState = {
  zoom: number;
  dx: number;
  dy: number;
  awaitingSizes: boolean;
  dragging?: boolean;
  containerSize?: Size;
};
type ZoomAction =
  | { type: "update-container-size"; containerSize: Size }
  | {
      type: "wheel";
      deltaX: number;
      deltaY: number;
      controlPressed: boolean;
    }
  | {
      type: "drag";
      movementX: number;
      movementY: number;
    }
  | { type: "mouse-down" }
  | { type: "mouse-up" }
  | { type: "discrete-zoom"; direction: "in" | "out" }
  | { type: "reset" }
  | { type: "sizes-changed" };

type Size = { width: number; height: number };

export const usePanAndZoom = (rootPos: Size | undefined) => {
  const ref = useRef<HTMLElement | null>(null);

  const [zoomState, zoomDispatch] = useReducer(
    (state: ZoomState, action: ZoomAction): ZoomState => {
      switch (action.type) {
        case "update-container-size":
          return {
            ...state,
            containerSize: action.containerSize,
          };
        case "reset":
          return sizeToFit(rootPos, state.containerSize);
        case "discrete-zoom":
          return clamp(rootPos, state.containerSize, {
            ...state,
            zoom: state.zoom + (action.direction === "in" ? 1 : -1) * 0.3,
          });
        case "drag":
          if (!state.dragging) {
            return state;
          }

          return clamp(rootPos, state.containerSize, {
            ...state,
            dx: state.dx + action.movementX / state.zoom,
            dy: state.dy + action.movementY / state.zoom,
          });
        case "mouse-down":
          return {
            ...state,
            dragging: true,
          };
        case "mouse-up":
          return {
            ...state,
            dragging: false,
          };
        case "sizes-changed":
          return state.awaitingSizes
            ? sizeToFit(rootPos, state.containerSize)
            : state;
        case "wheel": {
          if (action.controlPressed) {
            const delta = Math.max(-1, Math.min(1, action.deltaY));
            return clamp(rootPos, state.containerSize, {
              ...state,
              zoom: state.zoom - delta / 20,
            });
          } else {
            return clamp(rootPos, state.containerSize, {
              ...state,
              dx: state.dx - action.deltaX,
              dy: state.dy - action.deltaY,
            });
          }
        }
      }
      return state;
    },
    null,
    () => sizeToFit(rootPos, undefined)
  );

  // this ensures that our first real render after a sizing rendering will be sized to fit
  useEffect(() => zoomDispatch({ type: "sizes-changed" }), [!rootPos]);

  // we need to add the wheel handler directly because React makes it passive and we need to prevent window zooming
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      zoomDispatch({
        type: "wheel",
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        controlPressed: e.getModifierState("Control"),
      });
      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel);

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // have to debounce/wait because resize observer doesn't always call with the final size
    const debouncedUpdateContainerSize = debounceWithLimit(20, 50, () => {
      if (!ref.current) {
        return;
      }
      zoomDispatch({
        type: "update-container-size",
        containerSize: ref.current.getBoundingClientRect(),
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdateContainerSize(undefined, undefined);
    });

    resizeObserver.observe(ref.current);

    debouncedUpdateContainerSize(undefined, undefined);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const { zoom, dx, dy } = zoomState;

  return {
    zoom,
    dx,
    dy,
    styles: {
      transform: `scale(${zoom}) translate3d(${dx}px, ${dy}px, 0)`,
      transformOrigin: "0 0",
      "--inverse-zoom": `${1 / zoom}`,
      ...(zoomState.dragging ? { transition: "none" } : {}),
    },
    ref,
    dragStyles: zoomState.dragging ? { cursor: "grabbing" } : {},
    onMouseMove: (e: MouseEvent) => {
      if ((e.buttons & 1) !== 1) {
        return;
      }
      zoomDispatch({
        type: "drag",
        movementX: e.movementX,
        movementY: e.movementY,
      });
    },
    onDoubleClick: (e: MouseEvent) => {
      zoomDispatch({ type: "discrete-zoom", direction: "in" });
    },
    onMouseDown: (e: MouseEvent) => {
      zoomDispatch({ type: "mouse-down" });
    },
    onMouseUp: (e: MouseEvent) => {
      zoomDispatch({ type: "mouse-up" });
    },
    onZoomIn: () => {
      zoomDispatch({ type: "discrete-zoom", direction: "in" });
    },
    onZoomOut: () => {
      zoomDispatch({ type: "discrete-zoom", direction: "out" });
    },
    onReset: () => {
      zoomDispatch({ type: "reset" });
    },
  };
};

const clamp = (
  rootPos: Size | undefined,
  containerSize: Size | undefined,
  proposed: ZoomState
): ZoomState => {
  const maxDy = (containerSize?.height ?? 1000) / proposed.zoom;
  const maxDx = (containerSize?.width ?? 750) / proposed.zoom;

  return {
    ...proposed,
    zoom: clampZoom(proposed.zoom),
    dx: Math.max(
      Math.min(proposed.dx, maxDx),
      -(rootPos?.width ?? 0) / proposed.zoom
    ),
    dy: Math.max(
      Math.min(proposed.dy, maxDy),
      -(rootPos?.height ?? 0) / proposed.zoom
    ),
  };
};

const clampZoom = (zoom: number): number => Math.max(Math.min(zoom, 5), 0.2);

const sizeToFit = (
  rootPos: Size | undefined,
  containerSize: Size | undefined
): ZoomState => {
  if (!rootPos || !containerSize) {
    return { zoom: 1.0, dx: 0, dy: 0, awaitingSizes: true, containerSize };
  }

  const paddingFactor = 1.2;
  const widthZoom =
    (containerSize.width - paddingFactor) / (rootPos.width * paddingFactor);
  const heightZoom =
    (containerSize.height - paddingFactor) / (rootPos.height * paddingFactor);

  const zoom = clampZoom(Math.min(widthZoom, heightZoom));

  return clamp(rootPos, containerSize, {
    zoom,
    dx: (containerSize.width - rootPos.width * zoom) / 2 / zoom,
    dy: (containerSize.height - rootPos.height * zoom) / 2 / zoom,
    awaitingSizes: false,
    containerSize,
  });
};
