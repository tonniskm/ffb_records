import React, { useRef, useState, useCallback } from 'react';

export default function PinchZoomContainer({
  children,
  minScale = 0.5,
  maxScale = 3,
  style = {},
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const lastDistance = useRef(null);

  const getDistance = (touch1, touch2) => {
    const dx = touch2.pageX - touch1.pageX;
    const dy = touch2.pageY - touch1.pageY;
    return Math.hypot(dx, dy);
  };

  const getMidpoint = (touch1, touch2) => ({
    x: (touch1.pageX + touch2.pageX) / 2,
    y: (touch1.pageY + touch2.pageY) / 2,
  });

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && containerRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = getDistance(touch1, touch2);
      const midpoint = getMidpoint(touch1, touch2);

      // Convert midpoint to container-relative coordinates
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = midpoint.x - rect.left;
      const offsetY = midpoint.y - rect.top;

      if (lastDistance.current) {
        const delta = dist / lastDistance.current;
        setScale((prev) => {
          const next = Math.min(Math.max(prev * delta, minScale), maxScale);
          return next;
        });

        setOrigin({
          x: offsetX,
          y: offsetY,
        });
      }

      lastDistance.current = dist;
      e.preventDefault();
    }
  }, [minScale, maxScale]);

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
        // overflow: 'auto',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      <div
  style={{
    width: '100%',
    height: '100%',
    transform: `scale(${scale})`,
    transformOrigin: '0 0',
    willChange: 'transform',
  }}
>
  <div style={{ width: '100%', height: '100%' }}>
    {children}
  </div>
</div>

    </div>
  );
}

{/* <PinchZoomContainer style={{ height: '100vh' }}>
  <div style={{ background: '#ddd', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <h1>Pinch Me Naturally 👌</h1>
  </div>
</PinchZoomContainer> */}
