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
