import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon,
  DownloadIcon,
  HeartIcon,
  EyeIcon,
  UserIcon,
  TagIcon,
  CaretLeftIcon,
  CaretRightIcon,
  SpinnerIcon,
  ArrowSquareOutIcon,
  FireIcon,
  PackageIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { onDownloadComplete, onDownloadProgress } from "../../core/mods/mods";
import { fetchMod, GBMod, getModDownloadFile } from "../../core/mods/gamebanana";
import { installMod } from "../../core/mods/manager";
import { ImageViewer } from "./ImageViewerModal";

const PREFIX = "OmegaStrikers-Windows_";
function stripPrefix(name: string): string {
  return name.startsWith(PREFIX) ? name.slice(PREFIX.length) : name;
}

interface ModModalProps {
  modId: number | null;
  onClose: () => void;
}

type DownloadState = "idle" | "downloading" | "done" | "error";

export function ModModal({ modId, onClose }: ModModalProps) {
  const [mod, setMod] = useState<GBMod | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (modId === null) {
      setMod(null);
      setImageIndex(0);
      setDownloadState("idle");
      setDownloadProgress(0);
      setErrorMsg(null);
      return;
    }
    setLoading(true);
    console.log("[ModModal] Fetching mod:", modId);
    fetchMod(modId)
      .then((data) => {
        setMod(data);
      })
      .catch((e) => {
        console.error("[ModModal] Failed to fetch mod:", e);
        setErrorMsg("Failed to load mod details.");
      })
      .finally(() => setLoading(false));
  }, [modId]);

  // Listen to download progress events
  useEffect(() => {
    if (downloadState !== "downloading") return;
    let unlisten: (() => void) | null = null;
    let unlistenComplete: (() => void) | null = null;

    onDownloadProgress(({ downloaded, total }) => {
      setDownloadProgress(total > 0 ? (downloaded / total) * 100 : 0);
    }).then((fn) => { unlisten = fn; });

    onDownloadComplete(() => {
      setDownloadState("done");
      setDownloadProgress(100);
    }).then((fn) => { unlistenComplete = fn; });

    return () => { unlisten?.(); unlistenComplete?.(); };
  }, [downloadState]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") setImageIndex((i) => Math.max(0, i - 1));
    if (e.key === "ArrowRight") {
      const images = mod?._aPreviewMedia?._aImages ?? [];
      setImageIndex((i) => Math.min(images.length - 1, i + 1));
    }
  }, [mod, onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleDownload() {
    if (!mod) return;
    console.log("[ModModal] Starting download for mod:", mod._idRow);
    console.log("[ModModal] Download file:", getModDownloadFile(mod));
    setDownloadState("downloading");
    setDownloadProgress(0);
    setErrorMsg(null);
    try {
      await installMod(mod);
      console.log("[ModModal] Download complete");
    } catch (e: any) {
      console.error("[ModModal] Download failed:", e);
      setDownloadState("error");
      setErrorMsg(e?.message ?? "Download failed.");
    }
  }

  const images = mod?._aPreviewMedia?._aImages ?? [];
  const currentImage = images[imageIndex];
  const imageUrl = currentImage
    ? `${currentImage._sBaseUrl}/${currentImage._sFile530 ?? currentImage._sFile220 ?? currentImage._sFile}`
    : null;

  const downloadFile = mod ? getModDownloadFile(mod) : null;
  const name = mod ? stripPrefix(mod._sName) : "";

  return createPortal(
    <>
      <AnimatePresence>
        {modId !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface border border-background-border rounded-2xl shadow-2xl overflow-hidden">

                {loading ? (
                  <div className="flex items-center justify-center flex-1 py-20">
                    <SpinnerIcon size={28} className="animate-spin text-char-subtle" />
                  </div>
                ) : errorMsg && !mod ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20 text-char-subtle">
                    <WarningIcon size={28} className="text-error" />
                    <span className="text-sm">{errorMsg}</span>
                  </div>
                ) : mod ? (
                  <>
                    {/* Image viewer */}
                    <div className="relative w-full aspect-video bg-slate shrink-0 overflow-hidden">
                      <AnimatePresence mode="wait">
                        {imageUrl ? (
                          <motion.img
                            key={`image-${imageIndex}`}
                            src={imageUrl}
                            alt={name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setFullscreenImage(imageUrl)}
                            className="w-full h-full object-cover cursor-zoom-in"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PackageIcon size={40} className="text-char-subtle/30" />
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Image nav */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                            disabled={imageIndex === 0}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white disabled:opacity-20 transition-all cursor-pointer"
                          >
                            <CaretLeftIcon size={16} weight="bold" />
                          </button>
                          <button
                            onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}
                            disabled={imageIndex === images.length - 1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white disabled:opacity-20 transition-all cursor-pointer"
                          >
                            <CaretRightIcon size={16} weight="bold" />
                          </button>
                          {/* Dots */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                            {images.map((img, i) => (
                              <button
                                key={`dot-${i}-${img._sFile}`}
                                onClick={() => setImageIndex(i)}
                                className={`rounded-full transition-all cursor-pointer ${
                                  i === imageIndex
                                    ? "w-4 h-1.5 bg-white"
                                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Close button */}
                      <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all cursor-pointer"
                      >
                        <XIcon size={16} weight="bold" />
                      </button>

                      {/* Featured badge */}
                      {mod._bWasFeatured && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
                          <FireIcon size={11} weight="fill" />
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                      <div className="flex gap-2 px-4 pt-3 overflow-x-auto shrink-0">
                        {images.map((img, i) => (
                          <button
                            key={`thumb-${i}-${img._sFile}`}
                            onClick={() => setImageIndex(i)}
                            className={`shrink-0 w-14 h-10 rounded-md overflow-hidden border transition-all cursor-pointer ${
                              i === imageIndex
                                ? "border-primary/60 opacity-100"
                                : "border-background-border opacity-50 hover:opacity-80"
                            }`}
                          >
                            <img
                              src={`${img._sBaseUrl}/${img._sFile100 ?? img._sFile}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-col gap-4 px-5 py-4 overflow-y-auto flex-1 min-h-0">

                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                          <h2 className="text-base font-semibold text-char leading-snug">
                            {name}
                          </h2>
                          <div className="flex items-center gap-3 text-xs text-char-subtle">
                            <span className="flex items-center gap-1">
                              <UserIcon size={11} />
                              {mod._aSubmitter._sName}
                            </span>
                            {mod._aRootCategory && (
                              <>
                                <span className="opacity-30">·</span>
                                <span className="flex items-center gap-1">
                                  <TagIcon size={11} />
                                  {mod._aRootCategory._sName}
                                </span>
                              </>
                            )}
                            {mod._sVersion && (
                              <>
                                <span className="opacity-30">·</span>
                                <span>v{mod._sVersion}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-char-subtle/60 mt-0.5">
                            {(mod._nLikeCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <HeartIcon size={11} />
                                {mod._nLikeCount!.toLocaleString()}
                              </span>
                            )}
                            {(mod._nViewCount ?? 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <EyeIcon size={11} />
                                {mod._nViewCount!.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={mod._sProfileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg border border-background-border bg-surface hover:bg-surface-raised text-char-subtle hover:text-char transition-all"
                            title="View on GameBanana"
                          >
                            <ArrowSquareOutIcon size={16} />
                          </a>

                          {/* Download button */}
                          {downloadState === "idle" && (
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={handleDownload}
                              disabled={!downloadFile}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-tertiary text-char text-sm font-medium transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              <DownloadIcon size={15} weight="bold" />
                              Install
                            </motion.button>
                          )}

                          {downloadState === "downloading" && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/20 border border-secondary/30 text-char-subtle text-sm min-w-32">
                              <SpinnerIcon size={14} className="animate-spin shrink-0" />
                              <div className="flex-1">
                                <div className="h-1 rounded-full bg-surface-raised overflow-hidden">
                                  <motion.div
                                    className="h-full bg-secondary rounded-full"
                                    animate={{ width: `${downloadProgress}%` }}
                                    transition={{ duration: 0.2 }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs tabular-nums">{Math.round(downloadProgress)}%</span>
                            </div>
                          )}

                          {downloadState === "done" && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                              Installed!
                            </div>
                          )}

                          {downloadState === "error" && (
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={handleDownload}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-sm cursor-pointer"
                            >
                              <WarningIcon size={14} />
                              Retry
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {mod._sText && (
                        <div className="text-xs text-char-subtle leading-relaxed border-t border-background-border pt-4"
                          dangerouslySetInnerHTML={{ __html: mod._sText }}
                        />
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
            </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {fullscreenImage && (
          <ImageViewer
            url={fullscreenImage}
            onClose={() => setFullscreenImage(null)}
          />
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}