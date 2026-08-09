import { experimentLibrary, type Experiment, type ProblemAnalysis } from "./recharge";

export type RecoveryContextDomain =
  | "sleep"
  | "energy"
  | "work"
  | "stress"
  | "movement"
  | "lifeEvents"
  | "schedule";

export type ContextHorizon = "baseline" | "temporary" | "upcoming";

export type RecoveryContextSignal = {
  kind: "broken-night" | "night-shift" | "mental-load" | "changed-context";
  domains: RecoveryContextDomain[];
  horizon: Exclude<ContextHorizon, "baseline">;
  controllability: "low" | "partial";
  sourceText: string;
  timing?: string;
};

export type RecoveryContext = {
  baseline: Record<RecoveryContextDomain, string[]>;
  activeSignal: RecoveryContextSignal | null;
};

export type NextBestAction = {
  source: "experiment" | "temporary-override" | "upcoming-override";
  mode: "experiment" | "recoveryDay" | "nightShift" | "decompression" | "context";
  actionId: string;
  label: string;
  title: string;
  message: string;
  action: string;
  icon: Experiment["icon"];
  timeline?: {
    now: string;
    shiftStart: string;
    shiftEnd: string;
    before: string;
    during: string;
    after: string;
  };
};

const emptyBaseline: Record<RecoveryContextDomain, string[]> = {
  sleep: [],
  energy: [],
  work: [],
  stress: [],
  movement: [],
  lifeEvents: [],
  schedule: [],
};

function getApprovedAction(id: string, fallback: Experiment): Experiment {
  return experimentLibrary.find((experiment) => experiment.id === id) ?? fallback;
}

export function createRecoveryContext(analysis: ProblemAnalysis): RecoveryContext {
  const baseline = Object.fromEntries(
    Object.entries(emptyBaseline).map(([key]) => [key, []]),
  ) as Record<RecoveryContextDomain, string[]>;

  if (analysis.scenarioId === "morning-fatigue") {
    baseline.sleep.push("Reasonable duration, recovery still feels light");
    baseline.energy.push("Low morning energy", "Afternoon dip");
    baseline.work.push("Day worker rhythm");
  }

  if (analysis.scenarioId === "shift-work") {
    baseline.work.push("Shift work");
    baseline.schedule.push("Changing alertness and recovery windows");
    baseline.sleep.push("Sleep timing constrained by work");
  }

  if (analysis.scenarioId === "parent-interruption") {
    baseline.sleep.push("Interrupted nights");
    baseline.lifeEvents.push("Caregiving is not fully controllable");
    baseline.energy.push("Reduced next-day availability");
  }

  if (analysis.scenarioId === "falling-asleep") {
    baseline.stress.push("Mental load remains active after work");
    baseline.sleep.push("Difficulty switching off");
    baseline.work.push("Work-to-rest transition needs support");
  }

  return { baseline, activeSignal: null };
}

export function interpretContextUpdate(context: RecoveryContext, update: string): RecoveryContext {
  const normalized = update.toLowerCase();
  const brokenNight = ["baby", "awake", "all night", "broken night", "child", "toddler", "interrupted"].some(
    (term) => normalized.includes(term),
  );
  const nightShift = ["night shift", "22:00", "22.00", "10 pm", "10pm"].some((term) =>
    normalized.includes(term),
  );
  const mentalLoad = [
    "thinking about work",
    "stop thinking",
    "can't switch off",
    "cannot switch off",
    "mind racing",
    "work has been intense",
    "mental load",
  ].some((term) => normalized.includes(term));

  if (nightShift) {
    return {
      ...context,
      activeSignal: {
        kind: "night-shift",
        domains: ["work", "schedule", "sleep"],
        horizon: "upcoming",
        controllability: "partial",
        sourceText: update,
        timing: "Tomorrow 22:00-06:00",
      },
    };
  }

  if (brokenNight) {
    return {
      ...context,
      activeSignal: {
        kind: "broken-night",
        domains: ["sleep", "energy", "lifeEvents"],
        horizon: "temporary",
        controllability: "low",
        sourceText: update,
      },
    };
  }

  if (mentalLoad) {
    return {
      ...context,
      activeSignal: {
        kind: "mental-load",
        domains: ["work", "stress", "sleep"],
        horizon: "temporary",
        controllability: "partial",
        sourceText: update,
      },
    };
  }

  return {
    ...context,
    activeSignal: {
      kind: "changed-context",
      domains: ["lifeEvents"],
      horizon: "temporary",
      controllability: "partial",
      sourceText: update,
    },
  };
}

export function selectNextBestAction(context: RecoveryContext, currentExperiment: Experiment): NextBestAction {
  const signal = context.activeSignal;

  if (signal?.kind === "night-shift") {
    const action = getApprovedAction("pre_shift_recovery", currentExperiment);
    return {
      source: "upcoming-override",
      mode: "nightShift",
      actionId: action.id,
      label: "Night shift",
      title: "Prepare for tonight.",
      message: "Tomorrow's 22:00 start changes what matters now.",
      action: action.userAction,
      icon: action.icon,
      timeline: {
        now: "Now",
        shiftStart: "22:00",
        shiftEnd: "06:00",
        before: "25-minute quiet buffer",
        during: "Keep caffeine to the first half",
        after: "Low light, straight to recovery",
      },
    };
  }

  if (signal?.kind === "broken-night") {
    const action = getApprovedAction("poor_night_recovery", currentExperiment);
    return {
      source: "temporary-override",
      mode: "recoveryDay",
      actionId: action.id,
      label: "Broken night",
      title: "Recovery today.",
      message: "Last night changed the priority. Morning Reset stays in your longer rhythm.",
      action: action.userAction,
      icon: action.icon,
    };
  }

  if (signal?.kind === "mental-load") {
    const action = getApprovedAction("evening_brain_dump", currentExperiment);
    return {
      source: "temporary-override",
      mode: "decompression",
      actionId: action.id,
      label: "Work still active",
      title: "Close the loop.",
      message: "Work is occupying the transition into recovery.",
      action: action.userAction,
      icon: action.icon,
    };
  }

  if (signal) {
    return {
      source: "temporary-override",
      mode: "context",
      actionId: currentExperiment.id,
      label: "Changed today",
      title: "Keep today simple.",
      message: "Recharge is preserving the smallest useful version of your current focus.",
      action: currentExperiment.userAction,
      icon: currentExperiment.icon,
    };
  }

  return {
    source: "experiment",
    mode: "experiment",
    actionId: currentExperiment.id,
    label: "Today's focus",
    title: currentExperiment.title,
    message: currentExperiment.explanation,
    action: currentExperiment.userAction,
    icon: currentExperiment.icon,
  };
}
