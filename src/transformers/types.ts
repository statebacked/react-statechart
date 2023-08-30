import * as schema from "../schema";

export type FlowItem =
  | {
      flowItemType: "state";
      flowItemId: schema.StateId;
      flowItemName: string;
    }
  | {
      flowItemType: "event";
      flowItemId: schema.EventId;
      flowItemName: string;
    }
  | {
      flowItemType: "condition";
      flowItemId: schema.ConditionId;
      flowItemName: string;
    }
  | {
      flowItemType: "action";
      flowItemId: schema.ActionId;
      flowItemName: string;
    }
  | {
      flowItemType: "assertion";
      flowItemId: schema.AssertionId;
      flowItemName: string;
    };

export type RequirementAndFlowItems = {
  requirement: schema.Requirement & { flowName?: string };
  flowItems: Array<FlowItem>;
};
