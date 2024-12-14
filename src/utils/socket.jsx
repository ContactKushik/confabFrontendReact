// socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnection: false, // Disables automatic reconnection attempts
  transports: ["websocket"],
}); // Replace with your server URL
export default socket;
