import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import adapter from "webrtc-adapter";
const socket = io("http://localhost:3000"); // Ensure your server is running on port 3000

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [messages, setMessages] = useState([]);
  const messageInputRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localFeedRef = useRef(null);

  let peerConnection;
  let dataChannel;
  let room;

  useEffect(() => {
    // Theme toggle logic
    const body = document.body;
    body.classList.add(theme);

    return () => {
      body.classList.remove(theme);
    };
  }, [theme]);

  useEffect(() => {
    socket.on("totalUsers", (count) => {
      setOnlineUsers(count);
    });

    socket.emit("joinroom");

    socket.on("joined", (roomname) => {
      room = roomname;
      console.log("Connected to room:", roomname);
      initialize();
    });

    socket.on("signalingMessage", (message) => {
      handleSignalingMessage(JSON.parse(message));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  const createPeerConnection = (stream) => {
    peerConnection = new RTCPeerConnection({
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
      dataChannel = event.channel;
      setupDataChannel();
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signalingMessage", {
          room,
          message: JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
          }),
        });
      }
    };

    dataChannel = peerConnection.createDataChannel("chat");
    setupDataChannel();
  };

  const setupDataChannel = () => {
    dataChannel.onmessage = (event) => {
      setMessages((prev) => [...prev, { sender: "Remote", text: event.data }]);
    };
  };

  const initiateOffer = async () => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("signalingMessage", {
        room,
        message: JSON.stringify({ type: "offer", offer }),
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleSignalingMessage = async (message) => {
    const { type, offer, answer, candidate } = message;

    if (type === "offer") {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("signalingMessage", {
        room,
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
    if (message && dataChannel.readyState === "open") {
      dataChannel.send(message);
      setMessages((prev) => [...prev, { sender: "You", text: message }]);
      messageInputRef.current.value = "";
    }
  };

  return (
    <div className="dark bg-gray-900 text-gray-100 h-screen">
      <header className="flex justify-between items-center py-2 px-5 bg-gray-800 text-white text-xl">
        <h1 className="font-bold text-lg sm:text-xl">CONFAB</h1>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <i className="ri-group-line"></i>
            <span className="font-bold text-center">{onlineUsers}</span>
            <span>online</span>
          </div>
          <button
            onClick={() => socket.emit("skip", room)}
            className="bg-red-500 font-semibold text-white px-2 py-1 rounded text-sm sm:text-base"
          >
            Skip
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
            <div
              className="localfeed absolute bottom-2 right-2 w-24 h-16 lg:w-[150px] lg:h-[100px] border-2 border-white rounded overflow-hidden bg-black/50"
              ref={localFeedRef}
            >
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
          <div className="messages flex-grow overflow-auto p-3 bg-white dark:bg-gray-700 rounded text-black dark:text-white">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 my-1 rounded-md ${
                  msg.sender === "You"
                    ? "bg-blue-300 text-right"
                    : "bg-zinc-300 text-left"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleMessageSend} className="flex mt-4">
            <input
              type="text"
              ref={messageInputRef}
              className="flex-grow px-2 py-1 border rounded bg-white text-gray-800 dark:bg-gray-600 dark:text-white text-sm lg:text-base"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 px-3 lg:px-4 py-1 text-white hover:bg-blue-400 rounded text-sm lg:text-base ml-2"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
