import { PositionInfo } from "../../transformers/elk";

export const SvgMask = ({
  maskId,
  masks,
}: {
  maskId: string;
  masks: Array<PositionInfo>;
}) => {
  if (masks.length === 0) {
    return null;
  }

  const hidden = masks.map((mask, idx) => (
    <rect
      key={`mask-${idx}`}
      fill="#000"
      x={mask.x}
      y={mask.y}
      width={mask.width}
      height={mask.height}
    />
  ));

  return (
    <mask id={maskId} maskUnits="userSpaceOnUse">
      <rect fill="#fff" x={0} y={0} width="100%" height="100%" />
      {hidden}
    </mask>
  );
};
