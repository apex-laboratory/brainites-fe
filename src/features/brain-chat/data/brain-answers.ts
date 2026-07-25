/**
 * Starter prompts shown above the composer before the first question.
 *
 * These are UI copy, not data: picking one fires a real `POST /brain/query` like
 * any typed question. The prototype's canned `BRAIN_ANSWERS` regex table and
 * `answerFor()` were removed when the chat moved onto the brain API.
 */
export const CHAT_SUGGESTIONS: string[] = [
  "What's our refund policy for premium customers?",
  "How do enterprise discounts get approved?",
  "When do incidents escalate to engineering?",
];
