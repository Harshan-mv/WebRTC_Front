// pages/RoomPage.js
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWebRTC from "../hooks/useWebRTC";
import VideoGrid from "../components/VideoGrid";
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import ChatPanel from "../components/ChatPanel";
import "../styles/RoomPage.scss"; // ✅ Add this import

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

  useEffect(() => {
    if (socket && user && roomId) {
      socket.emit("join-room", {
        roomId,
        user,
        isPrivate: false,
      });
    }
  }, [socket, user, roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleTimer = ({ expiresAt }) => {
      setExpiresAt(expiresAt);
    };

    socket.on("room-empty-timer", handleTimer);
    return () => socket.off("room-empty-timer", handleTimer);
  }, [socket]);

  useEffect(() => {
    if (!expiresAt) return setRemainingTime(null);

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(Math.floor((expiresAt - now) / 1000), 0);
      setRemainingTime(secondsLeft);
      if (secondsLeft <= 0) clearInterval(interval);
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
    <div className="room-page">
      <h2 className="room-title">Room: {roomId}</h2>

      {remainingTime !== null && (
        <div className="room-timer">
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

      <div className="controls">
        <button
          onClick={toggleMute}
          className={peerStates.localMuted ? "btn unmute" : "btn mute"}
        >
          {peerStates.localMuted ? "🎤 Unmute" : "🔇 Mute"}
        </button>

        <button
          onClick={toggleCamera}
          className={peerStates.localCameraOff ? "btn cam-on" : "btn cam-off"}
        >
          {peerStates.localCameraOff ? "🎥 Turn Camera On" : "📷 Turn Camera Off"}
        </button>

        <button
          onClick={handleRaiseHand}
          className={handRaised ? "btn hand-down" : "btn hand-up"}
        >
          {handRaised ? "🙌 Lower Hand" : "✋ Raise Hand"}
        </button>

        <button onClick={handleLeave} className="btn leave">
          🚪 Leave Room
        </button>
      </div>

      <div className="chat-wrapper">
        <ChatPanel roomId={roomId} user={user} />
      </div>
    </div>
  );
}

export default RoomPage;
