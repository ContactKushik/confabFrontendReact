import React, { useState } from 'react'
import Chat from './components/Chat'

import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from './components/Signup';
import Login from './components/Login';
import "react-toastify/dist/ReactToastify.css";
import RefrshHandler from './RefrshHandler';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };
  return (
    <>
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route
          path="/chat"
          element={<PrivateRoute element={<Chat />} />}
        ></Route>
      </Routes>
    </>
  );
}

export default App