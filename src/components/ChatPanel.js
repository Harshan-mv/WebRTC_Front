import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import "../styles/ChatPanel.scss"; // ✅ SCSS import

function ChatPanel({ roomId, user }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = (name) => {
      setTypingUser(name);
      setTimeout(() => setTypingUser(""), 3000);
    };

    socket.on("chat-message", handleMessage);
    socket.on("user-typing", handleTyping);

    return () => {
      socket.off("chat-message", handleMessage);
      socket.off("user-typing", handleTyping);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (text.trim()) {
      const msg = {
        user: user.name,
        profile: user.picture,
        time: new Date().toLocaleTimeString(),
        text,
      };
      socket.emit("chat-message", { roomId, ...msg });
      setText("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { roomId, user });
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">Chat</div>

      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className="chat-message">
            <div className="message-meta">
              {m.self ? "You" : m.user}{" "}
              <span className="message-time">{m.time}</span>
            </div>
            <div className="message-text">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {typingUser && (
        <div className="typing-indicator">
          💬 {typingUser} is typing...
        </div>
      )}

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatPanel;
