import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Blue side gradient */}
        <linearGradient id="logoBlueGrad" x1="120" y1="80" x2="256" y2="432" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B5FFF" />
          <stop offset="100%" stopColor="#00A3FF" />
        </linearGradient>

        {/* Teal side gradient */}
        <linearGradient id="logoTealGrad" x1="392" y1="80" x2="256" y2="432" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00A896" />
          <stop offset="100%" stopColor="#02E2B9" />
        </linearGradient>
      </defs>

      {/* Symmetrical Left Blue Side of Cross/Shield */}
      <path
        d="M 256,80 
           L 220,80 
           Q 175,80 175,120 
           L 175,175 
           L 120,175 
           Q 80,175 80,215 
           L 80,297 
           Q 80,337 120,337 
           L 175,337 
           L 175,372 
           Q 175,395 195,410
           Q 225,428 256,432 
           L 256,80 Z"
        fill="url(#logoBlueGrad)"
      />

      {/* Symmetrical Right Teal Side of Cross/Shield */}
      <path
        d="M 256,80 
           L 292,80 
           Q 337,80 337,120 
           L 337,175 
           L 392,175 
           Q 432,175 432,215 
           L 432,297 
           Q 432,337 392,337 
           L 337,337 
           L 337,372 
           Q 337,395 317,410
           Q 287,428 256,432 
           L 256,80 Z"
        fill="url(#logoTealGrad)"
      />

      {/* 3D Depth Curve Overlays */}
      <path
        d="M 256,80 
           C 255,180 230,230 140,256
           C 230,240 250,220 256,80 Z"
        fill="#FFFFFF"
        opacity="0.15"
      />
      <path
        d="M 256,432 
           C 257,330 282,280 372,256
           C 282,272 262,292 256,432 Z"
        fill="#FFFFFF"
        opacity="0.15"
      />

      {/* Left-top slice line shadow */}
      <path
        d="M 80,256
           C 180,255 230,230 256,140
           C 240,230 220,250 80,256 Z"
        fill="#000000"
        opacity="0.08"
      />

      {/* Core Glowing White 4-Pointed Star */}
      <path
        d="M 256,150
           Q 256,256 150,256
           Q 256,256 256,362
           Q 256,256 362,256
           Q 256,256 256,150 Z"
        fill="#FFFFFF"
      />

      {/* Glowing Star Sparkle Curves (Swooshes) */}
      {/* Top-Right to Bottom-Left Swelling Swoosh */}
      <path
        d="M 120,295
           Q 240,265 392,217
           Q 272,247 120,295 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />

      {/* Bottom-Right to Top-Left Swelling Swoosh */}
      <path
        d="M 217,120
           Q 247,240 295,392
           Q 265,272 217,120 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
    </svg>
  );
};
