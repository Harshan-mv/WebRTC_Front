// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId="340819311994-85sn70ja4pg1pf9583gju3mkdn06eftn.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
