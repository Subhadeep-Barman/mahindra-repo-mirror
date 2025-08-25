import React, { useState, useEffect } from "react";
import darkLogo from "../assets/mai_dark.png";
import vid1 from "../assets/vid1.mp4";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e) => {
    window.location.href = import.meta.env.VITE_AUTH_SUCCESS_URL;
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Background Video */}
      <video
        className="fixed top-0 left-0 w-screen h-screen object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={vid1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dynamic Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10 transition-all duration-1000"

      />
      
      {/* MAI Logo at top left */}
      <div className="fixed top-6 left-8 z-30">
        <img
          src={darkLogo}
          alt="MAI Logo"
          width={120}
          height={60}
          className="drop-shadow-2xl transition-transform duration-500 hover:scale-110"
        />
      </div>
      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className={`w-full max-w-lg transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} font-sans`}> 
          {/* Main Card - Enhanced Glassmorphism */}
          <div
            className="relative rounded-2xl shadow-2xl p-10 text-center border font-sans"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.10) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '2px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 32px 0 rgba(255, 0, 0, 0.25), 0 1.5px 12px 0 rgba(255,0,0,0.12), inset 0 1px 8px 0 rgba(255,255,255,0.12)'
            }}
          >
            {/* Logo Section Removed (now at top left) */}
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight font-zen-dots drop-shadow uppercase">DBMRS</h1>
              <p className="text-gray-200 text-base font-normal leading-relaxed font-sans">
                VTC & RDE LAB VEHICLE TESTING PORTAL
              </p>
            </div>
            {/* Login Button - Modern style */}
            <div className="space-y-8">
              <div className="relative">
                <button
                  onClick={handleSubmit}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative max-w-xs mx-auto py-3 px-6 bg-red-700 hover:bg-red-800 rounded-2xl text-white font-extrabold text-xl tracking-widest shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/25 hover:shadow-2xl overflow-hidden uppercase font-sans"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <span>SSO Login</span>
                  </span>
                </button>
                {/* Button Glow */}
                <div className="absolute inset-0 bg-red-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    <div className="absolute right-4 top-9 z-50 text-xl text-white pointer-events-none select-none font-bold drop-shadow-lg font-mono">
      Version 1.3.0
    </div>
  </div>
  );
}

export default Login;
