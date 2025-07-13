import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWebRTC from "../hooks/useWebRTC";
import VideoGrid from "../components/VideoGrid";
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import ChatPanel from "../components/ChatPanel";

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const {
    peers,
    userVideo,
    peerStates,
    toggleMute,
    toggleCamera,
    raiseHand,
    localStream,
  } = useWebRTC(roomId, user);

  const [handRaised, setHandRaised] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  // ✅ Emit join-room to server when user enters room
  useEffect(() => {
    if (socket && user && roomId) {
      socket.emit("join-room", {
        roomId,
        user,
        isPrivate: false, // Set this as needed
      });
    }
  }, [socket, user, roomId]);

  // Receive timer info from backend
  useEffect(() => {
    if (!socket) return;

    const handleTimer = ({ expiresAt }) => {
      setExpiresAt(expiresAt);
    };

    socket.on("room-empty-timer", handleTimer);

    return () => socket.off("room-empty-timer", handleTimer);
  }, [socket]);

  // Countdown updater
  useEffect(() => {
    if (!expiresAt) {
      setRemainingTime(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(Math.floor((expiresAt - now) / 1000), 0);
      setRemainingTime(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleRaiseHand = () => {
    const newStatus = !handRaised;
    setHandRaised(newStatus);
    raiseHand(newStatus);
  };

  const handleLeave = () => {
    socket.emit("leave-room", { roomId });
    navigate("/");
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h2 className="text-xl font-bold mb-2 text-center">Room: {roomId}</h2>

      {/* ⏳ Countdown */}
      {remainingTime !== null && (
        <div className="text-center mb-4 text-red-600 font-semibold">
          Room will auto-delete in {remainingTime} sec unless someone rejoins.
        </div>
      )}

      <VideoGrid
        peers={peers}
        userVideo={userVideo}
        peerStates={peerStates}
        currentUser={user}
        localStream={localStream}
      />

      <div className="flex flex-wrap gap-3 justify-center mt-6">
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded text-white ${
            peerStates.localMuted ? "bg-green-600" : "bg-blue-600"
          }`}
        >
          {peerStates.localMuted ? "🎤 Unmute" : "🔇 Mute"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded text-white ${
            peerStates.localCameraOff ? "bg-green-700" : "bg-purple-600"
          }`}
        >
          {peerStates.localCameraOff ? "🎥 Turn Camera On" : "📷 Turn Camera Off"}
        </button>

        <button
          onClick={handleRaiseHand}
          className={`px-4 py-2 rounded ${
            handRaised ? "bg-yellow-500 text-black" : "bg-yellow-300 text-black"
          }`}
        >
          {handRaised ? "🙌 Lower Hand" : "✋ Raise Hand"}
        </button>

        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          🚪 Leave Room
        </button>
      </div>

      <div className="mt-6">
        <ChatPanel roomId={roomId} user={user} />
      </div>
    </div>
  );
}

export default RoomPage;
