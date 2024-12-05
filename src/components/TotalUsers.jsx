import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

const TotalUsers = () => {
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    // Listen for the totalUsers event
    const handleTotalUsers = (count) => {
      if (count !== totalUsers) {
        setTotalUsers(count);
      }
    };

    socket.on("totalUsers", handleTotalUsers);

    // Cleanup the listener when component unmounts
    return () => {
      socket.off("totalUsers");
    };
  }, []);

  return (
    <div>
      <h3 className="text-sm sm:text-base font-bold">{totalUsers}</h3>
    </div>
  );
};

export default TotalUsers;
