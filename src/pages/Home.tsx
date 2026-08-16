import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppContextType } from "../App";
import { isProcessRunning } from "../core/bridgeListener";
import { NAV_ITEMS } from "../core/objects/navigation";
import { getAppSettings, getUser, upsertAppSettings } from "../core/database/queries";
import { useDialogue } from "../components/UI/DialogueToast";

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
  const { showQueue } = useDialogue();

  useEffect(() => {
    isProcessRunning('OmegaStrikers-Win64-Shipping.exe').then(setGameRunning);
  }, []);
  
  // Welcome dialogue for new users
  useEffect(() => {
    const checkNewUser = async () => {
      const settings = await getAppSettings();
      if (!settings || settings.seenWelcome) return;
      let usernameText = 'new user';
      const user = await getUser();
      if (user && user?.username) { usernameText = user.username};
      await upsertAppSettings({ seenWelcome: true });
      showQueue([
        {
          variant: 'info',
          title: `Hello, ${usernameText}! (1/3)`,
          message: "Welcome to the new Ai.Mi App! I'm Ai.Mi, and I'll be your assistant while playing Omega Strikers.",
          image: '/aimi/NOM.png',
          buttons: [{ label: 'Okay!', dismisses: true }],
        },
        {
          variant: 'info',
          title: 'Need Help? (2/3)',
          message: "You can call me from any page at any time by pressing F6 (or Fn + F6) on your keyboard!",
          image: '/aimi/Yapping.gif',
          buttons: [{ label: 'Got it, thanks!', dismisses: true }],
        },
        {
          variant: 'info',
          title: 'Customization (3/3)',
          message: "One last thing before I go, I recommend heading to Settings to really make the app your own!",
          image: '/aimi/Noted.gif',
          buttons: [
            { label: 'Open Settings', onClick: () => { navigate('/settings') }, dismisses: true },
            { label: 'Close', dismisses: true },
          ],
        }
      ]);
    };
    checkNewUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] bg-background px-8 pb-36">
      <motion.div
        className="mb-10 short:my-7 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative flex flex-col items-center">
          <img
            src={'/aimi/Yapping.gif'}
            className="w-40 aspect-square rounded-xl object-cover my-10 short:my-7"
          />
          <div className="text-center mb-5">
            <p className="text-xs uppercase tracking-widest text-char-subtle mb-1">
              Welcome back!
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-char">
              How can I <span className="text-primary">help</span>?
            </h1>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-4 w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {NAV_ITEMS.map((item) => {
          const disabled = item.online && !gameRunning;
          return (
            <motion.div key={item.slug} variants={itemVariants}>
              <NavButton item={item} disabled={disabled} onClick={() => !disabled && navigate(item.slug)} />
            </motion.div>
          );
        })}
      </motion.div>
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
      className={`relative h-32 w-full rounded-2xl overflow-hidden border border-surface-border group focus:outline-none p-2 shadow-lg ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-primary cursor-pointer"}`}
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
        <p className="relative z-10 text-sm font-bold tracking-wide text-zinc-200">
          {item.label}
        </p>
        <p className="relative z-10 text-xs tracking-wide text-zinc-400 hidden sm:block">
          {disabled ? "Requires game to be open" : item.desc}
        </p>
      </div>
    </motion.button>
  );
}