import { models } from "../../../schema";
import {
  Connector,
  getStatePositionId,
  PositionedItemId,
  PositionInfo,
} from "../../../transformers/elk";
import { pathToD, pointsToPath, roundPath } from "../../../transformers/svg";
import { EmbeddedArrowMarker } from "../embedded-arrow-marker";
import { EmbeddedCircleMarker } from "../embedded-circle-marker";
import { EmbeddedThroughMarker } from "../embedded-through-marker";
import { InitialEdge } from "../initial-edge";
import styles from "./routing-layer.module.css";

export const RoutingLayer = ({
  sourceState,
  positions,
  initialState,
  transitions,
}: {
  sourceState: models.StateId;
  positions: Map<PositionedItemId, PositionInfo>;
  initialState?: models.StateId;
  transitions: { has: (transitionId: PositionedItemId) => boolean };
}) => {
  const connectorPoss = Array.from(positions.values()).filter(
    (pos): pos is PositionInfo & { connector: Connector } =>
      pos.connector?.container === sourceState
  );

  const initialStatePos = initialState
    ? positions.get(getStatePositionId(initialState))
    : undefined;

  return (
    <svg className={styles.routing}>
      {connectorPoss.map(({ connector }, connIdx) => {
        const endMarkerId = `end-${sourceState}-${connIdx}`;
        const startMarkerId = `start-${sourceState}-${connIdx}`;
        const path = pointsToPath(connector.points);
        const reversePath = pointsToPath(
          Array.from(connector.points).reverse()
        );

        if (!path || !reversePath || !transitions.has(connector.transitionId)) {
          return null;
        }

        return (
          <g key={`connector-${connIdx}`}>
            <defs>
              {connector.targetIsEvent ? (
                <EmbeddedThroughMarker id={endMarkerId} />
              ) : (
                <EmbeddedArrowMarker id={endMarkerId} />
              )}
              {connector.sourceIsEvent ? (
                <EmbeddedThroughMarker id={startMarkerId} />
              ) : (
                <EmbeddedCircleMarker id={startMarkerId} />
              )}
            </defs>
            <path
              stroke="#000"
              strokeWidth={2}
              fill="none"
              d={pathToD(roundPath(path))}
              markerEnd={`url(#${endMarkerId})`}
            />
            {/* pretty weird - markerStart doesn't orient properly but markerEnd does... */}
            <path
              stroke="none"
              strokeWidth={2}
              fill="none"
              d={pathToD(roundPath(reversePath))}
              markerEnd={`url(#${startMarkerId})`}
            />
          </g>
        );
      })}
      {initialStatePos ? <InitialEdge pos={initialStatePos} /> : null}
    </svg>
  );
};
