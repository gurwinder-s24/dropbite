import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import "leaflet/dist/leaflet.css";

export const authService = import.meta.env.VITE_AUTH_SERVICE;
export const outletService = import.meta.env.VITE_OUTLET_SERVICE;
export const utilsService = import.meta.env.VITE_UTILS_SERVICE;
export const riderService = import.meta.env.VITE_RIDER_SERVICE;
export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE;
export const adminService = import.meta.env.VITE_ADMIN_SERVICE;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppProvider>
        <SocketProvider>
          <App />
          <Toaster />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
