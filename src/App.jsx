import React, { useEffect, useMemo, useState } from "react";

/* =========================================================
   Lean Walkaround Diagnostic – FULL VERSION
   Mobile-first | Offline | Export + Executive Debrief
   ========================================================= */

const RESP = { YES: "yes", PARTIAL: "partial", NO: "no", NA: "na" };
const RESP_LABEL = { yes: "Yes", partial: "Somewhat", no: "No", na: "N/A" };

const STORAGE_KEY = "srs_walkaround_full_v1";

/* ----------------- Diagnostic Schema ----------------- */
const DIAGNOSTIC = [
  {
    id: "s1",
    title: "SECTION 1 — CONTROL & STABILITY",
    groups: [
      {
        id: "s1a",
        title: "Cell Infrastructure & Flow",
        questions: [
          "Are products and tools grouped by family & flow?",
          "Can a part move from start to finish with minimal backtracking?",
          "Are queues between processes visible and intentional?",
          "Are bottleneck processes clearly identified?",
          "One-piece flow or batch?",
          "Preventive maintenance in place?"
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
        id: "s1b",
        title: "Material Replenishment",
        questions: [
          "Is there a clear signal that tells material when to move?",
          "Do operators ever stop work due to missing material?",
          "Is inventory held just in case?",
          "Are shortages detected early?",
          "Is stock held at point of use?"
        ],
        tools: [
          "Alternates Plan",
          "Control Plan – MRP or Kanban",
          "Hazard / Risk Matrix",
          "Visual Management on Stock",
          "Safety Data Sheets",
          "NVA Analysis"
        ]
      },
      {
        id: "s1c",
        title: "Heijunka / Level Loading",
        questions: [
          "Is production leveled or does it spike?",
          "How often does the schedule change inside a shift?",
          "Is overtime compensating for planning instability?",
          "Are batches sized for flow?",
          "Layout by product flow vs machine?",
          "Timed to bottleneck?"
        ],
        tools: [
          "Heijunka Board",
          "Takt-based Scheduling",
          "Failure Prevention Analysis",
          "Line Leveling"
        ]
      },
      {
        id: "s1d",
        title: "Process Capability & Equipment Stability",
        questions: [
          "Is equipment performance measured consistently?",
          "Are process limits known or guessed?",
          "Are failures predictable or surprising?"
        ],
        tools: [
          "OEE",
          "Cp / Cpk",
          "X-bar R",
          "Gauge R&R",
          "Preventive Maintenance"
        ]
      }
    ]
  },

  {
    id: "s2",
    title: "SECTION 2 — SETTING THE STANDARD",
    groups: [
      {
        id: "s2a",
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
        id: "s2b",
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
      },
      {
        id: "s2c",
        title: "Customer & Quality Definition",
        questions: [
          "Is quality clearly defined in measurable terms?",
          "Can operators explain CTQs?",
          "Are customer requirements translated into process terms?",
          "Are perceived requirements being met?"
        ],
        tools: [
          "CTQ Tree",
          "Inspection",
          "Golden Sample",
          "Point-of-use Measurement",
          "Gage R&R"
        ]
      }
    ]
  },

  {
    id: "s3",
    title: "SECTION 3 — SHOWING THE GAP TO THE STANDARD",
    groups: [
      {
        id: "s3a",
        title: "Visual Management",
        questions: [
          "Can you tell in 30 seconds if the line is winning or losing?",
          "Are metrics updated in real time?",
          "Are problems visible before they become urgent?"
        ],
        tools: [
          "Current-State VSM",
          "Hourly Production Analysis",
          "Material Review Board"
        ]
      },
      {
        id: "s3b",
        title: "Quality & Performance Signals",
        questions: [
          "Are defects tracked where they occur?",
          "Are trends reviewed or just reported?",
          "Are recurring problems obvious?"
        ],
        tools: [
          "Defect Tracking Matrix",
          "DPMO",
          "Cpk / Ppk",
          "Rolled Throughput Yield",
          "Cost of Poor Quality",
          "OEE",
          "X-bar R"
        ]
      },
      {
        id: "s3c",
        title: "Stop-and-Fix Culture",
        questions: [
          "Can operators stop the process without fear?",
          "Are defects passed forward?",
          "Is firefighting normal?"
        ],
        tools: []
      }
    ]
  },

  {
    id: "s4",
    title: "SECTION 4 — CLOSING THE GAP TO THE STANDARD",
    groups: [
      {
        id: "s4a",
        title: "Problem-Solving Discipline",
        questions: [
          "Are root causes identified or assumed?",
          "Are countermeasures tested?",
          "Do problems repeat or end in control?"
        ],
        tools: [
          "Fishbone Diagram",
          "Control Processes",
          "Kaizen / Gemba Walk",
          "FMEA",
          "Regression",
          "Design of Experiments"
        ]
      },
      {
        id: "s4b",
        title: "Improvement Execution",
        questions: [
          "Are actions owned and reviewed?",
          "Do improvements update standards?",
          "Does learning spread beyond one area?"
        ],
        tools: [
          "Action Plan",
          "Affinity Diagram",
          "TRIZ",
          "8D",
          "A3",
          "Sample Size Calculator"
        ]
      },
      {
        id: "s4c",
        title: "Future-State Thinking",
        questions: [
          "Is there a clear future-state vision?",
          "Is improvement reactive or directional?"
        ],
        tools: ["Future-State VSM", "Descriptive Statistics"]
      }
    ]
  },

  {
    id: "s5",
    title: "SECTION 5 — QUALITY, METRICS & POLICY DEPLOYMENT",
    groups: [
      {
        id: "s5a",
        title: "Metrics & Financial Visibility",
        questions: [
          "Do metrics drive behavior or fear?",
          "Can leaders explain ROI?",
          "Is FMEA used?",
          "Is PPAP or vendor measurement used?"
        ],
        tools: [
          "Decision Matrix",
          "Cost of Quality",
          "ROI Calculator",
          "Balanced Scorecard",
          "Blue Ocean Strategy"
        ]
      },
      {
        id: "s5b",
        title: "Policy Deployment (Hoshin)",
        questions: [
          "Can the floor explain top priorities?",
          "Are improvement projects aligned?",
          "Are tradeoffs explicit?"
        ],
        tools: [
          "Project Charter",
          "Gantt Chart",
          "Hoshin Planning Sheet",
          "Target & Means Matrix",
          "Transition Plan",
          "PERT Chart"
        ]
      },
      {
        id: "s5c",
        title: "Customer Alignment",
        questions: [],
        tools: [
          "QFD / House of Quality",
          "Stakeholder Analysis",
          "SWOT",
          "Force Field Analysis",
          "Project Management Formulas"
        ]
      }
    ]
  },

  {
    id: "s6",
    title: "SECTION 6 — THE 8 WASTES",
    groups: [
      {
        id: "waste",
        title: "Observed Wastes",
        questions: [],
        tools: [
          "Defects",
          "Overproduction",
          "Waiting",
          "Non-Utilized Talent",
          "Transportation",
          "Inventory",
          "Motion",
          "Extra Processing"
        ]
      }
    ]
  }
];

/* ----------------- Helpers ----------------- */
const scoreValue = v =>
  v === RESP.YES ? 1 :
  v === RESP.PARTIAL ? 0.5 :
  v === RESP.NO ? 0 :
  null;

function emptyAssessment() {
  const a = {
    meta: { date: new Date().toISOString().slice(0,10), customer:"", site:"", contact:"", email:"" },
    responses: {},
    notes: {},
    tools: {},
    debrief: { headline:"", wins:["","",""], gaps:["","","","",""], next:"" }
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

/* ----------------- App ----------------- */
export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : emptyAssessment();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = fn => setData(d => {
    const copy = JSON.parse(JSON.stringify(d));
    fn(copy);
    return copy;
  });

  const exportHTML = (name, html) => {
    const blob = new Blob([html], { type:"text/html" });
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
      g.questions.map((q,i)=>
        `<li>${q}: ${RESP_LABEL[data.responses[`${g.id}.q${i}`]]||""}</li>`
      ).join("") +
      `</ul>`
    ).join("")
  ).join("")}
  </body></html>`;

  return (
    <div style={{ padding:16, maxWidth:900, margin:"auto" }}>
      <h1>Lean Walkaround Diagnostic</h1>

      <label>Customer
        <input value={data.meta.customer}
          onChange={e=>update(d=>d.meta.customer=e.target.value)} />
      </label>

      {DIAGNOSTIC.map(sec=>(
        <div key={sec.id}>
          <h2>{sec.title}</h2>
          {sec.groups.map(g=>(
            <div key={g.id} style={{border:"1px solid #ccc",padding:10,marginBottom:10}}>
              <h3>{g.title}</h3>
              {g.questions.map((q,i)=>{
                const k=`${g.id}.q${i}`;
                return (
                  <div key={k}>
                    <p>{q}</p>
                    {Object.values(RESP).map(v=>(
                      <button key={v}
                        onClick={()=>update(d=>d.responses[k]=v)}>
                        {RESP_LABEL[v]}
                      </button>
                    ))}
                    <textarea
                      placeholder="Notes"
                      value={data.notes[k]}
                      onChange={e=>update(d=>d.notes[k]=e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      <button onClick={()=>exportHTML("Lean_Diagnostic.html", diagnosticHTML())}>
        Download Diagnostic
      </button>
    </div>
  );
}        ],
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

