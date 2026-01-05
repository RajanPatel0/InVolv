const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-[#F5F7FB]"></div>
        <div className="h-16 w-16 rounded-full border-4 border-t-[#1D44B5] border-r-transparent border-b-transparent border-l-transparent absolute top-0 animate-spin"></div>
      </div>
      <p className="text-[#1D44B5] font-semibold animate-pulse">Loading profile...</p>
    </div>
  );
};

export default LoadingSpinner;