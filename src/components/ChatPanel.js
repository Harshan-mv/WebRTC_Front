import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";

function ChatPanel({ roomId, user }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    if (!socket) return;

    // Receive incoming messages
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

      // Only emit to backend — let backend echo it back for proper "self" labeling
      socket.emit("chat-message", { roomId, ...msg });
      setText("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { roomId, user });
  };

  return (
    <div className="w-full md:w-1/3 h-64 overflow-y-auto border-t mt-4 bg-white rounded">
      <div className="p-2 font-bold bg-gray-100">Chat</div>

      <div className="p-2 h-44 overflow-y-scroll">
        {messages.map((m, idx) => (
          <div key={idx} className="mb-2">
            <div className="text-sm font-semibold">
              {m.self ? "You" : m.user}{" "}
              <span className="text-gray-400 text-xs">{m.time}</span>
            </div>
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {typingUser && (
        <div className="text-xs px-3 text-gray-500">
          💬 {typingUser} is typing...
        </div>
      )}

      <div className="flex border-t">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-grow p-2"
        />
        <button onClick={sendMessage} className="px-4 bg-blue-500 text-white">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
