import { z } from "zod";

export const flowSchema = z.string().brand("FlowId");
export type FlowId = z.infer<typeof flowSchema>;

export const requirementSchema = z.string().brand("RequirementId");
export type RequirementId = z.infer<typeof requirementSchema>;
