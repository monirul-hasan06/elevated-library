-- Elevated Library Supabase schema, RLS, functions, and seed data
-- Run this entire file in Supabase SQL Editor before deploying.

create extension if not exists pgcrypto;

-- -----------------------------
-- Enums through check constraints for easier Supabase compatibility
-- -----------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  full_name text,
  phone text,
  bio text,
  avatar_url text,
  role text not null default 'customer' check (role in ('owner','admin','super_admin','order_manager','product_manager','payment_manager','support_agent','marketing_manager','viewer','customer')),
  status text not null default 'active' check (status in ('active','suspended','banned','archived','deleted')),
  preferred_language text not null default 'bn_mix' check (preferred_language in ('bn_mix','en')),
  preferred_theme text not null default 'light' check (preferred_theme in ('light','dark','system')),
  internal_note text,
  hourly_rate numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null,
  name_en text not null,
  slug text not null unique,
  description_bn text,
  description_en text,
  icon text default 'BookOpen',
  status text not null default 'active' check (status in ('active','hidden','archived','deleted')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title_bn text not null,
  title_en text not null,
  slug text not null unique,
  short_hook_bn text,
  short_hook_en text,
  description_bn text,
  description_en text,
  what_you_learn_bn text,
  what_you_learn_en text,
  who_is_for_bn text,
  who_is_for_en text,
  inside_pdf_bn text,
  inside_pdf_en text,
  preview_text_bn text,
  preview_text_en text,
  cover_url text,
  file_key text,
  price numeric(10,2) not null default 0,
  discount_price numeric(10,2),
  status text not null default 'active' check (status in ('active','hidden','draft','archived','deleted')),
  featured boolean not null default false,
  popular_score int not null default 0,
  download_limit int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_categories (
  product_id uuid references public.products(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  method text not null check (method in ('bkash','nagad','rocket','bank','other')),
  label text not null,
  account_type text,
  account_number text,
  account_holder text,
  instructions_bn text,
  instructions_en text,
  qr_url text,
  status text not null default 'active' check (status in ('active','hidden','archived','deleted')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  payment_method text not null check (payment_method in ('bkash','nagad','rocket','bank','other')),
  trx_id text not null,
  sender_phone text not null,
  guest_email text,
  guest_name text,
  access_token text unique,
  access_token_encrypted text,
  token_expires_at timestamptz,
  download_uses int not null default 0,
  status text not null default 'pending' check (status in ('pending','verified','rejected','expired','archived','deleted')),
  admin_note text,
  verified_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.orders add column if not exists access_token_encrypted text;
create unique index if not exists orders_trx_id_lower_unique on public.orders (lower(trim(trx_id)));
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_token_idx on public.orders(access_token) where access_token is not null;

create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  ip text,
  user_agent text,
  download_type text not null default 'signed_url',
  created_at timestamptz not null default now()
);

create table if not exists public.upcoming_pdfs (
  id uuid primary key default gen_random_uuid(),
  title_bn text not null,
  title_en text not null,
  slug text not null unique,
  description_bn text,
  description_en text,
  cover_url text,
  category_id uuid references public.categories(id) on delete set null,
  expected_release_date date,
  estimated_price numeric(10,2),
  notify_enabled boolean not null default true,
  status text not null default 'active' check (status in ('active','hidden','published','archived','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.notify_subscribers (
  id uuid primary key default gen_random_uuid(),
  upcoming_pdf_id uuid not null references public.upcoming_pdfs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  guest_phone text,
  status text not null default 'active' check (status in ('active','unsubscribed','notified')),
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(upcoming_pdf_id, guest_email),
  unique(upcoming_pdf_id, user_id)
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_bn text not null,
  answer_bn text not null,
  question_en text not null,
  answer_en text not null,
  category text not null default 'General',
  show_on_home boolean not null default true,
  show_on_checkout boolean not null default false,
  show_on_download boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden','archived','deleted')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title_bn text not null,
  message_bn text not null,
  title_en text not null,
  message_en text not null,
  type text not null default 'info' check (type in ('info','success','warning','error','offer','maintenance','launch')),
  position text not null default 'top_bar' check (position in ('top_bar','popup','dashboard','checkout','download','banner')),
  target text not null default 'all' check (target in ('all','visitors','logged_in','pending_orders','verified_customers','staff')),
  closable boolean not null default true,
  require_ack boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden','scheduled','expired','archived','deleted')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Elevated Library',
  owner_email text not null default 'dev.get.in.touch@gmail.com',
  facebook_url text not null default 'https://www.facebook.com/ElevatedLibrary',
  messenger_url text not null default 'https://www.facebook.com/ElevatedLibrary',
  logo_url text,
  favicon_url text,
  primary_color text default '#6d28d9',
  default_language text default 'bn_mix',
  default_theme text default 'light',
  site_mode text not null default 'normal' check (site_mode in ('normal','guest')),
  pwa_install_enabled boolean not null default true,
  welcome_notice_enabled boolean not null default true,
  welcome_notice_bn text not null default 'Welcome to Elevated Library!',
  welcome_notice_en text not null default 'Welcome to Elevated Library!',
  hero_title_bn text default 'Elevated Library থেকে Premium PDF কিনুন',
  hero_title_en text default 'Buy Premium PDFs from Elevated Library',
  hero_subtitle_bn text default 'Mindset, Confidence, Communication, Relationship, Discipline এবং self-growth PDF এক জায়গায়।',
  hero_subtitle_en text default 'Mindset, confidence, communication, relationship, discipline, and self-growth PDFs in one place.',
  hero_button_bn text default 'PDF দেখুন',
  hero_button_en text default 'Explore PDFs',
  footer_description_bn text default 'Bangladeshi learners-এর জন্য practical self-growth PDF library.',
  footer_description_en text default 'A practical self-growth PDF library for Bangladeshi learners.',
  support_text_bn text default 'Payment বা download নিয়ে problem? Facebook page এ knock করুন।',
  support_text_en text default 'Need help with payment or download? Message us on Facebook.',
  updated_at timestamptz not null default now()
);

create table if not exists public.static_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_bn text not null,
  title_en text not null,
  body_bn text not null,
  body_en text not null,
  status text not null default 'active' check (status in ('active','hidden','archived','deleted')),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_work_sessions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  break_minutes int not null default 0,
  approved_minutes int,
  status text not null default 'active' check (status in ('active','ended','approved','rejected')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_payroll (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  total_minutes int not null default 0,
  hourly_rate numeric(10,2) not null default 0,
  bonus numeric(10,2) not null default 0,
  deduction numeric(10,2) not null default 0,
  amount numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','paid','partial','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.staff_performance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  work_score numeric(5,2) not null default 0,
  task_score numeric(5,2) not null default 0,
  accuracy_score numeric(5,2) not null default 0,
  owner_rating numeric(5,2) not null default 0,
  final_score numeric(5,2) not null default 0,
  badge text,
  created_at timestamptz not null default now()
);

-- -----------------------------
-- Trigger helpers
-- -----------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','categories','products','payment_methods','orders','upcoming_pdfs','faqs','notices','site_settings'] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role <> 'customer' and status = 'active');
$$;

create or replace function public.is_owner_or_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('owner','admin') and status = 'active');
$$;

create or replace function public.expire_pending_orders()
returns integer language plpgsql security definer set search_path = public as $$
declare affected_count integer;
begin
  update public.orders set status = 'expired', updated_at = now()
  where status = 'pending' and created_at < now() - interval '48 hours';
  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

-- -----------------------------
-- RLS
-- -----------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.payment_methods enable row level security;
alter table public.orders enable row level security;
alter table public.download_logs enable row level security;
alter table public.upcoming_pdfs enable row level security;
alter table public.notify_subscribers enable row level security;
alter table public.faqs enable row level security;
alter table public.notices enable row level security;
alter table public.site_settings enable row level security;
alter table public.static_pages enable row level security;
alter table public.audit_logs enable row level security;
alter table public.staff_work_sessions enable row level security;
alter table public.staff_payroll enable row level security;
alter table public.staff_performance enable row level security;

-- Drop old policies safely
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Public readable active content
create policy "public read active categories" on public.categories for select to anon, authenticated using (status='active');
create policy "public read active products" on public.products for select to anon, authenticated using (status='active');
create policy "public read product categories" on public.product_categories for select to anon, authenticated using (true);
create policy "public read active payment methods" on public.payment_methods for select to anon, authenticated using (status='active');
create policy "public read active upcoming" on public.upcoming_pdfs for select to anon, authenticated using (status='active');
create policy "public read active faqs" on public.faqs for select to anon, authenticated using (status='active');
create policy "public read active notices" on public.notices for select to anon, authenticated using (status='active');
create policy "public read settings" on public.site_settings for select to anon, authenticated using (id=1);
create policy "public read static pages" on public.static_pages for select to anon, authenticated using (status='active');

-- User own data
create policy "users read own profile" on public.profiles for select to authenticated using (id=auth.uid() or public.is_staff());
create policy "users update own profile basic" on public.profiles for update to authenticated
using (id=auth.uid())
with check (
  id=auth.uid()
  and role = (select role from public.profiles where id=auth.uid())
  and status = (select status from public.profiles where id=auth.uid())
  and hourly_rate = (select hourly_rate from public.profiles where id=auth.uid())
  and internal_note is not distinct from (select internal_note from public.profiles where id=auth.uid())
  and deleted_at is not distinct from (select deleted_at from public.profiles where id=auth.uid())
);
create policy "users read own orders" on public.orders for select to authenticated using (user_id=auth.uid() or public.is_staff());
create policy "users read own notify" on public.notify_subscribers for select to authenticated using (user_id=auth.uid() or public.is_staff());
create policy "users manage own notify" on public.notify_subscribers for all to authenticated using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());

-- Staff can manage through server/API and select dashboard data
create policy "staff full categories" on public.categories for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff full products" on public.products for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff full product categories" on public.product_categories for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff full payment methods" on public.payment_methods for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff update orders" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff full upcoming" on public.upcoming_pdfs for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff full faqs" on public.faqs for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff full notices" on public.notices for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff full settings" on public.site_settings for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff read logs" on public.download_logs for select to authenticated using (public.is_staff());
create policy "staff read audit" on public.audit_logs for select to authenticated using (public.is_staff());
create policy "staff own work sessions" on public.staff_work_sessions for all to authenticated using (staff_id=auth.uid() or public.is_staff()) with check (staff_id=auth.uid() or public.is_staff());
create policy "staff read payroll" on public.staff_payroll for select to authenticated using (staff_id=auth.uid() or public.is_owner_or_admin());
create policy "staff read performance" on public.staff_performance for select to authenticated using (staff_id=auth.uid() or public.is_owner_or_admin());

-- -----------------------------
-- Seed default content
-- -----------------------------
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.categories (name_bn, name_en, slug, description_bn, description_en, sort_order) values
('মাইন্ডসেট','Mindset','mindset','নিজের চিন্তা, attitude আর decision-making improve করার PDF।','PDFs to improve thinking, attitude, and decision-making.',1),
('কনফিডেন্স','Confidence','confidence','Self-confidence, body language এবং social confidence build করার guides।','Guides to build self-confidence, body language, and social confidence.',2),
('কমিউনিকেশন','Communication','communication','কথা বলা, presentation এবং social interaction improve করার PDFs।','PDFs to improve speaking, presentation, and social interaction.',3),
('রিলেশনশিপ','Relationship','relationship','Healthy relationship, boundaries এবং emotional understanding নিয়ে resources।','Resources on healthy relationships, boundaries, and emotional understanding.',4),
('ডিসিপ্লিন','Discipline','discipline','Habit, consistency, focus এবং self-control build করার practical guides।','Practical guides for habit, consistency, focus, and self-control.',5),
('ম্যাসকুলিনিটি','Masculinity','masculinity','Responsible masculinity, leadership, confidence এবং self-respect নিয়ে PDFs।','PDFs on responsible masculinity, leadership, confidence, and self-respect.',6),
('ফেমিনিনিটি','Femininity','femininity','Grace, emotional awareness, confidence এবং personal identity নিয়ে resources।','Resources on grace, emotional awareness, confidence, and personal identity.',7),
('ইমোশনাল ইন্টেলিজেন্স','Emotional Intelligence','emotional-intelligence','Emotion control, empathy এবং self-awareness শেখার PDFs।','PDFs for emotional control, empathy, and self-awareness.',8)
on conflict (slug) do nothing;

insert into public.payment_methods (method,label,account_type,account_number,account_holder,instructions_bn,instructions_en,sort_order,status) values
('bkash','bKash Personal','Personal','01XXXXXXXXX','Elevated Library','Send Money করুন, তারপর TrxID submit করুন।','Send money, then submit your TrxID.',1,'hidden'),
('nagad','Nagad Personal','Personal','01XXXXXXXXX','Elevated Library','Send Money করুন, তারপর TrxID submit করুন।','Send money, then submit your TrxID.',2,'hidden')
on conflict do nothing;

insert into public.faqs (question_bn, answer_bn, question_en, answer_en, category, sort_order, show_on_home, show_on_checkout, show_on_download) values
('কীভাবে PDF কিনবো?','PDF select করুন, Buy Now click করুন, bKash/Nagad payment করে TrxID submit করুন।','How can I buy a PDF?','Select a PDF, click Buy Now, pay via bKash/Nagad, and submit your TrxID.','General',1,true,true,false),
('Payment verify হতে কত সময় লাগে?','Admin manually payment verify করবে। Verification complete হলে order status update হবে।','How long does payment verification take?','Admin manually verifies payments. Your order status will update after verification.','Payment',2,true,true,false),
('PDF share করা যাবে?','না। PDF personal use-এর জন্য এবং unique buyer watermark থাকতে পারে।','Can I share the PDF?','No. PDFs are for personal use and may include a unique buyer watermark.','PDF Usage',3,true,false,true),
('Help লাগলে কোথায় যোগাযোগ করবো?','Facebook support button থেকে Elevated Library page এ knock করুন।','Where can I get help?','Use the Facebook support button to message Elevated Library.','Support',4,true,true,true)
on conflict do nothing;

insert into public.notices (title_bn,message_bn,title_en,message_en,type,position,status) values
('Welcome to Elevated Library!','','Welcome to Elevated Library!','','info','top_bar','hidden')
on conflict do nothing;

insert into public.static_pages (slug,title_bn,title_en,body_bn,body_en) values
('terms','Terms & Conditions','Terms & Conditions','এই PDF গুলো personal use-এর জন্য। Share/resell করা যাবে না।','These PDFs are for personal use only. Sharing or reselling is not allowed.'),
('privacy','Privacy Policy','Privacy Policy','আমরা order, payment verification এবং support-এর জন্য প্রয়োজনীয় data রাখি।','We keep necessary data for orders, payment verification, and support.'),
('refund-policy','Refund Policy','Refund Policy','Manual digital product delivery হওয়ায় refund case-by-case review করা হবে।','Refunds for digital products are reviewed case by case.')
on conflict (slug) do nothing;


-- -----------------------------
-- Latest safe patches for existing databases
-- -----------------------------
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.orders add column if not exists guest_name text;
alter table public.site_settings add column if not exists site_mode text not null default 'normal';
alter table public.site_settings add column if not exists pwa_install_enabled boolean not null default true;
alter table public.site_settings add column if not exists welcome_notice_enabled boolean not null default true;
alter table public.site_settings add column if not exists welcome_notice_bn text not null default 'Welcome to Elevated Library!';
alter table public.site_settings add column if not exists welcome_notice_en text not null default 'Welcome to Elevated Library!';

update public.site_settings
set
  site_mode = coalesce(site_mode, 'normal'),
  pwa_install_enabled = coalesce(pwa_install_enabled, true),
  welcome_notice_enabled = coalesce(welcome_notice_enabled, true),
  welcome_notice_bn = coalesce(welcome_notice_bn, 'Welcome to Elevated Library!'),
  welcome_notice_en = coalesce(welcome_notice_en, 'Welcome to Elevated Library!'),
  updated_at = now()
where id = 1;

update public.notices
set status = 'hidden', updated_at = now()
where position = 'top_bar'
  and (title_bn ilike '%Welcome to Elevated Library%' or title_en ilike '%Welcome to Elevated Library%');


-- Refresh role/site-mode constraints for existing databases
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('owner','admin','super_admin','order_manager','product_manager','payment_manager','support_agent','marketing_manager','viewer','customer'));

alter table public.site_settings drop constraint if exists site_settings_site_mode_check;
alter table public.site_settings add constraint site_settings_site_mode_check check (site_mode in ('normal','guest'));
