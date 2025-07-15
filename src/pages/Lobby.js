import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import "../styles/Lobby.scss"; // ✅ SCSS import

function Lobby() {
  const socket = useSocket();
  const [publicRooms, setPublicRooms] = useState([]);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("public-rooms", (rooms) => {
      const visibleRooms = rooms.filter((room) => !room.isPrivate);
      setPublicRooms(visibleRooms);
    });

    socket.emit("get-public-rooms");
    return () => socket.off("public-rooms");
  }, [socket]);

  const handleJoin = (roomId) => navigate(`/room/${roomId}`);

  const formatTimeLeft = (expiresAt) => {
    const seconds = Math.max(Math.floor((expiresAt - now) / 1000), 0);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="lobby-page">
      <h2 className="lobby-heading">🔓 Public Rooms Lobby</h2>

      {publicRooms.length === 0 ? (
        <p className="no-rooms">No public rooms available.</p>
      ) : (
        <ul className="room-list">
          {publicRooms.map((room) => (
            <li key={room.roomId} className="room-item">
              <p><strong>Room ID:</strong> {room.roomId}</p>
              <p><strong>Host:</strong> {room.host}</p>
              <p><strong>Users:</strong> {room.users}</p>
              {room.expiresAt && (
                <p className="room-timer">
                  ⏳ Deleting in: {formatTimeLeft(room.expiresAt)}
                </p>
              )}
              <button
                onClick={() => handleJoin(room.roomId)}
                className="join-button"
              >
                🔗 Join Room
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Lobby;
