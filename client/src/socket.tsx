import { io, Socket } from "socket.io-client"; // Import connection function and Socket type

const socket: Socket = io('localhost:8080'); // Initialize WebSocket connection

export default socket;
