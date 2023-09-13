import * as schema from "../../../schema";
import {
  getTransitionPositionId,
  PositionedItemId,
} from "../../../transformers/elk";
import { DrawableFlow, FlowItemIdentifier } from "../../../flow-utils";
import styles from "./transition-node.module.css";
import { FlowItemIcon } from "../../flow-items";
import { SvgFlowItemList } from "../flow-item-list";
import * as flows from "../../../data/flows";
import { SvgFlowItemIcon } from "../../svg-flow-items";
import {
  headingBottomPadding,
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

  return (
    <>
      <rect
        x={pos.x}
        y={pos.y}
        width={pos.width}
        height={pos.height}
        fill="#cebdff66"
        stroke="#a88aff"
      />
      <SvgFlowItemIcon
        flowItemType="event"
        x={pos.x + padding}
        y={pos.y + padding + 5 - 0.8 * 16}
        size={16}
      />
      <SizedText
        fontWeight={600}
        x={pos.x + padding + iconSize}
        y={pos.y + padding + 5}
        width={pos.width - 2 * padding - iconSize}
        height={16}
      >
        {eventName}
      </SizedText>
      <path
        d={`M ${pos.x + padding} ${
          pos.y + padding + headingHeight - headingBottomPadding
        } L ${pos.x + pos.width - padding} ${
          pos.y + padding + headingHeight - headingBottomPadding
        }`}
        stroke="#a88aff"
      />
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
