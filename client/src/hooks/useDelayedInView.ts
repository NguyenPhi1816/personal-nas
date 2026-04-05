import { useEffect, useRef, useState } from "react";

export function useDelayedInView(delay = 100) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          setInView(true);
          timer = null;
        }, delay);
      } else {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        setInView(false);
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  return { ref, inView } as const;
}
