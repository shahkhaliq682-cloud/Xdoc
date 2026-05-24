import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number; // custom size in pixels
  responsive?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  size,
  responsive
}) => {
  // If no size is specified, AND responsive is not explicitly false, we enable responsive classes.
  // If size is specified, we use that size as a fixed box unless responsive is explicitly turned on.
  const isResponsive = responsive !== undefined ? responsive : (size === undefined);
  const resolvedSize = size || 40;

  return (
    <div 
      className={`inline-flex items-center justify-center select-none pointer-events-none ${
        isResponsive 
          ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12' 
          : ''
      } ${className}`}
      style={!isResponsive ? { width: resolvedSize, height: resolvedSize } : undefined}
    >
      <img
        src="/logo.png"
        alt="Xdoc Logo"
        referrerPolicy="no-referrer"
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          imageRendering: 'high-quality'
        }}
        className="block transition-all duration-350"
      />
    </div>
  );
};
