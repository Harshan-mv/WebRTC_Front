import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

function Lobby() {
  const socket = useSocket();
  const [publicRooms, setPublicRooms] = useState([]);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  // Countdown timer updater
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch room list from server
  useEffect(() => {
    if (!socket) return;

    socket.on("public-rooms", (rooms) => {
      const visibleRooms = rooms.filter((room) => !room.isPrivate); // 🔒 filter private
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🔓 Public Rooms Lobby</h2>

      {publicRooms.length === 0 ? (
        <p className="text-gray-600">No public rooms available.</p>
      ) : (
        <ul className="space-y-4">
          {publicRooms.map((room) => (
            <li
              key={room.roomId}
              className="border p-4 rounded shadow-sm bg-white"
            >
              <p><strong>Room ID:</strong> {room.roomId}</p>
              <p><strong>Host:</strong> {room.host}</p>
              <p><strong>Users:</strong> {room.users}</p>
              {room.expiresAt && (
                <p className="text-red-500">
                  ⏳ Deleting in: {formatTimeLeft(room.expiresAt)}
                </p>
              )}
              <button
                onClick={() => handleJoin(room.roomId)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
