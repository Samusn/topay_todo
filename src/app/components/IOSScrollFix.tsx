"use client"

import { useEffect } from "react"

export default function IOSScrollFix() {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    if (!isIOS) return

    let startY = 0
    let isAtTop = false
    let isAtBottom = false

    const checkScrollPosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      isAtTop = scrollTop <= 0
      isAtBottom = scrollTop + windowHeight >= documentHeight - 1
    }

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      checkScrollPosition()
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return
      
      const currentY = e.touches[0].clientY
      const deltaY = currentY - startY

      checkScrollPosition()

      if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return null
}

