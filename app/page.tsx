"use client"

import { useState } from "react"
import ChatInterface from "@/components/chat-interface"
import Avatar from "@/components/avatar"

export default function Home() {
  const [isChatVisible, setIsChatVisible] = useState(false)

  const handleClose = () => {
    setIsChatVisible(false)
  }

  const handleOpen = () => {
    setIsChatVisible(true)
  }

  return (
    <main className="min-h-screen">
      {isChatVisible ? (
        <ChatInterface onClose={handleClose} />
      ) : (
        <div className="fixed bottom-4 right-4 z-50">
          <Avatar onClick={handleOpen} />
        </div>
      )}
    </main>
  )
}
