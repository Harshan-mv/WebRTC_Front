import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/Home.scss";

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="text-content">
          <h1>Welcome to InstantMeet</h1>
          <p className="tagline">Connect. Collaborate. Communicate.</p>
          {user && user.name ? (
            <>
              <img
                src={user.picture}
                alt="Profile"
                className="profile-image"
              />
              <h2>Hello, {user.name} 👋</h2>
              <div className="nav-links">
                <a href="/create" className="link blue">🎥 Create Room</a>
                <a href="/join" className="link green">🔑 Join Room</a>
                <a href="/lobby" className="link purple">🧑‍🤝‍🧑 Public Lobby</a>
              </div>
            </>
          ) : (
                  <div className="login-prompt">
        <h2 className="login-heading">👋 Welcome to InstantMeet</h2>
        <p className="marketing-text">
          Host HD video meetings, share files, and collaborate in real-time—just like Zoom or Google Meet.
          <br />
          <strong>Schedule, join, or create meetings in seconds.</strong>
        </p>
        <GoogleLoginButton />
      </div>

          )}
        </div>

        <div className="image-section">
          <img
            src="https://cdn-icons-png.flaticon.com/512/564/564445.png"
            alt="Video Call"
            className="hero-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
