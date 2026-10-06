import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AbletonKnobProps {
  label: string;
  value: number; // 0.0 to 1.0
  onChange: (newValue: number) => void;
  defaultValue?: number;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
  size?: number;
}

export const AbletonKnob: React.FC<AbletonKnobProps> = ({
  label,
  value,
  onChange,
  defaultValue = 0.5,
  min = 0.0,
  max = 1.0,
  unit = '',
  color = '#FF764D',
  size = 48
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(value);

  // Map 0..1 value to angle: -135deg to +135deg (total 270deg rotation)
  const normVal = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const angle = -135 + normVal * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
    document.body.style.cursor = 'ns-resize';
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const step = (max - min) * 0.02 * (e.deltaY < 0 ? 1 : -1);
    const newVal = Math.max(min, Math.min(max, value + step));
    onChange(Number(newVal.toFixed(3)));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.clientY; // drag up increases value
    const sensitivity = 0.005; // 200px for full sweep
    const deltaVal = deltaY * (max - min) * sensitivity;
    const newVal = Math.max(min, Math.min(max, startValRef.current + deltaVal));
    onChange(Number(newVal.toFixed(3)));
  }, [isDragging, max, min, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // SVG arc calculation
  const radius = (size - 8) / 2;
  const center = size / 2;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  // 270 degrees is 0.75 of circumference
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * normVal);

  const displayVal = (value * (unit === '%' ? 100 : 1)).toFixed(unit === '%' ? 0 : 2);

  return (
    <div className="flex flex-col items-center select-none group">
      <div
        className="relative flex items-center justify-center cursor-ns-resize focus:outline-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        title={`${label}: ${displayVal}${unit} (Drag up/down, scroll, or double-click to reset)`}
      >
        {/* Background Arc */}
        <svg className="absolute inset-0 transform -rotate-135" width={size} height={size}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#26282E"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-75"
          />
        </svg>

        {/* Inner Knob Body */}
        <div 
          className="w-7 h-7 rounded-full bg-[#1C1D22] border border-[#32353E] shadow-inner flex items-center justify-center relative transition-transform duration-75"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Pointer indicator */}
          <div 
            className="w-0.5 h-2.5 rounded-full absolute -top-0.5 left-1/2 -translate-x-1/2"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Label and Value */}
      <span className="text-[11px] font-medium text-slate-300 mt-1 max-w-[72px] truncate text-center leading-tight">
        {label}
      </span>
      <span className="text-[10px] font-mono text-slate-400 tabular-nums">
        {displayVal}{unit}
      </span>
    </div>
  );
};
