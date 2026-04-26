# LinkUp — Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB.

**Developed by Shreyas Dubey**

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Architecture](#architecture)
6. [Database Models](#database-models)
7. [API Endpoints](#api-endpoints)
8. [Real-Time with Socket.io](#real-time-with-socketio)
9. [Authentication](#authentication)
10. [File Uploads](#file-uploads)
11. [Frontend State Management](#frontend-state-management)
12. [Environment Variables](#environment-variables)
13. [Running Locally](#running-locally)
14. [Deployment](#deployment)

---

## Overview

LinkUp is a real-time messaging app where users can register, search for other users, chat one-on-one, share images, see online status, block/unblock users, and manage their profile.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS + DaisyUI | Styling |
| React Router v7 | Client-side routing |
| Axios | HTTP requests |
| Socket.io Client | Real-time communication |
| Zustand | Lightweight global state (selected conversation, messages) |
| React Toastify | Toast notifications |
| React Icons | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.io | WebSocket server for real-time events |
| MongoDB + Mongoose | Database and ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT-based authentication |
| cookie-parser | Reading JWT from cookies |
| Cloudinary | Cloud image storage |
| Multer | Handling multipart/form-data file uploads |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |

---

## Project Structure

```
chat-application/
├── backend/
│   ├── DB/
│   │   └── dbConnect.js          # MongoDB connection
│   ├── middleware/
│   │   ├── isLogin.js            # JWT auth middleware
│   │   └── upload.js             # Multer config
│   ├── Models/
│   │   ├── userModels.js         # User schema
│   │   ├── conversationModel.js  # Conversation schema
│   │   ├── messageSchema.js      # Message schema
│   │   └── UserBlockSchema.js    # Block/unblock schema
│   ├── route/
│   │   ├── authUser.js           # /api/auth routes
│   │   ├── messageRoute.js       # /api/message routes
│   │   └── userRoute.js          # /api/user routes
│   ├── routeControllers/
│   │   ├── userRouteControler.js       # Register, login, logout
│   │   ├── userhandlerController.js    # Profile, search, chatters
│   │   ├── messageRouteController.js   # Send, get messages
│   │   └── blockUnblockController.js   # Block/unblock logic
│   ├── Socket/
│   │   └── socket.js             # Socket.io server setup
│   ├── utils/
│   │   ├── cloudinary.js         # Cloudinary config
│   │   └── jwtWebToken.js        # JWT cookie generator
│   ├── .env                      # Environment variables (never commit)
│   ├── .env.example              # Template for env vars
│   └── index.js                  # App entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/               # Static assets (sounds, images)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth user global state
│   │   │   └── socketContext.jsx # Socket connection + online users
│   │   ├── home/
│   │   │   ├── Home.jsx          # Main chat layout
│   │   │   └── components/
│   │   │       ├── Sidebar.jsx         # User list + search
│   │   │       ├── MessageContainer.jsx # Chat window
│   │   │       ├── Profile.jsx         # Edit profile page
│   │   │       └── UserProfileModal.jsx # View other user's profile
│   │   ├── Login/
│   │   │   └── Login.jsx
│   │   ├── register/
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   ├── axiosInstance.js  # Axios with baseURL + credentials
│   │   │   └── VerifyUser.jsx    # Protected route wrapper
│   │   ├── Zustand/
│   │   │   └── useConversation.js # Zustand store
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .env.example
│   └── vite.config.js
```

---

## Features

- **Authentication** — Register, login, logout with JWT stored in HTTP-only cookies
- **Real-time messaging** — Messages delivered instantly via Socket.io
- **Image sharing** — Send images in chat, uploaded to Cloudinary
- **Online status** — See who is online in real-time
- **User search** — Search users by name or username
- **Block / Unblock** — Block users to prevent messaging
- **Profile management** — Update name, username, email, bio, gender, profile picture
- **Notification sound** — Audio plays on new message
- **Responsive design** — Works on mobile and desktop
- **Fullscreen image viewer** — Click any image in chat or profile to view fullscreen

---

## Architecture

```
Browser (React + Vite)
        |
        |  HTTP (Axios + cookies)
        |  WebSocket (Socket.io)
        |
Express Server (Node.js)
        |
        |--- REST API (/api/auth, /api/message, /api/user)
        |--- Socket.io Server
        |
        |--- MongoDB (Mongoose)
        |--- Cloudinary (images)
```

The frontend and backend are deployed **separately**:
- Frontend → Vercel
- Backend → Render

They communicate via `VITE_API_URL` (HTTP) and `VITE_SOCKET_URL` (WebSocket).

---

## Database Models

### User
```
fullname    String  required
username    String  required, unique
email       String  required, unique
gender      String  enum: ['male', 'female']
password    String  hashed with bcryptjs
profilepic  String  Cloudinary URL
about       String  max 150 chars
timestamps  createdAt, updatedAt
```

### Conversation
```
participants  [ObjectId → User]   the two users in the chat
messages      [ObjectId → Message]
timestamps    createdAt, updatedAt
```

### Message
```
senderId      ObjectId → User
receiverId    ObjectId → User
message       String  (text content)
messageType   String  enum: ['text', 'image']
imageUrl      String  Cloudinary URL (if image)
conversationId ObjectId → Conversation
timestamps    createdAt, updatedAt
```

### UserBlock
```
blocker   ObjectId → User
blocked   ObjectId → User
unique index on (blocker, blocked)
timestamps
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create new account | No |
| POST | `/login` | Login, sets JWT cookie | No |
| POST | `/logout` | Clears JWT cookie | No |

### User — `/api/user`
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/profile` | Get own full profile | Yes |
| PUT | `/profile` | Update own profile | Yes |
| DELETE | `/profile` | Delete account | Yes |
| POST | `/profile/upload` | Upload profile picture | Yes |
| GET | `/search?search=` | Search users by name/username | Yes |
| GET | `/currentchatters` | Get users you've chatted with | Yes |
| GET | `/view/:userId` | Get public profile of a user | Yes |
| POST | `/block` | Block a user | Yes |
| POST | `/unblock` | Unblock a user | Yes |
| GET | `/checkBlockStatus/:userId` | Check if user is blocked | Yes |

### Messages — `/api/message`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/send/:receiverId` | Send a message (text or image) | Yes |
| GET | `/:conversationId` | Get all messages in a conversation | Yes |

---

## Real-Time with Socket.io

The Socket.io server runs on the same Node.js server as Express (shared `http.Server` instance).

### How it works

1. When a user logs in and opens the app, the frontend connects to the socket server passing `userId` as a query param
2. The server maps `userId → socketId` in a `userSocketmap` object in memory
3. When a message is sent via REST API, the controller looks up the receiver's `socketId` and emits `newMessage` directly to them
4. The server emits `getOnlineUsers` (array of user IDs) to all clients whenever someone connects or disconnects

### Events
| Event | Direction | Description |
|---|---|---|
| `getOnlineUsers` | Server → All clients | Array of currently online user IDs |
| `newMessage` | Server → Receiver | New message object |
| `setOnlineStatus` | Client → Server | Trigger online list refresh |
| `updateChatUsers` | Server → Client | Refresh sidebar chat list |
| `disconnect` | Built-in | Remove user from online map |

---

## Authentication

- On login/register, a JWT is signed with `JWT_SECRET` and set as an **HTTP-only cookie** named `jwt`
- Cookie is `sameSite: none` + `secure: true` in production (required for cross-origin between Vercel and Render)
- Cookie is `sameSite: strict` + `secure: false` in development
- Every protected route passes through the `isLogin` middleware which:
  1. Reads the `jwt` cookie
  2. Verifies it with `JWT_SECRET`
  3. Fetches the user from MongoDB
  4. Attaches `req.user` for use in controllers
- Passwords are hashed with `bcryptjs` (salt rounds: 10) before storing

---

## File Uploads

Images (profile pictures and chat images) are handled with **Multer** + **Cloudinary**:

1. Multer reads the file into memory (`memoryStorage`) — no disk writes
2. The file buffer is converted to a base64 data URI
3. Uploaded to Cloudinary under the `linkup/profiles` or `linkup/messages` folder
4. Cloudinary returns a `secure_url` which is stored in MongoDB

---

## Frontend State Management

Two state systems are used:

### React Context
- `AuthContext` — stores `authUser` (logged-in user object), persisted in `localStorage`
- `socketContext` — stores the socket instance and `onlineUser` array (list of online user IDs)

### Zustand
- `useConversation` store — stores `selectedConversation` and `messages` array
- Used in both `Sidebar` and `MessageContainer` to share selected chat state without prop drilling

### Axios Instance
All API calls go through `axiosInstance.js`:
```js
axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true  // sends cookies cross-origin
})
```

---

## Environment Variables

### Backend (`backend/.env`)
```
MONGO_URI=                    # MongoDB connection string
JWT_SECRET=                   # Secret for signing JWTs
PORT=5000                     # Server port
CLOUDINARY_CLOUD_NAME=        # Cloudinary cloud name
CLOUDINARY_API_KEY=           # Cloudinary API key
CLOUDINARY_API_SECRET=        # Cloudinary API secret
CLIENT_URL=                   # Frontend URL for CORS (comma-separated for multiple)
NODE_ENV=production           # Set on Render for production cookie behavior
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=                 # Backend URL e.g. https://your-backend.onrender.com
VITE_SOCKET_URL=              # Socket URL (same as backend URL)
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend
```bash
cd backend
npm install
# create .env from .env.example and fill in values
npm run dev
# runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# create .env from .env.example
# set VITE_API_URL=http://localhost:5000
# set VITE_SOCKET_URL=http://localhost:5000
npm run dev
# runs on http://localhost:5173
```

---

## Deployment

### Backend → Render
1. Push code to GitHub (ensure `.env` is gitignored)
2. Create a new **Web Service** on Render
3. Set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add all environment variables from `backend/.env` in Render's Environment tab
7. Add `NODE_ENV=production`
8. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel
1. Import the GitHub repo on Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_SOCKET_URL` = your Render backend URL
4. Deploy

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to respond (cold start).

---

*Built with ❤️ by Shreyas Dubey*
