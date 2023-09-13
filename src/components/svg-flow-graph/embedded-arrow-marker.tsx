export const EmbeddedArrowMarker = ({
  id,
  color,
}: {
  id: string;
  color?: string;
}) => {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      markerWidth="10"
      markerHeight="10"
      refX="0"
      refY="5"
      markerUnits="strokeWidth"
      orient="auto"
    >
      <path
        stroke="none"
        fill={color ?? "#ffcf5c"}
        d="M0,0 h5 q5,0 5,5 q0,5 -5,5 h-5 z"
      />
      <path
        stroke="none"
        fill="#000"
        d="M1.43,5 L2,5 L2,2 L8.57,5 L2,8.57 L2,5 z"
      />
      <path stroke="#000" fill="none" strokeWidth={1} d="M0,5 L2,5" />
    </marker>
  );
};
