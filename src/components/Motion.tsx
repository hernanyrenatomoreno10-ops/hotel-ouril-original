import { motion, type MotionProps, type Transition } from "framer-motion";
import { forwardRef, type HTMLAttributes } from "react";

const ease: Transition["ease"] = [0.22, 1, 0.36, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.55, ease },
};

export const stagger = (delay = 0.06): Transition => ({
  staggerChildren: delay,
  delayChildren: 0.05,
});

/** <FadeUp as="section" delay={0.1}> ... </FadeUp> */
type FadeUpProps = HTMLAttributes<HTMLDivElement> &
  MotionProps & { delay?: number };

export const FadeUp = forwardRef<HTMLDivElement, FadeUpProps>(
  ({ delay = 0, transition, ...rest }, ref) => (
    <motion.div
      ref={ref}
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      exit={fadeUp.exit}
      transition={{ ...fadeUp.transition, delay, ...transition }}
      {...rest}
    />
  )
);
FadeUp.displayName = "FadeUp";

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
    transition={{ duration: 0.5, ease }}
  >
    {children}
  </motion.div>
);