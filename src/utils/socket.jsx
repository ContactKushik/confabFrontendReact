// socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false,
  // Disables automatic reconnection attempts
  transports: ["websocket"],
}); // Replace with your server URL
export default socket;
