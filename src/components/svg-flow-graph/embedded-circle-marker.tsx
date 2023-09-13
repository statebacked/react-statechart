export const EmbeddedCircleMarker = ({ id }: { id: string }) => {
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
      <path stroke="none" fill="#ffcf5c" d="M0,0 h5 q5,0 5,5 q0,5 -5,5 h-5 z" />
      <path strokeWidth={1} stroke="#000" d="M0,5 h4" />
      <circle cx="4" cy="5" r="2" />
    </marker>
  );
};
