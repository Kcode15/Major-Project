import { useState, useEffect } from "react";
import upload from "../assets/images/upload.jpg";
import risk from "../assets/images/risk.jpg";
import summary from "../assets/images/summary.jpg";

const slides = [
    {
      title: "Welcome to LegalSutra!",
      description: "Your trusted legal companion. Securely manage and understand your legal documents.",
      image: upload,
    },
    {
      title: "Secure Your Documents",
      description: "We encrypt your legal files to ensure top-notch security and privacy.",
      image: risk,
    },
    {
      title: "Instant Summaries & Key Clauses",
      description: "Quickly get summaries, risk assessments, and important clauses extracted from your files.",
      image: summary,
    },
  ];
  

const Carousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-10 py-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl transition-all duration-500 ease-in-out relative overflow-hidden">
      {/* Background circle */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-100 opacity-30 rounded-full z-0 animate-pulse-slow"></div>

      {/* Carousel Content */}
      <div className="z-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg aspect-square bg-gray-100 rounded-3xl shadow-lg flex justify-center items-center overflow-hidden mb-6">
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="max-w-full max-h-full object-contain transition-all duration-700 ease-in-out"
          />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">{slides[current].title}</h2>
        <p className="text-gray-600 text-lg text-center max-w-md">{slides[current].description}</p>
      </div>
    </div>
  );
};

export default Carousel;