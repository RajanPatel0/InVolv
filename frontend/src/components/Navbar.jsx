import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-[#000075] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo + InVolv */}
        <div className="flex items-center gap-3">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center text-sm font-[700] gap-8">
          <Link to="/" className="hover:text-yellow-300 transition">Home</Link>
          <Link to="/search" className="hover:text-yellow-300 transition">Search</Link>
          <Link to="/myinvolv" className="hover:text-yellow-300 transition">My InVolv</Link>

          {/* Login Button */}
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-[500] border border-white rounded-lg hover:bg-white hover:text-[#000075] transition"
          >
            Login
          </Link>

          {/* Register Button */}
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-[500] rounded-lg border text-[#000075] border-[#000075] bg-white hover:bg-[#000075] hover:text-white hover:border-white transition"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-3xl"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col gap-4 bg-[#000075] px-4 pb-4 text-white font-[500]">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/search" onClick={() => setOpen(false)}>Search</Link>
          <Link to="/myinvolv" onClick={() => setOpen(false)}>My InVolv</Link>

          <Link
            to="/login"
            className="px-3 py-2 text-[#000075] border border-white bg-white rounded-lg text-center"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-3 py-2 border border-white rounded-lg bg-[#000075] text-center"
            onClick={() => setOpen(false)}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
