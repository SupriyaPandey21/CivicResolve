import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Ministries from "./pages/Ministries";
import Report from "./pages/Report";
import Analysis from "./pages/Analysis";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Navbar />

          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ministries" element={<Ministries />} />

            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analysis/:id"
              element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cases"
              element={
                <ProtectedRoute>
                  <Cases />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cases/:id"
              element={
                <ProtectedRoute>
                  <CaseDetail />
                </ProtectedRoute>
              }
            />
          </Routes>

          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;