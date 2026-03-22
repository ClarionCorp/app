import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  UserIcon,
  ChartBarIcon,
  GameControllerIcon,
  QueueIcon,
  PuzzlePieceIcon,
  GearIcon,
  HouseIcon,
} from '@phosphor-icons/react';
import { NAV_ITEMS } from '../../core/objects/navigation';

const ICON_MAP: Record<string, React.ReactNode> = {
  account:     <UserIcon size={18} weight="duotone" />,
  rankchecker: <ChartBarIcon size={18} weight="duotone" />,
  cgm:         <GameControllerIcon size={18} weight="duotone" />,
  cqm:         <QueueIcon size={18} weight="duotone" />,
  mods:        <PuzzlePieceIcon size={18} weight="duotone" />,
  settings:    <GearIcon size={18} weight="duotone" />,
};

interface SidebarProps {
  navigate: (path: string) => void;
  connectedToOdy: boolean;
}

export default function Sidebar({ navigate, connectedToOdy }: SidebarProps) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const currentSlug = location.pathname.replace('/', '');

  return (
    <motion.aside
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ width: hovered ? 250 : 52 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-12 bottom-0 z-40 flex flex-col bg-surface-subtle border-r border-background-border overflow-hidden"
    >
      <nav className="flex flex-col gap-1 p-2 flex-1">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-3 w-full px-2 py-2.5 rounded-lg transition-colors cursor-pointer text-left text-char-subtle hover:bg-surface-active hover:text-char"
        >
          <span className="shrink-0">
            <HouseIcon size={18} weight="duotone" />
          </span>
          <AnimatePresence>
            {hovered && (
              <motion.span
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
              >
                Home
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="my-1 border-t border-background-border" />

        {NAV_ITEMS.map((item) => {
          const isActive = currentSlug === item.slug;
          const disabled = item.online && !connectedToOdy;
          return (
            <button
              key={item.slug}
              onClick={() => !disabled && navigate(`/${item.slug}`)}
              disabled={disabled}
              title={disabled ? "Requires game to be open" : undefined}
              className={`
                flex items-center gap-3 w-full px-2 py-2.5 rounded-lg transition-colors text-left
                ${disabled
                  ? 'opacity-40 cursor-not-allowed text-char-subtle'
                  : isActive
                    ? 'bg-primary/10 text-primary cursor-pointer'
                    : 'text-char-subtle hover:bg-surface-active hover:text-char cursor-pointer'
                }
              `}
            >
              <span className="shrink-0">
                {ICON_MAP[item.slug]}
              </span>
              <AnimatePresence>
                {hovered && (
                  <motion.span
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}