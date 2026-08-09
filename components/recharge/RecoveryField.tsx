"use client";

import { motion } from "motion/react";

export type RecoveryFieldState =
  | "unknown"
  | "focusing"
  | "active"
  | "learning"
  | "disrupted"
  | "recovering"
  | "anticipating";

type FieldPoint = { x: number; y: number };

const stateConfig: Record<
  RecoveryFieldState,
  {
    opacity: number;
    scale: number;
    rotate: number;
    blur: number;
    pathOpacity: number;
    glowX: number;
    glowY: number;
    points: FieldPoint[];
  }
> = {
  unknown: {
    opacity: 0.34,
    scale: 1.08,
    rotate: -2,
    blur: 8,
    pathOpacity: 0.12,
    glowX: 76,
    glowY: 43,
    points: [
      { x: 970, y: 170 }, { x: 900, y: 350 }, { x: 1050, y: 520 }, { x: 760, y: 610 }, { x: 650, y: 260 },
    ],
  },
  focusing: {
    opacity: 0.58,
    scale: 1.02,
    rotate: 0,
    blur: 3,
    pathOpacity: 0.34,
    glowX: 68,
    glowY: 48,
    points: [
      { x: 890, y: 195 }, { x: 780, y: 322 }, { x: 930, y: 492 }, { x: 700, y: 570 }, { x: 620, y: 285 },
    ],
  },
  active: {
    opacity: 0.62,
    scale: 1,
    rotate: 0,
    blur: 2,
    pathOpacity: 0.42,
    glowX: 70,
    glowY: 46,
    points: [
      { x: 860, y: 190 }, { x: 760, y: 315 }, { x: 870, y: 475 }, { x: 690, y: 550 }, { x: 610, y: 290 },
    ],
  },
  learning: {
    opacity: 0.78,
    scale: 0.98,
    rotate: 0,
    blur: 0,
    pathOpacity: 0.64,
    glowX: 66,
    glowY: 44,
    points: [
      { x: 820, y: 205 }, { x: 735, y: 302 }, { x: 825, y: 430 }, { x: 690, y: 522 }, { x: 615, y: 310 },
    ],
  },
  disrupted: {
    opacity: 0.58,
    scale: 1.05,
    rotate: -3.5,
    blur: 5,
    pathOpacity: 0.24,
    glowX: 58,
    glowY: 56,
    points: [
      { x: 930, y: 145 }, { x: 675, y: 390 }, { x: 1010, y: 560 }, { x: 580, y: 620 }, { x: 725, y: 230 },
    ],
  },
  recovering: {
    opacity: 0.54,
    scale: 1.02,
    rotate: -1,
    blur: 3,
    pathOpacity: 0.3,
    glowX: 60,
    glowY: 53,
    points: [
      { x: 885, y: 185 }, { x: 720, y: 350 }, { x: 920, y: 520 }, { x: 635, y: 575 }, { x: 680, y: 270 },
    ],
  },
  anticipating: {
    opacity: 0.7,
    scale: 1,
    rotate: 0,
    blur: 1,
    pathOpacity: 0.52,
    glowX: 72,
    glowY: 38,
    points: [
      { x: 585, y: 330 }, { x: 745, y: 330 }, { x: 910, y: 330 }, { x: 1065, y: 330 }, { x: 440, y: 330 },
    ],
  },
};

const pointColors = ["#f3c58b", "#9fd8c4", "#e7a28e", "#b8b7d9", "#f3c58b"];

export function RecoveryField({ state }: { state: RecoveryFieldState }) {
  const config = stateConfig[state];
  const anticipating = state === "anticipating";

  return (
    <motion.div
      className="recovery-field"
      data-state={state}
      aria-hidden="true"
      animate={{
        opacity: config.opacity,
        scale: config.scale,
        rotate: config.rotate,
        filter: `blur(${config.blur}px)`,
      }}
      transition={{ type: "spring", stiffness: 95, damping: 24, mass: 1.3 }}
    >
      <motion.div
        className="recovery-field-light"
        animate={{ left: `${config.glowX}%`, top: `${config.glowY}%` }}
        transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
      />
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <motion.path
          className="field-horizon field-horizon-far"
          animate={{
            d: anticipating
              ? "M80 390 C310 330 460 350 610 338 C760 326 920 334 1130 300"
              : "M70 520 C250 410 395 455 548 360 C720 254 880 300 1140 178",
            opacity: config.pathOpacity * 0.52,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          className="field-horizon"
          animate={{
            d: anticipating
              ? "M60 420 C280 380 445 396 610 382 C790 368 950 378 1150 350"
              : "M45 620 C250 480 410 522 585 408 C740 306 930 354 1160 232",
            opacity: config.pathOpacity,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          className="field-horizon field-horizon-near"
          animate={{
            d: anticipating
              ? "M30 458 C260 440 430 452 615 438 C800 424 975 430 1180 410"
              : "M20 720 C250 570 430 604 620 500 C820 390 985 430 1190 330",
            opacity: config.pathOpacity * 0.7,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {config.points.map((point, index) => (
          <motion.circle
            key={index}
            className="field-point"
            initial={{ cx: point.x, cy: point.y, opacity: 0 }}
            animate={{ cx: point.x, cy: point.y, opacity: config.pathOpacity + 0.18 }}
            transition={{ type: "spring", stiffness: 70, damping: 20, delay: index * 0.035 }}
            r={index === 1 ? 4.5 : 3.2}
            fill={pointColors[index]}
          />
        ))}
      </svg>
    </motion.div>
  );
}
