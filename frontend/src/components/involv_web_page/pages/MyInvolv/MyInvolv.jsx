import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Zap, Package, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

import ReserveCard from '../../components/myinvolv/ReserveCard.jsx'
import PriceDropCard from '../../components/myinvolv/PriceDropCard.jsx'
import StockChangeCard from '../../components/myinvolv/StockChangeCard.jsx'
import SkeletonCard from '../../components/myinvolv/SkeletonCard.jsx'
import { getIntent, cancelIntent as cancelIntentAPI } from '../../../../api/userApi/myinvolvApis.js'

const MyInvolv = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [reserved, setReserved] = useState([])
  const [priceDrops, setPriceDrops] = useState([])
  const [stockChanges, setStockChanges] = useState([])
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    fetchIntents()
  }, [])

  const fetchIntents = async () => {
    try {
      setIsLoading(true)
      const response = await getIntent()
      
      if (response.intents && Array.isArray(response.intents)) {
        const intents = response.intents
        setReserved(intents.filter(i => i.intentType === 'RESERVE') || [])
        setPriceDrops(intents.filter(i => i.intentType === 'PRICE_DROP') || [])
        setStockChanges(intents.filter(i => i.intentType === 'STOCK_CHANGE') || [])
      }
    } catch (err) {
      console.error('Error fetching intents:', err)
      setError(err.message)
      showToast('Failed to load your intents', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  const cancelIntent = async (intentId) => {
    try {
      await cancelIntentAPI(intentId)
      showToast('Intent cancelled successfully', 'success')
      fetchIntents()
    } catch (err) {
      console.error('Error cancelling intent:', err)
      showToast('Failed to cancel intent', 'error')
    }
  }

  const EmptyState = ({ icon: Icon, title, description }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-[#020617] p-8 md:p-12 text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-slate-800/50 p-4">
          <Icon className="h-8 w-8 text-slate-500" />
        </div>
      </div>
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </motion.div>
  )

  return (
    <div className="bg-[#020617] min-h-screen">
      {/* NAVBAR */}
      <nav className="w-full bg-[#000075] text-white shadow-lg sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="InVolv Logo"
              className="h-10 w-10 select-none"
            />
            <div className="flex flex-col items-start">
              <p className="font-bold text-xl">InVolv</p>
              <p className="text-sm font-[500]">Not So Far</p>
            </div>
          </div>

          <div className='hidden md:flex items-center gap-2'>
            <button className="p-2 rounded-lg hover:bg-white/10 transition">
              <Bell size={20} className="text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My InVolv</h1>
          <p className="text-slate-400 text-sm">Manage your reservations, price alerts, and stock watches</p>
        </div>

        {/* DESKTOP LAYOUT - Grid 3fr : 2fr */}
        <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-8">
          
          {/* LEFT SECTION - RESERVED PRODUCTS */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <Package className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Reserved Products</h2>
                <p className="text-xs text-slate-400 mt-0.5">Products you've pre-booked</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : reserved.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Reserved Products Yet"
                description="Start reserving products from stores to see them here. Your reservations will have countdown timers."
              />
            ) : (
              <div className="space-y-4">
                {reserved.map((intent, idx) => (
                  <ReserveCard 
                    key={intent._id} 
                    intent={intent} 
                    onCancel={cancelIntent}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </section>

          {/* RIGHT SECTION - SPLIT INTO TWO */}
          <div className="flex flex-col gap-8">
            
            {/* PRICE DROP ALERTS */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="rounded-lg bg-sky-500/20 p-2">
                  <TrendingDown className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Price Drop Alerts</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Products getting cheaper</p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : priceDrops.length === 0 ? (
                <EmptyState
                  icon={TrendingDown}
                  title="No Price Alerts Active"
                  description="Set price alerts to get notified when products drop in price."
                />
              ) : (
                <div className="space-y-4">
                  {priceDrops.map((intent, idx) => (
                    <PriceDropCard
                      key={intent._id}
                      intent={intent}
                      onCancel={cancelIntent}
                      index={idx}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* STOCK CHANGE ALERTS */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="rounded-lg bg-purple-500/20 p-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Stock Change Alerts</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Inventory updates tracked</p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : stockChanges.length === 0 ? (
                <EmptyState
                  icon={Zap}
                  title="No Stock Alerts Active"
                  description="Monitor stock levels and get notified when items are back in stock."
                />
              ) : (
                <div className="space-y-4">
                  {stockChanges.map((intent, idx) => (
                    <StockChangeCard
                      key={intent._id}
                      intent={intent}
                      onCancel={cancelIntent}
                      index={idx}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* MOBILE/TABLET LAYOUT - Stacked Sections with Horizontal Scroll Cards */}
        <div className="lg:hidden space-y-10">
          
          {/* RESERVED PRODUCTS SECTION */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-lg bg-emerald-500/20 p-2">
                <Package className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Reserved Products</h2>
                <p className="text-xs text-slate-400 mt-0.5">Swipe to see more</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {[1, 2].map(i => (
                  <div key={i} className="flex-shrink-0 w-72 md:w-96">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : reserved.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Reserved Products Yet"
                description="Start reserving products from stores to see them here."
              />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                {reserved.map((intent, idx) => (
                  <div key={intent._id} className="flex-shrink-0 w-72 md:w-96">
                    <ReserveCard
                      intent={intent}
                      onCancel={cancelIntent}
                      index={idx}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PRICE DROP SECTION */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-lg bg-sky-500/20 p-2">
                <TrendingDown className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Price Drop Alerts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Swipe to see more</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {[1, 2].map(i => (
                  <div key={i} className="flex-shrink-0 w-72 md:w-96">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : priceDrops.length === 0 ? (
              <EmptyState
                icon={TrendingDown}
                title="No Price Alerts Active"
                description="Set price alerts to get notified when products drop in price."
              />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                {priceDrops.map((intent, idx) => (
                  <div key={intent._id} className="flex-shrink-0 w-72 md:w-96">
                    <PriceDropCard
                      intent={intent}
                      onCancel={cancelIntent}
                      index={idx}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* STOCK CHANGE SECTION */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-lg bg-purple-500/20 p-2">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Stock Change Alerts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Swipe to see more</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {[1, 2].map(i => (
                  <div key={i} className="flex-shrink-0 w-72 md:w-96">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            ) : stockChanges.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="No Stock Alerts Active"
                description="Monitor stock levels and get notified when items are back in stock."
              />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                {stockChanges.map((intent, idx) => (
                  <div key={intent._id} className="flex-shrink-0 w-72 md:w-96">
                    <StockChangeCard
                      intent={intent}
                      onCancel={cancelIntent}
                      index={idx}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-4 right-4 z-[9999] rounded-lg border backdrop-blur-sm p-4 flex items-center gap-3
            ${toastMessage.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : ''}
            ${toastMessage.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : ''}
          `}
        >
          <span className="text-sm font-medium">{toastMessage.message}</span>
        </motion.div>
      )}
    </div>
  )
}

export default MyInvolv
