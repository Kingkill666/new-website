"use client"

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react"
import sdk, { type FrameContext } from "@farcaster/frame-sdk"

interface FarcasterContextType {
  isSDKLoaded: boolean
  isInFrame: boolean
  context: FrameContext | null
  // Actions
  openUrl: (url: string) => Promise<void>
  close: () => Promise<void>
}

const FarcasterContext = createContext<FarcasterContextType>({
  isSDKLoaded: false,
  isInFrame: false,
  context: null,
  openUrl: async () => {},
  close: async () => {},
})

export function useFarcaster() {
  return useContext(FarcasterContext)
}

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isInFrame, setIsInFrame] = useState(false)
  const [context, setContext] = useState<FrameContext | null>(null)

  useEffect(() => {
    const initSDK = async () => {
      try {
        // Get the frame context
        const ctx = await sdk.context
        setContext(ctx)
        setIsInFrame(true)

        // Signal to Farcaster that the frame is ready
        sdk.actions.ready()

        console.log("Farcaster Mini App initialized", ctx)
      } catch (error) {
        console.log("Not in Farcaster frame:", error)
        setIsInFrame(false)
      } finally {
        setIsSDKLoaded(true)
      }
    }

    initSDK()
  }, [])

  const openUrl = useCallback(async (url: string) => {
    if (isInFrame) {
      await sdk.actions.openUrl(url)
    } else {
      window.open(url, "_blank")
    }
  }, [isInFrame])

  const close = useCallback(async () => {
    if (isInFrame) {
      await sdk.actions.close()
    }
  }, [isInFrame])

  return (
    <FarcasterContext.Provider value={{ isSDKLoaded, isInFrame, context, openUrl, close }}>
      {children}
    </FarcasterContext.Provider>
  )
}
