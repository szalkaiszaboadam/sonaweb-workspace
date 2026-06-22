'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
// A usePathname importot és használatot teljesen eltávolítottuk

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Ez a blokk mostantól csak EGYSZER fut le, a legelső megnyitáskor
    document.body.style.overflow = 'hidden'

    const duration = 1000 // 1 másodperces pörgés
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100)
      
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsLoading(false)
          document.body.style.overflow = ''
        }, 250)
      }
    }, 20)

    return () => {
      clearInterval(interval)
      // Biztonsági takarítás
      document.body.style.overflow = ''
    }
  }, []) // FIGYELEM: Az üres [] biztosítja, hogy navigáláskor ne induljon újra!

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          exit={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-[99999] flex"
        >
          {/* A háttér felosztása 5 darab függőleges oszlopra */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ y: '0%' }}
                exit={{ y: '-100%' }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.08, 
                  ease: [0.76, 0, 0.24, 1] 
                }}
                className="h-full w-1/5 bg-[#070707]"
              />
            ))}
          </div>

          {/* A százalék */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-black leading-none tracking-tighter text-white">
              {progress}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}