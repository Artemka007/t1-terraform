import React from 'react'
import { Header } from './Header'
import { Navigation } from './Navigation'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}