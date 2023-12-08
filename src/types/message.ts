import type { Message as ChatMessage } from "../models/chat";

type SubscribeMessage = {
  event: "subscribe";
  uid: string;
  chatIds: string[];
};

type HeartbeatMessage = {
  event: "heartbeat";
  message: "ping";
};

type AckMessage = {
  event: "ack";
};

type GetMessagesMessage = {
  event: "get-messages";
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
  | GetMessagesMessage
  | SendMessageMessage
  | AuthMessage;
