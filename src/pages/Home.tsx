import { motion, type Variants } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { AppContextType } from "../App";

const NAV_ITEMS = [
  {
    label: "Player Lookup",
    desc: "Search for Stats about a Player",
    slug: 'player',
    image: "/backgrounds/Strikers.webp"
  },
  {
    label: "Rank Checker",
    desc: "Auto fetch the ranks of everyone in game",
    slug: 'rankchecker',
    image: "/backgrounds/MusicShow.webp"
  },
  {
    label: "Custom Games Manager",
    desc: "Tweak every aspect of Custom Games",
    slug: 'cgm',
    image: "/backgrounds/GatesOfObscura.webp"
  },
  {
    label: "Settings",
    desc: "Adjust the app's settings",
    slug: 'settings',
    image: "/backgrounds/Bedroom.jpg"
  },
];

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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8 py-12">
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <p className="text-xs uppercase tracking-widest text-char-subtle mb-1">
          Welcome back
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-char">
          What would you like to{" "}
          <span className="text-primary">explore?</span>
        </h1>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-4 w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {NAV_ITEMS.map((item) => (
          <motion.div key={item.label} variants={itemVariants}>
            <NavButton item={item} onClick={() => navigate(item.label)} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

interface NavButtonProps {
  item: (typeof NAV_ITEMS)[number];
  onClick: () => void;
}

function NavButton({ item, onClick }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative h-32 w-full rounded-2xl overflow-hidden border border-background-border hover:border-primary group focus:outline-none p-2 cursor-pointer shadow-lg"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
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
          {item.desc}
        </p>
      </div>
    </motion.button>
  );
}