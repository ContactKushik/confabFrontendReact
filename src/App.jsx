import React, { useState, lazy, Suspense, useContext } from 'react';

const Chat = lazy(() => import('./components/Chat'));

import { Navigate, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import "react-toastify/dist/ReactToastify.css";
import RefrshHandler from './RefrshHandler';
import Secured from './components/Secured';
import { AuthContext } from './utils/context';

const App = () => {

  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <>
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/chat" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <PrivateRoute element={<Chat />} />
            </Suspense>
          } 
        >
        <Route path="/chat/secured" element={<Secured />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;