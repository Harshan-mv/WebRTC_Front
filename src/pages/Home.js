// src/pages/Home.js
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/Home.scss"; // ✅ SCSS import

function Home() {
  const { user } = useAuth();

  console.log("✅ Home Page - user:", user);

  return (
    <div className="home-page">
      {user && user.name ? (
        <div className="welcome-container">
          <h1 className="welcome-heading">Welcome, {user.name}</h1>
          <img
            src={user.picture}
            alt="Profile"
            className="profile-image"
          />
          <div className="nav-links">
            <a href="/create" className="link blue">Create Room</a>
            <a href="/join" className="link green">Join Room</a>
            <a href="/lobby" className="link purple">Public Lobby</a>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <h2 className="login-heading">Please log in to continue</h2>
          <GoogleLoginButton />
        </div>
      )}
    </div>
  );
}

export default Home;
