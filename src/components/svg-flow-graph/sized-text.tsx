import { SVGTextElementAttributes } from "react";
import { letterWidth } from "./sizes";

export const SizedText = ({
  x,
  y,
  width,
  height,
  children,
  ...props
}: {
  children: string;
  x: number;
  y: number;
  width: number;
  height: number;
} & SVGTextElementAttributes<SVGTextElement>) => {
  const maxChars = Math.floor(width / letterWidth);
  const str =
    children.length > maxChars
      ? children.slice(0, maxChars - 3) + "..."
      : children;

  return (
    <text {...props} x={x} y={y} width={width} height={height}>
      {str}
    </text>
  );
};
