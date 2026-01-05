# ReelChat - Real-Time Chat Application

A full-stack real-time chat application with user authentication, built with React, Node.js, Express, MongoDB, and Socket.IO.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Real-Time Messaging**: Instant message delivery using WebSockets
- **Typing Indicators**: See when other users are typing
- **Online Users**: Real-time list of online users
- **Private Messaging**: Direct messages between users
- **Message Persistence**: Chat history saved to MongoDB
- **Dark Mode**: Toggle between light and dark themes
- **Desktop Notifications**: Get notified of new messages
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React, Socket.IO Client, Axios
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt

## Project Structure

```
Reelchat/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── pages/          # Page components
│       ├── styles/         # CSS styles
│       ├── App.js
│       └── index.js
│
└── server/                 # Node.js backend
    ├── config/             # Database configuration
    ├── controllers/        # Route handlers
    ├── middleware/         # Express middleware
    ├── models/             # Mongoose schemas
    ├── routes/             # API routes
    ├── socket/             # Socket.IO handlers
    └── server.js           # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository and navigate to the project folder**

2. **Set up the server**

```bash
cd server
npm install
```

3. **Configure environment variables**

Edit `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reelchat
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. **Set up the client**

```bash
cd client
npm install
```

### Running the Application

1. **Start MongoDB** (if running locally)

2. **Start the server**

```bash
cd server
npm run dev
```

3. **Start the client** (in a new terminal)

```bash
cd client
npm start
```

4. **Open the application**

Navigate to `http://localhost:3000` in your browser.

## API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |
| POST   | `/api/auth/logout`   | Logout user         |
| GET    | `/api/auth/me`       | Get current user    |

### Messages

| Method | Endpoint                        | Description             |
| ------ | ------------------------------- | ----------------------- |
| GET    | `/api/messages/:room`           | Get messages for a room |
| GET    | `/api/messages/private/:userId` | Get private messages    |

### Users

| Method | Endpoint            | Description      |
| ------ | ------------------- | ---------------- |
| GET    | `/api/users`        | Get all users    |
| GET    | `/api/users/online` | Get online users |

## Socket.IO Events

### Client to Server

| Event          | Description         |
| -------------- | ------------------- |
| `message:send` | Send a new message  |
| `typing:start` | User started typing |
| `typing:stop`  | User stopped typing |
| `room:join`    | Join a chat room    |
| `room:leave`   | Leave a chat room   |
| `private:join` | Join private chat   |

### Server to Client

| Event                 | Description               |
| --------------------- | ------------------------- |
| `message:received`    | New message received      |
| `users:online`        | Updated online users list |
| `user:joined`         | User came online          |
| `user:left`           | User went offline         |
| `user:typing`         | User is typing            |
| `user:stopped-typing` | User stopped typing       |

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT authentication with HTTP-only cookies
- Input validation on both client and server
- Protected routes and middleware
- CORS configuration

## License

MIT
