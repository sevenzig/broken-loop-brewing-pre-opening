import * as fs from 'fs';
import * as path from 'path';
import { getDb } from './client';
import { runMigrations } from './migrate';

interface JsonBeer {
  uuid: string;
  name: string;
  slug: string;
  image: string;
  abv: string;
  ibu: string;
  srm: string;
  style: string;
  status: string;
  availability?: string;
  brief_description: string;
  featured?: boolean;
  barrel_aged?: boolean;
  tapped_on?: string;
  grain_bill?: string;
  hops?: string;
  malts?: string;
  yeast?: string;
  flavor_profile?: string;
  aroma?: string;
  appearance?: string;
  content?: string;
  markdown?: string;
}

interface JsonFood {
  uuid: string;
  name: string;
  slug: string;
  image: string;
  price: string;
  category: string;
  brief_description: string;
  ingredients?: string;
  prep_time?: string;
  spice_level?: string;
  dietary_notes?: string;
  available?: boolean;
  featured?: boolean;
  seasonal?: boolean;
  content?: string;
  markdown?: string;
}

interface JsonEvent {
  uuid: string;
  name: string;
  slug: string;
  image: string;
  date: string;
  time: string;
  status: string;
  category: string;
  brief_description: string;
  price?: string;
  capacity?: string;
  location?: string;
  featured?: boolean;
  recurring?: string;
  organizer?: string;
  artist?: string;
  genre?: string;
  registration_required?: boolean;
  contact_info?: string;
  tags?: string[];
  content?: string;
  markdown?: string;
}

function resolveDataPath(filename: string): string {
  const candidates = [
    path.join(__dirname, '..', '..', 'public', 'data', filename),
    path.join(process.cwd(), 'public', 'data', filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Could not find ${filename} in any expected location`);
}

async function seedBeers(sql: ReturnType<typeof getDb>): Promise<number> {
  const filePath = resolveDataPath('beers.json');
  const beers: JsonBeer[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let count = 0;

  for (const beer of beers) {
    try {
      await sql`
        INSERT INTO beers (
          uuid, name, slug, image, abv, ibu, srm, style, status, availability,
          brief_description, featured, barrel_aged, tapped_on, grain_bill,
          hops, malts, yeast, flavor_profile, aroma, appearance, content, markdown
        ) VALUES (
          ${beer.uuid}, ${beer.name}, ${beer.slug}, ${beer.image}, ${beer.abv},
          ${beer.ibu}, ${beer.srm}, ${beer.style}, ${beer.status}, ${beer.availability || null},
          ${beer.brief_description}, ${beer.featured || false}, ${beer.barrel_aged || false},
          ${beer.tapped_on || null}, ${beer.grain_bill || null}, ${beer.hops || null},
          ${beer.malts || null}, ${beer.yeast || null}, ${beer.flavor_profile || null},
          ${beer.aroma || null}, ${beer.appearance || null}, ${beer.content || null},
          ${beer.markdown || null}
        )
        ON CONFLICT (uuid) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug, image = EXCLUDED.image,
          abv = EXCLUDED.abv, ibu = EXCLUDED.ibu, srm = EXCLUDED.srm,
          style = EXCLUDED.style, status = EXCLUDED.status,
          availability = EXCLUDED.availability,
          brief_description = EXCLUDED.brief_description,
          featured = EXCLUDED.featured, barrel_aged = EXCLUDED.barrel_aged,
          tapped_on = EXCLUDED.tapped_on, grain_bill = EXCLUDED.grain_bill,
          hops = EXCLUDED.hops, malts = EXCLUDED.malts, yeast = EXCLUDED.yeast,
          flavor_profile = EXCLUDED.flavor_profile, aroma = EXCLUDED.aroma,
          appearance = EXCLUDED.appearance, content = EXCLUDED.content,
          markdown = EXCLUDED.markdown, updated_at = NOW()
      `;
      count++;
    } catch (err) {
      console.error(`Failed to seed beer "${beer.name}":`, err);
    }
  }

  return count;
}

async function seedFood(sql: ReturnType<typeof getDb>): Promise<number> {
  const filePath = resolveDataPath('food.json');
  const foodItems: JsonFood[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let count = 0;

  for (const food of foodItems) {
    try {
      await sql`
        INSERT INTO food_items (
          uuid, name, slug, image, price, category, brief_description,
          ingredients, prep_time, spice_level, dietary_notes,
          available, featured, seasonal, content, markdown
        ) VALUES (
          ${food.uuid}, ${food.name}, ${food.slug}, ${food.image}, ${food.price},
          ${food.category}, ${food.brief_description},
          ${food.ingredients || null}, ${food.prep_time || null},
          ${food.spice_level || null}, ${food.dietary_notes || null},
          ${food.available ?? true}, ${food.featured ?? false},
          ${food.seasonal ?? false}, ${food.content || null}, ${food.markdown || null}
        )
        ON CONFLICT (uuid) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug, image = EXCLUDED.image,
          price = EXCLUDED.price, category = EXCLUDED.category,
          brief_description = EXCLUDED.brief_description,
          ingredients = EXCLUDED.ingredients, prep_time = EXCLUDED.prep_time,
          spice_level = EXCLUDED.spice_level, dietary_notes = EXCLUDED.dietary_notes,
          available = EXCLUDED.available, featured = EXCLUDED.featured,
          seasonal = EXCLUDED.seasonal, content = EXCLUDED.content,
          markdown = EXCLUDED.markdown, updated_at = NOW()
      `;
      count++;
    } catch (err) {
      console.error(`Failed to seed food "${food.name}":`, err);
    }
  }

  return count;
}

async function seedEvents(sql: ReturnType<typeof getDb>): Promise<number> {
  const filePath = resolveDataPath('events.json');
  const events: JsonEvent[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let count = 0;

  for (const event of events) {
    try {
      await sql`
        INSERT INTO events (
          uuid, name, slug, image, date, time, status, category,
          brief_description, price, capacity, location, featured,
          recurring, organizer, artist, genre, registration_required,
          contact_info, tags, content, markdown
        ) VALUES (
          ${event.uuid}, ${event.name}, ${event.slug}, ${event.image},
          ${event.date}, ${event.time}, ${event.status}, ${event.category},
          ${event.brief_description}, ${event.price || null}, ${event.capacity || null},
          ${event.location || null}, ${event.featured ?? false},
          ${event.recurring || null}, ${event.organizer || null},
          ${event.artist || null}, ${event.genre || null},
          ${event.registration_required ?? false}, ${event.contact_info || null},
          ${event.tags || null}, ${event.content || null}, ${event.markdown || null}
        )
        ON CONFLICT (uuid) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug, image = EXCLUDED.image,
          date = EXCLUDED.date, time = EXCLUDED.time, status = EXCLUDED.status,
          category = EXCLUDED.category, brief_description = EXCLUDED.brief_description,
          price = EXCLUDED.price, capacity = EXCLUDED.capacity,
          location = EXCLUDED.location, featured = EXCLUDED.featured,
          recurring = EXCLUDED.recurring, organizer = EXCLUDED.organizer,
          artist = EXCLUDED.artist, genre = EXCLUDED.genre,
          registration_required = EXCLUDED.registration_required,
          contact_info = EXCLUDED.contact_info, tags = EXCLUDED.tags,
          content = EXCLUDED.content, markdown = EXCLUDED.markdown,
          updated_at = NOW()
      `;
      count++;
    } catch (err) {
      console.error(`Failed to seed event "${event.name}":`, err);
    }
  }

  return count;
}

export async function seed(): Promise<void> {
  const sql = getDb();

  console.log('Starting database seed...');

  await runMigrations();

  const beerCount = await seedBeers(sql);
  console.log(`Seeded ${beerCount} beers`);

  const foodCount = await seedFood(sql);
  console.log(`Seeded ${foodCount} food items`);

  const eventCount = await seedEvents(sql);
  console.log(`Seeded ${eventCount} events`);

  console.log('Database seed completed successfully.');
}

if (require.main === module) {
  import('dotenv').then(dotenv => {
    dotenv.config({ path: path.join(__dirname, '..', '.env') });
    dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
    seed()
      .then(() => {
        console.log('Done.');
        process.exit(0);
      })
      .catch(err => {
        console.error('Seed failed:', err);
        process.exit(1);
      });
  });
}
