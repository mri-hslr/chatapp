import { useState, useEffect, useRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatApp from './ChatApp'
import { WebSocketServer } from 'ws'
export default function App() {
  const wss=useRef()
  const [messages,setMessage]=useState([]);
  useEffect(()=>{
    const ws=new WebSocket('wss://chatapp-l37m.onrender.com')
    wss.current=ws;
    ws.onmessage=(e)=>{
      setMessage((messages)=>[...messages,e.data])
    }
  },[])
  
  return (
    <div>
      <ChatApp></ChatApp>
    </div>
  )
}


