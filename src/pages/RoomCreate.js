// pages/RoomCreate.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RoomCreate.scss"; // ✅ Import SCSS

function RoomCreate() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [capacity, setCapacity] = useState(4);
  const [pin, setPin] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [showMsg, setShowMsg] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/room/create`,
        {
          isPrivate,
          pin: isPrivate ? pin : undefined,
          capacity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newRoomId = res.data.roomId;
      setRoomId(newRoomId);
      setShowMsg(true);

      setTimeout(() => {
        navigate(`/room/${newRoomId}`);
      }, 10000);
    } catch (err) {
      setError(err.response?.data?.message || "Room creation failed");
    }
  };

  return (
    <div className="room-create-page">
      <h2 className="heading">Create Room</h2>

      <label>Capacity (2–6):</label>
      <input
        type="number"
        value={capacity}
        min="2"
        max="6"
        onChange={(e) => setCapacity(Number(e.target.value))}
        className="input"
      />

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />{" "}
        Private Room
      </label>

      {isPrivate && (
        <input
          type="text"
          value={pin}
          placeholder="Enter PIN"
          onChange={(e) => setPin(e.target.value)}
          className="input"
        />
      )}

      <button onClick={createRoom} className="create-button">
        Create
      </button>

      {showMsg && (
        <div className="room-created-box">
          ✅ Room Created! Share or copy this Room ID:
          <pre className="room-id">{roomId}</pre>
          <p className="join-info">Auto joining in 10 seconds...</p>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default RoomCreate;
