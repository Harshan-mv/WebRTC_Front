import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function GoogleLoginButton() {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Decoded user info:", decoded);

    // Save user to context and localStorage
    login({
      name: decoded.name || decoded.email,
      email: decoded.email,
      picture: decoded.picture || null,
    });

    try {
      // ✅ Use dynamic backend URL from .env
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
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Google login failed")}
    />
  );
}

export default GoogleLoginButton;
