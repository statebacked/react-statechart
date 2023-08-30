import { models } from "../../../schema";
import { useCallback } from "react";
import {
  getTransitionPositionId,
  PositionedItemId,
} from "../../../transformers/elk";
import {
  DrawableFlow,
  FlowItemIdentifier,
  transitionRelevantToFlowItems,
} from "../../../flow-utils";
import styles from "./transition-node.module.css";
import { FlowItemIcon } from "../../flow-items";
import { FlowItemList } from "../flow-item-list";
import { Position, usePosition } from "../../../hooks/use-position";
import * as flows from "../../../data/flows";
import { EditableOnClick } from "../../editable-on-click";
import { IconButton } from "../../icon-button";
import { RiDeleteBinLine } from "react-icons/ri";
import { Editable } from "../types";

export const TransitionNode = ({
  flow,
  sourceStateId,
  transitionIdx,
  transition,
  positions,
  selectedItems,
  onReportSize,
  editable,
}: {
  flow: DrawableFlow;
  sourceStateId: models.StateId;
  transitionIdx: number;
  transition: NonNullable<models.Flow["transitions"][any]>;
  positions: Map<PositionedItemId, { x: number; y: number }>;
  selectedItems: Array<FlowItemIdentifier>;
  onReportSize?: (
    positionId: PositionedItemId,
    size: { width: number; height: number }
  ) => void;
  editable?: Editable;
}) => {
  const eventName = flows.eventName(flow, transition);

  const transitionPosId = getTransitionPositionId(
    sourceStateId,
    transitionIdx,
    transition.target
  );

  const pos = positions.get(transitionPosId);

  const reportPos = useCallback(
    (pos: Position) => {
      if (!onReportSize) {
        return;
      }

      onReportSize(transitionPosId, { height: pos.height, width: pos.width });
    },
    [onReportSize]
  );
  const ref = usePosition(reportPos);

  const isSelected = transitionRelevantToFlowItems(
    flow,
    selectedItems,
    sourceStateId,
    transition
  );

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
    <figure
      ref={ref}
      className={`${styles.transitionNode} ${
        isSelected ? styles.selected : ""
      } ${pos ? "" : styles.sizing}`}
      style={pos ? { left: pos.x, top: pos.y } : {}}
    >
      {editable ? (
        <IconButton
          className={styles.deleteButton}
          icon={<RiDeleteBinLine size={16} />}
          title="Delete"
          onClick={() =>
            editable.onDeleteTransition(
              sourceStateId,
              transition.target,
              transition.event,
              transition.condition
            )
          }
        />
      ) : null}
      <header>
        <FlowItemIcon flowItemType="event" transparent />
        <h2 className={`${styles.name}`}>
          {editable ? (
            <EditableOnClick
              className={styles.editable}
              text={eventName}
              onChange={(name) => {
                editable.onUpdateTransition(
                  sourceStateId,
                  transition.target,
                  transition.event,
                  transition.condition,
                  {
                    event: {
                      id:
                        transition.event ??
                        (flows.freshFlowItemId() as models.EventId),
                      name,
                    },
                  }
                );
              }}
            />
          ) : (
            eventName
          )}
        </h2>
      </header>
      <FlowItemList
        flow={flow}
        items={items}
        nonEmptyClassName={styles.nonEmptyFlowListItems}
        editable={
          editable
            ? {
                eligibleTypes: ["action", "assertion", "condition", "state"],
                typeLabelOverride: {
                  state: transition.target ? "Change Target" : "Add Target",
                },
                onDeleteItem(itemId) {
                  editable.onDeleteTransitionItem(
                    sourceStateId,
                    transition.target,
                    transition.event,
                    transition.condition,
                    itemId
                  );
                },
                onUpsertItem(item) {
                  editable.onUpsertTransitionItem(
                    sourceStateId,
                    transition.target,
                    transition.event,
                    transition.condition,
                    item
                  );
                },
              }
            : undefined
        }
      />
    </figure>
  );
};
