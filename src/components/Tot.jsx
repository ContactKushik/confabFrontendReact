import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Replace with your server URL

const TotalUsers = () => {
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    // Listen for the totalUsers event
    socket.on("totalUsers", (count) => {
      setTotalUsers(count);
    });

    // Cleanup the listener when component unmounts
    return () => {
      socket.off("totalUsers");
    };
  }, []);

  return (
    <div>
      <h3>Total Users Online: {totalUsers}</h3>
    </div>
  );
};

export default TotalUsers;
