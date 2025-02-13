import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const participants: Set<string> = new Set();
const messages: { id: string; user: string; text: string; timestamp: number; edited?: boolean; system?: boolean }[] = [];

function broadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
	let userName = "User" + Math.floor(Math.random() * 1000);
	ws.send(JSON.stringify({ type: "history", messages }));

	ws.on("message", (messageData: string) => {
		const message = JSON.parse(messageData);
		switch (message.type) {
			case "message":
				const newMessage = {
					id: Math.random().toString(36).substr(2, 9),
					user: userName,
					text: message.message.text,
					timestamp: Date.now(),
				};
				messages.push(newMessage);
				broadcast({ type: "message", message: newMessage });
				break;
			case "edit":
				const messageToEdit = messages.find((msg) => msg.id === message.id);
				if (messageToEdit && messageToEdit.user === userName) {
					messageToEdit.text = message.newText;
					messageToEdit.edited = true;
					broadcast({ type: "edit", message: messageToEdit });
				}
				break;
			case "delete":
				const messageToDeleteIndex = messages.findIndex((msg) => msg.id === message.id);
				if (messageToDeleteIndex !== -1 && messages[messageToDeleteIndex].user === userName) {
					const deletedMessage = messages.splice(messageToDeleteIndex, 1);
					broadcast({ type: "delete", message: deletedMessage[0] });
				}
				break;
			case "userJoined":
				setTimeout(() => {
					const botMessage = {
						id: Math.random().toString(36).substr(2, 9),
						user: "Meeting Bot",
						text: `${message.name} joined the chat`,
						timestamp: Date.now(),
						system: true,
					};

					messages.push(botMessage);
					participants.add(message.name);
					userName = message.name;
					broadcast({ type: "message", message: botMessage });
					broadcast({ type: "participant-update", participants: Array.from(participants) });
				}, 100);
				break;
		}
	});
	ws.on("close", () => {
		if (!participants.has(userName)) {
			return
		}
		participants.delete(userName);
		broadcast({ type: "participant-update", participants: Array.from(participants) });
		const botLeaveMessage = {
			id: Math.random().toString(36).substr(2, 9),
			user: "Meeting Bot",
			text: `${userName} left the chat`,
			timestamp: Date.now(),
			system: true,
		};
		messages.push(botLeaveMessage);
		broadcast({ type: "message", message: botLeaveMessage });
	});
});

app.get("/", (req: any, res: { send: (arg0: string) => void; }) => {
  res.send("Chat server running...");
});

server.listen(5000, () => {
  console.log("Server is running on ws://localhost:5000");
});
