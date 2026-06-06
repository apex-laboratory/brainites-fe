export { ChatMessage } from "./components";
export { BrainChatPage } from "./pages/BrainChatPage";
export { useBrainChat, type BrainChatState } from "./hooks/useBrainChat";
export {
  BrainChatProvider,
  useBrainChatContext,
} from "./context/BrainChatContext";
export { answerFor, type BrainReply } from "./data/answer-for";
export {
  BRAIN_ANSWERS,
  DEFAULT_ANSWER,
  CHAT_SUGGESTIONS,
} from "./data/brain-answers";
export type {
  BrainAnswer,
  AnswerSource,
  ChatRole,
  ChatMessage as ChatMessageData,
} from "./types";
