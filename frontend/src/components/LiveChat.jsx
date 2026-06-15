import { useState, useEffect, useRef } from 'react'

export default function LiveChat({ ws }) {
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState(() => localStorage.getItem('chat_username') || '')
  const [message, setMessage] = useState('')
  const [nameSet, setNameSet] = useState(() => !!localStorage.getItem('chat_username'))
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!ws.lastMessage) return
    const msg = ws.lastMessage

    if (msg.type === 'chat') {
      setMessages(prev => [...prev.slice(-99), {
        id: msg.id,
        username: msg.username,
        message: msg.message,
        timestamp: msg.timestamp,
      }])
    } else if (msg.type === 'chat_clear') {
      setMessages([])
    }
  }, [ws.lastMessage])

  const setUsernameAndSave = () => {
    if (username.trim().length < 2) return
    localStorage.setItem('chat_username', username.trim())
    setNameSet(true)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    ws.send({ type: 'chat', username, message: message.trim() })
    setMessage('')
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col h-[500px]">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Live Chat
        </h3>
        <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Active
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-8">
            No messages yet. Say something!
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group">
            <div className="flex items-baseline gap-2">
              <span className="text-green-400 font-semibold text-sm">{msg.username}</span>
              <span className="text-gray-600 text-xs">{formatTime(msg.timestamp)}</span>
            </div>
            <p className="text-gray-300 text-sm mt-0.5 break-words">{msg.message}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-3">
        {!nameSet ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setUsernameAndSave()}
              placeholder="Enter your name..."
              maxLength={20}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <button
              onClick={setUsernameAndSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Join
            </button>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
