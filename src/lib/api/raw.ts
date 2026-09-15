/**
 * Raw shapes returned by the existing Laravel backend, as observed on
 * 2026-09-14 (see docs/01-analyse-existant.md). Kept deliberately loose:
 * the backend mixes French and English keys and returns numbers as strings.
 * Nothing in the UI imports this file — only the adapters do.
 */

export type RawI18n = string | { fr?: string; en?: string; ar?: string } | null | undefined;

export type RawCategory = {
  id: number;
  public_id?: string;
  restaurant_id?: number;
  nom?: string;
  name?: string;
  actif?: boolean;
  active?: boolean;
  quantity?: number;
  produits_count?: number;
  photo_url?: string | null;
  img?: string | null;
  created_at?: string;
};

export type RawProduct = {
  id: number;
  public_id?: string;
  restaurant_id?: number;
  categorie_id?: number;
  categoryId?: number;
  nom?: string;
  name?: string;
  prix_vente?: string | number;
  price?: string | number;
  actif?: boolean;
  active?: boolean;
  sold?: number | string;
  description?: RawI18n;
  ingredients?: RawI18n;
  photo_url?: string | null;
  img?: string | null;
  photo?: string | null;
  created_at?: string;
  categorie?: RawCategory | null;
  category?: string;
};

export type RawPaginated<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

export type RawSupplement = {
  id: number;
  public_id?: string;
  restaurant_id?: number;
  nom: string;
  prix_vente: string | number;
  actif?: boolean;
  categorie_ids?: number[];
};

export type RawObservation = {
  id: number;
  public_id?: string;
  restaurant_id?: number;
  nom: string;
  actif?: boolean;
  categorie_ids?: number[];
};

export type RawRestaurant = {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
  horaires: string | null;
};

export type RawServiceStatus = { restaurant_id: number; is_open: boolean; session_id?: number };

export type RawDistrict = {
  id: number;
  public_id?: string;
  restaurant_id: number;
  district_name: string;
  delivery_price: number | string;
};

export type RawOrderDetail = {
  id: number;
  parent_id?: number | null;
  is_supplement?: boolean;
  is_observation?: boolean;
  produit?: RawProduct | null;
  quantite?: number | string;
  prix_unitaire?: number | string;
  total_ligne?: number | string;
};

export type RawOrder = {
  id?: number;
  public_id?: string;
  order_reference?: string;
  numero_commande?: string;
  ticket_no?: string;
  numero_ticket?: string;
  date_vente?: string;
  created_at?: string;
  statut?: string;
  restaurant_id?: number;
  type_commande?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_note?: string;
  comment?: string;
  delivery_district_name?: string;
  delivery_fee?: number | string;
  total_ttc?: number | string;
  total_apres_remise?: number | string;
  promo_code_pourcentage?: number | string;
  use_score?: number | string;
  client?: { nom?: string; name?: string; telephone?: string; adresse?: string; quartier?: string } | null;
  details?: RawOrderDetail[];
};

export type RawUser = {
  id?: number | string;
  _id?: number | string;
  name?: string;
  nom?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  number?: string;
  telephone?: string;
  address?: string;
  adresse?: string;
  district?: string;
  quartier?: string;
  score?: number | string;
  points?: number | string;
  profileState?: string;
  role?: string;
  roles?: { name: string }[];
};

export type RawLoginResponse = {
  access_token: string;
  auth_kind?: "client" | "user";
  user: RawUser;
  message?: string;
};

export type RawPromo = {
  id?: number;
  promo_code: string;
  pourcentage: number | string;
  message?: string;
};

export type RawCreateOrderResponse = {
  message?: string;
  order?: RawOrder;
  data?: RawOrder;
} & Partial<RawOrder>;
