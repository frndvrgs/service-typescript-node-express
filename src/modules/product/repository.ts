import { getPool } from '../../shared/database'

export async function list() {
  const pool = getPool()
  const sql = 'SELECT id, name, price_cents, category FROM products ORDER BY name ASC'
  const { rows } = await pool.query(sql)
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price_cents) / 100,
    category: row.category,
  }))
}

export async function read(id: string) {
  const pool = getPool()
  const sql = 'SELECT id, name, price_cents, category FROM products WHERE id = $1 LIMIT 1'
  const { rows } = await pool.query(sql, [id])
  const row = rows[0]
  return row
    ? {
        id: String(row.id),
        name: String(row.name),
        price: Number(row.price_cents) / 100,
        category: row.category,
      }
    : null
}
