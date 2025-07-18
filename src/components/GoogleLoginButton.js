import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../styles/GoogleLoginButton.scss"; // ✅ SCSS import

function GoogleLoginButton() {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Decoded user info:", decoded);

    login({
      name: decoded.name || decoded.email,
      email: decoded.email,
      picture: decoded.picture || null,
    });

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`,
        { token: credentialResponse.credential }
      );
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      console.error("Backend login failed", err);
    }
  };

  return (
    <div className="google-login-button">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Google login failed")}
      />
    </div>
  );
}

export default GoogleLoginButton;
