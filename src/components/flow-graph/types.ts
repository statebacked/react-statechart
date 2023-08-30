import { models } from "../../schema";
import { FlowItem } from "../../transformers/types";
import { DrawableFlow, FlowItemIdentifier } from "../../flow-utils";

export type Editable = {
  getAvailableStates: () => Array<{ id: models.StateId; name: string }>;
  onUpdateState: (
    stateId: models.StateId,
    state: DrawableFlow["states"][models.StateId]
  ) => void;
  onUpsertStateItem: (stateId: models.StateId, item: FlowItem) => void;
  onRemoveState: (stateId: models.StateId) => void;
  onDeleteStateItem: (
    stateId: models.StateId,
    itemId: FlowItemIdentifier
  ) => void;
  onUpdateTransitionTarget: (
    previousTargetId: models.StateId,
    newTargetId: models.StateId
  ) => void;
  onAddTransition: (sourceState: models.StateId | undefined) => void;
  onUpdateTransition: (
    sourceState: models.StateId | undefined,
    targetState: models.StateId | undefined,
    event: models.EventId | undefined,
    condition: models.ConditionId | undefined,
    updated: {
      event?: {
        id: models.EventId;
        name: string;
      };
      condition?: {
        id: models.ConditionId;
        name: string;
      };
    }
  ) => void;
  onDeleteTransition: (
    sourceState: models.StateId | undefined,
    targetState: models.StateId | undefined,
    event: models.EventId | undefined,
    condition: models.ConditionId | undefined
  ) => void;
  onUpsertTransitionItem: (
    sourceState: models.StateId | undefined,
    targetState: models.StateId | undefined,
    event: models.EventId | undefined,
    condition: models.ConditionId | undefined,
    item: FlowItem
  ) => void;
  onDeleteTransitionItem: (
    sourceState: models.StateId | undefined,
    targetState: models.StateId | undefined,
    event: models.EventId | undefined,
    condition: models.ConditionId | undefined,
    itemId: FlowItemIdentifier
  ) => void;
};
