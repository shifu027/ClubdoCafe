import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type MenuItem } from './lib/supabase';

const BASE = import.meta.env.BASE_URL;
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const menuPages = [
  { src: `${BASE}assets/menu-capa.jpg`, alt: 'Capa do Cardápio' },
  { src: `${BASE}assets/menu.jpg`, alt: 'Cardápio' },
];

const pageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '105%' : '-105%',
    rotateY: dir > 0 ? 32 : -32,
    opacity: 0, scale: 0.88,
  }),
  center: { x: 0, rotateY: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? '-105%' : '105%',
    rotateY: dir > 0 ? -32 : 32,
    opacity: 0, scale: 0.88,
  }),
};

const spring = {
  x: { type: 'spring' as const, stiffness: 340, damping: 38 },
  rotateY: { type: 'spring' as const, stiffness: 340, damping: 38 },
  opacity: { duration: 0.22 },
  scale: { type: 'spring' as const, stiffness: 340, damping: 38 },
};

export default function Cardapio() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [esgotados, setEsgotados] = useState<MenuItem[]>([]);
  const [promos, setPromos] = useState<MenuItem[]>([]);

  /* ── Data ── */
  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .or('available.eq.false,promo_price.not.is.null');
    if (error || !data) return;
    setEsgotados(data.filter(i => !i.available));
    setPromos(data.filter(i => i.available && i.promo_price != null));
  };

  useEffect(() => {
    fetchStatus();
    const channel = supabase
      .channel('cardapio-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, fetchStatus)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, []);

  /* ── Navigation ── */
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

  const hasStatus = esgotados.length > 0 || promos.length > 0;

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #fdfbf7 0%, #f4ebe1 55%, #e8dcc8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'hidden', position: 'relative',
      fontFamily: '"Outfit", sans-serif',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'fixed', top: -80, right: -80, width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,155,106,0.4), transparent 70%)',
        filter: 'blur(64px)', pointerEvents: 'none', zIndex: 0,
        animation: 'drift1 16s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed', bottom: 40, left: -100, width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(166,124,82,0.3), transparent 70%)',
        filter: 'blur(56px)', pointerEvents: 'none', zIndex: 0,
        animation: 'drift2 20s ease-in-out infinite',
      }} />

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          width: '100%', padding: '28px 20px 14px', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}
      >
        {/* Logo ring */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0%, #c89b6a 25%, #936a44 45%, transparent 65%)',
            animation: 'spin 7s linear infinite',
          }} />
          <div style={{ position: 'relative', borderRadius: '50%', background: '#fdfbf7', padding: 3 }}>
            <img
              src={`${BASE}assets/logo.png`}
              alt="Club do Café"
              style={{ width: 62, height: 62, objectFit: 'contain', borderRadius: '50%', display: 'block' }}
            />
          </div>
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: -16, display: 'flex', gap: 10,
          }}>
            {[0, 0.7, 1.4].map((d, i) => (
              <span key={i} style={{
                display: 'block', width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(166,124,82,0.55)', filter: 'blur(3px)',
                animation: `steamRise 3.4s ease-in-out infinite ${d}s`,
              }} />
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#936a44', margin: '0 0 4px',
          }}>── Club do Café ──</p>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 28, fontWeight: 700, color: '#2a1b12', margin: 0,
          }}>Cardápio Digital</h1>
        </div>
      </motion.header>

      {/* ── Carousel ── */}
      <div style={{
        flex: 1, width: '100%', maxWidth: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4px 16px', position: 'relative', zIndex: 10,
        overflow: 'hidden', perspective: '1400px',
      }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={spring}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            style={{
              width: '100%', cursor: 'grab', userSelect: 'none',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: [
                '0 2px 4px rgba(42,27,18,0.08)',
                '0 8px 24px rgba(42,27,18,0.12)',
                '0 24px 64px -8px rgba(42,27,18,0.25)',
              ].join(', '),
              willChange: 'transform',
            }}
            whileTap={{ cursor: 'grabbing', scale: 0.985 }}
          >
            <img
              src={menuPages[page].src}
              alt={menuPages[page].alt}
              style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          width: '100%', padding: '10px 24px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <motion.button
            onClick={() => navigate(page - 1)}
            disabled={page === 0}
            whileHover={page > 0 ? { scale: 1.08 } : {}}
            whileTap={page > 0 ? { scale: 0.92 } : {}}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(147,106,68,0.1)',
              border: `1.5px solid ${page === 0 ? 'rgba(147,106,68,0.15)' : 'rgba(147,106,68,0.35)'}`,
              color: page === 0 ? 'rgba(147,106,68,0.25)' : '#7a5431',
              cursor: page === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={22} />
          </motion.button>

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
                style={{ height: 8, borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer' }}
              />
            ))}
          </div>

          <motion.button
            onClick={() => navigate(page + 1)}
            disabled={page === menuPages.length - 1}
            whileHover={page < menuPages.length - 1 ? { scale: 1.08 } : {}}
            whileTap={page < menuPages.length - 1 ? { scale: 0.92 } : {}}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: page < menuPages.length - 1 ? '#936a44' : 'rgba(147,106,68,0.1)',
              border: `1.5px solid ${page < menuPages.length - 1 ? '#936a44' : 'rgba(147,106,68,0.15)'}`,
              color: page < menuPages.length - 1 ? '#fff' : 'rgba(147,106,68,0.25)',
              cursor: page === menuPages.length - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: page < menuPages.length - 1 ? '0 4px 14px rgba(147,106,68,0.35)' : 'none',
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
              exit={{ opacity: 0 }}
              style={{ fontSize: 11, color: 'rgba(122,84,49,0.5)', margin: 0,
                display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <motion.span animate={{ x: [-3, 3, -3] }} transition={{ duration: 1.4, repeat: Infinity }}>←</motion.span>
              Deslize para virar a página
              <motion.span animate={{ x: [3, -3, 3] }} transition={{ duration: 1.4, repeat: Infinity }}>→</motion.span>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Status ao Vivo ── */}
      <AnimatePresence>
        {hasStatus && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%', maxWidth: 480,
              margin: '12px 0 0', padding: '0 16px 28px',
              zIndex: 10,
            }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              border: '1px solid rgba(147,106,68,0.15)',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #2a1b12, #4a2e1c)',
                padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <span style={{ fontSize: 12 }}>📋</span>
                <span style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 13, fontWeight: 600, color: '#c89b6a',
                  letterSpacing: '0.04em',
                }}>Status ao Vivo</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'rgba(200,155,106,0.6)',
                }}>Tempo real</span>
              </div>

              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Esgotados */}
                {esgotados.length > 0 && (
                  <div>
                    <p style={{
                      fontSize: 10, fontWeight: 700, color: '#b04040',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span>✗</span> Esgotado
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {esgotados.map(item => (
                        <span key={item.id} style={{
                          fontSize: 12, fontWeight: 500, color: '#b04040',
                          background: 'rgba(176,64,64,0.08)',
                          border: '1px solid rgba(176,64,64,0.2)',
                          borderRadius: 6, padding: '3px 9px',
                        }}>
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promoções */}
                {promos.length > 0 && (
                  <div>
                    <p style={{
                      fontSize: 10, fontWeight: 700, color: '#936a44',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span>🏷️</span> {promos.length === 1 ? 'Promoção' : 'Promoções'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {promos.map(item => (
                        <div key={item.id} style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(147,106,68,0.07)',
                          border: '1px solid rgba(147,106,68,0.18)',
                          borderRadius: 8, padding: '5px 10px',
                        }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#2a1b12' }}>
                              {item.name}
                            </span>
                            {item.promo_label && (
                              <span style={{
                                fontSize: 10, color: '#936a44', marginLeft: 6,
                                fontStyle: 'italic',
                              }}>
                                {item.promo_label}
                              </span>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', marginLeft: 12 }}>
                            <div style={{ fontSize: 11, color: '#9a7a5a', textDecoration: 'line-through' }}>
                              {BRL.format(item.price)}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#936a44' }}>
                              {BRL.format(item.promo_price!)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer when no status */}
      {!hasStatus && <div style={{ height: 28 }} />}

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
        * { -webkit-tap-highlight-color: transparent; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
