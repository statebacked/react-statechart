import { models } from "../schema";

export type FlowItem =
  | {
      flowItemType: "state";
      flowItemId: models.StateId;
      flowItemName: string;
    }
  | {
      flowItemType: "event";
      flowItemId: models.EventId;
      flowItemName: string;
    }
  | {
      flowItemType: "condition";
      flowItemId: models.ConditionId;
      flowItemName: string;
    }
  | {
      flowItemType: "action";
      flowItemId: models.ActionId;
      flowItemName: string;
    }
  | {
      flowItemType: "assertion";
      flowItemId: models.AssertionId;
      flowItemName: string;
    };

export type RequirementAndFlowItems = {
  requirement: models.Requirement & { flowName?: string };
  flowItems: Array<FlowItem>;
};
