import { useEffect, useRef } from 'react'
import { ConnectButton, useAbstraxnWallet, WalletModal } from '@abstraxn/signer-react'

function App() {
  const { isConnected } = useAbstraxnWallet()
  const connectButtonWrapperRef = useRef<HTMLDivElement>(null)

  // Auto-open ConnectButton modal on mount when not connected
  useEffect(() => {
    if (!isConnected && connectButtonWrapperRef.current) {
      // Find the ConnectButton inside the wrapper and click it
      const timer = setTimeout(() => {
        const button = connectButtonWrapperRef.current?.querySelector('button') as HTMLButtonElement
        if (button) {
          button.click()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  return (
    <div className="app">
      {!isConnected && (
        <div ref={connectButtonWrapperRef} style={{ display: 'none' }}>
          <ConnectButton
            connectText="Connect Wallet"
            disableDefaultStyles
            className="btn btn-primary"
          />
        </div>
      )}

      {isConnected && (
        <WalletModal
          isOpen={true}
          onClose={() => {}}
        />
      )}
    </div>
  )
}

export default App
