import React, { useState, useEffect } from "react";
import { Switch } from "@/components/UI/switch";
import { Sun, Moon } from "lucide-react";
import darkLogo from "../assets/mai_dark.png";
import lightLogo from "../assets/mai_dark.png";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isDark, setIsDark] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSubmit = (e) => {
    window.location.href = import.meta.env.VITE_AUTH_SUCCESS_URL;
    // "https://ccservices.mahindra.com/auth/redirect?id=d57d1358-38fc-4850-8bdd-e469ee1e2eaf&env=UAT";
    // No need for navigate("/home") here
  };

  const slides = [
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-26%20111445-o8mr9bS8sM0idBARzUcNQIQ47mYDk9.png",
      title: "TESTING AUTOMATION",
      description:
        "These visuals are used to analyze and understand various aspects of payment activity, trends, and patterns.",
    },
    {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      title: "DATA ANALYTICS",
      description:
        "Advanced analytics tools to help visualize and understand complex data patterns and trends.",
    },
    {
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      title: "PERFORMANCE METRICS",
      description:
        "Real-time monitoring and analysis of key performance indicators and business metrics.",
    },
    {
      image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3",
      title: "BUSINESS INTELLIGENCE",
      description:
        "Comprehensive business analytics platform for data-driven decision making and insights.",
    },
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        {/* Left Column - Login Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black transition-colors duration-300">
          <div className="max-w-md w-full space-y-8">
            {/* Logo */}
            <div className="absolute top-4 left-4">
              <img
                src={isDark ? darkLogo : lightLogo}
                alt="MAI Logo"
                width={80}
                height={40}
                className="object-contain"
              />
            </div>

            {/* Form Header */}
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <h2 className="text-5xl font-bold text-red-500">EDC JOB ORDER</h2>
              <p className="text-xl">
                <span className="text-red-500 font-semibold">MAI SSO</span>{" "}
                <span className="text-black dark:text-white">login</span>
              </p>
              <button
                onClick={handleSubmit}
                className="mt-8 w-64 py-3 px-6 border border-red-500 bg-red-500 rounded-full text-white transition-colors duration-300 hover:bg-red-600"
              >
                Login
              </button>
            </div>

            {/* Version - Moved to bottom left */}
            <div className="fixed bottom-4 left-4">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                <span className="text-red-500 font-semibold">VERSION</span>{" "}
                <span className="text-black dark:text-white">1.1.2</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Image and Content */}
        <div className="hidden lg:block relative bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 transition-colors duration-300 p-8 mt-8 mb-8 mr-8 rounded-2xl">
          <div
            className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 dark:bg-red-700 px-3 py-1.5 rounded-full shadow-lg cursor-pointer"
            onClick={() => setIsDark(!isDark)}
          >
            <span className="text-sm font-medium text-white">
              {isDark ? "Dark" : "Light"}
            </span>
            <Switch
              checked={isDark}
              onCheckedChange={setIsDark}
              className="bg-white data-[state=checked]:bg-white w-[40px] h-[24px] after:w-[20px] after:h-[20px] after:left-[2px] peer-checked:after:translate-x-[16px] cursor-pointer"
            />
          </div>

          <div className="absolute inset-8 flex flex-col justify-center items-center text-white">
            {/* Main Image */}
            <div className="mb-8 relative w-full max-w-md rounded-full p-2 shadow-lg bg-gray-200mb-8">
              {/* Carousel Navigation Arrows */}
              <button
                className="absolute top-1/2 -left-12 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                onClick={handlePrevSlide}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="absolute top-1/2 -right-12 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                onClick={handleNextSlide}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="rounded-lg shadow-2xl w-full"
              />
              {/* Small overlay image */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg">
                <img
                  src={slides[currentSlide].image}
                  className="w-16 h-12 rounded object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-bold mb-4">
                {slides[currentSlide].title}
              </h3>
              <p className="text-red-100 text-sm leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Navigation dots */}
            <div className="flex space-x-2 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full bg-white ${
                    index === currentSlide ? "opacity-100" : "opacity-50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
