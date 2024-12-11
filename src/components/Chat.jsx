import React, { useEffect, useState, useRef } from "react";
// import io from "socket.io-client";
import adapter from "webrtc-adapter";
import TotalUsers from "./TotalUsers";
import socket from "../utils/socket";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Chat = () => {
  const [theme, setTheme] = useState("dark");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [messages, setMessages] = useState([]);
  const messageInputRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom

  const peerConnectionRef = useRef(null); // Store peerConnection as a ref
  const dataChannelRef = useRef(null); // Store dataChannel as a ref
  const roomRef = useRef(null); // Store room name as a ref
  const navigate = useNavigate(); // Initialize useNavigate

  const [skipButtonColor, setSkipButtonColor] = useState("bg-red-500"); // State for skip button color

  useEffect(() => {
    // Theme toggle logic
    const body = document.body;
    body.classList.add(theme);

    return () => {
      body.classList.remove(theme);
    };
  }, [theme]);

  useEffect(() => {
    // Check if socket is already connected
    if (!socket.connected) {
      socket.emit("joinroom");
    }

    socket.on("joined", (roomname) => {
      roomRef.current = roomname;
      console.log("Connected to room:", roomname);
      setSkipButtonColor("bg-blue-500"); // Change skip button color to blue
      initialize();
    });

    socket.on("totalUsers", (count) => {
      setOnlineUsers(count); // Update online users count
    });

    socket.on("signalingMessage", (message) => {
      handleSignalingMessage(JSON.parse(message));
    });
    socket.on("leave", () => {
      cleanvideo_messages();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close(); // Close the peer connection
        peerConnectionRef.current = null; // Clear the reference
      }
      console.log("User left the room");
      setSkipButtonColor("bg-red-500 cursor-not-allowed"); // Change skip button color to red and set cursor
      // to reconnect
      socket.emit("joinroom");
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // yeh poore page ko re render nhi karayega bs jo messages mein change hoga toh sirf iske andar jo likha h woh karega

  useEffect(() => {
    // Scroll to the bottom of the messages when a new message is received
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initialize = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localVideoRef.current.srcObject = stream;

      createPeerConnection(stream);
      initiateOffer();
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const cleanvideo_messages = () => {
    remoteVideoRef.current.srcObject = new MediaStream(); // Reset remote video feed
    setMessages([]); // Clear messages if using state
  };

  const handleskip = () => {
    if(peerConnectionRef.current){
      socket.emit("skipped", roomRef.current);
    }
     // Send room id with the skip event
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    navigate("/"); // Redirect to the root route without reloading
  };

  const createPeerConnection = (stream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    remoteVideoRef.current.srcObject = new MediaStream();

    peerConnection.ontrack = (event) => {
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteVideoRef.current.srcObject.addTrack(track));
    };

    peerConnection.ondatachannel = (event) => {
      console.log("DataChannel received from remote peer:", event.channel);
      dataChannelRef.current = event.channel;
      setupDataChannel(dataChannelRef.current);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signalingMessage", {
          room: roomRef.current,
          message: JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
          }),
        });
      }
    };

    const dataChannel = peerConnection.createDataChannel("chat");
    dataChannelRef.current = dataChannel;
    setupDataChannel(dataChannel);

    peerConnectionRef.current = peerConnection; // Store peerConnection in the ref
  };

  const setupDataChannel = (dataChannel) => {
    dataChannel.onopen = () => {
      console.log("DataChannel is open");
    };

    dataChannel.onclose = () => {
      console.log("DataChannel is closed");
    };

    dataChannel.onmessage = (event) => {
      console.log("Message received:", event.data);

      // Play sound for incoming message
      playNotificationSound();

      setMessages((prev) => [...prev, { sender: "Remote", text: event.data }]);
    };

    dataChannel.onerror = (error) => {
      console.error("DataChannel error:", error);
    };
  };

  const playNotificationSound = () => {
    const audio = new Audio("/sound.mp3"); // Path to your custom sound
    audio.play().catch((error) => {
      console.error("Failed to play notification sound:", error);
    });
  };

  const initiateOffer = async () => {
    try {
      const peerConnection = peerConnectionRef.current;
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("signalingMessage", {
        room: roomRef.current,
        message: JSON.stringify({ type: "offer", offer }),
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleSignalingMessage = async (message) => {
    console.log("Received signaling message:", message);

    const peerConnection = peerConnectionRef.current;
    const { type, offer, answer, candidate } = message;

    if (type === "offer") {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("signalingMessage", {
        room: roomRef.current,
        message: JSON.stringify({ type: "answer", answer }),
      });
    } else if (type === "answer") {
      await peerConnection.setRemoteDescription(answer);
    } else if (type === "candidate") {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleMessageSend = (e) => {
    e.preventDefault();
    const message = messageInputRef.current.value.trim();
    const dataChannel = dataChannelRef.current;

    if (!dataChannel || dataChannel.readyState !== "open") {
      console.error("DataChannel is not open:", dataChannel?.readyState);
      return;
    }

    if (message) {
      dataChannel.send(message);
      setMessages((prev) => [...prev, { sender: "You", text: message }]);
      messageInputRef.current.value = "";
    }
  };

  return (
    <div className="dark:bg-gray-900 text-gray-100 h-screen bg-zinc-400">
      <header className="flex justify-between items-center py-2 px-5 bg-gray-800 text-white text-xl">
        <h1 className="font-bold text-lg sm:text-xl">CONFAB</h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <i className="ri-group-line"></i>
            <span className="font-bold text-center">{onlineUsers}</span> {/* Display total online users */}
            <span className="font-semibold">Online</span>
          </div>
          <button
            onClick={handleskip} // Send room id with the skip event
            className={`${skipButtonColor} font-semibold text-white px-2 py-1 rounded text-sm sm:text-base`}
            disabled={!roomRef.current} // Disable button if no room
          >
            Skip
          </button>
          <button
            onClick={handleLogout} // Logout button
            className="bg-red-500 font-semibold text-white px-2 py-1 rounded text-sm sm:text-base"
          >
            Logout
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-gray-600 px-2 py-1 rounded ml-1 sm:ml-2"
          >
            <i
              className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"}
            ></i>
          </button>
        </div>
      </header>

      <div className="w-full h-[90vh] flex flex-col lg:flex-row">
        <div className="videofeed w-full lg:w-7/12 h-1/2 lg:h-full flex flex-col">
          <div className="remotefeed flex-1 p-3 lg:p-5 flex justify-center items-center overflow-hidden relative">
            <video
              className="w-full h-full object-cover rounded"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            ></video>
            <div className="localfeed absolute bottom-2 right-2 w-24 h-16 lg:w-[150px] lg:h-[100px] border-2 border-white rounded overflow-hidden bg-black/50">
              <div className="you-label absolute top-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                YOU
              </div>
              <video
                className="w-full h-full object-cover"
                ref={localVideoRef}
                autoPlay
                muted
              ></video>
            </div>
          </div>
        </div>

        <div className="message-box flex-grow flex flex-col text-lg relative p-3 lg:p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h1 className="bg-gray-200 dark:bg-gray-700 p-3 lg:p-4 rounded mb-2 text-black dark:text-white text-base lg:text-xl">
            Chat
          </h1>
          <div className="messages flex-grow overflow-auto p-3 bg-zinc-200 dark:bg-gray-700 rounded text-black dark:text-white">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "You" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`bg-${
                    msg.sender === "You" ? "blue-500" : "zinc-400"
                  } text-white px-3 py-1 rounded mb-1`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Empty div for scrolling */}
          </div>
          <form onSubmit={handleMessageSend} className="mt-2 flex">
            <input
              type="text"
              ref={messageInputRef}
              className="flex-grow p-2 border rounded-l text-black"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-r"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
