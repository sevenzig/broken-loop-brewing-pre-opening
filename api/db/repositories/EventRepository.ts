import { getDb } from '../client';

export interface EventItem {
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
  featured: boolean;
  recurring?: string;
  organizer?: string;
  artist?: string;
  genre?: string;
  registration_required: boolean;
  contact_info?: string;
  tags?: string[];
  content?: string;
  markdown?: string;
  created_at: string;
  updated_at: string;
}

export interface EventSearchParams {
  status?: string;
  category?: string;
  search?: string;
  featured?: boolean;
  upcoming?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EventStats {
  total: number;
  active: number;
  upcoming: number;
  featured: number;
  recurring: number;
  trivia: number;
  liveMusic: number;
  tasting: number;
}

export class EventRepository {
  private get sql() {
    return getDb();
  }

  async findAll(params: EventSearchParams = {}): Promise<{ events: EventItem[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(params.status);
    }
    if (params.category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(params.category);
    }
    if (params.featured !== undefined) {
      conditions.push(`featured = $${paramIndex++}`);
      values.push(params.featured);
    }
    if (params.upcoming) {
      conditions.push(`date >= $${paramIndex++}`);
      values.push(new Date().toISOString().split('T')[0]);
    }
    if (params.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR brief_description ILIKE $${paramIndex})`);
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortColumn = params.sortBy || 'date';
    const sortDir = params.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;

    const countResult = await this.sql.unsafe(`SELECT COUNT(*) as total FROM events ${where}`, values as (string | number | boolean | null)[]);
    const total = parseInt(countResult[0].total as string, 10);

    const dataQuery = `SELECT * FROM events ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT ${limit} OFFSET ${offset}`;
    const rows = await this.sql.unsafe(dataQuery, values as (string | number | boolean | null)[]);

    return { events: rows as unknown as EventItem[], total };
  }

  async findByUuid(uuid: string): Promise<EventItem | null> {
    const rows = await this.sql`SELECT * FROM events WHERE uuid = ${uuid}`;
    return (rows[0] as unknown as EventItem) || null;
  }

  async findBySlug(slug: string): Promise<EventItem | null> {
    const rows = await this.sql`SELECT * FROM events WHERE slug = ${slug}`;
    return (rows[0] as unknown as EventItem) || null;
  }

  async create(event: Omit<EventItem, 'created_at' | 'updated_at'>): Promise<EventItem> {
    const rows = await this.sql`
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
      RETURNING *
    `;
    return rows[0] as unknown as EventItem;
  }

  async update(uuid: string, data: Partial<EventItem>): Promise<EventItem | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const updatableFields = [
      'name', 'slug', 'image', 'date', 'time', 'status', 'category',
      'brief_description', 'price', 'capacity', 'location', 'featured',
      'recurring', 'organizer', 'artist', 'genre', 'registration_required',
      'contact_info', 'tags', 'content', 'markdown',
    ];

    for (const field of updatableFields) {
      if (field in data) {
        setClauses.push(`${field} = $${paramIndex++}`);
        values.push((data as Record<string, unknown>)[field]);
      }
    }

    if (setClauses.length === 0) return this.findByUuid(uuid);

    setClauses.push(`updated_at = NOW()`);
    values.push(uuid);

    const query = `UPDATE events SET ${setClauses.join(', ')} WHERE uuid = $${paramIndex} RETURNING *`;
    const rows = await this.sql.unsafe(query, values as (string | number | boolean | null)[]);
    return (rows[0] as unknown as EventItem) || null;
  }

  async delete(uuid: string): Promise<boolean> {
    const rows = await this.sql`DELETE FROM events WHERE uuid = ${uuid} RETURNING uuid`;
    return rows.length > 0;
  }

  async getStats(): Promise<EventStats> {
    const today = new Date().toISOString().split('T')[0];
    const rows = await this.sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'active')::int as active,
        COUNT(*) FILTER (WHERE date >= ${today})::int as upcoming,
        COUNT(*) FILTER (WHERE featured = true)::int as featured,
        COUNT(*) FILTER (WHERE recurring IS NOT NULL)::int as recurring,
        COUNT(*) FILTER (WHERE category = 'trivia')::int as trivia,
        COUNT(*) FILTER (WHERE category = 'live-music')::int as "liveMusic",
        COUNT(*) FILTER (WHERE category = 'tasting')::int as tasting
      FROM events
    `;
    return rows[0] as unknown as EventStats;
  }
}
