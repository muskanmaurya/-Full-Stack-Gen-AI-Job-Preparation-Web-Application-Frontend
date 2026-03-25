import React, { useEffect, useMemo, useState } from "react";
import "../styles/interview.scss";
import { useInterview } from "../../interview/hooks/useInterview.js";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  // Navigation items for the interview report sections
  {
    id: "technical",
    label: "Technical Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "behavioral",
    label: "Behavioral Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    label: "Road Map",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
];

const toText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const cleanTaskList = (tasks) =>
  (Array.isArray(tasks) ? tasks : [tasks])
    .map((task) => toText(task))
    .filter(Boolean)
    .filter((task) => {
      const token = task.toLowerCase();
      if (["day", "focus", "tasks"].includes(token)) return false;
      return !/^\d+$/.test(task);
    });

const parseQuestionTokenArray = (tokens) => {
  if (!Array.isArray(tokens)) return [];

  const normalized = [];
  let current = { question: "", intention: "", answer: "" };

  for (let i = 0; i < tokens.length; i += 1) {
    const rawKey = toText(tokens[i]).toLowerCase();
    const value = toText(tokens[i + 1]);

    if (!["question", "intention", "answer"].includes(rawKey)) continue;
    if (!value) continue;

    if (
      rawKey === "question" &&
      (current.question || current.intention || current.answer)
    ) {
      normalized.push({ ...current });
      current = { question: "", intention: "", answer: "" };
    }

    current[rawKey] = value;
    i += 1;
  }

  if (current.question || current.intention || current.answer) {
    normalized.push(current);
  }

  return normalized.map((item) => ({
    question: item.question || "Question",
    intention: item.intention || "Assess technical skill",
    answer: item.answer || "Standard industry approach",
  }));
};

const parseSkillTokenArray = (tokens) => {
  if (!Array.isArray(tokens)) return [];

  const normalized = [];
  let current = { skill: "", severity: "medium" };

  for (let i = 0; i < tokens.length; i += 1) {
    const rawKey = toText(tokens[i]).toLowerCase();
    const value = toText(tokens[i + 1]);

    if (!["skill", "severity"].includes(rawKey)) continue;
    if (!value) continue;

    if (rawKey === "skill" && current.skill) {
      normalized.push({ ...current });
      current = { skill: "", severity: "medium" };
    }

    current[rawKey] = rawKey === "severity" ? value.toLowerCase() : value;
    i += 1;
  }

  if (current.skill) {
    normalized.push(current);
  }

  return normalized.map((item) => ({
    skill: item.skill,
    severity: ["low", "medium", "high"].includes(item.severity)
      ? item.severity
      : "medium",
  }));
};

const normalizeQuestions = (items) => {
  if (!Array.isArray(items)) return [];

  const fromObjects = items
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      question: toText(item.question),
      intention: toText(item.intention),
      answer: toText(item.answer),
    }))
    .filter((item) => item.question || item.intention || item.answer);

  if (fromObjects.length > 0) {
    const looksTokenized = fromObjects.some((item) =>
      ["question", "intention", "answer"].includes(
        toText(item.question).toLowerCase(),
      ),
    );

    if (looksTokenized) {
      const recovered = parseQuestionTokenArray(
        fromObjects.map((item) => toText(item.question)),
      );
      if (recovered.length > 0) return recovered;
    }

    return fromObjects.map((item) => ({
      question: item.question || "Question",
      intention: item.intention || "Assess technical skill",
      answer: item.answer || "Standard industry approach",
    }));
  }

  return parseQuestionTokenArray(items);
};

const normalizeSkillGaps = (items) => {
  if (!Array.isArray(items)) return [];

  const fromObjects = items
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      skill: toText(item.skill),
      severity: toText(item.severity).toLowerCase(),
    }))
    .filter((item) => item.skill);

  if (fromObjects.length > 0) {
    const looksTokenized = fromObjects.some((item) =>
      ["skill", "severity"].includes(toText(item.skill).toLowerCase()),
    );

    if (looksTokenized) {
      const recovered = parseSkillTokenArray(
        fromObjects.map((item) => toText(item.skill)),
      );
      if (recovered.length > 0) return recovered;
    }

    return fromObjects.map((item) => ({
      skill: item.skill,
      severity: ["low", "medium", "high"].includes(item.severity)
        ? item.severity
        : "medium",
    }));
  }

  return parseSkillTokenArray(items);
};

const parsePlansFromArray = (values) => {
  if (!Array.isArray(values)) return [];

  const plans = [];
  let current = { day: undefined, focus: "", tasks: [] };
  let currentKey = "";

  const pushCurrent = () => {
    if (!current.day && !current.focus && current.tasks.length === 0) {
      current = { day: undefined, focus: "", tasks: [] };
      currentKey = "";
      return;
    }

    plans.push({ ...current, tasks: [...current.tasks] });
    current = { day: undefined, focus: "", tasks: [] };
    currentKey = "";
  };

  for (let i = 0; i < values.length; i += 1) {
    const tokenText = toText(values[i]);
    const tokenKey = tokenText.toLowerCase();

    if (tokenKey === "day") {
      if (current.day || current.focus || current.tasks.length > 0) {
        pushCurrent();
      }
      currentKey = "day";
      continue;
    }

    if (tokenKey === "focus" || tokenKey === "tasks") {
      currentKey = tokenKey;
      continue;
    }

    if (currentKey === "day" && tokenText) {
      const parsedDay = Number(tokenText);
      if (!Number.isNaN(parsedDay)) {
        current.day = parsedDay;
      }
      continue;
    }

    if (currentKey === "focus" && tokenText) {
      current.focus = tokenText;
      continue;
    }

    if (currentKey === "tasks" && tokenText) {
      current.tasks.push(tokenText);
    }
  }

  pushCurrent();

  return plans
    .map((item, index) => {
      const cleanedTasks = cleanTaskList(item.tasks);
      return {
        day: Number(item.day) || index + 1,
        focus: item.focus || "Interview Prep",
        tasks:
          cleanedTasks.length > 0
            ? cleanedTasks
            : ["Complete preparation tasks for this day."],
      };
    })
    .filter((item) => item.day || item.focus || item.tasks.length > 0);
};

const inferFocusFromTasks = (tasks) => {
  const text = tasks.join(" ").toLowerCase();

  if (/react|frontend|component|ui|javascript|typescript/.test(text)) {
    return "Frontend Foundations";
  }

  if (/node|express|api|backend/.test(text)) {
    return "Backend Foundations";
  }

  if (/mongo|sql|database/.test(text)) {
    return "Database Skills";
  }

  if (/system design|architecture|microservice|scalab/.test(text)) {
    return "System Design & Architecture";
  }

  if (/security|jwt|oauth|auth/.test(text)) {
    return "Security & Authentication";
  }

  if (/docker|kafka|rabbitmq|devops|ci\/cd|pipeline/.test(text)) {
    return "DevOps & Distributed Systems";
  }

  if (/behavior|star|mock interview|communication/.test(text)) {
    return "Behavioral Interview Practice";
  }

  return "Interview Preparation";
};

const chunkLegacySingleDayPlan = (dayItem) => {
  const cleanedTasks = cleanTaskList(dayItem?.tasks || []);
  if (cleanedTasks.length < 5) {
    return [dayItem];
  }

  const chunkSize = 3;
  const chunks = [];

  for (let i = 0; i < cleanedTasks.length; i += chunkSize) {
    const taskChunk = cleanedTasks.slice(i, i + chunkSize);
    chunks.push({
      day: chunks.length + 1,
      focus: inferFocusFromTasks(taskChunk),
      tasks: taskChunk,
    });
  }

  return chunks;
};

const normalizePreparationPlan = (reportData) => {
  const collected = [];

  if (Array.isArray(reportData?.preparationPlan)) {
    const objectItems = reportData.preparationPlan.filter(
      (item) => item && typeof item === "object" && !Array.isArray(item),
    );

    if (objectItems.length > 0) {
      const tokenStream = objectItems
        .filter((item) => Array.isArray(item.tasks) && item.tasks.length > 0)
        .map((item) => toText(item.tasks[0]))
        .filter(Boolean);

      const looksTokenized = tokenStream.some((token) =>
        ["day", "focus", "tasks"].includes(token.toLowerCase()),
      );

      if (looksTokenized) {
        collected.push(...parsePlansFromArray(tokenStream));
      }

      objectItems.forEach((item, index) => {
        const safeTasks = Array.isArray(item.tasks)
          ? item.tasks.map((task) => toText(task)).filter(Boolean)
          : toText(item.tasks)
            ? [toText(item.tasks)]
            : [];

        const cleanedTasks = cleanTaskList(safeTasks);
        const rawTokens = safeTasks.map((task) => task.toLowerCase());

        const normalizedDay = {
          day: Number(item.day) || index + 1,
          focus: toText(item.focus) || "Interview Prep",
          tasks:
            cleanedTasks.length > 0
              ? cleanedTasks
              : ["Complete preparation tasks for this day."],
        };

        const isLikelyBrokenLegacyItem =
          normalizedDay.focus === "Interview Prep" &&
          (rawTokens.length === 0 ||
            rawTokens.every(
              (token) =>
                ["day", "focus", "tasks"].includes(token) ||
                /^\d+$/.test(token),
            ));

        if (!isLikelyBrokenLegacyItem) {
          collected.push(normalizedDay);
        }
      });
    } else {
      collected.push(...parsePlansFromArray(reportData.preparationPlan));
    }
  }

  if (reportData?.day || reportData?.focus || reportData?.tasks) {
    const cleanedTasks = cleanTaskList(reportData.tasks);

    collected.push({
      day: Number(reportData.day) || collected.length + 1,
      focus: toText(reportData.focus) || "Interview Prep",
      tasks:
        cleanedTasks.length > 0
          ? cleanedTasks
          : ["Complete preparation tasks for this day."],
    });
  }

  Object.values(reportData || {}).forEach((value) => {
    const parsedPlans = parsePlansFromArray(value);
    if (parsedPlans.length > 0) {
      collected.push(...parsedPlans);
    }
  });

  const byDay = new Map();
  collected.forEach((item) => {
    const existing = byDay.get(item.day);
    if (!existing) {
      byDay.set(item.day, item);
      return;
    }

    const mergedTasks = [...existing.tasks, ...item.tasks].filter(Boolean);
    byDay.set(item.day, {
      day: item.day,
      focus: existing.focus === "Interview Prep" ? item.focus : existing.focus,
      tasks: [...new Set(mergedTasks)],
    });
  });

  const sorted = [...byDay.values()].sort((a, b) => a.day - b.day);

  if (sorted.length === 1) {
    const expanded = chunkLegacySingleDayPlan(sorted[0]);
    return expanded.map((item, index) => ({
      ...item,
      day: index + 1,
    }));
  }

  return sorted.map((item, index) => ({
    ...item,
    day: index + 1,
  }));
};

const normalizeReport = (reportData) => ({
  ...reportData,
  technicalQuestions: normalizeQuestions(reportData?.technicalQuestions),
  behavioralQuestions: normalizeQuestions(reportData?.behavioralQuestions),
  skillGaps: normalizeSkillGaps(reportData?.skillGaps),
  preparationPlan: normalizePreparationPlan(reportData),
});

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
  // Component to display each question in the interview report
  const [open, setOpen] = useState(false);
  return (
    <div className="q-card">
      <div className="q-card__header" onClick={() => setOpen((o) => !o)}>
        <span className="q-card__index">Q{index + 1}</span>
        <p className="q-card__question">{item.question}</p>
        <span
          className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {open && (
        <div className="q-card__body">
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--intention">
              Intention
            </span>
            <p>{item.intention}</p>
          </div>
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--answer">
              Model Answer
            </span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const RoadMapDay = (
  { day }, // Component to display each day in the preparation roadmap
) => (
  <div className="roadmap-day">
    <div className="roadmap-day__header">
      <span className="roadmap-day__badge">Day {day.day}</span>
      <h3 className="roadmap-day__focus">{day.focus}</h3>
    </div>
    <ul className="roadmap-day__tasks">
      {day.tasks.map((task, i) => (
        <li key={`${day.day}-${i}`}>
          <span className="roadmap-day__bullet" />
          {task}
        </li>
      ))}
    </ul>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical"); // State to track active navigation tab
  const { report, loading, getReportById, getResumePdf } = useInterview(); // Destructure the report from the custom hook
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const normalizedReport = useMemo(() => normalizeReport(report), [report]);
  const showLogout = Boolean(user && !user.isGuest);

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
  }, [interviewId]);

  if (loading || !report) {
    return (
      <main className="loading-screen">
        <h1>Loading your interview plan...</h1>
      </main>
    );
  }

  const scoreState =
    normalizedReport.matchScore >= 80
      ? { ringClass: "score--high", messageClass: "score--high", message: "Strong match for this role" }
      : normalizedReport.matchScore >= 50
        ? { ringClass: "score--mid", messageClass: "score--mid", message: "Good match for this role" }
        : normalizedReport.matchScore >= 25
          ? { ringClass: "score--low", messageClass: "score--low", message: "Potential match for this role" }
          : { ringClass: "score--none", messageClass: "score--none", message: "Low match for this role" };

  

  return (
    <div className="interview-page">
      <div className="interview-layout">
        {/* ── Left Nav ── */}
        <nav className="interview-nav">
          <div className="nav-content">
            <p className="interview-nav__label">Sections</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="interview-nav__icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              getResumePdf(interviewId);
            }}
            className="button primary-button"
          >
            <svg
              height={"0.8rem"}
              style={{ marginRight: "0.8rem" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path>
            </svg>
            Download Resume
          </button>
        </nav>

        <div className="interview-divider" />

        {/* ── Center Content ── */}
        <main className="interview-content">
          {activeNav === "technical" && (
            <section>
              <div className="content-header">
                <h2>Technical Questions</h2>
                <span className="content-header__count">
                  {normalizedReport.technicalQuestions.length} questions
                </span>
              </div>
              <div className="q-list">
                {normalizedReport.technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "behavioral" && (
            <section>
              <div className="content-header">
                <h2>Behavioral Questions</h2>
                <span className="content-header__count">
                  {normalizedReport.behavioralQuestions.length} questions
                </span>
              </div>
              <div className="q-list">
                {normalizedReport.behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "roadmap" && (
            <section>
              <div className="content-header">
                <h2>Preparation Road Map</h2>
                <span className="content-header__count">
                  {normalizedReport.preparationPlan.length}-day plan
                </span>
              </div>
              <div className="roadmap-list">
                {normalizedReport.preparationPlan.map((day) => (
                  <RoadMapDay key={day.day} day={day} />
                ))}
              </div>
            </section>
          )}
        </main>

        <div className="interview-divider" />

        {/* ── Right Sidebar ── */}
        <aside className="interview-sidebar">
          {/* Match Score */}
          <div className="match-score">
            <p className="match-score__label">Match Score</p>
            <div className={`match-score__ring ${scoreState.ringClass}`}>
              <span className="match-score__value">{normalizedReport.matchScore}</span>
              <span className="match-score__pct">%</span>
            </div>
            <p className={`match-score__sub ${scoreState.messageClass}`}>{scoreState.message}</p>
          </div>

          <div className="sidebar-divider" />

          {/* Skill Gaps */}
          <div className="skill-gaps">
            <p className="skill-gaps__label">Skill Gaps</p>
            <div className="skill-gaps__table-wrap">
              <table className="skill-gaps__table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedReport.skillGaps.length > 0 ? (
                    normalizedReport.skillGaps.map((gap, i) => (
                      <tr key={`${gap.skill}-${i}`}>
                        <td>{gap.skill}</td>
                        <td>
                          <span
                            className={`severity-pill severity-pill--${gap.severity}`}
                          >
                            {gap.severity}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No major skill gaps identified.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {showLogout && (
              <div className="skill-gaps__actions">
                <button onClick={handleLogoutClick} className="button secondary-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;
