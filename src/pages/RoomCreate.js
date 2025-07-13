// pages/RoomCreate.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Create Room</h2>
      <label>Capacity (2-6):</label>
      <input
        type="number"
        value={capacity}
        min="2"
        max="6"
        onChange={(e) => setCapacity(Number(e.target.value))}
        className="border p-1 w-full"
      />
      <label className="block mt-2">
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
          className="border p-1 w-full mt-2"
        />
      )}
      <button
        onClick={createRoom}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create
      </button>

      {showMsg && (
        <div className="mt-4 p-2 bg-green-100 border border-green-400 rounded">
          ✅ Room Created! Share or copy this Room ID:
          <pre className="text-lg font-bold">{roomId}</pre>
          <p className="text-sm text-gray-700">
            Auto joining in 10 seconds...
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}

export default RoomCreate;
