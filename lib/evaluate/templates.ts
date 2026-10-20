import { EVENT_TYPES, type EventType } from "@/types";

export const EVENT_OPTIONS: { type: EventType; label: string; hint: string }[] = [
  { type: "REGULATORY", label: "Regulatory", hint: "Investigations or enforcement actions" },
  { type: "LEGAL", label: "Legal", hint: "Major litigation or court rulings" },
  { type: "TRADING_HALT", label: "Trading halt", hint: "Exchange or regulator suspensions" },
  { type: "CORPORATE_ACTION", label: "Corporate action", hint: "Splits, dividends, mergers, buybacks" },
  { type: "ISSUER_EVENT", label: "Issuer event", hint: "Leadership, operational or security incidents" },
  { type: "SOLVENCY", label: "Solvency", hint: "Going-concern doubt, distress, bankruptcy" },
  { type: "REDEMPTION", label: "Redemption", hint: "Changes to token backing or redemption" },
  { type: "MATERIAL_ANNOUNCEMENT", label: "Material announcement", hint: "Other significant public disclosures" },
];

const WINDOW = "within the last 90 days";
const QUESTIONS: Record<EventType, (c: string) => string> = {
  REGULATORY: (c) => `Has ${c} or a regulatory authority publicly announced a material regulatory investigation or enforcement action involving ${c} ${WINDOW}?`,
  LEGAL: (c) => `Has ${c} become subject to material new litigation or a major court ruling ${WINDOW}?`,
  TRADING_HALT: (c) => `Has trading in ${c} shares been halted or suspended by an exchange or regulator ${WINDOW}?`,
  CORPORATE_ACTION: (c) => `Has ${c} announced a material corporate action (stock split, dividend change, merger, acquisition, spin-off or buyback) ${WINDOW}?`,
  ISSUER_EVENT: (c) => `Has ${c} disclosed a material operational or leadership event (executive departure, major outage, recall or cyber incident) ${WINDOW}?`,
  SOLVENCY: (c) => `Has ${c} disclosed going-concern doubt, missed debt payments, distressed credit downgrades or a bankruptcy filing ${WINDOW}?`,
  REDEMPTION: (c) => `Has the issuer of tokenized ${c} shares announced any change, suspension or restriction of token redemption or backing ${WINDOW}?`,
  MATERIAL_ANNOUNCEMENT: (c) => `Has ${c} made any other material public announcement ${WINDOW} that could significantly affect its securities?`,
};
/** Questions are generated on the server from a fixed template, never taken from the client. */
export const buildQuestion = (company: string, type: EventType) => QUESTIONS[type](company);
export const isEventType = (v: unknown): v is EventType => typeof v === "string" && (EVENT_TYPES as readonly string[]).includes(v);
