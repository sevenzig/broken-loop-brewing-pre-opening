import { getDb } from '../client';

export interface FoodItem {
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
  available: boolean;
  featured: boolean;
  seasonal: boolean;
  content?: string;
  markdown?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodSearchParams {
  category?: string;
  search?: string;
  available?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FoodStats {
  total: number;
  available: number;
  featured: number;
  appetizers: number;
  mains: number;
  sides: number;
  specials: number;
  seasonal: number;
}

export class FoodRepository {
  private get sql() {
    return getDb();
  }

  async findAll(params: FoodSearchParams = {}): Promise<{ food: FoodItem[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params.category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(params.category);
    }
    if (params.available !== undefined) {
      conditions.push(`available = $${paramIndex++}`);
      values.push(params.available);
    }
    if (params.featured !== undefined) {
      conditions.push(`featured = $${paramIndex++}`);
      values.push(params.featured);
    }
    if (params.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR brief_description ILIKE $${paramIndex})`);
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortColumn = params.sortBy || 'name';
    const sortDir = params.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;

    const countResult = await this.sql.unsafe(`SELECT COUNT(*) as total FROM food_items ${where}`, values as (string | number | boolean | null)[]);
    const total = parseInt(countResult[0].total as string, 10);

    const dataQuery = `SELECT * FROM food_items ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT ${limit} OFFSET ${offset}`;
    const rows = await this.sql.unsafe(dataQuery, values as (string | number | boolean | null)[]);

    return { food: rows as unknown as FoodItem[], total };
  }

  async findByUuid(uuid: string): Promise<FoodItem | null> {
    const rows = await this.sql`SELECT * FROM food_items WHERE uuid = ${uuid}`;
    return (rows[0] as unknown as FoodItem) || null;
  }

  async findBySlug(slug: string): Promise<FoodItem | null> {
    const rows = await this.sql`SELECT * FROM food_items WHERE slug = ${slug}`;
    return (rows[0] as unknown as FoodItem) || null;
  }

  async create(food: Omit<FoodItem, 'created_at' | 'updated_at'>): Promise<FoodItem> {
    const rows = await this.sql`
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
      RETURNING *
    `;
    return rows[0] as unknown as FoodItem;
  }

  async update(uuid: string, data: Partial<FoodItem>): Promise<FoodItem | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const updatableFields = [
      'name', 'slug', 'image', 'price', 'category', 'brief_description',
      'ingredients', 'prep_time', 'spice_level', 'dietary_notes',
      'available', 'featured', 'seasonal', 'content', 'markdown',
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

    const query = `UPDATE food_items SET ${setClauses.join(', ')} WHERE uuid = $${paramIndex} RETURNING *`;
    const rows = await this.sql.unsafe(query, values as (string | number | boolean | null)[]);
    return (rows[0] as unknown as FoodItem) || null;
  }

  async delete(uuid: string): Promise<boolean> {
    const rows = await this.sql`DELETE FROM food_items WHERE uuid = ${uuid} RETURNING uuid`;
    return rows.length > 0;
  }

  async getStats(): Promise<FoodStats> {
    const rows = await this.sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE available = true)::int as available,
        COUNT(*) FILTER (WHERE featured = true)::int as featured,
        COUNT(*) FILTER (WHERE category = 'appetizers')::int as appetizers,
        COUNT(*) FILTER (WHERE category = 'mains')::int as mains,
        COUNT(*) FILTER (WHERE category = 'sides')::int as sides,
        COUNT(*) FILTER (WHERE category = 'specials')::int as specials,
        COUNT(*) FILTER (WHERE seasonal = true)::int as seasonal
      FROM food_items
    `;
    return rows[0] as unknown as FoodStats;
  }
}
