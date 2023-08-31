import ELK, { ELK as iELK } from "elkjs";
import { transitionCount } from "../../flow-utils";
import { DrawableFlow, FlowItemIdentifier } from "../../flow-utils";
import { StateNode } from "./state-node";
import styles from "./flow-graph.module.css";
import {
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
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import * as schema from "../../schema";
import { debounceWithLimit } from "../../debounce-utils";
import { usePanAndZoom } from "./use-pan-and-zoom";
import { TransitionNode } from "./transition-node";
import { TransitionsView } from "./transitions-view";
import { usePosition } from "../../hooks/use-position";
import { FlowItem } from "../../transformers/types";

const getElk = (() => {
  let elk: iELK | undefined;
  return () => {
    if (!elk) {
      elk = new ELK();
    }
    return elk;
  };
})();

const nextLayoutId = (() => {
  let nextId = 0;
  return () => nextId++;
})();

type Layout = Map<PositionedItemId, PositionInfo>;

type State = null | { layout: Layout; layoutId: number; flowId: schema.FlowId };
type Action =
  | {
      type: "received-layout";
      flowId: schema.FlowId;
      layout: EnrichedElkNode;
      layoutId: number;
    }
  | { type: "reset" };

export type FlowGraphProps = {
  flow: DrawableFlow;
  selectedItems?: Array<FlowItemIdentifier>;
  direction?: "horizontal" | "vertical";
  editable?: {
    getAvailableStates: () => Array<{ id: schema.StateId; name: string }>;
    onUpdateTransitionTarget: (
      previousTargetId: schema.StateId,
      newTargetId: schema.StateId
    ) => void;
    onUpdateState: (
      stateId: schema.StateId | null,
      state: DrawableFlow["states"][schema.StateId]
    ) => void;
    onRemoveState: (stateId: schema.StateId) => void;
    onUpsertStateItem: (stateId: schema.StateId | null, item: FlowItem) => void;
    onDeleteStateItem: (
      stateId: schema.StateId | null,
      itemId: FlowItemIdentifier
    ) => void;
    onAddTransition: (sourceState: schema.StateId | undefined) => void;
    onUpdateTransition: (
      sourceState: schema.StateId | undefined,
      targetState: schema.StateId | undefined,
      event: schema.EventId | undefined,
      condition: schema.ConditionId | undefined,
      updated: {
        event?: {
          id: schema.EventId;
          name: string;
        };
        condition?: {
          id: schema.ConditionId;
          name: string;
        };
      }
    ) => void;
    onDeleteTransition: (
      sourceState: schema.StateId | undefined,
      targetState: schema.StateId | undefined,
      event: schema.EventId | undefined,
      condition: schema.ConditionId | undefined
    ) => void;
    onUpsertTransitionItem: (
      sourceState: schema.StateId | undefined,
      targetState: schema.StateId | undefined,
      event: schema.EventId | undefined,
      condition: schema.ConditionId | undefined,
      item: FlowItem
    ) => void;
    onDeleteTransitionItem: (
      sourceState: schema.StateId | undefined,
      targetState: schema.StateId | undefined,
      event: schema.EventId | undefined,
      condition: schema.ConditionId | undefined,
      itemId: FlowItemIdentifier
    ) => void;
  };
  header?: React.ReactNode;
  renderButtons?: (props: {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
  }) => React.ReactNode;
};

const rootId = "root" as schema.StateId;
const rootPosId = getStatePositionId(rootId);
const flowStateId = "flow" as schema.StateId;
const emptySelectedItems: Array<FlowItemIdentifier> = [];

export const FlowGraph = ({
  flow,
  selectedItems: providedSelectedItems,
  editable,
  header,
  direction = "vertical",
  renderButtons,
}: FlowGraphProps) => {
  const selectedItems = providedSelectedItems ?? emptySelectedItems;
  const sizeMap = useRef(new Map<PositionedItemId, Size>());
  const [componentState, dispatch] = useReducer(
    (state: State, action: Action): State => {
      if (action.type === "reset") {
        return null;
      }

      if (
        action.flowId === flow.id &&
        action.layoutId > (state?.layoutId ?? -1)
      ) {
        return {
          flowId: flow.id,
          layout: toLayoutMap(sizeMap.current, action.layout),
          layoutId: action.layoutId,
        };
      }

      return state;
    },
    null
  );

  if (componentState?.flowId && componentState.flowId !== flow.id) {
    sizeMap.current.clear();
  }

  const positions =
    componentState && componentState.flowId === flow.id
      ? componentState.layout
      : (new Map() as Layout);

  const rootPos = positions.get(rootPosId);

  const isSizingRendering = () =>
    sizeMap.current.size <
    Object.keys(flow.states).length +
      transitionCount(flow) +
      (sizeMap.current.get(rootPosId) ? 1 : 0);

  const {
    styles: panAndZoomStyles,
    zoom,
    ref: zoomRef,
    dragStyles,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    onDoubleClick,
    onReset,
    onZoomIn,
    onZoomOut,
  } = usePanAndZoom(rootPos);

  useEffect(() => {
    if (editable) {
      return;
    }

    onReset();
  }, [componentState?.layoutId]);

  const fullFlow = useMemo(
    () => getFullFlow(rootId, flowStateId, flow),
    [flow]
  );

  const onUpdateLayout = useCallback(
    debounceWithLimit(100, 5000, (flowId: schema.FlowId) => {
      if (isSizingRendering()) {
        return;
      }

      const thisLayoutId = nextLayoutId();
      const graph = flowToElkGraph(
        sizeMap.current!,
        rootId,
        fullFlow,
        direction
      );
      const elk = getElk();
      elk.layout(graph).then((layout) => {
        dispatch({
          type: "received-layout",
          layout: layout as EnrichedElkNode,
          layoutId: thisLayoutId,
          flowId,
        });
      });
    }),
    [dispatch, fullFlow, nextLayoutId, isSizingRendering()]
  );

  const onReportSize = useCallback(
    (positionId: PositionedItemId, size: Size) => {
      const adjustedSize = size;
      const prevSize = sizeMap.current.get(positionId);
      sizeMap.current.set(positionId, adjustedSize);

      if (
        !prevSize ||
        prevSize.height !== adjustedSize.height ||
        prevSize.width !== adjustedSize.width ||
        prevSize.padding?.top !== adjustedSize.padding?.top ||
        prevSize.padding?.bottom !== adjustedSize.padding?.bottom ||
        prevSize.padding?.left !== adjustedSize.padding?.left ||
        prevSize.padding?.right !== adjustedSize.padding?.right
      ) {
        onUpdateLayout(flow.id, undefined);
      }
    },
    [flow, zoom]
  );

  useEffect(() => {
    onReset();
    dispatch({ type: "reset" });
  }, [flow.id]);

  const sizingRef = usePosition((pos) => onReportSize(rootPosId, pos));

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

  const effectiveEditable: FlowGraphProps["editable"] = editable
    ? {
        ...editable,
        onUpdateState(stateId, state) {
          editable.onUpdateState(
            stateId === flowStateId ? null : stateId,
            state
          );
        },
        onUpsertStateItem(stateId, item) {
          editable.onUpsertStateItem(
            stateId === flowStateId ? null : stateId,
            item
          );
        },
        onDeleteStateItem(stateId, itemId) {
          editable.onDeleteStateItem(
            stateId === flowStateId ? null : stateId,
            itemId
          );
        },
        onAddTransition: (sourceState: schema.StateId | undefined) => {
          editable.onAddTransition(
            sourceState === flowStateId ? undefined : sourceState
          );
        },
        onUpdateTransition: (
          sourceState: schema.StateId | undefined,
          targetState: schema.StateId | undefined,
          event: schema.EventId | undefined,
          condition: schema.ConditionId | undefined,
          updated: {
            event?: {
              id: schema.EventId;
              name: string;
            };
            condition?: {
              id: schema.ConditionId;
              name: string;
            };
          }
        ) => {
          editable.onUpdateTransition(
            sourceState === flowStateId ? undefined : sourceState,
            targetState === flowStateId ? undefined : targetState,
            event,
            condition,
            updated
          );
        },
        onDeleteTransition: (
          sourceState: schema.StateId | undefined,
          targetState: schema.StateId | undefined,
          event: schema.EventId | undefined,
          condition: schema.ConditionId | undefined
        ) => {
          editable.onDeleteTransition(
            sourceState === flowStateId ? undefined : sourceState,
            targetState === flowStateId ? undefined : targetState,
            event,
            condition
          );
        },
        onUpsertTransitionItem(
          sourceState,
          targetState,
          event,
          condition,
          item
        ) {
          editable.onUpsertTransitionItem(
            sourceState === flowStateId ? undefined : sourceState,
            targetState === flowStateId ? undefined : targetState,
            event,
            condition,
            item
          );
        },
        onDeleteTransitionItem(
          sourceState,
          targetState,
          event,
          condition,
          itemId
        ) {
          editable.onDeleteTransitionItem(
            sourceState === flowStateId ? undefined : sourceState,
            targetState === flowStateId ? undefined : targetState,
            event,
            condition,
            itemId
          );
        },
      }
    : undefined;

  // to avoid weird feedback loops, we render twice, once for sizing and once for viewing

  return (
    <div className={`${styles.flowGraph} ${!!editable ? styles.editable : ""}`}>
      {header ?? null}
      <figure className={styles.sizing} ref={sizingRef}>
        <div>
          {topLevelStates.map(([stateId, state]) => (
            <StateNode
              key={stateId}
              positions={new Map()}
              onReportSize={onReportSize}
              flow={fullFlow}
              stateId={stateId as schema.StateId}
              state={state!}
              selectedItems={selectedItems}
              transitionsByPosId={transitionsByPosId}
              editable={effectiveEditable}
            />
          ))}
          {allTransitions.map(
            ({ transition, sourceState, transitionIdx }, idx) => (
              <TransitionNode
                key={`transition-${idx}`}
                positions={positions}
                sourceStateId={sourceState}
                transitionIdx={transitionIdx}
                flow={flow}
                transition={transition}
                selectedItems={selectedItems}
                onReportSize={onReportSize}
                editable={effectiveEditable}
              />
            )
          )}
        </div>
      </figure>
      <figure
        ref={zoomRef}
        style={dragStyles}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
      >
        <div
          style={
            rootPos
              ? {
                  ...panAndZoomStyles,
                  width: rootPos.width,
                  height: rootPos.height,
                }
              : panAndZoomStyles
          }
        >
          {topLevelStates.map(([stateId, state]) => (
            <StateNode
              key={stateId}
              isTopLevel
              positions={positions}
              flow={fullFlow}
              stateId={stateId as schema.StateId}
              state={state!}
              selectedItems={selectedItems}
              transitionsByPosId={transitionsByPosId}
              editable={effectiveEditable}
            />
          ))}
          <TransitionsView
            containerStateId={rootId}
            flow={fullFlow}
            positions={positions}
            selectedItems={selectedItems}
            transitionsByPosId={transitionsByPosId}
            editable={effectiveEditable}
          />
        </div>
      </figure>
      {renderButtons ? (
        <div className={styles.buttonContainer}>
          {renderButtons({ onZoomIn, onZoomOut, onResetZoom: onReset })}
        </div>
      ) : null}
    </div>
  );
};
