import { ReactNode } from "react";
import styles from "./icon-button.module.css";

type CommonProps = {
  title: string;
  className?: string;
  size?: number;
  disabled?: boolean;
  onClick?: () => void;
};

type IconProps =
  | ({
      iconSrc: string;
    } & CommonProps)
  | ({ icon: ReactNode } & CommonProps);

export const IconButton = (props: IconProps) => {
  const { title, className, size, onClick } = props;
  const style = size ? { width: size, height: size } : {};

  return (
    <div
      title={title}
      className={`${styles.iconButton} ${className ?? ""}`}
      onClick={(e) => {
        if (!props.disabled && onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {"iconSrc" in props ? (
        <img alt={title} src={props.iconSrc} style={style} />
      ) : (
        props.icon
      )}
    </div>
  );
};
