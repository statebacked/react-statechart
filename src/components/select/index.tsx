import { ReactNode, useRef } from "react";
import { useClickAway } from "../../hooks/use-click-away";
import { useModal } from "../../hooks/use-modal";
import styles from "./select.module.css";

export const Select = <Id extends string | number, Item extends { id: Id }>({
  selected,
  items,
  className,
  containerClassName,
  optionsContainerClassName,
  onChange,
  children,
}: {
  selected?: Id;
  items: Array<Item>;
  className?: string;
  containerClassName?: string;
  optionsContainerClassName?: string;
  onChange: (id: Id) => void;
  children: (item: Item) => ReactNode;
}) => {
  const { open, onClose, onToggle } = useModal();
  const ref = useRef(null);
  useClickAway(ref, onClose);

  const selectedItem = items.find((i) => i.id === selected);

  return (
    <div
      ref={ref}
      className={`${styles.selectContainer} ${containerClassName ?? ""}`}
    >
      <div className={`${styles.select} ${className ?? ""}`} onClick={onToggle}>
        {selectedItem ? children(selectedItem) : null}
      </div>
      <div
        className={`${styles.optionsContainer} ${
          open ? styles.open : styles.closed
        } ${optionsContainerClassName ?? ""}`}
      >
        {items
          .filter(({ id }) => id !== selected)
          .map((item) => (
            <div
              key={item.id}
              className={styles.option}
              onClick={(e) => {
                e.preventDefault();
                // we remove our element and close on the next turn
                // just to make sure the clicked item is still connected to the dom
                // when we evaluate it in use click away
                // (e.g. if we're in a popup, the click on this element should not close the popup)
                setTimeout(() => {
                  onClose();
                  onChange(item.id);
                }, 1);
              }}
            >
              {children(item)}
            </div>
          ))}
      </div>
    </div>
  );
};
