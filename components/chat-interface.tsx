"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Send, Loader2, ChevronUp, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface ChatInterfaceProps {
  onClose: () => void
}

// Demo message type to mimic the AI SDK's message format
interface Message {
  id: string
  content: string
  role: "user" | "assistant"
}

// Helper to convert URLs to links
const linkify = (text: string) => {
  // First convert HTML anchor tags to plain URLs
  const cleanText = text.replace(/<a href="([^"]+)"[^>]*>[^<]*<\/a>/g, '$1')
  
  // Replace markdown links with just the URL
  const markdownCleaned = cleanText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2')
  
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return markdownCleaned.split(urlRegex).map((part, i) => 
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" 
         className="text-blue-400 hover:underline">
        {part}
      </a>
    ) : part
  )
}

// Animated message chunk
const MessageChunk = ({ content, delay }: { content: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="mb-2"
  >
    {linkify(content)}
  </motion.div>
)

// Update the message rendering
const renderMessage = (content: string, isUser: boolean) => {
  const chunks = content.split('\n\n')
  return chunks.map((chunk, i) => (
    <div
      key={i}
      className={`px-4 py-2 rounded-lg mb-2 ${
        isUser ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <MessageChunk content={chunk} delay={i * 0.5} />
    </div>
  ))
}

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const messageIdCounter = useRef(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Demo responses
  const demoResponses = [
    "This is a demo frontend for the LADAKA chatbot. In the real version, I'll be powered by AI to answer your questions about our design studio. 👋",
    "I'm just a demo right now, but the real LADAKA will be able to provide detailed information about our services, pricing, and portfolio. 👋",
    "When fully implemented, I'll be able to help with inquiries about design services, project timelines, and booking consultations. 👋",
    "Thanks for trying out this demo! The complete version will have much more functionality and real-time responses. 👋",
    "In the full version, I'll be able to showcase our portfolio examples and discuss your specific project needs. 👋",
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessageId = `user-${messageIdCounter.current}`
    messageIdCounter.current += 1

    const userMessage: Message = {
      id: userMessageId,
      content: input,
      role: "user",
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      })

      const data = await response.json()
      console.log('API response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessageId = `assistant-${messageIdCounter.current}`
      messageIdCounter.current += 1
      
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: data.content || data.output || data.response || data.message || data.text || "Sorry, I couldn't process that request.",
        role: "assistant",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: `error-${messageIdCounter.current}`,
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        role: "assistant"
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-x-0 bottom-0 z-50 
                 w-[100%] sm:w-[400px] md:w-[450px]
                 sm:right-8 sm:left-auto
                 m-0 sm:m-4"
    >
      <Card className="overflow-hidden shadow-xl border-t sm:border border-orange-200 rounded-none sm:rounded-lg">
        {/* Header */}
        <div className="bg-orange-600 text-white p-3 sm:p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-orange-300">
              <Image
                src="/Ladaka Chatbot.jpeg"
                alt="Chatbot Avatar"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <span className="font-medium text-base sm:text-lg">LADAKA</span>
          </div>
          <div className="flex space-x-2">
            <button onClick={toggleMinimize} className="text-white hover:text-orange-200 p-1">
              {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <button onClick={onClose} className="text-white hover:text-orange-200">
              <X size={20} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat area */}
            <div className="h-[60vh] sm:h-96 overflow-y-auto p-4 bg-white">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-700">
                  <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-2 border-orange-400">
                    <Image
                      src="/Ladaka Chatbot.jpeg"
                      alt="LADAKA Avatar"
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                  <p className="text-lg font-medium text-orange-800 mb-2">Hey there, I am LADAKA 👋</p>
                  <p className="max-w-xs">
                    I'm ready to answer any questions you may have related to my Design Studio and services!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role !== "user" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                          <Image
                            src="/Ladaka Chatbot.jpeg"
                            alt="LADAKA Avatar"
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                        {renderMessage(message.content, message.role === "user")}
                      </div>
                    </div>
                  ))}

                  {/* Loading animation when waiting for response */}
                  {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                    <div className="mb-4 flex justify-start">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                        <Image
                          src="/Ladaka Chatbot.jpeg"
                          alt="LADAKA Avatar"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="px-4 py-3 rounded-lg bg-gray-100 flex items-center">
                        <div className="typing-animation">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask your questions here!"
                  className="flex-grow border-orange-200 focus:border-orange-500 text-base"
                  style={{ fontSize: '16px' }}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-orange-600 hover:bg-orange-700 px-3 sm:px-4"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>

            {/* Footer with logo and credit */}
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col items-center text-center">
                <p className="text-xs text-gray-500 mb-1">Designed by Techlo Design Solutions</p>

                <Link
                  href="https://techlodesignsolutions.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center hover:opacity-90 transition-opacity"
                >
                  <div className="w-8 h-8 mb-1">
                    <Image
                      src="/images/techlo-logo.png"
                      alt="Techlo Design Solutions Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-xs text-orange-600 group-hover:underline">Want your own chat assistant?</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* CSS for typing animation */}
      <style jsx global>{`
        .typing-animation {
          display: flex;
          align-items: center;
        }
        
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #666;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </motion.div>
  )
}