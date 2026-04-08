import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Toaster } from "@shadcn/ui/components/ui/sonner"

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Toaster className={"dark"} position="bottom-right" />
  </>
)
