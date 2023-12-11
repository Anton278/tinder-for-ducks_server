import type { Message as ChatMessage } from "../models/chat";

type SubscribeMessage = {
  event: "subscribe";
  chatIds: string[];
};

type HeartbeatMessage = {
  event: "heartbeat";
  message: "ping";
};

type AckMessage = {
  event: "ack";
};

type GetChatMessage = {
  event: "get-chat";
  chatId: string;
  messagesPerPage?: number;
  page?: number;
};

type SendMessageMessage = {
  event: "send-message";
  message: ChatMessage;
  chatId: string;
};

type AuthMessage = {
  event: "auth";
  token: string;
};

export type Message =
  | SubscribeMessage
  | HeartbeatMessage
  | AckMessage
  | GetChatMessage
  | SendMessageMessage
  | AuthMessage;
