//const Room = require("./models/Room");

let usersInRoom = {};         // roomId: [{ socketId, user }]
let roomHostMap = {};         // roomId: hostName
let roomPrivacyMap = {};      // roomId: isPrivate
let emptyRoomTimeouts = {};   // roomId: timeoutId
let roomExpiresAt = {};       // roomId: timestamp for auto-delete

function emitPublicRooms(io) {
  const publicRooms = [];

  for (const [roomId, users] of Object.entries(usersInRoom)) {
    const isPrivate = roomPrivacyMap[roomId];

    if (!isPrivate) {
      publicRooms.push({
        roomId,
        host: roomHostMap[roomId] || "Unknown",
        users: users.length,
        expiresAt: roomExpiresAt[roomId] || null,
      });
    }
  }

  io.emit("public-rooms", publicRooms);
}

module.exports = function (io) {
  io.on("connection", (socket) => {
    // ============================
    // JOIN ROOM
    // ============================
    socket.on("join-room", ({ roomId, user, isPrivate }) => {
      socket.join(roomId);

      if (!usersInRoom[roomId]) {
        usersInRoom[roomId] = [];
        roomHostMap[roomId] = user.name;
        roomPrivacyMap[roomId] = isPrivate || false;
      }

      // Cancel deletion if rejoined
      if (emptyRoomTimeouts[roomId]) {
        clearTimeout(emptyRoomTimeouts[roomId]);
        delete emptyRoomTimeouts[roomId];
        delete roomExpiresAt[roomId];

        io.to(roomId).emit("room-empty-timer", { expiresAt: null });
      }

      // Prevent duplicate socket IDs in usersInRoom
      const alreadyInRoom = usersInRoom[roomId].some(u => u.socketId === socket.id);
      if (!alreadyInRoom) {
        usersInRoom[roomId].push({ socketId: socket.id, user });
      }

      const others = usersInRoom[roomId].filter(u => u.socketId !== socket.id);
      socket.emit("all-users", others.map(u => ({
        socketId: u.socketId,
        user: u.user
      })));

      // Don't emit signal if no signal is provided
      if (others.length > 0) {
        socket.to(roomId).emit("user-joined", {
          signal: null,
          callerID: socket.id,
          user,
        });
      }

      emitPublicRooms(io);
    });

    // ============================
    // SIGNALING
    // ============================
    socket.on("sending-signal", ({ userToSignal, callerID, signal }) => {
      if (signal) {
        io.to(userToSignal).emit("user-joined", { signal, callerID });
      }
    });

    socket.on("returning-signal", ({ signal, callerID }) => {
      if (signal) {
        io.to(callerID).emit("receiving-returned-signal", {
          signal,
          id: socket.id,
        });
      }
    });

    // ============================
    // LEAVE ROOM
    // ============================
    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);

      if (usersInRoom[roomId]) {
        usersInRoom[roomId] = usersInRoom[roomId].filter(
          (u) => u.socketId !== socket.id
        );

        io.to(roomId).emit("room-users", usersInRoom[roomId]);

        if (usersInRoom[roomId].length === 0) {
          const DELETE_TIME = 5 * 60 * 1000;
          const expiresAt = Date.now() + DELETE_TIME;

          roomExpiresAt[roomId] = expiresAt;

          io.to(roomId).emit("room-empty-timer", { expiresAt });

          emptyRoomTimeouts[roomId] = setTimeout(() => {
            delete usersInRoom[roomId];
            delete roomHostMap[roomId];
            delete roomPrivacyMap[roomId];
            delete emptyRoomTimeouts[roomId];
            delete roomExpiresAt[roomId];
            emitPublicRooms(io);
          }, DELETE_TIME);
        }

        emitPublicRooms(io);
      }
    });

    // ============================
    // DISCONNECT
    // ============================
    socket.on("disconnect", () => {
      for (let roomId in usersInRoom) {
        const before = usersInRoom[roomId].length;
        usersInRoom[roomId] = usersInRoom[roomId].filter(
          (u) => u.socketId !== socket.id
        );
        const after = usersInRoom[roomId].length;

        if (before !== after) {
          io.to(roomId).emit("room-users", usersInRoom[roomId]);

          if (after === 0 && !emptyRoomTimeouts[roomId]) {
            const DELETE_TIME = 5 * 60 * 1000;
            const expiresAt = Date.now() + DELETE_TIME;

            roomExpiresAt[roomId] = expiresAt;

            io.to(roomId).emit("room-empty-timer", { expiresAt });

            emptyRoomTimeouts[roomId] = setTimeout(() => {
              delete usersInRoom[roomId];
              delete roomHostMap[roomId];
              delete roomPrivacyMap[roomId];
              delete emptyRoomTimeouts[roomId];
              delete roomExpiresAt[roomId];
              emitPublicRooms(io);
            }, DELETE_TIME);
          }
        }
      }

      emitPublicRooms(io);
    });

    // ============================
    // EXTRA EVENTS
    // ============================
    socket.on("raise-hand", ({ roomId, user, status }) => {
      io.to(roomId).emit("user-raised-hand", {
        peerID: socket.id,
        status,
      });
    });

    socket.on("mute-status", ({ roomId, status }) => {
      io.to(roomId).emit("user-muted", {
        peerID: socket.id,
        status,
      });
    });

    socket.on("camera-status", ({ roomId, status }) => {
      io.to(roomId).emit("user-camera-updated", {
        peerID: socket.id,
        status,
      });
    });

    socket.on("chat-message", (data) => {
      const { roomId, ...msg } = data;
      // Send to everyone except the sender
      socket.to(roomId).emit("chat-message", msg);

      // Send once to the sender (self), so we can label it "You"
      socket.emit("chat-message", { ...msg, self: true });
    });

    socket.on("typing", ({ roomId, user }) => {
      socket.to(roomId).emit("user-typing", user.name);
    });

    socket.on("get-public-rooms", () => {
      emitPublicRooms(io);
    });
  });
};
