import * as schema from "../../../schema";
import {
  getTransitionPositionId,
  PositionedItemId,
} from "../../../transformers/elk";
import { DrawableFlow, FlowItemIdentifier } from "../../../flow-utils";
import { SvgFlowItemList } from "../flow-item-list";
import * as flows from "../../../data/flows";
import { SvgFlowItemIcon } from "../../svg-flow-items";
import {
  cornerRadius,
  headingBottomMargin,
  headingHeight,
  iconSize,
  padding,
} from "../sizes";
import { SizedText } from "../sized-text";

export const SvgTransitionNode = ({
  flow,
  sourceStateId,
  transitionIdx,
  transition,
  positions,
}: {
  flow: DrawableFlow;
  sourceStateId: schema.StateId;
  transitionIdx: number;
  transition: NonNullable<schema.Flow["transitions"][any]>;
  positions: Map<
    PositionedItemId,
    { x: number; y: number; width: number; height: number }
  >;
}) => {
  const eventName = flows.eventName(flow, transition);

  const transitionPosId = getTransitionPositionId(
    sourceStateId,
    transitionIdx,
    transition.target
  );

  const pos = positions.get(transitionPosId);

  if (!pos) {
    return null;
  }

  const conditionItems: Array<FlowItemIdentifier> =
    typeof transition.condition === "string"
      ? [{ flowItemType: "condition", flowItemId: transition.condition }]
      : [];
  const actionItems = transition.actions.map(
    (flowItemId): FlowItemIdentifier => ({
      flowItemType: "action",
      flowItemId,
    })
  );
  const assertionItems = transition.assertions.map(
    (flowItemId): FlowItemIdentifier => ({
      flowItemType: "assertion",
      flowItemId,
    })
  );
  const items = conditionItems.concat(actionItems).concat(assertionItems);

  const hasContent = items.length > 0;

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
        fill="#cebdff66"
        stroke="#a88aff"
      />
      <SvgFlowItemIcon
        flowItemType="event"
        x={pos.x + padding}
        y={titleY}
        size={16}
      />
      <SizedText
        fontWeight={600}
        x={pos.x + padding + iconSize}
        y={titleY + 13}
        width={pos.width - 2 * padding - iconSize}
        height={10}
      >
        {eventName}
      </SizedText>
      {hasContent ? (
        <path
          d={`M ${pos.x + padding} ${
            pos.y + padding + headingHeight - headingBottomMargin
          } L ${pos.x + pos.width - padding} ${
            pos.y + padding + headingHeight - headingBottomMargin
          }`}
          stroke="#a88aff"
        />
      ) : null}
      <SvgFlowItemList
        flow={flow}
        items={items}
        x1={pos.x + padding}
        x2={pos.x + pos.width - padding}
        y1={pos.y + padding + headingHeight}
        y2={pos.y + pos.height - padding}
      />
    </>
  );
};
