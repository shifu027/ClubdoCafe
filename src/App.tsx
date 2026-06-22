/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Coffee,
  MessageCircle,
  Instagram,
  ArrowUp,
  Bean,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlowCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'external' | string;
  href?: string;
  primary?: boolean;
  title?: string;
  target?: string;
  rel?: string;
  className?: string;
}

const GlowCard = ({ children, className, onClick, type, href, primary, ...props }: GlowCardProps) => {
  const cardRef = useRef<HTMLElement>(null);

  const handlePointerMove = (e: any) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;
    
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);

    // Efeito Magnético sutil
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (clientX - centerX) / 15;
    const deltaY = (clientY - centerY) / 8;
    const isPressed = cardRef.current.dataset.pressed === "true";
    cardRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${isPressed ? 0.95 : 1.02})`;
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    delete cardRef.current.dataset.pressed;
    cardRef.current.style.transform = `translate3d(0, 0, 0) scale(1)`;
  };

  const handlePointerDown = () => {
    if (!cardRef.current) return;
    cardRef.current.dataset.pressed = "true";
    if (cardRef.current.style.transform) {
      cardRef.current.style.transform = cardRef.current.style.transform.replace(/scale\([^)]+\)/, 'scale(0.95)');
    } else {
      cardRef.current.style.transform = 'scale(0.95)';
    }
  };

  const handlePointerUp = () => {
    if (!cardRef.current) return;
    delete cardRef.current.dataset.pressed;
    if (cardRef.current.style.transform) {
      cardRef.current.style.transform = cardRef.current.style.transform.replace(/scale\([^)]+\)/, 'scale(1.02)');
    } else {
      cardRef.current.style.transform = 'scale(1.02)';
    }
  };

  const commonProps = {
    ref: cardRef,
    onMouseMove: handlePointerMove,
    onMouseLeave: handlePointerLeave,
    onTouchMove: handlePointerMove,
    onTouchStart: handlePointerDown,
    onTouchEnd: handlePointerUp,
    onMouseDown: handlePointerDown,
    onMouseUp: handlePointerUp,
    className: `glow-card group ${className} ${primary ? 'whatsapp' : ''}`,
    'aria-label': props.title || 'Link de navegação',
    ...props
  };

  if (type === 'external') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
        <div className="glow-card-inner">{children}</div>
      </a>
    );
  }

  return (
    <button 
      onClick={onClick} 
      {...commonProps}
      className={`${commonProps.className} flex items-center justify-start text-left`}
    >
      <div className="glow-card-inner">{children}</div>
    </button>
  );
};

export default function App() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Assets servidos de public/assets, respeitando o base do Vite (/ClubdoCafe/ em producao)
  const assetBase = import.meta.env.BASE_URL;
  const logoPath = `${assetBase}assets/logo.png`;

  const links = [
    {
      title: 'Como chegar',
      subtitle: 'Traçar rota pelo Google Maps',
      icon: <MapPin className="w-5 h-5" />,
      href: 'https://www.google.com/maps/dir/?api=1&destination=Clube+R5+Sports+Vila+Velha',
      type: 'external',
      primary: false
    },
    {
      title: 'Ver Cardápio',
      subtitle: 'Explore nossas delícias',
      icon: <Coffee className="w-5 h-5" />,
      href: `${assetBase}cardapio.html`,
      type: 'external',
      primary: false
    },
    {
      title: 'Grupo do WhatsApp',
      subtitle: 'Entre no nosso grupo VIP',
      icon: <MessageCircle className="w-5 h-5" />,
      href: 'https://chat.whatsapp.com/Ggtd6keUe0vEhN9Iq2wwuH?mode=gi_t',
      type: 'external',
      primary: true
    },
    {
      title: 'Instagram',
      subtitle: 'Siga para ver as novidades',
      icon: <Instagram className="w-5 h-5" />,
      href: 'https://www.instagram.com/club.do.cafe/',
      type: 'external',
      primary: false
    }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {/* Dynamic Background Coffee Icons (Behind the phone) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[
          { pos: "top-[10%] left-[5%]", size: "w-32 h-32", delay: 0, x: 30 },
          { pos: "top-[40%] right-[5%]", size: "w-24 h-24", delay: 2, x: -25 },
          { pos: "bottom-[15%] left-[10%]", size: "w-28 h-28", delay: 4, x: 20 },
          { pos: "bottom-[35%] right-[15%]", size: "w-20 h-20", delay: 6, x: -15 }
        ].map((icon, i) => (
          <motion.div
            key={i}
            className={`fixed ${icon.pos} opacity-5 blur-[0.5px] z-0`}
            animate={{ 
              x: [0, icon.x, 0],
              y: [0, -20, 10, 0],
              rotate: [0, 15, -10, 0]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              delay: icon.delay,
              ease: "easeInOut" 
            }}
          >
            <Coffee className={`${icon.size}`} />
          </motion.div>
        ))}
      </div>

      <div className="iphone-shell z-10 shrink-0">
        <div className="dynamic-island" />
        <div className="top-decor" />
        <div className="ambient-glow ambient-glow-1" />
        <div className="ambient-glow ambient-glow-2" />
        <div className="ambient-grain" />

        <main className="relative z-10 flex flex-col items-center px-6 pt-6 sm:pt-12 pb-4 sm:pb-6 h-full overflow-hidden">
          {/* Header / Profile */}
          <motion.header 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-3 sm:mb-6 w-full"
          >
            <div className="relative mb-2 sm:mb-4">
              <div className="steam" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="logo-ring shadow-lg">
                <div className="w-[75px] h-[75px] sm:w-[100px] sm:h-[100px] rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white transition-all">
                  <img
                    src={logoPath}
                    alt="Logo Club do Café"
                    className="w-full h-full object-cover scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300';
                    }}
                  />
                </div>
              </div>
            </div>

          <span className="eyebrow">Cafeteria Artesanal</span>
          <h1 className="font-serif text-[26px] sm:text-[34px] font-bold text-cafe-dark leading-tight mb-1 tracking-tight">
            Club do Café
          </h1>
          <p className="text-cafe-muted text-[12px] sm:text-[14px] leading-snug max-w-[280px]">
            Cafés especiais, salgados e doçuras.<br />
            <span className="italic font-serif text-cafe-accent font-semibold mt-0.5 inline-block text-[11px] sm:text-[13px]">Seu momento de pausa perfeito.</span>
          </p>
        </motion.header>

        {/* Links Container */}
        <div className="w-full flex-grow flex flex-col justify-center gap-2.5 sm:gap-4 max-h-[400px]">
            {links.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <GlowCard {...link}>
                  <div className={`
                    icon-box flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 
                    shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-700 ease-out
                    ${link.primary 
                      ? 'bg-white/10 text-white group-hover:bg-white group-hover:text-cafe-dark group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                      : 'bg-cafe-creme text-cafe-accent group-hover:bg-cafe-accent group-hover:text-white group-hover:shadow-[0_0_25px_rgba(166,124,82,0.3)]'}
                  `}>
                    <div className="transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-[20deg] group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                      {link.icon}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center flex-grow min-w-0 pr-2 text-left">
                    <h3 className={`text-[17px] font-bold leading-none truncate ${link.primary ? 'text-white' : 'text-cafe-dark'}`}>
                      {link.title}
                    </h3>
                    <p className={`text-[12px] leading-none mt-2 truncate ${link.primary ? 'text-white/70' : 'text-cafe-muted font-medium'}`}>
                      {link.subtitle}
                    </p>
                  </div>
                  <ChevronRight className={`card-arrow w-5 h-5 mr-1 ${link.primary ? 'text-cafe-gold' : 'text-cafe-accent'}`} />
                </GlowCard>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-auto pt-2 sm:pt-6 text-center w-full">
            <div className="mb-2 sm:mb-3 flex justify-center bean-animated">
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-cafe-accent fill-cafe-accent/10" />
            </div>
            <p className="font-serif font-bold text-cafe-dark/95 text-base sm:text-lg leading-none tracking-tight">@club.do.cafe</p>
            <p className="text-[8px] sm:text-[9px] text-cafe-muted mt-1.5 sm:mt-2 uppercase tracking-[0.25em] font-bold opacity-70">Momentos Inesquecíveis</p>
          </footer>
        </main>

        {/* Back to Top */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onClick={scrollToTop}
              aria-label="Voltar ao topo"
              className="fixed sm:absolute bottom-8 right-8 bg-cafe-dark text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-cafe-accent transition-all duration-300 active:scale-90"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
