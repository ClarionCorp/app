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
  FolderOpenIcon,
  WarningIcon,
  ArrowClockwiseIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { disableMod, enableMod, getInstalledMods, scanAndSyncMods, uninstallMod } from "../core/mods/manager";
import { InstalledMod } from "../types/database";

const MODS_PER_PAGE = 8;

export default function InstalledMods() {
  const navigate = useNavigate();
  const [mods, setMods] = useState<InstalledMod[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<number | null>(null);

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

  async function handleScan() {
    setScanning(true);
    setScanResult(null);
    try {
      const count = await scanAndSyncMods();
      setScanResult(count);
      await loadMods();
    } catch (e) {
      console.error("Scan failed:", e);
    } finally {
      setScanning(false);
      setScanModalOpen(false);
    }
  }

  function openScanModal() {
    setScanResult(null);
    setScanModalOpen(true);
  }

  function closeScanModal() {
    if (scanning) return;
    setScanModalOpen(false);
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
            className="w-full bg-surface border border-surface rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-all"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/mods/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-tertiary text-white text-sm font-medium transition-colors shrink-0 cursor-pointer"
        >
          <PlusIcon size={15} weight="bold" />
          Install Mods
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={openScanModal}
          title="Scan mods folder for existing mods"
          className="p-2 rounded-md border border-surface bg-surface hover:bg-white/10 text-char-subtle hover:text-white transition-all shrink-0 cursor-pointer"
        >
          <ArrowClockwiseIcon size={17} />
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
            <div className="flex flex-col items-center gap-3 text-white/25 mt-10">
              {search ? (
                <>
                  <MagnifyingGlassIcon size={32} />
                  <span className="text-sm">No mods match "{search}"</span>
                </>
              ) : (
                <>
                  <PackageIcon size={32} />
                  <span className="text-sm">No mods installed</span>
                  <div className="flex flex-col items-center gap-2 mt-1">
                    <button
                      onClick={openScanModal}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-background-border hover:bg-surface text-char-subtle hover:text-tertiary text-sm transition-all cursor-pointer"
                    >
                      <FolderOpenIcon size={14} />
                      Scan Mods Folder for Existing Mods
                    </button>
                  </div>
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
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                  mod.enabled
                    ? "bg-surface border-background-border"
                    : "bg-white/2 border-background-border opacity-60 hover:opacity-80"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface border border-background-border">
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
                    className="p-2 rounded-lg hover:bg-surface text-char-subtle hover:text-white/80 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {mod.enabled ? (
                      <ToggleRightIcon size={24} weight="fill" className="text-secondary" />
                    ) : (
                      <ToggleLeftIcon size={24} />
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={pendingId === mod.id}
                    onClick={() => handleDelete(mod)}
                    title="Uninstall mod"
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <TrashIcon size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  p === page
                    ? "bg-secondary text-white"
                    : "text-white/40 hover:bg-surface hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Scan Modal */}
      <AnimatePresence>
        {scanModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeScanModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.10, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm mx-4 bg-surface border border-background-border rounded-2xl shadow-2xl overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-start gap-3 p-5 pb-4">
                  <div className="p-2 rounded-lg bg-amber-500/10 shrink-0 mt-0.5">
                    <WarningIcon size={18} className="text-amber-400" weight="fill" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-white">
                      Overwrite & Rescan Mods Folder
                    </span>
                    <p className="text-sm text-char-subtle leading-relaxed">
                      This will clear your local mod database and replace it with whatever
                      <code>.pak</code> files are currently found in your mods folder. Any metadata from
                      previously installed mods will be lost.
                    </p>
                  </div>
                </div>

                {/* Scan Result */}
                <AnimatePresence>
                  {scanResult !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mx-5 mb-4 px-3 py-2.5 rounded-lg bg-secondary/10 border border-secondary/20"
                    >
                      <span className="text-xs text-indigo-300">
                        Found and imported {scanResult} pak file{scanResult !== 1 ? "s" : ""}.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal Actions */}
                <div className="flex items-center gap-2 px-5 pb-5">
                  <button
                    onClick={closeScanModal}
                    disabled={scanning}
                    className="flex-1 py-2 rounded-lg border border-background-border text-char-subtle hover:text-white/70 hover:bg-surface text-sm transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {scanResult !== null ? "Close" : "Cancel"}
                  </button>
                  {scanResult === null && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleScan}
                      disabled={scanning}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary hover:bg-tertiary text-white text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {scanning ? (
                        <>
                          <SpinnerIcon size={14} className="animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <ArrowClockwiseIcon size={14} weight="bold" />
                          Scan & Import
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}