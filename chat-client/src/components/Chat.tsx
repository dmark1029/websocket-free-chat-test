import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import Participants from "./Participants";
import { Socket } from "../utils/socket";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";

const socket = io("http://172.16.19.37:5000");

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  edited?: boolean;
  system?: boolean;
}

const ChatApp: React.FC = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [tempUserName, setTempUserName] = useState<string>("");
  const [showModal, setShowModal] = useState(true);

  const messagesRef = useRef<ChatMessage[]>([]);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      const chatBox = chatBoxRef.current;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [messages]);

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setMessageText((prev: string) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    Socket.connect();

    Socket.onParticipantUpdate((newParticipants: string[]) => {
      setParticipants(newParticipants);
    });

    const handleMessage = (message: { type: string; message: ChatMessage }) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];

        switch (message.type) {
          case "message":
            if (!updatedMessages.some((msg) => msg.id === message.message.id)) {
              updatedMessages.push(message.message);
            }
            break;
          case "edit":
            return updatedMessages.map((msg) =>
              msg.id === message.message.id
                ? { ...msg, text: message.message.text, edited: true }
                : msg
            );
          case "delete":
            return updatedMessages.filter((msg) => msg.id !== message.message.id);
          default:
            break;
        }

        messagesRef.current = updatedMessages;
        return updatedMessages;
      });
    };

    Socket.onMessage(handleMessage);

    return () => {
      Socket.removeMessageListener(handleMessage);
      Socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (messageText.trim() && userName) {
      const newMessage: ChatMessage = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: userName,
        text: messageText,
        timestamp: Date.now(),
      };
      Socket.sendMessage(newMessage);
      setMessageText("");
    }
  };

  const handleSetUserName = () => {
    if (tempUserName.trim()) {
      setUserName(tempUserName);
      Socket.setName(tempUserName)
      setShowModal(false);
    }
  };

  return (
    <div style={styles.chatContainer}>
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Enter your name</h3>
            <input
              type="text"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetUserName()}
              style={styles.modalInput}
            />
            <button onClick={handleSetUserName} style={styles.modalButton}>
              OK
            </button>
          </div>
        </div>
      )}

      {!showModal && (
        <>
          <div className="chatBox" style={styles.chatBox} ref={chatBoxRef}>
            {messages
              .slice()
              .reverse()
              .map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  userName={userName}
                  editMessage={(id, newText) => Socket.editMessage(id, newText)}
                  deleteMessage={(id) => Socket.deleteMessage(id)}
                  system={message.system}
                />
              ))}
          </div>
          <div style={styles.inputContainer}>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) {
                    e.preventDefault();
                    setMessageText((prev) => prev + "\n");
                  } else {
                    e.preventDefault();
                    sendMessage();
                  }
                }
              }}
              placeholder="Type a message..."
              style={styles.input}
              autoFocus
            />

            <div
              style={styles.emojiContainer}
              onMouseEnter={() => {
                if (hideTimeout.current) clearTimeout(hideTimeout.current);
                setShowEmojiPicker(true);
              }}
              onMouseLeave={() => {
                hideTimeout.current = setTimeout(() => {
                  setShowEmojiPicker(false);
                }, 100);
              }}
            >
              😀
              {showEmojiPicker && (
                <div style={styles.emojiPicker}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <button onClick={sendMessage} style={styles.sendButton}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  chatContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    background: "#f1f1f1",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  chatBox: {
    marginBottom: "20px",
    padding: "10px",
    background: "#fff",
    borderRadius: "8px",
    minHeight: "300px",
    overflowY: "auto" as "auto",
    boxShadow: "inset 0 0 8px rgba(0, 0, 0, 0.1)",
    flexDirection: "column-reverse" as "column-reverse",
    maxHeight: "600px",
    display: "flex"
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "80%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    marginRight: "10px",
    fontSize: "16px",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  emojiContainer: { position: "relative" as "relative", cursor: "pointer", paddingRight: "10px" },
  emojiPicker: {
    position: "absolute" as "absolute",
    bottom: "30px",
    right: "0",
    zIndex: 10,
    background: "white",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
    borderRadius: "8px",
  },
  modal: {
    position: "fixed" as "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center" as "center",
  },
  modalInput: {
    padding: "10px",
    marginBottom: "10px",
    width: "80%",
  },
  modalButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

export default ChatApp;
