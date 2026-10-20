import { z } from "zod";
import { EVENT_TYPES } from "@/types";
export const resultSchema = z.object({
  eventDetected: z.boolean(),
  eventType: z.enum([...EVENT_TYPES, "NONE"]),
  severity: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  evidenceUrls: z.array(z.string()),
  reasoning: z.string().max(400),
});
export const recordSchema = z.object({
  asset: z.string(), question: z.string(),
  sources: z.array(z.object({ url: z.string(), category: z.enum(["ISSUER_IR", "REGULATOR", "SEC_FILING", "SECONDARY"]) })),
  result: resultSchema,
});
export type EvaluationRecord = z.infer<typeof recordSchema>;
export const parseRecord = (raw: string): EvaluationRecord => recordSchema.parse(JSON.parse(raw));
export const isHttpsUrl = (u: string) => { try { return new URL(u).protocol === "https:"; } catch { return false; } };
