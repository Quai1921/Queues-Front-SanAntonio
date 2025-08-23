import React from 'react';
/**
 * Componente de spinner de carga reutilizable
 * 
 * @param {Object} props
 * @param {string} props.message - Mensaje a mostrar debajo del spinner
 * @param {string} props.size - Tamaño del spinner ('small', 'medium', 'large')
 * @param {boolean} props.fullScreen - Si debe ocupar toda la pantalla
 * @param {string} props.className - Clases CSS adicionales
 */
const LoadingSpinner = ({ 
  message = 'Cargando...', 
  size = 'medium',
  fullScreen = true,
  className = ''
}) => {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-12 h-12';
      default: // medium
        return 'w-8 h-8';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'medium';
      case 'large':
        return 'large';
      default:
        return 'large';
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="text-center">
          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full border-4 border-[#224666] border-t-transparent w-16 h-16"></div>
          </div>
          
          {/* Mensaje */}
          <p className="text-[#224666] font-medium text-xl mb-2">
            {message}
          </p>
          
          {/* Logo opcional */}
          <div className="mt-8 opacity-60">
            <img 
              src="/SanAntonioArredondoWhite.avif" 
              alt="San Antonio de Arredondo" 
              className="w-20 h-20 mx-auto opacity-40"
            />
          </div>
          
          {/* Texto adicional */}
          <p className="text-slate-500 text-sm mt-4">
            Sistema de Gestión de Turnos
          </p>
        </div>
      </div>
    );
  }

  // Spinner inline (no fullscreen)
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <div className={`animate-spin rounded-full border-3 border-[#224666] border-t-transparent ${getSizeClasses()}`}></div>
        </div>
        {message && (
          <p className="text-[#224666] text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Variantes predefinidas para casos comunes
export const SmallSpinner = ({ message, ...props }) => (
  <LoadingSpinner 
    message={message} 
    size="small" 
    fullScreen={false} 
    {...props} 
  />
);

export const InlineSpinner = ({ message, ...props }) => (
  <LoadingSpinner 
    message={message} 
    size="medium" 
    fullScreen={false} 
    className="py-2"
    {...props} 
  />
);

export const PageSpinner = ({ message = 'Cargando página...', ...props }) => (
  <LoadingSpinner 
    message={message} 
    size="large" 
    fullScreen={true} 
    {...props} 
  />
);

export default LoadingSpinner;