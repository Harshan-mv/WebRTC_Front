// useWebRTC.js
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import Peer from "simple-peer";

const useWebRTC = (roomId, currentUser) => {
  const socket = useSocket();
  const userVideo = useRef();
  const streamRef = useRef();

  const [peers, setPeers] = useState([]);
  const [peerStates, setPeerStates] = useState({
    localMuted: false,
    localHand: false,
    localCameraOff: false,
  });

  useEffect(() => {
    if (!socket || !currentUser) return;

    let cleanup = () => {};

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      streamRef.current = stream;
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }

      socket.emit("join-room", { roomId, user: currentUser });

      socket.on("all-users", (users) => {
        const peerConnections = users.map(({ socketId, user }) => {
          const peer = createPeer(socketId, socket.id, stream);
          return { peerID: socketId, peer, user, remoteStream: null };
        });
        setPeers(peerConnections);
      });

      socket.on("user-joined", ({ signal, callerID, user }) => {
        const peer = addPeer(signal, callerID, stream);
        setPeers((prev) => [...prev, { peerID: callerID, peer, user, remoteStream: null }]);
      });

      socket.on("receiving-returned-signal", ({ id, signal }) => {
        const peerObj = peers.find((p) => p.peerID === id);
        if (peerObj) {
          peerObj.peer.signal(signal);
        }
      });

      cleanup = () => {
        stream.getTracks().forEach((t) => t.stop());
        socket.emit("leave-room", { roomId });
        socket.off("all-users");
        socket.off("user-joined");
        socket.off("receiving-returned-signal");
      };
    });

    return () => cleanup();
  }, [socket, currentUser, roomId]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signal) => {
      socket.emit("sending-signal", { userToSignal, callerID, signal });
    });

    peer.on("stream", (remoteStream) => {
      setPeers((prev) =>
        prev.map((p) =>
          p.peerID === userToSignal ? { ...p, remoteStream } : p
        )
      );
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signal) => {
      socket.emit("returning-signal", { signal, callerID });
    });

    peer.on("stream", (remoteStream) => {
      setPeers((prev) =>
        prev.map((p) =>
          p.peerID === callerID ? { ...p, remoteStream } : p
        )
      );
    });

    peer.signal(incomingSignal);
    return peer;
  };

  const toggleMute = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const newStatus = !audioTrack.enabled;
      setPeerStates((prev) => ({ ...prev, localMuted: newStatus }));
      socket.emit("mute-status", { roomId, status: newStatus });
    }
  };

  const toggleCamera = async () => {
    let videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack && videoTrack.readyState === "live") {
      videoTrack.enabled = !videoTrack.enabled;
      const newStatus = !videoTrack.enabled;
      setPeerStates((prev) => ({ ...prev, localCameraOff: newStatus }));
      socket.emit("camera-status", { roomId, status: newStatus });
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (streamRef.current) {
          streamRef.current.getVideoTracks().forEach((t) => streamRef.current.removeTrack(t));
          streamRef.current.addTrack(newVideoTrack);
        } else {
          streamRef.current = newStream;
        }
        if (userVideo.current) {
          userVideo.current.srcObject = streamRef.current;
        }
        peers.forEach(({ peer }) => {
          const sender = peer._pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });
        setPeerStates((prev) => ({ ...prev, localCameraOff: false }));
        socket.emit("camera-status", { roomId, status: false });
      } catch (err) {
        console.error("Failed to reacquire camera:", err);
      }
    }
  };

  const raiseHand = (status) => {
    socket.emit("raise-hand", { roomId, user: currentUser, status });
    setPeerStates((prev) => ({ ...prev, localHand: status }));
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("user-muted", ({ peerID, status }) => {
      setPeerStates((prev) => ({
        ...prev,
        [peerID]: { ...(prev[peerID] || {}), muted: status },
      }));
    });

    socket.on("user-raised-hand", ({ peerID, status }) => {
      setPeerStates((prev) => ({
        ...prev,
        [peerID]: { ...(prev[peerID] || {}), hand: status },
      }));
    });

    socket.on("user-camera-updated", ({ peerID, status }) => {
      setPeerStates((prev) => ({
        ...prev,
        [peerID]: { ...(prev[peerID] || {}), cameraOff: status },
      }));
    });

    return () => {
      socket.off("user-muted");
      socket.off("user-raised-hand");
      socket.off("user-camera-updated");
    };
  }, [socket]);

  return {
    peers,
    userVideo,
    peerStates,
    toggleMute,
    toggleCamera,
    raiseHand,
    localStream: streamRef.current,
  };
};

export default useWebRTC;
