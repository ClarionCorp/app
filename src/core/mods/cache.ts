import { db } from "../database/driver";
import { modCache } from "../database/schema";
import { eq, desc, like, and, or } from "drizzle-orm";
import { fetchMods, getModThumbnail, OS_GAME_ID, type GBMod } from "./gamebanana";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function computePopularity(likes: number, views: number): number {
  return likes * 3 + views * 0.1;
}

function modToRow(mod: GBMod): typeof modCache.$inferInsert {
  const likes = mod._nLikeCount ?? 0;
  const views = mod._nViewCount ?? 0;
  return {
    id: mod._idRow,
    name: mod._sName,
    version: mod._sVersion ?? null,
    thumbUrl: getModThumbnail(mod, "220"),
    submitterName: mod._aSubmitter._sName,
    categoryName: mod._aRootCategory?._sName ?? null,
    categoryId: mod._aRootCategory
      ? extractCategoryId(mod._aRootCategory._sProfileUrl)
      : null,
    likeCount: likes,
    viewCount: views,
    wasFeatured: mod._bWasFeatured,
    profileUrl: mod._sProfileUrl,
    popularityScore: computePopularity(likes, views),
    cachedAt: new Date(),
  };
}

function extractCategoryId(profileUrl: string): number | null {
  const match = profileUrl.match(/\/cats\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export async function isCacheStale(): Promise<boolean> {
  const newest = await db
    .select({ cachedAt: modCache.cachedAt })
    .from(modCache)
    .orderBy(desc(modCache.cachedAt))
    .limit(1)
    .get();

  if (!newest) return true;
  return Date.now() - newest.cachedAt.getTime() > CACHE_TTL_MS;
}

export async function getCacheAge(): Promise<Date | null> {
  const newest = await db
    .select({ cachedAt: modCache.cachedAt })
    .from(modCache)
    .orderBy(desc(modCache.cachedAt))
    .limit(1)
    .get();
  return newest?.cachedAt ?? null;
}

export async function refreshCache(
  onProgress?: (fetched: number, total: number) => void
): Promise<void> {
  const PER_PAGE = 50;
  let page = 1;
  let total = 0;
  const allMods: GBMod[] = [];

  // Fetch all pages
  do {
    const res = await fetchMods({ gameId: OS_GAME_ID, page, perPage: PER_PAGE, sort: "_tsDateAdded,DESC" });
    total = res._aMetadata._nRecordCount;
    allMods.push(...res._aRecords);
    onProgress?.(allMods.length, total);
    page++;
  } while (allMods.length < total);

  // Clear and reinsert
  await db.delete(modCache).run();
  for (const mod of allMods) {
    await db.insert(modCache).values(modToRow(mod)).run();
  }
}

export type CacheSortOrder = "popularity" | "likes" | "views" | "latest";

export async function queryCache(opts: {
  search?: string;
  categoryId?: number | null;
  sort?: CacheSortOrder;
  page?: number;
  perPage?: number;
}): Promise<{ mods: typeof modCache.$inferSelect[]; total: number }> {
  const {
    search,
    categoryId,
    sort = "popularity",
    page = 1,
    perPage = 20,
  } = opts;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(modCache.name, `%${search}%`),
        like(modCache.submitterName, `%${search}%`)
      )
    );
  }
  if (categoryId != null) conditions.push(eq(modCache.categoryId, categoryId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy = {
    popularity: desc(modCache.popularityScore),
    likes:      desc(modCache.likeCount),
    views:      desc(modCache.viewCount),
    latest:     desc(modCache.id),
  }[sort];

  const [mods, countResult] = await Promise.all([
    db
      .select()
      .from(modCache)
      .where(where)
      .orderBy(orderBy)
      .limit(perPage)
      .offset((page - 1) * perPage)
      .all(),
    db
      .select({ id: modCache.id })
      .from(modCache)
      .where(where)
      .all(),
  ]);

  return { mods, total: countResult.length };
}