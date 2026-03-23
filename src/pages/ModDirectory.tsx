import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PackageIcon,
  SpinnerIcon,
  TagIcon,
  FireIcon,
  HeartIcon,
  EyeIcon,
  ArrowClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  ChartBarIcon,
  ClockIcon,
  SwapIcon,
  ImageIcon,
  MonitorIcon,
  SpeakerHighIcon,
  DotsThreeIcon,
  SquaresFourIcon,
  PaintBrushHouseholdIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import {
  isCacheStale,
  getCacheAge,
  refreshCache,
  queryCache,
  type CacheSortOrder,
} from "../core/mods/cache";
import { CachedMod } from "../types/database";
import { Dropdown } from "../components/UI/Dropdown";

const SORT_OPTIONS: { label: string; value: CacheSortOrder; icon: React.ReactNode }[] = [
  { label: "Popular", value: "popularity", icon: <ChartBarIcon size={13} /> },
  { label: "Likes",   value: "likes",      icon: <HeartIcon size={13} /> },
  { label: "Views",   value: "views",      icon: <EyeIcon size={13} /> },
  { label: "Latest",  value: "latest",     icon: <ClockIcon size={13} /> },
];

const OS_CATEGORIES = [
  { id: 19739, name: "Skins",        icon: <PaintBrushHouseholdIcon size={13} /> },
  { id: 33840, name: "Model Swaps",  icon: <SwapIcon size={13} /> },
  { id: 19917, name: "Textures",     icon: <ImageIcon size={13} /> },
  { id: 24439, name: "UI",           icon: <MonitorIcon size={13} /> },
  { id: 25468, name: "Sounds",       icon: <SpeakerHighIcon size={13} /> },
  { id: 19737, name: "Other/Misc",   icon: <DotsThreeIcon size={13} /> },
];
 
const PER_PAGE = 24;
const PREFIX = "OmegaStrikers-Windows_";
 
function stripPrefix(name: string): string {
  return name.startsWith(PREFIX) ? name.slice(PREFIX.length) : name;
}
 
function formatAge(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
 
export default function ModDirectory() {
  const navigate = useNavigate();
 
  const [mods, setMods] = useState<CachedMod[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sort, setSort] = useState<CacheSortOrder>("popularity");
  const [page, setPage] = useState(1);
  const [loadingMods, setLoadingMods] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState<{ fetched: number; total: number } | null>(null);
  const [cacheAge, setCacheAge] = useState<Date | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const sortTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search]);
 
  useEffect(() => {
    async function init() {
      const stale = await isCacheStale();
      if (stale) {
        await doRefresh();
      } else {
        const age = await getCacheAge();
        setCacheAge(age);
      }
      await loadMods();
    }
    init();
  }, []);
 
  useEffect(() => {
    loadMods();
  }, [debouncedSearch, activeCategory, sort, page]);
 
  async function loadMods() {
    setLoadingMods(true);
    try {
      const result = await queryCache({
        search: debouncedSearch || undefined,
        categoryId: activeCategory,
        sort,
        page,
        perPage: PER_PAGE,
      });
      setMods(result.mods);
      setTotal(result.total);
    } finally {
      setLoadingMods(false);
    }
  }
 
  async function doRefresh() {
    setRefreshing(true);
    setRefreshProgress({ fetched: 0, total: 0 });
    try {
      await refreshCache((fetched, total) => {
        setRefreshProgress({ fetched, total });
      });
      const age = await getCacheAge();
      setCacheAge(age);
    } finally {
      setRefreshing(false);
      setRefreshProgress(null);
    }
  }
 
  async function handleRefresh() {
    await doRefresh();
    await loadMods();
  }
 
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const activeCategoryName = OS_CATEGORIES.find((c) => c.id === activeCategory)?.name ?? "All Mods";
  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sort)?.label ?? "Popular";
 
  const paginationItems = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);
 
  return (
    <div className="flex flex-col h-full px-6 py-6 gap-4">
 
      {/* Refresh progress banner */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-secondary/10 border border-secondary/20"
          >
            <SpinnerIcon size={14} className="animate-spin text-secondary shrink-0" />
            <span className="text-xs text-char-subtle flex-1">
              {refreshProgress && refreshProgress.total > 0
                ? `Indexing mods... ${refreshProgress.fetched} / ${refreshProgress.total}`
                : "Connecting to GameBanana..."}
            </span>
            {refreshProgress && refreshProgress.total > 0 && (
              <div className="w-24 h-1 rounded-full bg-surface-raised overflow-hidden">
                <motion.div
                  className="h-full bg-secondary rounded-full"
                  animate={{ width: `${(refreshProgress.fetched / refreshProgress.total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
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
 
        {/* Category dropdown */}
        <div className="relative">
          <button
            ref={categoryTriggerRef}
            onClick={() => setCategoryDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-background-border bg-surface hover:bg-surface-raised text-char-subtle hover:text-char text-sm transition-all cursor-pointer"
          >
            <TagIcon size={14} />
            <span>{activeCategoryName}</span>
            <CaretDownIcon size={12} className={`transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          <Dropdown
            open={categoryDropdownOpen}
            onClose={() => setCategoryDropdownOpen(false)}
            triggerRef={categoryTriggerRef}
            className="min-w-40"
            items={[
              { label: "All Mods", icon: <SquaresFourIcon size={13} />, onClick: () => { setActiveCategory(null); setPage(1); } },
              ...OS_CATEGORIES.map((cat) => ({
                label: cat.name,
                icon: cat.icon,
                onClick: () => { setActiveCategory(cat.id); setPage(1); },
              })),
            ]}
          />
        </div>
 
        {/* Sort dropdown */}
        <div className="relative">
          <button
            ref={sortTriggerRef}
            onClick={() => setSortDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-background-border bg-surface hover:bg-surface-raised text-char-subtle hover:text-char text-sm transition-all cursor-pointer"
          >
            <FunnelIcon size={14} />
            <span>{activeSortLabel}</span>
            <CaretDownIcon size={12} className={`transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          <Dropdown
            open={sortDropdownOpen}
            onClose={() => setSortDropdownOpen(false)}
            triggerRef={sortTriggerRef}
            className="min-w-30"
            items={SORT_OPTIONS.map((opt) => ({
              label: opt.label,
              icon: opt.icon,
              onClick: () => { setSort(opt.value); setPage(1); },
            }))}
          />
        </div>
 
        {/* Refresh */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleRefresh}
          disabled={refreshing}
          title={cacheAge ? `Updated ${formatAge(cacheAge)}` : "Refresh mod index"}
          className="p-2 rounded-lg border border-background-border bg-surface hover:bg-surface-raised text-char-subtle hover:text-char transition-all disabled:opacity-40 cursor-pointer shrink-0"
        >
          <ArrowClockwiseIcon size={16} className={refreshing ? "animate-spin" : ""} />
        </motion.button>
      </div>
 
      {/* Mod grid */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loadingMods ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-char-subtle">
              <SpinnerIcon size={28} className="animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        ) : mods.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-char-subtle">
              <PackageIcon size={32} />
              <span className="text-sm">No mods found</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence mode="popLayout">
              {mods.map((mod, i) => (
                <ModCard
                  key={mod.id}
                  mod={mod}
                  index={i}
                  onClick={() => navigate(`/mods/${mod.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
 
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-1.5 rounded-lg hover:bg-surface-raised text-char-subtle hover:text-char disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <CaretLeftIcon size={14} weight="bold" />
          </button>
          {paginationItems.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="w-7 text-center text-xs text-char-subtle">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  p === page
                    ? "bg-secondary text-char"
                    : "text-char-subtle hover:bg-surface-raised hover:text-char"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-1.5 rounded-lg hover:bg-surface-raised text-char-subtle hover:text-char disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <CaretRightIcon size={14} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
 
function ModCard({
  mod,
  index,
  onClick,
}: {
  mod: CachedMod;
  index: number;
  onClick: () => void;
}) {
  const name = stripPrefix(mod.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.12, delay: Math.min(index * 0.015, 0.2) }}
      onClick={onClick}
      className="flex flex-col rounded-xl border border-background-border bg-surface hover:bg-surface-raised hover:border-primary/20 transition-all cursor-pointer group overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-3/4 bg-surface-raised overflow-hidden">
        {mod.thumbUrl ? (
          <img
            src={mod.thumbUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PackageIcon size={28} className="text-char-subtle/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-3 py-2.5">

        {/* Title */}
        <div className="flex items-start justify-between gap-1">
          <span className="text-xs font-medium text-char group-hover:text-primary transition-colors leading-snug truncate">
            {name}
          </span>
          {mod.wasFeatured && (
            <FireIcon size={12} className="shrink-0 text-amber-400 mt-0.5" weight="fill" />
          )}
        </div>

        {/* Creator + stats */}
        <div className="flex items-center gap-2 text-xs text-char-subtle">
          <span className="truncate flex-1">{mod.submitterName}</span>
          {mod.likeCount > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <HeartIcon size={10} />
              {mod.likeCount.toLocaleString()}
            </span>
          )}
          {mod.viewCount > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <EyeIcon size={10} />
              {mod.viewCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Category */}
        {mod.categoryName && (
          <span className="flex items-center gap-1 text-xs text-char-subtle/50 truncate">
            <TagIcon size={10} className="shrink-0" />
            {mod.categoryName}
          </span>
        )}
      </div>
    </motion.div>
  );
}