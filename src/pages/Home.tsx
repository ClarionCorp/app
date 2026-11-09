import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { InfoIcon, BroadcastIcon } from "@phosphor-icons/react";
import { AppContextType } from "../App";
import { isProcessRunning } from "../core/bridgeListener";
import { NAV_ITEMS } from "../core/objects/navigation";
import { useDialogue } from "../components/UI/DialogueToast";
import { AboutModal } from "../components/Navigation/AboutModal";
import { OverlayModal } from "../components/Navigation/OverlayModal";
import { ReloadReason } from "../types/storage";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export default function HomePage() {
  const { navigate } = useOutletContext<AppContextType>();
  const [gameRunning, setGameRunning] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const { show: showDialogue } = useDialogue();

  const QUICK_LINKS = [
    { key: "about", label: "About", icon: <InfoIcon size={20} weight="duotone" />, onClick: () => setAboutOpen(true) },
    { key: "overlay", label: "Stream Overlay", icon: <BroadcastIcon size={20} weight="duotone" />, onClick: () => setOverlayOpen(true) },
  ];

  useEffect(() => {
    isProcessRunning('OmegaStrikers-Win64-Shipping.exe').then(setGameRunning);
  }, []);

  useEffect(() => {
    const rr = JSON.parse(localStorage.getItem('reload_reason') ?? '{}') as ReloadReason | null;
    if (rr?.acknowledged) return;

    switch (rr?.reason) {
      case 'ACCOUNT_CHANGE':
        showDialogue({
          variant: 'info',
          image: '/aimi/Custom_Welcome_3.webp',
          title: 'App Reloaded!',
          message: `It appears you changed account without restarting the app. I've gone ahead and done that for you now. Happy Striking!`,
          xlImage: true,
          autoDismiss: 10_000
        });
        localStorage.setItem('reload_reason', JSON.stringify({ ...rr, acknowledged: true }));
        return;
      default:
        return;
    }
  }, []);

  useEffect(() => {
    const isPATValid = JSON.parse(sessionStorage.getItem('isPATValid') ?? '{}') as boolean | null;
    if (isPATValid == false) {
      showDialogue({
        variant: 'error',
        image: '/aimi/Shock.png',
        title: 'Access Limited!',
        message: `We were unable to validate this session with the API! The app will have very limited functionality until the app is restarted with the game open.`,
        buttons: [
          { label: 'Restart App', onClick: () => { sessionStorage.removeItem('isPATValid'); navigate('/'); }, variant: 'secondary', dismisses: true },
          { label: 'Dismiss', onClick: () => { sessionStorage.removeItem('isPATValid'); }, variant: 'surface', dismisses: true },
        ],
        autoDismiss: 20_000,
      });
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-3rem)]">
      <div
        className="absolute inset-0 bg-cover bg-center brightness-50 blur-xs"
        style={{ backgroundImage: 'var(--theme-bg-image)' }}
      />
      <div
        className="absolute inset-0 bg-background"
        style={{ opacity: 'var(--theme-bg-overlay-opacity)' }}
      />

      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] px-8 pb-28">
        <motion.div
          className="relative mb-10 w-full max-w-2xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <img
            src={'/aimi/Custom_Greeting.webp'}
            className="absolute z-0 -left-16 -bottom-36 w-96 aspect-square rounded-xl object-cover object-top brightness-90 antialiased"
            style={{
              maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
            }}
          />
          <div className="text-center py-32 translate-y-3 translate-x-7">
            <h1 className="text-2xl font-extrabold tracking-tight text-char italic">
              How can I <span className="text-char-accent">help</span>?
            </h1>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="relative z-10 grid grid-cols-2 gap-4 w-full">
            {NAV_ITEMS.map((item) => {
              const disabled = item.online && !gameRunning;
              return (
                <motion.div key={item.slug} variants={itemVariants}>
                  <NavButton item={item} disabled={disabled} onClick={() => !disabled && navigate(item.slug)} />
                </motion.div>
              );
            })}
          </div>

          <motion.div className="flex flex-row gap-3 mt-1" variants={itemVariants}>
            {QUICK_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={link.onClick}
                title={link.label}
                className="flex items-center justify-center h-11 w-11 rounded-xl border border-surface-border bg-surface-subtle text-char-subtle transition-colors hover:border-primary hover:text-primary cursor-pointer"
              >
                {link.icon}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <OverlayModal open={overlayOpen} onClose={() => setOverlayOpen(false)} />
    </div>
  );
}

interface NavButtonProps {
  item: (typeof NAV_ITEMS)[number];
  disabled?: boolean;
  onClick: () => void;
}

function NavButton({ item, disabled, onClick }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative h-32 w-full rounded-2xl overflow-hidden border border-surface-border group focus:outline-none p-2 shadow-[0_0_12px_rgba(0,0,0,0.5)] ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-primary cursor-pointer"}`}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div
        className="absolute -inset-2 bg-cover bg-center transition-transform duration-500 blur-xs"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      <div className="absolute -inset-2 bg-overlay/80" />

      <div>
        <p className="relative z-10 text-sm font-bold tracking-wide text-zinc-100">
          {item.label}
        </p>
        <p className="relative z-10 text-xs tracking-wide text-zinc-300 hidden sm:block">
          {disabled ? "Requires game to be open" : item.desc}
        </p>
      </div>
    </motion.button>
  );
}