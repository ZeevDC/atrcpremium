// Step 9: Admin analytics — views per material, unique viewers, top materials
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { materialViews, materials } from '../../../../db/schema.js';
import { count, countDistinct, desc } from 'drizzle-orm';
import { requireAdmin } from '../../middleware.js';

export { requireAdmin };

export default async function handler(_req: Request, res: Response) {
  try {
    // Total views per material
    const viewRows = await db
      .select({
        materialId: materialViews.materialId,
        totalViews: count(),
        uniqueViewers: countDistinct(materialViews.userId),
      })
      .from(materialViews)
      .groupBy(materialViews.materialId)
      .orderBy(desc(count()));

    // Attach material names
    const allMats = await db.select({ id: materials.id, name: materials.name }).from(materials);
    const nameMap = new Map(allMats.map(m => [m.id, m.name]));

    const analytics = viewRows.map(r => ({
      materialId: r.materialId,
      name: nameMap.get(r.materialId) ?? 'Unknown',
      totalViews: Number(r.totalViews),
      uniqueViewers: Number(r.uniqueViewers),
    }));

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load analytics.', message: String(error) });
  }
}
