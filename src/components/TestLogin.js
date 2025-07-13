import { GoogleLogin } from "@react-oauth/google";

function TestLogin() {
  return (
    <div>
      <h2>Test Google Login</h2>
      <GoogleLogin
        onSuccess={(res) => console.log("✅ Login Success", res)}
        onError={() => console.log("❌ Login Failed")}
      />
    </div>
  );
}

export default TestLogin;
