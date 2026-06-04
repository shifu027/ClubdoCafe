import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type CategoryWithItems, type MenuItem } from './lib/supabase';

const BASE = import.meta.env.BASE_URL;

/* ── Helpers ── */
function formatPrice(price: number) {
  if (price === 0) return 'Consultar';
  return `$ ${price.toFixed(2).replace('.', ',')}`;
}

/* ── Item row ── */
function ItemRow({ item }: { item: MenuItem }) {
  const hasPromo = item.promo_price != null && item.promo_price > 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 8,
      padding: '3px 0',
      opacity: item.available ? 1 : 0.45,
    }}>
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: 12.5, color: '#2a1b12',
          fontFamily: '"Outfit", sans-serif', fontWeight: 400,
          textDecoration: !item.available ? 'line-through' : 'none',
        }}>
          {item.name}
        </span>
        {!item.available && (
          <span style={{
            marginLeft: 5, fontSize: 9, fontWeight: 700,
            background: '#c0392b', color: '#fff',
            borderRadius: 3, padding: '1px 4px',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            verticalAlign: 'middle',
          }}>Esgotado</span>
        )}
        {item.description ? (
          <p style={{
            margin: '1px 0 0', fontSize: 9.5,
            color: '#7a5431', fontFamily: '"Outfit", sans-serif',
            fontStyle: 'italic', lineHeight: 1.3,
          }}>{item.description}</p>
        ) : null}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 54 }}>
        {hasPromo ? (
          <>
            <div style={{
              fontSize: 10, color: '#9a7a5a',
              textDecoration: 'line-through',
              fontFamily: '"Outfit", sans-serif',
            }}>{formatPrice(item.price)}</div>
            <div style={{
              fontSize: 12.5, fontWeight: 700, color: '#936a44',
              fontFamily: '"Outfit", sans-serif',
            }}>{formatPrice(item.promo_price!)}</div>
            {item.promo_label && (
              <div style={{
                fontSize: 8.5, color: '#936a44', fontStyle: 'italic',
                fontFamily: '"Outfit", sans-serif',
              }}>{item.promo_label}</div>
            )}
          </>
        ) : (
          <span style={{
            fontSize: 12.5, fontWeight: 500,
            color: '#2a1b12', fontFamily: '"Outfit", sans-serif',
          }}>{formatPrice(item.price)}</span>
        )}
      </div>
    </div>
  );
}

/* ── Category block ── */
function CategoryBlock({ cat }: { cat: CategoryWithItems }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{
        fontFamily: '"Playfair Display", serif',
        fontStyle: 'italic', fontWeight: 700,
        fontSize: 18, color: '#2a1b12',
        margin: '0 0 5px', textAlign: 'center',
        borderBottom: '1.5px solid rgba(42,27,18,0.15)',
        paddingBottom: 4,
      }}>
        {cat.emoji && <span style={{ marginRight: 5 }}>{cat.emoji}</span>}
        {cat.name}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {cat.items.map(item => <ItemRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}

/* ── Cover page ── */
function CoverPage() {
  return (
    <div style={{
      width: '100%',
      background: '#f5ece0',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 12px 48px rgba(42,27,18,0.2)',
    }}>
      <img
        src={`${BASE}assets/menu-capa.jpg`}
        alt="Capa do Cardápio"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        draggable={false}
      />
    </div>
  );
}

/* ── Menu page ── */
function MenuPage({ categories, loading, fetchError, onRetry }: {
  categories: CategoryWithItems[];
  loading: boolean;
  fetchError: boolean;
  onRetry: () => void;
}) {
  return (
    <div style={{
      width: '100%',
      background: '#f5ece0',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 12px 48px rgba(42,27,18,0.2)',
    }}>
      {/* Menu header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '2px solid rgba(42,27,18,0.12)',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.4)',
      }}>
        <img
          src={`${BASE}assets/logo.png`}
          alt="Club do Café"
          style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: '50%' }}
        />
        <div>
          <span style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#936a44',
          }}>Club do</span>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700, fontSize: 20, color: '#2a1b12',
            margin: '-2px 0 0', letterSpacing: '0.04em',
          }}>CAFÉ</h1>
          <p style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic', color: '#936a44',
            fontSize: 16, margin: 0,
          }}>Menu</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 16px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', margin: '0 auto 10px',
              border: '2.5px solid rgba(147,106,68,0.15)',
              borderTopColor: '#936a44',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 12, color: '#7a5431', margin: 0 }}>Carregando…</p>
          </div>
        ) : fetchError ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ color: '#b04040', fontSize: 13, marginBottom: 10 }}>
              Erro ao carregar. Verifique a conexão.
            </p>
            <button onClick={onRetry} style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: '#936a44', color: '#fff',
              fontFamily: '"Outfit", sans-serif', fontSize: 12, cursor: 'pointer',
            }}>Tentar novamente</button>
          </div>
        ) : categories.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#9a7a5a', padding: '30px 0' }}>
            Cardápio em preparação…
          </p>
        ) : (
          /* Two-column layout matching the image */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 16px',
            alignItems: 'start',
          }}>
            {/* Left column: Cafés, Salgados, Sobremesas */}
            <div>
              {categories
                .filter(c => ['Cafés', 'Salgados', 'Sobremesas'].includes(c.name))
                .map(cat => <CategoryBlock key={cat.id} cat={cat} />)}
            </div>
            {/* Right column: Fit, Bebidas, Açaí, Adicionais + extras */}
            <div>
              {categories
                .filter(c => !['Cafés', 'Salgados', 'Sobremesas'].includes(c.name))
                .map(cat => <CategoryBlock key={cat.id} cat={cat} />)}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(42,27,18,0.1)',
        padding: '8px 16px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.3)',
      }}>
        <p style={{
          fontSize: 10, color: '#7a5431', margin: 0,
          fontFamily: '"Outfit", sans-serif', letterSpacing: '0.08em',
        }}>@CLUB.DO.CAFE</p>
      </div>
    </div>
  );
}

/* ── Page flip variants ── */
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

/* ── Main ── */
export default function Cardapio() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const hasLoadedRef = useRef(false);

  const fetchData = async () => {
    const [{ data: cats, error: catsErr }, { data: items, error: itemsErr }] = await Promise.all([
      supabase.from('menu_categories').select('*').order('display_order'),
      supabase.from('menu_items').select('*').order('display_order'),
    ]);
    if (catsErr || itemsErr) {
      if (!hasLoadedRef.current) setFetchError(true);
      setLoading(false);
      return;
    }
    hasLoadedRef.current = true;
    setFetchError(false);
    if (cats && items) {
      setCategories(cats.map(c => ({
        ...c,
        items: items.filter(i => i.category_id === c.id),
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const ch = supabase.channel('cardapio-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, []);

  const navigate = (newPage: number) => {
    if (newPage < 0 || newPage >= 2) return;
    setDirection(newPage > page ? 1 : -1);
    setPage(newPage);
    setShowHint(false);
  };

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    const swipe = Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 400;
    if (!swipe) return;
    navigate(info.offset.x < 0 || info.velocity.x < 0 ? page + 1 : page - 1);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #fdfbf7 0%, #f4ebe1 55%, #e8dcc8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowX: 'hidden', position: 'relative',
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

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', padding: '22px 20px 12px', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}
      >
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0%, #c89b6a 25%, #936a44 45%, transparent 65%)',
            animation: 'spin 7s linear infinite',
          }} />
          <div style={{ position: 'relative', borderRadius: '50%', background: '#fdfbf7', padding: 3 }}>
            <img src={`${BASE}assets/logo.png`} alt="Club do Café"
              style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '50%', display: 'block' }} />
          </div>
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: -14, display: 'flex', gap: 10,
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
            textTransform: 'uppercase', color: '#936a44', margin: '0 0 2px',
          }}>── Club do Café ──</p>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 24, fontWeight: 700, color: '#2a1b12', margin: 0,
          }}>Cardápio Digital</h1>
        </div>
      </motion.header>

      {/* Carousel */}
      <div style={{
        flex: 1, width: '100%', maxWidth: 500,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '4px 14px', position: 'relative', zIndex: 10,
        overflowX: 'hidden', perspective: '1400px',
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
            style={{ width: '100%', cursor: 'grab', userSelect: 'none', willChange: 'transform' }}
            whileTap={{ cursor: 'grabbing', scale: 0.985 }}
          >
            {page === 0
              ? <CoverPage />
              : <MenuPage
                  categories={categories}
                  loading={loading}
                  fetchError={fetchError}
                  onRetry={() => { setFetchError(false); setLoading(true); fetchData(); }}
                />
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          width: '100%', padding: '10px 24px 28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <motion.button
            onClick={() => navigate(page - 1)} disabled={page === 0}
            whileHover={page > 0 ? { scale: 1.08 } : {}}
            whileTap={page > 0 ? { scale: 0.92 } : {}}
            style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'rgba(147,106,68,0.1)',
              border: `1.5px solid ${page === 0 ? 'rgba(147,106,68,0.15)' : 'rgba(147,106,68,0.35)'}`,
              color: page === 0 ? 'rgba(147,106,68,0.25)' : '#7a5431',
              cursor: page === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          ><ChevronLeft size={20} /></motion.button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[0, 1].map(i => (
              <motion.button key={i} onClick={() => navigate(i)}
                animate={{ width: i === page ? 26 : 8, background: i === page ? '#936a44' : 'rgba(147,106,68,0.28)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{ height: 8, borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer' }}
              />
            ))}
          </div>

          <motion.button
            onClick={() => navigate(page + 1)} disabled={page === 1}
            whileHover={page < 1 ? { scale: 1.08 } : {}}
            whileTap={page < 1 ? { scale: 0.92 } : {}}
            style={{
              width: 46, height: 46, borderRadius: '50%',
              background: page < 1 ? '#936a44' : 'rgba(147,106,68,0.1)',
              border: `1.5px solid ${page < 1 ? '#936a44' : 'rgba(147,106,68,0.15)'}`,
              color: page < 1 ? '#fff' : 'rgba(147,106,68,0.25)',
              cursor: page === 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: page < 1 ? '0 4px 14px rgba(147,106,68,0.35)' : 'none',
            }}
          ><ChevronRight size={20} /></motion.button>
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.p
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: 11, color: 'rgba(122,84,49,0.5)', margin: 0,
                display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <motion.span animate={{ x: [-3, 3, -3] }} transition={{ duration: 1.4, repeat: Infinity }}>←</motion.span>
              Deslize para ver o cardápio
              <motion.span animate={{ x: [3, -3, 3] }} transition={{ duration: 1.4, repeat: Infinity }}>→</motion.span>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes steamRise {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          25%  { opacity: 0.7; }
          100% { transform: translateY(-22px) scale(1.5); opacity: 0; }
        }
        @keyframes drift1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-22px,20px); } }
        @keyframes drift2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(24px,-16px); } }
        * { -webkit-tap-highlight-color: transparent; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      `}</style>
    </div>
  );
}
