interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  edited?: boolean;
}

class WebSocketService {
  socket: WebSocket | null = null;
  messageHandlers: ((message: { type: string; message: Message }) => void)[] = [];
  participantHandlers: ((participants: string[]) => void)[] = [];
  reconnectTimeout: number = 3000;
  isReconnecting: boolean = false;

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already connected.");
      return;
    }

    this.socket = new WebSocket("ws://172.16.19.37:5000");

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.isReconnecting = false;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        switch (data.type) {
          case "message":
          case "edit":
          case "delete":
            this.messageHandlers.forEach((handler) => handler(data));
            break;
          case "participant-update":
            this.participantHandlers.forEach((handler) => handler(data.participants));
            break;
          default:
            console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.socket.onclose = () => {
      console.warn("WebSocket disconnected. Attempting to reconnect...");
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  reconnect() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    setTimeout(() => {
      console.log("Reconnecting WebSocket...");
      this.connect();
    }, this.reconnectTimeout);
  }

  onMessage(handler: (message: { type: string; message: Message }) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageListener(handler: (message: { type: string; message: Message }) => void) {
    const index = this.messageHandlers.indexOf(handler);
    if (index !== -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  onParticipantUpdate(handler: (participants: string[]) => void) {
    this.participantHandlers.push(handler);
  }

  sendMessage(message: Message) {
    console.log("Sent message:", message);
    this.sendData({ type: "message", message });
  }

  editMessage(id: string, newText: string) {
    console.log("Edit message:", id, newText);
    this.sendData({ type: "edit", id, newText });
  }

  deleteMessage(id: string) {
    console.log("Delete message:", id);
    this.sendData({ type: "delete", id });
  }

  setName(name: string) {
    console.log("set user name:", name);
    this.sendData({ type: "userJoined", name });
  }

  private sendData(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected. Message not sent:", data);
    }
  }
}

export const Socket = new WebSocketService();
