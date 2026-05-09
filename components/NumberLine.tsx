
import React from 'react';

interface NumberLineProps {
  markers: { label: string; value: number; color: string }[];
  onMarkerChange?: (label: string, value: number) => void;
  interactive?: boolean;
}

const NumberLine: React.FC<NumberLineProps> = ({ markers, onMarkerChange, interactive = false }) => {
  const width = 400;
  const height = 60;
  const padding = 20;

  const valToPos = (val: number) => padding + val * (width - 2 * padding);

  const handleLineClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onMarkerChange) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const val = Math.max(0, Math.min(1, (x - padding) / (width - 2 * padding)));
    // Simple logic: update the first marker or context-based
    onMarkerChange('current', val);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
      <svg width={width} height={height} className="overflow-visible" onClick={handleLineClick}>
        {/* Axis line */}
        <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="black" strokeWidth="2" />
        
        {/* Ticks */}
        <line x1={padding} y1={height/2-10} x2={padding} y2={height/2+10} stroke="black" strokeWidth="2" />
        <text x={padding} y={height/2+25} textAnchor="middle" fontSize="12">0</text>
        
        <line x1={width-padding} y1={height/2-10} x2={width-padding} y2={height/2+10} stroke="black" strokeWidth="2" />
        <text x={width-padding} y={height/2+25} textAnchor="middle" fontSize="12">1</text>
        
        <line x1={width/2} y1={height/2-5} x2={width/2} y2={height/2+5} stroke="gray" strokeWidth="1" />
        <text x={width/2} y={height/2+20} textAnchor="middle" fontSize="10" fill="gray">1/2</text>

        {/* Markers */}
        {markers.map((m, idx) => (
          <g key={idx}>
            <circle cx={valToPos(m.value)} cy={height/2} r="6" fill={m.color} className="shadow" />
            <text x={valToPos(m.value)} y={height/2 - 15} textAnchor="middle" fontSize="12" fontWeight="bold" fill={m.color}>
              {m.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default NumberLine;
