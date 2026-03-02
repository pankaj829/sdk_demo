import React from 'react'
import ReactDOM from 'react-dom/client'
import { AbstraxnProvider } from '@abstraxn/signer-react'
import App from './App.tsx'
import './App.css'

const apiKey = import.meta.env.VITE_ABSTRAXN_API_KEY as string | undefined

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {apiKey ? (
      <AbstraxnProvider
        config={{
          apiKey,
          authMethods: ["otp", "passkey", "google", "twitter", "discord"],
          ui: {
            modal: true,
            onboardTitle: 'Sign In',
          },
        }}
      >
        <App />
      </AbstraxnProvider>
    ) : (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h2 style={{ marginBottom: 8 }}>Missing API key</h2>
        <p style={{ marginBottom: 8 }}>
          Set <code>VITE_ABSTRAXN_API_KEY</code> in a <code>.env</code> file, then restart the dev
          server.
        </p>
        <p>
          Example: <code>VITE_ABSTRAXN_API_KEY=your_key_here</code>
        </p>
      </div>
    )}
  </React.StrictMode>,
)
