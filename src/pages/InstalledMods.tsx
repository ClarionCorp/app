import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PackageIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  TrashIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { disableMod, enableMod, getInstalledMods, uninstallMod } from "../core/mods/manager";
import { InstalledMod } from "../types/database";

const MODS_PER_PAGE = 8;

export default function InstalledMods() {
  const navigate = useNavigate();
  const [mods, setMods] = useState<InstalledMod[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function loadMods() {
    setLoading(true);
    try {
      const data = await getInstalledMods();
      setMods(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMods();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = mods.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / MODS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * MODS_PER_PAGE, page * MODS_PER_PAGE);

  async function handleToggle(mod: InstalledMod) {
    setPendingId(mod.id);
    try {
      if (mod.enabled) await disableMod(mod.id);
      else await enableMod(mod.id);
      await loadMods();
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(mod: InstalledMod) {
    setPendingId(mod.id);
    try {
      await uninstallMod(mod.id);
      await loadMods();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col h-full px-6 py-6 gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Installed Mods
        </h1>
        <span className="text-xs text-white/30 tabular-nums">
          {mods.length} mod{mods.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search + Install */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            size={15}
          />
          <input
            type="text"
            placeholder="Search mods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/8 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-all"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/mods/directory")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-white text-sm font-medium transition-colors shrink-0 cursor-pointer"
        >
          <PlusIcon size={15} weight="bold" />
          Install Mods
        </motion.button>
      </div>

      {/* Mod List */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-white/25">
              <PackageIcon size={32} />
              <span className="text-sm">Loading mods...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-white/25">
              {search ? (
                <>
                  <MagnifyingGlassIcon size={32} />
                  <span className="text-sm">No mods match "{search}"</span>
                </>
              ) : (
                <>
                  <PackageIcon size={32} />
                  <span className="text-sm">No mods installed</span>
                  <button
                    onClick={() => navigate("/mods/directory")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
                  >
                    Browse the mod directory →
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginated.map((mod, i) => (
              <motion.div
                key={mod.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, delay: i * 0.03 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                  mod.enabled
                    ? "bg-white/4 border-white/8 hover:bg-white/6"
                    : "bg-white/2 border-white/5 opacity-60 hover:opacity-80"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/8">
                  {mod.thumbUrl ? (
                    <img
                      src={mod.thumbUrl}
                      alt={mod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PackageIcon size={18} className="text-white/20" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-medium text-white truncate">
                    {mod.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {mod.version && (
                      <span className="text-xs text-white/30">v{mod.version}</span>
                    )}
                    {!mod.enabled && (
                      <span className="text-xs text-white/25 italic">disabled</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={pendingId === mod.id}
                    onClick={() => handleToggle(mod)}
                    title={mod.enabled ? "Disable mod" : "Enable mod"}
                    className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-all disabled:opacity-40"
                  >
                    {mod.enabled ? (
                      <ToggleRightIcon size={18} weight="fill" className="text-indigo-400" />
                    ) : (
                      <ToggleLeftIcon size={18} />
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={pendingId === mod.id}
                    onClick={() => handleDelete(mod)}
                    title="Uninstall mod"
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all disabled:opacity-40"
                  >
                    <TrashIcon size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-white/25 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <CaretLeftIcon size={14} weight="bold" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  p === page
                    ? "bg-indigo-500 text-white"
                    : "text-white/40 hover:bg-white/8 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <CaretRightIcon size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}