import React, { useRef, useState, useEffect } from 'react';

export default function PinchZoomDiv({ children, style }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(null);

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault(); // prevent scrolling
      const distance = getDistance(e.touches);
      if (lastDistance !== null) {
        const delta = distance / lastDistance;
        setScale((prev) => Math.min(Math.max(prev * delta, 1), 4));
      }
      setLastDistance(distance);
    }
  };

  const resetTouch = () => setLastDistance(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', resetTouch);
    el.addEventListener('touchcancel', resetTouch);

    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', resetTouch);
      el.removeEventListener('touchcancel', resetTouch);
    };
  }, [lastDistance]);

  return (
    <div
      ref={containerRef}
      style={{
        touchAction: 'none',
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: 'transform 0.05s linear',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
