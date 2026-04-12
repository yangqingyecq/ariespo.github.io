import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-[90vw]',
};

export default function ModalBase({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}: ModalBaseProps) {
  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`w-full ${maxWidthClasses[maxWidth]} pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gothic Border Container */}
              <div className="relative">
                {/* Corner decorations */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-gold z-10" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-gold z-10" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-gold z-10" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-gold z-10" />

                {/* Inner corner accents */}
                <div className="absolute top-3 left-3 w-2 h-2 bg-blood/60 z-10" />
                <div className="absolute top-3 right-3 w-2 h-2 bg-blood/60 z-10" />
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-blood/60 z-10" />
                <div className="absolute bottom-3 right-3 w-2 h-2 bg-blood/60 z-10" />

                {/* Main Modal Content */}
                <div className="bg-obsidian border border-gold-dim shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  {/* Header */}
                  <div className="relative px-6 py-4 border-b border-gold-dim/30 bg-gradient-to-r from-blood/10 via-transparent to-blood/10">
                    {/* Decorative blood drip effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gradient-to-b from-blood to-transparent" />

                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-gothic text-2xl text-gold text-glow tracking-widest">
                          {title}
                        </h2>
                        {subtitle && (
                          <p className="text-xs text-gold-dim/70 tracking-widest uppercase mt-1 font-sans">
                            {subtitle}
                          </p>
                        )}
                      </div>
                      {showCloseButton && (
                        <button
                          onClick={onClose}
                          className="w-8 h-8 flex items-center justify-center text-gold-dim hover:text-gold hover:bg-blood/20 transition-all border border-gold-dim/30 hover:border-gold"
                          title="关闭"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {children}
                  </div>

                  {/* Footer decorative line */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
