import { useEffect, useState } from "react";

export const EditableOnClick = ({
  text,
  className,
  onChange,
  onEmptied,
  initiallyEditable,
}: {
  text: string;
  className?: string;
  onChange: (text: string) => void;
  onEmptied?: () => void;
  initiallyEditable?: boolean;
}) => {
  const [editingText, setEditingText] = useState<string | null>(
    initiallyEditable ? text : null
  );

  // onBlur is called immediately after rendering, even if autoFocus
  // is set. We don't want that.
  const [attachBlur, setAttachBlur] = useState(false);
  useEffect(() => {
    setAttachBlur(true);
  }, []);

  const saveText = () => {
    if (editingText !== null && editingText !== text) {
      onChange(editingText);
    }

    if (editingText === "" && onEmptied) {
      onEmptied();
    }
    setEditingText(null);
  };

  if (editingText !== null) {
    return (
      <input
        autoFocus
        className={className ?? ""}
        value={editingText}
        onChange={(e) => setEditingText(e.target.value)}
        onBlur={attachBlur ? saveText : undefined}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
        onMouseMove={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            saveText();
          } else if (e.key === "Escape") {
            setEditingText(null);
            e.stopPropagation();
            if (text.length === 0 && onEmptied) {
              onEmptied();
            }
          }
        }}
      />
    );
  }

  return (
    <span
      className={className ?? ""}
      onClick={(e) => {
        setEditingText(text);
        e.stopPropagation();
      }}
    >
      {text}
    </span>
  );
};
