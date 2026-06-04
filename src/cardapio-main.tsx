import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './cardapio.css';
import Cardapio from './Cardapio';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Cardapio />
  </StrictMode>,
);
