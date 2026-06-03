import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
const InternDashboard = lazy(() => import('./pages/InternDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Loading...</div>
  </div>
);
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/intern/dashboard" 
              element={
                <ProtectedRoute requiredRole="intern">
                  <Suspense fallback={<LoadingFallback />}>
                    <InternDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:userId" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <Profile />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/unauthorized" 
              element={
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <h1>Unauthorized Access</h1>
                  <p>You don't have permission to view this page.</p>
                </div>
              } 
            />
          </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;