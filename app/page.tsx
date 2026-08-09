"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Coffee,
  Home,
  MessageCircle,
  Moon,
  Route,
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
  type ProblemAnalysis,
} from "../lib/recharge";

type FlowStep = "landing" | "intake" | "analyzing" | "result" | "missing-info" | "experiment" | "today";
type AppTab = "today" | "journey" | "update";

const quickStarts = ["Always tired", "Can't switch off", "Irregular schedule", "Broken nights"];

const demoPrompts = [
  "I sleep about seven hours but still wake up exhausted. By 3 PM I need coffee to keep going.",
  "My shifts disrupt my sleep and my schedule changes every few days.",
  "Our baby was awake all night and I feel depleted in the morning.",
  "I feel wired at night and can't switch off even when I go to bed on time.",
];

const demoLabels = ["Morning fatigue", "Shift worker", "Parent", "Switching off"];

const stepLabels: Record<FlowStep, string> = {
  landing: "Start",
  intake: "Input",
  analyzing: "Extract",
  result: "Pattern",
  "missing-info": "Decide",
  experiment: "Experiment",
  today: "Today",
};

const iconMap: Record<Experiment["icon"], React.ReactNode> = {
  sun: <SunMedium size={22} aria-hidden="true" />,
  coffee: <Coffee size={22} aria-hidden="true" />,
  clock: <TimerReset size={22} aria-hidden="true" />,
  moon: <Moon size={22} aria-hidden="true" />,
  spark: <Sparkles size={22} aria-hidden="true" />,
  heart: <Sparkles size={22} aria-hidden="true" />,
  steps: <Route size={22} aria-hidden="true" />,
};

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

  const progressPercent = useMemo(() => {
    const currentStepIndex = Object.keys(stepLabels).indexOf(step);
    return step === "landing" ? 8 : Math.round(((currentStepIndex + 1) / Object.keys(stepLabels).length) * 100);
  }, [step]);

  const missingInformation = analysis ? getMissingInformation(analysis) : null;

  function begin() {
    setStep("intake");
  }

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

  function selectDemo(prompt: string) {
    submitProblem(undefined, prompt);
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
    if (getMissingInformation(analysis)) {
      setStep("missing-info");
      return;
    }
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
          <span className="status-pill">
            <Sparkles size={13} aria-hidden="true" />
            Behaviour engine
          </span>
        </header>

        <div className="progress-track" aria-label="Onboarding progress">
          <span style={{ width: `${progressPercent}%` }} />
        </div>

        {step === "landing" && <LandingScreen onBegin={begin} onDemo={selectDemo} />}
        {step === "intake" && (
          <IntakeScreen
            problemText={problemText}
            onChange={setProblemText}
            onSubmit={submitProblem}
          />
        )}
        {step === "analyzing" && <AnalyzingScreen />}
        {step === "result" && analysis && (
          <ResultScreen
            analysis={analysis}
            needsInformation={Boolean(missingInformation)}
            onContinue={continueFromResult}
          />
        )}
        {step === "missing-info" && missingInformation && (
          <MissingInformationScreen
            prompt={missingInformation.prompt}
            reason={missingInformation.reason}
            options={missingInformation.options}
            onAnswer={answerMissingInformation}
          />
        )}
        {step === "experiment" && analysis && decision && activeExperiment && (
          <ExperimentScreen
            analysis={analysis}
            decision={decision}
            activeExperiment={activeExperiment}
            onStart={startExperiment}
          />
        )}
        {step === "today" && analysis && decision && activeExperiment && (
          <TodayShell
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
      </section>

      <StagePanel
        step={step}
        progressPercent={progressPercent}
        analysis={analysis}
        decision={decision}
      />
    </main>
  );
}

function StagePanel({
  step,
  progressPercent,
  analysis,
  decision,
}: {
  step: FlowStep;
  progressPercent: number;
  analysis: ProblemAnalysis | null;
  decision: ExperimentDecision | null;
}) {
  const headline = decision
    ? "One experiment, then Recharge learns from the signal."
    : "Turn a messy problem into the next useful action.";

  return (
    <aside className="desktop-panel" aria-label="Recharge product notes">
      <div className="desktop-kicker">
        <span className="eyebrow">Adaptive recovery engine</span>
        <span>{stepLabels[step]}</span>
      </div>
      <h2>{headline}</h2>
      <p>
        Recharge is not a chat thread. It extracts a pattern, selects one approved
        behavioural experiment, tracks what happens, and adapts the next step.
      </p>

      <div className="insight-grid">
        <article className="insight-card large">
          <span className="panel-label">Next best interaction</span>
          <strong>{decision?.nextBestInteraction.replaceAll("_", " ") ?? "Pattern extraction"}</strong>
          <div className="wave-chart" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </article>
        <article className="insight-card">
          <SunMedium size={18} aria-hidden="true" />
          <span>Primary focus</span>
          <strong>{analysis?.primaryFocus ?? "Recovery signal"}</strong>
        </article>
        <article className="insight-card warm">
          <Moon size={18} aria-hidden="true" />
          <span>Testing now</span>
          <strong>{decision?.experiment.title ?? "Waiting for context"}</strong>
        </article>
      </div>

      <div className="system-strip">
        <span>Progress</span>
        <div className="system-bar">
          <i style={{ width: `${progressPercent}%` }} />
        </div>
        <strong>{progressPercent}%</strong>
      </div>
    </aside>
  );
}

function LandingScreen({
  onBegin,
  onDemo,
}: {
  onBegin: () => void;
  onDemo: (prompt: string) => void;
}) {
  return (
    <section className="screen hero-screen">
      <div className="hero-copy">
        <span className="eyebrow">Sleep, recovery, energy</span>
        <h1>Start with what is actually happening.</h1>
        <p>
          Recharge turns your situation into one small recovery experiment, then
          learns from what you actually try.
        </p>
      </div>

      <div className="signal-card">
        <div>
          <span className="panel-label">Behaviour loop</span>
          <strong>Understand. Test. Adapt.</strong>
          <p>Structured experiments instead of generic sleep advice.</p>
        </div>
        <div className="orbital-chart" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <button className="primary-action" type="button" onClick={onBegin}>
        <span>Start my Recharge</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <div className="demo-strip" aria-label="Demo scenarios">
        {demoPrompts.map((prompt, index) => (
          <button key={prompt} type="button" onClick={() => onDemo(prompt)}>
            <span>Demo {index + 1}</span>
            <strong>{demoLabels[index]}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function IntakeScreen({
  problemText,
  onChange,
  onSubmit,
}: {
  problemText: string;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="screen">
      <span className="eyebrow">Free-text intake</span>
      <h1>How have you been feeling lately?</h1>
      <p className="lead">
        Tell Recharge what&apos;s been getting in the way of feeling rested or energized.
      </p>
      <form className="intake-form" onSubmit={onSubmit}>
        <textarea
          value={problemText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="I sleep about seven hours but still wake up exhausted and by 3 PM I need coffee to keep going."
          aria-label="Describe what is getting in the way of feeling rested or energized"
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
          <span>Find where to start</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

function AnalyzingScreen() {
  return (
    <section className="screen analysis-screen" aria-live="polite">
      <span className="eyebrow">Finding where to start...</span>
      <h1>Extracting the pattern.</h1>
      <div className="analysis-card">
        <span />
        <span />
        <span />
      </div>
      <p className="lead">
        Recharge is turning your words into factors, constraints and the next useful experiment.
      </p>
    </section>
  );
}

function ResultScreen({
  analysis,
  needsInformation,
  onContinue,
}: {
  analysis: ProblemAnalysis;
  needsInformation: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="screen">
      <span className="eyebrow">Your Recharge</span>
      <h1>{analysis.primaryFocus}</h1>
      <p className="lead">{analysis.summary}</p>

      {analysis.contextBadge && <div className="context-badge">{analysis.contextBadge}</div>}

      <div className="factor-grid">
        {analysis.factors.map((factor) => (
          <article className="factor-card" key={factor.id}>
            <span className={`confidence ${factor.confidence}`}>{factor.confidence}</span>
            <strong>{factor.label}</strong>
            <p>{factor.description}</p>
          </article>
        ))}
      </div>

      <button className="primary-action" type="button" onClick={onContinue}>
        <span>{needsInformation ? "Answer one useful question" : "Show first experiment"}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
  );
}

function MissingInformationScreen({
  prompt,
  reason,
  options,
  onAnswer,
}: {
  prompt: string;
  reason: string;
  options: string[];
  onAnswer: (answer: string) => void;
}) {
  return (
    <section className="screen">
      <span className="eyebrow">One thing before we start</span>
      <h1>{prompt}</h1>
      <p className="lead">{reason}</p>
      <div className="option-grid decision-grid">
        {options.map((option) => (
          <button className="option" key={option} type="button" onClick={() => onAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

function ExperimentScreen({
  analysis,
  decision,
  activeExperiment,
  onStart,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  onStart: () => void;
}) {
  const { experiment } = decision;

  return (
    <section className="screen">
      <span className="eyebrow">Let&apos;s start here</span>
      <div className="experiment-hero">
        <div className="experiment-icon">{iconMap[experiment.icon]}</div>
        <h1>{experiment.title}</h1>
        <p>{experiment.userAction}</p>
      </div>

      <div className="why-card">
        <span className="panel-label">Why this?</span>
        <p>{decision.rationale}</p>
      </div>

      <div className="experiment-meta">
        <article>
          <span>Duration</span>
          <strong>{experiment.durationDays}-day experiment</strong>
        </article>
        <article>
          <span>Track</span>
          <strong>{experiment.targetOutcome}</strong>
        </article>
      </div>

      <ExperimentDots activeExperiment={activeExperiment} />

      <p className="microcopy">
        Recharge is testing this one thing first because your main pattern is {analysis.primaryFocus.toLowerCase()}.
      </p>

      <button className="primary-action" type="button" onClick={onStart}>
        <span>Start experiment</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
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
    <section className="screen app-view">
      {activeTab === "today" && (
        <TodayScreen
          analysis={analysis}
          decision={decision}
          activeExperiment={activeExperiment}
          checkIn={checkIn}
          onCheckIn={onCheckIn}
          onDone={onDone}
        />
      )}
      {activeTab === "journey" && (
        <JourneyScreen analysis={analysis} decision={decision} activeExperiment={activeExperiment} />
      )}
      {activeTab === "update" && (
        <UpdateScreen
          updateText={updateText}
          onUpdateText={onUpdateText}
          onSubmitUpdate={onSubmitUpdate}
        />
      )}

      <nav className="bottom-nav" aria-label="Primary destinations">
        {(["today", "journey", "update"] as AppTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => onTabChange(tab)}
          >
            {tab === "today" && <Home size={17} aria-hidden="true" />}
            {tab === "journey" && <Route size={17} aria-hidden="true" />}
            {tab === "update" && <MessageCircle size={17} aria-hidden="true" />}
            <span>{tab === "update" ? "Update" : tab[0].toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </nav>
    </section>
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
    <>
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
    </>
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
    <>
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
    </>
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
    <>
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
    </>
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
