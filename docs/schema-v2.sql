-- ILMS Schema v2 - Categories as a real taxonomy
-- Run this AFTER schema.sql in Supabase SQL Editor.
-- Adds a categories table and converts courses.category from free text to a FK.

-- ============================================
-- CATEGORIES TABLE
-- ============================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_categories_updated_at
  before update on categories for each row execute function update_updated_at();

-- ============================================
-- MIGRATE COURSES.CATEGORY -> FK
-- ============================================

-- Add new uuid column
alter table courses add column category_id uuid;

-- Populate it from existing text category values
update courses c
set category_id = cat.id
from categories cat
where cat.slug = lower(replace(c.category, ' ', '-'))
  and c.category is not null;

-- Make not-null after migration (skipped: keep nullable to allow no-category courses)

-- Add the FK + index
alter table courses
  add constraint fk_courses_category
  foreign key (category_id) references categories(id) on delete set null;

create index idx_courses_category_id on courses(category_id);

-- Drop the old text column now that data has been migrated.
-- Keep the column commented for one release so we can roll back if needed.
-- alter table courses drop column category;

-- ============================================
-- SEED COMMON CATEGORIES
-- ============================================

insert into categories (slug, name, description, sort_order) values
  ('compliance', 'Compliance', 'Regulatory and policy training', 10),
  ('onboarding', 'Onboarding', 'New hire and orientation', 20),
  ('leadership', 'Leadership', 'Management and people skills', 30),
  ('technical', 'Technical', 'Engineering and IT skills', 40),
  ('safety', 'Safety', 'Workplace health and safety', 50),
  ('soft-skills', 'Soft Skills', 'Communication, productivity, well-being', 60),
  ('sales', 'Sales', 'Selling, negotiation, customer success', 70),
  ('product', 'Product', 'Product knowledge and enablement', 80);
