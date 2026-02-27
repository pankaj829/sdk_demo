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

  // Prevent backdrop clicks from closing modals
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      // Check if the click target is a backdrop/overlay element
      // Look for fixed positioned divs that cover the screen (typical modal backdrop pattern)
      const isBackdrop = 
        target.style.position === 'fixed' &&
        (target.style.inset === '0px' || 
         (target.style.top === '0px' && target.style.left === '0px' && 
          target.style.right === '0px' && target.style.bottom === '0px')) &&
        !target.closest('[role="dialog"]') && // Not inside dialog content
        target.getAttribute('role') !== 'dialog' // Not the dialog itself

      // Also check for common backdrop class names
      const hasBackdropClass = target.classList.contains('backdrop') ||
                               target.classList.contains('overlay') ||
                               target.classList.contains('modal-backdrop') ||
                               target.getAttribute('data-backdrop') === 'true'

      if (isBackdrop || hasBackdropClass) {
        // Check if click is actually on backdrop, not on modal content
        const dialog = target.closest('[role="dialog"]')
        if (!dialog || dialog === target) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }
      }
    }

    // Use capture phase to intercept before SDK handlers
    document.addEventListener('click', handleBackdropClick, true)
    document.addEventListener('mousedown', handleBackdropClick, true)

    return () => {
      document.removeEventListener('click', handleBackdropClick, true)
      document.removeEventListener('mousedown', handleBackdropClick, true)
    }
  }, [])

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
