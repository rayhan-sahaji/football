import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = function(msg, url, line, col, error) {
  document.getElementById('root').innerHTML = '<div style="padding:20px;color:red;background:#000;font-family:monospace;white-space:pre-wrap;">' + msg + '\n' + (error && error.stack || '') + '</div>'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
