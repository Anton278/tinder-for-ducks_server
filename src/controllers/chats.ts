import ChatDTO from "../dtos/chat";
import chatsService from "../services/chats";

class ChatsController {
  async create(ws: WebSocket, users: string[]) {
    try {
      if (!Array.isArray(users)) {
        return ws.send("key users is not array");
      }
      if (users.length !== 2) {
        return ws.send("users length is not equal 2");
      }
      const createdChat = await chatsService.create(users);
      const createdChatDTO = new ChatDTO(createdChat);
      ws.send(JSON.stringify(createdChatDTO));
    } catch (err: any) {
      ws.send(JSON.stringify({ message: err.message }));
    }
  }
}

const chatsController = new ChatsController();

export default chatsController;
