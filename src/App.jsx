import React, { useEffect, useMemo, useState } from "react";

/*
 Lean Walkaround Diagnostic App
 Mobile-first, offline-capable via localStorage
 Exports Diagnostic + Executive Debrief
*/

const RESP = {
  YES: "yes",
  PARTIAL: "partial",
  NO: "no",
  NA: "na",
};

const respLabel = (v) =>
  v === RESP.YES ? "Yes" :
  v === RESP.PARTIAL ? "Somewhat" :
  v === RESP.NO ? "No" :
  v === RESP.NA ? "N/A" : "";

const scoreVal = (v) =>
  v === RESP.YES ? 1 :
  v === RESP.PARTIAL ? 0.5 :
  v === RESP.NO ? 0 :
  null;

const STORAGE_KEY = "srs_walkaround_v1";

const DIAGNOSTIC = [
  {
    id: "control",
    title: "SECTION 1 — CONTROL & STABILITY",
    groups: [
      {
        id: "flow",
        title: "Cell Infrastructure & Flow",
        questions: [
          "Are products and tools grouped by family & flow?",
          "Can a part move from start to finish with minimal backtracking?",
          "Are queues visible and intentional?",
          "Are bottleneck processes clearly identified?",
          "One-piece flow or batch?",
          "Preventive maintenance?"
        ],
        tools: [
          "Output",
          "First Pass Yield",
          "Non-Value-Added (NVA) Analysis",
          "Yamazumi Chart",
          "SIPOC"
        ]
      },
      {
        id: "material",
        title: "Material Replenishment",
        questions: [
          "Is there a clear signal that tells material when to move?",
          "Do operators stop work due to missing material?",
          "Is inventory held 'just in case'?",
          "Are shortages detected early?",
          "Stock held at point of use?"
        ],
        tools: [
          "Alternates plan",
          "Control Plan – MRP or Kanban",
          "Hazard / Risk Matrix",
          "Visual Management on stock",
          "Safety Data Sheets",
          "NVA Analysis"
        ]
      }
    ]
  },
  {
    id: "standard",
    title: "SECTION 2 — SETTING THE STANDARD",
    groups: [
      {
        id: "5s",
        title: "5S & Workplace Organization",
        questions: [
          "Can abnormalities be seen within 10 seconds?",
          "Are tools at point of use?",
          "Are standards obvious to new employees?",
          "Shadow boards or equivalent?"
        ],
        tools: ["5S Scorecard", "Visual Standards"]
      },
      {
        id: "stdwork",
        title: "Standardized Work",
        questions: [
          "Is there one best-known way to do the job?",
          "Do operators perform the job differently?",
          "Is training formal?",
          "SMED used for changeovers?"
        ],
        tools: [
          "Standard Work Worksheet",
          "Standards Posted",
          "Work Instructions",
          "SIPOC",
          "PERT Chart"
        ]
      }
    ]
  }
];

function emptyAssessment() {
  const a = {
    meta: {
      date: new Date().toISOString().slice(0, 10),
      customer: "",
      site: "",
      contact: "",
      email: ""
    },
    responses: {},
    notes: {},
    tools: {},
    summary: {
      headline: "",
      wins: ["", "", ""],
      gaps: ["", "", "", "", ""],
      next: ""
    }
  };

  DIAGNOSTIC.forEach(s =>
    s.groups.forEach(g => {
      g.questions.forEach((_, i) => {
        a.responses[`${g.id}.q${i}`] = "";
        a.notes[`${g.id}.q${i}`] = "";
      });
      g.tools.forEach((_, i) => {
        a.tools[`${g.id}.t${i}`] = false;
      });
    })
  );

  return a;
}

export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : emptyAssessment();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (path, val) =>
    setData(d => {
      const copy = { ...d };
      path(copy, val);
      return { ...copy };
    });

  const exportFile = (name, content) => {
    const blob = new Blob([content], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  const diagnosticHTML = () => `
<html><body style="font-family:Arial;padding:20px">
<h1>Lean Walkaround Diagnostic</h1>
<p><b>Customer:</b> ${data.meta.customer}</p>
<p><b>Site:</b> ${data.meta.site}</p>
${DIAGNOSTIC.map(s =>
  `<h2>${s.title}</h2>` +
  s.groups.map(g =>
    `<h3>${g.title}</h3><ul>` +
    g.questions.map((q, i) =>
      `<li>${q}: ${respLabel(data.responses[`${g.id}.q${i}`])}</li>`
    ).join("") +
    `</ul>`
  ).join("")
).join("")}
</body></html>
`;

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "auto" }}>
      <h1>Lean Walkaround Diagnostic</h1>

      <label>Customer
        <input value={data.meta.customer}
          onChange={e => update(d => d.meta.customer = e.target.value)} />
      </label>

      {DIAGNOSTIC.map(section => (
        <div key={section.id}>
          <h2>{section.title}</h2>
          {section.groups.map(group => (
            <div key={group.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
              <h3>{group.title}</h3>

              {group.questions.map((q, i) => {
                const key = `${group.id}.q${i}`;
                return (
                  <div key={key}>
                    <p>{q}</p>
                    {Object.values(RESP).map(v => (
                      <button key={v}
                        onClick={() => update(d => d.responses[key] = v)}
                        style={{ marginRight: 5 }}>
                        {respLabel(v)}
                      </button>
                    ))}
                    <textarea
                      placeholder="Notes"
                      value={data.notes[key]}
                      onChange={e => update(d => d.notes[key] = e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      <button onClick={() =>
        exportFile("Lean_Walkaround_Diagnostic.html", diagnosticHTML())
      }>
        Download Diagnostic
      </button>
    </div>
  );
}

