"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  analyzeProblem,
  buildPlan,
  buildProfile,
  type ProblemAnalysis,
  type RechargePlan,
  type RechargeProfile,
} from "../lib/recharge";

type FlowStep = "landing" | "intake" | "interpretation" | "followup" | "starting-point" | "plan" | "today";
type AppTab = "today" | "journey" | "coach";

const quickStarts = [
  "I can't fall asleep",
  "I'm always tired",
  "My shifts disrupt my sleep",
  "I wake up during the night",
];

const demoPrompts = [
  "I sleep around 7 hours but still wake up exhausted, and I drink coffee late in the day.",
  "My shifts disrupt my sleep and my schedule changes every few days.",
  "My young child wakes me up during the night and I feel depleted in the morning.",
];

const stepLabels: Record<FlowStep, string> = {
  landing: "Start",
  intake: "Intake",
  interpretation: "Read",
  followup: "Tune",
  "starting-point": "Focus",
  plan: "Plan",
  today: "Today",
};

export default function Home() {
  const [step, setStep] = useState<FlowStep>("landing");
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [problemText, setProblemText] = useState("");
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [energy, setEnergy] = useState("Steady");
  const [questAccepted, setQuestAccepted] = useState(false);

  const profile = useMemo<RechargeProfile | null>(() => {
    if (!analysis) return null;
    return buildProfile(analysis, answers);
  }, [analysis, answers]);

  const plan = useMemo<RechargePlan | null>(() => {
    if (!analysis || !profile) return null;
    return buildPlan(analysis, profile);
  }, [analysis, profile]);

  const currentStepIndex = Object.keys(stepLabels).indexOf(step);
  const progressPercent = step === "landing" ? 8 : Math.round(((currentStepIndex + 1) / Object.keys(stepLabels).length) * 100);
  const allFollowUpsAnswered = Boolean(
    analysis?.followUps.every((question) => answers[question.id]),
  );

  function begin() {
    setStep("intake");
  }

  function submitProblem(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const text = problemText.trim();
    if (!text) return;

    setAnalysis(analyzeProblem(text));
    setAnswers({});
    setQuestAccepted(false);
    setStep("interpretation");
  }

  function selectDemo(prompt: string) {
    setProblemText(prompt);
    setAnalysis(analyzeProblem(prompt));
    setAnswers({});
    setQuestAccepted(false);
    setStep("interpretation");
  }

  function answerQuestion(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function restart() {
    setProblemText("");
    setAnalysis(null);
    setAnswers({});
    setQuestAccepted(false);
    setActiveTab("today");
    setStep("landing");
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="phone-frame" aria-label="Recharge application preview">
        <header className="top-bar">
          <button className="brand-lockup" type="button" onClick={restart} aria-label="Restart Recharge">
            <span className="brand-mark" />
            <span>Recharge</span>
          </button>
          <span className="status-pill">Private beta</span>
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
        {step === "interpretation" && analysis && (
          <InterpretationScreen analysis={analysis} onContinue={() => setStep("followup")} />
        )}
        {step === "followup" && analysis && (
          <FollowUpScreen
            analysis={analysis}
            answers={answers}
            onAnswer={answerQuestion}
            onContinue={() => setStep("starting-point")}
            canContinue={allFollowUpsAnswered}
          />
        )}
        {step === "starting-point" && profile && (
          <StartingPointScreen profile={profile} onContinue={() => setStep("plan")} />
        )}
        {step === "plan" && plan && (
          <PlanScreen plan={plan} onContinue={() => setStep("today")} />
        )}
        {step === "today" && plan && profile && (
          <TodayShell
            activeTab={activeTab}
            onTabChange={setActiveTab}
            plan={plan}
            profile={profile}
            energy={energy}
            onEnergyChange={setEnergy}
            questAccepted={questAccepted}
            onAcceptQuest={() => setQuestAccepted(true)}
          />
        )}
      </section>

      <aside className="desktop-panel" aria-label="Recharge product notes">
        <span className="eyebrow">MVP journey</span>
        <h2>Conversation first, then one small action.</h2>
        <p>
          Recharge keeps the first experience focused: understand the person&apos;s context,
          ask only what matters, and translate that into a seven-day recovery experiment.
        </p>
        <div className="architecture-list">
          <span>Mock decision engine</span>
          <span>Approved interventions</span>
          <span>Safety categories ready</span>
        </div>
      </aside>
    </main>
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
        <h1>Start your Recharge</h1>
        <p>
          A calm two-minute check-in that turns what is getting in the way of rest
          into one personalized action for today.
        </p>
      </div>

      <div className="signal-card">
        <div>
          <span className="panel-label">Today&apos;s rhythm</span>
          <strong>Gentle reset available</strong>
        </div>
        <div className="orbital-chart" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <button className="primary-action" type="button" onClick={onBegin}>
        Start my Recharge
      </button>

      <div className="demo-strip" aria-label="Demo scenarios">
        {demoPrompts.map((prompt, index) => (
          <button key={prompt} type="button" onClick={() => onDemo(prompt)}>
            Demo {index + 1}
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
      <span className="eyebrow">Start with your words</span>
      <h1>What&apos;s been getting in the way of feeling rested?</h1>
      <form className="intake-form" onSubmit={onSubmit}>
        <textarea
          value={problemText}
          onChange={(event) => onChange(event.target.value)}
          placeholder="I sleep around 7 hours but still wake up exhausted..."
          aria-label="Describe what is getting in the way of feeling rested"
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
          Continue
        </button>
      </form>
    </section>
  );
}

function InterpretationScreen({
  analysis,
  onContinue,
}: {
  analysis: ProblemAnalysis;
  onContinue: () => void;
}) {
  return (
    <section className="screen">
      <span className="eyebrow">What I&apos;m hearing</span>
      <h1>{analysis.mainChallenge}</h1>
      <p className="lead">{analysis.interpretation}</p>

      <div className="panel-stack">
        <InfoPanel title="Main challenge" body={analysis.mainChallenge} />
        <div className="soft-panel">
          <span className="panel-label">Things worth exploring</span>
          <div className="factor-list">
            {analysis.factors.map((factor) => (
              <article key={factor.id}>
                <strong>{factor.label}</strong>
                <p>{factor.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <p className="microcopy">I just need a couple of details to personalize this.</p>
      <button className="primary-action" type="button" onClick={onContinue}>
        Answer 3 quick questions
      </button>
    </section>
  );
}

function FollowUpScreen({
  analysis,
  answers,
  onAnswer,
  onContinue,
  canContinue,
}: {
  analysis: ProblemAnalysis;
  answers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
  onContinue: () => void;
  canContinue: boolean;
}) {
  return (
    <section className="screen">
      <span className="eyebrow">Adaptive follow-up</span>
      <h1>Three details, then your starting point.</h1>
      <div className="question-list">
        {analysis.followUps.slice(0, 3).map((question, index) => (
          <article className="question-card" key={question.id}>
            <span className="panel-label">Question {index + 1}</span>
            <h2>{question.prompt}</h2>
            <div className="option-grid">
              {question.options.map((option) => (
                <button
                  className={answers[question.id] === option ? "selected option" : "option"}
                  key={option}
                  type="button"
                  onClick={() => onAnswer(question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <button className="primary-action" type="button" onClick={onContinue} disabled={!canContinue}>
        Show my starting point
      </button>
    </section>
  );
}

function StartingPointScreen({
  profile,
  onContinue,
}: {
  profile: RechargeProfile;
  onContinue: () => void;
}) {
  return (
    <section className="screen">
      <span className="eyebrow">Your Recharge starting point</span>
      <h1>{profile.goal}</h1>
      <InfoPanel title="Recommended first focus" body={profile.recommendedFocus} />

      <div className="soft-panel">
        <span className="panel-label">Likely modifiable contributors</span>
        <div className="factor-list">
          {profile.contributors.map((factor) => (
            <article key={factor.id}>
              <strong>{factor.label}</strong>
              <p>{factor.description}</p>
            </article>
          ))}
        </div>
      </div>

      <button className="primary-action" type="button" onClick={onContinue}>
        Build my 7-day plan
      </button>
    </section>
  );
}

function PlanScreen({
  plan,
  onContinue,
}: {
  plan: RechargePlan;
  onContinue: () => void;
}) {
  return (
    <section className="screen">
      <span className="eyebrow">Your first Recharge</span>
      <h1>{plan.goal}</h1>
      <p className="lead">
        This week is a set of small experiments. Recharge will surface one action at a time.
      </p>

      <div className="focus-row">
        {plan.focusAreas.map((focus) => (
          <span key={focus}>{focus}</span>
        ))}
      </div>

      <div className="plan-list">
        {plan.quests.slice(0, 7).map((quest) => (
          <article key={`${quest.day}-${quest.title}`}>
            <span>Day {quest.day}</span>
            <strong>{quest.title}</strong>
          </article>
        ))}
      </div>

      <button className="primary-action" type="button" onClick={onContinue}>
        Start Day 1
      </button>
    </section>
  );
}

function TodayShell({
  activeTab,
  onTabChange,
  plan,
  profile,
  energy,
  onEnergyChange,
  questAccepted,
  onAcceptQuest,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  plan: RechargePlan;
  profile: RechargeProfile;
  energy: string;
  onEnergyChange: (value: string) => void;
  questAccepted: boolean;
  onAcceptQuest: () => void;
}) {
  return (
    <section className="screen app-view">
      {activeTab === "today" && (
        <TodayScreen
          plan={plan}
          energy={energy}
          onEnergyChange={onEnergyChange}
          questAccepted={questAccepted}
          onAcceptQuest={onAcceptQuest}
        />
      )}
      {activeTab === "journey" && <JourneyScreen plan={plan} profile={profile} />}
      {activeTab === "coach" && <CoachScreen profile={profile} />}

      <nav className="bottom-nav" aria-label="Primary destinations">
        {(["today", "journey", "coach"] as AppTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => onTabChange(tab)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </section>
  );
}

function TodayScreen({
  plan,
  energy,
  onEnergyChange,
  questAccepted,
  onAcceptQuest,
}: {
  plan: RechargePlan;
  energy: string;
  onEnergyChange: (value: string) => void;
  questAccepted: boolean;
  onAcceptQuest: () => void;
}) {
  const quest = plan.quests[0];

  return (
    <>
      <span className="eyebrow">Today</span>
      <h1>Good morning</h1>
      <section className="checkin-card">
        <span className="panel-label">Energy check-in</span>
        <div className="energy-options">
          {["Low", "Steady", "Clear"].map((option) => (
            <button
              key={option}
              type="button"
              className={energy === option ? "selected option" : "option"}
              onClick={() => onEnergyChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="quest-card">
        <span className="panel-label">Today&apos;s quest</span>
        <h2>{quest.title}</h2>
        <p>{quest.explanation}</p>
        <button className="primary-action" type="button" onClick={onAcceptQuest}>
          {questAccepted ? "Added for today" : "I\u0027m in"}
        </button>
      </section>

      <div className="week-progress" aria-label="Seven day progress">
        {plan.quests.map((questItem) => (
          <span
            key={questItem.day}
            className={questItem.day === 1 && questAccepted ? "complete" : ""}
          >
            {questItem.day}
          </span>
        ))}
      </div>

      <div className="coach-entry">
        <span className="panel-label">Ask Recharge Coach</span>
        <button type="button">What should I do after a poor night?</button>
        <button type="button">How do I keep caffeine without hurting sleep?</button>
      </div>
    </>
  );
}

function JourneyScreen({
  plan,
  profile,
}: {
  plan: RechargePlan;
  profile: RechargeProfile;
}) {
  return (
    <>
      <span className="eyebrow">Journey</span>
      <h1>{profile.goal}</h1>
      <p className="lead">{profile.recommendedFocus}</p>
      <div className="plan-list expanded">
        {plan.quests.map((quest) => (
          <article key={`${quest.day}-${quest.title}`}>
            <span>Day {quest.day}</span>
            <strong>{quest.title}</strong>
            <p>{quest.action}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function CoachScreen({ profile }: { profile: RechargeProfile }) {
  return (
    <>
      <span className="eyebrow">Coach</span>
      <h1>A calm place to adjust the plan.</h1>
      <p className="lead">
        Future AI support will select from approved interventions and personalize them
        around your goal: {profile.goal.toLowerCase()}.
      </p>
      <div className="coach-entry full">
        <button type="button">I had a bad night. What should change today?</button>
        <button type="button">Can you make tomorrow easier?</button>
        <button type="button">What pattern should I watch this week?</button>
      </div>
    </>
  );
}

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <article className="info-panel">
      <span className="panel-label">{title}</span>
      <p>{body}</p>
    </article>
  );
}
