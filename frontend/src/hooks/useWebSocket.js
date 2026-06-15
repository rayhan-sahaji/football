import { useEffect, useRef, useState, useCallback } from 'react'
import { getWsUrl } from '../config'

export default function useWebSocket() {
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(getWsUrl())
      wsRef.current = ws

      ws.onopen = () => setConnected(true)
      ws.onclose = () => {
        setConnected(false)
        reconnectTimer.current = setTimeout(connect, 2000)
      }
      ws.onerror = () => {}
      ws.onmessage = (e) => {
        try {
          setLastMessage(JSON.parse(e.data))
        } catch { /* ignore */ }
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { connected, lastMessage, send }
}
