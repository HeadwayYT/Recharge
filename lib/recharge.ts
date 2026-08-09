export type SafetyCategory =
  | "wellbeing_coaching"
  | "professional_evaluation"
  | "do_not_continue_self_coaching";

export type Confidence = "low" | "medium" | "high";

export type UserFactor = {
  id: string;
  label: string;
  description: string;
  confidence: Confidence;
};

export type MissingInformation = {
  id: string;
  prompt: string;
  reason: string;
  options: string[];
  changesDecision: boolean;
};

export type ProblemAnalysis = {
  scenarioId: string;
  safetyCategory: SafetyCategory;
  primaryFocus: string;
  summary: string;
  factors: UserFactor[];
  missingInformation?: MissingInformation;
  contextBadge?: string;
};

export type ExperimentCategory =
  | "circadian"
  | "caffeine"
  | "consistency"
  | "decompression"
  | "shift_work"
  | "recovery"
  | "daytime_energy";

export type Experiment = {
  id: string;
  category: ExperimentCategory;
  title: string;
  hypothesis: string;
  userAction: string;
  durationDays: number;
  targetOutcome: string;
  suitableFor: string[];
  contraindicationsOrCautions: string[];
  explanation: string;
  icon: "sun" | "coffee" | "clock" | "moon" | "spark" | "heart" | "steps";
};

export type CheckIn = {
  metric: string;
  value: string;
  timestamp: string;
};

export type ActiveExperiment = {
  experimentId: string;
  startDate: string;
  currentDay: number;
  adherence: boolean[];
  checkIns: CheckIn[];
  status: "ready" | "active" | "completed";
};

export type LearnedSignal = {
  id: string;
  label: string;
  direction: "helping" | "unclear" | "worsening";
  evidence: string;
};

export type NextBestInteraction =
  | "REQUEST_INFORMATION"
  | "START_EXPERIMENT"
  | "CHECK_IN"
  | "CONTINUE_EXPERIMENT"
  | "COMPLETE_EXPERIMENT"
  | "SURFACE_INSIGHT"
  | "SELECT_NEXT_EXPERIMENT"
  | "SAFETY_ESCALATION";

export type ExperimentDecision = {
  nextBestInteraction: NextBestInteraction;
  experiment: Experiment;
  rationale: string;
  learnedSignals: LearnedSignal[];
};

export type Scenario = {
  id: string;
  name: string;
  matchTerms: string[];
  analysis: ProblemAnalysis;
  defaultExperimentId: string;
  missingInfoExperimentMap?: Record<string, string>;
  learnedSignals: LearnedSignal[];
};

export const experimentLibrary: Experiment[] = [
  {
    id: "morning_light_reset",
    category: "circadian",
    title: "Morning Reset",
    hypothesis:
      "A stronger morning light cue may improve how recovered you feel after a normal-length night.",
    userAction: "Get 10 minutes of outdoor light within an hour of waking.",
    durationDays: 3,
    targetOutcome: "Morning energy",
    suitableFor: ["morning-fatigue", "parent-interruption"],
    contraindicationsOrCautions: ["Avoid staring directly at the sun."],
    explanation:
      "Rather than changing your whole routine, Recharge is testing whether strengthening your morning rhythm improves how you feel.",
    icon: "sun",
  },
  {
    id: "caffeine_cutoff",
    category: "caffeine",
    title: "Coffee Cutoff",
    hypothesis: "Late caffeine may be contributing to lighter recovery.",
    userAction: "No caffeine after 14:30 for the next 3 days.",
    durationDays: 3,
    targetOutcome: "Morning restedness",
    suitableFor: ["morning-fatigue"],
    contraindicationsOrCautions: ["Keep your usual amount earlier in the day if cutting back feels abrupt."],
    explanation:
      "Your note mentions afternoon caffeine, so Recharge is testing timing first instead of asking you to overhaul sleep.",
    icon: "coffee",
  },
  {
    id: "consistent_wake_window",
    category: "consistency",
    title: "Wake Window",
    hypothesis: "A steadier wake time may make recovery feel more predictable.",
    userAction: "Keep wake-up time inside the same 30-minute window for 3 days.",
    durationDays: 3,
    targetOutcome: "Energy stability",
    suitableFor: ["morning-fatigue", "falling-asleep"],
    contraindicationsOrCautions: ["Do not force this after a disrupted caregiving night."],
    explanation:
      "Small timing swings can blur your body clock, so Recharge is testing one stable anchor.",
    icon: "clock",
  },
  {
    id: "evening_brain_dump",
    category: "decompression",
    title: "Evening Shutdown",
    hypothesis: "A short mental unload may reduce the effort of switching off.",
    userAction: "Spend 6 minutes writing tomorrow's loose ends before your wind-down.",
    durationDays: 3,
    targetOutcome: "Ease of switching off",
    suitableFor: ["falling-asleep"],
    contraindicationsOrCautions: ["Keep it practical, not a long reflection session."],
    explanation:
      "Recharge is testing a small decompression cue before changing your whole evening.",
    icon: "moon",
  },
  {
    id: "pre_shift_recovery",
    category: "shift_work",
    title: "Pre-Shift Buffer",
    hypothesis: "A protected pre-shift recovery block may reduce the cost of a night shift.",
    userAction: "Create a 25-minute quiet buffer before leaving for your next shift.",
    durationDays: 2,
    targetOutcome: "Recovery after shift",
    suitableFor: ["shift-work"],
    contraindicationsOrCautions: ["Keep it flexible if family or safety needs interrupt it."],
    explanation:
      "Your schedule is the constraint, so Recharge is testing a small buffer around the shift rather than ideal sleep rules.",
    icon: "clock",
  },
  {
    id: "post_night_shift_recovery",
    category: "shift_work",
    title: "Post-Shift Landing",
    hypothesis: "Lower light and friction after a night shift may make recovery easier.",
    userAction: "After your shift, keep light low and start your sleep block within 45 minutes.",
    durationDays: 2,
    targetOutcome: "Recovery after shift",
    suitableFor: ["shift-work"],
    contraindicationsOrCautions: ["Do not use this if you need to drive tired; safety comes first."],
    explanation:
      "Recharge is protecting the transition after work, where shift recovery often gets disrupted.",
    icon: "moon",
  },
  {
    id: "poor_night_recovery",
    category: "recovery",
    title: "Broken Night Recovery",
    hypothesis: "A gentle daytime recovery cue may help when the night was not fully controllable.",
    userAction: "Take a 12-minute outside reset or quiet walk before midday.",
    durationDays: 3,
    targetOutcome: "Energy availability",
    suitableFor: ["parent-interruption"],
    contraindicationsOrCautions: ["Skip intensity; this is a recovery cue, not a workout."],
    explanation:
      "Because the interruption may be outside your control, Recharge is testing a daytime recovery action.",
    icon: "heart",
  },
  {
    id: "short_daytime_movement",
    category: "daytime_energy",
    title: "Energy Pulse",
    hypothesis: "A short movement cue may reduce the afternoon energy dip.",
    userAction: "Do 5 minutes of easy movement before your usual afternoon slump.",
    durationDays: 3,
    targetOutcome: "Afternoon energy",
    suitableFor: ["morning-fatigue", "parent-interruption"],
    contraindicationsOrCautions: ["Keep it easy if you are running on a poor night."],
    explanation:
      "Recharge is testing whether a small daytime cue changes the moment your energy usually drops.",
    icon: "steps",
  },
];

export const scenarios: Scenario[] = [
  {
    id: "morning-fatigue",
    name: "Seven hours but waking tired",
    matchTerms: ["tired", "exhausted", "fatigue", "caffeine", "coffee", "7 hours", "seven hours", "morning", "3 pm"],
    defaultExperimentId: "morning_light_reset",
    missingInfoExperimentMap: {
      "Before 12": "morning_light_reset",
      "12-14": "morning_light_reset",
      "14-17": "caffeine_cutoff",
      "After 17": "caffeine_cutoff",
    },
    analysis: {
      scenarioId: "morning-fatigue",
      safetyCategory: "wellbeing_coaching",
      primaryFocus: "Morning energy",
      contextBadge: "Day worker pattern",
      summary: "You are sleeping a reasonable amount but still waking tired and leaning on afternoon caffeine.",
      factors: [
        {
          id: "morning-energy",
          label: "Morning energy",
          description: "Recovery quality does not seem to match time in bed.",
          confidence: "high",
        },
        {
          id: "caffeine-timing",
          label: "Caffeine timing",
          description: "Afternoon caffeine may be worth testing before changing everything else.",
          confidence: "medium",
        },
        {
          id: "sleep-consistency",
          label: "Sleep consistency",
          description: "Timing differences may still be affecting recovery.",
          confidence: "medium",
        },
      ],
      missingInformation: {
        id: "last_caffeine",
        prompt: "When do you usually have your last coffee?",
        reason: "This changes whether Recharge starts with light timing or caffeine timing.",
        options: ["Before 12", "12-14", "14-17", "After 17"],
        changesDecision: true,
      },
    },
    learnedSignals: [
      {
        id: "morning-energy",
        label: "Morning energy",
        direction: "unclear",
        evidence: "Recharge will look for a signal after three quick morning check-ins.",
      },
    ],
  },
  {
    id: "shift-work",
    name: "Shift schedule disrupting sleep",
    matchTerms: ["shift", "night shift", "schedule", "roster", "late shift", "early shift", "rotating"],
    defaultExperimentId: "pre_shift_recovery",
    missingInfoExperimentMap: {
      "Tonight": "pre_shift_recovery",
      "Tomorrow morning": "post_night_shift_recovery",
      "Rotating this week": "pre_shift_recovery",
      "Not sure": "pre_shift_recovery",
    },
    analysis: {
      scenarioId: "shift-work",
      safetyCategory: "wellbeing_coaching",
      primaryFocus: "Shift recovery",
      contextBadge: "Next shift: Night 22:00-06:00",
      summary: "Your work timing is creating mixed signals about when to be alert and when to recover.",
      factors: [
        {
          id: "schedule-constraint",
          label: "Schedule constraint",
          description: "The problem is the rhythm around shifts, not lack of effort.",
          confidence: "high",
        },
        {
          id: "transition-cost",
          label: "Transition cost",
          description: "The moments before or after a shift may be the best place to intervene.",
          confidence: "medium",
        },
        {
          id: "light-timing",
          label: "Light timing",
          description: "Light exposure may be making it harder to switch states.",
          confidence: "medium",
        },
      ],
      missingInformation: {
        id: "next_shift",
        prompt: "When is the next shift that affects your sleep?",
        reason: "This determines whether Recharge protects the pre-shift or post-shift transition.",
        options: ["Tonight", "Tomorrow morning", "Rotating this week", "Not sure"],
        changesDecision: true,
      },
    },
    learnedSignals: [
      {
        id: "shift-recovery",
        label: "Recovery after shift",
        direction: "unclear",
        evidence: "Recharge will compare how you feel after protected transition days.",
      },
    ],
  },
  {
    id: "parent-interruption",
    name: "Sleep interrupted by family care",
    matchTerms: ["child", "baby", "toddler", "parent", "kids", "family", "wake up", "wakes me", "interrupted", "broken night"],
    defaultExperimentId: "poor_night_recovery",
    analysis: {
      scenarioId: "parent-interruption",
      safetyCategory: "wellbeing_coaching",
      primaryFocus: "Recovery after broken nights",
      contextBadge: "Constraint-aware",
      summary: "The night is not fully controllable right now, so the useful starting point is reducing tomorrow's recovery cost.",
      factors: [
        {
          id: "interrupted-sleep",
          label: "Interrupted sleep",
          description: "Repeated wake-ups can fragment recovery even when total time looks close.",
          confidence: "high",
        },
        {
          id: "limited-control",
          label: "Limited control",
          description: "Recharge should not ask you to optimize what your family situation does not allow.",
          confidence: "high",
        },
        {
          id: "daytime-recovery",
          label: "Daytime recovery",
          description: "A small daytime reset may be more realistic than perfect sleep advice.",
          confidence: "medium",
        },
      ],
    },
    learnedSignals: [
      {
        id: "energy-availability",
        label: "Energy availability",
        direction: "unclear",
        evidence: "Recharge will watch whether short recovery cues make difficult mornings more manageable.",
      },
    ],
  },
  {
    id: "falling-asleep",
    name: "Difficulty switching off",
    matchTerms: ["fall asleep", "can't sleep", "cannot sleep", "wired", "mind racing", "stress", "anxious", "switch off"],
    defaultExperimentId: "evening_brain_dump",
    analysis: {
      scenarioId: "falling-asleep",
      safetyCategory: "wellbeing_coaching",
      primaryFocus: "Mental decompression",
      contextBadge: "Switch-off pattern",
      summary: "Your system may still be carrying daytime mental load into the night.",
      factors: [
        {
          id: "mental-load",
          label: "Mental load",
          description: "Loose ends may be keeping the brain in active mode.",
          confidence: "high",
        },
        {
          id: "evening-transition",
          label: "Evening transition",
          description: "A short repeatable shutdown cue is worth testing first.",
          confidence: "medium",
        },
        {
          id: "sleep-pressure",
          label: "Sleep pressure",
          description: "Recharge can explore timing later if decompression is not enough.",
          confidence: "low",
        },
      ],
    },
    learnedSignals: [
      {
        id: "switch-off",
        label: "Ease of switching off",
        direction: "unclear",
        evidence: "Recharge will look for whether the shutdown cue makes bedtime feel less effortful.",
      },
    ],
  },
];

const fallbackScenario = scenarios[0];

function scoreScenario(scenario: Scenario, normalizedInput: string): number {
  const baseScore = scenario.matchTerms.filter((term) => normalizedInput.includes(term)).length;

  if (
    scenario.id === "parent-interruption" &&
    ["baby", "child", "toddler", "parent", "kids", "family"].some((term) => normalizedInput.includes(term))
  ) {
    return baseScore + 3;
  }

  if (scenario.id === "shift-work" && normalizedInput.includes("shift")) {
    return baseScore + 3;
  }

  if (
    scenario.id === "falling-asleep" &&
    ["wired", "mind racing", "switch off", "can't sleep", "fall asleep"].some((term) =>
      normalizedInput.includes(term),
    )
  ) {
    return baseScore + 3;
  }

  if (
    scenario.id === "morning-fatigue" &&
    ["coffee", "caffeine", "7 hours", "seven hours", "3 pm"].some((term) => normalizedInput.includes(term))
  ) {
    return baseScore + 2;
  }

  return baseScore;
}

export function analyzeProblem(input: string): ProblemAnalysis {
  const normalized = input.toLowerCase();
  const selected =
    scenarios
      .map((scenario) => ({
        scenario,
        score: scoreScenario(scenario, normalized),
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score)[0]?.scenario ?? fallbackScenario;

  return selected.analysis;
}

export function getMissingInformation(analysis: ProblemAnalysis): MissingInformation | null {
  return analysis.missingInformation?.changesDecision ? analysis.missingInformation : null;
}

export function chooseExperiment(
  analysis: ProblemAnalysis,
  answers: Record<string, string>,
): ExperimentDecision {
  const scenario = scenarios.find((item) => item.id === analysis.scenarioId) ?? fallbackScenario;
  const missingInfo = getMissingInformation(analysis);
  const answer = missingInfo ? answers[missingInfo.id] : undefined;
  const mappedExperimentId =
    answer && scenario.missingInfoExperimentMap
      ? scenario.missingInfoExperimentMap[answer]
      : undefined;
  const experimentId = mappedExperimentId ?? scenario.defaultExperimentId;
  const experiment =
    experimentLibrary.find((item) => item.id === experimentId) ??
    experimentLibrary.find((item) => item.id === scenario.defaultExperimentId) ??
    experimentLibrary[0];

  return {
    nextBestInteraction: "START_EXPERIMENT",
    experiment,
    rationale: experiment.explanation,
    learnedSignals: scenario.learnedSignals,
  };
}

export function createActiveExperiment(experiment: Experiment): ActiveExperiment {
  return {
    experimentId: experiment.id,
    startDate: "Today",
    currentDay: 1,
    adherence: Array.from({ length: experiment.durationDays }, () => false),
    checkIns: [],
    status: "ready",
  };
}

export function recordExperimentStart(activeExperiment: ActiveExperiment): ActiveExperiment {
  return {
    ...activeExperiment,
    status: "active",
  };
}

export function recordAdherence(activeExperiment: ActiveExperiment): ActiveExperiment {
  const adherence = [...activeExperiment.adherence];
  const currentIndex = Math.min(Math.max(activeExperiment.currentDay - 1, 0), adherence.length - 1);
  adherence[currentIndex] = true;
  const completed = adherence.every(Boolean);
  const nextIncompleteIndex = adherence.findIndex((done, index) => !done && index > currentIndex);

  return {
    ...activeExperiment,
    currentDay: completed
      ? activeExperiment.currentDay
      : nextIncompleteIndex >= 0
        ? nextIncompleteIndex + 1
        : Math.min(activeExperiment.currentDay + 1, adherence.length),
    adherence,
    status: completed ? "completed" : "active",
  };
}

export function recordCheckIn(
  activeExperiment: ActiveExperiment,
  metric: string,
  value: string,
): ActiveExperiment {
  return {
    ...activeExperiment,
    checkIns: [
      ...activeExperiment.checkIns,
      {
        metric,
        value,
        timestamp: "Today",
      },
    ],
  };
}

export function getExperimentById(experimentId: string): Experiment {
  return experimentLibrary.find((experiment) => experiment.id === experimentId) ?? experimentLibrary[0];
}
