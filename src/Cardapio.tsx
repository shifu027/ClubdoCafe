import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const menuPages = [
  { src: `${BASE}assets/menu-capa.jpg`, alt: 'Capa do Cardápio', label: 'Capa' },
  { src: `${BASE}assets/menu.jpg`, alt: 'Itens do Cardápio', label: 'Cardápio' },
];

const pageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '105%' : '-105%',
    rotateY: dir > 0 ? 32 : -32,
    opacity: 0,
    scale: 0.88,
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-105%' : '105%',
    rotateY: dir > 0 ? -32 : 32,
    opacity: 0,
    scale: 0.88,
  }),
};

const pageTransition = {
  x: { type: 'spring' as const, stiffness: 340, damping: 38 },
  rotateY: { type: 'spring' as const, stiffness: 340, damping: 38 },
  opacity: { duration: 0.22 },
  scale: { type: 'spring' as const, stiffness: 340, damping: 38 },
};

export default function Cardapio() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const navigate = (newPage: number) => {
    if (newPage < 0 || newPage >= menuPages.length) return;
    setDirection(newPage > page ? 1 : -1);
    setPage(newPage);
    setShowHint(false);
  };

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    const swipe = Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 400;
    if (!swipe) return;
    if (info.offset.x < 0 || info.velocity.x < 0) navigate(page + 1);
    else navigate(page - 1);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #fdfbf7 0%, #f4ebe1 55%, #e8dcc8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '"Outfit", sans-serif',
      }}
    >
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,155,106,0.4), transparent 70%)',
        filter: 'blur(64px)', pointerEvents: 'none',
        animation: 'drift1 16s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: 40, left: -100, width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(166,124,82,0.3), transparent 70%)',
        filter: 'blur(56px)', pointerEvents: 'none',
        animation: 'drift2 20s ease-in-out infinite',
      }} />

      {/* Grain texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        opacity: 0.3, mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
        backgroundSize: '160px 160px',
      }} />

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          width: '100%', padding: '28px 20px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          zIndex: 10,
        }}
      >
        {/* Logo ring */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0%, #c89b6a 25%, #936a44 45%, transparent 65%)',
            animation: 'spin 7s linear infinite',
          }} />
          <div style={{
            position: 'relative', borderRadius: '50%',
            background: '#fdfbf7', padding: 3,
          }}>
            <img
              src={`${BASE}assets/logo.png`}
              alt="Club do Café"
              style={{ width: 68, height: 68, objectFit: 'contain', borderRadius: '50%', display: 'block' }}
            />
          </div>
          {/* Steam */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: -18, display: 'flex', gap: 10, zIndex: 0,
          }}>
            {[0, 0.7, 1.4].map((delay, i) => (
              <span key={i} style={{
                display: 'block', width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(166,124,82,0.55)', filter: 'blur(3px)',
                animation: `steamRise 3.4s ease-in-out infinite ${delay}s`,
              }} />
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#936a44', margin: '0 0 4px',
          }}>
            ── Club do Café ──
          </p>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 30, fontWeight: 700, color: '#2a1b12', margin: 0, lineHeight: 1.15,
          }}>
            Cardápio Digital
          </h1>
        </div>
      </motion.header>

      {/* ── Carousel ── */}
      <div style={{
        flex: 1, width: '100%', maxWidth: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px 18px', position: 'relative', zIndex: 10,
        overflow: 'hidden',
        perspective: '1400px',
      }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            style={{
              width: '100%',
              cursor: 'grab',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: [
                '0 2px 4px rgba(42,27,18,0.08)',
                '0 8px 24px rgba(42,27,18,0.12)',
                '0 24px 64px -8px rgba(42,27,18,0.25)',
                'inset 0 1px 0 rgba(255,255,255,0.9)',
              ].join(', '),
              userSelect: 'none',
              willChange: 'transform',
              background: '#fff',
            }}
            whileTap={{ cursor: 'grabbing', scale: 0.985 }}
          >
            {/* Page header stripe */}
            <div style={{
              background: 'linear-gradient(135deg, #2a1b12 0%, #4a2e1c 100%)',
              padding: '10px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{
                fontFamily: '"Playfair Display", serif',
                color: '#c89b6a', fontSize: 14, fontWeight: 600, letterSpacing: '0.08em',
              }}>
                Club do Café
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: 'rgba(200,155,106,0.7)',
              }}>
                {menuPages[page].label}
              </span>
            </div>

            {/* Image */}
            <img
              src={menuPages[page].src}
              alt={menuPages[page].alt}
              style={{
                width: '100%', height: 'auto',
                display: 'block', pointerEvents: 'none',
              }}
              draggable={false}
            />

            {/* Bottom strip */}
            <div style={{
              background: 'linear-gradient(135deg, #2a1b12 0%, #4a2e1c 100%)',
              padding: '8px 18px',
              textAlign: 'center',
            }}>
              <span style={{
                fontSize: 10, color: 'rgba(200,155,106,0.6)',
                letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>
                Página {page + 1} de {menuPages.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Corner page-turn shadow when dragging hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.8, 0] }}
              transition={{ duration: 3, times: [0, 0.2, 0.7, 1] }}
              style={{
                position: 'absolute', right: 26, bottom: 16,
                width: 60, height: 60,
                background: 'linear-gradient(225deg, rgba(147,106,68,0.15) 0%, transparent 60%)',
                borderRadius: '0 0 20px 0',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        style={{
          width: '100%', padding: '12px 24px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          zIndex: 10,
        }}
      >
        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Prev button */}
          <motion.button
            onClick={() => navigate(page - 1)}
            disabled={page === 0}
            whileHover={page > 0 ? { scale: 1.08, backgroundColor: 'rgba(147,106,68,0.22)' } : {}}
            whileTap={page > 0 ? { scale: 0.92 } : {}}
            style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'rgba(147,106,68,0.1)',
              border: `1.5px solid ${page === 0 ? 'rgba(147,106,68,0.15)' : 'rgba(147,106,68,0.35)'}`,
              color: page === 0 ? 'rgba(147,106,68,0.25)' : '#7a5431',
              cursor: page === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.2s, color 0.2s',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ChevronLeft size={22} />
          </motion.button>

          {/* Page dots */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {menuPages.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => navigate(i)}
                animate={{
                  width: i === page ? 28 : 8,
                  background: i === page ? '#936a44' : 'rgba(147,106,68,0.28)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{
                  height: 8, borderRadius: 4,
                  border: 'none', padding: 0, cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            onClick={() => navigate(page + 1)}
            disabled={page === menuPages.length - 1}
            whileHover={page < menuPages.length - 1 ? { scale: 1.08 } : {}}
            whileTap={page < menuPages.length - 1 ? { scale: 0.92 } : {}}
            style={{
              width: 50, height: 50, borderRadius: '50%',
              background: page < menuPages.length - 1 ? '#936a44' : 'rgba(147,106,68,0.1)',
              border: `1.5px solid ${page < menuPages.length - 1 ? '#936a44' : 'rgba(147,106,68,0.15)'}`,
              color: page < menuPages.length - 1 ? '#fff' : 'rgba(147,106,68,0.25)',
              cursor: page === menuPages.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: page < menuPages.length - 1 ? '0 4px 14px rgba(147,106,68,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <ChevronRight size={22} />
          </motion.button>
        </div>

        {/* Swipe hint */}
        <AnimatePresence>
          {showHint && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4 }}
              style={{
                fontSize: 11, color: 'rgba(122,84,49,0.5)', margin: 0,
                letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <motion.span
                animate={{ x: [-3, 3, -3] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                ←
              </motion.span>
              Deslize para virar a página
              <motion.span
                animate={{ x: [3, -3, 3] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes steamRise {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          25%  { opacity: 0.7; }
          100% { transform: translateY(-22px) scale(1.5); opacity: 0; }
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(-22px, 20px); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(24px, -16px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
