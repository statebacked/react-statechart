import {
  ReactElement,
  ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useClickAway } from "../../hooks/use-click-away";
import { useRepositionVisibly } from "../../hooks/use-reposition-visibly";
import styles from "./popup.module.css";

export const PopupWrapper = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className={styles.popupWrapper}>
        {children}
      </div>
    );
  }
);

type Props = InnerProps & {
  isOpen: boolean;
};

export const Popup = forwardRef<HTMLElement, Props>(
  (
    {
      isOpen,
      onClose,
      className,
      containerClassName,
      disableRepositioning,
      children,
    },
    ref
  ) => {
    const [show, setShow] = useState(isOpen);

    // we slighlty delay hiding in case we have event handlers attached to things in our popup that would disappear
    useEffect(() => {
      if (isOpen) {
        setShow(isOpen);
      } else {
        const t = setTimeout(() => {
          setShow(isOpen);
        }, 1);

        return () => {
          clearTimeout(t);
        };
      }
    }, [isOpen]);

    if (!show) {
      return null;
    }

    return (
      <Inner
        ref={ref}
        className={className}
        containerClassName={containerClassName}
        onClose={onClose}
        disableRepositioning={disableRepositioning ?? false}
      >
        {children}
      </Inner>
    );
  }
);

type InnerProps = {
  className?: string;
  containerClassName?: string;
  onClose: () => void;
  disableRepositioning?: boolean;
  children: ReactElement;
};

const Inner = forwardRef<HTMLElement, InnerProps>(
  (
    { className, onClose, disableRepositioning, containerClassName, children },
    ref
  ) => {
    const clickAwayRef = useRef<HTMLElement | null>(null);
    useClickAway(clickAwayRef, onClose);
    const popupRef = useRef(null);
    const { xAdjustment, yAdjustment } = useRepositionVisibly(popupRef, 24);

    return (
      <aside
        ref={(r) => {
          if (typeof ref === "function") {
            ref(r);
          } else if (ref) {
            ref.current = r;
          }

          clickAwayRef.current = r;
        }}
        className={`${styles.container} ${containerClassName ?? ""}`}
      >
        <div
          ref={popupRef}
          style={
            disableRepositioning
              ? {}
              : { marginLeft: xAdjustment, marginTop: yAdjustment }
          }
          className={`${styles.popup} ${className ?? ""}`}
        >
          {children}
        </div>
      </aside>
    );
  }
);
