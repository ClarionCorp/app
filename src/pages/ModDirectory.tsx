import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PackageIcon,
  ArrowDownIcon,
  SpinnerIcon,
  TagIcon,
  FireIcon,
  HeartIcon,
  EyeIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import {
  fetchOSMods,
  getModThumbnail,
  type GBMod,
  type ModSortOrder,
} from "../core/mods/gamebanana";

const SORT_OPTIONS: { label: string; value: ModSortOrder }[] = [
  { label: "Latest",   value: "_tsDateAdded,DESC"   },
  { label: "Updated",  value: "_tsDateModified,DESC" },
  { label: "Popular",  value: "_nLikeCount,DESC"     },
  { label: "Views",    value: "_nViewCount,DESC"     },
];

// Hardcoded OS categories — the ModCategory API doesn't support filtering by game
const OS_CATEGORIES = [
  { id: 19739, name: "Skins"        },
  { id: 33840, name: "Model Swaps"  },
  { id: 19917, name: "Textures"     },
  { id: 24439, name: "UI"           },
  { id: 25468, name: "Sounds"       },
  { id: 19737, name: "Other/Misc"   },
];

const PREFIX = "OmegaStrikers-Windows_";
function stripPrefix(name: string): string {
  return name.startsWith(PREFIX) ? name.slice(PREFIX.length) : name;
}

export default function ModDirectory() {
  const navigate = useNavigate();

  const [mods, setMods] = useState<GBMod[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sort, setSort] = useState<ModSortOrder>("_tsDateAdded,DESC");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMods, setLoadingMods] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search]);

  // Reset + reload when filters change
  useEffect(() => {
    loadMods(1, true);
  }, [debouncedSearch, activeCategory, sort]);

  async function loadMods(targetPage: number, reset: boolean) {
    if (reset) setLoadingMods(true);
    else setLoadingMore(true);

    try {
      const res = await fetchOSMods({
        categoryId: activeCategory ?? undefined,
        page: targetPage,
        perPage: 20,
        sort,
      });

      const records = res._aRecords;
      const total = res._aMetadata._nRecordCount;
      const newMods = reset ? records : [...mods, ...records];

      setMods(newMods);
      setPage(targetPage);
      setHasMore(newMods.length < total);
    } finally {
      setLoadingMods(false);
      setLoadingMore(false);
    }
  }

  const displayedMods = debouncedSearch
    ? mods.filter((m) => m._sName.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : mods;

  return (
    <div className="flex flex-col h-full px-6 py-6 gap-4">

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-char-subtle"
          size={15}
        />
        <input
          type="text"
          placeholder="Search mods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-background-border rounded-lg pl-9 pr-4 py-2 text-sm text-char placeholder:text-char-subtle outline-none focus:border-primary/40 transition-all"
        />
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              sort === opt.value
                ? "bg-secondary text-char"
                : "text-char-subtle hover:text-char hover:bg-surface-raised"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: Mod list */}
        <div className="flex flex-col flex-1 min-w-0 gap-2 overflow-y-auto pr-1">
          {loadingMods ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-char-subtle">
                <SpinnerIcon size={28} className="animate-spin" />
                <span className="text-sm">Fetching mods...</span>
              </div>
            </div>
          ) : displayedMods.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-char-subtle">
                <PackageIcon size={32} />
                <span className="text-sm">No mods found</span>
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {displayedMods.map((mod, i) => (
                  <ModCard
                    key={mod._idRow}
                    mod={mod}
                    index={i}
                    onClick={() => navigate(`/mods/${mod._idRow}`)}
                  />
                ))}
              </AnimatePresence>

              {hasMore && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => !loadingMore && loadMods(page + 1, false)}
                  disabled={loadingMore}
                  className="w-full py-2.5 rounded-xl border border-background-border bg-surface hover:bg-surface-raised text-char-subtle hover:text-char text-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-1"
                >
                  {loadingMore ? (
                    <>
                      <SpinnerIcon size={14} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon size={14} />
                      Load More
                    </>
                  )}
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* Right: Categories */}
        <div className="w-44 shrink-0 flex flex-col gap-1 overflow-y-auto">
          <span className="text-xs font-medium text-char-subtle px-2 pb-1 flex items-center gap-1.5">
            <SquaresFourIcon size={13} />
            Categories
          </span>

          <CategoryButton
            label="All Mods"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />

          {OS_CATEGORIES.map((cat) => (
            <CategoryButton
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModCard({
  mod,
  index,
  onClick,
}: {
  mod: GBMod;
  index: number;
  onClick: () => void;
}) {
  const thumb = getModThumbnail(mod, "220");
  const name = stripPrefix(mod._sName);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.12, delay: Math.min(index * 0.02, 0.25) }}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-4 rounded-xl border border-background-border bg-surface hover:bg-surface-raised hover:border-primary/20 transition-all cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-raised border border-background-border">
        {thumb ? (
          <img src={thumb} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PackageIcon size={22} className="text-char-subtle" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {/* Name + badges */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-char truncate group-hover:text-primary transition-colors">
            {name}
          </span>
          {mod._bWasFeatured && (
            <FireIcon size={13} className="shrink-0 text-amber-400" weight="fill" />
          )}
        </div>

        {/* Subtitle / description */}
        {mod._sDescription && (
          <p className="text-xs text-char-subtle leading-relaxed line-clamp-1">
            {mod._sDescription}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-char-subtle">
          <span>{mod._aSubmitter._sName}</span>
          {mod._aRootCategory && (
            <>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1">
                <TagIcon size={11} />
                {mod._aRootCategory._sName}
              </span>
            </>
          )}
          {mod._nLikeCount != null && mod._nLikeCount > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1">
                <HeartIcon size={11} />
                {mod._nLikeCount.toLocaleString()}
              </span>
            </>
          )}
          {mod._nViewCount != null && mod._nViewCount > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1">
                <EyeIcon size={11} />
                {mod._nViewCount.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CategoryButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
        active
          ? "bg-secondary/20 text-char border border-secondary/30"
          : "text-char-subtle hover:text-char hover:bg-surface-raised border border-transparent"
      }`}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}