import React, { useRef, useState, useCallback } from 'react';

export default function PinchZoomDiv({
  children,
  minScale = 0.5,
  maxScale = 3,
  style = {},
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const lastDistance = useRef(null);

  const getDistance = useCallback((touch1, touch2) => {
    const dx = touch2.pageX - touch1.pageX;
    const dy = touch2.pageY - touch1.pageY;
    return Math.hypot(dx, dy);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      if (lastDistance.current) {
        const delta = dist / lastDistance.current;
        setScale((prev) => {
          const next = Math.min(Math.max(prev * delta, minScale), maxScale);
          return next;
        });
      }
      lastDistance.current = dist;
      e.preventDefault(); // Prevent scroll during pinch
    }
  }, [getDistance, minScale, maxScale]);

  const handleTouchEnd = useCallback(() => {
    lastDistance.current = null;
  }, []);

  return (
    <div
      ref={containerRef}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        overflow: 'auto',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
