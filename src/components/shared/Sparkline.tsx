import { useId } from "react";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
  className?: string;
}

/**
 * Smooth area + line sparkline (a data viz, not an icon). Ported from the
 * prototype: Catmull-Rom-ish smoothing with a gradient area fill.
 */
export function Sparkline({
  data,
  width = 96,
  height = 30,
  color = "var(--accent-hex)",
  fill = true,
  strokeWidth = 1.6,
  className,
}: SparklineProps) {
  const gradientId = useId();

  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;

  const points = data.map<[number, number]>((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / span) * (height - 4) - 2,
  ]);

  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }

  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      {fill && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && (
        <path
          d={`${d} L${width},${height} L0,${height} Z`}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
}
