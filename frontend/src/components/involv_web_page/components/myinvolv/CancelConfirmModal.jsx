import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Trash2 } from 'lucide-react'

export default function CancelConfirmModal({ show, type, productName, onConfirm, onCancel }) {
  const messages = {
    RESERVE: {
      title: 'Cancel Reservation?',
      message: `Are you sure you want to cancel the reservation for "${productName}"? This action cannot be undone.`,
      color: 'emerald'
    },
    PRICE_DROP: {
      title: 'Remove Price Alert?',
      message: `You'll stop receiving price alerts for "${productName}". You can create a new alert anytime.`,
      color: 'sky'
    },
    STOCK_CHANGE: {
      title: 'Remove Stock Alert?',
      message: `You'll stop receiving stock updates for "${productName}". You can create a new alert anytime.`,
      color: 'purple'
    }
  }

  const config = messages[type] || messages.RESERVE
  const colorClasses = {
    emerald: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/40 text-emerald-300',
    sky: 'from-sky-600/20 to-sky-800/10 border-sky-500/40 text-sky-300',
    purple: 'from-purple-600/20 to-purple-800/10 border-purple-500/40 text-purple-300'
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl border bg-gradient-to-br from-slate-900 to-[#020617] p-6 max-w-sm w-full shadow-2xl ${colorClasses[config.color]}`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-${config.color}-500/20`}>
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {config.title}
                </h3>
                <p className="text-sm text-slate-300">
                  {config.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-lg border border-slate-600 text-slate-300 py-2.5 font-medium transition hover:bg-slate-800/50 active:scale-[0.98]"
              >
                Keep It
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-lg text-white py-2.5 font-medium transition active:scale-[0.98]
                  ${config.color === 'emerald' ? 'bg-red-500 hover:bg-red-600' : ''}
                  ${config.color === 'sky' ? 'bg-red-500 hover:bg-red-600' : ''}
                  ${config.color === 'purple' ? 'bg-red-500 hover:bg-red-600' : ''}
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
