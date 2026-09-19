import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/** Subtle fade + rise on mount — used per-route so navigating always feels alive
 * without being distracting. Keyed by the caller (usually the route location). */
export function PageTransition({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}
