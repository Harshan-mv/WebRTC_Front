// ✅ Updated VideoGrid component to use remoteStream
import React, { useRef, useEffect, useState } from "react";
import {
  FaMicrophoneSlash,
  FaHandPaper,
  FaVideoSlash,
} from "react-icons/fa";

// 🎥 Main Video Grid
function VideoGrid({ peers, userVideo, peerStates, currentUser, localStream }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {/* Local User Video */}
      <VideoTile
        videoRef={userVideo}
        name={currentUser?.name || "You"}
        muted={peerStates.localMuted}
        hand={peerStates.localHand}
        cameraOff={peerStates.localCameraOff}
        showVideo
        localStream={localStream}
      />

      {/* Peers */}
      {peers.map(({ peerID, remoteStream, user }) => (
        <VideoTile
          key={peerID}
          videoRef={null} // not needed for remote
          name={user?.name || "User"}
          muted={peerStates[peerID]?.muted}
          hand={peerStates[peerID]?.hand}
          cameraOff={peerStates[peerID]?.cameraOff}
          showVideo={!!remoteStream}
          remoteStream={remoteStream}
        />
      ))}
    </div>
  );
}

// 🧍 Local or Remote Tile
function VideoTile({ videoRef, name, muted, hand, cameraOff, showVideo = false, localStream, remoteStream }) {
  const ref = useRef();

  useEffect(() => {
    const stream = localStream || remoteStream;
    if (showVideo && !cameraOff && ref.current && stream) {
      ref.current.srcObject = stream;
      ref.current.play?.();
    }
  }, [showVideo, cameraOff, localStream, remoteStream]);

  return (
    <div className="relative w-full aspect-video bg-black rounded overflow-hidden shadow">
      {showVideo && !cameraOff ? (
        <video
          ref={ref}
          muted={!!localStream}
          autoPlay
          playsInline
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      ) : (
        <Avatar name={name} />
      )}
      <StatusBar name={name} muted={muted} hand={hand} cameraOff={cameraOff} />
    </div>
  );
}

// 🧑 Avatar with initials
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

// 🔘 Status bar at bottom of each tile
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
