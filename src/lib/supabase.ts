import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ubheosijktvvnpgrsylm.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaGVvc2lqa3R2dm5wZ3JzeWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjgzNDUsImV4cCI6MjA5NjE0NDM0NX0.CiyQLUiPwxcQ-4tp-LnVUp-eJNcGut5h4MTbPVnkPVw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Category = {
  id: string;
  name: string;
  emoji: string;
  display_order: number;
  created_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  promo_price: number | null;
  promo_label: string;
  available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CategoryWithItems = Category & { items: MenuItem[] };
