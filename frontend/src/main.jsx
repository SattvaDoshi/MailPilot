// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Load Razorpay script
const script = document.createElement('script');
script.src = 'https://checkout.razorpay.com/v1/checkout.js';
script.async = true;
document.head.appendChild(script);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
