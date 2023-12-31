import * as schema from "../../../schema";
import {
  getStatePositionId,
  PositionedItemId,
  PositionInfo,
} from "../../../transformers/elk";
import { DrawableFlow, FlowItemIdentifier } from "../../../flow-utils";
import { TransitionInfo, SvgTransitionsView } from "../transitions-view";
import { SvgFlowItemList } from "../flow-item-list";
import { SvgFlowItemIcon } from "../../svg-flow-items";
import {
  cornerRadius,
  headingBottomMargin,
  headingHeight,
  iconSize,
  padding,
} from "../sizes";
import { SizedText } from "../sized-text";

export const StateNode = ({
  flow,
  stateId,
  state,
  positions,
  isTopLevel,
  transitionsByPosId,
}: {
  flow: DrawableFlow;
  stateId: schema.StateId;
  state: NonNullable<schema.Flow["states"][any]>;
  positions: Map<PositionedItemId, PositionInfo>;
  isTopLevel?: boolean;
  transitionsByPosId: Map<PositionedItemId, TransitionInfo>;
}) => {
  const statePosId = getStatePositionId(stateId);

  const pos = positions.get(statePosId);

  if (!pos) {
    return null;
  }

  const parent = state.parent && flow.states[state.parent];
  const isParallel = parent?.type === "parallel";

  const childStates = Object.entries(flow.states).filter(
    ([_childId, state]) => state!.parent === stateId
  );

  const flowItems = state.entryActions
    .map(
      (action): FlowItemIdentifier => ({
        flowItemId: action,
        flowItemType: "entry-action",
      })
    )
    .concat(
      state.exitActions.map(
        (action): FlowItemIdentifier => ({
          flowItemId: action,
          flowItemType: "exit-action",
        })
      )
    )
    .concat(
      state.assertions.map((assertion) => ({
        flowItemId: assertion,
        flowItemType: "assertion",
      }))
    );

  const hasContent = childStates.length > 0 || flowItems.length > 0;

  const titleY = hasContent ? pos.y + padding : pos.y + pos.height / 2 - 16 / 2;

  return (
    <>
      <rect
        x={pos.x}
        y={pos.y}
        width={pos.width}
        height={pos.height}
        rx={cornerRadius}
        ry={cornerRadius}
        fill={isTopLevel ? "none" : "#ffefc919"}
        stroke="#ffdf92"
        strokeDasharray={isParallel ? "3 4" : undefined}
      />
      <SvgFlowItemIcon
        flowItemType="state"
        x={pos.x + padding}
        y={titleY}
        size={16}
      />
      <SizedText
        x={pos.x + padding + iconSize}
        y={titleY + 13}
        width={pos.width - 2 * padding - iconSize}
        height={10}
        fontWeight={600}
      >
        {state.name}
      </SizedText>
      {hasContent ? (
        <path
          d={`M ${pos.x + padding} ${pos.y + padding + headingHeight} L ${
            pos.x + pos.width - padding
          } ${pos.y + padding + headingHeight}`}
          stroke="#ffdf92"
        />
      ) : null}
      <SvgFlowItemList
        flow={flow}
        items={flowItems}
        x1={pos.x + padding}
        x2={pos.x + pos.width - padding}
        y1={pos.y + padding + headingHeight + headingBottomMargin}
        y2={pos.y + pos.height - padding}
      />
      {childStates.length > 0 ? (
        <svg x={pos.x} y={pos.y} width={pos.width} height={pos.height}>
          {childStates.map(([childId, childState]) => (
            <StateNode
              key={childId}
              flow={flow}
              positions={positions}
              state={childState!}
              stateId={childId as schema.StateId}
              transitionsByPosId={transitionsByPosId}
            />
          ))}
          <SvgTransitionsView
            containerStateId={stateId}
            flow={flow}
            positions={positions}
            transitionsByPosId={transitionsByPosId}
            initialState={state.initialState}
          />
        </svg>
      ) : null}
    </>
  );
};
