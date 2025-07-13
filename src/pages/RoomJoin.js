// pages/RoomJoin.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RoomJoin() {
  const [roomId, setRoomId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const joinRoom = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/room/join`,
        {
          roomId,
          pin
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Join failed");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Join Room</h2>
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="border p-1 w-full"
      />
      <input
        type="text"
        placeholder="PIN (if any)"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="border p-1 w-full mt-2"
      />
      <button
        onClick={joinRoom}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        Join
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}

export default RoomJoin;
