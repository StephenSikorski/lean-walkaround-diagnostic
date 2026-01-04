import React, { useEffect, useMemo, useState } from "react";

/**
 * Lean Walkaround Diagnostic — Mobile Fillable App
 * - Offline-friendly (localStorage)
 * - Full Diagnostic + Executive Debrief exports
 * - Email draft generator (no attachments; you attach exported files)
 */

const RESP = {
  YES: "yes",
  PARTIAL: "partial",
  NO: "no",
  NA: "na",
};

const respLabel = (v) =>
  v === RESP.YES
    ? "Yes"
    : v === RESP.PARTIAL
      ? "Somewhat"
      : v === RESP.NO
        ? "No"
        : v === RESP.NA
          ? "N/A"
          : "";

const scoreValue = (v) => {
  if (v === RESP.YES) return 1;
  if (v === RESP.PARTIAL) return 0.5;
  if (v === RESP.NO) return 0;
  if (v === RESP.NA) return null;
  return null;
};

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const nowISODate = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const DIAGNOSTIC = [
  {
    id: "s1",
    title: "SECTION 1 — CONTROL & STABILITY",
    subtitle:
      "Goal: Determine whether the operation is stable enough to be predictable, improvable, or automated.",
    groups: [
      {
        id: "s1a",
        title: "A. Cell Infrastructure & Flow",
        questions: [
          "Are products and tools grouped by family & flow?",
          "Can a part move from start to finish with minimal backtracking?",
          "Are there queues between processes, and are they visible and intentional?",
          "Are bottleneck processes clearly identified?",
          "One-piece flow or batch?",
          "Preventive maintenance?",
        ],
        toolsTitle: "Tools check (used):",
        tools: [
          "Output",
          "First Pass Yield",
          "Non-Value-Added (NVA) Analysis",
          "Yamazumi Chart",
          "SIPOC",
        ],
      },
      {
        id: "s1b",
        title: "B. Material Replenishment",
        questions: [
          "Is there a clear signal that tells material when to move?",
          "Do operators ever stop work due to missing material?",
          "Is inventory held “just in case” rather than by design?",
          "Are shortages detected early or only after downtime?",
          "Is stock held in multiple locations or at the point of use?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Alternates plan",
          "Control Plan – MRP or Kanban",
          "Hazard / Risk Matrix",
          "Visual Management on the stock",
          "Safety data sheets",
          "Non-Value-Added (NVA) Analysis",
        ],
      },
      {
        id: "s1c",
        title: "C. Heijunka / Level Loading",
        questions: [
          "Is production leveled, or does it spike by day/week/month?",
          "How often does the schedule change inside a shift?",
          "Is overtime used to compensate for planning instability?",
          "Are batches sized for flow or “efficiency”?",
          "Layout by product flow or by machine?",
          "Timed to bottleneck?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Heijunka Board",
          "Takt-based scheduling",
          "Failure Prevention Analysis",
          "Line leveling",
        ],
      },
      {
        id: "s1d",
        title: "D. Process Capability & Equipment Stability",
        questions: [
          "Is equipment performance measured consistently?",
          "Are process limits known—or guessed?",
          "Are failures predictable or surprising?",
        ],
        toolsTitle: "Tools check:",
        tools: ["OEE", "Cp / Cpk", "X-bar R", "Gauge R & R", "Preventive maintenance"],
      },
    ],
  },
  {
    id: "s2",
    title: "SECTION 2 — SETTING THE STANDARD",
    subtitle: "Goal: Determine whether the operation knows what “normal” looks like.",
    groups: [
      {
        id: "s2a",
        title: "A. 5S & Workplace Organization",
        questions: [
          "Can abnormalities be seen within 10 seconds?",
          "Are tools at point of use?",
          "Are standards obvious to a new employee?",
          "Shadow boards or equivalent?",
        ],
        toolsTitle: "Tools check:",
        tools: ["5S Scorecard", "Visual Standards"],
      },
      {
        id: "s2b",
        title: "B. Standardized Work",
        questions: [
          "Is there one best-known way to do the job?",
          "Do different operators do the same task differently?",
          "Is training formal or “watch someone”?",
          "SMED used to standardize changeovers?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Standard Work Worksheet",
          "Standards Posted",
          "Work Instructions",
          "SIPOC",
          "PERT Chart",
        ],
      },
      {
        id: "s2c",
        title: "C. Customer & Quality Definition",
        questions: [
          "Is “quality” clearly defined in measurable terms?",
          "Can operators explain CTQs in plain language?",
          "Are customer requirements translated into process terms?",
          "Are perceived requirements being met?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "CTQ Tree",
          "Inspection",
          "Golden Sample Available",
          "Measurements point of use (vs elsewhere)",
          "Gage R&R",
        ],
      },
    ],
  },
  {
    id: "s3",
    title: "SECTION 3 — SHOWING THE GAP TO THE STANDARD",
    subtitle: "Goal: Determine whether problems surface immediately or hide.",
    groups: [
      {
        id: "s3a",
        title: "A. Visual Management",
        questions: [
          "Can you tell in 30 seconds if the line is winning or losing?",
          "Are metrics updated in real time?",
          "Are problems visible before they become urgent?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Current-State Value Stream Map",
          "Hourly Prod Analysis – Time tracking Tools",
          "Material Review Board",
        ],
      },
      {
        id: "s3b",
        title: "B. Quality & Performance Signals",
        questions: [
          "Are defects tracked where they occur?",
          "Are trends reviewed—or just reported?",
          "Are recurring problems obvious?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Defect Tracking Matrix",
          "DPMO",
          "Cpk / Ppk",
          "Rolled Throughput Yield",
          "Cost of Poor Quality Matrix",
          "OEE",
          "X-bar R",
        ],
      },
      {
        id: "s3c",
        title: "C. Stop-and-Fix Culture",
        questions: [
          "Can operators stop the process without fear?",
          "Are defects passed forward?",
          "Is firefighting normal?",
        ],
        toolsTitle: "",
        tools: [],
      },
    ],
  },
  {
    id: "s4",
    title: "SECTION 4 — CLOSING THE GAP TO THE STANDARD",
    subtitle: "Goal: Determine whether the organization actually learns.",
    groups: [
      {
        id: "s4a",
        title: "A. Problem-Solving Discipline",
        questions: [
          "Are root causes identified—or assumed?",
          "Are countermeasures tested or just implemented?",
          "Do problems repeat? – or end in control?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Fishbone Diagram",
          "Control Processes",
          "Kaizen or Gemba Walk",
          "FMEA",
          "Regression",
          "Design Of Experiments",
        ],
      },
      {
        id: "s4b",
        title: "B. Improvement Execution",
        questions: [
          "Are actions owned, dated, and reviewed?",
          "Do improvements update standards?",
          "Does learning spread beyond one area?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Action Plan – one-page lesson or corrective action",
          "Affinity Diagram",
          "TRIZ",
          "8D",
          "A3",
          "Sample Size Calculator",
        ],
      },
      {
        id: "s4c",
        title: "C. Future-State Thinking",
        questions: [
          "Is there a clear future-state vision?",
          "Is improvement reactive or directional?",
        ],
        toolsTitle: "Tools check:",
        tools: ["Future-State Value Stream Map", "Descriptive Statistics"],
      },
    ],
  },
  {
    id: "s5",
    title: "SECTION 5 — QUALITY, METRICS & POLICY DEPLOYMENT",
    subtitle: "Goal: Ensure improvement aligns with strategy and customers.",
    groups: [
      {
        id: "s5a",
        title: "A. Metrics & Financial Visibility",
        questions: [
          "Do metrics drive behavior—or fear?",
          "Can leaders explain ROI from improvement?",
          "FMEA used on key processes?",
          "PPAP or other vendor measurement used where applicable?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Decision Matrix",
          "Cost of Quality Worksheet",
          "ROI Calculator",
          "Balanced Scorecard",
          "Blue Ocean Strategy (Example Packaging for Customers)",
        ],
      },
      {
        id: "s5b",
        title: "B. Policy Deployment (Hoshin)",
        questions: [
          "Can the floor explain top priorities?",
          "Are improvement projects aligned?",
          "Are tradeoffs explicit?",
        ],
        toolsTitle: "Tools check:",
        tools: [
          "Project Charter",
          "Gantt Chart",
          "Hoshin Planning Sheet",
          "Target and Means Matrix",
          "Transition & Communication Plan",
          "PERT Chart",
        ],
      },
      {
        id: "s5c",
        title: "C. Customer Alignment",
        questions: [],
        toolsTitle: "Tools check:",
        tools: [
          "QFD / House of Quality",
          "Stakeholder Analysis",
          "SWOT Analysis",
          "Force Field Analysis",
          "Project Management Formulas",
        ],
      },
    ],
  },
  {
    id: "s6",
    title: "SECTION 6 — THE 8 WASTES OBSERVATION",
    subtitle: "Mark where you physically see waste.",
    groups: [
      {
        id: "s6w",
        title: "8 Wastes",
        questions: [],
        toolsTitle: "Wastes observed (check all):",
        tools: [
          "Defects — lack of controls, incoming quality, training, work instructions",
          "Overproduction — producing more/sooner/faster than needed",
          "Waiting — unbalanced work, breakdowns, long setups, waiting for info",
          "Non-Utilized Talent — ideas ignored, low training investment",
          "Transportation — poor layout, big batches, storage areas",
          "Inventory — excess raw/WIP/FG, held ‘just in case’, unreliable suppliers",
          "Motion — searching, walking, poor 5S, poor workstation layout",
          "Extra Processing — redundant approvals/inspections/rework/reports",
        ],
      },
    ],
  },
];

// ---------- defaults ----------
function buildEmptyAssessment() {
  const id = uid();
  const a = {
    id,
    meta: {
      date: nowISODate(),
      assessmentName: `Walkaround ${nowISODate()}`,
      customer: "",
      site: "",
      contactName: "",
      contactEmail: "",
      assessor: "Stephen Sikorski",
      scope: "",
    },
    responses: {},
    qNotes: {},
    tools: {},
    groupNotes: {},
    generalNotes: "",
    evidenceNotes: "",
    debrief: {
      headline: "",
      topWins: ["", "", ""],
      topGaps: ["", "", "", "", ""],
      risks: ["", "", ""],
      recommendations: ["", "", "", ""],
      proposedNextStep: "",
    },
  };

  for (const sec of DIAGNOSTIC) {
    for (const g of sec.groups) {
      (g.questions || []).forEach((_, qi) => {
        a.responses[`${g.id}.q${qi}`] = "";
        a.qNotes[`${g.id}.q${qi}`] = "";
      });
      (g.tools || []).forEach((_, ti) => {
        a.tools[`${g.id}.t${ti}`] = false;
      });
      a.groupNotes[g.id] = "";
    }
  }
  return a;
}

function computeGroupScore(assessment, group) {
  const vals = [];
  (group.questions || []).forEach((_, qi) => {
    const v = assessment.responses[`${group.id}.q${qi}`];
    const sv = scoreValue(v);
    if (sv !== null) vals.push(sv);
  });
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100);
}

function scoreBadge(score) {
  if (score === null) return { label: "—", cls: "bg-slate-100 text-slate-700 border-slate-200" };
  if (score >= 80) return { label: `${score}%`, cls: "bg-green-50 text-green-900 border-green-200" };
  if (score >= 55) return { label: `${score}%`, cls: "bg-amber-50 text-amber-900 border-amber-200" };
  return { label: `${score}%`, cls: "bg-red-50 text-red-900 border-red-200" };
}

function downloadFile(filename, contents, mime = "text/html;charset=utf-8") {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildDiagnosticHTML(assessment) {
  const m = assessment.meta;
  const parts = [];

  parts.push(`
    <h1>Manufacturing Operations Walkaround Diagnostic</h1>
    <div style="font-size:12px;color:#334155;margin-bottom:12px">
      <div><b>Date:</b> ${esc(m.date)}</div>
      <div><b>Customer:</b> ${esc(m.customer)}</div>
      <div><b>Site:</b> ${esc(m.site)}</div>
      <div><b>Contact:</b> ${esc(m.contactName)} (${esc(m.contactEmail)})</div>
      <div><b>Assessor:</b> ${esc(m.assessor)}</div>
      <div><b>Scope:</b> ${esc(m.scope)}</div>
    </div>
  `);

  for (const sec of DIAGNOSTIC) {
    parts.push(`<h2 style="margin-top:18px">${esc(sec.title)}</h2>`);
    if (sec.subtitle) parts.push(`<div style="color:#334155;font-size:12px">${esc(sec.subtitle)}</div>`);

    for (const g of sec.groups) {
      parts.push(`<h3 style="margin-top:14px">${esc(g.title)}</h3>`);

      const gs = computeGroupScore(assessment, g);
      if ((g.questions || []).length) {
        parts.push(`<div style="font-size:11px;color:#334155;margin-bottom:6px"><b>Group Score:</b> ${gs === null ? "—" : gs + "%"}</div>`);
        parts.push(`<table style="width:100%;border-collapse:collapse;font-size:11px">
          <thead>
            <tr>
              <th style="border:1px solid #e2e8f0;background:#f8fafc;padding:6px;text-align:left">Question</th>
              <th style="border:1px solid #e2e8f0;background:#f8fafc;padding:6px;text-align:left;width:120px">Response</th>
              <th style="border:1px solid #e2e8f0;background:#f8fafc;padding:6px;text-align:left">Notes</th>
            </tr>
          </thead><tbody>`);
        (g.questions || []).forEach((q, qi) => {
          const key = `${g.id}.q${qi}`;
          parts.push(`<tr>
            <td style="border:1px solid #e2e8f0;padding:6px;vertical-align:top">${esc(q)}</td>
            <td style="border:1px solid #e2e8f0;padding:6px;vertical-align:top">${esc(respLabel(assessment.responses[key]))}</td>
            <td style="border:1px solid #e2e8f0;padding:6px;vertical-align:top">${esc(assessment.qNotes[key] || "")}</td>
          </tr>`);
        });
        parts.push(`</tbody></table>`);
      }

      if ((g.tools || []).length) {
        parts.push(`<div style="margin-top:8px;font-size:11px"><b>${esc(g.toolsTitle || "Tools")}</b><ul>`);
        (g.tools || []).forEach((t, ti) => {
          const key = `${g.id}.t${ti}`;
          parts.push(`<li>${assessment.tools[key] ? "☑" : "☐"} ${esc(t)}</li>`);
        });
        parts.push(`</ul></div>`);
      }

      parts.push(`<div style="margin-top:8px"><b style="font-size:11px">${esc("Notes")}</b><div style="border:1px solid #cbd5e1;border-radius:10px;min-height:48px;padding:8px">${esc(assessment.groupNotes[g.id] || "")}</div></div>`);
    }
  }

  parts.push(`<h2>General Notes</h2><div style="border:1px solid #cbd5e1;border-radius:10px;min-height:90px;padding:10px">${esc(assessment.generalNotes || "")}</div>`);
  parts.push(`<h2>Evidence / Photos / References</h2><div style="border:1px solid #cbd5e1;border-radius:10px;min-height:90px;padding:10px">${esc(assessment.evidenceNotes || "")}</div>`);

  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Walkaround Diagnostic</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:24px;color:#0f172a">
${parts.join("\n")}
</body></html>`;
}

function autoDebriefFromData(assessment) {
  // Lowest scoring groups + most common NO responses
  const groupScores = [];
  const noItems = [];

  for (const sec of DIAGNOSTIC) {
    for (const g of sec.groups) {
      const gs = computeGroupScore(assessment, g);
      if (gs !== null) groupScores.push({ section: sec.title, title: g.title, score: gs });

      (g.questions || []).forEach((q, qi) => {
        const key = `${g.id}.q${qi}`;
        if (assessment.responses[key] === RESP.NO) {
          noItems.push({ where: g.title, q });
        }
      });
    }
  }

  groupScores.sort((a, b) => a.score - b.score);

  const topGaps = [
    ...groupScores.slice(0, 4).map((g) => `${g.section} — ${g.title} (${g.score}%)`),
    ...noItems.slice(0, 2).map((x) => `${x.where}: ${x.q}`),
  ].slice(0, 5);

  const headline =
    assessment.debrief.headline?.trim() ||
    (groupScores.length
      ? `Primary constraint appears to be: ${groupScores[0].title.replace(/^.*?\\.\\s*/, "")}.`
      : "");

  // Pull wastes checked
  const wasteGroup = DIAGNOSTIC.find((s) => s.id === "s6")?.groups?.[0];
  const wastesChecked = [];
  if (wasteGroup) {
    (wasteGroup.tools || []).forEach((t, ti) => {
      const key = `${wasteGroup.id}.t${ti}`;
      if (assessment.tools[key]) wastesChecked.push(t.split(" — ")[0]);
    });
  }

  return {
    headline,
    topWins: assessment.debrief.topWins,
    topGaps,
    risks: wastesChecked.length ? [`Observed wastes: ${wastesChecked.join(", ")}`, "", ""] : assessment.debrief.risks,
    recommendations: assessment.debrief.recommendations.some((x) => x.trim())
      ? assessment.debrief.recommendations
      : [
          "Stabilize flow and material signals (reduce surprises).",
          "Define/refresh standards (5S + standardized work).",
          "Make gaps visible daily (visual management + stop-and-fix).",
          "Close gaps with disciplined problem solving (A3/8D) and update standards.",
        ],
    proposedNextStep:
      assessment.debrief.proposedNextStep?.trim() ||
      "Recommended next step: 2–4 week Stabilize + Visualize sprint with measurable targets (lead time, OTD, FPY, WIP).",
  };
}

function buildDebriefHTML(assessment) {
  const m = assessment.meta;
  const d = autoDebriefFromData(assessment);

  // Section averages
  const sectionScores = DIAGNOSTIC.map((sec) => {
    const vals = [];
    for (const g of sec.groups) {
      const gs = computeGroupScore(assessment, g);
      if (gs !== null) vals.push(gs);
    }
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    return { title: sec.title, avg };
  });

  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Executive Debrief Summary</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:24px;color:#0f172a">
<h1>Executive Debrief Summary</h1>
<div style="font-size:12px;color:#334155;margin-bottom:12px">
  <div><b>Date:</b> ${esc(m.date)}</div>
  <div><b>Customer:</b> ${esc(m.customer)}</div>
  <div><b>Site:</b> ${esc(m.site)}</div>
  <div><b>Contact:</b> ${esc(m.contactName)} (${esc(m.contactEmail)})</div>
  <div><b>Assessor:</b> ${esc(m.assessor)}</div>
  <div><b>Scope:</b> ${esc(m.scope)}</div>
</div>

<h2>Headline</h2>
<div style="border:1px solid #cbd5e1;border-radius:10px;min-height:70px;padding:10px">${esc(d.headline)}</div>

<h2 style="margin-top:16px">System Health (Section Averages)</h2>
<table style="width:100%;border-collapse:collapse;font-size:11px">
<thead><tr>
<th style="border:1px solid #e2e8f0;background:#f8fafc;padding:6px;text-align:left">Section</th>
<th style="border:1px solid #e2e8f0;background:#f8fafc;padding:6px;text-align:left;width:120px">Avg Score</th>
</tr></thead>
<tbody>
${sectionScores
  .map(
    (s) => `<tr>
<td style="border:1px solid #e2e8f0;padding:6px">${esc(s.title)}</td>
<td style="border:1px solid #e2e8f0;padding:6px">${s.avg === null ? "—" : s.avg + "%"}</td>
</tr>`
  )
  .join("\n")}
</tbody></table>

<h2 style="margin-top:16px">Top Wins</h2>
<ul>${d.topWins.map((x) => `<li>${esc(x)}</li>`).join("\n")}</ul>

<h2>Top Gaps</h2>
<ul>${d.topGaps.map((x) => `<li>${esc(x)}</li>`).join("\n")}</ul>

<h2>Risks / Constraints</h2>
<ul>${d.risks.map((x) => `<li>${esc(x)}</li>`).join("\n")}</ul>

<h2>Recommended Path</h2>
<ul>${d.recommendations.map((x) => `<li>${esc(x)}</li>`).join("\n")}</ul>

<h2>Proposed Next Step</h2>
<div style="border:1px solid #cbd5e1;border-radius:10px;min-height:70px;padding:10px">${esc(d.proposedNextStep)}</div>

<p style="margin-top:14px;font-size:11px;color:#334155">
Note: This summary is based on a live walkaround observation and should be validated with targeted data collection.
</p>
</body></html>`;
}

function buildEmailDraft(assessment) {
  const m = assessment.meta;
  const d = autoDebriefFromData(assessment);

  const subject = `Executive Debrief — Walkaround Diagnostic (${m.site || m.customer || "Site"}) — ${m.date}`;
  const body = [
    `Hi ${m.contactName || ""},`.trim(),
    "",
    "Thanks again for the time today. Here’s the executive debrief from the walkaround:",
    "",
    `Headline: ${d.headline}`,
    "",
    "Top gaps:",
    ...d.topGaps.filter(Boolean).map((x) => `- ${x}`),
    "",
    "Recommended path:",
    ...d.recommendations.filter(Boolean).map((x) => `- ${x}`),
    "",
    `Proposed next step: ${d.proposedNextStep}`,
    "",
    "Attached:",
    "1) Full diagnostic (walkaround notes)",
    "2) Executive debrief summary",
    "",
    "Best,",
    m.assessor || "",
  ].join("\n");

  return { subject, body };
}

// ---------- UI ----------
function Pill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid " + (active ? "#0f172a" : "#e2e8f0"),
        background: active ? "#0f172a" : "#ffffff",
        color: active ? "#ffffff" : "#0f172a",
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );
}

function Btn({ label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: primary ? "1px solid #0f172a" : "1px solid #e2e8f0",
        background: primary ? "#0f172a" : "#ffffff",
        color: primary ? "#ffffff" : "#0f172a",
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        minHeight: 80,
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        padding: 10,
        fontSize: 14,
      }}
    />
  );
}

function ResponseRow({ value, onChange }) {
  const opts = [
    { v: RESP.YES, l: "Yes" },
    { v: RESP.PARTIAL, l: "Somewhat" },
    { v: RESP.NO, l: "No" },
    { v: RESP.NA, l: "N/A" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {opts.map((o) => (
        <Pill key={o.v} active={value === o.v} label={o.l} onClick={() => onChange(o.v)} />
      ))}
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const STORAGE_KEY = "srs_walkaround_assessment_full_v1";

  const [assessment, setAssessment] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return buildEmptyAssessment();
  });

  const [tab, setTab] = useState("diagnostic"); // diagnostic | debrief | export

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
    } catch {}
  }, [assessment]);

  const sectionAverages = useMemo(() => {
    return DIAGNOSTIC.map((sec) => {
      const vals = [];
      for (const g of sec.groups) {
        const gs = computeGroupScore(assessment, g);
        if (gs !== null) vals.push(gs);
      }
      const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
      return { id: sec.id, title: sec.title, avg };
    });
  }, [assessment]);

  const updateMeta = (k, v) => {
    setAssessment((p) => ({ ...p, meta: { ...p.meta, [k]: v } }));
  };

  const setResp = (key, v) => {
    setAssessment((p) => ({ ...p, responses: { ...p.responses, [key]: v } }));
  };

  const setQNote = (key, v) => {
    setAssessment((p) => ({ ...p, qNotes: { ...p.qNotes, [key]: v } }));
  };

  const toggleTool = (key) => {
    setAssessment((p) => ({ ...p, tools: { ...p.tools, [key]: !p.tools[key] } }));
  };

  const setGroupNote = (gid, v) => {
    setAssessment((p) => ({ ...p, groupNotes: { ...p.groupNotes, [gid]: v } }));
  };

  const reset = () => setAssessment(buildEmptyAssessment());

  const exportDiagnostic = () => {
    const html = buildDiagnosticHTML(assessment);
    const name = (assessment.meta.customer || assessment.meta.site || "Customer")
      .replaceAll(/[^a-z0-9\-_ ]/gi, "")
      .trim() || "Customer";
    downloadFile(`Walkaround_Diagnostic_${name}_${assessment.meta.date}.html`, html, "text/html;charset=utf-8");
  };

  const exportDebrief = () => {
    const html = buildDebriefHTML(assessment);
    const name = (assessment.meta.customer || assessment.meta.site || "Customer")
      .replaceAll(/[^a-z0-9\-_ ]/gi, "")
      .trim() || "Customer";
    downloadFile(`Executive_Debrief_${name}_${assessment.meta.date}.html`, html, "text/html;charset=utf-8");
  };

  const openEmailDraft = () => {
    const { subject, body } = buildEmailDraft(assessment);
    const to = assessment.meta.contactEmail || "";
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const autoFillDebrief = () => {
    const auto = autoDebriefFromData(assessment);
    setAssessment((p) => ({ ...p, debrief: { ...p.debrief, ...auto } }));
    alert("Auto-filled debrief suggestions. Edit as needed.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>Lean Walkaround Diagnostic</div>
            <div style={{ fontSize: 12, color: "#475569" }}>Mobile • Auto-saves • Exports + Debrief</div>
          </div>
          <Btn label="New" onClick={reset} />
        </div>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 12px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill active={tab === "diagnostic"} label="Diagnostic" onClick={() => setTab("diagnostic")} />
          <Pill active={tab === "debrief"} label="Debrief" onClick={() => setTab("debrief")} />
          <Pill active={tab === "export"} label="Export / Email" onClick={() => setTab("export")} />
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Meta */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Assessment Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ fontSize: 13 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Date</div>
              <input
                type="date"
                value={assessment.meta.date}
                onChange={(e) => updateMeta("date", e.target.value)}
                style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Assessment Name</div>
              <input
                value={assessment.meta.assessmentName}
                onChange={(e) => updateMeta("assessmentName", e.target.value)}
                style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Customer</div>
              <input
                value={assessment.meta.customer}
                onChange={(e) => updateMeta("customer", e.target.value)}
                style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Site / Plant</div>
              <input
                value={assessment.meta.site}
                onChange={(e) => updateMeta("site", e.target.value)}
                style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Contact Name</div>
              <input
                value={assessment.meta.contactName}
                onChange={(e) => updateMeta("contactName", e.target.value)}
                style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
              />
            </label>
            <label style={{ fontSize: 13 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Contact Email</div>
              <input
                value={assessment.meta.contactEmail}
                onChange={(e) => updateMeta("contactEmail", e.target.value)}
                style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
              />
            </label>
            <label style={{ fontSize: 13, gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Scope / Areas Walked</div>
              <input
                value={assessment.meta.scope}
                onChange={(e) => updateMeta("scope", e.target.value)}
                style={{ width: "100%", borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
              />
            </label>
          </div>
        </div>

        {tab === "diagnostic" && (
          <>
            {/* Snapshot */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>System Health Snapshot</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sectionAverages.map((s) => {
                  const b = scoreBadge(s.avg);
                  return (
                    <span
                      key={s.id}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid #e2e8f0",
                        background:
                          b.cls.includes("green") ? "#ecfdf5" : b.cls.includes("amber") ? "#fffbeb" : b.cls.includes("red") ? "#fef2f2" : "#f1f5f9",
                        color:
                          b.cls.includes("green") ? "#14532d" : b.cls.includes("amber") ? "#78350f" : b.cls.includes("red") ? "#7f1d1d" : "#334155",
                        fontSize: 12,
                      }}
                    >
                      {s.title.replace(/^SECTION\s\d+\s—\s/, "")} • {b.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Sections */}
            {DIAGNOSTIC.map((sec) => (
              <div key={sec.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
                <div style={{ fontWeight: 800 }}>{sec.title}</div>
                {sec.subtitle ? <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{sec.subtitle}</div> : null}

                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 12 }}>
                  {sec.groups.map((g) => {
                    const gs = computeGroupScore(assessment, g);
                    const badge = scoreBadge(gs);

                    return (
                      <div key={g.id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 12, background: "#f8fafc" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ fontWeight: 800 }}>{g.title}</div>
                          <span
                            style={{
                              padding: "6px 10px",
                              borderRadius: 999,
                              border: "1px solid #e2e8f0",
                              background:
                                badge.cls.includes("green") ? "#ecfdf5" : badge.cls.includes("amber") ? "#fffbeb" : badge.cls.includes("red") ? "#fef2f2" : "#f1f5f9",
                              color:
                                badge.cls.includes("green") ? "#14532d" : badge.cls.includes("amber") ? "#78350f" : badge.cls.includes("red") ? "#7f1d1d" : "#334155",
                              fontSize: 12,
                            }}
                          >
                            Group • {badge.label}
                          </span>
                        </div>

                        {/* Questions */}
                        {(g.questions || []).length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                            {g.questions.map((q, qi) => {
                              const key = `${g.id}.q${qi}`;
                              const v = assessment.responses[key] || "";
                              return (
                                <div key={key} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 10 }}>
                                  <div style={{ fontWeight: 700, fontSize: 14 }}>{qi + 1}. {q}</div>
                                  <div style={{ marginTop: 8 }}>
                                    <ResponseRow value={v} onChange={(nv) => setResp(key, nv)} />
                                  </div>
                                  <div style={{ marginTop: 8 }}>
                                    <TextArea
                                      value={assessment.qNotes[key] || ""}
                                      onChange={(t) => setQNote(key, t)}
                                      placeholder="Notes (evidence, where seen, numbers, examples)"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Tools */}
                        {(g.tools || []).length > 0 && (
                          <div style={{ marginTop: 10, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 10 }}>
                            <div style={{ fontWeight: 800, marginBottom: 8 }}>{g.toolsTitle || "Tools"}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {g.tools.map((t, ti) => {
                                const key = `${g.id}.t${ti}`;
                                const checked = !!assessment.tools[key];
                                return (
                                  <label key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", border: "1px solid #e2e8f0", borderRadius: 12, padding: 10, background: checked ? "#f1f5f9" : "#fff" }}>
                                    <input type="checkbox" checked={checked} onChange={() => toggleTool(key)} style={{ marginTop: 3 }} />
                                    <span style={{ fontSize: 13 }}>{t}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Group Notes */}
                        <div style={{ marginTop: 10 }}>
                          <TextArea
                            value={assessment.groupNotes[g.id] || ""}
                            onChange={(t) => setGroupNote(g.id, t)}
                            placeholder="Group notes (key observations, numbers, examples)"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Global Notes */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>General Notes</div>
              <TextArea value={assessment.generalNotes} onChange={(t) => setAssessment((p) => ({ ...p, generalNotes: t }))} placeholder="Anything that doesn’t fit elsewhere…" />
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Evidence / Photos / References</div>
              <TextArea value={assessment.evidenceNotes} onChange={(t) => setAssessment((p) => ({ ...p, evidenceNotes: t }))} placeholder="Part numbers, board names, screenshots, observed metrics…" />
            </div>
          </>
        )}

        {tab === "debrief" && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 900 }}>Executive Debrief Builder</div>
                <div style={{ fontSize: 13, color: "#475569" }}>Auto-fill suggests gaps; you polish language.</div>
              </div>
              <Btn label="Auto-fill" onClick={autoFillDebrief} />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>Headline (1–2 sentences)</div>
              <TextArea
                value={assessment.debrief.headline}
                onChange={(t) => setAssessment((p) => ({ ...p, debrief: { ...p.debrief, headline: t } }))}
                placeholder="Example: Instability in flow + replenishment forces firefighting and hides quality losses…"
              />
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 10 }}>
                <div style={{ fontWeight: 800 }}>Top Wins (3)</div>
                {assessment.debrief.topWins.map((v, i) => (
                  <input
                    key={i}
                    value={v}
                    onChange={(e) => {
                      const next = [...assessment.debrief.topWins];
                      next[i] = e.target.value;
                      setAssessment((p) => ({ ...p, debrief: { ...p.debrief, topWins: next } }));
                    }}
                    placeholder={`Win #${i + 1}`}
                    style={{ width: "100%", marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
                  />
                ))}
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 10 }}>
                <div style={{ fontWeight: 800 }}>Top Gaps (5)</div>
                {assessment.debrief.topGaps.map((v, i) => (
                  <input
                    key={i}
                    value={v}
                    onChange={(e) => {
                      const next = [...assessment.debrief.topGaps];
                      next[i] = e.target.value;
                      setAssessment((p) => ({ ...p, debrief: { ...p.debrief, topGaps: next } }));
                    }}
                    placeholder={`Gap #${i + 1}`}
                    style={{ width: "100%", marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
                  />
                ))}
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 10 }}>
                <div style={{ fontWeight: 800 }}>Risks / Constraints (3)</div>
                {assessment.debrief.risks.map((v, i) => (
                  <input
                    key={i}
                    value={v}
                    onChange={(e) => {
                      const next = [...assessment.debrief.risks];
                      next[i] = e.target.value;
                      setAssessment((p) => ({ ...p, debrief: { ...p.debrief, risks: next } }));
                    }}
                    placeholder={`Risk #${i + 1}`}
                    style={{ width: "100%", marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
                  />
                ))}
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 10 }}>
                <div style={{ fontWeight: 800 }}>Recommendations (4)</div>
                {assessment.debrief.recommendations.map((v, i) => (
                  <input
                    key={i}
                    value={v}
                    onChange={(e) => {
                      const next = [...assessment.debrief.recommendations];
                      next[i] = e.target.value;
                      setAssessment((p) => ({ ...p, debrief: { ...p.debrief, recommendations: next } }));
                    }}
                    placeholder={`Recommendation #${i + 1}`}
                    style={{ width: "100%", marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: 10 }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>Proposed Next Step</div>
              <TextArea
                value={assessment.debrief.proposedNextStep}
                onChange={(t) => setAssessment((p) => ({ ...p, debrief: { ...p.debrief, proposedNextStep: t } }))}
                placeholder="Example: 2–4 week Stabilize + Visualize sprint with measurable targets…"
              />
            </div>
          </div>
        )}

        {tab === "export" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
              <div style={{ fontWeight: 900 }}>Export & Save</div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                Download files to your phone. Convert to PDF using Share → Print → Save as PDF.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <Btn label="Download Diagnostic (HTML)" onClick={exportDiagnostic} primary />
                <Btn label="Download Executive Debrief (HTML)" onClick={exportDebrief} primary />
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 12 }}>
              <div style={{ fontWeight: 900 }}>Email to Customer</div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                The app can open an email draft. You attach the exported files.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <Btn label="Open Email Draft" onClick={openEmailDraft} primary />
              </div>
            </div>
          </div>
        )}

        <div style={{ paddingBottom: 30, fontSize: 12, color: "#64748b" }}>
          Privacy note: This app stores your work on your device (localStorage). Export after visits before clearing browser data.
        </div>
      </div>
    </div>
  );
}
