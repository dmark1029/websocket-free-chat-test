"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
	return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const participants = new Set();
const messages = [];
function broadcast(data) {
	wss.clients.forEach((client) => {
		if (client.readyState === client.OPEN) {
			client.send(JSON.stringify(data));
		}
	});
}
wss.on("connection", (ws) => {
	let userName = "User" + Math.floor(Math.random() * 1000);
	ws.send(JSON.stringify({ type: "history", messages }));
	ws.on("message", (messageData) => {
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
					messages[messageToDeleteIndex].text = "";
					messages[messageToDeleteIndex].deleted = true;
					broadcast({ type: "delete", message: messages[messageToDeleteIndex] });
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
			return;
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
app.get("/", (req, res) => {
	res.send("Chat server running...");
});
server.listen(5000, () => {
	console.log("Server is running on ws://localhost:5000");
});
