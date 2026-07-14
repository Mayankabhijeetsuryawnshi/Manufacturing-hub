import React from 'react';
import { CONFIG } from '../config';

export const HubLogo = ({ className = "w-64" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center font-sans ${className}`}>
      <svg 
        viewBox="0 0 300 350" 
        className="w-full h-auto drop-shadow-sm"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradients for 3D Shading */}
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C45A17" />
            <stop offset="100%" stopColor="#F47B20" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9C4C1C" />
            <stop offset="50%" stopColor="#DF6E23" />
            <stop offset="100%" stopColor="#F48126" />
          </linearGradient>
          <linearGradient id="whiteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9CDCD" />
            <stop offset="60%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E6E8E8" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#004A23" />
            <stop offset="50%" stopColor="#007236" />
            <stop offset="100%" stopColor="#1C9B48" />
          </linearGradient>
        </defs>

        {/* Top Leaf */}
        <path
          d="M150 150 C 130 110, 135 60, 165 45 C 180 80, 175 125, 150 150 Z"
          fill="url(#leafGrad)"
        />
        
        {/* Leaf Vein */}
        <path
          d="M152 145 C 155 110, 160 85, 170 55"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Orange Swirl */}
        <path
          d="M 105 210 C 90 165, 140 125, 190 125 C 225 125, 210 170, 180 175 C 135 185, 120 200, 105 210 Z"
          fill="url(#orangeGrad)"
        />

        {/* White Swirl */}
        <path
          d="M 120 260 C 105 215, 160 175, 210 175 C 245 175, 230 220, 200 225 C 155 235, 135 250, 120 260 Z"
          fill="url(#whiteGrad)"
        />

        {/* Green Swirl */}
        <path
          d="M 145 305 C 145 305, 125 260, 180 235 C 225 215, 240 250, 210 265 C 170 285, 155 290, 145 305 Z"
          fill="url(#greenGrad)"
        />
      </svg>

      {/* Typography matched to image layout */}
      <div className="flex flex-col items-center -mt-6">
        <span className="text-4xl font-extrabold tracking-tighter text-center" style={{ color: '#007236' }}>
          {CONFIG.APP_NAME}
        </span>
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase mt-2 text-center" style={{ color: '#888B8D' }}>
          {CONFIG.COMPANY_NAME}
        </span>
      </div>
    </div>
  );
};