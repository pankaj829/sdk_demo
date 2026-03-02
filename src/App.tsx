import { useEffect, useRef } from 'react'
import { ConnectButton, useAbstraxnWallet, WalletModal, useExportWallet, useAuthContext } from '@abstraxn/signer-react'
import { generateP256KeyPair } from '@turnkey/crypto'

// Function to clear localStorage and IndexedDB
const clearStorageData = async () => {
  try {
    // Clear localStorage
    localStorage.clear()
    console.log('LocalStorage cleared')

    // Clear all IndexedDB databases
    if ('indexedDB' in window) {
      try {
        if ('databases' in indexedDB) {
          // Modern API to list all databases
          const databases = await indexedDB.databases()
          for (const db of databases) {
            if (db.name) {
              try {
                const deleteReq = indexedDB.deleteDatabase(db.name)
                await new Promise((resolve) => {
                  deleteReq.onsuccess = () => {
                    console.log(`IndexedDB database ${db.name} deleted`)
                    resolve(undefined)
                  }
                  deleteReq.onerror = () => {
                    console.warn(`Error deleting database ${db.name}:`, deleteReq.error)
                    resolve(undefined)
                  }
                  deleteReq.onblocked = () => {
                    console.warn(`Database ${db.name} deletion blocked`)
                    resolve(undefined)
                  }
                })
              } catch (error) {
                console.warn(`Error deleting database ${db.name}:`, error)
              }
            }
          }
          console.log('All IndexedDB databases cleared')
        } else {
          console.warn('IndexedDB.databases() API not available')
        }
      } catch (error) {
        console.warn('Error clearing IndexedDB:', error)
      }
    }
  } catch (error) {
    console.error('Error clearing storage:', error)
  }
}

function App() {
  const { isConnected } = useAbstraxnWallet()
  const { exportWallet } = useExportWallet()
  const { whoami } = useAuthContext()
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

  // Keep modal open - re-open if it closes
  useEffect(() => {
    if (!isConnected) {
      const checkAndReopen = () => {
        const dialog = document.querySelector('[role="dialog"]')
        if (!dialog && connectButtonWrapperRef.current) {
          // Modal closed, reopen it
          const button = connectButtonWrapperRef.current?.querySelector('button') as HTMLButtonElement
          if (button) {
            setTimeout(() => button.click(), 50)
          }
        }
      }

      // Check periodically if modal is still open
      const interval = setInterval(checkAndReopen, 200)
      return () => clearInterval(interval)
    }
  }, [isConnected])

  // Send message to React Native WebView when login is successful
  useEffect(() => {
    if (isConnected && window.ReactNativeWebView) {
      const webView = window.ReactNativeWebView
      const handleLoginSuccess = async () => {
        try {
          // Generate key pair
          const keyPair = await generateP256KeyPair()
          const pvtKey = keyPair.privateKey
          const publicKey = keyPair.publicKeyUncompressed
          
          // Export wallet
          const exportWalletRes = await exportWallet(publicKey, pvtKey, 'evm')
          
          // Console log the export wallet response
          console.log('Export wallet response:', exportWalletRes)
          
          // Call whoami
          const whoamiRes = whoami && typeof whoami === 'function' 
            ? await (whoami as () => Promise<any>)() 
            : whoami
          
          // Console log the whoami response
          console.log('Whoami response:', whoamiRes)
          
          // Send LOGIN_SUCCESS event with both responses
          webView.postMessage(JSON.stringify({
            event: 'LOGIN_SUCCESS',
            data: {
              exportWallet: exportWalletRes,
              whoami: whoamiRes
            }
          }))

          // Clear localStorage and IndexedDB after sending LOGIN_SUCCESS
          clearStorageData()
        } catch (error) {
          console.error('Error in login success handler:', error)
          // Still send LOGIN_SUCCESS even if something fails
          webView.postMessage(JSON.stringify({
            event: 'LOGIN_SUCCESS',
            error: error instanceof Error ? error.message : 'Unknown error'
          }))
          
          // Clear storage even on error
          clearStorageData()
        }
      }
      
      handleLoginSuccess()
    }
  }, [isConnected, exportWallet, whoami])

  // Prevent backdrop clicks from closing modals using CSS pointer-events
  useEffect(() => {
    const disableBackdropClicks = () => {
      // Find all fixed position elements that could be backdrops
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        const element = el as HTMLElement
        const style = window.getComputedStyle(element)
        
        // Check if this is a backdrop (fixed position covering the screen)
        if (style.position === 'fixed') {
          const rect = element.getBoundingClientRect()
          const isFullScreen = 
            (rect.top === 0 && rect.left === 0 && 
             rect.width >= window.innerWidth * 0.9 && 
             rect.height >= window.innerHeight * 0.9)
          
          // If it's a backdrop and contains a dialog, disable pointer events on backdrop
          const dialog = element.querySelector('[role="dialog"]') as HTMLElement | null
          if (isFullScreen && dialog && element !== dialog) {
            // Disable pointer events on backdrop, but keep them on dialog
            element.style.pointerEvents = 'none'
            dialog.style.pointerEvents = 'auto'
            // Ensure all children of dialog are clickable
            const dialogChildren = dialog.querySelectorAll('*')
            dialogChildren.forEach((child) => {
              if (child instanceof HTMLElement) {
                child.style.pointerEvents = 'auto'
              }
            })
          }
        }
      })
    }

    // Run immediately and on any DOM changes
    disableBackdropClicks()

    const observer = new MutationObserver(() => {
      disableBackdropClicks()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    })

    // Also intercept all mouse events as a fallback
    const preventBackdropEvents = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target) return

      const dialog = target.closest('[role="dialog"]')
      if (!dialog) {
        // Clicking outside dialog - check if it's on a backdrop
        const backdrop = target.closest('[style*="position: fixed"]') as HTMLElement
        if (backdrop) {
          const backdropStyle = window.getComputedStyle(backdrop)
          if (backdropStyle.position === 'fixed') {
            const rect = backdrop.getBoundingClientRect()
            const isFullScreen = 
              rect.top === 0 && rect.left === 0 && 
              rect.width >= window.innerWidth * 0.9
            
            const dialogInBackdrop = backdrop.querySelector('[role="dialog"]')
            if (isFullScreen && dialogInBackdrop && !dialogInBackdrop.contains(target)) {
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()
              return false
            }
          }
        }
      }
    }

    // Intercept all mouse events at the capture phase
    const options = { capture: true, passive: false }
    document.addEventListener('click', preventBackdropEvents, options)
    document.addEventListener('mousedown', preventBackdropEvents, options)
    document.addEventListener('mouseup', preventBackdropEvents, options)
    document.addEventListener('pointerdown', preventBackdropEvents, options)
    document.addEventListener('pointerup', preventBackdropEvents, options)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', preventBackdropEvents, options)
      document.removeEventListener('mousedown', preventBackdropEvents, options)
      document.removeEventListener('mouseup', preventBackdropEvents, options)
      document.removeEventListener('pointerdown', preventBackdropEvents, options)
      document.removeEventListener('pointerup', preventBackdropEvents, options)
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
