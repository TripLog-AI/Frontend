import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ViewTrip from './pages/ViewTrip';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import Login from './pages/Login';
import TravelogueDetail from './pages/TravelogueDetail';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          }
        />
        <Route
          path="/trips"
          element={
            <AuthGuard>
              <MyTrips />
            </AuthGuard>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <AuthGuard>
              <ViewTrip />
            </AuthGuard>
          }
        />
        <Route
          path="/create"
          element={
            <AuthGuard>
              <CreateTrip />
            </AuthGuard>
          }
        />
        <Route
          path="/travelogues/:id"
          element={
            <AuthGuard>
              <TravelogueDetail />
            </AuthGuard>
          }
        />
        {/* 레거시 경로 호환: /trip → /trips */}
        <Route path="/trip" element={<Navigate to="/trips" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
