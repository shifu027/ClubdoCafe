/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Coffee, 
  MessageCircle, 
  Instagram, 
  X, 
  ArrowUp,
  Bean,
  ChevronLeft,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [menuPageIndex, setMenuPageIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => setShowSwipeHint(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowSwipeHint(true);
    }
  }, [isModalOpen]);

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

  // Nomes dos arquivos fornecidos pelo usuário
  const basePath = import.meta.env.BASE_URL;
  const logoPath = `${basePath}image.png`;
  const menuPages = [
    { src: `${basePath}menu club do cafe capa.jpg`, alt: "Capa do Menu" },
    { src: `${basePath}menu club do cafe.jpg`, alt: "Itens do Menu" }
  ];

  const nextMenuPage = () => {
    setMenuPageIndex((prev) => (prev + 1) % menuPages.length);
  };

  const prevMenuPage = () => {
    setMenuPageIndex((prev) => (prev - 1 + menuPages.length) % menuPages.length);
  };

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
      onClick: () => setIsModalOpen(true),
      type: 'button',
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

        <main className="relative z-10 flex flex-col items-center px-6 pt-6 sm:pt-12 pb-4 sm:pb-6 h-full overflow-hidden">
          {/* Header / Profile */}
          <motion.header 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-3 sm:mb-6 w-full"
          >
            <div className="relative mb-2 sm:mb-4">
              <div className="w-[75px] h-[75px] sm:w-[100px] sm:h-[100px] rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center border-4 border-white transition-all">
                <img 
                  src={logoPath} 
                  alt="Logo Club do Café" 
                  className="w-full h-full object-cover scale-110"
                />
              </div>
            </div>
            
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
                  <div className="flex flex-col justify-center flex-grow min-w-0 pr-4 text-left">
                    <h3 className={`text-[17px] font-bold leading-none truncate ${link.primary ? 'text-white' : 'text-cafe-dark'}`}>
                      {link.title}
                    </h3>
                    <p className={`text-[12px] leading-none mt-2 truncate ${link.primary ? 'text-white/70' : 'text-cafe-muted font-medium'}`}>
                      {link.subtitle}
                    </p>
                  </div>
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

        {/* Modal - Menu Overlay */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
            >
              <div className="p-6 flex items-center justify-between sticky top-0 z-[110] bg-black/20 backdrop-blur-md">
                <div className="flex flex-col">
                  <h2 className="font-serif text-2xl font-bold text-white leading-tight">Nosso Menu</h2>
                  <p className="text-cafe-accent text-[11px] font-bold uppercase tracking-widest mt-1">
                    Página {menuPageIndex + 1} de {menuPages.length}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 bg-white/10 hover:bg-cafe-accent text-white rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-hidden [perspective:2500px]">
                <div className="w-full max-w-[500px] h-full relative flex items-center">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={menuPageIndex}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragStart={() => setShowSwipeHint(false)}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 80) prevMenuPage();
                        else if (info.offset.x < -80) nextMenuPage();
                      }}
                      initial={{ rotateY: 95, opacity: 0, scale: 0.9 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                      exit={{ rotateY: -95, opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.9, 
                        ease: [0.16, 1, 0.3, 1] 
                      }}
                      style={{ 
                        transformOrigin: "center center",
                        backfaceVisibility: "hidden",
                        transformStyle: "preserve-3d"
                      }}
                      className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none group"
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Fake Page Shadow Effect */}
                        <motion.div 
                          className="absolute inset-0 bg-black/20 rounded-[24px] pointer-events-none"
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0.5 }}
                        />
                        
                        {/* Edge curl visual cue */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent rounded-r-[24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent rounded-l-[24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                        <img 
                          src={encodeURI(menuPages[menuPageIndex].src)} 
                          alt={menuPages[menuPageIndex].alt} 
                          className="max-w-[90vw] max-h-[75vh] sm:max-h-[85%] rounded-[24px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] border border-white/10 object-contain select-none"
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Swipe Hint Indicator */}
                  <AnimatePresence>
                    {showSwipeHint && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
                      >
                        <motion.div
                          animate={{ x: [-20, 20, -20] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="flex flex-col items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10"
                        >
                          <div className="flex gap-2">
                             <ChevronLeft className="w-5 h-5 text-white/50" />
                             <div className="w-8 h-8 rounded-full border-2 border-white/80 animate-pulse flex items-center justify-center">
                               <div className="w-2 h-2 rounded-full bg-white" />
                             </div>
                             <ChevronRight className="w-5 h-5 text-white/50" />
                          </div>
                          <span className="text-white text-[10px] font-bold uppercase tracking-widest">Deslize para ler</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <button 
                    onClick={prevMenuPage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white/10 hover:bg-cafe-accent text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextMenuPage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white/10 hover:bg-cafe-accent text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-8 flex gap-2">
                  {menuPages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMenuPageIndex(i)}
                      aria-label={`Ir para página ${i + 1}`}
                      aria-current={i === menuPageIndex ? 'page' : undefined}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${i === menuPageIndex ? 'bg-cafe-accent w-6' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Top */}
        <AnimatePresence>
          {showBackToTop && !isModalOpen && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onClick={scrollToTop}
              aria-label="Voltar ao topo"
              className="fixed sm:absolute bottom-8 right-8 bg-cafe-dark text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-cafe-accent transition-all duration-300 active:scale-95"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
