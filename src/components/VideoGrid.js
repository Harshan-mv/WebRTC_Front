import React, { useRef, useEffect } from "react";
import {
  FaMicrophoneSlash,
  FaHandPaper,
  FaVideoSlash,
} from "react-icons/fa";
import "../styles/VideoGrid.scss"; // ✅ SCSS import

function VideoGrid({ peers, userVideo, peerStates, currentUser, localStream }) {
  return (
    <div className="video-grid">
      <VideoTile
        videoRef={userVideo}
        name={currentUser?.name || "You"}
        muted={peerStates.localMuted}
        hand={peerStates.localHand}
        cameraOff={peerStates.localCameraOff}
        isLocal
        stream={localStream}
      />
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

function VideoTile({ videoRef, name, muted, hand, cameraOff, isLocal, stream }) {
  const internalRef = useRef();
  const ref = videoRef ?? internalRef;

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
    <div className="video-tile">
      {!cameraOff && stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          className="video"
        />
      ) : (
        <Avatar name={name} />
      )}
      <StatusBar name={name} muted={muted} hand={hand} cameraOff={cameraOff} />
    </div>
  );
}

function Avatar({ name = "User" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="avatar">
      {initials}
    </div>
  );
}

function StatusBar({ name, muted, hand, cameraOff }) {
  return (
    <div className="status-bar">
      <span>{name}</span>
      <div className="status-icons">
        {muted && <FaMicrophoneSlash className="muted-icon" title="Muted" />}
        {hand && <FaHandPaper className="hand-icon" title="Hand Raised" />}
        {cameraOff && <FaVideoSlash className="camera-icon" title="Camera Off" />}
      </div>
    </div>
  );
}

export default VideoGrid;
