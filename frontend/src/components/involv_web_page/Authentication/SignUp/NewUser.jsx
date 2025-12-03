import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function NewUser() {
    const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#000075]">

      {/* Navbar added exactly as you gave */}
      <nav className="w-full bg-[#000075] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo + InVolv */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={()=> navigate("/")}>
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

        </div>
      </nav>

      {/* Page container */}
      <div className="flex items-center justify-center px-4 py-10">

        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200">

          <h1 className="text-2xl md:text-3xl font-bold text-center text-[#0F172A]">
            New User Registration
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 mt-2">
            Get InVolved and choose your registration path
          </p>

          <div className="mt-8 space-y-6">

            {/* --- Create Account Card --- */}
            <div className="border rounded-2xl p-6 hover:shadow-lg hover:border-[#7E88E4] hover:bg-[#EAEDFB] transition cursor-pointer"
            onClick={()=> navigate("/userSignUp")}>  
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-[#0F172A]">
                    Create Account
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Register And Explore This New Market
                  </p>

                  <p className="text-[#3B82F6] mt-3 inline-block font-medium">
                    Continue with Email or Phone
                  </p>
                </div>

                <span className="text-2xl text-gray-400">→</span>
              </div>
            </div>

            {/* --- Get Reference Code Card --- */}
            <div className="border rounded-2xl p-6 hover:border-[#7E88E4] hover:bg-[#EAEDFB] hover:shadow-lg transition cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-[#0F172A]">
                    Start As Store
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Don't have a Vendor Account? Register As Business
                  </p>

                  <p className="text-[#3B82F6] mt-3 inline-block font-medium">
                    Proceed To Store Setup
                  </p>
                </div>

                <span className="text-2xl text-gray-400">→</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
