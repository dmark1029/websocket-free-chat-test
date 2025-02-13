import React, { useState } from "react";
import ChatApp from "./components/Chat";
import Participants from "./components/Participants";
import { Socket } from "./utils/socket";

const App: React.FC = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");

  Socket.onParticipantUpdate((newParticipants: string[]) => {
    setParticipants(newParticipants);
  });

  return (
    <div style={styles.container}>
      <h1>Status Meeting Setup</h1>

      <div style={styles.tabsContainer}>
        <div
          onClick={() => setActiveTab("chat")}
          style={{ ...styles.tab, ...(activeTab === "chat" ? styles.activeTab : {}) }}
        >
          Chat
        </div>
        <div
          onClick={() => setActiveTab("participants")}
          style={{ ...styles.tab, ...(activeTab === "participants" ? styles.activeTab : {}) }}
        >
          Participants({participants.length})
        </div>
      </div>

      <div style={{ ...styles.content, display: activeTab === "chat" ? "block" : "none" }}>
        <ChatApp />
      </div>
      <div style={{ ...styles.content, display: activeTab === "participants" ? "block" : "none" }}>
        <Participants participants={participants} />
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: "center",
    margin: "50px auto",
    fontFamily: "Arial, sans-serif",
  },
  tabsContainer: {
    display: "flex",
    justifyContent: "center",
    borderBottom: "2px solid #ddd",
    marginBottom: "20px",
  },
  tab: {
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "18px",
    color: "#666",
    transition: "0.3s",
    borderBottom: "3px solid transparent",
  },
  activeTab: {
    fontWeight: "bold",
    color: "#333",
    borderBottom: "3px solid #007bff",
  },
  content: {
    padding: "20px",
    maxWidth: "600px",
    margin: "auto"
  },
};

export default App;
