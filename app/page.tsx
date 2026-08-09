"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Coffee,
  Home as HomeIcon,
  MessageCircle,
  Moon,
  Route as RouteIcon,
  Sparkles,
  SunMedium,
  TimerReset,
} from "lucide-react";
import {
  analyzeProblem,
  chooseExperiment,
  createActiveExperiment,
  getMissingInformation,
  recordAdherence,
  recordCheckIn,
  recordExperimentStart,
  type ActiveExperiment,
  type Experiment,
  type ExperimentDecision,
  type MissingInformation,
  type ProblemAnalysis,
} from "../lib/recharge";
import {
  composerVariants,
  layoutTransition,
  moduleVariants,
  navVariants,
  screenVariants,
  signalGroupVariants,
  signalVariants,
} from "./recharge-choreography";

type FlowStep = "landing" | "assembling" | "recommendation" | "today";
type AppTab = "today" | "journey" | "update";
type TodayContextStatus = "none" | "adapting" | "adapted";

type TodayContext = {
  status: TodayContextStatus;
  text: string;
  label: string;
  title: string;
  message: string;
  action: string;
};

const quickStarts = ["For example: always tired", "For example: can't switch off", "For example: irregular schedule", "For example: broken nights"];

const emptyTodayContext: TodayContext = {
  status: "none",
  text: "",
  label: "",
  title: "",
  message: "",
  action: "",
};

const iconMap: Record<Experiment["icon"], React.ReactNode> = {
  sun: <SunMedium size={22} aria-hidden="true" />,
  coffee: <Coffee size={22} aria-hidden="true" />,
  clock: <TimerReset size={22} aria-hidden="true" />,
  moon: <Moon size={22} aria-hidden="true" />,
  spark: <Sparkles size={22} aria-hidden="true" />,
  heart: <Sparkles size={22} aria-hidden="true" />,
  steps: <RouteIcon size={22} aria-hidden="true" />,
};

function cleanStarter(starter: string) {
  return starter.replace("For example: ", "");
}

function getVisibleSignals(problemText: string, analysis?: ProblemAnalysis) {
  const lower = problemText.toLowerCase();
  const signals = [
    { term: "wake up exhausted", match: ["wake up exhausted", "waking up exhausted", "waking tired", "wake up tired"] },
    { term: "coffee", match: ["coffee", "caffeine"] },
    { term: "3 PM", match: ["3 pm", "3pm", "afternoon"] },
    { term: "broken nights", match: ["baby", "child", "broken night", "interrupted"] },
    { term: "shift work", match: ["shift", "night shift", "rotating"] },
    { term: "can't switch off", match: ["wired", "switch off", "mind racing", "can't sleep"] },
  ]
    .filter((signal) => signal.match.some((item) => lower.includes(item)))
    .map((signal) => signal.term);

  const factorSignals = analysis?.factors.map((factor) => factor.label) ?? [];
  return Array.from(new Set([...signals, ...factorSignals])).slice(0, 4);
}

function createTodayContext(update: string): TodayContext {
  const lower = update.toLowerCase();
  const brokenNight = ["baby", "awake", "all night", "broken", "child", "toddler", "interrupted"].some((term) =>
    lower.includes(term),
  );

  if (brokenNight) {
    return {
      status: "adapting",
      text: update,
      label: "Broken night",
      title: "Recovery Day",
      message: "Today does not need to be perfect.",
      action: "Take a 12-minute outside reset or quiet walk before midday.",
    };
  }

  return {
    status: "adapting",
    text: update,
    label: "Changed context",
    title: "Lighter Day",
    message: "Recharge is adjusting the expectation around what is happening.",
    action: "Keep the smallest useful version of today's experiment.",
  };
}

export default function Home() {
  const [step, setStep] = useState<FlowStep>("landing");
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [problemText, setProblemText] = useState("");
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [decision, setDecision] = useState<ExperimentDecision | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<ActiveExperiment | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [todayContext, setTodayContext] = useState<TodayContext>(emptyTodayContext);

  const missingInformation = analysis ? getMissingInformation(analysis) : null;
  const pendingMissingInformation =
    missingInformation && answers[missingInformation.id] == null ? missingInformation : null;
  const previewDecision = analysis ? chooseExperiment(analysis, answers) : null;
  const adherenceKey = activeExperiment?.adherence.map((done) => (done ? "1" : "0")).join("") ?? "";
  const answerKey = Object.values(answers).join("|");

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0 });
      document.querySelectorAll(".app-shell, .screen").forEach((element) => {
        element.scrollTo({ top: 0, left: 0 });
      });
    };

    resetScroll();
    window.setTimeout(resetScroll, 0);
  }, [step, activeTab, answerKey, adherenceKey, todayContext.status]);

  function submitProblem(event?: FormEvent<HTMLFormElement>, explicitText?: string) {
    event?.preventDefault();
    const text = (explicitText ?? problemText).trim();
    if (!text) return;

    const nextAnalysis = analyzeProblem(text);
    setProblemText(text);
    setAnalysis(nextAnalysis);
    setAnswers({});
    setDecision(null);
    setActiveExperiment(null);
    setCheckIn("");
    setTodayContext(emptyTodayContext);
    setActiveTab("today");
    setStep("assembling");
    window.setTimeout(() => setStep("recommendation"), 860);
  }

  function answerMissingInformation(value: string) {
    if (!missingInformation) return;
    setAnswers((current) => ({ ...current, [missingInformation.id]: value }));
  }

  function startRecommendedExperiment() {
    if (!analysis) return;
    const nextDecision = chooseExperiment(analysis, answers);
    const startedExperiment = recordExperimentStart(createActiveExperiment(nextDecision.experiment));
    setDecision(nextDecision);
    setActiveExperiment(startedExperiment);
    setActiveTab("today");
    setStep("today");
  }

  function markDone() {
    if (!activeExperiment) return;
    setActiveExperiment(recordAdherence(activeExperiment));
  }

  function recordMorningCheckIn(value: string) {
    if (!activeExperiment || !decision) return;
    setCheckIn(value);
    setActiveExperiment(recordCheckIn(activeExperiment, decision.experiment.targetOutcome, value));
  }

  function restart() {
    setProblemText("");
    setAnalysis(null);
    setAnswers({});
    setDecision(null);
    setActiveExperiment(null);
    setCheckIn("");
    setUpdateText("");
    setTodayContext(emptyTodayContext);
    setActiveTab("today");
    setStep("landing");
  }

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = updateText.trim();
    if (!text) return;

    const context = createTodayContext(text);
    setTodayContext(context);
    setUpdateText("");
    setActiveTab("today");
    window.setTimeout(() => {
      setTodayContext({ ...context, status: "adapted" });
    }, 980);
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="mesh-layer" aria-hidden="true" />

      <section className="phone-frame" aria-label="Recharge application preview">
        <header className="top-bar">
          <button className="brand-lockup" type="button" onClick={restart} aria-label="Restart Recharge">
            <span className="brand-mark" />
            <span>Recharge</span>
          </button>
        </header>

        <LayoutGroup id="recharge-flow">
          <AnimatePresence initial={false} mode="wait">
            {step === "landing" && (
              <LandingScreen
                key="landing"
                problemText={problemText}
                onChange={setProblemText}
                onSubmit={submitProblem}
              />
            )}
            {step === "assembling" && analysis && (
              <AssemblingScreen key="assembling" analysis={analysis} problemText={problemText} />
            )}
            {step === "recommendation" && analysis && previewDecision && (
              <RecommendationCanvas
                key="recommendation"
                analysis={analysis}
                problemText={problemText}
                previewDecision={previewDecision}
                missingInformation={pendingMissingInformation}
                onAnswer={answerMissingInformation}
                onStart={startRecommendedExperiment}
              />
            )}
            {step === "today" && analysis && decision && activeExperiment && (
              <TodayShell
                key="today"
                activeTab={activeTab}
                onTabChange={setActiveTab}
                analysis={analysis}
                decision={decision}
                activeExperiment={activeExperiment}
                checkIn={checkIn}
                todayContext={todayContext}
                onCheckIn={recordMorningCheckIn}
                onDone={markDone}
                updateText={updateText}
                onUpdateText={setUpdateText}
                onSubmitUpdate={submitUpdate}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </section>
    </main>
  );
}

function LandingScreen({
  problemText,
  onChange,
  onSubmit,
}: {
  problemText: string;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.section
      className="screen opening-screen"
      layout
      transition={layoutTransition}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="opening-copy">
        <h1>What&apos;s been draining your energy lately?</h1>
        <p>Tell me what&apos;s been going on. You don&apos;t need to know what the problem is yet.</p>
      </div>

      <motion.form
        className="opening-composer"
        layout
        layoutId="recharge-composer"
        transition={layoutTransition}
        variants={composerVariants}
        onSubmit={onSubmit}
      >
        <textarea
          value={problemText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="I've been waking up exhausted even when I sleep enough..."
          aria-label="Tell Recharge what has been draining your energy"
        />
        <div className="starter-row" aria-label="Examples">
          {quickStarts.map((chip) => (
            <button key={chip} type="button" className="starter-chip" onClick={() => onChange(cleanStarter(chip))}>
              {chip}
            </button>
          ))}
        </div>
        <button className="primary-action" type="submit" disabled={!problemText.trim()}>
          <span>Start my Recharge</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </motion.form>
    </motion.section>
  );
}

function AssemblingScreen({
  analysis,
  problemText,
}: {
  analysis: ProblemAnalysis;
  problemText: string;
}) {
  const signals = getVisibleSignals(problemText, analysis);

  return (
    <motion.section
      className="screen analysis-screen canvas-transition"
      aria-live="polite"
      layout
      transition={layoutTransition}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="compressed-composer sentence-fragment"
        layout
        layoutId="recharge-composer"
        transition={layoutTransition}
        variants={composerVariants}
      >
        <p>{problemText}</p>
      </motion.div>

      <motion.div
        className="signal-lift"
        aria-label="Relevant signals"
        variants={signalGroupVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {signals.map((signal) => (
          <motion.span key={signal} layout variants={signalVariants}>
            {signal}
          </motion.span>
        ))}
      </motion.div>

      <motion.h1 layout variants={moduleVariants} custom={0.18}>
        Finding the first useful shape.
      </motion.h1>
    </motion.section>
  );
}

function RecommendationCanvas({
  analysis,
  problemText,
  previewDecision,
  missingInformation,
  onAnswer,
  onStart,
}: {
  analysis: ProblemAnalysis;
  problemText: string;
  previewDecision: ExperimentDecision;
  missingInformation: MissingInformation | null;
  onAnswer: (answer: string) => void;
  onStart: () => void;
}) {
  const signals = getVisibleSignals(problemText, analysis).filter((signal) => signal !== analysis.primaryFocus);
  const { experiment } = previewDecision;

  return (
    <motion.section
      className="screen personal-canvas adaptive-canvas"
      layout
      transition={layoutTransition}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="compressed-composer canvas-composer sentence-fragment"
        layout
        layoutId="recharge-composer"
        transition={layoutTransition}
        variants={composerVariants}
      >
        <p>{problemText}</p>
      </motion.div>

      <motion.div className="focus-statement assembly-module" layout variants={moduleVariants} custom={0.08}>
        <h1>Let&apos;s start with your {analysis.primaryFocus.toLowerCase()}.</h1>
        <p>{analysis.summary}</p>
      </motion.div>

      <motion.div
        className="supporting-signals satellite-signals"
        aria-label="Secondary signals"
        variants={signalGroupVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {signals.slice(0, 3).map((signal) => (
          <motion.span className="assembly-module" key={signal} layout variants={signalVariants}>
            {signal}
          </motion.span>
        ))}
      </motion.div>

      <ExperimentModule
        mode="recommended"
        experiment={experiment}
        activeExperiment={null}
        primaryFocus={analysis.primaryFocus}
        actionCopy="Start experiment"
        onPrimaryAction={onStart}
      />

      <AnimatePresence>
        {missingInformation && (
          <ContextQuestion key={missingInformation.id} missingInformation={missingInformation} onAnswer={onAnswer} />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function ContextQuestion({
  missingInformation,
  onAnswer,
}: {
  missingInformation: MissingInformation;
  onAnswer: (answer: string) => void;
}) {
  return (
    <motion.section
      className="canvas-question context-question assembly-module"
      layout
      variants={moduleVariants}
      custom={0.48}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h2>{missingInformation.prompt}</h2>
      <div className="canvas-options">
        {missingInformation.options.map((option) => (
          <button key={option} type="button" onClick={() => onAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
    </motion.section>
  );
}

function ExperimentModule({
  mode,
  experiment,
  activeExperiment,
  primaryFocus,
  actionCopy,
  onPrimaryAction,
}: {
  mode: "recommended" | "active" | "completedToday" | "secondary";
  experiment: Experiment;
  activeExperiment: ActiveExperiment | null;
  primaryFocus: string;
  actionCopy?: string;
  onPrimaryAction?: () => void;
}) {
  const completedToday = activeExperiment?.adherence[(activeExperiment.currentDay ?? 1) - 1] ?? false;
  const dayText = activeExperiment
    ? `Day ${activeExperiment.currentDay} of ${experiment.durationDays}`
    : `${experiment.durationDays} days`;
  const stateCopy =
    mode === "recommended"
      ? "Let's test your morning rhythm first."
      : mode === "completedToday"
        ? `Day ${activeExperiment?.currentDay ?? 1} complete.`
        : mode === "secondary"
          ? "Still running, just lighter today."
          : experiment.userAction;

  return (
    <motion.article
      className={`experiment-living-module ${mode}`}
      layout
      layoutId="primary-experiment"
      variants={moduleVariants}
      custom={0.28}
    >
      <div className="experiment-module-top">
        <div className="experiment-icon">{iconMap[experiment.icon]}</div>
        <span>{primaryFocus}</span>
      </div>
      <div className="experiment-module-copy">
        <h2>{experiment.title}</h2>
        <strong>{dayText}</strong>
        <p>{stateCopy}</p>
      </div>
      {activeExperiment && <ExperimentDots activeExperiment={activeExperiment} />}
      {onPrimaryAction && (
        <button className="primary-action" type="button" onClick={onPrimaryAction}>
          {completedToday && <Check size={18} aria-hidden="true" />}
          <span>{actionCopy}</span>
          {!completedToday && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      )}
    </motion.article>
  );
}

function TodayShell({
  activeTab,
  onTabChange,
  analysis,
  decision,
  activeExperiment,
  checkIn,
  todayContext,
  onCheckIn,
  onDone,
  updateText,
  onUpdateText,
  onSubmitUpdate,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  checkIn: string;
  todayContext: TodayContext;
  onCheckIn: (value: string) => void;
  onDone: () => void;
  updateText: string;
  onUpdateText: (value: string) => void;
  onSubmitUpdate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.section
      className="screen app-view living-app-view"
      layout
      transition={layoutTransition}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatePresence initial={false} mode="wait">
        {activeTab === "today" && (
          <TodayScreen
            key="today-panel"
            analysis={analysis}
            decision={decision}
            activeExperiment={activeExperiment}
            checkIn={checkIn}
            todayContext={todayContext}
            onCheckIn={onCheckIn}
            onDone={onDone}
          />
        )}
        {activeTab === "journey" && (
          <JourneyScreen
            key="journey-panel"
            analysis={analysis}
            decision={decision}
            activeExperiment={activeExperiment}
            checkIn={checkIn}
            todayContext={todayContext}
          />
        )}
        {activeTab === "update" && (
          <UpdateScreen
            key="update-panel"
            updateText={updateText}
            onUpdateText={onUpdateText}
            onSubmitUpdate={onSubmitUpdate}
          />
        )}
      </AnimatePresence>

      <motion.nav
        className="bottom-nav"
        aria-label="Primary destinations"
        variants={navVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {(["today", "journey", "update"] as AppTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => onTabChange(tab)}
          >
            {tab === "today" && <HomeIcon size={17} aria-hidden="true" />}
            {tab === "journey" && <RouteIcon size={17} aria-hidden="true" />}
            {tab === "update" && <MessageCircle size={17} aria-hidden="true" />}
            <span>{tab === "update" ? "Update" : tab[0].toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </motion.nav>
    </motion.section>
  );
}

function TodayScreen({
  analysis,
  decision,
  activeExperiment,
  checkIn,
  todayContext,
  onCheckIn,
  onDone,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  checkIn: string;
  todayContext: TodayContext;
  onCheckIn: (value: string) => void;
  onDone: () => void;
}) {
  const { experiment } = decision;
  const completedToday = activeExperiment.adherence[activeExperiment.currentDay - 1];
  const [whyOpen, setWhyOpen] = useState(false);
  const hasAdaptedContext = todayContext.status !== "none";

  return (
    <motion.div
      className={`tab-panel today-canvas ${hasAdaptedContext ? `context-${todayContext.status}` : ""}`}
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div className="today-greeting" layout variants={moduleVariants} custom={0}>
        <span className="eyebrow">{hasAdaptedContext ? todayContext.label : "Today"}</span>
        <h1>{hasAdaptedContext ? "Today changed shape." : "Good morning."}</h1>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {hasAdaptedContext && (
          <motion.article
            key="adapted-context"
            className={`context-living-module ${todayContext.status}`}
            layout
            layoutId="today-context"
            variants={moduleVariants}
            custom={0.08}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <span>{todayContext.text}</span>
            <h2>{todayContext.status === "adapting" ? todayContext.label : todayContext.title}</h2>
            <p>{todayContext.status === "adapting" ? "Rebuilding today around what happened." : todayContext.message}</p>
            <strong>{todayContext.status === "adapted" ? todayContext.action : "Morning Reset is shifting into the background."}</strong>
          </motion.article>
        )}
      </AnimatePresence>

      <ExperimentModule
        mode={hasAdaptedContext ? "secondary" : completedToday ? "completedToday" : "active"}
        experiment={experiment}
        activeExperiment={activeExperiment}
        primaryFocus={analysis.primaryFocus}
        actionCopy={completedToday ? "Done for today" : "Done for today"}
        onPrimaryAction={onDone}
      />

      <AnimatePresence>
        {completedToday && !hasAdaptedContext && (
          <DailyCheckIn key="daily-checkin" checkIn={checkIn} metric={experiment.targetOutcome} onCheckIn={onCheckIn} />
        )}
      </AnimatePresence>

      <motion.div className="quiet-why" layout variants={moduleVariants} custom={0.18}>
        <button type="button" onClick={() => setWhyOpen((open) => !open)}>
          Why this?
        </button>
        <AnimatePresence>
          {whyOpen && (
            <motion.p
              key="why-copy"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {hasAdaptedContext ? todayContext.action : experiment.explanation}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function DailyCheckIn({
  checkIn,
  metric,
  onCheckIn,
}: {
  checkIn: string;
  metric: string;
  onCheckIn: (value: string) => void;
}) {
  const options = ["Low", "Same", "Lighter", "Bright"];

  return (
    <motion.section
      className="daily-checkin"
      layout
      layoutId="daily-checkin"
      variants={moduleVariants}
      custom={0.08}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h2>How&apos;s your {metric.toLowerCase()} this morning?</h2>
      <div className="energy-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={checkIn === option ? "selected option" : "option"}
            onClick={() => onCheckIn(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </motion.section>
  );
}

function JourneyScreen({
  analysis,
  decision,
  activeExperiment,
  checkIn,
  todayContext,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  checkIn: string;
  todayContext: TodayContext;
}) {
  const { experiment } = decision;
  const completedToday = activeExperiment.adherence[activeExperiment.currentDay - 1];
  const primaryLearning = checkIn
    ? `After today's action you marked ${checkIn.toLowerCase()}. That's a useful first signal, not a conclusion yet.`
    : completedToday
      ? "One completed day is a start. A few more mornings will make the pattern clearer."
      : "Too early to tell. The pattern will get clearer after a few check-ins.";

  return (
    <motion.div
      className="tab-panel journey-canvas"
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div className="journey-heading" layout variants={moduleVariants} custom={0}>
        <span className="eyebrow">Journey</span>
        <h1>You&apos;re learning what gives you energy.</h1>
      </motion.div>

      <motion.article className="journey-current" layout layoutId="primary-experiment" variants={moduleVariants} custom={0.08}>
        <div className="experiment-icon">{iconMap[experiment.icon]}</div>
        <div>
          <span>Right now</span>
          <h2>{experiment.title}</h2>
          <p>
            Day {activeExperiment.currentDay} of {experiment.durationDays}
          </p>
        </div>
        <ExperimentDots activeExperiment={activeExperiment} />
      </motion.article>

      <motion.article className="insight-module" layout layoutId="journey-insight" variants={moduleVariants} custom={0.16}>
        <span>{checkIn ? "A pattern may be emerging" : "Still gathering signal"}</span>
        <p>{primaryLearning}</p>
      </motion.article>

      <motion.div className="explore-next" layout variants={signalGroupVariants} initial="initial" animate="animate" exit="exit">
        <span>Worth exploring next</span>
        <div>
          {analysis.factors
            .filter((factor) => factor.label !== analysis.primaryFocus)
            .slice(0, 2)
            .map((factor) => (
              <motion.button type="button" key={factor.id} variants={signalVariants}>
                {factor.label}
              </motion.button>
            ))}
          {todayContext.status !== "none" && (
            <motion.button type="button" variants={signalVariants}>
              {todayContext.label}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function UpdateScreen({
  updateText,
  onUpdateText,
  onSubmitUpdate,
}: {
  updateText: string;
  onUpdateText: (value: string) => void;
  onSubmitUpdate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.div
      className="tab-panel update-canvas"
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <span className="eyebrow">Something changed?</span>
      <h1>Tell Recharge.</h1>
      <p className="lead">We&apos;ll adjust today around what&apos;s happening.</p>
      <motion.form className="update-composer" layout layoutId="update-composer" onSubmit={onSubmitUpdate}>
        <textarea
          value={updateText}
          onChange={(event) => onUpdateText(event.target.value)}
          placeholder="Our baby was awake all night."
          aria-label="Tell Recharge what changed"
        />
        <button className="primary-action" type="submit" disabled={!updateText.trim()}>
          <span>Adjust today</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </motion.form>
    </motion.div>
  );
}

function ExperimentDots({ activeExperiment }: { activeExperiment: ActiveExperiment }) {
  return (
    <div className="experiment-dots" aria-label="Experiment progress">
      {activeExperiment.adherence.map((done, index) => (
        <span
          key={`${activeExperiment.experimentId}-${index}`}
          className={done ? "complete" : index + 1 === activeExperiment.currentDay ? "current" : ""}
        >
          {index + 1}
        </span>
      ))}
    </div>
  );
}
