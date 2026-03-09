import { getDb } from '../client';
import type { Beer, BeerSearchParams, BeerStats } from '../../lib/types/Beer';

export class BeerRepository {
  private get sql() {
    return getDb();
  }

  async findAll(params: BeerSearchParams = {}): Promise<{ beers: Beer[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(params.status);
    }
    if (params.style) {
      conditions.push(`style ILIKE $${paramIndex++}`);
      values.push(`%${params.style}%`);
    }
    if (params.availability) {
      conditions.push(`availability = $${paramIndex++}`);
      values.push(params.availability);
    }
    if (params.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR brief_description ILIKE $${paramIndex} OR style ILIKE $${paramIndex})`);
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortColumn = params.sortBy || 'name';
    const sortDir = params.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM beers ${where}`;
    const countResult = await this.sql.unsafe(countQuery, values as (string | number | boolean | null)[]);
    const total = parseInt(countResult[0].total as string, 10);

    const dataQuery = `SELECT * FROM beers ${where} ORDER BY ${sortColumn} ${sortDir} LIMIT ${limit} OFFSET ${offset}`;
    const rows = await this.sql.unsafe(dataQuery, values as (string | number | boolean | null)[]);

    return { beers: rows as unknown as Beer[], total };
  }

  async findByUuid(uuid: string): Promise<Beer | null> {
    const rows = await this.sql`SELECT * FROM beers WHERE uuid = ${uuid}`;
    return (rows[0] as unknown as Beer) || null;
  }

  async findBySlug(slug: string): Promise<Beer | null> {
    const rows = await this.sql`SELECT * FROM beers WHERE slug = ${slug}`;
    return (rows[0] as unknown as Beer) || null;
  }

  async create(beer: Omit<Beer, 'created_at' | 'updated_at'>): Promise<Beer> {
    const rows = await this.sql`
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
        ${beer.aroma || null}, ${beer.appearance || null}, ${(beer as Record<string, unknown>).content as string || null},
        ${(beer as Record<string, unknown>).markdown as string || null}
      )
      RETURNING *
    `;
    return rows[0] as unknown as Beer;
  }

  async update(uuid: string, data: Partial<Beer>): Promise<Beer | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const updatableFields = [
      'name', 'slug', 'image', 'abv', 'ibu', 'srm', 'style', 'status',
      'availability', 'brief_description', 'featured', 'barrel_aged', 'tapped_on',
      'grain_bill', 'hops', 'malts', 'yeast', 'flavor_profile', 'aroma',
      'appearance', 'content', 'markdown',
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

    const query = `UPDATE beers SET ${setClauses.join(', ')} WHERE uuid = $${paramIndex} RETURNING *`;
    const rows = await this.sql.unsafe(query, values as (string | number | boolean | null)[]);
    return (rows[0] as unknown as Beer) || null;
  }

  async delete(uuid: string): Promise<boolean> {
    const rows = await this.sql`DELETE FROM beers WHERE uuid = ${uuid} RETURNING uuid`;
    return rows.length > 0;
  }

  async getStats(): Promise<BeerStats> {
    const rows = await this.sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'on-tap')::int as "onTap",
        COUNT(*) FILTER (WHERE status = 'seasonal')::int as seasonal,
        COUNT(*) FILTER (WHERE status = 'coming-soon')::int as "comingSoon",
        COUNT(*) FILTER (WHERE status = 'limited-edition')::int as "limitedEdition",
        COUNT(*) FILTER (WHERE status = 'sold-out')::int as "soldOut",
        COUNT(*) FILTER (WHERE status = 'archived')::int as archived,
        COUNT(*) FILTER (WHERE status = 'retired')::int as retired
      FROM beers
    `;
    return rows[0] as unknown as BeerStats;
  }
}
