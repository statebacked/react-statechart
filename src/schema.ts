import * as z from "zod";

export const flowIdSchema = z.string().brand("FlowId");
export type FlowId = z.infer<typeof flowIdSchema>;

export const requirementIdSchema = z.string().brand("RequirementId");
export type RequirementId = z.infer<typeof requirementIdSchema>;

export const stateIdSchema = z.string().brand<"stateId">();
export type StateId = z.infer<typeof stateIdSchema>;

export const actionIdSchema = z.string().brand<"actionId">();
export type ActionId = z.infer<typeof actionIdSchema>;

export const assertionIdSchema = z.string().brand<"assertionId">();
export type AssertionId = z.infer<typeof assertionIdSchema>;

export const eventIdSchema = z.string().brand<"eventId">();
export type EventId = z.infer<typeof eventIdSchema>;

export const conditionIdSchema = z.string().brand<"conditionId">();
export type ConditionId = z.infer<typeof conditionIdSchema>;

export const collateralSchema = z.object({
  name: z.string(),
  type: z.enum(["FIGMA_FRAME"]),
  value: z.string(),
  figmaFrameId: z.string().optional(),
  figmaFileFingerprint: z.string().optional(),
  figmaFileKey: z.string().optional(),
});
export type Collateral = z.infer<typeof collateralSchema>;

export const basicFlowItemSchema = z.object({
  name: z.string(),
  collateral: z.array(collateralSchema).default([]),
});

const eventSchema = basicFlowItemSchema;
const assertionSchema = basicFlowItemSchema;
const actionSchema = basicFlowItemSchema;
const conditionSchema = basicFlowItemSchema;

const transitionSchema = z.object({
  // an event-less transition is an "always" transition, taken immediately upon entering the state as long as its guard is satisfied.
  event: eventIdSchema.optional(),
  target: stateIdSchema.optional(),
  condition: conditionIdSchema.optional(),
  assertions: z.array(assertionIdSchema).default([]),
  actions: z.array(actionIdSchema).default([]),
});

const stateSchema = basicFlowItemSchema.extend({
  type: z
    .enum(["atomic", "compound", "final"]) // no "parallel" or "history"
    .default("atomic"),
  initialState: stateIdSchema.optional(),
  parent: stateIdSchema.optional(),
  entryActions: z.array(actionIdSchema).default([]),
  exitActions: z.array(actionIdSchema).default([]),
  assertions: z.array(assertionIdSchema).default([]),
  transitions: z.array(transitionSchema).default([]),
});

export const flowSchema = z
  .object({
    id: flowIdSchema,
    name: z.string().transform((name) => {
      if (name.length > 200) {
        console.warn("flow name too long", { name });
        return name.slice(0, 197) + "...";
      }

      return name;
    }),
    states: z.record(stateIdSchema, stateSchema),
    metadata: z.object({
      events: z.record(eventIdSchema, eventSchema),
      assertions: z.record(assertionIdSchema, assertionSchema),
      actions: z.record(actionIdSchema, actionSchema),
      conditions: z.record(conditionIdSchema, conditionSchema),
    }),
  })
  .merge(
    stateSchema.pick({
      assertions: true,
      initialState: true,
      entryActions: true,
      exitActions: true,
      transitions: true,
    })
  );

export type Flow = z.infer<typeof flowSchema>;

export const flowItemTypeSchema = z.enum([
  "state",
  "event",
  "condition",
  "action",
  "assertion",
]);
export type FlowItemType = z.infer<typeof flowItemTypeSchema>;

export const flowItemRefSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("state"),
    id: stateIdSchema,
  }),
  z.object({
    type: z.literal("event"),
    id: eventIdSchema,
  }),
  z.object({
    type: z.literal("condition"),
    id: conditionIdSchema,
  }),
  z.object({
    type: z.literal("action"),
    id: actionIdSchema,
  }),
  z.object({
    type: z.literal("assertion"),
    id: assertionIdSchema,
  }),
]);
export type FlowItemRef = z.infer<typeof flowItemRefSchema>;

function testFlowItemRefCoversFlowItemType() {
  function receiveFlowItemType(fit: FlowItemType) {
    receiveFlowItemRefType(fit);
  }
  function receiveFlowItemRefType(firt: FlowItemRef["type"]) {
    receiveFlowItemType(firt);
  }
}

export const requirementSchema = z.object({
  id: requirementIdSchema,
  flowId: flowIdSchema,
  text: z.string(),
});

export type Requirement = z.infer<typeof requirementSchema>;
