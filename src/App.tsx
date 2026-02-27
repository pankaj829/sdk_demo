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
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      // Find the dialog element
      const dialog = target.closest('[role="dialog"]')
      
      // If clicking outside any dialog, prevent the event
      if (!dialog) {
        // Check if this is a backdrop click (clicking on a fixed overlay)
        const isFixedOverlay = 
          target.style.position === 'fixed' ||
          target.closest('[style*="position: fixed"]')
        
        if (isFixedOverlay) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }
      } else {
        // If clicking inside dialog, check if it's on the backdrop area
        // The dialog might have a backdrop as a direct child
        const clickedElement = target
        const isBackdropArea = 
          clickedElement === dialog.parentElement ||
          (clickedElement.style.position === 'fixed' && 
           clickedElement !== dialog &&
           !dialog.contains(clickedElement))
        
        if (isBackdropArea) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }
      }
    }

    // Use capture phase with high priority to intercept before SDK handlers
    const options = { capture: true, passive: false }
    document.addEventListener('click', handleClick, options)
    document.addEventListener('mousedown', handleClick, options)
    document.addEventListener('mouseup', handleClick, options)

    // Also use MutationObserver to watch for modal elements and add listeners directly
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            // Check if this is a modal backdrop
            if (element.style.position === 'fixed' && 
                (element.style.inset === '0px' || 
                 (element.style.top === '0px' && element.style.left === '0px'))) {
              // Add click prevention directly to the backdrop
              element.addEventListener('click', (e) => {
                const dialog = element.querySelector('[role="dialog"]')
                if (!dialog || !dialog.contains(e.target as Node)) {
                  e.preventDefault()
                  e.stopPropagation()
                  e.stopImmediatePropagation()
                }
              }, { capture: true })
            }
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      document.removeEventListener('click', handleClick, options)
      document.removeEventListener('mousedown', handleClick, options)
      document.removeEventListener('mouseup', handleClick, options)
      observer.disconnect()
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
