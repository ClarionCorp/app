import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isProcessRunning } from '../../core/bridgeListener';
import {
  ChartBarIcon,
  GameControllerIcon,
  QueueIcon,
  PuzzlePieceIcon,
  GearIcon,
  HouseIcon,
  ClockCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { NAV_ITEMS } from '../../core/objects/navigation';
import { collapsedWidth, expandedWidth, widthTransition } from './NavCorner';

const ICON_MAP: Record<string, React.ReactNode> = {
  match: <ChartBarIcon size={18} weight="duotone" />,
  history: <ClockCounterClockwiseIcon size={18} weight="duotone" />,
  cgm: <GameControllerIcon size={18} weight="duotone" />,
  cqm: <QueueIcon size={18} weight="duotone" />,
  mods: <PuzzlePieceIcon size={18} weight="duotone" />,
  settings: <GearIcon size={18} weight="duotone" />,
};

interface SidebarProps {
  navigate: (path: string) => void;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
}

export default function Sidebar({ navigate, hovered, onHoverChange }: SidebarProps) {
  const location = useLocation();
  const [gameRunning, setGameRunning] = useState(false);
  const expandTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isProcessRunning('OmegaStrikers-Win64-Shipping.exe').then(setGameRunning);
  }, []);

  useEffect(() => {
    return () => {
      if (expandTimeout.current) clearTimeout(expandTimeout.current);
    };
  }, []);

  const handleHoverStart = () => {
    expandTimeout.current = setTimeout(() => onHoverChange(true), 500);
  };

  const handleHoverEnd = () => {
    if (expandTimeout.current) {
      clearTimeout(expandTimeout.current);
      expandTimeout.current = null;
    }
    onHoverChange(false);
  };

  const currentSlug = location.pathname.replace('/', '');

  return (
      <motion.aside
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        initial={{ width: collapsedWidth }}
        animate={{ width: hovered ? expandedWidth : collapsedWidth }}
        transition={widthTransition}
        className="fixed left-0 top-12 bottom-0 z-40 flex flex-col bg-surface-subtle overflow-hidden"
      >
        <nav className="flex flex-col gap-1 p-2 flex-1">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 w-full px-2 py-2.5 rounded-lg transition-colors cursor-pointer text-left text-char-subtle hover:bg-surface-overlay hover:text-char"
          >
            <span className="shrink-0">
              <HouseIcon size={18} weight="duotone" />
            </span>
            <motion.span
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
              transition={{ duration: 0.15 }}
            >
              Home
            </motion.span>
          </button>

          <div className="my-1 border-t border-background-border" />

          {NAV_ITEMS.map((item) => {
            const isActive = currentSlug === item.slug;
            const disabled = item.online && !gameRunning;
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
                      : 'text-char-subtle hover:bg-surface-overlay hover:text-char cursor-pointer'
                  }
                `}
              >
                <span className="shrink-0">
                  {ICON_MAP[item.slug]}
                </span>
                <motion.span
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </nav>
      </motion.aside>
  );
}