'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ShoppingBag, TrendingUp } from 'lucide-react'

export default function LiveCounter() {
  const [visitors, setVisitors] = useState(42)
  const [sales, setSales] = useState(7)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => Math.max(10, prev + Math.floor(Math.random() * 5) - 2))
      setSales(prev => prev + (Math.random() > 0.7 ? 1 : 0))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-emerald-500" />
        <AnimatePresence mode="popLayout">
          <motion.span key={visitors} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="font-medium tabular-nums">
            {visitors}
          </motion.span>
        </AnimatePresence>
        <span>online</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
        <span className="font-medium tabular-nums">{sales}</span>
        <span>vendidos hoje</span>
      </div>
    </div>
  )
}
