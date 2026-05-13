// BuildCrew.AI — Modals (New Project, etc.)
const { useState: uSM, useEffect: uEM, useRef: uRM, useMemo: uMM } = React;

// =====================================================
// NEW PROJECT MODAL
// =====================================================
function NewProjectModal({ open, onClose, onCreate }) {
  const [name, setName] = uSM("");
  const [kind, setKind] = uSM("Commercial");
  const [address, setAddress] = uSM("");
  const [scope, setScope] = uSM("");
  const [scopeMode, setScopeMode] = uSM("ai"); // ai | manual — AI is the default
  const [generating, setGenerating] = uSM(false);
  const [files, setFiles] = uSM([]); // simulated uploads

  uEM(() => {
    if (!open) { setName(""); setKind("Commercial"); setAddress(""); setScope(""); setScopeMode("ai"); setGenerating(false); setFiles([]); }
  }, [open]);

  // Auto-trigger AI scope draft when documents are uploaded (only if user hasn't switched to manual)
  uEM(() => {
    if (open && files.length > 0 && scopeMode === "ai" && !scope && !generating) {
      // call via timeout so handleGenerate is in scope at call time
      setTimeout(() => handleGenerate(), 0);
    }
    // eslint-disable-next-line
  }, [files, scopeMode, open]);

  if (!open) return null;

  const handleGenerate = () => {
    setGenerating(true);
    setScopeMode("ai");
    // simulate AI generation typing
    const sample = files.length > 0
      ? `Multistory ${kind.toLowerCase()} project at ${address || "the indicated site"}. Cody parsed ${files.length} document${files.length === 1 ? "" : "s"} and detected references to a ${["pool","gym","clinic","warehouse","tower"][Math.floor(Math.random() * 5)]}-scale program with mechanical, electrical, and plumbing scope across multiple CSI divisions. Confirm program details with the owner before running estimation.`
      : `${kind} project. Upload plans and specs and Cody will refine this scope automatically — for now, treat this as a placeholder rooted in the project name.`;

    let i = 0;
    setScope("");
    const tick = () => {
      i += Math.max(2, Math.floor(sample.length / 60));
      setScope(sample.slice(0, i));
      if (i < sample.length) setTimeout(tick, 35);
      else setGenerating(false);
    };
    setTimeout(tick, 300);
  };

  const handleFakeUpload = () => {
    const sampleFiles = ["A-101 Floor plan.pdf", "Project manual.pdf", "Geotech report.pdf", "Site survey.dwg"];
    setFiles(sampleFiles.slice(0, 2 + Math.floor(Math.random() * 3)));
  };

  const canCreate = files.length > 0;

  const submit = () => {
    if (!canCreate) return;
    onCreate({
      name: "Crestview Aquatic Center",
      kind: "Civic · Recreation",
      address: "2200 SE Crestview Dr, Portland OR",
      scope: scope.trim()
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow">New project</div>
            <h2>Set up a new project</h2>
            <p>Cody will index your documents and start a takeoff once you create the project.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>

        <div className="modal-body">
          {/* documents — primary input; everything else is derived */}
          <div className="form-row">
            <label>Project documents</label>
            <div className="upload-mini" onClick={handleFakeUpload}>
              {files.length === 0 ? (
                <>
                  <Icon name="cloud_upload" size={22} />
                  <div>
                    <b>Drop plans, specs, or owner narratives</b>
                    <span>Cody reads your documents and fills in the project name, type, and address automatically.</span>
                  </div>
                  <button className="btn-ghost" type="button"><Icon name="folder_open" size={13} />Browse</button>
                </>
              ) : (
                <>
                  <Icon name="task" size={20} style={{ color: "var(--orange-500)" }} />
                  <div>
                    <b>{files.length} files attached</b>
                    <span>{files.slice(0, 3).join(" · ")}{files.length > 3 ? " · …" : ""}</span>
                  </div>
                  <button className="btn-ghost" type="button" onClick={(e) => { e.stopPropagation(); setFiles([]); }}><Icon name="close" size={13} />Remove</button>
                </>
              )}
            </div>
          </div>

          {/* AI-detected fields preview */}
          {files.length > 0 && (
            <div className="ai-detected">
              <div className="ai-detected-h">
                <CodyMark size={14} />
                <span>Cody detected from your documents</span>
              </div>
              <div className="ai-detected-grid">
                <div className="ai-field">
                  <div className="ai-label">Project name</div>
                  <div className="ai-value">Crestview Aquatic Center</div>
                </div>
                <div className="ai-field">
                  <div className="ai-label">Project type</div>
                  <div className="ai-value">Civic · Recreation</div>
                </div>
                <div className="ai-field">
                  <div className="ai-label">Address</div>
                  <div className="ai-value">2200 SE Crestview Dr, Portland OR</div>
                </div>
              </div>
              <div className="ai-detected-foot">You can adjust these later on Project Home.</div>
            </div>
          )}

          {/* SCOPE */}
          <div className="form-row scope-row">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ flex: 1, marginBottom: 0 }}>
                Project scope <span className="opt">optional</span>
              </label>
              <span className="scope-help" title="Used to give Cody background context. Helpful when uploaded docs are sparse.">
                <Icon name="help_outline" size={14} />
                What is this?
                <div className="scope-help-pop">
                  A short blurb describing what this project is. Cody uses it as background context when running skills — useful if uploaded documents are sparse or ambiguous.
                </div>
              </span>
            </div>
            <div className="scope-mode-row">
              <button
                type="button"
                className={"mode-tab " + (scopeMode === "manual" ? "active" : "")}
                onClick={() => setScopeMode("manual")}
              >
                <Icon name="edit" size={13} />Write it myself
              </button>
              <button
                type="button"
                className={"mode-tab ai " + (scopeMode === "ai" ? "active" : "")}
                onClick={handleGenerate}
                disabled={generating}
              >
                <Sparkle size={11} spin={generating} />
                {generating ? "Cody is writing…" : "Let Cody draft from documents"}
              </button>
            </div>
            <div className={"scope-textarea-wrap " + (scopeMode === "ai" ? "ai-mode" : "")}>
              <textarea
                rows="4"
                placeholder={scopeMode === "ai"
                  ? "Cody will draft a scope blurb from your uploaded documents."
                  : "e.g. Two-story 84,000 SF municipal recreation center with a 25m pool, fitness studios, and a public lobby. Targeting LEED Silver, CMGC delivery."
                }
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                readOnly={generating}
              />
              {scopeMode === "ai" && scope && !generating && (
                <div className="scope-ai-foot">
                  <CodyMark size={12} />
                  <span>Drafted by Cody — you can edit anytime.</span>
                  <button type="button" className="btn-ghost" onClick={handleGenerate}><Icon name="refresh" size={12} />Re-draft</button>
                </div>
              )}
            </div>
            <div className="scope-hint">
              Cody falls back on this when uploaded documents are sparse — it improves estimation, RFC, and bid-leveling accuracy.
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className={"btn-primary " + (canCreate ? "" : "is-disabled")}
            onClick={submit}
            disabled={!canCreate}
          >
            <Icon name="add" size={16} />{canCreate ? "Create project" : "Upload documents to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// DAILY REPORT MODAL — "Brief me on overnight" popup
// Generates 30 days of historical reports across the user's projects.
// =====================================================
function DailyReportModal({ open, onClose, projects }) {
  const fmtLong = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const fmtShort = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dayKey = (d) => d.toISOString().slice(0, 10);

  // Build a 30-day window ending today.
  const today = uSM(() => { const t = new Date(); t.setHours(0,0,0,0); return t; })[0];
  const days = uMM(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i); arr.push(d);
    }
    return arr;
  }, [today]);

  const [activeKey, setActiveKey] = uSM(dayKey(days[0]));
  uEM(() => { if (open) setActiveKey(dayKey(days[0])); }, [open]);

  // Procedurally generate report per day. Deterministic via day-index seed so the
  // report doesn't shuffle on re-render or when navigating back.
  const reports = uMM(() => {
    const eligible = projects.filter(p => !p.archived);
    if (eligible.length === 0) return {};
    // Pool of change templates; pick a few per project per day.
    const changeTemplates = (proj) => [
      { icon: "calculate", title: "Estimation refresh", text: () => `Cody re-ran the ROM and confidence held steady at ${88 + ((proj.id.length * 7) % 9)}%.` },
      { icon: "rule", title: "RFC sweep", text: () => `${1 + ((proj.id.length) % 4)} new clarifications surfaced on ${proj.name}.` },
      { icon: "compare_arrows", title: "Bid leveling refresh", text: () => `Recommended sub on Division ${["09","22","23","26"][proj.id.length % 4]} unchanged.` },
      { icon: "upload_file", title: "Document indexed", text: () => `Sam uploaded ${1 + (proj.id.length % 3)} new sheets — Cody finished extraction by 2:14 AM.` },
      { icon: "warning", title: "Cost flag raised", text: () => `Division 09 carpet trending +${5 + (proj.id.length % 18)}% above benchmark on ${proj.name}.` },
      { icon: "auto_awesome", title: "Schedule update", text: () => `Pulled critical path forward by ${1 + (proj.id.length % 4)} days after RFC closure.` },
      { icon: "fact_check", title: "Spec addendum reviewed", text: () => `Cody flagged a discrepancy in 09 65 00 finishes — review queued for you.` },
      { icon: "trending_up", title: "ROM moved", text: () => `Total estimate moved by ${(((proj.id.length * 13) % 50) / 10).toFixed(1)}% on the latest revision.` },
    ];
    const out = {};
    days.forEach((d, dayIdx) => {
      const seed = dayIdx;
      // Pick 2–4 projects for this day (varies by seed)
      const projCount = 2 + ((seed * 3) % Math.min(eligible.length - 1, 3));
      const picked = [];
      for (let i = 0; i < projCount; i++) {
        const p = eligible[(seed + i * 2) % eligible.length];
        if (!picked.includes(p)) picked.push(p);
      }
      const sections = picked.map((p, pi) => {
        const tpls = changeTemplates(p);
        const changeCount = 2 + ((seed + pi) % 3);
        const changes = [];
        for (let c = 0; c < changeCount; c++) {
          const tpl = tpls[(seed + pi * 5 + c * 3) % tpls.length];
          changes.push({ icon: tpl.icon, title: tpl.title, text: tpl.text() });
        }
        return { project: p, changes };
      });
      const totalChanges = sections.reduce((a, s) => a + s.changes.length, 0);
      const flagsToday = sections.reduce((a, s) => a + s.changes.filter(c => c.icon === "warning").length, 0);
      const summary = dayIdx === 0
        ? `Cody completed ${totalChanges} updates overnight across ${sections.length} project${sections.length === 1 ? "" : "s"}.${flagsToday > 0 ? ` ${flagsToday} flag${flagsToday === 1 ? "" : "s"} need${flagsToday === 1 ? "s" : ""} your attention.` : ""}`
        : `${totalChanges} updates landed across ${sections.length} project${sections.length === 1 ? "" : "s"}.${flagsToday > 0 ? ` ${flagsToday} flag${flagsToday === 1 ? "" : "s"} raised.` : ""}`;
      out[dayKey(d)] = { date: d, summary, sections };
    });
    return out;
  }, [projects, days]);

  if (!open) return null;

  const activeIdx = days.findIndex(d => dayKey(d) === activeKey);
  const activeReport = reports[activeKey];
  const isToday = activeIdx === 0;
  const goPrev = () => { if (activeIdx < days.length - 1) setActiveKey(dayKey(days[activeIdx + 1])); };
  const goNext = () => { if (activeIdx > 0) setActiveKey(dayKey(days[activeIdx - 1])); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell daily-report-shell" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow"><CodyMark size={12} style={{ marginRight: 6, verticalAlign: "-2px" }} />Cody's Daily Brief</div>
            <h2>Overnight summary</h2>
            <p>A narrative of every meaningful change Cody picked up across the projects you have access to.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>

        <div className="daily-report-nav">
          <button className="dr-arrow" onClick={goPrev} disabled={activeIdx >= days.length - 1} title="Previous day">
            <Icon name="chevron_left" size={18} />
          </button>
          <div className="dr-date">
            <Icon name="calendar_today" size={14} />
            <b>{fmtLong(activeReport.date)}</b>
            {isToday && <span className="dr-today-pill">Today</span>}
          </div>
          <button className="dr-arrow" onClick={goNext} disabled={activeIdx <= 0} title="Next day">
            <Icon name="chevron_right" size={18} />
          </button>
          <div className="dr-spacer" />
          {!isToday && (
            <button className="dr-jump" onClick={() => setActiveKey(dayKey(days[0]))}>Jump to today</button>
          )}
        </div>

        {/* Horizontal day strip — last 30 days, scrollable */}
        <div className="dr-strip">
          {days.map((d) => {
            const k = dayKey(d);
            const r = reports[k];
            return (
              <button
                key={k}
                className={"dr-strip-day " + (k === activeKey ? "active" : "")}
                onClick={() => setActiveKey(k)}>
                <div className="dr-strip-date">{fmtShort(d)}</div>
                <div className="dr-strip-count">{r ? r.sections.reduce((a, s) => a + s.changes.length, 0) : 0}</div>
              </button>
            );
          })}
        </div>

        <div className="modal-body daily-report-body">
          <div className="dr-summary">
            <CodyMark size={14} />
            <p>{activeReport.summary}</p>
          </div>
          {activeReport.sections.length === 0 && (
            <div className="dr-empty">No project activity recorded for this day.</div>
          )}
          {activeReport.sections.map((s, i) => (
            <div key={i} className="dr-project">
              <div className="dr-project-h">
                <div className="dr-project-icon"><Icon name={s.project.icon || "business"} size={18} /></div>
                <div className="dr-project-name">{s.project.name}</div>
                <div className="dr-project-kind">{s.project.kind}</div>
              </div>
              <div className="dr-changes">
                {s.changes.map((c, ci) => (
                  <div key={ci} className="dr-change">
                    <div className={"dr-change-icon " + (c.icon === "warning" ? "alert" : "")}>
                      <Icon name={c.icon} size={14} />
                    </div>
                    <div className="dr-change-body">
                      <div className="dr-change-title">{c.title}</div>
                      <div className="dr-change-text">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NewProjectModal, DailyReportModal });
