import * as schema from "../../schema";
import { FlowItem } from "../../transformers/types";
import { DrawableFlow, FlowItemIdentifier } from "../../flow-utils";

export type Editable = {
  getAvailableStates: () => Array<{ id: schema.StateId; name: string }>;
  onUpdateState: (
    stateId: schema.StateId,
    state: DrawableFlow["states"][schema.StateId]
  ) => void;
  onUpsertStateItem: (stateId: schema.StateId, item: FlowItem) => void;
  onRemoveState: (stateId: schema.StateId) => void;
  onDeleteStateItem: (
    stateId: schema.StateId,
    itemId: FlowItemIdentifier
  ) => void;
  onUpdateTransitionTarget: (
    previousTargetId: schema.StateId,
    newTargetId: schema.StateId
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
