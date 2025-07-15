# 🌐 WebRTC Video Chat App (Frontend)

This is the **React frontend** for the real-time video calling application built using **WebRTC**, **React**, **Socket.IO**, and **Google OAuth**. It supports video/audio chat, live messaging, lobby discovery, and more.

## 🚀 Live Demo

🔗 [Launch Frontend App](https://web-rtc-front-virid.vercel.app)

🧑 GitHub: [https://github.com/Harshan-mv](https://github.com/Harshan-mv)

---

## 📦 Tech Stack

* React 19
* React Router DOM v7
* WebRTC via `simple-peer`
* Google Login with `@react-oauth/google`
* Axios for API requests
* SCSS for styling
* Socket.IO client
* JWT Decode

---

## 📁 Project Structure

```
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── styles/
│   ├── App.js
│   └── index.js
├── .env
└── package.json
```

---

## 📟 Setup Instructions

### 1️⃣ Navigate to frontend directory

```bash
cd client
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file in `client/`

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4️⃣ Start development server

```bash
npm start
```

Visit: `http://localhost:3000`

---

## 📦 package.json dependencies

```json
{
  "@react-oauth/google": "^0.12.2",
  "@testing-library/dom": "^10.4.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^13.5.0",
  "axios": "^1.10.0",
  "jwt-decode": "^4.0.0",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-icons": "^5.5.0",
  "react-router-dom": "^7.6.3",
  "react-scripts": "^5.0.1",
  "sass": "^1.89.2",
  "simple-peer": "^9.11.1",
  "socket.io-client": "^4.8.1",
  "web-vitals": "^2.1.4"
}
```

---

## 🔐 Auth Flow

* Google Login via `@react-oauth/google`
* Token decoded using `jwt-decode`
* Token sent to backend for verification and JWT issuance
* JWT stored in localStorage
* Auto logout on expiration implemented

---

## 🧩 Features

* Google Sign-In
* Room Creation (Private/Public)
* PIN-protected Access
* Real-Time Audio/Video
* Raise Hand + Mute + Camera Toggle
* Public Lobby View
* Chat Messaging + Typing Indicator

---

## 🧪 Upcoming Enhancements

* 🎙️ Host-only moderation controls
* 🌐 Theme switching
* 📱 Full mobile responsiveness
* 🏆 Room leaderboard

---

## 🙌 Contribution

Pull requests welcome!

---

> Built with ❤️ by Harshan MV
