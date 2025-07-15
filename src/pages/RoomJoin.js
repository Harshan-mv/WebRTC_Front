// pages/RoomJoin.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/RoomJoin.scss"; // ✅ SCSS import

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
          pin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Join failed");
    }
  };

  return (
    <div className="room-join-page">
      <h2 className="heading">Join Room</h2>

      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="input"
      />

      <input
        type="text"
        placeholder="PIN (if any)"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="input"
      />

      <button onClick={joinRoom} className="join-button">
        Join
      </button>

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default RoomJoin;
