// BuildCrew.AI — Skill results: Estimation (HERO), RFC, Bid Leveling

// Shared loading skeleton used by every skill result screen while a run is in progress.
function SkillLoadingShell({ projectName, title, progress }) {
  const p = Math.max(0, Math.min(100, progress || 0));
  const stage = p < 25 ? "Reading project documents"
    : p < 55 ? "Extracting line items"
    : p < 85 ? "Applying rates & indices"
    : "Finalizing report";
  return (
    <div className="canvas">
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 4 }}>{projectName}</div>
        <h2 className="page-h1">{title}</h2>
        <p className="page-sub">Cody is analyzing your project documents…</p>
      </div>
      <div className="skill-loading-card">
        <div className="skill-loading-h">
          <span className="skill-loading-spinner" />
          <div>
            <div className="skill-loading-stage"><span className="dot" />{stage}…</div>
            <div className="skill-loading-pct">{Math.round(p)}% complete</div>
          </div>
        </div>
        <div className="skill-loading-bar"><div style={{ width: p + "%" }} /></div>
      </div>
      <div className="skill-loading-grid">
        {[1, 2, 3, 4].map(i => <div key={i} className="skill-loading-block" style={{ animationDelay: (i * 100) + "ms" }} />)}
      </div>
      <div className="skill-loading-table">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skill-loading-row" style={{ animationDelay: (i * 80) + "ms" }} />)}
      </div>
    </div>
  );
}
const { useState: uS3, useEffect: uE3, useRef: uR3, useMemo: uM3 } = React;

// =====================================================
// SKILL RUN — Run-button + streaming progress
// =====================================================
function SkillRunScreen({ project, ctx, setCtx, onAskAI, onRunSkill, projectSwitcher }) {
  const [running, setRunning] = uS3(false);
  const [progress, setProgress] = uS3(0);
  const [stage, setStage] = uS3("");
  const skillId = ctx.skill || "estimation";
  const skill = window.BC_DATA.skills.find(s => s.id === skillId) || window.BC_DATA.skills[0];

  const start = () => {
    setRunning(true); setProgress(0);
    const stages = [
      { p: 8, label: "Reading drawings (A-101 … A-301)" },
      { p: 24, label: "Parsing specs · Div 09 Finishes" },
      { p: 42, label: "Quantity takeoff · 1,284 line items" },
      { p: 64, label: "Applying labor rates · PDX metro" },
      { p: 82, label: "Rolling up by CSI division" },
      { p: 96, label: "Reviewing for inconsistencies" },
      { p: 100, label: "Done." }
    ];
    stages.forEach((s, i) => {
      setTimeout(() => { setProgress(s.p); setStage(s.label); if (s.p === 100) setTimeout(() => { setRunning(false); setCtx({ ...ctx, tab: skillId === "estimation" ? "estimation" : skillId === "rfc" ? "rfc" : "bid" }); }, 600); }, 700 * (i + 1));
    });
  };

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Projects" }, { useSwitcher: true }, { label: "Run skills", bold: true }]}
        actions={<button className="btn"><Icon name="schedule" size={16} />Schedule</button>}
        onAskAI={onAskAI}
        switcher={projectSwitcher}
      />
      <div className="canvas">
        <h2 className="page-h1">Run a skill</h2>
        <p className="page-sub">Cody will read your project files and produce a report you can review and export.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 22 }}>
          {window.BC_DATA.skills.map(s => (
            <div key={s.id} className="pin-card" style={{ minHeight: 200, cursor: "default", border: skillId === s.id ? "1.5px solid var(--orange-500)" : undefined }}
                 onClick={() => setCtx({ ...ctx, skill: s.id })}>
              <Icon className="bg" name={s.icon} />
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(232,70,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={22} style={{ color: "var(--orange-500)" }} />
              </div>
              <div className="pin-title">{s.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--bc-muted)", lineHeight: 1.4 }}>{s.desc}</div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--bc-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span>{s.duration}</span>
                <span>{s.runs} runs on this project</span>
              </div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
                      onClick={() => { setCtx({ ...ctx, skill: s.id }); start(); }}
                      disabled={running}>
                <Icon name="play_arrow" size={16} />{running && skillId === s.id ? "Running…" : "Run skill"}
              </button>
            </div>
          ))}
        </div>

        {running && (
          <div className="card" style={{ marginTop: 20, background: "rgba(232,70,0,0.04)", borderColor: "rgba(232,70,0,0.20)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Sparkle size={14} spin />
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>{skill.name} · working</div>
              <div style={{ marginLeft: "auto", fontFamily: "var(--font-data)", fontWeight: 700, fontSize: 13 }}>{progress}%</div>
            </div>
            <div className="bar-track"><div className="bar-fill gradient" style={{ width: progress + "%" }} /></div>
            <div style={{ marginTop: 10, fontSize: 13, color: "rgba(39,38,53,0.70)" }}><span className="working" style={{ fontSize: 13 }}><span className="dot" />{stage}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// ESTIMATION REPORT — HERO, with edit mode
// =====================================================
function EstimationScreen({ project, onAskAI, viz, projectSwitcher, onOpenDrawing, pinnedSet, onPin, isLoading, loadProgress, onRerun, editMode, setEditMode, edits: globalEdits, recordEdit, revertEdits, editCount, onPushGlobal }) {
  const data = window.BC_DATA.estimation;
  const [edits, setEdits] = uS3({}); // line item id -> { unitCost, qty, name }
  const [editingCell, setEditingCell] = uS3(null); // {id, field}
  const [items, setItems] = uS3(data.lineItems);
  const [accepted, setAccepted] = uS3(new Set()); // accepted IDs
  const [expandedDiv, setExpandedDiv] = uS3(null); // div code currently open
  const [reportTab, setReportTab] = uS3("overview"); // overview | detailed | files
  const [selectedDivision, setSelectedDivision] = uS3(null); // CSI code or null
  const [accordionOpen, setAccordionOpen] = uS3(new Set(["summary"]));
  const toggleAccordion = (id) => setAccordionOpen(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const [divSort, setDivSort] = uS3({ key: "amount", direction: "desc" });
  const toggleDivSort = (key) => {
    setDivSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
      }
      // Default direction per key
      return { key, direction: key === "div" ? "asc" : "desc" };
    });
  };
  const sortedDivisions = uM3(() => {
    const arr = [...data.divisions];
    if (divSort.key === "amount") arr.sort((a, b) => divSort.direction === "desc" ? b.amount - a.amount : a.amount - b.amount);
    else if (divSort.key === "pct") arr.sort((a, b) => divSort.direction === "desc" ? b.pct - a.pct : a.pct - b.pct);
    else if (divSort.key === "div") arr.sort((a, b) => divSort.direction === "asc" ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code));
    return arr;
  }, [divSort, data.divisions]);

  // Derived KPI inputs
  const grossArea = 84000; // SF
  const costPerSF = (data.grandTotal / grossArea).toFixed(2);
  const sortedDivs = [...data.divisions].sort((a, b) => b.amount - a.amount);
  const topDivision = sortedDivs[0];
  const topMaterial = "Cast-in-place concrete";

  // Files analyzed list (filter from BC_DATA.files)
  const filesAnalyzed = (window.BC_DATA.files || []).filter(f => f.indexed);

  // Full CSI MasterFormat division list. In-scope divisions get the live amount.
  const csiCatalog = [
    { code: "01", name: "General Requirements", scope: "GCs, project mgmt, mobilization" },
    { code: "02", name: "Existing Conditions", scope: "Demo, hazardous remediation, site investigation" },
    { code: "03", name: "Concrete", scope: "Foundations, slabs, structural concrete" },
    { code: "04", name: "Masonry", scope: "CMU, brick, stone veneer" },
    { code: "05", name: "Metals", scope: "Structural steel, decking, miscellaneous metals" },
    { code: "06", name: "Wood, Plastics & Composites", scope: "Rough + finish carpentry, millwork" },
    { code: "07", name: "Thermal & Moisture Protection", scope: "Roofing, insulation, waterproofing" },
    { code: "08", name: "Openings", scope: "Doors, windows, glazing, storefronts" },
    { code: "09", name: "Finishes", scope: "Drywall, flooring, ceilings, paint" },
    { code: "10", name: "Specialties", scope: "Signage, lockers, partitions, accessories" },
    { code: "11", name: "Equipment", scope: "Kitchen, athletic, food service equipment" },
    { code: "12", name: "Furnishings", scope: "Window treatments, casework, seating" },
    { code: "13", name: "Special Construction", scope: "Pools, pre-engineered structures, integrated systems" },
    { code: "14", name: "Conveying Equipment", scope: "Elevators, escalators, lifts" },
    { code: "21", name: "Fire Suppression", scope: "Sprinklers, standpipes, fire pumps" },
    { code: "22", name: "Plumbing", scope: "Domestic water, sanitary, fixtures" },
    { code: "23", name: "HVAC", scope: "Heating, ventilation, air conditioning" },
    { code: "25", name: "Integrated Automation", scope: "Building management & automation systems" },
    { code: "26", name: "Electrical", scope: "Power distribution, lighting, panels" },
    { code: "27", name: "Communications", scope: "Data, voice, AV cabling and devices" },
    { code: "28", name: "Electronic Safety & Security", scope: "Access control, surveillance, alarm" },
    { code: "31", name: "Earthwork", scope: "Excavation, fill, soil stabilization" },
    { code: "32", name: "Exterior Improvements", scope: "Paving, landscaping, site furnishings" },
    { code: "33", name: "Utilities", scope: "Water, sewer, storm, gas distribution" },
    { code: "34", name: "Transportation", scope: "Rail, transit, airfield infrastructure" },
    { code: "35", name: "Waterway & Marine", scope: "Marine construction, hydraulic structures" },
  ];
  const csiWithAmounts = csiCatalog.map(c => {
    const live = data.divisions.find(d => d.code === c.code);
    return live ? { ...c, ...live, inScope: true } : { ...c, amount: 0, pct: 0, inScope: false };
  });
  const activeDivision = selectedDivision ? csiWithAmounts.find(c => c.code === selectedDivision) : null;

  // recompute totals if there are edits
  const editedTotal = uM3(() => {
    return items.reduce((acc, it) => {
      const e = edits[it.id] || {};
      const qty = e.qty != null ? e.qty : it.qty;
      const uc = e.unitCost != null ? e.unitCost : it.unitCost;
      return acc + qty * uc;
    }, 0);
  }, [edits, items]);

  const saveCell = (id, field, val) => {
    setEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: val } }));
    setEditingCell(null);
  };

  if (isLoading) return (
    <div className="col-detail">
      <Taskbar crumbs={[{ label: "Projects" }, { useSwitcher: true }, { label: "Rough Order of Magnitude (ROM) Estimate", bold: true }]} onAskAI={onAskAI} switcher={projectSwitcher} />
      <SkillLoadingShell projectName={project.name} title="Rough Order of Magnitude (ROM) Estimate" progress={loadProgress} />
    </div>
  );

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[
          { label: "Projects" }, { useSwitcher: true }, { label: "Rough Order of Magnitude (ROM) Estimate", bold: true }
        ]}
        actions={
          <>
            <PinButton pinId={"skill:" + project.id + "/estimation"} pinnedSet={pinnedSet} onPin={onPin} />
            <button className={"btn " + (editMode ? "btn-primary" : "")} onClick={() => setEditMode && setEditMode(!editMode)} style={editMode ? { background: "var(--orange-500)", color: "#fff", border: "none" } : {}}>
              <Icon name={editMode ? "check" : "edit"} size={16} />{editMode ? "Done editing" : "Edit mode"}
            </button>
            <button className="btn"><Icon name="picture_as_pdf" size={16} />Export</button>
            <button className="btn"><Icon name="add_chart" size={16} />Build report</button>
          </>
        }
        onAskAI={onAskAI}
        switcher={projectSwitcher}
      />
      <div className="canvas">
        {editMode && <EditModeBar editCount={editCount} onRevert={revertEdits} onPushGlobal={onPushGlobal} onExit={() => setEditMode(false)} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 4 }}>{project.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 className="page-h1" style={{ marginBottom: 0 }}>
                <EditableText
                  editMode={editMode}
                  editKey={"est:" + project.id + ":title"}
                  original={"Rough Order of Magnitude (ROM) Estimate"}
                  value={globalEdits && globalEdits["est:" + project.id + ":title"] && globalEdits["est:" + project.id + ":title"].value}
                  onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Report title")}
                />
              </h2>
              {onRerun && <button className="btn rerun-inline" onClick={onRerun}><Icon name="refresh" size={14} />Re-run skill</button>}
            </div>
            <p className="page-sub" style={{ marginTop: 4 }}>
              <EditableText
                editMode={editMode}
                editKey={"est:" + project.id + ":subtitle"}
                original={"v3 · 84,000 SF · Run finished 12 min ago in 11m 32s"}
                value={globalEdits && globalEdits["est:" + project.id + ":subtitle"] && globalEdits["est:" + project.id + ":subtitle"].value}
                onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Report meta")}
              />
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="badge b-done"><Icon name="verified" size={12} style={{ opacity: 0.7 }} />91% confidence</span>
            <span className="badge b-warn">2 flags</span>
          </div>
        </div>

        {/* REPORT TABS */}
        <div className="report-tabs" style={{ marginTop: 18 }}>
          <button className={"report-tab " + (reportTab === "overview" ? "active" : "")} onClick={() => setReportTab("overview")}>
            <Icon name="dashboard" size={14} />Overview
          </button>
          <button className={"report-tab " + (reportTab === "detailed" ? "active" : "")} onClick={() => setReportTab("detailed")}>
            <Icon name="analytics" size={14} />Detailed Analysis
          </button>
          <button className={"report-tab " + (reportTab === "files" ? "active" : "")} onClick={() => setReportTab("files")}>
            <Icon name="folder_open" size={14} />Files Analyzed
            <span className="report-tab-count">{filesAnalyzed.length}</span>
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {reportTab === "overview" && <>


        {/* SUMMARY */}
        <div className="summary-row" style={{ marginTop: 18 }}>
          <div className="kpi-strip" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div className="kpi">
              <Icon className="bg" name="payments" />
              <div className="label">
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:totalLbl"} original={"Total Project Estimate"} value={globalEdits && globalEdits["est:" + project.id + ":kpi:totalLbl"] && globalEdits["est:" + project.id + ":kpi:totalLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Total")} />
              </div>
              <div className="value" style={{ color: "var(--tiffany-400)" }}>{fullMoney(editMode ? editedTotal : data.grandTotal)}</div>
              <div className="delta" style={{ color: "var(--bc-muted)" }}>
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:totalDelta"} original={(data.contingency * 100).toFixed(0) + "% contingency · SD phase"} value={globalEdits && globalEdits["est:" + project.id + ":kpi:totalDelta"] && globalEdits["est:" + project.id + ":kpi:totalDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Total")} />
              </div>
            </div>
            <div className="kpi kpi-accent" style={{ "--kpi-accent": "#5047F3" }}>
              <Icon className="bg" name="engineering" />
              <div className="label">
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:laborLbl"} original={"Labor"} value={globalEdits && globalEdits["est:" + project.id + ":kpi:laborLbl"] && globalEdits["est:" + project.id + ":kpi:laborLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Labor")} />
              </div>
              <div className="value">{fullMoney(data.laborTotal)}</div>
              <div className="delta" style={{ color: "var(--bc-muted)" }}>
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:laborDelta"} original={"Most expensive trade · " + topDivision.name} value={globalEdits && globalEdits["est:" + project.id + ":kpi:laborDelta"] && globalEdits["est:" + project.id + ":kpi:laborDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Labor")} />
              </div>
            </div>
            <div className="kpi">
              <Icon className="bg" name="square_foot" />
              <div className="label">
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:psfLbl"} original={"Cost Per SF"} value={globalEdits && globalEdits["est:" + project.id + ":kpi:psfLbl"] && globalEdits["est:" + project.id + ":kpi:psfLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Per SF")} />
              </div>
              <div className="value">${costPerSF}</div>
              <div className="delta" style={{ color: "var(--bc-muted)" }}>
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:psfDelta"} original={"Gross project area · " + grossArea.toLocaleString() + " SF"} value={globalEdits && globalEdits["est:" + project.id + ":kpi:psfDelta"] && globalEdits["est:" + project.id + ":kpi:psfDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Per SF")} />
              </div>
            </div>
            <div className="kpi kpi-accent" style={{ "--kpi-accent": "#E84600" }}>
              <Icon className="bg" name="build" />
              <div className="label">
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:matLbl"} original={"Materials"} value={globalEdits && globalEdits["est:" + project.id + ":kpi:matLbl"] && globalEdits["est:" + project.id + ":kpi:matLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Materials")} />
              </div>
              <div className="value">{fullMoney(data.materialTotal)}</div>
              <div className="delta" style={{ color: "var(--bc-muted)" }}>
                <EditableText editMode={editMode} editKey={"est:" + project.id + ":kpi:matDelta"} original={"Most expensive material · " + topMaterial} value={globalEdits && globalEdits["est:" + project.id + ":kpi:matDelta"] && globalEdits["est:" + project.id + ":kpi:matDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Materials")} />
              </div>
            </div>
          </div>

          <div className="donut-card">
            <Donut items={data.laborMaterial} total={data.grandTotal} />
            <div className="legend">
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Labor vs Materials</div>
              {data.laborMaterial.map(i => (
                <div key={i.name} className="legend-row">
                  <span className="swatch" style={{ background: i.color }} />
                  <span className="name">{i.name}</span>
                  <span className="pct">{((i.value / data.grandTotal) * 100).toFixed(1)}%</span>
                </div>
              ))}
              <div style={{ paddingTop: 8, borderTop: "1px solid rgba(39,38,53,0.06)", marginTop: 4, fontSize: 11, color: "var(--bc-muted)" }}>
                Labor rates from PDX metro · v2.4
              </div>
            </div>
          </div>
        </div>

        {/* Cody's flag — below the KPI strip */}
        <div style={{ marginTop: 18 }}>
          <CodyMessage
            eyebrow="Cody flagged something"
            title={
              <EditableText
                editMode={editMode}
                editKey={"est:" + project.id + ":flagTitle"}
                original={"Division 13 — Special Construction sits 18% above benchmark"}
                value={globalEdits && globalEdits["est:" + project.id + ":flagTitle"] && globalEdits["est:" + project.id + ":flagTitle"].value}
                onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Cody flag title")}
              />
            }
            pillLabel="Walk me through it"
            onPill={onAskAI}
          >
            {(() => {
              const flagBody1Key = "est:" + project.id + ":flagBody1";
              const flagBody1Orig = "The pool tank lump-sum ($384k) sits 18% above my regional benchmark. The benchmark is built from 14 similar 25m × 8-lane projects in the PNW; the closest comp is Beaverton Aquatic ($326k, 2024).";
              const flagBody2Key = "est:" + project.id + ":flagBody2";
              const flagBody2Orig = "Want me to break the lump sum into trade lines for a tighter view?";
              if (!editMode) {
                return <>
                  <p>The pool tank lump-sum (<b>$384k</b>) sits 18% above my regional benchmark. The benchmark is built from <b>14 similar 25m × 8-lane projects in the PNW</b>; the closest comp is Beaverton Aquatic ($326k, 2024).</p>
                  <p>Want me to break the lump sum into trade lines for a tighter view?</p>
                </>;
              }
              return <>
                <p>
                  <EditableText editMode={editMode} multiline editKey={flagBody1Key} original={flagBody1Orig} value={globalEdits && globalEdits[flagBody1Key] && globalEdits[flagBody1Key].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Cody flag body")} />
                </p>
                <p>
                  <EditableText editMode={editMode} multiline editKey={flagBody2Key} original={flagBody2Orig} value={globalEdits && globalEdits[flagBody2Key] && globalEdits[flagBody2Key].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Cody flag follow-up")} />
                </p>
              </>;
            })()}
            <div className="suggest" style={{ marginTop: 10 }}>
              <button className="chip">Yes, break it down</button>
              <button className="chip">Show comps</button>
              <button className="chip">Mark as final</button>
            </div>
          </CodyMessage>
        </div>

        {/* FLAGGED LINE ITEMS — editable, surfaced above the divisions table */}
        <div className="card no-pad flagged-section" style={{ marginTop: 16 }}>
          <div className="card-h flagged-section-head">
            <span className="flagged-pill"><Icon name="flag" size={12} />Flagged</span>
            <h3>Flagged line items · {items.length} need review</h3>
          </div>
          <table className="bc-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Div</th>
                <th>Line item</th>
                <th className="num">Qty</th>
                <th className="num">Unit</th>
                <th className="num">Unit cost</th>
                <th className="num">Total</th>
                <th>Drawing Ref</th>
                <th className="center">Conf.</th>
                <th className="center" style={{ width: 90 }}>{editMode ? "Action" : ""}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => {
                const e = edits[it.id] || {};
                const qty = e.qty != null ? e.qty : it.qty;
                const uc = e.unitCost != null ? e.unitCost : it.unitCost;
                const total = qty * uc;
                const isAccepted = accepted.has(it.id);
                return (
                  <tr key={it.id} className={editingCell && editingCell.id === it.id ? "editing" : ""}>
                    <td><span style={{ fontFamily: "var(--font-data)", fontWeight: 700, fontSize: 11, color: "var(--bc-muted)" }}>{it.div}</span></td>
                    <td>
                      <div className="item-title">{it.name} {it.flagged && <Icon name="flag" size={14} style={{ color: "var(--orange-500)", verticalAlign: "middle", marginLeft: 4 }} />}</div>
                      <div className="item-sku">{it.code}{it.note ? " · " + it.note : ""}</div>
                    </td>
                    <td className="num">
                      {editMode && editingCell && editingCell.id === it.id && editingCell.field === "qty"
                        ? <input className="cell-edit" autoFocus type="number" defaultValue={qty} onBlur={ev => saveCell(it.id, "qty", parseFloat(ev.target.value))} onKeyDown={ev => { if (ev.key === "Enter") saveCell(it.id, "qty", parseFloat(ev.target.value)); if (ev.key === "Escape") setEditingCell(null); }} />
                        : <span className={"cell-display " + (editMode ? "editable " : "") + (e.qty != null ? "edited" : "")}
                                onClick={() => editMode && setEditingCell({ id: it.id, field: "qty" })}>
                            {qty.toLocaleString()}
                          </span>
                      }
                    </td>
                    <td className="num"><span style={{ color: "var(--bc-muted)", fontSize: 11 }}>{it.unit}</span></td>
                    <td className="num">
                      {editMode && editingCell && editingCell.id === it.id && editingCell.field === "unitCost"
                        ? <input className="cell-edit" autoFocus type="number" step="0.01" defaultValue={uc} onBlur={ev => saveCell(it.id, "unitCost", parseFloat(ev.target.value))} onKeyDown={ev => { if (ev.key === "Enter") saveCell(it.id, "unitCost", parseFloat(ev.target.value)); if (ev.key === "Escape") setEditingCell(null); }} />
                        : <span className={"cell-display " + (editMode ? "editable " : "") + (e.unitCost != null ? "edited" : "")}
                                onClick={() => editMode && setEditingCell({ id: it.id, field: "unitCost" })}>
                            ${uc.toFixed(2)}
                          </span>
                      }
                    </td>
                    <td className="num"><b>${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b></td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {it.refs && it.refs.length > 0
                          ? it.refs.map(r => (
                              <span key={r} className="di-ref-chip" title={"Open " + r}
                                    onClick={(e) => { e.stopPropagation(); onOpenDrawing && onOpenDrawing(r); }}>
                                <Icon name="article" size={11} />{r}
                              </span>
                            ))
                          : <span style={{ fontSize: 10.5, color: "var(--bc-muted)", fontStyle: "italic" }}>—</span>
                        }
                      </div>
                    </td>
                    <td className="center"><span className={"conf " + it.conf}>{it.conf}</span></td>
                    <td className="center">
                      {editMode && (
                        isAccepted
                          ? <span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />Confirmed</span>
                          : <button className="btn-ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => setAccepted(s => new Set([...s, it.id]))}><Icon name="check" size={14} />Confirm</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* DIVISIONS — moved below the flagged table */}
        <div className="card no-pad" style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="card-h">
            <Icon name="bar_chart" style={{ color: "var(--orange-500)" }} />
            <h3>By CSI Division</h3>
            <div className="right">
              <div className="seg">
                <button
                  className={divSort.key === "amount" ? "active" : ""}
                  onClick={() => toggleDivSort("amount")}
                  title={"Sort by amount · " + (divSort.key === "amount" && divSort.direction === "asc" ? "lowest to highest" : "highest to lowest")}>
                  <Icon name="payments" size={13} />Amount
                  {divSort.key === "amount" && <Icon name={divSort.direction === "desc" ? "arrow_downward" : "arrow_upward"} size={12} />}
                </button>
                <button
                  className={divSort.key === "pct" ? "active" : ""}
                  onClick={() => toggleDivSort("pct")}
                  title={"Sort by percentage · " + (divSort.key === "pct" && divSort.direction === "asc" ? "lowest to highest" : "highest to lowest")}>
                  <Icon name="percent" size={13} />Percentage
                  {divSort.key === "pct" && <Icon name={divSort.direction === "desc" ? "arrow_downward" : "arrow_upward"} size={12} />}
                </button>
                <button
                  className={divSort.key === "div" ? "active" : ""}
                  onClick={() => toggleDivSort("div")}
                  title={"Sort by division number · " + (divSort.key === "div" && divSort.direction === "desc" ? "descending" : "ascending")}>
                  <Icon name="format_list_numbered" size={13} />Division
                  {divSort.key === "div" && <Icon name={divSort.direction === "asc" ? "arrow_upward" : "arrow_downward"} size={12} />}
                </button>
              </div>
              <button className="btn-ghost"><Icon name="download" size={14} />CSV</button>
            </div>
          </div>
          <div style={{ padding: "12px 22px 18px" }}>
            {sortedDivisions.map(d => {
              const isOpen = expandedDiv === d.code;
              const hasItems = d.items && d.items.length > 0;
              return (
                <React.Fragment key={d.code}>
                  <div
                    className={"div-row expandable " + (isOpen ? "open" : "")}
                    onClick={() => hasItems && setExpandedDiv(isOpen ? null : d.code)}
                  >
                    <Icon name="chevron_right" size={18} className="chev" />
                    <span className="num">{d.code}</span>
                    <span className="name">
                      <span>{d.name}{d.flagged && <span className="flag-pill"><Icon name="flag" size={9} />Flag</span>}</span>
                      <small>{d.desc}{hasItems ? " · " + d.items.length + " items" : ""}</small>
                    </span>
                    <span className="div-pct">{d.pct.toFixed(1)}%</span>
                    <span className="amt">{fullMoney(d.amount)}</span>
                  </div>
                  {isOpen && hasItems && (
                    <div className="div-detail">
                      {d.items.map((it, i) => (
                        <div key={i} className="div-detail-row">
                          <div className="di-name">
                            {it.name}
                            {it.flagged && <Icon name="flag" size={11} style={{ color: "var(--orange-500)", marginLeft: 6, verticalAlign: "middle" }} />}
                            {it.note && <small style={{ color: "var(--orange-500)", fontWeight: 600 }}>{it.note}</small>}
                          </div>
                          <span className="di-num">{it.qty.toLocaleString()} {it.unit}</span>
                          <span className="di-num">${it.unitCost.toFixed(2)}</span>
                          <span className="di-total">${it.total.toLocaleString()}</span>
                          <div className="di-refs">
                            {it.refs && it.refs.length > 0
                              ? it.refs.map(r => (
                                  <span key={r} className="di-ref-chip" title={"Open " + r}
                                        onClick={(e) => { e.stopPropagation(); onOpenDrawing && onOpenDrawing(r); }}>
                                    <Icon name="article" size={11} />{r}
                                  </span>
                                ))
                              : <span style={{ fontSize: 10.5, color: "var(--bc-muted)", fontStyle: "italic" }}>no sheet ref</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        </>}{/* end Overview tab */}

        {/* DETAILED ANALYSIS TAB */}
        {reportTab === "detailed" && (
          activeDivision ? (
            /* WRITEUP VIEW — accordion-style deep dive on the selected division */
            <div className="da-writeup" key={"writeup-" + activeDivision.code}>
              <button className="btn-ghost da-back" onClick={() => setSelectedDivision(null)}>
                <Icon name="arrow_back" size={14} />Back to divisions
              </button>

              <div className="da-writeup-h">
                <div className="da-writeup-code">{activeDivision.code}</div>
                <div className="da-writeup-title">
                  <h2>{activeDivision.name}</h2>
                  <div className="da-writeup-sub">{activeDivision.scope || activeDivision.desc}</div>
                </div>
                <div className="da-writeup-stats">
                  <div><div className="da-stat-label">Amount</div><div className="da-stat-value">{activeDivision.inScope ? fullMoney(activeDivision.amount) : "—"}</div></div>
                  <div><div className="da-stat-label">Share</div><div className="da-stat-value">{activeDivision.inScope ? activeDivision.pct.toFixed(1) + "%" : "—"}</div></div>
                </div>
              </div>

              {!activeDivision.inScope && (
                <div className="card" style={{ padding: 16, marginTop: 16, background: "rgba(39,38,53,0.04)", borderColor: "rgba(39,38,53,0.10)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Icon name="info" size={20} style={{ color: "var(--bc-muted)", marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--bc-strong)", marginBottom: 4 }}>Not in scope for this estimate</div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--bc-muted)" }}>
                        Cody reviewed the indexed drawing set and specifications and didn't find scope items that fall under Division {activeDivision.code} — {activeDivision.name}. {activeDivision.scope} If this is unexpected, add the relevant documents and re-run the estimate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeDivision.inScope && (() => {
                const items = activeDivision.items || [];
                const itemsTotal = items.reduce((a, it) => a + it.total, 0);
                const sections = [
                  { id: "summary", icon: "summarize", label: "Executive summary", body: (
                    <>
                      <p>Division {activeDivision.code} represents <b>{activeDivision.pct.toFixed(1)}%</b> of the total project ROM, at <b>{fullMoney(activeDivision.amount)}</b>. Cody assembled this number by extracting quantities directly from the indexed sheets and applying current PDX metro labor rates plus material indices from the v2.4 reference set.</p>
                      <p>{activeDivision.flagged ? "This division is currently flagged — see the Risks & Flags section for what Cody surfaced." : "No outstanding flags on this division at the current revision."} Confidence on the underlying takeoff sits at <b>{Math.round(data.confidence * 100)}%</b>.</p>
                    </>
                  )},
                  { id: "methodology", icon: "tune", label: "Pricing methodology", body: (
                    <>
                      <p>Quantities for this division were extracted from the architectural set ({filesAnalyzed.length} indexed documents) and reconciled with the specification book. Unit costs come from Cody's PDX-metro rate database (v2.4), refreshed weekly from regional bid tabs.</p>
                      <p>Labor productivity assumes a standard 5-day work week with prevailing wage where applicable. Material indices reflect the most recent 30-day trailing average — Cody flags any line where the index has moved more than 10% in that window.</p>
                    </>
                  )},
                  { id: "takeoff", icon: "fact_check", label: "Quantity takeoff · " + items.length + " item" + (items.length === 1 ? "" : "s"), body: (
                    items.length > 0
                      ? (
                        <div className="da-takeoff">
                          {items.map((it, i) => (
                            <div key={i} className="da-takeoff-row">
                              <div className="da-takeoff-name">
                                {it.name}
                                {it.flagged && <Icon name="flag" size={11} style={{ color: "var(--orange-500)", marginLeft: 6, verticalAlign: "middle" }} />}
                                {it.note && <small style={{ color: "var(--orange-500)", fontWeight: 600 }}>{it.note}</small>}
                              </div>
                              <span className="di-num">{it.qty.toLocaleString()} {it.unit}</span>
                              <span className="di-num">${it.unitCost.toFixed(2)}</span>
                              <span className="di-total">${it.total.toLocaleString()}</span>
                              <div className="di-refs">
                                {it.refs && it.refs.length > 0
                                  ? it.refs.map(r => (
                                      <span key={r} className="di-ref-chip" title={"Open " + r}
                                            onClick={(e) => { e.stopPropagation(); onOpenDrawing && onOpenDrawing(r); }}>
                                        <Icon name="article" size={11} />{r}
                                      </span>
                                    ))
                                  : <span style={{ fontSize: 10.5, color: "var(--bc-muted)", fontStyle: "italic" }}>—</span>
                                }
                              </div>
                            </div>
                          ))}
                          <div className="da-takeoff-row da-takeoff-total">
                            <div className="da-takeoff-name"><b>Division subtotal</b></div>
                            <span></span><span></span>
                            <span className="di-total"><b>{fullMoney(itemsTotal)}</b></span>
                            <div></div>
                          </div>
                        </div>
                      )
                      : <p>Detailed takeoff items are not yet broken out at this revision. The division total ({fullMoney(activeDivision.amount)}) reflects a top-down allocation based on similar projects in the PNW benchmark set.</p>
                  )},
                  { id: "composition", icon: "donut_small", label: "Labor vs material composition", body: (
                    (() => {
                      const labor = Math.round(activeDivision.amount * 0.42);
                      const material = activeDivision.amount - labor;
                      return (
                        <>
                          <p>For Division {activeDivision.code}, Cody estimates the labor/material split based on the trade composition of the line items above and current PNW productivity benchmarks.</p>
                          <div className="da-split">
                            <div className="da-split-bar">
                              <div style={{ width: ((labor / activeDivision.amount) * 100) + "%", background: "#5047F3" }} />
                              <div style={{ width: ((material / activeDivision.amount) * 100) + "%", background: "#E84600" }} />
                            </div>
                            <div className="da-split-legend">
                              <span><span className="swatch" style={{ background: "#5047F3" }} />Labor · {fullMoney(labor)}</span>
                              <span><span className="swatch" style={{ background: "#E84600" }} />Materials · {fullMoney(material)}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()
                  )},
                  { id: "comps", icon: "compare", label: "Comparable projects", body: (
                    <>
                      <p>Cody benchmarked this division against <b>14 similar projects in the PNW</b> over the last 36 months. The closest comps:</p>
                      <ul style={{ margin: "8px 0 0 18px", padding: 0, fontSize: 13, color: "var(--bc-strong)", lineHeight: 1.6 }}>
                        <li>Beaverton Aquatic Center (2024) — Division {activeDivision.code} at {fullMoney(activeDivision.amount * 0.86)}, {(activeDivision.pct - 0.4).toFixed(1)}% of total</li>
                        <li>Tualatin Civic Pool (2023) — Division {activeDivision.code} at {fullMoney(activeDivision.amount * 1.04)}, {(activeDivision.pct + 0.2).toFixed(1)}% of total</li>
                        <li>Hillsboro Rec & Wellness (2022) — Division {activeDivision.code} at {fullMoney(activeDivision.amount * 0.95)}, {(activeDivision.pct - 0.1).toFixed(1)}% of total</li>
                      </ul>
                      <p style={{ marginTop: 10 }}>Cody's estimate for this project sits <b>within range</b> of the comp set, with {(activeDivision.pct - 0.1).toFixed(1)}% being typical for this building type.</p>
                    </>
                  )},
                  { id: "risks", icon: "warning", label: "Risks & flags", body: (
                    activeDivision.flagged
                      ? (
                        <>
                          <p><b>Cody flagged this division.</b> {activeDivision.code === "13" ? "The pool tank lump sum of $384k is tracking 18% above regional benchmarks for 25m × 8-lane competition pools. The closest comp is Beaverton Aquatic at $326k (2024). Recommend breaking the lump sum into trade lines for a tighter view." : activeDivision.code === "09" ? "Division 09 sits at 13.0% of the total — within typical range but Cody flagged the Shaw Haze carpet line item due to a recent county code update that effectively doubled transport cost, contributing a 22% line-level increase." : "Cody noted material-index volatility on this division. Recommend pinning the unit cost source before issuing for bid."}</p>
                          <p>Until the flag is resolved, Cody will keep the estimate's confidence index from rising above 91%.</p>
                        </>
                      )
                      : <p>No flags on this division at the current revision. Cody will continue to monitor as new sheets and specs are uploaded.</p>
                  )},
                  { id: "cited", icon: "menu_book", label: "Cited documents", body: (
                    <>
                      <p>Cody cited the following sheets and specs while assembling this division. Click any reference to open it in a tab.</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {(() => {
                          const allRefs = new Set();
                          items.forEach(it => (it.refs || []).forEach(r => allRefs.add(r)));
                          const arr = [...allRefs];
                          return arr.length > 0
                            ? arr.map(r => (
                                <span key={r} className="di-ref-chip" onClick={(e) => { e.stopPropagation(); onOpenDrawing && onOpenDrawing(r); }}>
                                  <Icon name="article" size={11} />{r}
                                </span>
                              ))
                            : <span style={{ fontSize: 12, color: "var(--bc-muted)", fontStyle: "italic" }}>No sheet references recorded for this division.</span>;
                        })()}
                      </div>
                    </>
                  )},
                ];
                return (
                  <div className="da-accordion">
                    {sections.map(s => {
                      const open = accordionOpen.has(s.id);
                      return (
                        <div key={s.id} className={"da-acc-item " + (open ? "open" : "")}>
                          <button className="da-acc-h" onClick={() => toggleAccordion(s.id)}>
                            <Icon name={s.icon} size={16} />
                            <span className="da-acc-label">{s.label}</span>
                            <Icon name="expand_more" size={18} className="da-acc-chev" />
                          </button>
                          {open && <div className="da-acc-body">{s.body}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* TILES GRID — all CSI divisions */
            <div className="da-tiles" key="tiles">
              <div className="card" style={{ padding: 18, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="analytics" size={20} style={{ color: "var(--raisin-800)", opacity: 0.65 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 4 }}>How this number was built</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--bc-strong)" }}>
                      Each CSI MasterFormat division is shown below. Click any tile for Cody's in-depth writeup — methodology, quantity takeoff, comparable projects, risks, and cited documents.
                    </p>
                    <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 11.5, color: "var(--bc-muted)", flexWrap: "wrap" }}>
                      <span><b style={{ color: "var(--bc-strong)" }}>Sum of divisions</b> · {fullMoney(data.divisions.reduce((a, d) => a + d.amount, 0))}</span>
                      <span><b style={{ color: "var(--bc-strong)" }}>+ Contingency ({(data.contingency * 100).toFixed(0)}%)</b> · {fullMoney(data.divisions.reduce((a, d) => a + d.amount, 0) * data.contingency)}</span>
                      <span><b style={{ color: "var(--tiffany-400)" }}>= Total project ROM</b> · {fullMoney(data.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="da-tile-grid">
                {csiWithAmounts.map(c => (
                  <button key={c.code} className={"da-tile " + (c.inScope ? "in-scope " : "out-of-scope ") + (c.flagged ? "flagged" : "")}
                          onClick={() => { setSelectedDivision(c.code); setAccordionOpen(new Set(["summary"])); }}>
                    <div className="da-tile-code">{c.code}</div>
                    <div className="da-tile-name">{c.name}</div>
                    <div className="da-tile-foot">
                      {c.inScope
                        ? <><span className="da-tile-amt">{fullMoney(c.amount)}</span><span className="da-tile-pct">{c.pct.toFixed(1)}%</span></>
                        : <span className="da-tile-empty">Not in scope</span>}
                    </div>
                    {c.flagged && <span className="da-tile-flag"><Icon name="flag" size={10} />Flag</span>}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {/* FILES ANALYZED TAB */}
        {reportTab === "files" && (
          <div style={{ marginTop: 14 }}>
            <div className="card no-pad">
              <div className="card-h">
                <Icon name="folder_open" style={{ color: "var(--orange-500)" }} />
                <h3>{filesAnalyzed.length} files analyzed</h3>
              </div>
              <table className="bc-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Category</th>
                    <th>Uploaded</th>
                    <th className="num">Size</th>
                    <th className="center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filesAnalyzed.map(f => (
                    <tr key={f.id}>
                      <td>
                        <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon name={f.ftype === "pdf" ? "picture_as_pdf" : f.ftype === "dwg" ? "architecture" : "description"} size={16} style={{ opacity: 0.65 }} />
                          {f.name}
                        </div>
                      </td>
                      <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.category}</span></td>
                      <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.uploaded}</span></td>
                      <td className="num"><span style={{ fontSize: 12, color: "var(--bc-muted)" }}>{f.size}</span></td>
                      <td className="center"><span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />Indexed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Donut chart
function Donut({ items, total }) {
  const r = 52, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(39,38,53,0.06)" strokeWidth="14" />
        {items.map((it, i) => {
          const len = (it.value / total) * c;
          const dash = `${len} ${c - len}`;
          const dashOff = -off;
          off += len;
          return <circle key={i} cx="65" cy="65" r={r} fill="none" stroke={it.color} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={dashOff} />;
        })}
      </svg>
      <div className="center">
        <div className="v">{formatMoney(total)}</div>
        <div className="l">Total</div>
      </div>
    </div>
  );
}

// =====================================================
// RFC — Kanban-style by priority + edit category
// =====================================================
function RFCScreen({ project, onAskAI, onOpenDrawing, projectSwitcher, pinnedSet, onPin, isLoading, loadProgress, onRerun, editMode, setEditMode, edits: globalEdits, recordEdit, revertEdits, editCount, onPushGlobal }) {
  // Seed each issue with a resolved flag — defaults to true for "No clarification needed".
  const initial = window.BC_DATA.rfc.issues.map(i => ({
    ...i,
    resolved: i.resolved != null ? i.resolved : i.category === "No clarification needed"
  }));
  const [issues, setIssues] = uS3(initial);
  const toggleResolved = (id) => setIssues(prev => prev.map(i => i.id === id ? { ...i, resolved: !i.resolved } : i));
  const [draggingId, setDraggingId] = uS3(null);
  const [overCol, setOverCol] = uS3(null);
  const [rfcTab, setRfcTab] = uS3("overview"); // overview | files
  const [editing, setEditing] = uS3(null); // issue being edited (or new working copy)

  const cols = [
    { id: "critical", label: "Critical" },
    { id: "med", label: "Medium" },
    { id: "low", label: "Low" },
    { id: "na", label: "N/A" }
  ];
  const categoryOptions = ["Missing Information", "Document Conflict", "Qualification", "No clarification needed"];

  const move = (id, prio) => setIssues(prev => prev.map(i => i.id === id ? { ...i, priority: prio } : i));

  // Auto-route "No clarification needed" to "na" priority
  const applyEdits = (patch) => {
    const next = { ...editing, ...patch };
    if (next.category === "No clarification needed") next.priority = "na";
    setEditing(next);
  };
  const saveEdit = () => {
    if (!editing) return;
    setIssues(prev => prev.map(i => i.id === editing.id ? { ...editing } : i));
    setEditing(null);
  };

  const filesAnalyzed = (window.BC_DATA.files || []).filter(f => f.indexed);

  if (isLoading) return (
    <div className="col-detail">
      <Taskbar crumbs={[{ label: "Projects" }, { useSwitcher: true }, { label: "Clarifications & Potential RFIs", bold: true }]} onAskAI={onAskAI} switcher={projectSwitcher} />
      <SkillLoadingShell projectName={project.name} title="Clarifications & Potential RFIs" progress={loadProgress} />
    </div>
  );

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Projects" }, { useSwitcher: true }, { label: "Clarifications & Potential RFIs", bold: true }]}
        actions={
          <>
            <PinButton pinId={"skill:" + project.id + "/rfc"} pinnedSet={pinnedSet} onPin={onPin} />
            <button className={"btn " + (editMode ? "btn-primary" : "")} onClick={() => setEditMode && setEditMode(!editMode)} style={editMode ? { background: "var(--orange-500)", color: "#fff", border: "none" } : {}}>
              <Icon name={editMode ? "check" : "edit"} size={16} />{editMode ? "Done editing" : "Edit mode"}
            </button>
            <button className="btn"><Icon name="email" size={16} />Draft RFI emails</button>
            <button className="btn"><Icon name="download" size={16} />Export</button>
          </>
        }
        onAskAI={onAskAI}
        switcher={projectSwitcher}
      />
      <div className="canvas">
        {editMode && <EditModeBar editCount={editCount} onRevert={revertEdits} onPushGlobal={onPushGlobal} onExit={() => setEditMode(false)} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 4 }}>{project.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 className="page-h1" style={{ marginBottom: 0 }}>
                <EditableText
                  editMode={editMode}
                  editKey={"rfc:" + project.id + ":title"}
                  original={"Clarifications & Potential RFIs"}
                  value={globalEdits && globalEdits["rfc:" + project.id + ":title"] && globalEdits["rfc:" + project.id + ":title"].value}
                  onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Report title")}
                />
              </h2>
              {onRerun && <button className="btn rerun-inline" onClick={onRerun}><Icon name="refresh" size={14} />Re-run skill</button>}
            </div>
            <p className="page-sub" style={{ marginTop: 4 }}>{issues.length} detected · Run finished 1h ago · Drag a card to change priority</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="badge b-high">{issues.filter(i => i.priority === "critical").length} critical</span>
            <span className="badge b-warn">{issues.filter(i => i.priority === "med").length} medium</span>
          </div>
        </div>

        {/* REPORT TABS */}
        <div className="report-tabs" style={{ marginBottom: 16 }}>
          <button className={"report-tab " + (rfcTab === "overview" ? "active" : "")} onClick={() => setRfcTab("overview")}>
            <Icon name="dashboard" size={14} />Overview
          </button>
          <button className={"report-tab " + (rfcTab === "files" ? "active" : "")} onClick={() => setRfcTab("files")}>
            <Icon name="folder_open" size={14} />Files Analyzed
            <span className="report-tab-count">{filesAnalyzed.length}</span>
          </button>
        </div>

        {rfcTab === "overview" && (() => {
          const totalCount = issues.length;
          const criticalCount = issues.filter(i => i.priority === "critical").length;
          const conflictsCount = issues.filter(i => i.category === "Document Conflict").length;
          const resolvedCount = issues.filter(i => i.resolved).length;
          return (
            <>
              <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18 }}>
                <div className="kpi">
                  <Icon className="bg" name="rule" />
                  <div className="label">
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:totalLbl"} original={"Total Clarifications"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:totalLbl"] && globalEdits["rfc:" + project.id + ":kpi:totalLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Total")} />
                  </div>
                  <div className="value">{totalCount}</div>
                  <div className="delta" style={{ color: "var(--bc-muted)" }}>
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:totalDelta"} original={"Detected by Cody · 28 docs scanned"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:totalDelta"] && globalEdits["rfc:" + project.id + ":kpi:totalDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Total")} />
                  </div>
                </div>
                <div className="kpi">
                  <Icon className="bg" name="priority_high" />
                  <div className="label">
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:critLbl"} original={"Critical"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:critLbl"] && globalEdits["rfc:" + project.id + ":kpi:critLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Critical")} />
                  </div>
                  <div className="value">{criticalCount}</div>
                  <div className="delta up"><Icon name="warning" size={14} />
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:critDelta"} original={"Need immediate action"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:critDelta"] && globalEdits["rfc:" + project.id + ":kpi:critDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Critical")} />
                  </div>
                </div>
                <div className="kpi">
                  <Icon className="bg" name="compare_arrows" />
                  <div className="label">
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:confLbl"} original={"Document Conflicts"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:confLbl"] && globalEdits["rfc:" + project.id + ":kpi:confLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Conflicts")} />
                  </div>
                  <div className="value">{conflictsCount}</div>
                  <div className="delta" style={{ color: "var(--bc-muted)" }}>
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:confDelta"} original={"Cross-doc inconsistencies"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:confDelta"] && globalEdits["rfc:" + project.id + ":kpi:confDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Conflicts")} />
                  </div>
                </div>
                <div className="kpi">
                  <Icon className="bg" name="check_circle" />
                  <div className="label">
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:resolvedLbl"} original={"Resolved"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:resolvedLbl"] && globalEdits["rfc:" + project.id + ":kpi:resolvedLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Resolved")} />
                  </div>
                  <div className="value">{resolvedCount}</div>
                  <div className="delta down"><Icon name="check" size={14} />
                    <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":kpi:resolvedDelta"} original={"Marked done by you or Cody"} value={globalEdits && globalEdits["rfc:" + project.id + ":kpi:resolvedDelta"] && globalEdits["rfc:" + project.id + ":kpi:resolvedDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Resolved")} />
                  </div>
                </div>
              </div>
              <div className="rfc-board" key="rfc-overview">
            {cols.map(c => {
              const list = issues
                .filter(i => i.priority === c.id)
                .sort((a, b) => (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0));
              return (
                <div key={c.id}
                     className="rfc-col"
                     data-prio={c.id}
                     style={overCol === c.id ? { background: "rgba(232,70,0,0.06)", outline: "1.5px dashed rgba(232,70,0,0.35)" } : {}}
                     onDragOver={e => { e.preventDefault(); setOverCol(c.id); }}
                     onDragLeave={() => setOverCol(null)}
                     onDrop={e => { e.preventDefault(); if (draggingId) move(draggingId, c.id); setDraggingId(null); setOverCol(null); }}>
                  <h4>{c.label}<span className="count">{list.length}</span></h4>
                  {list.map(i => (
                    <div key={i.id}
                         className={"rfc-card " + (i.resolved ? "is-resolved " : "") + (draggingId === i.id ? "dragging" : "")}
                         draggable
                         onDragStart={() => setDraggingId(i.id)}
                         onDragEnd={() => setDraggingId(null)}>
                      {i.resolved && (
                        <span className="rfc-resolved-pill"><Icon name="check_circle" size={11} />Resolved</span>
                      )}
                      <div className="rfc-card-head">
                        <span className="cat">{i.category}</span>
                        <span className="rfc-id">{i.id}</span>
                      </div>
                      <div className="title">
                        <EditableText editMode={editMode} editKey={"rfc:" + project.id + ":" + i.id + ":title"} original={i.title} value={globalEdits && globalEdits["rfc:" + project.id + ":" + i.id + ":title"] && globalEdits["rfc:" + project.id + ":" + i.id + ":title"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, i.id + " · Title")} />
                      </div>
                      <div className="desc">
                        <EditableText editMode={editMode} multiline editKey={"rfc:" + project.id + ":" + i.id + ":desc"} original={i.desc} value={globalEdits && globalEdits["rfc:" + project.id + ":" + i.id + ":desc"] && globalEdits["rfc:" + project.id + ":" + i.id + ":desc"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, i.id + " · Description")} />
                      </div>
                      <div className="footer-row">
                        <div className="rfc-refs">
                          {i.refs && i.refs.length > 0
                            ? i.refs.map(r => (
                                <span key={r} className="di-ref-chip" title={"Open " + r}
                                      onClick={(e) => { e.stopPropagation(); onOpenDrawing && onOpenDrawing(r); }}>
                                  <Icon name="article" size={11} />{r}
                                </span>
                              ))
                            : <span style={{ fontSize: 10.5, color: "var(--bc-muted)", fontStyle: "italic" }}>—</span>
                          }
                        </div>
                        <button className={"icon-btn rfc-resolve-btn " + (i.resolved ? "is-resolved" : "")}
                                title={i.resolved ? "Mark as open" : "Mark as resolved"}
                                onClick={(e) => { e.stopPropagation(); toggleResolved(i.id); }}>
                          <Icon name="check" size={14} />
                        </button>
                        <button className="icon-btn rfc-edit-btn" title="Edit clarification" onClick={(e) => { e.stopPropagation(); setEditing({ ...i }); }}>
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {list.length === 0 && <div style={{ fontSize: 11, color: "var(--bc-muted)", textAlign: "center", padding: 16 }}>Nothing in this lane</div>}
                </div>
              );
            })}
              </div>
            </>
          );
        })()}

        {rfcTab === "files" && (
          <div className="card no-pad" key="rfc-files">
            <div className="card-h">
              <Icon name="folder_open" style={{ color: "var(--orange-500)" }} />
              <h3>{filesAnalyzed.length} files analyzed</h3>
            </div>
            <table className="bc-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                  <th className="num">Size</th>
                  <th className="center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filesAnalyzed.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon name={f.ftype === "pdf" ? "picture_as_pdf" : f.ftype === "dwg" ? "architecture" : "description"} size={16} style={{ opacity: 0.65 }} />
                        {f.name}
                      </div>
                    </td>
                    <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.category}</span></td>
                    <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.uploaded}</span></td>
                    <td className="num"><span style={{ fontSize: 12, color: "var(--bc-muted)" }}>{f.size}</span></td>
                    <td className="center"><span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />Indexed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal-shell" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-h">
              <div>
                <div className="modal-eyebrow">Edit clarification</div>
                <h2>{editing.id}</h2>
              </div>
              <button className="modal-close" onClick={() => setEditing(null)}><Icon name="close" size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label>Title</label>
                <input type="text" value={editing.title} onChange={(e) => applyEdits({ title: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Description</label>
                <textarea rows="3" value={editing.desc} onChange={(e) => applyEdits({ desc: e.target.value })} />
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Category</label>
                  <select value={editing.category} onChange={(e) => applyEdits({ category: e.target.value })}>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>Priority {editing.category === "No clarification needed" && <span style={{ fontSize: 10, color: "var(--bc-muted)", fontWeight: 500 }}>· auto N/A</span>}</label>
                  <select value={editing.priority} onChange={(e) => applyEdits({ priority: e.target.value })} disabled={editing.category === "No clarification needed"}>
                    <option value="critical">Critical</option>
                    <option value="med">Medium</option>
                    <option value="low">Low</option>
                    <option value="na">N/A</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label>Sheet / spec references <span className="opt">comma-separated</span></label>
                <input type="text" value={(editing.refs || []).join(", ")} onChange={(e) => applyEdits({ refs: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div className="form-row">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 0 }}>
                  <input type="checkbox" checked={!!editing.resolved} onChange={(e) => applyEdits({ resolved: e.target.checked })} />
                  <span style={{ fontSize: 13, color: "var(--bc-strong)", fontWeight: 600 }}>Mark as resolved</span>
                  <span style={{ fontSize: 11, color: "var(--bc-muted)" }}>Removes from active queues</span>
                </label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit}><Icon name="check" size={16} />Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// BID LEVELING
// =====================================================
// Dropdown selector for switching between trades on Bid Level Analysis screens
function TradeDropdown({ trades, activeTradeId, setActiveTradeId, tradeOpen, setTradeOpen, tradeRef, activeTrade }) {
  if (!activeTrade) return null;
  return (
    <div className="trade-dd" ref={tradeRef}>
      <button className={"trade-trigger " + (tradeOpen ? "open" : "")} onClick={(e) => { e.stopPropagation(); setTradeOpen(o => !o); }}>
        <span className="trade-trigger-stack">
          <span className="trade-trigger-code">{activeTrade.division}</span>
          <b className="trade-trigger-name">{activeTrade.name}</b>
        </span>
        <span className="trade-trigger-meta">{activeTrade.subs.length} bids</span>
        <Icon name="expand_more" size={16} />
      </button>
      {tradeOpen && (
        <div className="trade-menu">
          {trades.map(t => (
            <button key={t.id}
                    className={"trade-menu-item " + (activeTradeId === t.id ? "active" : "")}
                    onClick={() => { setActiveTradeId(t.id); setTradeOpen(false); }}>
              <div className="trade-menu-info">
                <div className="trade-menu-code">{t.division}</div>
                <div className="trade-menu-name">{t.name}</div>
                <div className="trade-menu-meta">{t.subs.length} bids · {t.spread.toFixed(1)}% spread</div>
              </div>
              {activeTradeId === t.id && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BidLevelingScreen({ project, onAskAI, projectSwitcher, pinnedSet, onPin, isLoading, loadProgress, onRerun, editMode, setEditMode, edits: globalEdits, recordEdit, revertEdits, editCount, onPushGlobal }) {
  const data = window.BC_DATA.bidLeveling;
  const trades = data.trades || [];
  const [activeTradeId, setActiveTradeId] = uS3(trades[0] && trades[0].id);
  const [bidTab, setBidTab] = uS3("overview"); // overview | detailed | files
  const [tradeOpen, setTradeOpen] = uS3(false);
  const tradeRef = uR3(null);
  uE3(() => {
    if (!tradeOpen) return;
    const handler = (e) => { if (tradeRef.current && !tradeRef.current.contains(e.target)) setTradeOpen(false); };
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [tradeOpen]);
  const trade = trades.find(t => t.id === activeTradeId) || trades[0];

  if (!trade) return null;
  const totals = trade.subs.map((_, i) => trade.lineItems.reduce((acc, li) => acc + (li.values[i] || 0), 0));
  const winnerIdx = trade.subs.findIndex(s => s.recommended);
  const safeWinnerIdx = winnerIdx >= 0 ? winnerIdx : totals.indexOf(Math.min(...totals));
  const winningSub = trade.subs[safeWinnerIdx];
  const avgTotal = totals.reduce((a, b) => a + b, 0) / totals.length;
  const winningTotal = totals[safeWinnerIdx];

  // Overall stats across all trades
  const totalLineItems = trades.reduce((a, t) => a + t.lineItems.length, 0);
  const totalSubs = trades.reduce((a, t) => a + t.subs.length, 0);

  // Split line items by exclusion status (for the scope-breakdown table on Overview).
  const exclusionItems = trade.lineItems.filter(li => li.excluded && li.excluded.some(Boolean));
  const inclusionItems = trade.lineItems.filter(li => !li.excluded || !li.excluded.some(Boolean));
  const sumColumn = (rows, i) => rows.reduce((a, li) => a + ((li.excluded && li.excluded[i]) ? 0 : (li.values[i] || 0)), 0);
  const exclusionTotals = trade.subs.map((_, i) => sumColumn(exclusionItems, i));
  const inclusionTotals = trade.subs.map((_, i) => sumColumn(inclusionItems, i));

  const filesAnalyzed = (window.BC_DATA.files || []).filter(f => f.indexed);

  if (isLoading) return (
    <div className="col-detail">
      <Taskbar crumbs={[{ label: "Projects" }, { useSwitcher: true }, { label: "Bid Level Analysis", bold: true }]} onAskAI={onAskAI} switcher={projectSwitcher} />
      <SkillLoadingShell projectName={project.name} title="Bid Level Analysis" progress={loadProgress} />
    </div>
  );

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Projects" }, { useSwitcher: true }, { label: "Bid Level Analysis", bold: true }]}
        actions={<><PinButton pinId={"skill:" + project.id + "/bid"} pinnedSet={pinnedSet} onPin={onPin} /><button className={"btn " + (editMode ? "btn-primary" : "")} onClick={() => setEditMode && setEditMode(!editMode)} style={editMode ? { background: "var(--orange-500)", color: "#fff", border: "none" } : {}}><Icon name={editMode ? "check" : "edit"} size={16} />{editMode ? "Done editing" : "Edit mode"}</button><button className="btn"><Icon name="download" size={16} />Export</button></>}
        onAskAI={onAskAI}
        switcher={projectSwitcher}
      />
      <div className="canvas">
        {editMode && <EditModeBar editCount={editCount} onRevert={revertEdits} onPushGlobal={onPushGlobal} onExit={() => setEditMode(false)} />}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 4 }}>{project.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 className="page-h1" style={{ marginBottom: 0 }}>
              <EditableText
                editMode={editMode}
                editKey={"bid:" + project.id + ":title"}
                original={"Bid Level Analysis"}
                value={globalEdits && globalEdits["bid:" + project.id + ":title"] && globalEdits["bid:" + project.id + ":title"].value}
                onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Report title")}
              />
            </h2>
            {onRerun && <button className="btn rerun-inline" onClick={onRerun}><Icon name="refresh" size={14} />Re-run skill</button>}
          </div>
          <p className="page-sub" style={{ marginTop: 4 }}>{trades.length} trades leveled · {totalSubs} subcontractors · {totalLineItems} line items</p>
        </div>

        {/* REPORT TABS */}
        <div className="report-tabs" style={{ marginBottom: 16 }}>
          <button className={"report-tab " + (bidTab === "overview" ? "active" : "")} onClick={() => setBidTab("overview")}>
            <Icon name="dashboard" size={14} />Overview
          </button>
          <button className={"report-tab " + (bidTab === "detailed" ? "active" : "")} onClick={() => setBidTab("detailed")}>
            <Icon name="analytics" size={14} />Detailed Analysis
          </button>
          <button className={"report-tab " + (bidTab === "files" ? "active" : "")} onClick={() => setBidTab("files")}>
            <Icon name="folder_open" size={14} />Files Analyzed
            <span className="report-tab-count">{filesAnalyzed.length}</span>
          </button>
        </div>

      {bidTab === "overview" && <>
        <TradeDropdown
          trades={trades}
          activeTradeId={activeTradeId}
          setActiveTradeId={setActiveTradeId}
          tradeOpen={tradeOpen}
          setTradeOpen={setTradeOpen}
          tradeRef={tradeRef}
          activeTrade={trade}
        />

        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18 }}>
          <div className="kpi">
            <Icon className="bg" name="emoji_events" />
            <div className="label">
              <EditableText editMode={editMode} editKey={"bid:" + project.id + ":" + trade.id + ":recLbl"} original={"Recommended"} value={globalEdits && globalEdits["bid:" + project.id + ":" + trade.id + ":recLbl"] && globalEdits["bid:" + project.id + ":" + trade.id + ":recLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Recommended")} />
            </div>
            <div className="value" style={{ fontSize: 17, lineHeight: 1.2 }}>{winningSub.name}</div>
            <div className="delta down">
              <Icon name="check" size={14} />
              <EditableText
                editMode={editMode}
                editKey={"bid:" + project.id + ":" + trade.id + ":recNote"}
                original={trade.recommendedNote || "Cody's pick"}
                value={globalEdits && globalEdits["bid:" + project.id + ":" + trade.id + ":recNote"] && globalEdits["bid:" + project.id + ":" + trade.id + ":recNote"].value}
                onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Recommendation note")}
              />
            </div>
          </div>
          <div className="kpi">
            <Icon className="bg" name="payments" />
            <div className="label">
              <EditableText editMode={editMode} editKey={"bid:" + project.id + ":" + trade.id + ":awardLbl"} original={"Awarded value"} value={globalEdits && globalEdits["bid:" + project.id + ":" + trade.id + ":awardLbl"] && globalEdits["bid:" + project.id + ":" + trade.id + ":awardLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Awarded")} />
            </div>
            <div className="value">{fullMoney(winningTotal)}</div>
            <div className="delta down"><Icon name="trending_down" size={14} />−{fullMoney(avgTotal - winningTotal)} vs avg</div>
          </div>
          <div className="kpi">
            <Icon className="bg" name="speed" />
            <div className="label">
              <EditableText editMode={editMode} editKey={"bid:" + project.id + ":" + trade.id + ":spreadLbl"} original={"Spread"} value={globalEdits && globalEdits["bid:" + project.id + ":" + trade.id + ":spreadLbl"] && globalEdits["bid:" + project.id + ":" + trade.id + ":spreadLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Spread")} />
            </div>
            <div className="value">{trade.spread.toFixed(1)}%</div>
            <div className="delta" style={{ color: "var(--bc-muted)" }}>
              <EditableText editMode={editMode} editKey={"bid:" + project.id + ":" + trade.id + ":spreadDelta"} original={trade.spread < 12 ? "Tight — competitive" : "Wide — review scope"} value={globalEdits && globalEdits["bid:" + project.id + ":" + trade.id + ":spreadDelta"] && globalEdits["bid:" + project.id + ":" + trade.id + ":spreadDelta"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI note · Spread")} />
            </div>
          </div>
          <div className="kpi">
            <Icon className="bg" name="report_problem" />
            <div className="label">
              <EditableText editMode={editMode} editKey={"bid:" + project.id + ":" + trade.id + ":exclLbl"} original={"Exclusions"} value={globalEdits && globalEdits["bid:" + project.id + ":" + trade.id + ":exclLbl"] && globalEdits["bid:" + project.id + ":" + trade.id + ":exclLbl"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "KPI label · Exclusions")} />
            </div>
            <div className="value">{trade.exclusions}</div>
            <div className={"delta " + (trade.exclusions === 0 ? "" : "up")}>{trade.exclusions === 0 ? "All-inclusive bids" : <><Icon name="warning" size={14} />Review scope log</>}</div>
          </div>
        </div>

        <div className="card no-pad">
          <div className="card-h">
            <Icon name="compare_arrows" style={{ color: "var(--orange-500)" }} />
            <h3>{trade.division} — {trade.name} · side-by-side</h3>
            <div className="right"><button className="btn-ghost"><Icon name="filter_list" size={14} />Show only differences</button></div>
          </div>
          <table className="bid-table">
            <thead>
              <tr>
                <th className="sub" style={{ width: "36%" }}>Subcontractor name</th>
                {trade.subs.map((s, i) => (
                  <th key={s.id} className="sub" style={{ verticalAlign: "bottom", background: i === safeWinnerIdx ? "rgba(72,193,181,0.10)" : undefined }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minHeight: 68 }}>
                      {i === safeWinnerIdx && (
                        <span className="badge b-done" style={{ fontSize: 9, marginBottom: 8 }}>
                          <Icon name="check" size={10} />Cody's pick
                        </span>
                      )}
                      <div style={{ marginTop: "auto", textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--bc-strong)" }}>{s.name}</div>
                        <div style={{ fontWeight: 400, color: "var(--bc-muted)", fontSize: 11, marginTop: 2 }}>{s.contact}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trade.lineItems.map((li, idx) => (
                <tr key={idx}>
                  <td className="label">{li.name}{li.note && <small>{li.note}</small>}</td>
                  {li.values.map((v, i) => (
                    <td key={i} className={(i === safeWinnerIdx ? "winner " : "") + (li.excluded && li.excluded[i] ? "out" : "")}>
                      {li.excluded && li.excluded[i] ? "Excluded" : "$" + v.toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(39,38,53,0.10)" }}>
                <td className="label" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14 }}>Total bid</td>
                {totals.map((t, i) => (
                  <td key={i} className={i === safeWinnerIdx ? "winner" : ""} style={{ fontWeight: 800, fontSize: 14, fontFamily: "var(--font-display)" }}>
                    ${t.toLocaleString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ITEMIZED SCOPE BREAKDOWN — same layout as main table, split into Exclusions + Inclusions, with subtotals and a grand total */}
        <div className="card no-pad" style={{ marginTop: 16 }}>
          <div className="card-h">
            <Icon name="fact_check" style={{ color: "var(--orange-500)" }} />
            <h3>Scope breakdown · Exclusions and inclusions</h3>
            <div className="right">
              <span style={{ fontSize: 11, color: "var(--bc-muted)" }}>{exclusionItems.length} exclusion{exclusionItems.length === 1 ? "" : "s"} · {inclusionItems.length} included item{inclusionItems.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <table className="bid-table">
            <thead>
              <tr>
                <th className="sub" style={{ width: "36%" }}>Subcontractor name</th>
                {trade.subs.map((s, i) => (
                  <th key={s.id} className="sub" style={{ verticalAlign: "bottom", background: i === safeWinnerIdx ? "rgba(72,193,181,0.10)" : undefined }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--bc-strong)", textAlign: "right" }}>{s.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exclusionItems.length > 0 && (
                <>
                  <tr className="bid-section-row bid-section-exclusions">
                    <td colSpan={trade.subs.length + 1}>
                      <Icon name="block" size={12} />Exclusions
                    </td>
                  </tr>
                  {exclusionItems.map((li, idx) => (
                    <tr key={"ex-" + idx}>
                      <td className="label">{li.name}{li.note && <small>{li.note}</small>}</td>
                      {li.values.map((v, i) => (
                        <td key={i} className={(i === safeWinnerIdx ? "winner " : "") + (li.excluded && li.excluded[i] ? "out" : "")}>
                          {li.excluded && li.excluded[i] ? "Excluded" : "$" + v.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bid-subtotal">
                    <td className="label">Exclusions subtotal</td>
                    {exclusionTotals.map((t, i) => (
                      <td key={i} className={i === safeWinnerIdx ? "winner" : ""}>${t.toLocaleString()}</td>
                    ))}
                  </tr>
                </>
              )}
              <tr className="bid-section-row bid-section-inclusions">
                <td colSpan={trade.subs.length + 1}>
                  <Icon name="check_circle" size={12} />Inclusions
                </td>
              </tr>
              {inclusionItems.map((li, idx) => (
                <tr key={"in-" + idx}>
                  <td className="label">{li.name}{li.note && <small>{li.note}</small>}</td>
                  {li.values.map((v, i) => (
                    <td key={i} className={i === safeWinnerIdx ? "winner" : ""}>${v.toLocaleString()}</td>
                  ))}
                </tr>
              ))}
              <tr className="bid-subtotal">
                <td className="label">Inclusions subtotal</td>
                {inclusionTotals.map((t, i) => (
                  <td key={i} className={i === safeWinnerIdx ? "winner" : ""}>${t.toLocaleString()}</td>
                ))}
              </tr>
              <tr style={{ borderTop: "2px solid rgba(39,38,53,0.10)" }}>
                <td className="label" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14 }}>Total bid</td>
                {totals.map((t, i) => (
                  <td key={i} className={i === safeWinnerIdx ? "winner" : ""} style={{ fontWeight: 800, fontSize: 14, fontFamily: "var(--font-display)" }}>
                    ${t.toLocaleString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </>}

      {bidTab === "detailed" && (
        <div className="da-tiles" key="bid-detailed">
          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="analytics" size={20} style={{ color: "var(--raisin-800)", opacity: 0.65 }} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 4 }}>
                  <EditableText editMode={editMode} editKey={"bid:" + project.id + ":howEyebrow"} original={"How Cody compared the bids"} value={globalEdits && globalEdits["bid:" + project.id + ":howEyebrow"] && globalEdits["bid:" + project.id + ":howEyebrow"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "How-Cody eyebrow")} />
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--bc-strong)" }}>
                  <EditableText editMode={editMode} multiline editKey={"bid:" + project.id + ":howBody"} original={"Cody normalized each bid against the project's leveled scope (per the indexed drawings + specs), flagged any exclusions or qualifications, and ranked subs by total leveled price weighted against historical performance on comparable awards. Below is each trade with a per-company breakdown."} value={globalEdits && globalEdits["bid:" + project.id + ":howBody"] && globalEdits["bid:" + project.id + ":howBody"].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "How-Cody narrative")} />
                </p>
              </div>
            </div>
          </div>

          {/* Trade selector — shared dropdown */}
          <TradeDropdown
            trades={trades}
            activeTradeId={activeTradeId}
            setActiveTradeId={setActiveTradeId}
            tradeOpen={tradeOpen}
            setTradeOpen={setTradeOpen}
            tradeRef={tradeRef}
            activeTrade={trade}
          />

          {/* Stats strip for the active trade — spread, range, etc. */}
          {(() => {
            const t = trade; // already-selected trade from outer scope
            const tTotals = totals;
            const tMin = Math.min(...tTotals);
            const tMax = Math.max(...tTotals);
            return (
              <div className="bid-trade-stats">
                <div className="bid-trade-stat"><div className="bid-trade-stat-l">Subs</div><div className="bid-trade-stat-v">{t.subs.length}</div></div>
                <div className="bid-trade-stat"><div className="bid-trade-stat-l">Spread</div><div className="bid-trade-stat-v">{t.spread.toFixed(1)}%</div></div>
                <div className="bid-trade-stat"><div className="bid-trade-stat-l">Low bid</div><div className="bid-trade-stat-v">{fullMoney(tMin)}</div></div>
                <div className="bid-trade-stat"><div className="bid-trade-stat-l">High bid</div><div className="bid-trade-stat-v">{fullMoney(tMax)}</div></div>
                <div className="bid-trade-stat"><div className="bid-trade-stat-l">Exclusions</div><div className="bid-trade-stat-v">{t.exclusions}</div></div>
              </div>
            );
          })()}

          {/* Active-trade per-sub breakdown cards (ranked low-to-high) */}
          {(() => {
            const t = trade;
            const tTotals = totals;
            const safeTWinIdx = safeWinnerIdx;
            const tWinner = winningSub;
            const tWinTotal = winningTotal;
            const tAvg = avgTotal;
            const ranked = t.subs
              .map((s, i) => ({ sub: s, idx: i, total: tTotals[i] }))
              .sort((a, b) => a.total - b.total);
            return (
              <div className="bid-trade-block" key={t.id}>
                {ranked.map(({ sub, idx, total }, rank) => {
                  const isWinner = idx === safeTWinIdx;
                  const variance = total - tWinTotal;
                  const exclusionsForSub = t.lineItems.filter(li => li.excluded && li.excluded[idx]).length;
                  const includedItems = t.lineItems.filter(li => !li.excluded || !li.excluded[idx]).length;
                  const allLineItems = t.lineItems.map((li, lineIdx) => ({
                    name: li.name,
                    value: li.values[idx],
                    excluded: !!(li.excluded && li.excluded[idx]),
                    note: li.note,
                    winnerValue: li.values[safeTWinIdx],
                    isWinnerOnThisRow: idx === safeTWinIdx,
                  }));

                  // Mock narrative — varies by rank/winner/exclusions
                  let narrative;
                  let narrativeText; // plain-text fallback used when editing
                  if (isWinner) {
                    narrative = (
                      <>
                        <b>{sub.name}</b> is Cody's recommendation for {t.name}. The leveled total of <b>{fullMoney(total)}</b> is <b>{fullMoney(tAvg - total)}</b> below the trade average and <b>{((tAvg - total) / tAvg * 100).toFixed(1)}%</b> tighter than the next-best bid. {t.recommendedNote}. {exclusionsForSub === 0 ? "Scope is fully inclusive — no carve-outs to negotiate." : `Note ${exclusionsForSub} exclusion${exclusionsForSub === 1 ? "" : "s"} below before awarding.`}
                      </>
                    );
                    narrativeText = `${sub.name} is Cody's recommendation for ${t.name}. The leveled total of ${fullMoney(total)} is ${fullMoney(tAvg - total)} below the trade average and ${((tAvg - total) / tAvg * 100).toFixed(1)}% tighter than the next-best bid. ${t.recommendedNote}. ${exclusionsForSub === 0 ? "Scope is fully inclusive — no carve-outs to negotiate." : `Note ${exclusionsForSub} exclusion${exclusionsForSub === 1 ? "" : "s"} below before awarding.`}`;
                  } else if (rank === 1) {
                    narrative = (
                      <>
                        <b>{sub.name}</b> came in second at <b>{fullMoney(total)}</b>, <b>{fullMoney(variance)}</b> above the recommended bid. Strong fallback if {tWinner.name} fails reference checks. {exclusionsForSub > 0 ? `Has ${exclusionsForSub} exclusion${exclusionsForSub === 1 ? "" : "s"} to reconcile.` : "All-inclusive scope."}
                      </>
                    );
                    narrativeText = `${sub.name} came in second at ${fullMoney(total)}, ${fullMoney(variance)} above the recommended bid. Strong fallback if ${tWinner.name} fails reference checks. ${exclusionsForSub > 0 ? `Has ${exclusionsForSub} exclusion${exclusionsForSub === 1 ? "" : "s"} to reconcile.` : "All-inclusive scope."}`;
                  } else if (total >= tAvg * 1.10) {
                    narrative = (
                      <>
                        <b>{sub.name}</b> bid <b>{fullMoney(total)}</b>, <b>{((total - tAvg) / tAvg * 100).toFixed(1)}%</b> above the trade average — flagged as a price outlier. Cody recommends pulling their assumptions log before disqualifying; if their scope is broader than the leveled set, the delta may be justified.
                      </>
                    );
                    narrativeText = `${sub.name} bid ${fullMoney(total)}, ${((total - tAvg) / tAvg * 100).toFixed(1)}% above the trade average — flagged as a price outlier. Cody recommends pulling their assumptions log before disqualifying; if their scope is broader than the leveled set, the delta may be justified.`;
                  } else {
                    narrative = (
                      <>
                        <b>{sub.name}</b> bid <b>{fullMoney(total)}</b>, within typical range of the leveled scope (+<b>{fullMoney(variance)}</b> vs the recommended bid). {exclusionsForSub > 0 ? `Carries ${exclusionsForSub} exclusion${exclusionsForSub === 1 ? "" : "s"} — review before negotiating.` : "Scope is consistent with the leveled set."}
                      </>
                    );
                    narrativeText = `${sub.name} bid ${fullMoney(total)}, within typical range of the leveled scope (+${fullMoney(variance)} vs the recommended bid). ${exclusionsForSub > 0 ? `Carries ${exclusionsForSub} exclusion${exclusionsForSub === 1 ? "" : "s"} — review before negotiating.` : "Scope is consistent with the leveled set."}`;
                  }
                  const narrativeKey = "bid:" + project.id + ":" + t.id + ":" + sub.id + ":narrative";

                  return (
                    <div key={sub.id} className={"sub-detail " + (isWinner ? "is-winner" : "")}>
                      <div className="sub-detail-h">
                        <div className="sub-detail-h-l">
                          <div className="sub-detail-rank">#{rank + 1}</div>
                          <div>
                            <div className="sub-detail-name">
                              {sub.name}
                              {isWinner && <span className="badge b-done" style={{ marginLeft: 8, fontSize: 9 }}><Icon name="check" size={10} />Cody's pick</span>}
                            </div>
                            <div className="sub-detail-contact">{sub.contact}</div>
                          </div>
                        </div>
                        <div className="sub-detail-h-r">
                          <div className="sub-detail-totals-l">Total bid</div>
                          <div className="sub-detail-totals-v">{fullMoney(total)}</div>
                          {!isWinner && <div className="sub-detail-variance">+{fullMoney(variance)} vs pick</div>}
                          {isWinner && <div className="sub-detail-variance is-savings">−{fullMoney(tAvg - total)} vs avg</div>}
                        </div>
                      </div>

                      <div className="sub-detail-stats">
                        <div className="sub-detail-stat"><div className="l">Rank</div><div className="v">{rank + 1} of {t.subs.length}</div></div>
                        <div className="sub-detail-stat"><div className="l">Included items</div><div className="v">{includedItems}</div></div>
                        <div className="sub-detail-stat"><div className="l">Exclusions</div><div className={"v " + (exclusionsForSub > 0 ? "is-warn" : "")}>{exclusionsForSub}</div></div>
                        <div className="sub-detail-stat"><div className="l">vs average</div><div className={"v " + (total < tAvg ? "is-good" : "")}>{total < tAvg ? "−" : "+"}{((total - tAvg) / tAvg * 100).toFixed(1)}%</div></div>
                      </div>

                      <p className="sub-detail-narrative">
                        {editMode
                          ? <EditableText editMode={editMode} multiline editKey={narrativeKey} original={narrativeText} value={globalEdits && globalEdits[narrativeKey] && globalEdits[narrativeKey].value} onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, sub.name + " · Narrative")} />
                          : (globalEdits && globalEdits[narrativeKey] && globalEdits[narrativeKey].value ? globalEdits[narrativeKey].value : narrative)
                        }
                      </p>

                      <div className="sub-detail-lines">
                        <div className="sub-detail-lines-h">Line item breakdown</div>
                        {allLineItems.map((it, i) => (
                          <div key={i} className={"sub-line " + (it.excluded ? "is-excluded" : "")}>
                            <span className="sub-line-name">
                              {it.name}
                              {it.note && <small>{it.note}</small>}
                            </span>
                            <span className="sub-line-value">
                              {it.excluded ? <em>Excluded</em> : "$" + it.value.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {bidTab === "files" && (
        <div className="card no-pad" key="bid-files">
          <div className="card-h">
            <Icon name="folder_open" style={{ color: "var(--orange-500)" }} />
            <h3>{filesAnalyzed.length} files analyzed</h3>
          </div>
          <table className="bc-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Category</th>
                <th>Uploaded</th>
                <th className="num">Size</th>
                <th className="center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filesAnalyzed.map(f => (
                <tr key={f.id}>
                  <td>
                    <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon name={f.ftype === "pdf" ? "picture_as_pdf" : f.ftype === "dwg" ? "architecture" : "description"} size={16} style={{ opacity: 0.65 }} />
                      {f.name}
                    </div>
                  </td>
                  <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.category}</span></td>
                  <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.uploaded}</span></td>
                  <td className="num"><span style={{ fontSize: 12, color: "var(--bc-muted)" }}>{f.size}</span></td>
                  <td className="center"><span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />Indexed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}

Object.assign(window, { SkillRunScreen, EstimationScreen, RFCScreen, BidLevelingScreen });
