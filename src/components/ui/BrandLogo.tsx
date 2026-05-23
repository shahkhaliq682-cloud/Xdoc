import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 40 }) => {
  return (
    <img
      src="/logo.png"
      alt="Xdoc Logo"
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      style={{ 
        width: size, 
        height: size, 
        objectFit: 'contain',
        imageRendering: 'auto'
      }}
      className={`select-none pointer-events-none ${className}`}
    />
  );
};
