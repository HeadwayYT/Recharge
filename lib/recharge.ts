export type SafetyCategory =
  | "wellbeing_coaching"
  | "professional_evaluation"
  | "do_not_continue_self_coaching";

export type UserFactor = {
  id: string;
  label: string;
  description: string;
};

export type FollowUpQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

export type ProblemAnalysis = {
  scenarioId: string;
  safetyCategory: SafetyCategory;
  interpretation: string;
  mainChallenge: string;
  factors: UserFactor[];
  followUps: FollowUpQuestion[];
};

export type Intervention = {
  id: string;
  focus: string;
  title: string;
  action: string;
  rationale: string;
};

export type RechargeProfile = {
  goal: string;
  contributors: UserFactor[];
  recommendedFocus: string;
  safetyCategory: SafetyCategory;
};

export type DailyQuest = {
  day: number;
  title: string;
  action: string;
  explanation: string;
  focus: string;
};

export type RechargePlan = {
  goal: string;
  focusAreas: string[];
  quests: DailyQuest[];
};

export type Scenario = {
  id: string;
  name: string;
  matchTerms: string[];
  analysis: Omit<ProblemAnalysis, "scenarioId">;
  profile: Omit<RechargeProfile, "contributors" | "safetyCategory">;
  interventionIds: string[];
};

export const interventionLibrary: Intervention[] = [
  {
    id: "sleep-consistency",
    focus: "Consistency",
    title: "Set a steady wake anchor",
    action: "Choose one wake-up time to keep within a 30-minute window.",
    rationale:
      "A steady morning anchor helps your body rebuild a predictable recovery rhythm.",
  },
  {
    id: "caffeine-timing",
    focus: "Caffeine timing",
    title: "Move caffeine earlier",
    action: "Keep your last caffeinated drink before 2 p.m. today.",
    rationale:
      "Late caffeine can make sleep feel lighter even when the total hours look fine.",
  },
  {
    id: "morning-light",
    focus: "Morning light",
    title: "Get 10 minutes of morning light",
    action: "Step outside or sit near bright natural light within an hour of waking.",
    rationale:
      "Morning light gives your body a clear daytime signal and can support steadier energy.",
  },
  {
    id: "wind-down",
    focus: "Wind-down",
    title: "Create a small landing routine",
    action: "Give yourself 15 screen-light minutes with one quiet repeatable cue.",
    rationale:
      "A short routine can help your system shift out of alert mode without becoming another task.",
  },
  {
    id: "naps",
    focus: "Naps",
    title: "Use a short recovery nap",
    action: "If you need it, keep a nap to 20 minutes and avoid the late afternoon.",
    rationale:
      "Short naps can restore some alertness while protecting tonight's sleep pressure.",
  },
  {
    id: "shift-work",
    focus: "Shift work",
    title: "Protect your sleep block",
    action: "Mark one protected sleep block and reduce light and noise around it.",
    rationale:
      "Shift schedules need stronger environmental cues because clock time is less consistent.",
  },
  {
    id: "night-awakenings",
    focus: "Night awakenings",
    title: "Keep awakenings low-friction",
    action: "If you wake, keep lights low and avoid checking the time.",
    rationale:
      "Reducing stimulation can make it easier to return to sleep without adding pressure.",
  },
  {
    id: "poor-night-recovery",
    focus: "Poor-night recovery",
    title: "Run a gentle recovery day",
    action: "Keep today steady: light, hydration, and an easier evening.",
    rationale:
      "A poor night is easier to recover from when the next day stays regular and kind.",
  },
];

export const scenarios: Scenario[] = [
  {
    id: "morning-fatigue",
    name: "Seven hours but waking tired",
    matchTerms: ["tired", "exhausted", "fatigue", "caffeine", "coffee", "7 hours", "seven hours", "morning"],
    analysis: {
      safetyCategory: "wellbeing_coaching",
      interpretation:
        "It sounds like you are getting a reasonable amount of sleep, but the recovery quality is not matching the time in bed.",
      mainChallenge:
        "Your mornings feel low-energy even though your schedule looks close to enough on paper.",
      factors: [
        {
          id: "late-caffeine",
          label: "Caffeine timing",
          description: "Late caffeine may be keeping sleep lighter than expected.",
        },
        {
          id: "morning-rhythm",
          label: "Morning rhythm",
          description: "A stronger morning signal may help your energy curve stabilize.",
        },
        {
          id: "sleep-regularity",
          label: "Sleep consistency",
          description: "Small swings in timing can affect how restorative sleep feels.",
        },
      ],
      followUps: [
        {
          id: "caffeine_cutoff",
          prompt: "When do you usually have your last caffeine?",
          options: ["Before lunch", "Early afternoon", "Late afternoon", "Evening"],
        },
        {
          id: "wake_pattern",
          prompt: "How do mornings usually feel?",
          options: ["Heavy and slow", "Okay after coffee", "Variable", "Mostly fine"],
        },
        {
          id: "bedtime_regular",
          prompt: "How steady is your bedtime lately?",
          options: ["Very steady", "Moves a bit", "Changes a lot", "Depends on work"],
        },
      ],
    },
    profile: {
      goal: "Wake up with more energy",
      recommendedFocus: "Start with morning rhythm and earlier caffeine.",
    },
    interventionIds: ["morning-light", "caffeine-timing", "sleep-consistency"],
  },
  {
    id: "shift-work",
    name: "Shift schedule disrupting sleep",
    matchTerms: ["shift", "night shift", "schedule", "roster", "late shift", "early shift", "rotating"],
    analysis: {
      safetyCategory: "wellbeing_coaching",
      interpretation:
        "Your sleep is being asked to adapt around work timing, which can make recovery feel unpredictable even when you try to rest.",
      mainChallenge:
        "Your body is getting mixed signals about when to be alert and when to recover.",
      factors: [
        {
          id: "variable-schedule",
          label: "Irregular schedule",
          description: "Changing work hours can disrupt your sleep and energy rhythm.",
        },
        {
          id: "light-exposure",
          label: "Light exposure",
          description: "Light at the wrong time can make it harder to switch off.",
        },
        {
          id: "protected-block",
          label: "Protected recovery",
          description: "A clearer sleep block can reduce friction after demanding shifts.",
        },
      ],
      followUps: [
        {
          id: "shift_type",
          prompt: "Which schedule pattern is most common right now?",
          options: ["Nights", "Early starts", "Rotating", "Unpredictable"],
        },
        {
          id: "after_shift_sleep",
          prompt: "What usually gets in the way after a shift?",
          options: ["Light", "Noise", "Family timing", "I feel wired"],
        },
        {
          id: "next_shift",
          prompt: "How soon does your schedule change again?",
          options: ["Tomorrow", "In a few days", "Weekly", "It varies"],
        },
      ],
    },
    profile: {
      goal: "Recover more reliably around shifts",
      recommendedFocus: "Protect one sleep block and manage light around shifts.",
    },
    interventionIds: ["shift-work", "wind-down", "poor-night-recovery"],
  },
  {
    id: "parent-interruption",
    name: "Sleep interrupted by family care",
    matchTerms: ["child", "baby", "toddler", "parent", "kids", "family", "wake up", "wakes me", "interrupted"],
    analysis: {
      safetyCategory: "wellbeing_coaching",
      interpretation:
        "You may not have full control over the night right now, so the best starting point is reducing the recovery cost of interruptions.",
      mainChallenge:
        "Interrupted sleep is making your mornings feel depleted, even when you are doing your best.",
      factors: [
        {
          id: "night-interruptions",
          label: "Night awakenings",
          description: "Repeated wake-ups can fragment recovery.",
        },
        {
          id: "morning-reset",
          label: "Morning reset",
          description: "A small morning cue can help you recover momentum after a broken night.",
        },
        {
          id: "nap-strategy",
          label: "Short recovery windows",
          description: "Brief, well-timed rest can help without derailing the next night.",
        },
      ],
      followUps: [
        {
          id: "wake_count",
          prompt: "How often are you usually woken up?",
          options: ["Once", "Two or three times", "Many times", "It changes"],
        },
        {
          id: "return_sleep",
          prompt: "After waking, what happens most often?",
          options: ["Back quickly", "I stay alert", "I check my phone", "It depends"],
        },
        {
          id: "day_recovery",
          prompt: "Do you get any small recovery windows during the day?",
          options: ["Yes, often", "Sometimes", "Rarely", "Not right now"],
        },
      ],
    },
    profile: {
      goal: "Feel steadier after interrupted nights",
      recommendedFocus: "Lower the impact of wake-ups and use gentle recovery cues.",
    },
    interventionIds: ["night-awakenings", "poor-night-recovery", "naps"],
  },
  {
    id: "falling-asleep",
    name: "Difficulty falling asleep",
    matchTerms: ["fall asleep", "can't sleep", "cannot sleep", "wired", "mind racing", "stress", "anxious"],
    analysis: {
      safetyCategory: "wellbeing_coaching",
      interpretation:
        "It sounds like your system may still be carrying daytime alertness into the night.",
      mainChallenge:
        "The transition into sleep needs a simpler, more repeatable downshift.",
      factors: [
        {
          id: "wind-down-gap",
          label: "Wind-down",
          description: "A short buffer can make bedtime less abrupt.",
        },
        {
          id: "evening-stimulation",
          label: "Evening stimulation",
          description: "Light, work, and mental load can keep your body in active mode.",
        },
        {
          id: "sleep-pressure",
          label: "Sleep pressure",
          description: "Naps and variable timing can change how ready you feel for sleep.",
        },
      ],
      followUps: [
        {
          id: "sleep_latency",
          prompt: "How long does falling asleep usually take?",
          options: ["Under 20 min", "20-45 min", "Over an hour", "It varies"],
        },
        {
          id: "evening_state",
          prompt: "What best describes your evenings?",
          options: ["Mentally busy", "Screen-heavy", "Physically restless", "Unpredictable"],
        },
        {
          id: "bedtime_pressure",
          prompt: "How much pressure do you feel around bedtime?",
          options: ["Low", "Some", "A lot", "Depends"],
        },
      ],
    },
    profile: {
      goal: "Fall asleep with less effort",
      recommendedFocus: "Build a short wind-down that is easy to repeat.",
    },
    interventionIds: ["wind-down", "sleep-consistency", "caffeine-timing"],
  },
];

const fallbackScenario = scenarios[0];

export function analyzeProblem(input: string): ProblemAnalysis {
  const normalized = input.toLowerCase();
  const selected =
    scenarios.find((scenario) =>
      scenario.matchTerms.some((term) => normalized.includes(term)),
    ) ?? fallbackScenario;

  return {
    scenarioId: selected.id,
    ...selected.analysis,
  };
}

export function buildProfile(
  analysis: ProblemAnalysis,
  answers: Record<string, string>,
): RechargeProfile {
  const scenario = scenarios.find((item) => item.id === analysis.scenarioId) ?? fallbackScenario;
  const answerHints = Object.values(answers).join(" ").toLowerCase();
  const contributors = [...analysis.factors];

  if (answerHints.includes("evening") || answerHints.includes("late afternoon")) {
    contributors.unshift({
      id: "timing-sensitivity",
      label: "Timing sensitivity",
      description: "Your answers suggest timing is a useful first lever.",
    });
  }

  return {
    goal: scenario.profile.goal,
    contributors: contributors.slice(0, 3),
    recommendedFocus: scenario.profile.recommendedFocus,
    safetyCategory: analysis.safetyCategory,
  };
}

export function buildPlan(analysis: ProblemAnalysis, profile: RechargeProfile): RechargePlan {
  const scenario = scenarios.find((item) => item.id === analysis.scenarioId) ?? fallbackScenario;
  const interventions = scenario.interventionIds
    .map((id) => interventionLibrary.find((item) => item.id === id))
    .filter((item): item is Intervention => Boolean(item));

  const quests = interventions.flatMap((intervention, index) => {
    const firstDay = index + 1;
    const secondDay = index + 4;

    return [
      {
        day: firstDay,
        title: intervention.title,
        action: intervention.action,
        explanation: intervention.rationale,
        focus: intervention.focus,
      },
      {
        day: secondDay,
        title: `Repeat: ${intervention.focus.toLowerCase()}`,
        action: intervention.action,
        explanation: "Repeating a small experiment helps you notice what actually changes.",
        focus: intervention.focus,
      },
    ];
  });

  return {
    goal: profile.goal,
    focusAreas: interventions.map((item) => item.focus).slice(0, 3),
    quests: [
      ...quests.slice(0, 6),
      {
        day: 7,
        title: "Reflect on your best signal",
        action: "Take one minute to note which experiment helped your energy most.",
        explanation: "Recharge gets better when it learns which small actions fit your life.",
        focus: "Reflection",
      },
    ].sort((a, b) => a.day - b.day),
  };
}
