import { useEffect, useState } from 'react';
import { supabase, type CategoryWithItems, type MenuItem } from './lib/supabase';

const BASE = import.meta.env.BASE_URL;

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function ItemRow({ item }: { item: MenuItem }) {
  const hasPromo = item.promo_price != null && item.promo_price > 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid rgba(42,27,18,0.07)',
      opacity: item.available ? 1 : 0.55,
      gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontWeight: 600, fontSize: 14, color: '#2a1b12',
            fontFamily: '"Outfit", sans-serif',
          }}>
            {item.name}
          </span>
          {!item.available && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#fff',
              background: '#b04040', borderRadius: 4, padding: '2px 6px',
            }}>
              Esgotado
            </span>
          )}
          {hasPromo && item.available && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#fff',
              background: '#936a44', borderRadius: 4, padding: '2px 6px',
            }}>
              {item.promo_label || 'Promoção'}
            </span>
          )}
        </div>
        {item.description && (
          <p style={{
            fontSize: 12, color: '#7a5431', margin: '3px 0 0',
            fontFamily: '"Outfit", sans-serif', lineHeight: 1.4,
          }}>
            {item.description}
          </p>
        )}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {hasPromo ? (
          <>
            <div style={{
              fontSize: 11, color: '#9a7a5a',
              textDecoration: 'line-through', fontFamily: '"Outfit", sans-serif',
            }}>
              {BRL.format(item.price)}
            </div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: '#936a44',
              fontFamily: '"Outfit", sans-serif',
            }}>
              {BRL.format(item.promo_price!)}
            </div>
          </>
        ) : (
          <div style={{
            fontSize: 15, fontWeight: 600, color: '#2a1b12',
            fontFamily: '"Outfit", sans-serif',
          }}>
            {BRL.format(item.price)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Cardapio() {
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: cats } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order');

    const { data: items } = await supabase
      .from('menu_items')
      .select('*')
      .order('display_order');

    if (cats && items) {
      setCategories(
        cats.map(c => ({
          ...c,
          items: items.filter(i => i.category_id === c.id),
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('cardapio-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #fdfbf7 0%, #f4ebe1 55%, #e8dcc8 100%)',
      fontFamily: '"Outfit", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'fixed', top: -80, right: -80, width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,155,106,0.38), transparent 70%)',
        filter: 'blur(64px)', pointerEvents: 'none', zIndex: 0,
        animation: 'drift1 16s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed', bottom: 40, left: -100, width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(166,124,82,0.28), transparent 70%)',
        filter: 'blur(56px)', pointerEvents: 'none', zIndex: 0,
        animation: 'drift2 20s ease-in-out infinite',
      }} />

      {/* Header */}
      <header style={{
        padding: '28px 20px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        position: 'relative', zIndex: 1,
        background: 'rgba(253,251,247,0.7)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(147,106,68,0.12)',
      }}>
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
          {/* Steam */}
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
          }}>
            ── Club do Café ──
          </p>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 28, fontWeight: 700, color: '#2a1b12', margin: 0,
          }}>
            Cardápio Digital
          </h1>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 40px', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '60px 20px', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid rgba(147,106,68,0.15)',
              borderTopColor: '#936a44',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#7a5431', fontSize: 13, margin: 0 }}>Carregando cardápio…</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a7a5a' }}>
            <p style={{ fontSize: 14 }}>Cardápio em preparação…</p>
          </div>
        ) : (
          categories.map((cat) => (
            <section key={cat.id} style={{ padding: '20px 20px 0' }}>
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: 'linear-gradient(135deg, #2a1b12, #4a2e1c)',
                borderRadius: 12,
                marginBottom: 4,
              }}>
                {cat.emoji && (
                  <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                )}
                <h2 style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 17, fontWeight: 700, color: '#c89b6a',
                  margin: 0, letterSpacing: '0.04em',
                }}>
                  {cat.name}
                </h2>
              </div>

              {/* Items */}
              <div style={{
                background: 'rgba(255,255,255,0.6)', borderRadius: '0 0 12px 12px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(147,106,68,0.1)',
                borderTop: 'none',
                padding: '0 14px',
              }}>
                {cat.items.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#9a7a5a', padding: '12px 0', margin: 0 }}>
                    Nenhum item nesta categoria.
                  </p>
                ) : (
                  cat.items.map((item, idx) => (
                    <div key={item.id} style={{
                      borderBottom: idx < cat.items.length - 1 ? '1px solid rgba(42,27,18,0.07)' : 'none',
                    }}>
                      <ItemRow item={item} />
                    </div>
                  ))
                )}
              </div>
            </section>
          ))
        )}

        {/* Footer */}
        {!loading && categories.length > 0 && (
          <div style={{ textAlign: 'center', padding: '28px 20px 0' }}>
            <p style={{
              fontSize: 11, color: 'rgba(122,84,49,0.45)',
              letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
            }}>
              Preços sujeitos a alteração sem aviso prévio
            </p>
          </div>
        )}
      </main>

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
