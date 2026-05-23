import { motion, type Variants } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { AppContextType } from "../App";
import { NAV_ITEMS } from "../core/objects/navigation";

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
  const { navigate, connectedToOdy } = useOutletContext<AppContextType>();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] bg-background px-8 pb-24">
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative flex flex-col items-center">
          <img
            src={'/aimi/Yapping.gif'}
            className="w-40 aspect-square rounded-xl object-cover my-10"
          />
          <div className="text-center">
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
          const disabled = item.online && !connectedToOdy;
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
      className={`relative h-32 w-full rounded-2xl overflow-hidden border border-background-border group focus:outline-none p-2 shadow-lg ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-primary cursor-pointer"}`}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div
        className="absolute -inset-2 bg-cover bg-center transition-transform duration-500 blur-xs"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      <div className="absolute -inset-2 bg-black/80" />

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