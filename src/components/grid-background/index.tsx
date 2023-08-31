import { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./grid-background.module.css";

export const GridBackground = ({
  as,
  className,
  children,
  style,
}: {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const El = as ?? "div";
  return (
    <El className={`${styles.gridBackground} ${className ?? ""}`} style={style}>
      {children}
    </El>
  );
};
