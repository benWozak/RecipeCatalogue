import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth } from '@clerk/clerk-react'
import reactLogo from './assets/react.svg'
import appLogo from '/favicon.svg'
import PWABadge from './PWABadge.tsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const { user } = useUser()
  const { getToken } = useAuth()
  const [jwtToken, setJwtToken] = useState<string>('')
  const [tokenCopied, setTokenCopied] = useState(false)

  const handleGetToken = async () => {
    try {
      const token = await getToken()
      if (token) {
        setJwtToken(token)
        console.log('JWT Token:', token)
      }
    } catch (error) {
      console.error('Error getting token:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jwtToken)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy token:', error)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={appLogo} className="logo" alt="RecipeCatalogue logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>RecipeCatalogue</h1>
      
      <div className="auth-section">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span>Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!</span>
            <UserButton />
          </div>
          
          {/* JWT Token Section for Development */}
          <div style={{ 
            border: '2px dashed #ccc', 
            padding: '15px', 
            borderRadius: '8px', 
            backgroundColor: '#f9f9f9',
            marginBottom: '20px',
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🔑 Development JWT Token</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button 
                onClick={handleGetToken}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Get JWT Token
              </button>
              {jwtToken && (
                <button 
                  onClick={copyToClipboard}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: tokenCopied ? '#28a745' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {tokenCopied ? 'Copied!' : 'Copy Token'}
                </button>
              )}
            </div>
            {jwtToken && (
              <div style={{ 
                backgroundColor: '#e9ecef', 
                padding: '10px', 
                borderRadius: '4px', 
                wordBreak: 'break-all',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {jwtToken}
              </div>
            )}
          </div>
        </SignedIn>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <PWABadge />
    </>
  )
}

export default App
