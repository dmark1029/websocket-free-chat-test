import React, { useState } from "react";

interface MessageProps {
  message: {
    id: string;
    user: string;
    text: string;
    timestamp: number;
    edited?: boolean;
  };
  system?: boolean;
  userName: string;
  editMessage: (id: string, newText: string) => void;
  deleteMessage: (id: string) => void;
}

const fetchOpenGraphData = async (url: string) => {
  try {
    const response = await fetch(`https://api.opengraph.xyz/?url=${url}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Open Graph data:', error);
    return null;
  }
};

const Message: React.FC<MessageProps> = ({
  message,
  userName,
  editMessage,
  deleteMessage,
  system,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [newMessageText, setNewMessageText] = useState(message.text);

  const urlRegex = /(?:https?:\/\/|www\.)[^\s]+/g;
  const [previewData, setPreviewData] = useState<any>(null);

  const handleLinkHover = async (url: string) => {
    const data = await fetchOpenGraphData(url);
    setPreviewData(data);
  };

  const handleLinkLeave = () => {
    setPreviewData(null);
  };


  const formatMessageText = (text: string) => {
    return text.replace(urlRegex, (url) => {
      const fullUrl = url.startsWith("http") ? url : `http://${url}`;
      return `<a href="${fullUrl}" target="_blank" class="url-link" data-url="${fullUrl}">${url}</a>`;
    });
  };

  const handleEdit = () => {
    editMessage(message.id, newMessageText);
    setEditMode(false);
  };

  const handleDelete = () => {
    deleteMessage(message.id);
  };

  return (
    <div style={styles.messageContainer}>
      <div style={styles.header}>
        <span style={styles.messenger}>{message.user}</span>{" "}
        <span style={styles.sentTime}>{new Date(message.timestamp).toLocaleString()}</span>
        {message.edited && <span style={styles.editedLabel}>&nbsp;(Edited)</span>}
      </div>
      <div style={styles.messageText}>
        {editMode ? (
          <div>
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              style={styles.editInput}
            />
            <button onClick={handleEdit} style={styles.saveButton}>
              Save
            </button>
          </div>
        ) : (
          <div style={styles.messageText}>
            <p
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{
                __html: formatMessageText(message.text),
              }}
            />
            {previewData && (
              <div className="preview">
                <h3>{previewData.title}</h3>
                <img src={previewData.image} alt="preview" />
                <p>{previewData.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {userName === message.user && (
        <div style={styles.actions}>
          {!editMode && (
            <button onClick={() => setEditMode(true)} style={styles.editButton}>
              Edit
            </button>
          )}
          <button onClick={handleDelete} style={styles.deleteButton}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  messageContainer: {
    marginBottom: "15px",
    padding: "10px",
    background: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  header: {
    fontSize: "14px",
    color: "#333",
    marginBottom: "5px",
    textAlign: "left" as "left",
  },
  editedLabel: {
    fontStyle: "italic",
    color: "#888",
  },
  messageText: {
    fontSize: "16px",
    marginBottom: "10px",
    textAlign: "left" as "left",
  },
  messenger: {
    fontSize: "18px",
    fontWeight: "bolder",
  },
  sentTime: {
    opacity: 0.7,
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  editButton: {
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
  },
  editInput: {
    padding: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginRight: "10px",
  },
};

export default Message;
