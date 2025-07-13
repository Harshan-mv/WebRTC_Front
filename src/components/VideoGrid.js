import React, { useRef, useEffect } from "react";
import {
  FaMicrophoneSlash,
  FaHandPaper,
  FaVideoSlash,
} from "react-icons/fa";

// 🎥 Main Video Grid
function VideoGrid({ peers, userVideo, peerStates, currentUser, localStream }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {/* Local User */}
      <VideoTile
        videoRef={userVideo}
        name={currentUser?.name || "You"}
        muted={peerStates.localMuted}
        hand={peerStates.localHand}
        cameraOff={peerStates.localCameraOff}
        isLocal
        stream={localStream}
      />

      {/* Remote Peers */}
      {peers.map(({ peerID, remoteStream, user }) => (
        <VideoTile
          key={peerID}
          name={user?.name || "User"}
          muted={peerStates[peerID]?.muted}
          hand={peerStates[peerID]?.hand}
          cameraOff={peerStates[peerID]?.cameraOff}
          isLocal={false}
          stream={remoteStream}
        />
      ))}
    </div>
  );
}

// 🎬 Individual Video Tile
function VideoTile({ videoRef, name, muted, hand, cameraOff, isLocal, stream }) {
  const internalRef = useRef(); // ✅ Always call useRef
  const ref = videoRef ?? internalRef; // Use provided ref for local, else internal for remote

  useEffect(() => {
    if (stream && ref.current && !cameraOff) {
      ref.current.srcObject = stream;
      const playPromise = ref.current.play?.();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn("Autoplay prevented or interrupted", err);
        });
      }
    }
  }, [stream, cameraOff, ref]);

  return (
    <div className="relative w-full aspect-video bg-black rounded overflow-hidden shadow">
      {!cameraOff && stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      ) : (
        <Avatar name={name} />
      )}
      <StatusBar name={name} muted={muted} hand={hand} cameraOff={cameraOff} />
    </div>
  );
}

// 👤 Avatar fallback
function Avatar({ name = "User" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-3xl font-bold animate-fade-in">
      {initials}
    </div>
  );
}

// 🟡 Status bar with icons
function StatusBar({ name, muted, hand, cameraOff }) {
  return (
    <div className="absolute bottom-1 left-1 right-1 text-white bg-black bg-opacity-60 px-2 py-1 text-sm flex justify-between items-center rounded">
      <span>{name}</span>
      <div className="flex gap-2">
        {muted && <FaMicrophoneSlash className="text-red-500" title="Muted" />}
        {hand && <FaHandPaper className="text-yellow-300" title="Hand Raised" />}
        {cameraOff && <FaVideoSlash className="text-gray-300" title="Camera Off" />}
      </div>
    </div>
  );
}

export default VideoGrid;
