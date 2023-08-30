import { ElementType, ReactNode } from "react";
import styles from "./grid-background.module.css";

export const GridBackground = ({
  as,
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) => {
  const El = as ?? "div";
  return (
    <El className={`${styles.gridBackground} ${className ?? ""}`}>
      {children}
    </El>
  );
};
