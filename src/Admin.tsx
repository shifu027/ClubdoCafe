import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Category, type MenuItem, type CategoryWithItems } from './lib/supabase';
import { LogOut, Plus, Pencil, Trash2, Coffee, ChevronDown, ChevronUp, Tag, AlertTriangle } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/* ────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────── */
type ModalState =
  | { type: 'none' }
  | { type: 'add_category' }
  | { type: 'edit_category'; category: Category }
  | { type: 'add_item'; categoryId: string }
  | { type: 'edit_item'; item: MenuItem };

/* ────────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────────── */
const btn = (
  label: string,
  onClick: () => void,
  style?: React.CSSProperties,
  disabled = false
) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderRadius: 8, border: 'none',
      fontFamily: '"Outfit", sans-serif', fontSize: 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'opacity 0.15s, transform 0.1s',
      ...style,
    }}
  >
    {label}
  </button>
);

const iconBtn = (
  icon: React.ReactNode,
  onClick: () => void,
  title: string,
  style?: React.CSSProperties
) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 32, height: 32, borderRadius: 8, border: 'none',
      background: 'transparent', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#7a5431', transition: 'background 0.15s',
      ...style,
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(147,106,68,0.12)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    {icon}
  </button>
);

const input = (
  label: string,
  value: string | number,
  onChange: (v: string) => void,
  opts?: { type?: string; placeholder?: string; required?: boolean }
) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: 11, fontWeight: 600, color: '#7a5431', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </span>
    <input
      type={opts?.type ?? 'text'}
      placeholder={opts?.placeholder ?? ''}
      required={opts?.required}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '9px 12px', borderRadius: 8, border: '1.5px solid rgba(147,106,68,0.25)',
        fontFamily: '"Outfit", sans-serif', fontSize: 14, color: '#2a1b12',
        background: '#fdfbf7', outline: 'none', width: '100%',
        boxSizing: 'border-box',
      }}
      onFocus={e => (e.target.style.borderColor = '#936a44')}
      onBlur={e => (e.target.style.borderColor = 'rgba(147,106,68,0.25)')}
    />
  </label>
);

/* ────────────────────────────────────────────────────────────────
   Modal de Categoria
──────────────────────────────────────────────────────────────── */
function CategoryModal({
  modal,
  onClose,
  onSaved,
}: {
  modal: Extract<ModalState, { type: 'add_category' | 'edit_category' }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = modal.type === 'edit_category' ? modal.category : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [emoji, setEmoji] = useState(editing?.emoji ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim()) { setError('Nome obrigatório'); return; }
    setSaving(true);
    setError('');
    const payload = { name: name.trim(), emoji: emoji.trim() };
    let err;
    if (editing) {
      ({ error: err } = await supabase.from('menu_categories').update(payload).eq('id', editing.id));
    } else {
      const { data: existing } = await supabase.from('menu_categories').select('display_order').order('display_order', { ascending: false }).limit(1);
      const nextOrder = (existing?.[0]?.display_order ?? 0) + 1;
      ({ error: err } = await supabase.from('menu_categories').insert({ ...payload, display_order: nextOrder }));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={modalTitle}>{editing ? 'Editar Categoria' : 'Nova Categoria'}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {input('Nome *', name, setName, { placeholder: 'ex: Cafés Especiais', required: true })}
        {input('Emoji', emoji, setEmoji, { placeholder: 'ex: ☕' })}
        {error && <p style={errStyle}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {btn('Cancelar', onClose, { background: 'rgba(42,27,18,0.06)', color: '#7a5431' })}
          {btn(saving ? 'Salvando…' : 'Salvar', save, { background: '#936a44', color: '#fff' }, saving)}
        </div>
      </div>
    </Overlay>
  );
}

/* ────────────────────────────────────────────────────────────────
   Modal de Item
──────────────────────────────────────────────────────────────── */
function ItemModal({
  modal,
  onClose,
  onSaved,
}: {
  modal: Extract<ModalState, { type: 'add_item' | 'edit_item' }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = modal.type === 'edit_item' ? modal.item : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [promoPrice, setPromoPrice] = useState(editing?.promo_price ? String(editing.promo_price) : '');
  const [promoLabel, setPromoLabel] = useState(editing?.promo_label ?? '');
  const [available, setAvailable] = useState(editing?.available ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim()) { setError('Nome obrigatório'); return; }
    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) { setError('Preço inválido'); return; }
    const promoPriceNum = promoPrice ? parseFloat(promoPrice.replace(',', '.')) : null;
    if (promoPrice && (isNaN(promoPriceNum!) || promoPriceNum! < 0)) {
      setError('Preço promocional inválido'); return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: name.trim(), description: description.trim(),
      price: priceNum, promo_price: promoPriceNum,
      promo_label: promoLabel.trim(), available,
    };
    let err;
    if (editing) {
      ({ error: err } = await supabase.from('menu_items').update(payload).eq('id', editing.id));
    } else {
      const catId = (modal as { categoryId: string }).categoryId;
      const { data: existing } = await supabase.from('menu_items')
        .select('display_order').eq('category_id', catId)
        .order('display_order', { ascending: false }).limit(1);
      const nextOrder = (existing?.[0]?.display_order ?? 0) + 1;
      ({ error: err } = await supabase.from('menu_items').insert({ ...payload, category_id: catId, display_order: nextOrder }));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={modalTitle}>{editing ? 'Editar Item' : 'Novo Item'}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {input('Nome *', name, setName, { placeholder: 'ex: Cappuccino', required: true })}
        {input('Descrição', description, setDescription, { placeholder: 'ex: Espresso com leite vaporizado' })}
        {input('Preço (R$) *', price, setPrice, { type: 'text', placeholder: 'ex: 12,00', required: true })}

        <div style={{ background: 'rgba(147,106,68,0.06)', borderRadius: 10, padding: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#936a44', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
            Promoção (opcional)
          </p>
          {input('Preço Promocional (R$)', promoPrice, setPromoPrice, { type: 'text', placeholder: 'ex: 9,00' })}
          {input('Etiqueta da Promoção', promoLabel, setPromoLabel, { placeholder: 'ex: Promoção do Dia' })}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
          <div
            onClick={() => setAvailable(!available)}
            style={{
              width: 44, height: 24, borderRadius: 12, position: 'relative',
              background: available ? '#936a44' : 'rgba(42,27,18,0.2)',
              transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
              left: available ? 23 : 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <span style={{ fontSize: 13, color: '#2a1b12', fontWeight: 500 }}>
            {available ? 'Disponível' : 'Esgotado'}
          </span>
        </label>

        {error && <p style={errStyle}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {btn('Cancelar', onClose, { background: 'rgba(42,27,18,0.06)', color: '#7a5431' })}
          {btn(saving ? 'Salvando…' : 'Salvar', save, { background: '#936a44', color: '#fff' }, saving)}
        </div>
      </div>
    </Overlay>
  );
}

/* ────────────────────────────────────────────────────────────────
   Overlay wrapper
──────────────────────────────────────────────────────────────── */
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(20,10,5,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center', padding: '0 0 env(safe-area-inset-bottom, 0)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: '#fdfbf7', borderRadius: '20px 20px 0 0',
          padding: '24px 20px 32px', maxHeight: '85dvh', overflowY: 'auto',
          boxShadow: '0 -8px 32px rgba(42,27,18,0.15)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const modalTitle: React.CSSProperties = {
  fontFamily: '"Playfair Display", serif',
  fontSize: 20, fontWeight: 700, color: '#2a1b12',
  margin: '0 0 16px',
};

const errStyle: React.CSSProperties = {
  fontSize: 12, color: '#b04040', margin: 0,
  background: 'rgba(176,64,64,0.08)', padding: '8px 10px', borderRadius: 8,
};

/* ────────────────────────────────────────────────────────────────
   Login Screen
──────────────────────────────────────────────────────────────── */
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let err;
    if (mode === 'login') {
      ({ error: err } = await supabase.auth.signInWithPassword({ email, password }));
    } else {
      ({ error: err } = await supabase.auth.signUp({ email, password }));
      if (!err) {
        setError('');
        setMode('login');
        alert('Conta criada! Faça login para continuar.');
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    if (err) setError(err.message);
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #fdfbf7 0%, #f4ebe1 55%, #e8dcc8 100%)',
      padding: 20, fontFamily: '"Outfit", sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 360, background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)', borderRadius: 20, padding: '32px 24px',
        boxShadow: '0 8px 40px rgba(42,27,18,0.12)',
        border: '1px solid rgba(147,106,68,0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={`${BASE}assets/logo.png`} alt="Club do Café"
            style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '50%', marginBottom: 12 }} />
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 22, fontWeight: 700, color: '#2a1b12', margin: '0 0 4px',
          }}>
            Painel do Gerente
          </h1>
          <p style={{ fontSize: 12, color: '#7a5431', margin: 0 }}>Club do Café</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {input('Email', email, setEmail, { type: 'email', placeholder: 'gerente@clubdocafe.com', required: true })}
          {input('Senha', password, setPassword, { type: 'password', placeholder: '••••••••', required: true })}
          {error && <p style={errStyle}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '11px', borderRadius: 10, border: 'none',
              background: loading ? 'rgba(147,106,68,0.5)' : '#936a44',
              color: '#fff', fontFamily: '"Outfit", sans-serif',
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Entrando…' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#7a5431', marginTop: 16 }}>
          {mode === 'login' ? (
            <>Primeira vez?{' '}
              <span onClick={() => setMode('signup')} style={{ color: '#936a44', cursor: 'pointer', fontWeight: 600 }}>
                Criar conta
              </span>
            </>
          ) : (
            <>Já tem conta?{' '}
              <span onClick={() => setMode('login')} style={{ color: '#936a44', cursor: 'pointer', fontWeight: 600 }}>
                Entrar
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Dashboard
──────────────────────────────────────────────────────────────── */
function Dashboard({ session }: { session: Session }) {
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    const { data: cats } = await supabase.from('menu_categories').select('*').order('display_order');
    const { data: items } = await supabase.from('menu_items').select('*').order('display_order');
    if (cats && items) {
      setCategories(cats.map(c => ({ ...c, items: items.filter(i => i.category_id === c.id) })));
      setExpanded(new Set(cats.map(c => c.id)));
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const signOut = () => supabase.auth.signOut();

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Excluir esta categoria e todos os itens?')) return;
    setDeletingId(id);
    await supabase.from('menu_categories').delete().eq('id', id);
    setDeletingId(null);
    loadData();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Excluir este item?')) return;
    setDeletingId(id);
    await supabase.from('menu_items').delete().eq('id', id);
    setDeletingId(null);
    loadData();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id);
    loadData();
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#f4ebe1', fontFamily: '"Outfit", sans-serif',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2a1b12, #4a2e1c)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 16px rgba(42,27,18,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={`${BASE}assets/logo.png`} alt=""
            style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: '50%' }} />
          <div>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(200,155,106,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Club do Café
            </p>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#c89b6a',
              fontFamily: '"Playfair Display", serif' }}>
              Painel do Gerente
            </h1>
          </div>
        </div>
        <button
          onClick={signOut}
          title="Sair"
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
            color: '#c89b6a', cursor: 'pointer', padding: '7px 12px',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, fontFamily: '"Outfit", sans-serif',
          }}
        >
          <LogOut size={14} /> Sair
        </button>
      </header>

      {/* Info bar */}
      <div style={{
        background: 'rgba(147,106,68,0.1)', padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(147,106,68,0.15)',
      }}>
        <span style={{ fontSize: 12, color: '#7a5431' }}>
          <Coffee size={12} style={{ display: 'inline', marginRight: 5 }} />
          {session.user.email}
        </span>
        <a
          href={`${BASE}cardapio.html`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#936a44', fontWeight: 600, textDecoration: 'none' }}
        >
          Ver cardápio ↗
        </a>
      </div>

      {/* Body */}
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid rgba(147,106,68,0.15)',
              borderTopColor: '#936a44',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }} />
            <p style={{ color: '#7a5431', fontSize: 13 }}>Carregando…</p>
          </div>
        ) : (
          <>
            {/* Add category */}
            <button
              onClick={() => setModal({ type: 'add_category' })}
              style={{
                width: '100%', padding: '11px', borderRadius: 12,
                border: '2px dashed rgba(147,106,68,0.35)',
                background: 'transparent', color: '#936a44',
                fontFamily: '"Outfit", sans-serif', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginBottom: 12,
              }}
            >
              <Plus size={16} /> Nova Categoria
            </button>

            {categories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9a7a5a' }}>
                <p>Nenhuma categoria. Adicione a primeira!</p>
              </div>
            )}

            {categories.map(cat => (
              <div key={cat.id} style={{
                background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)',
                borderRadius: 14, marginBottom: 10,
                border: '1px solid rgba(147,106,68,0.12)',
                overflow: 'hidden',
              }}>
                {/* Category header */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, rgba(42,27,18,0.06), rgba(42,27,18,0.02))',
                  borderBottom: expanded.has(cat.id) ? '1px solid rgba(147,106,68,0.1)' : 'none',
                }}>
                  <button
                    onClick={() => toggleExpanded(cat.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontFamily: '"Outfit", sans-serif',
                    }}
                  >
                    {cat.emoji && <span style={{ fontSize: 18 }}>{cat.emoji}</span>}
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#2a1b12' }}>{cat.name}</span>
                    <span style={{
                      fontSize: 11, color: '#9a7a5a', marginLeft: 2,
                      background: 'rgba(147,106,68,0.1)', borderRadius: 4, padding: '1px 5px',
                    }}>
                      {cat.items.length}
                    </span>
                    {expanded.has(cat.id)
                      ? <ChevronUp size={14} style={{ marginLeft: 'auto', color: '#9a7a5a' }} />
                      : <ChevronDown size={14} style={{ marginLeft: 'auto', color: '#9a7a5a' }} />
                    }
                  </button>
                  {iconBtn(<Pencil size={14} />, () => setModal({ type: 'edit_category', category: cat }), 'Editar categoria')}
                  {iconBtn(
                    deletingId === cat.id ? '…' : <Trash2 size={14} />,
                    () => deleteCategory(cat.id),
                    'Excluir categoria',
                    { color: '#b04040' }
                  )}
                </div>

                {/* Items */}
                {expanded.has(cat.id) && (
                  <div style={{ padding: '0 14px 10px' }}>
                    {/* Add item */}
                    <button
                      onClick={() => setModal({ type: 'add_item', categoryId: cat.id })}
                      style={{
                        width: '100%', padding: '8px', borderRadius: 8, margin: '8px 0',
                        border: '1.5px dashed rgba(147,106,68,0.3)',
                        background: 'transparent', color: '#936a44',
                        fontFamily: '"Outfit", sans-serif', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      }}
                    >
                      <Plus size={13} /> Novo Item
                    </button>

                    {cat.items.length === 0 && (
                      <p style={{ fontSize: 12, color: '#9a7a5a', textAlign: 'center', padding: '8px 0' }}>
                        Nenhum item nesta categoria.
                      </p>
                    )}

                    {cat.items.map(item => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 0',
                        borderBottom: '1px solid rgba(42,27,18,0.06)',
                      }}>
                        {/* Availability toggle */}
                        <button
                          onClick={() => toggleAvailable(item)}
                          title={item.available ? 'Marcar como Esgotado' : 'Marcar como Disponível'}
                          style={{
                            flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                            border: 'none', cursor: 'pointer',
                            background: item.available ? 'rgba(60,180,80,0.12)' : 'rgba(176,64,64,0.12)',
                            color: item.available ? '#2e8b40' : '#b04040',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14,
                          }}
                        >
                          {item.available ? '✓' : '✗'}
                        </button>

                        {/* Item info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{
                              fontSize: 13, fontWeight: 600, color: '#2a1b12',
                              opacity: item.available ? 1 : 0.5,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {item.name}
                            </span>
                            {!item.available && (
                              <span style={{
                                fontSize: 9, fontWeight: 700, color: '#b04040',
                                background: 'rgba(176,64,64,0.1)', borderRadius: 3, padding: '1px 4px',
                                letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
                              }}>
                                Esgotado
                              </span>
                            )}
                            {item.promo_price && item.available && (
                              <Tag size={10} style={{ color: '#936a44', flexShrink: 0 }} />
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#7a5431', display: 'flex', gap: 6 }}>
                            <span>{BRL.format(item.price)}</span>
                            {item.promo_price && (
                              <span style={{ color: '#936a44', fontWeight: 600 }}>
                                → {BRL.format(item.promo_price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          {iconBtn(<Pencil size={13} />, () => setModal({ type: 'edit_item', item }), 'Editar item')}
                          {iconBtn(
                            deletingId === item.id ? '…' : <Trash2 size={13} />,
                            () => deleteItem(item.id),
                            'Excluir item',
                            { color: '#b04040' }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </main>

      {/* Warning banner */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(42,27,18,0.95)', backdropFilter: 'blur(8px)',
        padding: '10px 20px', textAlign: 'center', zIndex: 40,
      }}>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(200,155,106,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <AlertTriangle size={11} />
          Alterações refletem no cardápio digital em tempo real
        </p>
      </div>

      {/* Modals */}
      {(modal.type === 'add_category' || modal.type === 'edit_category') && (
        <CategoryModal
          modal={modal as Extract<ModalState, { type: 'add_category' | 'edit_category' }>}
          onClose={() => setModal({ type: 'none' })}
          onSaved={loadData}
        />
      )}
      {(modal.type === 'add_item' || modal.type === 'edit_item') && (
        <ItemModal
          modal={modal as Extract<ModalState, { type: 'add_item' | 'edit_item' }>}
          onClose={() => setModal({ type: 'none' })}
          onSaved={loadData}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Root
──────────────────────────────────────────────────────────────── */
export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f4ebe1', fontFamily: '"Outfit", sans-serif',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(147,106,68,0.15)',
          borderTopColor: '#936a44',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) return <LoginScreen />;
  return <Dashboard session={session} />;
}
