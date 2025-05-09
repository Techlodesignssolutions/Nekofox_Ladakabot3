"use client"

import React, { useEffect, useRef } from "react"
import ChatInterface from "@/components/chat-interface"

export default function WidgetPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChatVisible, setIsChatVisible] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);

  // Function to close the widget by sending a message to the parent
  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage({ type: 'close' }, '*');
    }
  }

  // Send resize message to parent when content changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (window.parent && containerRef.current) {
        const height = containerRef.current.scrollHeight;
        window.parent.postMessage({ 
          type: 'resize', 
          height: height 
        }, '*');
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // When the avatar is clicked to open the chat
  const handleAvatarClick = () => {
    setIsChatVisible(true);
    if (window.parent) {
      window.parent.postMessage({ type: 'expand' }, '*');
    }
  };

  // In your ChatInterface component
  const toggleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    
    if (window.parent) {
      window.parent.postMessage({ 
        type: newState ? 'collapse' : 'expand'
      }, '*');
    }
  };

  return (
    <div className="widget-container" 
         ref={containerRef}
         style={{ 
           background: 'transparent',
           pointerEvents: 'none'
         }}>
      <ChatInterface 
        onClose={handleClose} 
        className="pointer-events-auto"
        isMinimized={isMinimized}
        toggleMinimize={toggleMinimize}
      />
    </div>
  )
} 