"use client"

import React, { useEffect, useRef } from "react"
import ChatInterface from "@/components/chat-interface"

export default function WidgetPage() {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="widget-container" ref={containerRef}>
      <ChatInterface onClose={handleClose} />
    </div>
  )
} 