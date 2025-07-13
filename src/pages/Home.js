// src/pages/Home.js
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

function Home() {
  const { user } = useAuth();

  // Debugging the user state
  console.log("✅ Home Page - user:", user);

  return (
    <div className="p-4 text-center">
      {user && user.name ? (
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <img
            src={user.picture}
            alt="Profile"
            className="mx-auto my-4 w-24 h-24 rounded-full border"
          />
          <div className="space-x-4 mt-4">
            <a href="/create" className="text-blue-500 hover:underline">
              Create Room
            </a>
            <a href="/join" className="text-green-500 hover:underline">
              Join Room
            </a>
            <a href="/lobby" className="text-purple-500 hover:underline">
              Public Lobby
            </a>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Please log in to continue</h2>
          <GoogleLoginButton />
        </div>
      )}
    </div>
  );
}

export default Home;
