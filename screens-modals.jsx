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

  const NEW_PROJECT_TOUR_STEPS = [
    { id: "shell", selector: "[data-tour-id=\"newproj-shell\"]", placement: "right",
      title: "Set up a new project",
      desc: "This is where every BuildCrew project starts. Cody handles the heavy lifting — you upload documents, and it fills in the rest." },
    { id: "upload", selector: "[data-tour-id=\"newproj-upload\"]", placement: "below",
      title: "Documents are the only required input",
      desc: "Drop plans, specs, or an owner narrative. Cody detects the project name, type, and address automatically — no manual data entry." },
    { id: "scope", selector: "[data-tour-id=\"newproj-scope\"]", placement: "above",
      title: "Cody drafts the scope",
      desc: "Once documents are uploaded, Cody drafts a short project scope in the background. Prefer to write it yourself? Switch modes here. This runs Skills more accurately when docs are sparse.",
      isFinal: true, finalLabel: "Got it", finalIcon: "check" },
  ];
  const [newProjTourActive, completeNewProjTour] = window.useFirstVisitTour
    ? window.useFirstVisitTour("bc_tour_seen_new_project", open && !!(window.isFreshDemoMode && window.isFreshDemoMode()))
    : [false, () => {}];

  if (!open) return null;

  const handleGenerate = () => {
    setGenerating(true);
    setScopeMode("ai");
    // simulate AI generation typing
    const sample = files.length > 0
      ? `Multistory ${kind.toLowerCase()} project at ${address || "the indicated site"}. Cody parsed ${files.length} document${files.length === 1 ? "" : "s"} and detected references to a ${["pool","gym","clinic","warehouse","tower"][Math.floor(Math.random() * 5)]}-scale program with mechanical, electrical, and plumbing scope across multiple CSI divisions. Confirm program details with the owner before running estimation.`
      : `${kind} project. Upload plans and specs and Cody will refine this scope automatically. For now, treat this as a placeholder rooted in the project name.`;

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
      scope: scope.trim(),
      filesCount: files.length,
      files: files.slice(),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell" data-tour-id="newproj-shell" onClick={(e) => e.stopPropagation()}>
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
            <label>Upload project documents</label>
            <div className="upload-mini upload-mini-lg" data-tour-id="newproj-upload" onClick={handleFakeUpload}>
              {files.length === 0 ? (
                <>
                  <Icon name="cloud_upload" size={36} />
                  <div>
                    <b>Drop plans, specs, or owner narratives</b>
                    <span>Cody reads your documents and fills in the project name, type, and address automatically.</span>
                    <span className="upload-formats">Compatible formats: PDF, PNG, JPG</span>
                  </div>
                  <button className="btn-ghost" type="button"><Icon name="folder_open" size={13} />Browse</button>
                </>
              ) : (
                <>
                  <Icon name="task" size={28} style={{ color: "var(--orange-500)" }} />
                  <div>
                    <b>{files.length} files attached</b>
                    <span>{files.slice(0, 3).join(" · ")}{files.length > 3 ? " · …" : ""}</span>
                    <span className="upload-formats">Compatible formats: PDF, PNG, JPG</span>
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

          {/* SCOPE — label outside, box matches the upload zone */}
          <div className="form-row scope-row">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <label style={{ flex: 1, marginBottom: 0 }}>
                Project scope <span className="opt">optional</span>
              </label>
              <span className="scope-help" title="Used to give Cody background context. Helpful when uploaded docs are sparse.">
                <Icon name="help_outline" size={14} />
                What is this?
                <div className="scope-help-pop">
                  A short blurb describing what this project is. Cody uses it as background context when running skills, which is useful if uploaded documents are sparse or ambiguous.
                </div>
              </span>
            </div>
            <div className="scope-box" data-tour-id="newproj-scope">
              <div className="scope-radios">
                <label className={"scope-radio " + (scopeMode === "ai" ? "is-checked" : "")}>
                  <input
                    type="radio"
                    name="scopeMode"
                    checked={scopeMode === "ai"}
                    onChange={() => handleGenerate()}
                    disabled={generating}
                  />
                  <Sparkle size={12} spin={generating} />
                  <span>{generating ? "Cody is writing…" : "Let Cody draft from documents"}</span>
                </label>
                <label className={"scope-radio " + (scopeMode === "manual" ? "is-checked" : "")}>
                  <input
                    type="radio"
                    name="scopeMode"
                    checked={scopeMode === "manual"}
                    onChange={() => setScopeMode("manual")}
                  />
                  <Icon name="edit" size={13} />
                  <span>Write it myself</span>
                </label>
              </div>

              {scopeMode === "manual" && (
                <textarea
                  className="scope-textarea"
                  rows="4"
                  placeholder="e.g. Two-story 84,000 SF municipal recreation center with a 25m pool, fitness studios, and a public lobby. Targeting LEED Silver, CMGC delivery."
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                />
              )}
              {scopeMode === "ai" && scope && !generating && (
                <div className="scope-ai-draft">
                  <p>{scope}</p>
                  <div className="scope-ai-foot">
                    <CodyMark size={12} />
                    <span>Drafted by Cody. Switch to "Write it myself" to edit.</span>
                    <button type="button" className="btn-ghost" onClick={handleGenerate}><Icon name="refresh" size={12} />Re-draft</button>
                  </div>
                </div>
              )}
            </div>
            <div className="scope-hint">
              Cody falls back on this when uploaded documents are sparse. It improves estimation, RFC, and bid-leveling accuracy.
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
        {newProjTourActive && window.CoachmarkTour && (
          <window.CoachmarkTour steps={NEW_PROJECT_TOUR_STEPS} onComplete={completeNewProjTour} />
        )}
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
      { icon: "upload_file", title: "Document indexed", text: () => `Sam uploaded ${1 + (proj.id.length % 3)} new sheets. Cody finished extraction by 2:14 AM.` },
      { icon: "warning", title: "Cost flag raised", text: () => `Division 09 carpet trending +${5 + (proj.id.length % 18)}% above benchmark on ${proj.name}.` },
      { icon: "auto_awesome", title: "Schedule update", text: () => `Pulled critical path forward by ${1 + (proj.id.length % 4)} days after RFC closure.` },
      { icon: "fact_check", title: "Spec addendum reviewed", text: () => `Cody flagged a discrepancy in 09 65 00 finishes. Review queued for you.` },
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
            <div className="modal-eyebrow"><CodyMark size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Cody's Daily Brief</div>
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

// =====================================================
// PUSH GLOBAL MODAL — confirm pushing edits to the platform's knowledge base
// =====================================================
function PushGlobalModal({ open, onClose, onConfirm, edits }) {
  if (!open) return null;
  const editEntries = Object.entries(edits || {});
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow"><Icon name="cloud_upload" size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Push Global</div>
            <h2>Push {editEntries.length} change{editEntries.length === 1 ? "" : "s"} to all collaborators?</h2>
            <p>This solidifies your edits, makes them visible to everyone with project access, and updates Cody's knowledge base for future skill runs across your projects.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          {editEntries.length > 0 ? (
            <div className="push-edit-list">
              <div className="push-edit-list-h">Changes in this push</div>
              {editEntries.map(([key, e], i) => (
                <div key={i} className="push-edit-row">
                  <div className="push-edit-label">{e.label || key}</div>
                  <div className="push-edit-diff">
                    <span className="push-edit-old">{e.original}</span>
                    <Icon name="arrow_forward" size={12} />
                    <span className="push-edit-new">{e.value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--bc-muted)", textAlign: "center", padding: 16 }}>No pending edits.</div>
          )}
          <div className="push-impact">
            <Icon name="auto_awesome" size={14} className="cody-mark" />
            <div>
              <b>What Cody will learn:</b> these changes feed back into the platform-wide knowledge base. Future skill runs on this project, and similar projects, will reflect your overrides.
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} disabled={editEntries.length === 0}>
            <Icon name="cloud_upload" size={14} />Push to Global
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteFileModal({ open, file, onClose, onConfirm }) {
  if (!open || !file) return null;

  // File type icon + tone (mirrors FilesScreen helper)
  const tt = (file.ftype || "").toLowerCase();
  const ft = (() => {
    if (tt === "pdf") return { icon: "picture_as_pdf", tone: "pdf" };
    if (tt === "dwg" || tt === "dxf") return { icon: "architecture", tone: "dwg" };
    if (tt === "xlsx" || tt === "xls" || tt === "csv") return { icon: "table_view", tone: "sheet" };
    if (tt === "docx" || tt === "doc" || tt === "txt") return { icon: "description", tone: "doc" };
    if (tt === "jpg" || tt === "jpeg" || tt === "png" || tt === "image") return { icon: "image", tone: "image" };
    return { icon: "insert_drive_file", tone: "other" };
  })();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow modal-eyebrow-danger">
              <Icon name="delete_forever" size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Delete file
            </div>
            <h2>Delete "{file.name}"?</h2>
            <p>This file will be permanently removed from {file.projectName || "this project"}. This action cannot be undone.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>

        <div className="modal-body">
          {/* File summary card */}
          <div className="del-file-card">
            <span className={"files-ftype-icon files-ftype-" + ft.tone}>
              <Icon name={ft.icon} size={20} />
            </span>
            <div className="del-file-meta">
              <div className="del-file-name">{file.name}</div>
              <div className="del-file-sub">
                {(file.ftype || "file").toUpperCase()} · {file.size}{file.uploaded ? " · uploaded " + file.uploaded : ""}{file.uploadedBy ? " · " + file.uploadedBy : ""}
              </div>
              {(file.projectName || file.revisionName) && (
                <div className="del-file-loc">
                  <Icon name="folder_open" size={12} style={{ opacity: 0.6, verticalAlign: "-2px", marginRight: 4 }} />
                  {file.projectName}{file.revisionName ? " · " + file.revisionName : ""}
                </div>
              )}
            </div>
          </div>

          {/* Historical-data impact warning */}
          <div className="del-impact">
            <div className="del-impact-h">
              <Icon name="warning" size={14} />
              <b>How this affects historical data</b>
            </div>
            <ul className="del-impact-list">
              <li>Past skill runs that referenced this file will keep their results, but their source citations will show as <b>"file removed."</b></li>
              <li>Cody's project knowledge base will be updated, so future skill runs won't draw on this file's contents.</li>
              <li>Any flagged line items, RFIs, or bid leveling notes anchored to this file will be marked <b>orphaned</b> and surfaced for review.</li>
              <li>The file will still appear in the project's revision history audit log.</li>
            </ul>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={() => onConfirm && onConfirm(file)}>
            <Icon name="delete_forever" size={14} />Delete file
          </button>
        </div>
      </div>
    </div>
  );
}

// Renders a brand logo with a graceful fallback chain:
//   1. Clearbit Logo API (real logos for most company domains, no auth required)
//   2. Google Favicons high-res (guaranteed to work for any domain with a favicon)
//   3. Material icon tile with brand color (final fallback if the company has no web presence)
function ConnectLogo({ domain, brand, icon, name }) {
  const [stage, setStage] = React.useState(0);
  if (!domain || stage >= 2) {
    return (
      <div className="connect-logo" style={{ background: (brand || "#272635") + "1A", color: brand || "#272635" }}>
        <Icon name={icon || "link"} size={20} />
      </div>
    );
  }
  const src = stage === 0
    ? "https://logo.clearbit.com/" + domain
    : "https://www.google.com/s2/favicons?domain=" + domain + "&sz=128";
  return (
    <div className="connect-logo connect-logo-img-wrap">
      <img
        src={src}
        alt={name}
        className="connect-logo-img"
        onError={() => setStage(s => s + 1)}
      />
    </div>
  );
}

function AddConnectionModal({ open, onClose, connections, onToggleConnection }) {
  if (!open) return null;
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  // Catalog of integrations — grouped by category.
  // Each entry: { id, name, desc, category, domain (for logo lookup), icon (material-icon fallback), brand (hex color) }
  const catalog = [
    // Construction tech
    { id: "bluebeam",         name: "Bluebeam Revu",     category: "Construction", domain: "bluebeam.com",         desc: "PDF markup, takeoffs, and quantification.",          icon: "draw",            brand: "#1B6EC7" },
    { id: "building-connected", name: "BuildingConnected", category: "Construction", domain: "buildingconnected.com", desc: "Subcontractor bid invitation and tracking.",       icon: "groups",          brand: "#FF7235" },
    { id: "procore",          name: "Procore",           category: "Construction", domain: "procore.com",          desc: "Project management, drawings, and submittals.",      icon: "domain",          brand: "#F7941E" },
    { id: "onscreen-takeoff", name: "OnScreen Takeoff",  category: "Construction", domain: "oncenter.com",         desc: "Digital takeoffs from drawings and PDFs.",            icon: "square_foot",     brand: "#0096D6" },
    { id: "planswift",        name: "PlanSwift",         category: "Construction", domain: "planswift.com",        desc: "Quick takeoff and estimating from PDF plans.",        icon: "straighten",      brand: "#E84600" },
    { id: "autodesk-construction", name: "Autodesk Construction Cloud", category: "Construction", domain: "autodesk.com", desc: "BIM 360, Build, and Docs: drawings and RFIs.", icon: "view_in_ar", brand: "#0696D7" },
    { id: "plangrid",         name: "PlanGrid",          category: "Construction", domain: "plangrid.com",         desc: "Field-first drawing access and markup sync.",         icon: "map",             brand: "#FFB400" },
    { id: "stack",            name: "STACK",             category: "Construction", domain: "stackct.com",          desc: "Cloud takeoff and estimating for preconstruction.",   icon: "calculate",       brand: "#5047F3" },
    { id: "trimble-connect",  name: "Trimble Connect",   category: "Construction", domain: "connect.trimble.com",  desc: "Model coordination and collaboration platform.",      icon: "hub",             brand: "#005EB8" },
    { id: "rsmeans",          name: "RSMeans Data",      category: "Construction", domain: "rsmeans.com",          desc: "Regional cost data and unit pricing benchmarks.",     icon: "payments",        brand: "#48C1B5" },

    // Cloud storage
    { id: "dropbox",          name: "Dropbox",           category: "Storage",      domain: "dropbox.com",          desc: "Sync drawings and specs from shared folders.",        icon: "cloud",           brand: "#0061FF" },
    { id: "onedrive",         name: "OneDrive",          category: "Storage",      domain: "onedrive.live.com",    desc: "Pull files from Microsoft 365 and SharePoint.",       icon: "cloud_queue",     brand: "#0078D4" },
    { id: "google-drive",     name: "Google Drive",      category: "Storage",      domain: "drive.google.com",     desc: "Import documents and drawings from Drive folders.",   icon: "cloud_done",      brand: "#1FA463" },
    { id: "box",              name: "Box",               category: "Storage",      domain: "box.com",              desc: "Enterprise content management and file sharing.",     icon: "inventory_2",     brand: "#0061D5" },
    { id: "sharepoint",       name: "SharePoint",        category: "Storage",      domain: "sharepoint.com",       desc: "Enterprise document libraries and project sites.",    icon: "folder_shared",   brand: "#036C70" },
    { id: "egnyte",           name: "Egnyte",            category: "Storage",      domain: "egnyte.com",           desc: "Hybrid file sharing built for construction teams.",   icon: "folder_zip",      brand: "#00968F" },

    // Productivity
    { id: "slack",            name: "Slack",             category: "Productivity", domain: "slack.com",            desc: "Get Cody notifications in your team channels.",       icon: "chat",            brand: "#4A154B" },
    { id: "teams",            name: "Microsoft Teams",   category: "Productivity", domain: "teams.microsoft.com",  desc: "Push skill run summaries to Teams channels.",         icon: "groups_2",        brand: "#4B53BC" },
    { id: "outlook",          name: "Outlook",           category: "Productivity", domain: "outlook.live.com",     desc: "Sync RFI emails and meeting invites.",                icon: "mail",            brand: "#0078D4" },
    { id: "gmail",            name: "Gmail",             category: "Productivity", domain: "gmail.com",            desc: "Send RFIs and reports from your work Gmail.",         icon: "forward_to_inbox", brand: "#EA4335" },
  ];

  const categories = [
    { id: "all",          label: "All",            count: catalog.length },
    { id: "Construction", label: "Construction",   count: catalog.filter(c => c.category === "Construction").length },
    { id: "Storage",      label: "Cloud storage",  count: catalog.filter(c => c.category === "Storage").length },
    { id: "Productivity", label: "Productivity",   count: catalog.filter(c => c.category === "Productivity").length },
  ];

  const conns = connections || {};
  const filtered = catalog.filter(c => {
    if (activeCategory !== "all" && c.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell connect-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow"><Icon name="hub" size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Connections</div>
            <h2>Add a connection</h2>
            <p>Connect BuildCrew to the tools your team already uses. Cody will pull drawings, specs, bids, and notes from these sources to power skill runs.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>

        <div className="connect-toolbar">
          <div className="files-search" style={{ minWidth: 240 }}>
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Search integrations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="icon-btn" onClick={() => setSearch("")} title="Clear" style={{ width: 24, height: 24 }}>
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <div className="connect-cats">
            {categories.map(cat => (
              <button key={cat.id}
                      className={"connect-cat " + (activeCategory === cat.id ? "is-active" : "")}
                      onClick={() => setActiveCategory(cat.id)}>
                {cat.label}<span className="connect-cat-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body connect-body">
          {filtered.length === 0 ? (
            <div className="files-empty" style={{ padding: 40 }}>
              No integrations match "{search}".
            </div>
          ) : (
            <div className="connect-list">
              {filtered.map(c => {
                const isConnected = !!conns[c.id];
                return (
                  <div key={c.id} className={"connect-row " + (isConnected ? "is-connected" : "")}>
                    <ConnectLogo domain={c.domain} brand={c.brand} icon={c.icon} name={c.name} />
                    <div className="connect-row-meta">
                      <div className="connect-row-name-row">
                        <span className="connect-name">{c.name}</span>
                        <span className="connect-row-cat">{c.category}</span>
                      </div>
                      <div className="connect-desc">{c.desc}</div>
                    </div>
                    {isConnected && (
                      <span className="connect-status"><span className="connect-status-dot" />Connected</span>
                    )}
                    {isConnected ? (
                      <button className="btn-ghost connect-btn-disc"
                              onClick={() => onToggleConnection && onToggleConnection(c.id, false)}>
                        <Icon name="link_off" size={14} />Disconnect
                      </button>
                    ) : (
                      <button className="btn-primary connect-btn"
                              onClick={() => onToggleConnection && onToggleConnection(c.id, true, c)}>
                        <Icon name="add_link" size={14} />Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-foot connect-foot">
          <div className="connect-foot-meta">
            <Icon name="info" size={13} />
            {Object.keys(conns).length} active connection{Object.keys(conns).length === 1 ? "" : "s"} · Cody only pulls files you authorize per project.
          </div>
          <button className="btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// RUN BID LEVEL ANALYSIS MODAL
// Pre-run configuration step for the Bid Level Analysis skill. Shows
// AI-categorized bid files grouped by trade. The user can:
//   • Re-assign any file to a different trade (in case of mis-categorization)
//   • Multi-select which trades to actually run on
//   • Confirm to kick off the standard skill-run animation back on Project Home
// =====================================================
function RunBidAnalysisModal({ open, onClose, onConfirm, project, bidConfig }) {
  const BID_CFG_TOUR_STEPS = [
    { id: "shell", selector: "[data-tour-id=\"bidcfg-shell\"]", placement: "right",
      title: "Configure your bid run",
      desc: "Before Bid Level Analysis runs, Cody groups your uploaded bid files by trade. Confirm the groupings and pick which trades to level." },
    { id: "toolbar", selector: "[data-tour-id=\"bidcfg-toolbar\"]", placement: "below",
      title: "What Cody detected",
      desc: "The pill on the left shows how many bid files and trades Cody found. Use Select all / Clear on the right to move fast when you're running everything at once." },
    { id: "trades", selector: "[data-tour-id=\"bidcfg-trades\"]", placement: "above",
      title: "Drag files if a bid got mis-categorized",
      desc: "Each card is a trade. Check to include it in the run. If a bid ended up in the wrong trade, drag it by the handle to the correct card. Selected trades run in parallel.",
      isFinal: true, finalLabel: "Got it", finalIcon: "check" },
  ];
  const [bidCfgTourActive, completeBidCfgTour] = window.useFirstVisitTour
    ? window.useFirstVisitTour("bc_tour_seen_bid_config", open && !!project && !!(window.isFreshDemoMode && window.isFreshDemoMode()))
    : [false, () => {}];

  // ALL hooks must run on every render regardless of `open` / `project` — the
  // early return that used to sit here got moved BELOW so React sees a stable
  // hook order. `open=false` and `project=undefined` are handled by defaulting
  // baseTrades/baseFiles to [] and returning null at the very end.
  const baseTrades = (bidConfig && bidConfig.trades) || [];
  const baseFiles  = (bidConfig && bidConfig.files)  || [];

  // Local state — file → tradeId assignment (initialized from data, mutable),
  // and a set of selected trade ids for the run.
  const initialAssignments = React.useMemo(() => {
    const map = {};
    baseFiles.forEach(f => { map[f.id] = f.tradeId; });
    return map;
  }, [baseFiles]);
  const [assignments, setAssignments] = React.useState(initialAssignments);
  const [selected, setSelected] = React.useState(() => {
    // Pre-select every trade that has at least one bid file
    const initial = new Set();
    baseTrades.forEach(t => {
      if (baseFiles.some(f => f.tradeId === t.id)) initial.add(t.id);
    });
    return initial;
  });

  // Reset state when modal reopens for a different project
  React.useEffect(() => {
    if (open && project) {
      setAssignments(initialAssignments);
      const initial = new Set();
      baseTrades.forEach(t => {
        if (baseFiles.some(f => f.tradeId === t.id)) initial.add(t.id);
      });
      setSelected(initial);
    }
  }, [open, project && project.id]);

  // Helpers
  const filesForTrade = (tradeId) => baseFiles.filter(f => assignments[f.id] === tradeId);
  const moveFile = (fileId, newTradeId) => {
    setAssignments(prev => ({ ...prev, [fileId]: newTradeId }));
  };

  // Drag/drop state — track which file is being dragged and which trade
  // card is the current hover target so we can highlight the drop zone.
  const [dragFileId, setDragFileId] = React.useState(null);
  const [dropTargetTradeId, setDropTargetTradeId] = React.useState(null);
  const handleDragStart = (fileId) => (e) => {
    setDragFileId(fileId);
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", fileId); } catch (_) {}
  };
  const handleDragEnd = () => {
    setDragFileId(null);
    setDropTargetTradeId(null);
  };
  const handleTradeDragOver = (tradeId) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropTargetTradeId !== tradeId) setDropTargetTradeId(tradeId);
  };
  const handleTradeDragLeave = (e) => {
    // Only clear when the pointer leaves the trade card entirely (not just
    // when crossing into a child element of the same card).
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      setDropTargetTradeId(prev => prev);
    }
  };
  const handleTradeDrop = (tradeId) => (e) => {
    e.preventDefault();
    const fileId = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || dragFileId;
    if (fileId) moveFile(fileId, tradeId);
    setDragFileId(null);
    setDropTargetTradeId(null);
  };
  const toggleTrade = (tradeId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(tradeId)) next.delete(tradeId); else next.add(tradeId);
      return next;
    });
  };
  const ftypeFor = (name) => {
    const n = (name || "").toLowerCase();
    if (n.endsWith(".pdf")) return { icon: "picture_as_pdf", tone: "pdf", label: "PDF" };
    if (n.endsWith(".xlsx") || n.endsWith(".xls") || n.endsWith(".csv")) return { icon: "table_view", tone: "sheet", label: "XLSX" };
    if (n.endsWith(".docx") || n.endsWith(".doc")) return { icon: "description", tone: "doc", label: "DOC" };
    return { icon: "insert_drive_file", tone: "other", label: "FILE" };
  };

  // Totals
  const totalFiles = baseFiles.length;
  const totalTrades = baseTrades.length;
  const selectedCount = selected.size;
  const selectedFileCount = baseTrades
    .filter(t => selected.has(t.id))
    .reduce((acc, t) => acc + filesForTrade(t.id).length, 0);
  const canRun = selectedCount > 0 && selectedFileCount > 0;

  const handleRun = () => {
    if (!canRun) return;
    onConfirm && onConfirm({
      projectId: project.id,
      trades: Array.from(selected),
      assignments,
    });
  };

  const emptyProject = totalFiles === 0;

  // Render nothing when closed / no project — all hooks above have already
  // run in a stable order so React's hook accounting stays consistent.
  if (!open || !project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell bid-run-modal" data-tour-id="bidcfg-shell" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow"><Icon name="compare_arrows" size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Bid Level Analysis</div>
            <h2>Configure your bid run</h2>
            <p>Cody auto-categorized your uploaded bid files into the trades below. Drag any file by its handle to a different trade if it's mis-categorized, then choose which trade(s) to run.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>

        {!emptyProject && (
          <div className="bid-run-toolbar" data-tour-id="bidcfg-toolbar">
            <div className="bid-run-toolbar-meta">
              <span className="bid-run-pill"><Icon name="auto_awesome" size={12} className="cody-mark" />{totalFiles} bid file{totalFiles === 1 ? "" : "s"} · {totalTrades} trades detected</span>
              <span className="bid-run-toolbar-hint">Project: <b>{project.name}</b></span>
            </div>
            <div className="bid-run-toolbar-actions">
              <button className="btn-ghost"
                      onClick={() => setSelected(new Set(baseTrades.map(t => t.id)))}>
                <Icon name="select_all" size={14} />Select all
              </button>
              <button className="btn-ghost"
                      onClick={() => setSelected(new Set())}>
                <Icon name="deselect" size={14} />Clear
              </button>
            </div>
          </div>
        )}

        <div className="modal-body bid-run-body">
          {emptyProject ? (
            <div className="bid-run-empty">
              <Icon name="upload_file" size={36} />
              <div className="bid-run-empty-h">No bid files uploaded yet</div>
              <div className="bid-run-empty-sub">Upload bid forms from your subcontractors to this project and Cody will auto-organize them by trade.</div>
            </div>
          ) : (
            <div className="bid-run-tradelist" data-tour-id="bidcfg-trades">
              {baseTrades.map(t => {
                const files = filesForTrade(t.id);
                const isSelected = selected.has(t.id);
                const isEmpty = files.length === 0;
                const isDropTarget = dropTargetTradeId === t.id;
                return (
                  <div
                    key={t.id}
                    className={
                      "bid-run-trade "
                      + (isSelected ? "is-selected " : "")
                      + (isEmpty ? "is-empty " : "")
                      + (isDropTarget ? "is-drop-target" : "")
                    }
                    onDragOver={handleTradeDragOver(t.id)}
                    onDragLeave={handleTradeDragLeave}
                    onDrop={handleTradeDrop(t.id)}>
                    <label className="bid-run-trade-h">
                      <input type="checkbox"
                             checked={isSelected}
                             onChange={() => toggleTrade(t.id)}
                             disabled={isEmpty}
                             className="bid-run-checkbox" />
                      <div className="bid-run-trade-meta">
                        <div className="bid-run-trade-name">
                          <span className="bid-run-div">Div {t.division}</span>
                          {t.name}
                        </div>
                        <div className="bid-run-trade-sub">
                          {isEmpty
                            ? "No bid files assigned"
                            : files.length + " bid file" + (files.length === 1 ? "" : "s") + " · " + new Set(files.map(f => f.uploadedBy)).size + " uploader" + (new Set(files.map(f => f.uploadedBy)).size === 1 ? "" : "s")
                          }
                        </div>
                      </div>
                      <span className={"bid-run-count " + (isEmpty ? "is-empty" : "")}>{files.length}</span>
                    </label>

                    {files.length > 0 && (
                      <div className="bid-run-file-list">
                        {files.map(f => {
                          const ft = ftypeFor(f.name);
                          const dragging = dragFileId === f.id;
                          return (
                            <div
                              key={f.id}
                              className={"bid-run-file " + (dragging ? "is-dragging" : "")}
                              draggable
                              onDragStart={handleDragStart(f.id)}
                              onDragEnd={handleDragEnd}>
                              <span className={"files-ftype-icon files-ftype-" + ft.tone}>
                                <Icon name={ft.icon} size={16} />
                              </span>
                              <div className="bid-run-file-meta">
                                <div className="bid-run-file-name">{f.name}</div>
                                <div className="bid-run-file-sub">
                                  {ft.label} · {f.size} · {f.uploaded} · {f.uploadedBy}
                                </div>
                              </div>
                              <span
                                className="bid-run-file-handle"
                                title="Drag to move this file to another trade"
                                aria-label="Drag handle">
                                <Icon name="drag_indicator" size={18} />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {isDropTarget && (
                      <div className="bid-run-drop-hint" aria-hidden="true">
                        <Icon name="south_west" size={14} />
                        Drop to move to <b>Div {t.division}: {t.name}</b>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-foot bid-run-foot">
          <div className="bid-run-foot-meta">
            {emptyProject ? (
              <span><Icon name="info" size={13} />Upload bid forms first to run this skill.</span>
            ) : (
              <span>
                <Icon name="check_circle" size={13} style={{ color: canRun ? "var(--tiffany-400)" : "var(--bc-muted)" }} />
                {selectedCount} trade{selectedCount === 1 ? "" : "s"} selected · {selectedFileCount} bid file{selectedFileCount === 1 ? "" : "s"} will be analyzed
              </span>
            )}
          </div>
          <div className="bid-run-foot-actions">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleRun} disabled={!canRun}>
              <Icon name="play_arrow" size={14} />Run analysis
            </button>
          </div>
        </div>
        {bidCfgTourActive && window.CoachmarkTour && (
          <window.CoachmarkTour steps={BID_CFG_TOUR_STEPS} onComplete={completeBidCfgTour} />
        )}
      </div>
    </div>
  );
}

// =====================================================
// ROM PRE-RUN MODAL
// Lets the user choose which CSI divisions the ROM Estimate should
// cover. All divisions are selected by default; de-selecting one
// excludes it from the run so the skill finishes faster. The default
// division list comes from the project's existing estimation data
// (when available) so the modal reflects the actual project scope.
// =====================================================
function RunRomEstimateModal({ open, onClose, onConfirm, project }) {
  if (!open || !project) return null;

  // Full MasterFormat division catalog — this modal runs BEFORE Cody
  // analyzes the files, so we can't know which divisions are "in scope".
  // Show every division the platform supports and let the user deselect
  // the ones they want to skip.
  const ALL_DIVISIONS = React.useMemo(() => ([
    { code: "01", name: "General Requirements" },
    { code: "02", name: "Existing Conditions" },
    { code: "03", name: "Concrete" },
    { code: "04", name: "Masonry" },
    { code: "05", name: "Metals" },
    { code: "06", name: "Wood, Plastics & Composites" },
    { code: "07", name: "Thermal & Moisture Protection" },
    { code: "08", name: "Openings" },
    { code: "09", name: "Finishes" },
    { code: "10", name: "Specialties" },
    { code: "11", name: "Equipment" },
    { code: "12", name: "Furnishings" },
    { code: "13", name: "Special Construction" },
    { code: "14", name: "Conveying Equipment" },
    { code: "21", name: "Fire Suppression" },
    { code: "22", name: "Plumbing" },
    { code: "23", name: "HVAC" },
    { code: "25", name: "Integrated Automation" },
    { code: "26", name: "Electrical" },
    { code: "27", name: "Communications" },
    { code: "28", name: "Electronic Safety & Security" },
    { code: "31", name: "Earthwork" },
    { code: "32", name: "Exterior Improvements" },
    { code: "33", name: "Utilities" },
    { code: "34", name: "Transportation" },
    { code: "35", name: "Waterway & Marine Construction" },
    { code: "40", name: "Process Interconnections" },
    { code: "41", name: "Material Processing Equipment" },
    { code: "42", name: "Process Heating & Cooling" },
    { code: "43", name: "Process Gas & Liquid Handling" },
    { code: "44", name: "Pollution Control Equipment" },
    { code: "45", name: "Industry-Specific Manufacturing" },
    { code: "46", name: "Water & Wastewater Equipment" },
    { code: "48", name: "Electrical Power Generation" },
  ]), []);
  const divisions = ALL_DIVISIONS;

  // Selection state — every division selected by default.
  const [selected, setSelected] = React.useState(() => new Set(divisions.map(d => d.code)));
  React.useEffect(() => {
    if (open) setSelected(new Set(divisions.map(d => d.code)));
  }, [open, project && project.id]);

  const toggle = (code) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(code)) next.delete(code); else next.add(code);
    return next;
  });
  const selectAll = () => setSelected(new Set(divisions.map(d => d.code)));
  const clearAll = () => setSelected(new Set());

  const selectedCount = selected.size;
  const totalCount = divisions.length;
  // Coarse runtime estimate: ~45 seconds per division of base + project size.
  // Pure prototype heuristic — communicates the speed/scope trade clearly.
  const estimatedMin = Math.max(2, Math.round(selectedCount * 0.8));
  const canRun = selectedCount > 0;

  const handleRun = () => {
    if (!canRun) return;
    onConfirm && onConfirm({
      projectId: project.id,
      divisions: Array.from(selected),
    });
  };


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell rom-run-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow"><Icon name="calculate" size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Pre-run configuration · ROM Estimate</div>
            <h2>Configure your ROM</h2>
            <p>
              All MasterFormat divisions are included by default. Deselect any you'd like to skip, fewer divisions means a faster run.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} title="Close"><Icon name="close" size={18} /></button>
        </div>

        <div className="rom-run-meta">
          <div>
            <b style={{ color: "var(--orange-500)" }}>{selectedCount}</b> of {totalCount} divisions selected
          </div>
          <div className="rom-run-meta-spacer" />
          <div style={{ color: "var(--bc-muted)" }}>
            Estimated runtime: <b style={{ color: "var(--raisin-800)" }}>~{estimatedMin} min</b>
          </div>
          <div className="rom-run-meta-actions">
            <button className="btn-ghost" onClick={selectAll} disabled={selectedCount === totalCount}>
              <Icon name="done_all" size={14} />Select all
            </button>
            <button className="btn-ghost" onClick={clearAll} disabled={selectedCount === 0}>
              <Icon name="remove_done" size={14} />Clear all
            </button>
          </div>
        </div>

        <div className="rom-run-grid">
          {divisions.map(d => {
            const isOn = selected.has(d.code);
            return (
              <label key={d.code}
                     className={"rom-run-div " + (isOn ? "is-on" : "")}>
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(d.code)}
                  aria-label={`Include Division ${d.code} ${d.name}`}
                />
                <div className="rom-run-div-body">
                  <div className="rom-run-div-h">
                    <span className="rom-run-div-code">Div {d.code}</span>
                  </div>
                  <div className="rom-run-div-name">{d.name}</div>
                </div>
                <Icon
                  name={isOn ? "check_box" : "check_box_outline_blank"}
                  size={18}
                  className="rom-run-div-check"
                />
              </label>
            );
          })}
        </div>

        <div className="rom-run-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleRun} disabled={!canRun}>
            <Icon name="play_arrow" size={14} />Run ROM on {selectedCount} division{selectedCount === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PUSH TO MASTER MODAL
// Summarizes the current edit event (list of pending changes) and asks
// the user to submit for admin approval. Even admins see this — the
// intent is a deliberate "I want this in Master" moment before any
// change hits the canonical version.
// =====================================================
function PushToMasterModal({ open, onClose, onSubmit, project, changes, user }) {
  if (!open || !project) return null;
  const list = changes || [];
  const [note, setNote] = React.useState("");
  React.useEffect(() => { if (open) setNote(""); }, [open, project && project.id]);

  const iconFor = (kind) =>
    kind === "takeoff"      ? "straighten" :
    kind === "skill_run"    ? "auto_awesome" :
    kind === "file_upload"  ? "upload_file" :
    kind === "labor_rate"   ? "engineering" :
    kind === "project_meta" ? "edit" :
    kind === "revision"     ? "history" :
    "edit_note";

  const handleSubmit = () => {
    const bundle = list.map(c => ({ ...c, note: note || undefined }));
    onSubmit && onSubmit(bundle);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell push-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div>
            <div className="modal-eyebrow"><Icon name="publish" size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Push to Master</div>
            <h2>{list.length} change{list.length === 1 ? "" : "s"} pending approval</h2>
            <p>
              These changes are currently only visible in your draft of <b>{project.name}</b>. Submitting sends them to an admin for review — nothing hits the Master version until they approve.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} title="Close"><Icon name="close" size={18} /></button>
        </div>

        <div className="push-modal-body">
          {list.length === 0 ? (
            <div className="push-modal-empty">
              <Icon name="check_circle" size={22} style={{ color: "var(--tiffany-400)" }} />
              <div>No pending changes on this project yet.</div>
            </div>
          ) : (
            <ul className="push-modal-list">
              {list.map((c, i) => (
                <li key={i}>
                  <Icon name={iconFor(c.kind)} size={16} />
                  <div className="push-modal-list-body">
                    <div className="push-modal-list-label">{c.label}</div>
                    {c.detail && <div className="push-modal-list-detail">{c.detail}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="push-modal-note">
            <label>Note for the reviewer <span className="push-modal-optional">(optional)</span></label>
            <textarea
              placeholder="Add context for the admin — what's changing and why."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="push-modal-foot">
          <div className="push-modal-foot-meta">
            <Icon name="info" size={13} />
            {user && user.role === "admin"
              ? <>You're an admin — another admin will approve, or you can self-approve from the Company → Approvals queue.</>
              : <>An admin will review and approve or deny your submission.</>}
          </div>
          <div className="push-modal-foot-actions">
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={list.length === 0}>
              <Icon name="publish" size={14} />Submit for approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NewProjectModal, DailyReportModal, PushGlobalModal, DeleteFileModal, AddConnectionModal, ConnectLogo, RunBidAnalysisModal, RunRomEstimateModal, PushToMasterModal });
