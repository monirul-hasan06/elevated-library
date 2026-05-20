export type Lang = "bn_mix" | "en";
export type ThemeMode = "light" | "dark" | "system";

export type Product = {
  id: string;
  title_bn: string;
  title_en: string;
  slug: string;
  short_hook_bn?: string | null;
  short_hook_en?: string | null;
  description_bn?: string | null;
  description_en?: string | null;
  what_you_learn_bn?: string | null;
  what_you_learn_en?: string | null;
  who_is_for_bn?: string | null;
  who_is_for_en?: string | null;
  inside_pdf_bn?: string | null;
  inside_pdf_en?: string | null;
  preview_text_bn?: string | null;
  preview_text_en?: string | null;
  cover_url?: string | null;
  file_key?: string | null;
  price: number;
  discount_price?: number | null;
  status: string;
  featured: boolean;
  popular_score: number;
  download_limit: number;
};

export type Category = {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
  description_bn?: string | null;
  description_en?: string | null;
  icon?: string | null;
  sort_order: number;
};

export type SiteSettings = {
  site_name: string;
  owner_email: string;
  facebook_url: string;
  messenger_url: string;
  logo_url?: string | null;
  primary_color?: string | null;
  hero_title_bn: string;
  hero_title_en: string;
  hero_subtitle_bn: string;
  hero_subtitle_en: string;
  hero_button_bn: string;
  hero_button_en: string;
  footer_description_bn: string;
  footer_description_en: string;
  support_text_bn: string;
  support_text_en: string;
};
