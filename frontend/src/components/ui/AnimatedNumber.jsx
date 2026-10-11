import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { EASE, fmtIN } from "../../lib/scenario";

export default function AnimatedNumber({ value, format = fmtIN, duration = 1.3, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(current.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        current.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [value, inView, reduce, duration]);

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {format(reduce ? value : display)}
    </span>
  );
}

