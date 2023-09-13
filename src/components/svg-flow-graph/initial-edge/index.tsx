import { PositionInfo } from "../../../transformers/elk";
import { ArrowMarker } from "../arrow-marker";

export const InitialEdge = ({ pos }: { pos: PositionInfo }) => {
  const endPoint = {
    x: pos.x - 10,
    y: pos.y + 10,
  };

  const startPoint = {
    x: endPoint.x - 5,
    y: endPoint.y - 10,
  };

  const markerId = `n${Math.floor(Math.random() * 1000)}`;

  return (
    <g>
      <defs>
        <ArrowMarker id={markerId} />
      </defs>
      <circle r="4" cx={startPoint.x} cy={startPoint.y} fill="#000" />
      <path
        d={`M ${startPoint.x},${startPoint.y} Q ${startPoint.x},${endPoint.y} ${
          endPoint.x
        },${endPoint.y} L ${endPoint.x + 1}, ${endPoint.y}`}
        stroke="#000"
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#${markerId})`}
        pathLength={1}
      />
    </g>
  );
};
