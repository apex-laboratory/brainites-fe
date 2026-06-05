import type { SourceId } from "@/types/common";

/** A source citation: the provider and where it was found. */
export type AnswerSource = [source: SourceId, where: string];

export type BrainAnswer = {
  /** Regex used to match a user question to this answer. */
  match: RegExp;
  text: string;
  sources: AnswerSource[];
  /** Confidence 0–100. */
  conf: number;
};

export type ChatRole = "you" | "brain";

export type ChatMessage = {
  role: ChatRole;
  text: string;
  sources?: AnswerSource[];
  conf?: number | null;
};
