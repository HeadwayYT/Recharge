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

type FlowStep = "landing" | "intake" | "analyzing" | "result" | "missing-info" | "experiment" | "today";
type AppTab = "today" | "journey" | "update";

const quickStarts = ["Always tired", "Can't switch off", "Irregular schedule", "Broken nights"];

const iconMap: Record<Experiment["icon"], React.ReactNode> = {
  sun: <SunMedium size={22} aria-hidden="true" />,
  coffee: <Coffee size={22} aria-hidden="true" />,
  clock: <TimerReset size={22} aria-hidden="true" />,
  moon: <Moon size={22} aria-hidden="true" />,
  spark: <Sparkles size={22} aria-hidden="true" />,
  heart: <Sparkles size={22} aria-hidden="true" />,
  steps: <RouteIcon size={22} aria-hidden="true" />,
};

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

  const missingInformation = analysis ? getMissingInformation(analysis) : null;

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0 });
      document.querySelectorAll(".app-shell, .screen").forEach((element) => {
        element.scrollTo({ top: 0, left: 0 });
      });
    };

    resetScroll();
    window.setTimeout(resetScroll, 0);
  }, [step, activeTab]);

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
    setActiveTab("today");
    setStep("analyzing");
    window.setTimeout(() => setStep("result"), 720);
  }

  function chooseFirstExperiment(nextAnswers: Record<string, string>) {
    if (!analysis) return;
    const nextDecision = chooseExperiment(analysis, nextAnswers);
    setDecision(nextDecision);
    setActiveExperiment(createActiveExperiment(nextDecision.experiment));
    setStep("experiment");
  }

  function continueFromResult() {
    if (!analysis) return;
    chooseFirstExperiment(answers);
  }

  function answerMissingInformation(value: string) {
    if (!missingInformation) return;
    const nextAnswers = { ...answers, [missingInformation.id]: value };
    setAnswers(nextAnswers);
    chooseFirstExperiment(nextAnswers);
  }

  function startExperiment() {
    if (!activeExperiment) return;
    setActiveExperiment(recordExperimentStart(activeExperiment));
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
    setActiveTab("today");
    setStep("landing");
  }

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitProblem(undefined, updateText);
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
            {step === "intake" && (
              <LandingScreen
                key="intake"
                problemText={problemText}
                onChange={setProblemText}
                onSubmit={submitProblem}
              />
            )}
            {step === "analyzing" && analysis && (
              <AnalyzingScreen key="analyzing" analysis={analysis} problemText={problemText} />
            )}
            {step === "result" && analysis && (
              <ResultScreen
                key="result"
                analysis={analysis}
                problemText={problemText}
                previewDecision={chooseExperiment(analysis, answers)}
                missingInformation={missingInformation}
                onAnswer={answerMissingInformation}
                onContinue={continueFromResult}
              />
            )}
            {step === "experiment" && analysis && decision && activeExperiment && (
              <ExperimentScreen
                key="experiment"
                analysis={analysis}
                problemText={problemText}
                decision={decision}
                activeExperiment={activeExperiment}
                onStart={startExperiment}
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
        <p>
          Tell me what&apos;s been going on. You don&apos;t need to know what the problem is yet.
        </p>
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
        <div className="chip-row">
          {quickStarts.map((chip) => (
            <button
              key={chip}
              type="button"
              className="chip"
              onClick={() => onChange(chip)}
            >
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

function AnalyzingScreen({
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
        className="compressed-composer"
        layout
        layoutId="recharge-composer"
        transition={layoutTransition}
        variants={composerVariants}
      >
        <span>Your words</span>
        <p>{problemText}</p>
      </motion.div>

      <motion.div
        className="signal-lift"
        aria-label="Signals Recharge noticed"
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

      <h1>Finding the first useful move.</h1>
    </motion.section>
  );
}

function ResultScreen({
  analysis,
  problemText,
  previewDecision,
  missingInformation,
  onAnswer,
  onContinue,
}: {
  analysis: ProblemAnalysis;
  problemText: string;
  previewDecision: ExperimentDecision;
  missingInformation: MissingInformation | null;
  onAnswer: (answer: string) => void;
  onContinue: () => void;
}) {
  const signals = getVisibleSignals(problemText, analysis).filter((signal) => signal !== analysis.primaryFocus);
  const { experiment } = previewDecision;

  return (
    <motion.section
      className="screen personal-canvas"
      layout
      transition={layoutTransition}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="compressed-composer canvas-composer"
        layout
        layoutId="recharge-composer"
        transition={layoutTransition}
        variants={composerVariants}
      >
        <span>Your words</span>
        <p>{problemText}</p>
      </motion.div>

      <motion.div
        className="focus-statement assembly-module"
        layout
        variants={moduleVariants}
        custom={0.08}
      >
        <span>Recharge noticed</span>
        <h1>Let&apos;s start with your {analysis.primaryFocus.toLowerCase()}.</h1>
        <p>{analysis.summary}</p>
      </motion.div>

      <motion.div
        className="supporting-signals"
        aria-label="Related signals"
        variants={signalGroupVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {signals.slice(0, 3).map((signal) => (
          <motion.span
            className="assembly-module"
            key={signal}
            layout
            variants={signalVariants}
          >
            {signal}
          </motion.span>
        ))}
      </motion.div>

      <motion.article
        className="hero-experiment assembly-module"
        layout
        layoutId="primary-experiment"
        variants={moduleVariants}
        custom={0.34}
      >
        <div className="experiment-icon">{iconMap[experiment.icon]}</div>
        <div>
          <span>Start here</span>
          <h2>{experiment.title}</h2>
          <p>{experiment.userAction}</p>
          <small>
            {experiment.durationDays} days - about {experiment.id === "morning_light_reset" ? "10" : experiment.id === "evening_brain_dump" ? "6" : "5-15"} min/day
          </small>
        </div>

        {!missingInformation && (
          <button className="primary-action" type="button" onClick={onContinue}>
            <span>Start my experiment</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </motion.article>

      {missingInformation && (
        <motion.section
          className="canvas-question assembly-module"
          layout
          variants={moduleVariants}
          custom={0.48}
        >
          <span>One quick thing</span>
          <h2>{missingInformation.prompt}</h2>
          <div className="canvas-options">
            {missingInformation.options.map((option) => (
              <button key={option} type="button" onClick={() => onAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        </motion.section>
      )}
    </motion.section>
  );
}

function ExperimentScreen({
  analysis,
  problemText,
  decision,
  activeExperiment,
  onStart,
}: {
  analysis: ProblemAnalysis;
  problemText: string;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  onStart: () => void;
}) {
  const { experiment } = decision;

  return (
    <motion.section
      className="screen assembled-screen"
      layout
      transition={layoutTransition}
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AssemblySummary analysis={analysis} problemText={problemText} status="Your first step" />
      <motion.div
        className="experiment-hero assembly-module hero-assembly"
        layout
        layoutId="primary-experiment"
        variants={moduleVariants}
        custom={0.08}
      >
        <span className="eyebrow">Start here</span>
        <div className="experiment-icon">{iconMap[experiment.icon]}</div>
        <h1>{experiment.title}</h1>
        <p>{experiment.userAction}</p>
      </motion.div>

      <motion.div className="why-card assembly-module" layout variants={moduleVariants} custom={0.18}>
        <span className="panel-label">Why this helps</span>
        <p>{decision.rationale}</p>
      </motion.div>

      <motion.div className="experiment-meta assembly-module" layout variants={moduleVariants} custom={0.26}>
        <article>
          <span>Duration</span>
          <strong>{experiment.durationDays}-day experiment</strong>
        </article>
        <article>
          <span>Track</span>
          <strong>{experiment.targetOutcome}</strong>
        </article>
      </motion.div>

      <motion.div className="assembly-module" layout variants={moduleVariants} custom={0.34}>
        <ExperimentDots activeExperiment={activeExperiment} />
      </motion.div>

      <p className="microcopy">
        This is intentionally small: one change, three days, then Recharge can learn from what happens.
      </p>

      <button className="primary-action" type="button" onClick={onStart}>
        <span>Start my experiment</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </motion.section>
  );
}

function AssemblySummary({
  analysis,
  problemText,
  status,
}: {
  analysis: ProblemAnalysis;
  problemText: string;
  status: string;
}) {
  const compactText = problemText.length > 92 ? `${problemText.slice(0, 89)}...` : problemText;

  return (
    <motion.section
      className="assembly-summary"
      aria-label="Compact Recharge summary"
      layout
      variants={moduleVariants}
      custom={0}
    >
      <div>
        <span className="panel-label">{status}</span>
        <strong>{analysis.primaryFocus}</strong>
      </div>
      <p>{compactText}</p>
    </motion.section>
  );
}

function TodayShell({
  activeTab,
  onTabChange,
  analysis,
  decision,
  activeExperiment,
  checkIn,
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
  onCheckIn: (value: string) => void;
  onDone: () => void;
  updateText: string;
  onUpdateText: (value: string) => void;
  onSubmitUpdate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.section
      className="screen app-view"
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
  onCheckIn,
  onDone,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  checkIn: string;
  onCheckIn: (value: string) => void;
  onDone: () => void;
}) {
  const { experiment } = decision;
  const completedToday = activeExperiment.adherence[activeExperiment.currentDay - 1];

  return (
    <motion.div
      className="tab-panel"
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <span className="eyebrow">Today</span>
      <h1>Today&apos;s experiment</h1>

      <section className="quest-card experiment-today-card">
        <div className="experiment-title-row">
          <div className="experiment-icon small">{iconMap[experiment.icon]}</div>
          <div>
            <span className="panel-label">{analysis.primaryFocus}</span>
            <h2>{experiment.title}</h2>
          </div>
        </div>
        <p>{experiment.userAction}</p>
        <strong className="day-label">
          Day {activeExperiment.currentDay} of {experiment.durationDays}
        </strong>
        <ExperimentDots activeExperiment={activeExperiment} />
        <button className="primary-action" type="button" onClick={onDone}>
          {completedToday && <Check size={18} aria-hidden="true" />}
          <span>{completedToday ? "Done for today" : "Done"}</span>
        </button>
      </section>

      <section className="checkin-card">
        <span className="panel-label">How&apos;s your {experiment.targetOutcome.toLowerCase()}?</span>
        <div className="energy-options">
          {["Rough", "Same", "Better", "Much better"].map((option) => (
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
      </section>

      <div className="why-card">
        <span className="panel-label">Why we&apos;re testing this</span>
        <p>{experiment.explanation}</p>
      </div>
    </motion.div>
  );
}

function JourneyScreen({
  analysis,
  decision,
  activeExperiment,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
}) {
  const { experiment, learnedSignals } = decision;

  return (
    <motion.div
      className="tab-panel"
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <span className="eyebrow">Your Journey</span>
      <h1>What Recharge is learning.</h1>

      <section className="soft-panel">
        <span className="panel-label">Testing now</span>
        <div className="learning-row">
          <strong>{experiment.title}</strong>
          <span>
            Day {activeExperiment.currentDay} of {experiment.durationDays}
          </span>
        </div>
        <ExperimentDots activeExperiment={activeExperiment} />
      </section>

      <section className="soft-panel">
        <span className="panel-label">What seems to help</span>
        {learnedSignals.map((signal) => (
          <article className="signal-row" key={signal.id}>
            <strong>{signal.label}</strong>
            <span>{signal.direction === "unclear" ? "Signal pending" : "Positive signal"}</span>
            <p>{signal.evidence}</p>
          </article>
        ))}
      </section>

      <section className="soft-panel">
        <span className="panel-label">What we&apos;ve learned</span>
        <div className="factor-list">
          {analysis.factors.map((factor) => (
            <article key={factor.id}>
              <strong>{factor.label}</strong>
              <p>{factor.description}</p>
            </article>
          ))}
        </div>
      </section>
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
      className="tab-panel"
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <span className="eyebrow">Something else going on?</span>
      <h1>Tell Recharge what changed.</h1>
      <p className="lead">
        This is not an open-ended chat. Recharge uses updates to adjust the next experiment.
      </p>
      <form className="intake-form compact" onSubmit={onSubmitUpdate}>
        <textarea
          value={updateText}
          onChange={(event) => onUpdateText(event.target.value)}
          placeholder="Our baby was awake all night."
          aria-label="Tell Recharge what changed"
        />
        <button className="primary-action" type="submit" disabled={!updateText.trim()}>
          <span>Re-evaluate today</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
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
