import { BRAIN_ANSWERS, DEFAULT_ANSWER } from "./brain-answers";
import type { AnswerSource } from "../types";

export type BrainReply = {
  text: string;
  sources: AnswerSource[];
  conf: number;
};

/**
 * Local regex matching for a question (prototype `answerFor`). Falls back to
 * the low-confidence default when nothing matches. Covers refund, discount,
 * incident, and shipment questions.
 */
export function answerFor(question: string): BrainReply {
  const match = BRAIN_ANSWERS.find((answer) => answer.match.test(question));
  if (!match) return DEFAULT_ANSWER;
  return { text: match.text, sources: match.sources, conf: match.conf };
}
