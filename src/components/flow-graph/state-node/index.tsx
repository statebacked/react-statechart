import * as schema from "../../../schema";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  getStatePositionId,
  PositionedItemId,
  PositionInfo,
  Size,
} from "../../../transformers/elk";
import {
  DrawableFlow,
  FlowItemIdentifier,
  relevantToFlowItems,
} from "../../../flow-utils";
import styles from "./state-node.module.css";
import { FlowItemIcon } from "../../flow-items";
import { TransitionInfo, TransitionsView } from "../transitions-view";
import { FlowItemList } from "../flow-item-list";
import { Position, usePosition } from "../../../hooks/use-position";
import { EditableOnClick } from "../../editable-on-click";
import { Select } from "../../select";
import { flowItemTypePresentation } from "../../../data/flows";
import { IconButton } from "../../icon-button";
import { RiDeleteBinLine } from "react-icons/ri";
import { Editable } from "../types";

const extraContentPadding = 25;

type Action =
  | { type: "set-pos"; position: Position }
  | { type: "set-padding"; position: Position };
type State = {
  padding?: Position;
  position?: Position;
};

const newStateId = "__new__" as schema.StateId;

export const StateNode = ({
  flow,
  stateId,
  state,
  positions,
  selectedItems,
  isTopLevel,
  onReportSize,
  transitionsByPosId,
  editable,
}: {
  flow: DrawableFlow;
  stateId: schema.StateId;
  state: NonNullable<schema.Flow["states"][any]>;
  positions: Map<PositionedItemId, PositionInfo>;
  selectedItems: Array<FlowItemIdentifier>;
  isTopLevel?: boolean;
  onReportSize?: (positionId: PositionedItemId, size: Size) => void;
  transitionsByPosId: Map<PositionedItemId, TransitionInfo>;
  editable?: Editable;
}) => {
  const [posState, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case "set-padding":
          return {
            ...state,
            padding: action.position,
          };
        case "set-pos":
          return {
            ...state,
            position: action.position,
          };
      }
    },
    {}
  );
  const reportPosition = useCallback((position: Position) => {
    dispatch({ type: "set-pos", position });
  }, []);
  const reportPadding = useCallback((position: Position) => {
    dispatch({ type: "set-padding", position });
  }, []);
  const ref = usePosition(reportPosition);
  const paddingRef = usePosition<HTMLDivElement>(reportPadding);
  const statePosId = getStatePositionId(stateId);

  const pos = positions.get(statePosId);

  useEffect(() => {
    if (!onReportSize || !posState.padding || !posState.position) {
      return;
    }

    const topPadding = posState.padding.height;
    onReportSize(statePosId, {
      width: posState.position.width,
      height: posState.position.height,
      padding: {
        top: Math.max(topPadding + extraContentPadding, extraContentPadding),
        bottom: extraContentPadding,
        left: extraContentPadding,
        right: extraContentPadding,
      },
    });
  }, [statePosId, flow.id, posState]);

  const isSelected = relevantToFlowItems(flow, selectedItems, {
    flowItemType: "state",
    flowItemId: stateId,
  });

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

  return (
    <figure
      ref={ref}
      className={`${styles.stateNode} ${isSelected ? styles.selected : ""} ${
        pos ? "" : styles.sizing
      } ${isTopLevel ? styles.topLevel : ""}`}
      style={
        pos
          ? { left: pos.x, top: pos.y, width: pos.width, height: pos.height }
          : {}
      }
    >
      {editable && !isTopLevel ? (
        <IconButton
          className={styles.deleteButton}
          icon={<RiDeleteBinLine size={16} />}
          title="Delete"
          onClick={() => editable.onRemoveState(stateId)}
        />
      ) : null}
      <div className={styles.stateNodeContent}>
        <div
          ref={paddingRef}
          className={`${styles.stateContent} ${
            childStates.length > 0 ? styles.hasChildren : ""
          }`}
        >
          <header>
            {isTopLevel ? null : (
              <FlowItemIcon flowItemType="state" transparent />
            )}
            <h2 className={`${styles.name}`}>
              {editable && !isTopLevel ? (
                state.name ? (
                  <EditableOnClick
                    className={styles.editable}
                    text={state.name}
                    onChange={(name) => {
                      editable.onUpdateState(stateId, { ...state, name });
                    }}
                  />
                ) : (
                  <Select
                    items={editable.getAvailableStates().concat([
                      { id: newStateId, name: "Create a new state" },
                      {
                        id: undefined as any as schema.StateId,
                        name: `Select a ${flowItemTypePresentation.state.title}`,
                      },
                    ])}
                    onChange={(id) => {
                      if (id === newStateId) {
                        editable.onUpdateState(stateId, {
                          ...state,
                          name: "New State",
                        });
                        return;
                      }

                      editable.onUpdateTransitionTarget(
                        stateId,
                        id as schema.StateId
                      );
                    }}
                  >
                    {(item) => <div>{item.name}</div>}
                  </Select>
                )
              ) : (
                state.name
              )}
            </h2>
          </header>
          <FlowItemList
            items={flowItems}
            flow={flow}
            nonEmptyClassName={
              childStates.length > 0
                ? styles.nonEmptyFlowListItemsWithChildren
                : styles.nonEmptyFlowListItems
            }
            editable={
              editable && {
                eligibleTypes: ["action", "assertion", "event"],
                onUpsertItem(item) {
                  if (item.flowItemType === "event") {
                    editable.onAddTransition(stateId);
                    return;
                  }

                  editable.onUpsertStateItem(stateId, item);
                },
                onDeleteItem(itemId) {
                  editable.onDeleteStateItem(stateId, itemId);
                },
              }
            }
          />
        </div>
        {childStates.length > 0 ? (
          <div
            className={`${styles.childStatesContainer} ${
              state.type === "parallel" ? styles.parallel : ""
            }`}
          >
            {childStates.map(([childId, childState]) => (
              <StateNode
                key={childId}
                flow={flow}
                onReportSize={onReportSize}
                positions={positions}
                selectedItems={selectedItems}
                state={childState!}
                stateId={childId as schema.StateId}
                transitionsByPosId={transitionsByPosId}
                editable={editable}
              />
            ))}
            <TransitionsView
              containerStateId={stateId}
              flow={flow}
              positions={positions}
              selectedItems={selectedItems}
              transitionsByPosId={transitionsByPosId}
              initialState={state.initialState}
              onReportSize={onReportSize}
              editable={editable}
            />
          </div>
        ) : null}
      </div>
    </figure>
  );
};
