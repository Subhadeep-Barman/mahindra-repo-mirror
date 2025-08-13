import React, { useState, useEffect } from "react";
import darkLogo from "../assets/mai_dark.png";
import lightLogo from "../assets/mai_light.png";
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
        className="absolute inset-0 w-full h-full object-fill z-0"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: '100vw', height: '100vh', left: 0, top: 0 }}
      >
        <source src={vid1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dynamic Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10 transition-all duration-1000"

      />
      
      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-lg transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Main Card */}
          <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border-2 border-red-500/30 rounded-3xl shadow-2xl p-12 text-center transform transition-all duration-500 hover:scale-105 hover:border-red-400/50 group">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-red-600/5 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50"></div>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-red-500/10 blur-xl group-hover:bg-red-500/20 transition-all duration-500 -z-10"></div>
            
            {/* Logo Section */}
            <div className="relative mb-10">
              <div className="relative inline-block">
                <img
                  src={darkLogo}
                  alt="MAI Logo"
                  width={140}
                  height={70}
                  className="mx-auto mb-6 filter drop-shadow-2xl transform transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 rounded-full blur-lg animate-pulse"></div>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto rounded-full animate-pulse"></div>
            </div>
            
            {/* Title Section */}
            <div className="mb-12 relative">
              <h1 className="text-6xl font-black bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent mb-6 tracking-wider transform transition-all duration-700 hover:scale-110 relative">
                DBMRS
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 blur-2xl -z-10"></div>
              </h1>
              {/* <h2 className="text-2xl font-light text-white/90 mb-6 tracking-widest uppercase">
                Testing Portal
              </h2> */}
              <div className="relative">
                <p className="text-white/70 text-lg font-light leading-relaxed">
                  VTC & RDE LAB VEHICLE TESTING PORTAL
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent"></div>
              </div>
            </div>
            
            {/* Login Button */}
            <div className="space-y-8">
              <div className="relative">
                <button
                  onClick={handleSubmit}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative w-full py-5 px-10 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-400 hover:to-red-500 rounded-2xl text-white font-bold text-xl tracking-widest shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/25 hover:shadow-2xl overflow-hidden uppercase"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <span>SSO Login</span>
                    {/* <div className={`w-2 h-2 bg-white rounded-full transition-all duration-300 ${isHovered ? 'animate-ping' : ''}`}></div> */}
                  </span>
                  {/* <div className={`absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent transform transition-transform duration-500 ${isHovered ? 'translate-x-0' : '-translate-x-full'}`}></div> */}
                  {/* <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 animate-pulse"></div> */}
                </button>
                {/* Button Glow */}
                <div className="absolute inset-0 bg-red-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-red-500/30 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-transparent via-red-500/30 to-transparent animate-pulse delay-1500"></div>
      </div>
      
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-red-500/50 z-30"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-red-500/50 z-30"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-red-500/50 z-30"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-red-500/50 z-30"></div> */}
    {/* Version label at bottom left */}
    <div className="absolute left-4 bottom-4 z-50 text-lg text-white bg-black/40 px-4 py-2 rounded-lg shadow-lg pointer-events-none select-none font-bold">
      Version 1.2.0
    </div>
  </div>
  );
}

export default Login;
