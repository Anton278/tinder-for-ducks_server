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
  uid: string;
  chatId: string;
  messagesPerPage?: number;
  page?: number;
};

type SendMessageMessage = {
  event: "send-message";
  message: string;
  authorId: string;
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
