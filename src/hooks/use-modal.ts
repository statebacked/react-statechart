import { useCallback, useState } from "react";

export const useModal = (initiallyOpen?: boolean) => {
  const [open, setOpen] = useState(initiallyOpen ?? false);

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return {
    open,
    onOpen,
    onClose,
    onToggle,
  };
};
