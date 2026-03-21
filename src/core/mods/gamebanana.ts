const GB_API = "https://gamebanana.com/apiv11";

export const OS_GAME_ID = 17234;

export interface GBModPreviewImage {
  _sType: string;
  _sBaseUrl: string;
  _sFile: string;
  _sFile220?: string;
  _sFile530?: string;
  _hFile220?: number;
  _wFile220?: number;
}

export interface GBMod {
  _idRow: number;
  _sName: string;
  _sVersion: string;
  _sProfileUrl: string;
  _tsDateAdded: number;
  _tsDateModified?: number;
  _nLikeCount?: number;
  _nViewCount?: number;
  _nPostCount?: number;
  _bWasFeatured: boolean;
  _aTags: string[];
  _aPreviewMedia: { _aImages: GBModPreviewImage[] };
  _aSubmitter: {
    _idRow: number;
    _sName: string;
    _sProfileUrl: string;
    _sAvatarUrl: string;
  };
  _aRootCategory?: {
    _sName: string;
    _sProfileUrl: string;
    _sIconUrl: string;
  };
  _aFiles?: GBModFile[];
}

export interface GBModFile {
  _idRow: number;
  _sFile: string;
  _sDownloadUrl: string;
  _nFilesize: number;
  _sDescription?: string;
  _tsDateAdded: number;
}

export interface GBModListResponse {
  _aMetadata: {
    _nRecordCount: number;
    _bIsComplete: boolean;
    _nPerpage: number;
  };
  _aRecords: GBMod[];
}

export interface GBCategory {
  _idRow: number;
  _sName: string;
  _sProfileUrl: string;
  _sIconUrl?: string;
  _nItemCount?: number;
}

export type ModSortOrder =
  | "_tsDateAdded,DESC"
  | "_tsDateAdded,ASC"
  | "_nLikeCount,DESC"
  | "_nViewCount,DESC"
  | "_tsDateModified,DESC";

const MOD_FIELDS = [
  "_sName",
  "_sVersion",
  "_sProfileUrl",
  "_tsDateAdded",
  "_tsDateModified",
  "_nLikeCount",
  "_nViewCount",
  "_nPostCount",
  "_bWasFeatured",
  "_aTags",
  "_aPreviewMedia",
  "_aSubmitter",
  "_aRootCategory",
  "_aFiles",
].join(",");

async function gbFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GameBanana API error: ${res.status}`);
  const data = await res.json();
  if (data._sErrorCode) throw new Error(`GameBanana error: ${data._sErrorCode}`);
  return data as T;
}

export async function fetchMods(opts: {
  gameId?: number;
  categoryId?: number;
  page?: number;
  perPage?: number;
  sort?: ModSortOrder;
}): Promise<GBModListResponse> {
  const params = new URLSearchParams({
    "_nPage": String(opts.page ?? 1),
    "_nPerpage": String(opts.perPage ?? 20),
    "_sOrderBy": opts.sort ?? "_tsDateAdded,DESC",
  });
  if (opts.gameId) params.set("_aFilters[Generic_Game]", String(opts.gameId));
  if (opts.categoryId) params.set("_aFilters[Generic_Category]", String(opts.categoryId));

  return gbFetch(`${GB_API}/Mod/Index?${params}`);
}

export async function fetchOSMods(opts?: {
  categoryId?: number;
  page?: number;
  perPage?: number;
  sort?: ModSortOrder;
}): Promise<GBModListResponse> {
  return fetchMods({ gameId: OS_GAME_ID, ...opts });
}

export async function fetchMod(modId: number): Promise<GBMod> {
  return gbFetch(`${GB_API}/Mod/${modId}?_csvProperties=${MOD_FIELDS}`);
}

export async function fetchCategories(gameId = OS_GAME_ID): Promise<GBCategory[]> {
  const params = new URLSearchParams({
    "_aFilters[Generic_Game]": String(gameId),
    "_nPerpage": "50",
    "_sOrderBy": "_sName,ASC",
  });
  const res = await gbFetch<{ _aRecords: GBCategory[] }>(`${GB_API}/ModCategory/Index?${params}`);
  return res._aRecords;
}

export function getModThumbnail(mod: GBMod, size: "100" | "220" | "530" = "220"): string | null {
  const img = mod._aPreviewMedia?._aImages?.[0];
  if (!img) return null;
  const file =
    size === "530" ? img._sFile530 :
    size === "220" ? img._sFile220 :
    img._sFile;
  return `${img._sBaseUrl}/${file ?? img._sFile}`;
}

// Returns the best file to download from a mod (latest by date)
export function getModDownloadFile(mod: GBMod): GBModFile | null {
  if (!mod._aFiles?.length) return null;
  return mod._aFiles.reduce((a, b) => a._tsDateAdded > b._tsDateAdded ? a : b);
}