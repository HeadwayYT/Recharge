"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  ArrowRight,
  Baby,
  Briefcase,
  Check,
  Clock,
  Coffee,
  Footprints,
  Heart,
  House,
  Lightning,
  Moon,
  MoonStars,
  Path,
  Plus,
  Sparkle,
  Sun,
  SunHorizon,
  TrendUp,
} from "@phosphor-icons/react";
import {
  analyzeProblem,
  buildPersonalRecoveryModel,
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
  type PersonalRecoveryModel,
  type ProblemAnalysis,
} from "../lib/recharge";
import {
  createRecoveryContext,
  interpretContextUpdate,
  selectNextBestAction,
  type NextBestAction,
  type RecoveryContext,
} from "../lib/recovery-context";
import {
  composerVariants,
  experimentFormationVariants,
  extractedComposerVariants,
  extractedSignalVariants,
  focusFormationVariants,
  layoutTransition,
  moduleVariants,
  navVariants,
  spatialBehaviors,
  spatialScreenVariants,
  screenVariants,
  signalGroupVariants,
  signalVariants,
} from "./recharge-choreography";
import { RecoveryField, type RecoveryFieldState } from "../components/recharge/RecoveryField";

type FlowStep = "landing" | "recommendation" | "today";
type AppTab = "today" | "journey" | "update";
type TodayContextStatus = "none" | "adapting" | "adapted";

const quickStarts = ["For example: always tired", "For example: can't switch off", "For example: irregular schedule", "For example: broken nights"];

function getRecoveryFieldState(
  step: FlowStep,
  activeTab: AppTab,
  contextStatus: TodayContextStatus,
  nextBestAction: NextBestAction | null,
  personalRecoveryModel: PersonalRecoveryModel,
): RecoveryFieldState {
  if (step === "landing") return "unknown";
  if (step === "recommendation") return "focusing";
  if (activeTab === "journey") return "learning";
  if (nextBestAction?.mode === "nightShift" && contextStatus !== "none") return "anticipating";
  if (nextBestAction?.mode === "recoveryDay" && contextStatus === "adapting") return "disrupted";
  if (nextBestAction?.mode === "recoveryDay" && contextStatus === "adapted") return "recovering";
  if (nextBestAction?.mode === "decompression" && contextStatus !== "none") return "focusing";
  if (personalRecoveryModel.status === "pattern-emerging") return "learning";
  return "active";
}

const iconMap: Record<Experiment["icon"], React.ReactNode> = {
  sun: <Sun size={22} weight="duotone" aria-hidden="true" />,
  coffee: <Coffee size={22} aria-hidden="true" />,
  clock: <Clock size={22} weight="duotone" aria-hidden="true" />,
  moon: <Moon size={22} aria-hidden="true" />,
  spark: <Sparkle size={22} weight="duotone" aria-hidden="true" />,
  heart: <Heart size={22} weight="duotone" aria-hidden="true" />,
  steps: <Footprints size={22} weight="duotone" aria-hidden="true" />,
};

const signalIconMap: Record<Experiment["icon"], React.ReactNode> = {
  sun: <SunHorizon size={24} weight="duotone" aria-hidden="true" />,
  coffee: <Coffee size={24} weight="duotone" aria-hidden="true" />,
  clock: <Clock size={24} weight="duotone" aria-hidden="true" />,
  moon: <Moon size={24} weight="duotone" aria-hidden="true" />,
  spark: <Sparkle size={24} weight="duotone" aria-hidden="true" />,
  heart: <Heart size={24} weight="duotone" aria-hidden="true" />,
  steps: <Footprints size={24} weight="duotone" aria-hidden="true" />,
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
  const [recoveryContext, setRecoveryContext] = useState<RecoveryContext | null>(null);
  const [contextStatus, setContextStatus] = useState<TodayContextStatus>("none");

  const missingInformation = analysis ? getMissingInformation(analysis) : null;
  const pendingMissingInformation =
    missingInformation && answers[missingInformation.id] == null ? missingInformation : null;
  const previewDecision = analysis ? chooseExperiment(analysis, answers) : null;
  const personalRecoveryModel = buildPersonalRecoveryModel(
    activeExperiment,
    decision?.experiment ?? null,
    decision?.learnedSignals ?? previewDecision?.learnedSignals ?? [],
  );
  const adherenceKey = activeExperiment?.adherence.map((done) => (done ? "1" : "0")).join("") ?? "";
  const answerKey = Object.values(answers).join("|");
  const nextBestAction = decision && recoveryContext ? selectNextBestAction(recoveryContext, decision.experiment) : null;
  const recoveryFieldState = getRecoveryFieldState(
    step,
    activeTab,
    contextStatus,
    nextBestAction,
    personalRecoveryModel,
  );

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0 });
      document.querySelectorAll(".app-shell, .screen").forEach((element) => {
        element.scrollTo({ top: 0, left: 0 });
      });
    };

    resetScroll();
    window.setTimeout(resetScroll, 0);
  }, [step, activeTab, answerKey, adherenceKey, contextStatus]);

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
    setRecoveryContext(createRecoveryContext(nextAnalysis));
    setContextStatus("none");
    setActiveTab("today");
    setStep("recommendation");
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
    if (!activeExperiment) return;
    setCheckIn(value);
    setActiveExperiment(recordCheckIn(activeExperiment, "Daily energy", value));
  }

  function restart() {
    setProblemText("");
    setAnalysis(null);
    setAnswers({});
    setDecision(null);
    setActiveExperiment(null);
    setCheckIn("");
    setUpdateText("");
    setRecoveryContext(null);
    setContextStatus("none");
    setActiveTab("today");
    setStep("landing");
  }

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = updateText.trim();
    if (!text) return;

    if (!analysis || !decision) return;
    const nextContext = interpretContextUpdate(recoveryContext ?? createRecoveryContext(analysis), text);
    setRecoveryContext(nextContext);
    setContextStatus("adapting");
    setUpdateText("");
    setActiveTab("today");
    window.setTimeout(() => {
      setContextStatus("adapted");
    }, 980);
  }

  return (
    <main className="app-shell" data-recovery-state={recoveryFieldState}>
      <LayoutGroup id="recharge-flow">
        <section className="phone-frame adaptive-canvas-frame" aria-label="Recharge adaptive recovery canvas">
          <RecoveryField state={recoveryFieldState} />
          <header className="top-bar">
            <button className="brand-lockup" type="button" onClick={restart} aria-label="Restart Recharge">
              <span className="brand-mark" />
              <span>Recharge</span>
            </button>
          </header>

          <div className="flow-stage">
            <AnimatePresence initial={false} mode="sync">
              {step === "landing" && (
                <LandingScreen
                  key="landing"
                  problemText={problemText}
                  onChange={setProblemText}
                  onSubmit={submitProblem}
                />
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
                  personalRecoveryModel={personalRecoveryModel}
                  checkIn={checkIn}
                  recoveryContext={recoveryContext}
                  contextStatus={contextStatus}
                  nextBestAction={nextBestAction}
                  onCheckIn={recordMorningCheckIn}
                  onDone={markDone}
                  updateText={updateText}
                  onUpdateText={setUpdateText}
                  onSubmitUpdate={submitUpdate}
                />
              )}
            </AnimatePresence>
          </div>
        </section>
      </LayoutGroup>
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
        <p>Add whatever feels relevant. Recharge will narrow it to one place to start.</p>
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
          <span>Find my focus</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </motion.form>
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
      transition={spatialBehaviors.reposition}
      variants={spatialScreenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="compressed-composer canvas-composer sentence-fragment"
        layout
        layoutId="recharge-composer"
        transition={spatialBehaviors.collapse}
        variants={extractedComposerVariants}
      >
        <p>{problemText}</p>
      </motion.div>

      <motion.div className="focus-statement assembly-module" layout variants={focusFormationVariants}>
        <h1>Let&apos;s start with your {analysis.primaryFocus.toLowerCase()}.</h1>
        <p>{analysis.summary}</p>
      </motion.div>

      <motion.div
        className="supporting-signals satellite-signals"
        aria-label="Secondary signals"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {signals.slice(0, 3).map((signal, index) => (
          <motion.span
            className="assembly-module"
            key={signal}
            layout
            variants={extractedSignalVariants}
            custom={0.26 + index * 0.08}
          >
            {signal}
          </motion.span>
        ))}
      </motion.div>

      <ExperimentModule
        mode="recommended"
        experiment={experiment}
        activeExperiment={null}
        primaryFocus={analysis.primaryFocus}
        actionCopy="Start this focus"
        formation="seed"
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
  formation = "steady",
  onPrimaryAction,
}: {
  mode: "recommended" | "active" | "completedToday" | "secondary";
  experiment: Experiment;
  activeExperiment: ActiveExperiment | null;
  primaryFocus: string;
  actionCopy?: string;
  formation?: "seed" | "steady";
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
          ? activeExperiment?.status === "completed"
            ? "Completed. Now informing your recovery rhythm."
            : "Still running, just lighter today."
          : experiment.userAction;

  return (
    <motion.article
      className={`experiment-living-module ${mode}`}
      layout
      layoutId={`experiment:${experiment.id}`}
      transition={
        mode === "secondary"
          ? spatialBehaviors.demote
          : formation === "seed"
            ? { ...spatialBehaviors.promote, delay: 0.18 }
            : spatialBehaviors.promote
      }
      variants={formation === "seed" ? experimentFormationVariants : moduleVariants}
      custom={0.28}
      initial="initial"
      animate={{
        opacity: mode === "secondary" ? 0.42 : 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        borderRadius: 0,
      }}
      exit="exit"
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
  personalRecoveryModel,
  checkIn,
  recoveryContext,
  contextStatus,
  nextBestAction,
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
  personalRecoveryModel: PersonalRecoveryModel;
  checkIn: string;
  recoveryContext: RecoveryContext | null;
  contextStatus: TodayContextStatus;
  nextBestAction: NextBestAction | null;
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
      transition={spatialBehaviors.reposition}
      variants={spatialScreenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="tab-stage">
        <AnimatePresence initial={false} mode="sync">
          {activeTab === "today" && (
            <TodayScreen
              key="today-panel"
              analysis={analysis}
              decision={decision}
              activeExperiment={activeExperiment}
              personalRecoveryModel={personalRecoveryModel}
              checkIn={checkIn}
              recoveryContext={recoveryContext}
              contextStatus={contextStatus}
              nextBestAction={nextBestAction}
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
              personalRecoveryModel={personalRecoveryModel}
              checkIn={checkIn}
              nextBestAction={nextBestAction}
            />
          )}
          {activeTab === "update" && (
            <UpdateScreen
              key="update-panel"
              analysis={analysis}
              decision={decision}
              activeExperiment={activeExperiment}
              updateText={updateText}
              onUpdateText={onUpdateText}
              onSubmitUpdate={onSubmitUpdate}
            />
          )}
        </AnimatePresence>
      </div>

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
            {tab === "today" && <House size={17} weight="duotone" aria-hidden="true" />}
            {tab === "journey" && <Path size={17} weight="duotone" aria-hidden="true" />}
            {tab === "update" && <Plus size={17} weight="bold" aria-hidden="true" />}
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
  personalRecoveryModel,
  checkIn,
  recoveryContext,
  contextStatus,
  nextBestAction,
  onCheckIn,
  onDone,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  personalRecoveryModel: PersonalRecoveryModel;
  checkIn: string;
  recoveryContext: RecoveryContext | null;
  contextStatus: TodayContextStatus;
  nextBestAction: NextBestAction | null;
  onCheckIn: (value: string) => void;
  onDone: () => void;
}) {
  const { experiment } = decision;
  const completedToday = activeExperiment.adherence[activeExperiment.currentDay - 1];
  const [whyOpen, setWhyOpen] = useState(false);
  const contextText = recoveryContext?.activeSignal?.sourceText ?? "";
  const hasAdaptedContext = contextStatus !== "none" && nextBestAction?.source !== "experiment";
  const learningReady = !hasAdaptedContext && personalRecoveryModel.status === "pattern-emerging";
  const canvasStateClass = hasAdaptedContext
    ? `context-${contextStatus} context-${nextBestAction?.mode ?? "context"}`
    : learningReady
      ? "learning-ready"
      : "";
  const greetingLabel = hasAdaptedContext ? nextBestAction?.label : learningReady ? "Learning" : "Today";
  const greetingTitle = learningReady ? "Your reset is becoming knowledge." : "Good morning.";

  return (
    <motion.div
      className={`tab-panel today-canvas ${canvasStateClass}`}
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div className="today-greeting" layout variants={moduleVariants} custom={0}>
        <span className="eyebrow">{greetingLabel}</span>
        <h1>{greetingTitle}</h1>
        {!hasAdaptedContext && !learningReady && activeExperiment.status === "active" && (
          <DailyCheckIn checkIn={checkIn} onCheckIn={onCheckIn} />
        )}
      </motion.div>

      <AnimatePresence>
        {hasAdaptedContext && nextBestAction?.mode !== "nightShift" && (
          <AdaptedActionModule
            key="adapted-action"
            action={nextBestAction}
            contextStatus={contextStatus}
            contextText={contextText}
          />
        )}
        {hasAdaptedContext && nextBestAction?.mode === "nightShift" && (
          <NightShiftModule
            key="night-shift"
            action={nextBestAction}
            contextStatus={contextStatus}
            contextText={contextText}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {learningReady && personalRecoveryModel.primaryInsight ? (
          <LearningMoment
            key="resolved-experiment"
            experiment={experiment}
            activeExperiment={activeExperiment}
            personalRecoveryModel={personalRecoveryModel}
          />
        ) : (
          <ExperimentModule
            key="living-experiment"
            mode={hasAdaptedContext ? "secondary" : completedToday ? "completedToday" : "active"}
            experiment={experiment}
            activeExperiment={activeExperiment}
            primaryFocus={analysis.primaryFocus}
            actionCopy="Done for today"
            onPrimaryAction={hasAdaptedContext || activeExperiment.status === "completed" ? undefined : onDone}
          />
        )}
      </AnimatePresence>

      {!learningReady && (
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
                {hasAdaptedContext ? nextBestAction?.message : experiment.explanation}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

function AdaptedActionModule({
  action,
  contextStatus,
  contextText,
}: {
  action: NextBestAction;
  contextStatus: TodayContextStatus;
  contextText: string;
}) {
  return (
    <motion.article
      className={`adapted-action-module ${contextStatus}`}
      layout
      layoutId="context-adaptation"
      variants={experimentFormationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <span>
        {action.mode === "recoveryDay" ? (
          <Baby size={18} weight="duotone" aria-hidden="true" />
        ) : action.mode === "decompression" ? (
          <Moon size={18} weight="duotone" aria-hidden="true" />
        ) : (
          <Lightning size={18} weight="duotone" aria-hidden="true" />
        )}
        {action.label}
      </span>
      <blockquote>{contextText}</blockquote>
      <h2>{action.title}</h2>
      <p>{action.action}</p>
    </motion.article>
  );
}

function LearningMoment({
  experiment,
  activeExperiment,
  personalRecoveryModel,
}: {
  experiment: Experiment;
  activeExperiment: ActiveExperiment;
  personalRecoveryModel: PersonalRecoveryModel;
}) {
  const insight = personalRecoveryModel.primaryInsight;
  if (!insight) return null;

  return (
    <motion.article
      className="learning-moment"
      layout
      layoutId={`experiment:${experiment.id}`}
      transition={spatialBehaviors.surfaceInsight}
      variants={experimentFormationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="resolved-experiment-origin">
        <div className="experiment-icon">{iconMap[experiment.icon]}</div>
        <div>
          <span>Morning Reset resolved</span>
          <strong>{experiment.title}</strong>
        </div>
        <ExperimentDots activeExperiment={activeExperiment} />
      </div>
      <motion.div className="knowledge-statement" layoutId="knowledge:morning-reset">
        <span>
          <TrendUp size={18} weight="duotone" aria-hidden="true" />
          {insight.title}
        </span>
        <h2>{insight.body}</h2>
        <p>{insight.qualifier}</p>
      </motion.div>
    </motion.article>
  );
}

function NightShiftModule({
  action,
  contextStatus,
  contextText,
}: {
  action: NextBestAction;
  contextStatus: TodayContextStatus;
  contextText: string;
}) {
  const timeline = action.timeline;
  if (!timeline) return null;

  return (
    <motion.article
      className={`night-shift-module ${contextStatus}`}
      layout
      layoutId="context-adaptation"
      variants={experimentFormationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="night-shift-copy">
        <span>
          <MoonStars size={18} weight="duotone" aria-hidden="true" />
          {action.title}
        </span>
        <blockquote>{contextText}</blockquote>
        <p>{action.message}</p>
      </div>
      <div className="shift-line" aria-label="Night shift recovery plan">
        <div className="shift-node now">
          <SunHorizon size={22} weight="duotone" aria-hidden="true" />
          <strong>{timeline.now}</strong>
          <span>{timeline.before}</span>
        </div>
        <div className="shift-node start">
          <Briefcase size={22} weight="duotone" aria-hidden="true" />
          <strong>{timeline.shiftStart}</strong>
          <span>{timeline.during}</span>
        </div>
        <div className="shift-node end">
          <MoonStars size={22} weight="duotone" aria-hidden="true" />
          <strong>{timeline.shiftEnd}</strong>
          <span>{timeline.after}</span>
        </div>
      </div>
    </motion.article>
  );
}

function DailyCheckIn({
  checkIn,
  onCheckIn,
}: {
  checkIn: string;
  onCheckIn: (value: string) => void;
}) {
  const options = ["Rough", "Okay", "Good", "Energized"];

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
      <h2>{checkIn ? `${checkIn} today.` : "How are you today?"}</h2>
      <AnimatePresence initial={false}>
        {!checkIn && (
          <motion.div
            className="energy-options"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {options.map((option) => (
              <button key={option} type="button" className="option" onClick={() => onCheckIn(option)}>
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function JourneyScreen({
  analysis,
  decision,
  activeExperiment,
  personalRecoveryModel,
  checkIn,
  nextBestAction,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  personalRecoveryModel: PersonalRecoveryModel;
  checkIn: string;
  nextBestAction: NextBestAction | null;
}) {
  const { experiment } = decision;
  const journeyTitle =
    personalRecoveryModel.status === "pattern-emerging"
      ? "You're starting to learn your rhythm."
      : "Recharge is learning what gives you energy.";

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
        <h1>{journeyTitle}</h1>
      </motion.div>

      <motion.article
        className={`journey-current ${activeExperiment.status === "completed" ? "quiet" : ""}`}
        layout
        layoutId={`experiment:${experiment.id}`}
        transition={spatialBehaviors.surfaceInsight}
        variants={moduleVariants}
        custom={0.08}
      >
        <div className="experiment-icon">{iconMap[experiment.icon]}</div>
        <div>
          <span>Right now</span>
          <h2>{experiment.title}</h2>
          <p>
            {activeExperiment.status === "completed"
              ? "Completed and informing your recovery map"
              : `Day ${activeExperiment.currentDay} of ${experiment.durationDays}`}
          </p>
        </div>
        <ExperimentDots activeExperiment={activeExperiment} />
      </motion.article>

      <PersonalRecoveryMap
        analysis={analysis}
        checkIn={checkIn}
        personalRecoveryModel={personalRecoveryModel}
        nextBestAction={nextBestAction}
      />
    </motion.div>
  );
}

function PersonalRecoveryMap({
  analysis,
  checkIn,
  personalRecoveryModel,
  nextBestAction,
}: {
  analysis: ProblemAnalysis;
  checkIn: string;
  personalRecoveryModel: PersonalRecoveryModel;
  nextBestAction: NextBestAction | null;
}) {
  const contextSignal =
    nextBestAction?.mode === "nightShift"
      ? {
          id: "night-shift-context",
          factor: "Night shift",
          label: "Changes tomorrow",
          direction: "unclear" as const,
          confidence: "early" as const,
          observations: 1,
          evidence: "Recharge is adapting before the shift starts.",
          icon: "clock" as const,
        }
      : nextBestAction?.mode === "recoveryDay"
        ? {
            id: "broken-night-context",
            factor: "Broken nights",
            label: "Big impact",
            direction: "unhelpful" as const,
            confidence: "early" as const,
            observations: 1,
            evidence: "The day changed after an uncontrollable night.",
            icon: "moon" as const,
          }
        : nextBestAction?.mode === "decompression"
          ? {
              id: "mental-load-context",
              factor: "Work mental load",
              label: "Needs a transition",
              direction: "unclear" as const,
              confidence: "early" as const,
              observations: 1,
              evidence: "A work-heavy evening temporarily changed today's priority.",
              icon: "moon" as const,
            }
          : null;
  const quietFactors = analysis.factors
    .filter((factor) => factor.label !== analysis.primaryFocus)
    .slice(0, 1)
    .map((factor) => ({
      id: factor.id,
      factor: factor.label,
      label: "Worth exploring",
      direction: "unclear" as const,
      confidence: "early" as const,
      observations: checkIn ? 1 : 0,
      evidence: factor.description,
      icon: factor.id.includes("caffeine") ? ("coffee" as const) : ("spark" as const),
    }));
  const signals = [
    ...personalRecoveryModel.learnedSignals,
    ...quietFactors,
    ...(contextSignal ? [contextSignal] : []),
  ].slice(0, 4);

  return (
    <motion.div
      className={`recovery-map ${personalRecoveryModel.status}`}
      layout
      layoutId="personal-recovery-map"
      variants={signalGroupVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {signals.map((signal, index) => (
        <motion.div
          className={`recovery-signal signal-${index} ${signal.direction}`}
          key={signal.id}
          layout
          variants={signalVariants}
        >
          <span>{signalIconMap[signal.icon]}</span>
          <strong>{signal.factor}</strong>
          <p>{signal.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function UpdateScreen({
  analysis,
  decision,
  activeExperiment,
  updateText,
  onUpdateText,
  onSubmitUpdate,
}: {
  analysis: ProblemAnalysis;
  decision: ExperimentDecision;
  activeExperiment: ActiveExperiment;
  updateText: string;
  onUpdateText: (value: string) => void;
  onSubmitUpdate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { experiment } = decision;

  return (
    <motion.div
      className="tab-panel update-canvas"
      layout
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.span
        className="eyebrow"
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18, transition: { duration: 0.1 } }}
      >
        Something changed?
      </motion.span>
      <motion.div
        className="update-copy"
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -22, transition: { duration: 0.12 } }}
      >
        <h1>What changed?</h1>
        <p className="lead">Add context once. Recharge will adjust today&apos;s one focus.</p>
      </motion.div>
      <motion.form className="update-composer" layout layoutId="context-adaptation" onSubmit={onSubmitUpdate}>
        <textarea
          value={updateText}
          onChange={(event) => onUpdateText(event.target.value)}
          placeholder="Our baby was awake all night."
          aria-label="Tell Recharge what changed"
        />
        <button className="primary-action" type="submit" disabled={!updateText.trim()}>
          <span>Add context</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </motion.form>

      <ExperimentModule
        mode="secondary"
        experiment={experiment}
        activeExperiment={activeExperiment}
        primaryFocus={analysis.primaryFocus}
      />
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
