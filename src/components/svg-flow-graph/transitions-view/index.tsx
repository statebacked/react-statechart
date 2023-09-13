import * as schema from "../../../schema";
import { DrawableFlow } from "../../../flow-utils";
import { PositionedItemId, PositionInfo } from "../../../transformers/elk";
import { RoutingLayer } from "../routing-layer";
import { SvgTransitionNode } from "../transition-node";

export type Transition = DrawableFlow["transitions"][number];
export type TransitionInfo = {
  transition: Transition;
  sourceState: schema.StateId;
  transitionIdx: number;
};

export const SvgTransitionsView = ({
  containerStateId,
  positions,
  transitionsByPosId,
  flow,
  initialState,
}: {
  containerStateId: schema.StateId;
  positions: Map<PositionedItemId, PositionInfo>;
  transitionsByPosId: Map<PositionedItemId, TransitionInfo>;
  flow: DrawableFlow;
  initialState?: schema.StateId;
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
        <SvgTransitionNode
          key={`transition-${idx}`}
          positions={positions}
          sourceStateId={sourceState}
          transitionIdx={transitionIdx}
          flow={flow}
          transition={transition}
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
