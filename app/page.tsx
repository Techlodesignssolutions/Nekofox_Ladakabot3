"use client"

import { useState, useRef, useEffect } from "react"
import ChatInterface from "@/components/chat-interface"
import Avatar from "@/components/avatar"
import { motion } from "framer-motion"

export default function Home() {
  const [isChatVisible, setIsChatVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to close the widget by sending a message to the parent
  const handleClose = () => {
    setIsChatVisible(false)
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({ type: 'close' }, '*')
    }
  }

  // Send resize message to parent when content changes
  useEffect(() => {
    // Check if we're in an iframe
    const isInIframe = window !== window.parent
    if (!isInIframe) return

    const resizeObserver = new ResizeObserver(entries => {
      if (window.parent && containerRef.current) {
        const height = containerRef.current.scrollHeight
        window.parent.postMessage({ 
          type: 'resize', 
          height: height 
        }, '*')
      }
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  const handleOpen = () => {
    setIsChatVisible(true)
    // Send expand message if in iframe
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({ type: 'expand' }, '*')
    }
  }

  const toggleMinimize = () => {
    const newState = !isMinimized
    setIsMinimized(newState)
    
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({ 
        type: newState ? 'collapse' : 'expand'
      }, '*')
    }
  }

  return (
    <main className="min-h-screen" ref={containerRef}>
      {isChatVisible ? (
        <ChatInterface 
          onClose={handleClose} 
          isMinimized={isMinimized}
          toggleMinimize={toggleMinimize}
        />
      ) : (
        <div className="fixed bottom-4 right-4 z-50">
          <Avatar onClick={handleOpen} />
        </div>
      )}
    </main>
  )
}
