'use client'

import React, { createContext, useContext, useState } from 'react'

interface InteractionContextType {
  hasUserInteracted: boolean
  setHasUserInteracted: (value: boolean) => void
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined)

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  return (
    <InteractionContext.Provider value={{ hasUserInteracted, setHasUserInteracted }}>
      {children}
    </InteractionContext.Provider>
  )
}

export function useInteraction() {
  const context = useContext(InteractionContext)
  if (context === undefined) {
    throw new Error('useInteraction must be used within an InteractionProvider')
  }
  return context
}