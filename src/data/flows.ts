import { v4 } from "uuid";
import * as schema from "../schema";
import { DrawableFlow } from "../flow-utils";

export const flowItemTypePresentation: Record<
  schema.FlowItemType,
  {
    title: string;
    groupTitle: string;
  }
> = {
  state: { title: "State", groupTitle: "States" },
  event: { title: "Event", groupTitle: "Events" },
  condition: {
    title: "Condition",
    groupTitle: "Conditions",
  },
  action: {
    title: "Action",
    groupTitle: "Actions",
  },
  assertion: {
    title: "Expectation",
    groupTitle: "Expectations",
  },
};

export const freshFlowItemId = () => {
  return v4();
};

export const eventName = (
  flow: DrawableFlow,
  transition: DrawableFlow["transitions"][0]
): string => {
  return (
    (transition.event && flow.metadata.events[transition.event]?.name) ??
    "Immediate transition"
  );
};
