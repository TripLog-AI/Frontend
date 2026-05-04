import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ViewTrip from './pages/ViewTrip';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 주소(localhost:5173/)로 들어오면 Home 화면을 보여줍니다 */}
        <Route path="/" element={<Home />} />
        
        {/* /trip 주소로 들어오면 방금 만든 상세 화면을 보여줍니다 */}
        <Route path="/trip" element={<ViewTrip />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/create" element={<CreateTrip />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;