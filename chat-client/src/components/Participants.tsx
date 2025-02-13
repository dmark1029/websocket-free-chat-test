import React from "react";

interface ParticipantsProps {
  participants: string[];
}

const Participants: React.FC<ParticipantsProps> = ({ participants }) => {
  return (
    <div style={styles.participantsContainer}>
      <h3>Active Participants:</h3>
      <ul style={styles.participantsList}>
        {participants.map((participant, index) => (
          <li key={index} style={styles.participantItem}>
            {participant}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  participantsContainer: {
    padding: "10px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  },
  participantsList: {
    padding: "0",
    listStyleType: "none",
    textAlign: "left" as "left"
  },
  participantItem: {
    padding: "20px 20px",
    borderBottom: "1px solid #ddd",
  },
};

export default Participants;
