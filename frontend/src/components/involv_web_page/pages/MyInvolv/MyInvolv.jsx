import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'

import ReserveCard from '../../components/myinvolv/ReserveCard.jsx'

const MyInvolv = () => {
  const navigate = useNavigate()

  return (
    <div>
      <nav className="w-full bg-[#000075] text-white shadow-lg sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo + InVolv */}
          <div
            className="flex items-center gap-3 cursor-pointer"
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

          <div className='hidden md:flex items-center text-sm font-[700] gap-8'>
            <h2 className="flex items-center gap-1 text-black hover:text-emerald-400 transition"><Bell size={20} className="text-white font-semibold" /></h2>
          </div>

        </div>
      </nav>
      <ReserveCard />
    </div>
  )
}

export default MyInvolv