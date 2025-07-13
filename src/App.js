// App.js
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import RoomCreate from "./pages/RoomCreate";
import RoomJoin from "./pages/RoomJoin";
import RoomPage from "./pages/RoomPage";
import Lobby from "./pages/Lobby";
import TestLogin from "./components/TestLogin";


function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

// Move this to a new component
function AppRoutes() {
  const { user, setUser } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<RoomCreate />} />
      <Route path="/join" element={<RoomJoin />} />
      <Route path="/test-login" element={<TestLogin />} />

      
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/room/:roomId" element={user ? (<RoomPage />
          ) : (
            <div className="p-4 text-center text-gray-600">Loading user info...</div>
          )
        }
      />
    </Routes>
  );
}

export default App;
