import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Point3D = { x: number; y: number; z: number };
type Edge = [number, number];

const NODE_COUNT = 26;
const RADIUS = 140;
const VIEW = 440;
const CENTER = VIEW / 2;
const CAMERA_DISTANCE = RADIUS * 2.7;
const PULSE_COUNT = 6;

// מפזר N נקודות באופן שווה על פני כדור (Fibonacci sphere) - נותן "רשת נוירונים" תלת-ממדית סבירה
// בלי סימולציית פיזיקה, רק גיאומטריה קבועה שמחושבת פעם אחת
function fibonacciSphere(samples: number, radius: number): Point3D[] {
  const points: Point3D[] = [];
  const offset = 2 / samples;
  const increment = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < samples; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    points.push({ x: Math.cos(phi) * r * radius, y: y * radius, z: Math.sin(phi) * r * radius });
  }

  return points;
}

function distance(a: Point3D, b: Point3D): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

// מחבר כל נקודה לשני השכנים הקרובים לה ביותר - יוצר מראה של רשת נוירונים בלי לחבר את הכל לכולם
function buildEdges(points: Point3D[]): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];

  points.forEach((point, i) => {
    const distances = points
      .map((other, j) => ({ j, d: i === j ? Infinity : distance(point, other) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);

    distances.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    });
  });

  return edges;
}

const NODES = fibonacciSphere(NODE_COUNT, RADIUS);
const EDGES = buildEdges(NODES);
const PULSES = Array.from({ length: PULSE_COUNT }).map((_, i) => ({
  edge: EDGES[Math.floor((i * EDGES.length) / PULSE_COUNT)],
  phase: i / PULSE_COUNT,
  speed: 0.22 + (i % 3) * 0.05,
}));

function rotate(point: Point3D, angleY: number, angleX: number): Point3D {
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const x = point.x * cosY + point.z * sinY;
  const z1 = -point.x * sinY + point.z * cosY;

  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const y = point.y * cosX - z1 * sinX;
  const z = point.y * sinX + z1 * cosX;

  return { x, y, z };
}

function project(point: Point3D) {
  const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - point.z);
  const depth = (point.z + RADIUS) / (2 * RADIUS);
  return { x: CENTER + point.x * scale, y: CENTER + point.y * scale, depth: Math.min(1, Math.max(0, depth)) };
}

type AIBrainVisualizationProps = {
  className?: string;
};

// ויזואליזציה תלת-ממדית (בקירוב, בלי מנוע 3D חיצוני) של "מוח AI" - כדור נוירונים מחוברים שמסתובב לאט,
// עם פולסים של אור שזורמים דרך הקשרים. מחושב ב-CSS/SVG טהור עם requestAnimationFrame שמעדכן
// את התכונות של האלמנטים ישירות (בלי re-render של ריאקט בכל פריים) כדי לשמור על 60FPS
function AIBrainVisualization({ className = "" }: AIBrainVisualizationProps) {
  const shouldReduceMotion = useReducedMotion();
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const edgeRefs = useRef<(SVGLineElement | null)[]>([]);
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);

  const staticFrame = useMemo(() => {
    if (!shouldReduceMotion) return null;
    const rotated = NODES.map((p) => rotate(p, 0.5, 0.15));
    const projected = rotated.map(project);
    return { rotated, projected };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let frameId: number;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const angleY = elapsed * ((2 * Math.PI) / 46);
      const angleX = Math.sin(elapsed * 0.15) * 0.16;

      const projected = NODES.map((p) => project(rotate(p, angleY, angleX)));

      projected.forEach((proj, i) => {
        const node = nodeRefs.current[i];
        if (!node) return;
        node.setAttribute("cx", proj.x.toFixed(2));
        node.setAttribute("cy", proj.y.toFixed(2));
        node.setAttribute("r", (1.6 + proj.depth * 2.6).toFixed(2));
        node.setAttribute("opacity", (0.25 + proj.depth * 0.65).toFixed(2));
      });

      EDGES.forEach(([a, b], i) => {
        const line = edgeRefs.current[i];
        if (!line) return;
        const pa = projected[a];
        const pb = projected[b];
        line.setAttribute("x1", pa.x.toFixed(2));
        line.setAttribute("y1", pa.y.toFixed(2));
        line.setAttribute("x2", pb.x.toFixed(2));
        line.setAttribute("y2", pb.y.toFixed(2));
        line.setAttribute("opacity", (0.04 + ((pa.depth + pb.depth) / 2) * 0.22).toFixed(2));
      });

      PULSES.forEach((pulse, i) => {
        const dot = pulseRefs.current[i];
        if (!dot) return;
        const [a, b] = pulse.edge;
        const pa = projected[a];
        const pb = projected[b];
        const t = (elapsed * pulse.speed + pulse.phase) % 1;
        const x = pa.x + (pb.x - pa.x) * t;
        const y = pa.y + (pb.y - pa.y) * t;
        const fade = Math.sin(t * Math.PI);
        dot.setAttribute("cx", x.toFixed(2));
        dot.setAttribute("cy", y.toFixed(2));
        dot.setAttribute("opacity", (fade * 0.9).toFixed(2));
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [shouldReduceMotion]);

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <svg width="100%" height="100%" viewBox={`0 0 ${VIEW} ${VIEW}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="brain-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.22)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)" />
          </radialGradient>
          <filter id="brain-node-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={RADIUS * 1.35} fill="url(#brain-ambient)" />

        {shouldReduceMotion && staticFrame
          ? EDGES.map(([a, b], i) => {
              const pa = staticFrame.projected[a];
              const pb = staticFrame.projected[b];
              return (
                <line
                  key={i}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke="rgba(139,180,255,0.9)"
                  strokeWidth={0.6}
                  opacity={0.04 + ((pa.depth + pb.depth) / 2) * 0.22}
                />
              );
            })
          : EDGES.map((_, i) => (
              <line
                key={i}
                ref={(el) => {
                  edgeRefs.current[i] = el;
                }}
                stroke="rgba(139,180,255,0.9)"
                strokeWidth={0.6}
              />
            ))}

        {shouldReduceMotion && staticFrame
          ? staticFrame.projected.map((proj, i) => (
              <circle
                key={i}
                cx={proj.x}
                cy={proj.y}
                r={1.6 + proj.depth * 2.6}
                opacity={0.25 + proj.depth * 0.65}
                fill={i % 3 === 0 ? "#38bdf8" : "#c4b5fd"}
                filter="url(#brain-node-glow)"
              />
            ))
          : NODES.map((_, i) => (
              <circle
                key={i}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                fill={i % 3 === 0 ? "#38bdf8" : "#c4b5fd"}
                filter="url(#brain-node-glow)"
              />
            ))}

        {!shouldReduceMotion &&
          PULSES.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                pulseRefs.current[i] = el;
              }}
              r={2.6}
              fill="#e0f2fe"
              filter="url(#brain-node-glow)"
            />
          ))}
      </svg>
    </div>
  );
}

export default AIBrainVisualization;
