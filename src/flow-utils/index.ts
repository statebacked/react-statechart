import * as schema from "../schema";
import * as z from "zod";

export const flowItemSchema = z.discriminatedUnion("flowItemType", [
  z.object({
    flowItemType: z.literal("state"),
    flowItemId: schema.stateIdSchema,
    flowItemName: z.string(),
  }),
  z.object({
    flowItemType: z.literal("event"),
    flowItemId: schema.eventIdSchema,
    flowItemName: z.string(),
  }),
  z.object({
    flowItemType: z.literal("condition"),
    flowItemId: schema.conditionIdSchema,
    flowItemName: z.string(),
  }),
  z.object({
    flowItemType: z.literal("action"),
    flowItemId: schema.actionIdSchema,
    flowItemName: z.string(),
  }),
  z.object({
    flowItemType: z.literal("entry-action"),
    flowItemId: schema.actionIdSchema,
    flowItemName: z.string(),
  }),
  z.object({
    flowItemType: z.literal("exit-action"),
    flowItemId: schema.actionIdSchema,
    flowItemName: z.string(),
  }),
  z.object({
    flowItemType: z.literal("assertion"),
    flowItemId: schema.assertionIdSchema,
    flowItemName: z.string(),
  }),
]);

export type FlowItem = z.infer<typeof flowItemSchema>;

type PickFlowItemIdentifier<T> = T extends {
  flowItemId: any;
  flowItemType: any;
}
  ? Pick<T, "flowItemId" | "flowItemType">
  : never;
export type FlowItemIdentifier = PickFlowItemIdentifier<FlowItem>;

export const drawableFlowSchema = schema.flowSchema
  .pick({
    id: true,
    assertions: true,
    entryActions: true,
    exitActions: true,
    initialState: true,
    metadata: true,
    states: true,
    transitions: true,
  })
  .extend({
    name: schema.flowSchema.shape.name.optional(),
  });

export type DrawableFlow = z.infer<typeof drawableFlowSchema>;

export const transitionCount = (flow: DrawableFlow): number =>
  flow.transitions.length +
  Object.values(flow.states).reduce(
    (count, state) => count + state!.transitions.length,
    0
  );

export const relevantToFlowItems = (
  flow: DrawableFlow,
  flowItems: Array<FlowItemIdentifier>,
  id: FlowItemIdentifier
): boolean => {
  const directlyReferenced = containsFlowItem(flowItems, id);
  if (directlyReferenced) {
    return true;
  }

  if (id.flowItemType === "state") {
    const state = flow.states[id.flowItemId];
    if (!state) {
      return directlyReferenced;
    }

    const stateFlowItemIds: Array<FlowItemIdentifier> = (
      [id] as Array<FlowItemIdentifier>
    )
      .concat(
        state.assertions.map(
          (flowItemId): FlowItemIdentifier => ({
            flowItemType: "assertion",
            flowItemId,
          })
        )
      )
      .concat(
        state.entryActions
          .concat(state.exitActions)
          .map((flowItemId) => ({ flowItemType: "action", flowItemId }))
      )
      .concat(
        state.transitions
          .map((t): FlowItemIdentifier | null =>
            t.event ? { flowItemType: "event", flowItemId: t.event } : null
          )
          .filter(
            (x: FlowItemIdentifier | null): x is FlowItemIdentifier => !!x
          )
      );

    return anyFlowItemIdentifierOverlap(stateFlowItemIds, flowItems);
  }

  return directlyReferenced;
};

const directlyReferencedFlowItem = (
  _flow: DrawableFlow,
  flowItems: Array<FlowItemIdentifier>,
  id: FlowItemIdentifier
): boolean => {
  const directlyReferenced = containsFlowItem(flowItems, id);
  return directlyReferenced;
};

const anyFlowItemIdentifierOverlap = (
  items1: Array<FlowItemIdentifier>,
  items2: Array<FlowItemIdentifier>
) => {
  const toStrId = ({ flowItemId, flowItemType }: FlowItemIdentifier) =>
    `${flowItemType}#${flowItemId}`;
  const s1 = new Set(items1.map(toStrId));
  for (const i of items2) {
    if (s1.has(toStrId(i))) {
      return true;
    }
  }

  return false;
};

export const containsFlowItem = (
  items: Array<FlowItemIdentifier>,
  item: FlowItemIdentifier
): boolean =>
  items.some(
    (i) =>
      i.flowItemId === item.flowItemId && i.flowItemType === item.flowItemType
  );

export const transitionRelevantToFlowItems = (
  flow: DrawableFlow,
  flowItems: Array<FlowItemIdentifier>,
  sourceStateId: schema.StateId,
  transition: schema.Flow["transitions"][any]
) =>
  transition.event
    ? directlyReferencedFlowItem(flow, flowItems, {
        flowItemType: "event",
        flowItemId: transition.event,
      })
    : transition.condition
    ? directlyReferencedFlowItem(flow, flowItems, {
        flowItemType: "condition",
        flowItemId: transition.condition,
      })
    : transition.target
    ? directlyReferencedFlowItem(flow, flowItems, {
        flowItemType: "state",
        flowItemId: sourceStateId,
      }) &&
      directlyReferencedFlowItem(flow, flowItems, {
        flowItemType: "state",
        flowItemId: transition.target,
      })
    : transition.assertions.length
    ? transition.assertions.some((assertion) =>
        directlyReferencedFlowItem(flow, flowItems, {
          flowItemType: "assertion",
          flowItemId: assertion,
        })
      )
    : transition.actions.some((action) =>
        directlyReferencedFlowItem(flow, flowItems, {
          flowItemType: "action",
          flowItemId: action,
        })
      );

export const getMetadata = (
  flow: DrawableFlow,
  flowItem: FlowItemIdentifier
) => {
  switch (flowItem.flowItemType) {
    case "action":
    case "entry-action":
    case "exit-action":
      return flow.metadata.actions[flowItem.flowItemId];
    case "assertion":
      return flow.metadata.assertions[flowItem.flowItemId];
    case "condition":
      return flow.metadata.conditions[flowItem.flowItemId];
    case "event":
      return flow.metadata.events[flowItem.flowItemId];
    case "state":
      return flow.states[flowItem.flowItemId];
  }

  flowItem satisfies never;
};
