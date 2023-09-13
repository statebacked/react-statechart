export const EmbeddedThroughMarker = ({
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
        fill={color ?? "#8753dd"}
        d="M0,0 h5 q5,0 5,5 q0,5 -5,5 h-5 z"
      />
      <path strokeWidth={1} stroke="#000" d="M0,5 h4" />
      <circle cx="4" cy="5" r="2" />
    </marker>
  );
};
