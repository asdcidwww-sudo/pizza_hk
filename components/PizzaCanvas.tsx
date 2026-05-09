
import React from 'react';

interface PizzaCanvasProps {
  slices: number;
  selectedSlices: number[];
  onToggleSlice: (index: number) => void;
}

const PizzaCanvas: React.FC<PizzaCanvasProps> = ({ slices, selectedSlices, onToggleSlice }) => {
  const radius = 100;
  const centerX = 120;
  const centerY = 120;

  const getSlicePath = (index: number) => {
    const angle = (2 * Math.PI) / slices;
    const startAngle = index * angle - Math.PI / 2;
    const endAngle = (index + 1) * angle - Math.PI / 2;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex justify-center items-center bg-white p-4 rounded-xl shadow-inner border-2 border-orange-100">
      <svg width="240" height="240" viewBox="0 0 240 240">
        <circle cx={centerX} cy={centerY} r={radius + 5} fill="#d2b48c" />
        {Array.from({ length: slices }).map((_, i) => (
          <path
            key={i}
            d={getSlicePath(i)}
            className={`pizza-slice ${selectedSlices.includes(i) ? 'selected' : 'unselected'}`}
            onClick={() => onToggleSlice(i)}
          />
        ))}
        {/* Draw cut lines on top */}
        {Array.from({ length: slices }).map((_, i) => {
          const angle = (i * (2 * Math.PI)) / slices - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <line
              key={`line-${i}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#8b4513"
              strokeWidth="1"
              pointerEvents="none"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default PizzaCanvas;
