import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

export const FALLBACK_GOOGLE_CLIENT_ID =
  '653190114830-1959434525nsk75urdun507fac99s6mk.apps.googleusercontent.com';

// Ensure the new client ID is set in localStorage immediately
try {
  const current = localStorage.getItem('meso_google_client_id');
  if (!current || current !== FALLBACK_GOOGLE_CLIENT_ID) {
    localStorage.setItem('meso_google_client_id', FALLBACK_GOOGLE_CLIENT_ID);
  }
} catch (e) {
  // ignore
}

export function getActiveGoogleClientId(): string {
  try {
    const saved = localStorage.getItem('meso_google_client_id');
    if (saved && saved.trim() && !saved.includes('eiav5slb9hoidpn9b125u40pot8ej357')) {
      return saved.trim();
    }
  } catch (e) {
    // localStorage may be unavailable
  }
  return FALLBACK_GOOGLE_CLIENT_ID;
}

export function setActiveGoogleClientId(newClientId: string): void {
  try {
    if (newClientId && newClientId.trim()) {
      localStorage.setItem('meso_google_client_id', newClientId.trim());
    } else {
      localStorage.removeItem('meso_google_client_id');
    }
  } catch (e) {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('meso:google_client_id_updated', { detail: newClientId }));
}

const RootApp: React.FC = () => {
  const [clientId, setClientId] = useState<string>(getActiveGoogleClientId());

  useEffect(() => {
    const handleUpdate = () => {
      setClientId(getActiveGoogleClientId());
    };
    window.addEventListener('meso:google_client_id_updated', handleUpdate);
    return () => {
      window.removeEventListener('meso:google_client_id_updated', handleUpdate);
    };
  }, []);

  return (
    <GoogleOAuthProvider key={clientId} clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  );
};

createRoot(document.getElementById('root')!).render(<RootApp />);
