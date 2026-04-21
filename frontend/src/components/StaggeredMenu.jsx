import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import ExploreIcon from '@mui/icons-material/Explore';

const defaultItems = [
  { id: 1, title: 'My Library', icon: <LibraryMusicIcon className="w-5 h-5" /> },
  { id: 2, title: 'Shared Library', icon: <ExploreIcon className="w-5 h-5" /> },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StaggeredMenu = ({ items = defaultItems, activeId, onSelect, className = '', collapsed = false }) => {
  return (
    <motion.nav
      className={`flex flex-col gap-2 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <motion.button
              key={item.id}
              variants={itemVariants}
              onClick={() => onSelect?.(item.id)}
              className={`flex ${collapsed ? 'flex-col justify-center px-1 py-4 gap-1' : 'items-center px-4 py-3 gap-3'} rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-400'}`}
            >
              {/* Background elements for stagger effect on hover/active */}
              {isActive && (
                <motion.div
                  layoutId="active-bg"
                  className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className={`relative z-10 flex ${collapsed ? 'flex-col items-center gap-1.5' : 'items-center gap-3'} w-full`}>
                {item.icon}
                <span className={`${collapsed ? 'text-[10px] font-medium text-center leading-tight' : 'font-semibold'} tracking-wide ${collapsed ? 'w-full block' : ''}`}>{item.title}</span>
              </div>

              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-0 ${isActive ? 'hidden' : ''}`} />
            </motion.button>
          )
        })}
      </AnimatePresence>
    </motion.nav>
  );
};

export default StaggeredMenu;
