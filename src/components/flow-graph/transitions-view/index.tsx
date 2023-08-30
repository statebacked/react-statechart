import { models } from "../../../schema";
import { FlowItemIdentifier, DrawableFlow } from "../../../flow-utils";
import {
  PositionedItemId,
  PositionInfo,
  Size,
} from "../../../transformers/elk";
import { RoutingLayer } from "../routing-layer";
import { TransitionNode } from "../transition-node";
import { Editable } from "../types";

export type Transition = DrawableFlow["transitions"][number];
export type TransitionInfo = {
  transition: Transition;
  sourceState: models.StateId;
  transitionIdx: number;
};

export const TransitionsView = ({
  containerStateId,
  positions,
  transitionsByPosId,
  flow,
  selectedItems,
  onReportSize,
  initialState,
  editable,
}: {
  containerStateId: models.StateId;
  positions: Map<PositionedItemId, PositionInfo>;
  transitionsByPosId: Map<PositionedItemId, TransitionInfo>;
  flow: DrawableFlow;
  selectedItems: Array<FlowItemIdentifier>;
  initialState?: models.StateId;
  onReportSize?: (positionId: PositionedItemId, size: Size) => void;
  editable?: Editable;
}) => {
  const transitions =
    positions.size > 0
      ? Array.from(positions.entries())
          .filter(
            ([_posId, pos]) => pos.connector?.container === containerStateId
          )
          .map(([_posId, pos]) => {
            if (!pos.connector) {
              return undefined;
            }
            const t = transitionsByPosId.get(pos.connector.transitionId);
            if (!t) {
              return undefined;
            }
            return { ...t, transitionId: pos.connector.transitionId };
          })
          .filter(
            (t): t is TransitionInfo & { transitionId: PositionedItemId } => !!t
          )
          .reduce(
            (
              [transitions, seen],
              transition
            ): [Array<TransitionInfo>, Set<PositionedItemId>] => {
              if (seen.has(transition.transitionId)) {
                return [transitions, seen];
              }

              seen.add(transition.transitionId);
              return [transitions.concat([transition]), seen];
            },
            [[], new Set()] as [Array<TransitionInfo>, Set<PositionedItemId>]
          )[0]
      : [];

  return (
    <>
      {transitions.map(({ transition, sourceState, transitionIdx }, idx) => (
        <TransitionNode
          key={`transition-${idx}`}
          positions={positions}
          sourceStateId={sourceState}
          transitionIdx={transitionIdx}
          onReportSize={onReportSize}
          flow={flow}
          transition={transition}
          selectedItems={selectedItems}
          editable={editable}
        />
      ))}
      <RoutingLayer
        transitions={transitionsByPosId}
        positions={positions}
        sourceState={containerStateId}
        initialState={initialState}
      />
    </>
  );
};
