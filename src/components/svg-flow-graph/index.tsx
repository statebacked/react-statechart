import ELK, { ELK as iELK } from "elkjs";
import { Transition } from "../../flow-utils";
import { DrawableFlow } from "../../flow-utils";
import { StateNode } from "./state-node";
import {
  DrawableFlowWithTopLevelState,
  EnrichedElkNode,
  flowToElkGraph,
  getFullFlow,
  getStatePositionId,
  getTransitionPositionId,
  PositionedItemId,
  PositionInfo,
  Size,
  toLayoutMap,
} from "../../transformers/elk";
import * as schema from "../../schema";
import { SvgTransitionsView } from "./transitions-view";
import {
  headingBottomMargin,
  headingHeight,
  iconSize,
  itemHeight,
  letterWidth,
  padding,
} from "./sizes";

const getElk = (() => {
  let elk: iELK | undefined;
  return () => {
    if (!elk) {
      elk = new ELK();
    }
    return elk;
  };
})();

type Layout = Map<PositionedItemId, PositionInfo>;

export type SvgFlowGraphProps = {
  fullFlow: DrawableFlowWithTopLevelState;
  layout: Layout;
};

const rootId = "root" as schema.StateId;
const rootPosId = getStatePositionId(rootId);
const flowStateId = "flow" as schema.StateId;

const sizeForTransition = (
  flow: DrawableFlow,
  transition: Transition
): Size => {
  const name = transition.event ?? "Immediate transition";

  const itemCount =
    transition.actions.length +
    transition.assertions.length +
    (transition.condition ? 1 : 0);

  const maxChars = transition.assertions
    .map((a) => flow.metadata.assertions[a]?.name.length ?? 0)
    .concat(
      transition.actions.map((a) => flow.metadata.actions[a]?.name.length ?? 0)
    )
    .concat(transition.condition ? [transition.condition.length] : [])
    .concat([name.length])
    .reduce((a, b) => Math.max(a, b), 0);

  return {
    width:
      padding * 2 +
      iconSize +
      Math.max(Math.min(maxChars * letterWidth, 500), 50),
    height:
      padding * 2 +
      itemCount * itemHeight +
      headingHeight +
      (itemCount > 0 ? headingBottomMargin : 0),
    padding: {
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
    },
  };
};

const sizeForState = (
  flow: DrawableFlow,
  state: Pick<
    NonNullable<DrawableFlow["states"][schema.StateId]>,
    "name" | "assertions" | "entryActions" | "exitActions"
  >
): Size => {
  const itemCount =
    state.assertions.length +
    state.entryActions.length +
    state.exitActions.length;

  const maxChars = state.assertions
    .map((a) => flow.metadata.assertions[a]?.name.length ?? 0)
    .concat(
      state.entryActions.map((a) => flow.metadata.actions[a]?.name.length ?? 0)
    )
    .concat(
      state.exitActions.map((a) => flow.metadata.actions[a]?.name.length ?? 0)
    )
    .concat(state.name ? [state.name.length] : [])
    .reduce((a, b) => Math.max(a, b), 0);

  return {
    width:
      padding * 2 +
      iconSize +
      Math.max(Math.min(maxChars * letterWidth, 500), 50),
    height:
      padding * 2 +
      itemCount * itemHeight +
      headingHeight +
      (itemCount > 0 ? headingBottomMargin : 0),
    padding: {
      top: padding + headingHeight + headingBottomMargin,
      bottom: padding,
      left: padding,
      right: padding,
    },
  };
};

export const getSvgFlowGraphProps = async ({
  flow,
  direction,
}: {
  flow: DrawableFlow;
  direction: "horizontal" | "vertical";
}): Promise<SvgFlowGraphProps> => {
  const fullFlow = getFullFlow(rootId, flowStateId, flow);

  const sizeMap = new Map<PositionedItemId, Size>();

  sizeMap.set(
    getStatePositionId(flowStateId),
    sizeForState(fullFlow, { ...fullFlow, name: fullFlow.name ?? "Flow" })
  );

  for (let idx = 0; idx < fullFlow.transitions.length; ++idx) {
    const transition = fullFlow.transitions[idx];
    const transitionPosId = getTransitionPositionId(
      flowStateId,
      idx,
      transition.target
    );
    sizeMap.set(transitionPosId, sizeForTransition(fullFlow, transition));
  }

  for (const [stateId, s] of Object.entries(fullFlow.states)) {
    const state = s!;
    const statePosId = getStatePositionId(stateId as schema.StateId);

    sizeMap.set(statePosId, sizeForState(fullFlow, state));

    for (let idx = 0; idx < state.transitions.length; ++idx) {
      const transition = state.transitions[idx];
      const transitionPosId = getTransitionPositionId(
        stateId as schema.StateId,
        idx,
        transition.target
      );
      sizeMap.set(transitionPosId, sizeForTransition(fullFlow, transition));
    }
  }

  const graph = flowToElkGraph(sizeMap, rootId, fullFlow, direction);

  const elk = getElk();
  const layout = await elk.layout(graph);

  return {
    layout: toLayoutMap(sizeMap, layout as EnrichedElkNode),
    fullFlow,
  };
};

export const SvgFlowGraph = ({ fullFlow, layout }: SvgFlowGraphProps) => {
  const positions = layout;

  const rootPos = positions.get(rootPosId);

  const allTransitions = Object.entries(fullFlow.states).flatMap(
    ([sourceState, state]) =>
      state?.transitions.map((transition, transitionIdx) => ({
        transition,
        transitionIdx,
        sourceState: sourceState as schema.StateId,
      })) ?? []
  );
  const transitionsByPosId = new Map(
    allTransitions.map(({ transition, sourceState, transitionIdx }, idx) => [
      getTransitionPositionId(sourceState, transitionIdx, transition.target),
      { transition, sourceState, transitionIdx },
    ])
  );

  const topLevelStates = Object.entries(fullFlow.states).filter(
    ([_, state]) => state!.parent === rootId
  );

  return (
    <svg
      width={rootPos?.width}
      height={rootPos?.height}
      xmlns="http://www.w3.org/2000/svg"
      fontSize={15}
    >
      {topLevelStates.map(([stateId, state]) => (
        <StateNode
          key={stateId}
          isTopLevel
          positions={positions}
          flow={fullFlow}
          stateId={stateId as schema.StateId}
          state={state!}
          transitionsByPosId={transitionsByPosId}
        />
      ))}
      <SvgTransitionsView
        containerStateId={rootId}
        flow={fullFlow}
        positions={positions}
        transitionsByPosId={transitionsByPosId}
      />
    </svg>
  );
};
