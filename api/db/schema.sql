-- Broken Loop Brewing DB Schema
-- Database: PostgreSQL (Neon serverless)

CREATE TABLE IF NOT EXISTS beers (
  uuid          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  image         TEXT,
  abv           TEXT,
  ibu           TEXT,
  srm           TEXT,
  style         TEXT,
  status        TEXT NOT NULL DEFAULT 'coming-soon',
  availability  TEXT,
  brief_description TEXT,
  featured      BOOLEAN DEFAULT false,
  barrel_aged   BOOLEAN DEFAULT false,
  tapped_on     TEXT,
  grain_bill    TEXT,
  hops          TEXT,
  malts         TEXT,
  yeast         TEXT,
  flavor_profile TEXT,
  aroma         TEXT,
  appearance    TEXT,
  content       TEXT,
  markdown      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_items (
  uuid          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  image         TEXT,
  price         TEXT,
  category      TEXT NOT NULL DEFAULT 'mains',
  brief_description TEXT,
  ingredients   TEXT,
  prep_time     TEXT,
  spice_level   TEXT,
  dietary_notes TEXT,
  available     BOOLEAN DEFAULT true,
  featured      BOOLEAN DEFAULT false,
  seasonal      BOOLEAN DEFAULT false,
  content       TEXT,
  markdown      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  uuid          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  image         TEXT,
  date          TEXT,
  time          TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  category      TEXT NOT NULL DEFAULT 'tasting',
  brief_description TEXT,
  price         TEXT,
  capacity      TEXT,
  location      TEXT,
  featured      BOOLEAN DEFAULT false,
  recurring     TEXT,
  organizer     TEXT,
  artist        TEXT,
  genre         TEXT,
  registration_required BOOLEAN DEFAULT false,
  contact_info  TEXT,
  tags          TEXT[],
  content       TEXT,
  markdown      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beers_slug ON beers(slug);
CREATE INDEX IF NOT EXISTS idx_beers_status ON beers(status);
CREATE INDEX IF NOT EXISTS idx_beers_style ON beers(style);

CREATE INDEX IF NOT EXISTS idx_food_slug ON food_items(slug);
CREATE INDEX IF NOT EXISTS idx_food_category ON food_items(category);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
