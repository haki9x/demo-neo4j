// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './containers/AdminLayout';
import ViewLayout from './containers/ViewLayout';

function App() {
  return (
    <div className='containers'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="/view" element={<ViewLayout />} />
        </Routes>
      </BrowserRouter>
      </div>
      );
}

      export default App;