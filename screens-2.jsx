// BuildCrew.AI — Project Home + Files screens
const { useState: uS2, useEffect: uE2, useRef: uR2 } = React;

// =====================================================
// PROJECT HOME (workspace overview when project opened)
// =====================================================
function ProjectHomeScreen({ project, onOpenTab, onOpenTabInNewTab, onAskAI, onOpenDrawing, projectSwitcher, pinnedSet, onPin, skillRuns, skillCompletions, onStartSkillRun, onStopSkillRun, onConfigureBid, onCtxMenu, editMode, setEditMode, edits, recordEdit, revertEdits, editCount, onPushGlobal }) {
  const drawings = window.BC_DATA.drawings || [];
  // Project Home sub-tabs: overview | files | bids | labor
  const [homeTab, setHomeTab] = uS2("overview");
  const [drawingSort, setDrawingSort] = uS2({ key: "plan", direction: "asc" });
  const toggleDrawingSort = (key) => {
    setDrawingSort(prev => prev.key === key
      ? { key, direction: prev.direction === "desc" ? "asc" : "desc" }
      : { key, direction: key === "plan" ? "asc" : "desc" }
    );
  };
  const [drawingTrade, setDrawingTrade] = uS2("All");

  // available trades, derived
  const trades = ["All", ...Array.from(new Set(drawings.map((d) => d.trade)))];

  const visibleDrawings = drawings.
  filter((d) => drawingTrade === "All" || d.trade === drawingTrade).
  slice().
  sort((a, b) => {
    const { key, direction } = drawingSort;
    if (key === "views") return direction === "desc" ? b.views - a.views : a.views - b.views;
    if (key === "recent") {
      const ai = drawings.indexOf(a), bi = drawings.indexOf(b);
      return direction === "desc" ? bi - ai : ai - bi;
    }
    return direction === "asc" ? a.planOrder - b.planOrder : b.planOrder - a.planOrder;
  });

  // Revisions — default to the latest (last in array). Per-project state, reset on project switch.
  const [revisions, setRevisions] = uS2(project.revisions || []);
  uE2(() => { setRevisions(project.revisions || []); }, [project.id]);
  const latest = revisions[revisions.length - 1];
  const [activeRevisionId, setActiveRevisionId] = uS2(latest ? latest.id : null);
  uE2(() => {
    const fresh = project.revisions || [];
    setActiveRevisionId(fresh.length ? fresh[fresh.length - 1].id : null);
  }, [project.id]);
  const activeRevision = revisions.find(r => r.id === activeRevisionId) || latest;
  const handleCreateRevision = () => {
    const nextNum = revisions.length + 1;
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newRev = {
      id: "rev-new-" + Date.now().toString(36),
      name: "Revision " + nextNum + " — New revision",
      date: dateStr,
      note: "Created just now"
    };
    setRevisions(prev => [...prev, newRev]);
    setActiveRevisionId(newRev.id);
    setRevOpen(false);
  };

  const [revOpen, setRevOpen] = uS2(false);
  const revRef = uR2(null);
  uE2(() => {
    if (!revOpen) return;
    const handler = (e) => { if (revRef.current && !revRef.current.contains(e.target)) setRevOpen(false); };
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [revOpen]);

  // Labor-rates upload prompt (dismissible) — per-project session state
  const [laborDismissed, setLaborDismissed] = uS2(false);
  const [laborFile, setLaborFile] = uS2(null);
  const [laborConfirmed, setLaborConfirmed] = uS2(false);
  const [laborDrag, setLaborDrag] = uS2(false);
  const laborInputRef = uR2(null);
  uE2(() => { setLaborDismissed(false); setLaborFile(null); setLaborConfirmed(false); }, [project.id]);
  const onLaborDrop = (e) => {
    e.preventDefault(); setLaborDrag(false);
    const dropped = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    setLaborFile({ name: (dropped && dropped.name) || "labor_rates_2026.csv", size: "14 KB" });
  };
  const onLaborPick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setLaborFile({ name: f.name, size: Math.max(1, Math.round(f.size / 1024)) + " KB" });
  };

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[
        { label: "Projects" },
        { useSwitcher: true, bold: true }]
        }
        actions={
        <>
            <PinButton pinId={project.id} pinnedSet={pinnedSet} onPin={onPin} />
            <ShareDropdown options={[
              { label: "Email", icon: "email", onClick: () => {} },
            ]} />
            <button className="btn-primary" onClick={() => onOpenTab("skills")}><Icon name="play_arrow" size={16} />Run a skill</button>
          </>
        }
        onAskAI={onAskAI}
        switcher={projectSwitcher} />
      
      <div className="canvas">
        {editMode && <EditModeBar editCount={editCount} onRevert={revertEdits} onPushGlobal={onPushGlobal} onExit={() => setEditMode(false)} />}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          {/* LEFT — heading text (kind eyebrow · project name · address/stage) */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 8 }}>{project.kind}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h2 className="page-h1" style={{ fontSize: 30, margin: 0 }}>
                <EditableText
                  editMode={editMode}
                  editKey={"project:" + project.id + ":name"}
                  original={project.name}
                  value={edits && edits["project:" + project.id + ":name"] && edits["project:" + project.id + ":name"].value}
                  onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Project name")}
                />
              </h2>
              {project.scope &&
              <div className="scope-tip" tabIndex="0">
                  <Icon name="info" size={18} style={{ color: "#007BA7", cursor: "help" }} />
                  <div className="scope-pop">
                    <div className="scope-pop-h">
                      <CodyMark size={14} />
                      <span>Project scope</span>
                      <button className="scope-edit-btn" onClick={(e) => {e.stopPropagation();onAskAI && onAskAI();}}><Icon name="edit" size={11} />Edit</button>
                    </div>
                    <p>{project.scope}</p>
                    <div className="scope-source">Generated from 14 documents · Cody · Apr 28</div>
                  </div>
                </div>
              }
            </div>
            <p className="page-sub" style={{ margin: 0 }}>
              <EditableText
                editMode={editMode}
                editKey={"project:" + project.id + ":address"}
                original={project.address}
                value={edits && edits["project:" + project.id + ":address"] && edits["project:" + project.id + ":address"].value}
                onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Address")}
              />
              {" · "}
              <EditableText
                editMode={editMode}
                editKey={"project:" + project.id + ":stage"}
                original={project.stage}
                value={edits && edits["project:" + project.id + ":stage"] && edits["project:" + project.id + ":stage"].value}
                onChange={(k, o, v) => recordEdit && recordEdit(k, o, v, "Stage")}
              />
            </p>
          </div>

          {/* RIGHT — status badge stacked above the revision selector, bottom-aligned with page-sub */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            {(project.status === "working" || project.status === "done") && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {project.status === "working" && <span className="badge b-working"><span className="dot" />{project.statusLabel}</span>}
                {project.status === "done" && <span className="badge b-done">{project.statusLabel}</span>}
              </div>
            )}
            {revisions.length > 0 && (
              <div className="rev-dd" ref={revRef}>
                <button className="rev-trigger" onClick={(e) => { e.stopPropagation(); setRevOpen(o => !o); }}>
                  <Icon name="history" size={14} />
                  <span className="rev-trigger-stack">
                    <b>{activeRevision ? activeRevision.name : "—"}</b>
                    {activeRevision && <span className="rev-trigger-date">{activeRevision.date}</span>}
                  </span>
                  <Icon name="expand_more" size={16} />
                </button>
                {revOpen && (
                  <div className="rev-menu">
                    {[...revisions].slice().reverse().map((r) => (
                      <button
                        key={r.id}
                        className={"rev-item " + (activeRevisionId === r.id ? "active" : "")}
                        onClick={() => { setActiveRevisionId(r.id); setRevOpen(false); }}>
                        <div className="rev-item-text">
                          <div className="rev-item-name">{r.name}</div>
                          <div className="rev-item-meta">
                            {r.date}
                            {r.id === latest.id && <span className="rev-latest">Latest</span>}
                          </div>
                        </div>
                        {activeRevisionId === r.id && <Icon name="check" size={14} />}
                      </button>
                    ))}
                    <div className="rev-menu-divider" />
                    <button className="rev-item rev-item-create" onClick={handleCreateRevision}>
                      <Icon name="add" size={14} />
                      <div className="rev-item-text">
                        <div className="rev-item-name">Create new revision</div>
                        <div className="rev-item-meta">Snapshot the current project state</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PROJECT HOME SUB-TABS */}
        <div className="report-tabs" style={{ marginBottom: 4 }}>
          <button className={"report-tab " + (homeTab === "overview" ? "active" : "")} onClick={() => setHomeTab("overview")}>
            <Icon name="dashboard" size={14} />Overview
          </button>
          <button className={"report-tab " + (homeTab === "files" ? "active" : "")} onClick={() => setHomeTab("files")}>
            <Icon name="folder_copy" size={14} />Files
          </button>
          <button className={"report-tab " + (homeTab === "bids" ? "active" : "")} onClick={() => setHomeTab("bids")}>
            <Icon name="gavel" size={14} />Bid Tracker
          </button>
          <button className={"report-tab " + (homeTab === "labor" ? "active" : "")} onClick={() => setHomeTab("labor")}>
            <Icon name="engineering" size={14} />Labor Rates
          </button>
        </div>

        {homeTab === "files" && <ProjectFilesTab project={project} onOpenDrawing={onOpenDrawing} />}
        {homeTab === "bids" && <BidTrackerTab project={project} onOpenTab={onOpenTab} onOpenTabInNewTab={onOpenTabInNewTab} onCtxMenu={onCtxMenu} />}
        {homeTab === "labor" && <ProjectLaborTab project={project} />}

        {homeTab === "overview" && <>
        {/* CODY'S BRIEF — AI-generated, top of screen, dismissible.
            Hidden for newly created projects (no activity to summarize yet). */}
        {!project.isNew && (
        <div style={{ marginTop: 16 }}>
        <CodyMessage
          eyebrow="Cody's brief · since yesterday at 4:42 PM"
          title="Here's what's changed since you were last here"
          pillLabel="Walk me through it"
          onPill={onAskAI}
          items={[
          { kind: "platform", icon: "auto_awesome", title: "Estimation v3 created", body: <>I rebuilt the ROM after Sam uploaded <b>3 new mechanical sheets</b>. Total moved from $11.94M → <b>$12.21M</b> (+2.3%). Confidence rose to 91%.</>, when: "12 min ago" },
          { kind: "alert", icon: "warning", title: "Division 09 carpet jumped 22%", body: <>A recent county code update doubled transport on <b>Shaw Haze</b>. I've already swapped the line item — flag if you want to revert.</>, when: "1h ago" },
          { kind: "alert", icon: "rule", title: "Drawing conflict on Lobby 101", body: <>Ceiling height differs between <b>A-101 (12'-0")</b> and <b>A-301 (11'-0")</b>. Logged as RFC-014, blocking the lighting takeoff.</>, when: "2h ago" },
          { kind: "platform", icon: "upload_file", title: "3 drawings indexed", body: <>Sam uploaded M-201, M-202, M-203. I extracted <b>47 new takeoff items</b> and refreshed the mechanical sheet group.</>, when: "3h ago" },
          { kind: "alert", icon: "help_outline", title: "Pool deck slip resistance missing", body: <>09 65 00 needs a <b>DCOF target</b> before this section goes out. I drafted clarification language — review and send.</>, when: "Yesterday" }]
          } />
        </div>
        )}

        {/* LABOR RATES PROMPT — dismissible, drag/drop the whole card, blue theme */}
        {!laborDismissed && (
          <div
            className={"labor-prompt " + (laborDrag ? "drag" : "")}
            style={{ marginTop: 64 }}
            onClick={() => !laborFile && laborInputRef.current && laborInputRef.current.click()}
            onDragOver={(e) => { if (!laborFile) { e.preventDefault(); setLaborDrag(true); } }}
            onDragLeave={() => setLaborDrag(false)}
            onDrop={(e) => { if (!laborFile) onLaborDrop(e); }}>
            <button className="labor-prompt-dismiss" onClick={(e) => { e.stopPropagation(); setLaborDismissed(true); }} title="Dismiss">
              <Icon name="close" size={16} />
            </button>
            <input ref={laborInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={onLaborPick} />

            {!laborFile && !laborConfirmed && (
              <>
                <div className="labor-prompt-title"><Icon name="payments" size={18} />Add your project's labor rates</div>
                <p>
                  Adding your labor rates helps Cody produce more accurate estimates, schedules, and bid analyses for this project. Drop a CSV or XLSX with your trade rates and overhead burdens to get started.
                </p>
                <div className="labor-prompt-cta">
                  <Icon name="cloud_upload" size={20} />
                  <span>Drop a CSV or XLSX, or <b>click to browse</b></span>
                </div>
              </>
            )}

            {laborFile && !laborConfirmed && (
              <div className="labor-file-preview" onClick={(e) => e.stopPropagation()}>
                <div className="labor-file-row">
                  <Icon name="description" size={20} />
                  <div className="labor-file-info">
                    <div className="labor-file-name">{laborFile.name}</div>
                    <div className="labor-file-meta">{laborFile.size} · ready to import</div>
                  </div>
                </div>
                <div className="labor-file-actions">
                  <button className="btn" onClick={() => setLaborFile(null)}>Cancel</button>
                  <button className="btn-primary" onClick={() => { setLaborConfirmed(true); setTimeout(() => setLaborDismissed(true), 1500); }}>
                    <Icon name="check" size={14} />Confirm upload
                  </button>
                </div>
              </div>
            )}

            {laborConfirmed && (
              <div className="labor-file-confirmed">
                <Icon name="check_circle" size={20} style={{ color: "var(--tiffany-400)" }} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--bc-strong)" }}>Labor rates imported</div>
                  <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>Cody will use these on your next skill run.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RUN A SKILL — full-width 3-card row */}
        {/* QUICK GLANCE — KPI strip (heading-less) */}
        {(() => {
          // Bid file counts (for the Bid Level KPI populated state)
          const cfg = (window.BC_DATA && window.BC_DATA.bidConfig && window.BC_DATA.bidConfig[project.id]) || { trades: [], files: [] };
          const bidsSubmitted = (cfg.files || []).length;
          const tradesWithBids = new Set((cfg.files || []).map(f => f.tradeId)).size;

          // ROM delta — Tiffany Blue when the estimate moved up, red when it dropped.
          const romDeltaStr = "+2.3% vs v2";
          const romIsIncrease = romDeltaStr.trim().startsWith("-") ? false : true;
          const romDeltaColor = romIsIncrease ? "#48C1B5" : "#DC2626";

          // "Has this skill been run?" — true for any non-new project (seeded
          // data implies prior runs), or for new projects where the skill
          // completed during this session.
          const isNew = !!project.isNew;
          const ran = (skillId) => !isNew || !!(skillCompletions && skillCompletions[project.id + "/" + skillId]);
          const romRan = ran("estimation");
          const rfcRan = ran("rfc");
          const bidRan = ran("bid");

          // Mock numbers used when a skill ran for the first time on a new project
          const freshRomValue = "$3.20M";
          const freshRfcValue = 12;
          const freshRfcCritical = 2;

          // Props for a KPI that has data + should be clickable. Primary click
          // opens the results in a new tab (matches the open-in-new-tab hint).
          const clickableProps = (tab, skillLabel) => ({
            className: "kpi kpi-clickable",
            role: "button",
            tabIndex: 0,
            onClick: () => onOpenTabInNewTab && onOpenTabInNewTab(tab),
            onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenTabInNewTab && onOpenTabInNewTab(tab); } },
            onContextMenu: (e) => onCtxMenu && onCtxMenu([
              { label: "Open", icon: "open_in_browser", onClick: () => onOpenTab && onOpenTab(tab) },
              { label: "Open in new tab", icon: "tab", onClick: () => onOpenTabInNewTab && onOpenTabInNewTab(tab) },
            ], e),
            title: "Open " + skillLabel + " in a new tab",
          });
          const NewTabHint = () => (
            <span className="kpi-open-hint"><Icon name="open_in_new" size={15} /></span>
          );

          return (
            <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 64, marginBottom: 28 }}>
              {/* ROM ESTIMATE */}
              {romRan ? (
                <div {...clickableProps("estimation", "ROM Estimate")}>
                  <NewTabHint />
                  <Icon className="bg" name="payments" />
                  <div className="label">Latest ROM Estimate</div>
                  <div className="value">{isNew ? freshRomValue : project.estimate}</div>
                  {isNew
                    ? <div className="delta" style={{ color: "var(--tiffany-400)" }}><Icon name="check_circle" size={14} />ROM ready</div>
                    : <div className="delta" style={{ color: romDeltaColor }}><Icon name={romIsIncrease ? "trending_up" : "trending_down"} size={14} />{romDeltaStr}</div>
                  }
                </div>
              ) : (
                <div className="kpi">
                  <Icon className="bg" name="payments" />
                  <div className="label">Latest ROM Estimate</div>
                  <div className="value" style={{ color: "var(--bc-muted)" }}>—</div>
                </div>
              )}

              {/* OPEN CLARIFICATIONS */}
              {rfcRan ? (
                <div {...clickableProps("rfc", "Clarifications & Potential RFIs")}>
                  <NewTabHint />
                  <Icon className="bg" name="rule" />
                  <div className="label">Open clarifications</div>
                  <div className="value">{isNew ? freshRfcValue : "23"}</div>
                  <div className="delta up"><Icon name="warning" size={14} />{isNew ? freshRfcCritical : 3} critical</div>
                </div>
              ) : (
                <div className="kpi">
                  <Icon className="bg" name="rule" />
                  <div className="label">Open clarifications</div>
                  <div className="value" style={{ color: "var(--bc-muted)" }}>—</div>
                </div>
              )}

              {/* BIDS SUBMITTED */}
              {bidRan ? (
                <div {...clickableProps("bid", "Bid Level Analysis")}>
                  <NewTabHint />
                  <Icon className="bg" name="inventory" />
                  <div className="label">Bids Submitted</div>
                  <div className="value">{bidsSubmitted}</div>
                  <div className="delta" style={{ color: "var(--bc-muted)" }}>
                    {bidsSubmitted === 0
                      ? "No bids received yet"
                      : <>Across <b style={{ color: "var(--bc-strong)" }}>{tradesWithBids}</b> trade{tradesWithBids === 1 ? "" : "s"}</>}
                  </div>
                </div>
              ) : (
                <div className="kpi">
                  <Icon className="bg" name="inventory" />
                  <div className="label">Bids Submitted</div>
                  <div className="value" style={{ color: "var(--bc-muted)" }}>—</div>
                </div>
              )}

              {/* DOCUMENTS — always populated; not skill-linked */}
              <div className="kpi">
                <Icon className="bg" name="upload_file" />
                <div className="label">Documents</div>
                <div className="value">{project.files}</div>
                <div className="delta" style={{ color: "var(--bc-muted)" }}>
                  {isNew ? <>{project.files} just added</> : "3 added today"}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="section-h" style={{ marginTop: 64 }}><Icon name="bolt" size={16} style={{ color: "var(--orange-500)" }} /><h3>Run a skill</h3></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          {[
          { id: "estimation", title: "Rough Order of Magnitude (ROM) Estimate", icon: "calculate", desc: "Delivers end-to-end estimation capabilities, from initial quantity takeoffs through materials selection, labor calculations, and scheduling to produce comprehensive project estimates. Integrates all estimating phases into a single, cohesive workflow for maximum efficiency.", lastRun: null, success: false },
          { id: "rfc", title: "Clarifications & Potential RFIs", icon: "rule", desc: "Performs thorough document analysis across all project files, identifying inconsistencies, errors, and optimization opportunities. Creates detailed reports highlighting potential issues and improvements to enhance project quality and efficiency.", lastRun: null, success: false },
          { id: "bid", title: "Bid Level Analysis", icon: "compare_arrows", desc: "Compares contractor bids fairly by standardizing submissions, identifying missing or inconsistent scope items, and adjusting costs so every bid reflects an equivalent scope, ensuring award decisions are based on true value, not just the lowest number.", lastRun: null, success: false }].
          map((s) => {
            const runKey = project.id + "/" + s.id;
            const run = skillRuns && skillRuns[runKey];
            const running = !!run;
            const completion = skillCompletions && skillCompletions[runKey];
            const justCompleted = !!(completion && completion.justCompleted);
            const hasFreshCompletion = !!completion; // run finished during this session
            const progress = run ? run.progress : 0;
            const stage = progress < 25 ? "Reading project documents…"
              : progress < 55 ? "Extracting line items…"
              : progress < 85 ? "Applying rates & indices…"
              : "Finalizing report…";
            // Effective results state: hardcoded lastRun OR fresh completion this session
            const hasResults = hasFreshCompletion || !!s.lastRun;
            const effectiveLastRun = hasFreshCompletion ? "Just now" : s.lastRun;
            const effectiveSuccess = hasFreshCompletion ? true : s.success;
            const handleCardClick = () => {
              if (running) {
                onOpenTab(s.id); // loading version of results
              } else if (hasResults) {
                onOpenTab(s.id); // existing results
              } else if (s.id === "bid" && onConfigureBid) {
                // Bid Level Analysis requires a pre-run configuration step:
                // user picks which trades to run on and re-categorizes files
                // before the skill kicks off.
                onConfigureBid(project.id);
              } else {
                onStartSkillRun && onStartSkillRun(project.id, s.id);
              }
            };
            return (
              <div key={s.id}
                   className={"pin-card run-skill-card " + (running ? "is-running " : "") + (justCompleted ? "is-just-completed " : "") + (hasFreshCompletion && !justCompleted ? "is-completed" : "")}
                   style={{ minHeight: 140 }}
                   onClick={handleCardClick}>
                {running && (
                  <video
                    className="run-skill-video"
                    src="animated/skill-loading.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden="true"
                  />
                )}
                {running && <span className="run-skill-bar" style={{ width: progress + "%" }} />}
                {justCompleted && (
                  <div className="run-skill-celebration">
                    <Icon name="check_circle" size={56} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, alignItems: "center", position: "relative", zIndex: 1 }}>
                  <div className="run-skill-icon-wrap" style={{ width: 32, height: 32, borderRadius: 8, background: running ? "rgba(232,70,0,0.08)" : "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={s.icon} size={19} style={{ opacity: running ? 0.9 : 0.55, color: running ? "var(--orange-500)" : undefined }} />
                  </div>
                  <div className="pin-title" style={{ flex: 1, minWidth: 0 }}>{s.title}</div>
                  {running && (
                    <span style={{ fontFamily: "var(--font-data)", fontWeight: 700, fontSize: 13, color: "var(--raisin-800)", flexShrink: 0 }}>
                      {Math.round(progress)}%
                    </span>
                  )}
                </div>
                {running ? (
                  <>
                    <div style={{ fontSize: 12, color: "var(--bc-strong)", lineHeight: 1.4, position: "relative", zIndex: 1 }}>
                      <span className="run-skill-stage"><span className="dot" />{stage}</span>
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, position: "relative", zIndex: 1 }}>
                      <button className="run-skill-stop" onClick={(e) => { e.stopPropagation(); onStopSkillRun && onStopSkillRun(project.id, s.id); }} title="Stop run">
                        <Icon name="stop" size={14} />Stop
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: "var(--bc-muted)", lineHeight: 1.4 }}>{s.desc}</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: effectiveSuccess ? "var(--tiffany-400)" : "var(--orange-500)" }}>
                        {effectiveSuccess && <Icon name="check_circle" size={14} style={{ color: "var(--tiffany-400)" }} />}
                        <span>{hasResults ? "View results" : "Click to run"}</span>
                        {hasResults && <Icon name="arrow_forward" size={12} />}
                      </div>
                      {effectiveLastRun && (
                        <span style={{ fontSize: 11, color: "var(--bc-muted)", fontWeight: 500 }}>
                          Last run · {effectiveLastRun}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* RECENT SKILL RUNS — table only, no section heading. Scoped to this project. */}
        {(() => {
          const allRuns = (window.BC_DATA && window.BC_DATA.runs) || [];
          const projectRuns = allRuns
            .filter(r => r.projectId === project.id)
            .slice()
            .sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
          if (projectRuns.length === 0) return null;
          const skillIcon = (name) =>
            name === "Rough Order of Magnitude (ROM) Estimate" ? "calculate" :
            name === "Bid Level Analysis" ? "compare_arrows" :
            name === "Clarifications & Potential RFIs" ? "rule" :
            "auto_awesome";
          const skillToTab = (name) =>
            name === "Rough Order of Magnitude (ROM) Estimate" ? "estimation" :
            name === "Bid Level Analysis" ? "bid" :
            name === "Clarifications & Potential RFIs" ? "rfc" :
            null;
          return (
            <div className="card no-pad" style={{ marginBottom: 28 }}>
              <table className="bc-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Status</th>
                    <th>When</th>
                    <th>Duration</th>
                    <th className="num">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRuns.map(r => (
                    <tr key={r.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const tab = r.status === "done" ? skillToTab(r.skill) : null;
                          if (tab && onOpenTab) onOpenTab(tab);
                        }}>
                      <td>
                        <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon name={skillIcon(r.skill)} size={18} style={{ opacity: 0.55 }} />
                          </div>
                          {r.skill}
                        </div>
                      </td>
                      <td>
                        {r.status === "done"
                          ? <span className="badge b-done">Done</span>
                          : <span className="badge b-working"><span className="dot" />{Math.round((r.progress || 0) * 100)}%</span>
                        }
                      </td>
                      <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.when}</span></td>
                      <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.duration}</span></td>
                      <td className="num">
                        {r.ai && r.ai.total && <b>{r.ai.total}</b>}
                        {r.ai && r.ai.issues != null && <b>{r.ai.issues} issues</b>}
                        {r.ai && r.ai.savings && <b style={{ color: "var(--tiffany-400)" }}>−{r.ai.savings}</b>}
                        {!r.ai && "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* DRAWINGS */}
        <div className="section-h" style={{ marginTop: 64 }}>
          <Icon name="architecture" size={16} style={{ color: "var(--orange-500)" }} />
          <h3>Drawings</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, color: "var(--bc-muted)" }}>
            {visibleDrawings.length} of {drawings.length} sheets · {visibleDrawings.reduce((a, d) => a + d.markups, 0)} AI markups
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Trade filter — chip group */}
            <div className="chip-group">
              {trades.map((t) =>
              <button
                key={t}
                className={"chip " + (drawingTrade === t ? "active" : "")}
                onClick={() => setDrawingTrade(t)}>

                  {t}
                  {t !== "All" &&
                <span className="chip-count">{drawings.filter((d) => d.trade === t).length}</span>
                }
                </button>
              )}
            </div>
            {/* Sort segmented — click active to toggle direction */}
            <div className="seg">
              <button
                className={drawingSort.key === "plan" ? "active" : ""}
                onClick={() => toggleDrawingSort("plan")}
                title={"Plan order · " + (drawingSort.key === "plan" && drawingSort.direction === "desc" ? "last sheet first" : "first sheet first")}>
                <Icon name="format_list_numbered" size={13} />Plan order
                {drawingSort.key === "plan" && <Icon name={drawingSort.direction === "asc" ? "arrow_upward" : "arrow_downward"} size={12} />}
              </button>
              <button
                className={drawingSort.key === "recent" ? "active" : ""}
                onClick={() => toggleDrawingSort("recent")}
                title={"Added · " + (drawingSort.key === "recent" && drawingSort.direction === "asc" ? "oldest first" : "newest first")}>
                <Icon name="schedule" size={13} />Recently added
                {drawingSort.key === "recent" && <Icon name={drawingSort.direction === "desc" ? "arrow_downward" : "arrow_upward"} size={12} />}
              </button>
              <button
                className={drawingSort.key === "views" ? "active" : ""}
                onClick={() => toggleDrawingSort("views")}
                title={"Views · " + (drawingSort.key === "views" && drawingSort.direction === "asc" ? "least viewed first" : "most viewed first")}>
                <Icon name="visibility" size={13} />Most viewed
                {drawingSort.key === "views" && <Icon name={drawingSort.direction === "desc" ? "arrow_downward" : "arrow_upward"} size={12} />}
              </button>
            </div>
          </div>
        </div>
        <div className="drawings-strip" style={{ marginBottom: 24 }}>
          {visibleDrawings.map((d) =>
          <div key={d.id} className="drawing-card" onClick={() => onOpenDrawing ? onOpenDrawing(d.id) : onOpenTab("files")}>
              <div className="drawing-thumb">
                <DrawingThumb kind={d.thumb} color={d.color} markups={d.markups} />
                <div className="markup-pill"><Icon name="auto_awesome" size={11} />{d.markups}</div>
                {d.status === "flagged" && <div className="flag-pill-abs"><Icon name="flag" size={10} />Flagged</div>}
              </div>
              <div className="drawing-meta">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span className="code">{d.id}</span>
                  <span className="trade-tag">{d.trade}</span>
                </div>
                <span className="title">{d.title}</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: 2 }}>
                  <span className="scale">{d.scale}</span>
                  <span className="views"><Icon name="visibility" size={10} />{d.views}</span>
                </div>
              </div>
            </div>
          )}
          {visibleDrawings.length === 0 &&
          <div style={{ gridColumn: "1 / -1", padding: "32px 16px", textAlign: "center", color: "var(--bc-muted)", fontSize: 13, border: "1px dashed rgba(39,38,53,0.15)", borderRadius: 12 }}>
              No drawings tagged <b>{drawingTrade}</b>. <button className="btn-ghost" style={{ display: "inline-flex", marginLeft: 8 }} onClick={() => setDrawingTrade("All")}>Clear filter</button>
            </div>
          }
        </div>
        </>}

      </div>
    </div>);

}

// =====================================================
// PROJECT HOME — FILES TAB (content-only, scoped to the project)
// =====================================================
function ProjectFilesTab({ project, onOpenDrawing }) {
  const seeded = (window.BC_DATA && window.BC_DATA.filesByProject && window.BC_DATA.filesByProject[project.id]) || [];
  const revisions = project.revisions || [];

  // Pad with placeholder line items so the file list length matches the
  // Documents KPI count on the Project Home overview. Placeholders use
  // realistic construction-doc filenames and are distributed round-robin
  // across revisions so each one looks populated.
  const target = project.files || 0;
  const placeholderCount = Math.max(0, target - seeded.length);
  const placeholderPool = [
    { name: "A-103 — Roof plan.pdf", ftype: "pdf" },
    { name: "A-104 — Mezzanine plan.pdf", ftype: "pdf" },
    { name: "A-202 — Building elevations (west).pdf", ftype: "pdf" },
    { name: "A-203 — Building elevations (east).pdf", ftype: "pdf" },
    { name: "A-302 — Reflected ceiling plan.pdf", ftype: "pdf" },
    { name: "A-401 — Wall sections.pdf", ftype: "pdf" },
    { name: "A-402 — Stair sections.pdf", ftype: "pdf" },
    { name: "A-501 — Exterior details.pdf", ftype: "pdf" },
    { name: "A-502 — Interior details.pdf", ftype: "pdf" },
    { name: "A-601 — Door schedule.pdf", ftype: "pdf" },
    { name: "A-602 — Window schedule.pdf", ftype: "pdf" },
    { name: "A-603 — Finish schedule.pdf", ftype: "pdf" },
    { name: "A-701 — Toilet room details.pdf", ftype: "pdf" },
    { name: "A-702 — Millwork details.pdf", ftype: "pdf" },
    { name: "S-201 — Foundation details.pdf", ftype: "pdf" },
    { name: "S-301 — Level 2 framing.pdf", ftype: "pdf" },
    { name: "S-401 — Connection details.dwg", ftype: "dwg" },
    { name: "S-501 — Lateral system details.pdf", ftype: "pdf" },
    { name: "M-301 — HVAC details.pdf", ftype: "pdf" },
    { name: "M-501 — Equipment schedule.pdf", ftype: "pdf" },
    { name: "M-601 — HVAC controls schematic.pdf", ftype: "pdf" },
    { name: "E-201 — Lighting plan.pdf", ftype: "pdf" },
    { name: "E-301 — Panel schedule.pdf", ftype: "pdf" },
    { name: "E-401 — One-line diagram.pdf", ftype: "pdf" },
    { name: "E-501 — Riser diagram.pdf", ftype: "pdf" },
    { name: "P-201 — Plumbing fixture schedule.pdf", ftype: "pdf" },
    { name: "P-301 — Drainage diagram.pdf", ftype: "pdf" },
    { name: "FP-101 — Fire protection plan.pdf", ftype: "pdf" },
    { name: "FP-201 — Sprinkler details.pdf", ftype: "pdf" },
    { name: "C-101 — Site plan.pdf", ftype: "pdf" },
    { name: "C-201 — Grading plan.pdf", ftype: "pdf" },
    { name: "C-301 — Utility plan.pdf", ftype: "pdf" },
    { name: "L-101 — Landscape plan.pdf", ftype: "pdf" },
    { name: "ID-101 — Interior elevations.pdf", ftype: "pdf" },
    { name: "Spec — Div 03 Concrete.pdf", ftype: "pdf" },
    { name: "Spec — Div 05 Metals.pdf", ftype: "pdf" },
    { name: "Spec — Div 07 Thermal & Moisture.pdf", ftype: "pdf" },
    { name: "Spec — Div 11 Equipment.pdf", ftype: "pdf" },
    { name: "Spec — Div 22 Plumbing.pdf", ftype: "pdf" },
    { name: "Spec — Div 23 HVAC.pdf", ftype: "pdf" },
    { name: "Spec — Div 26 Electrical.pdf", ftype: "pdf" },
    { name: "Spec — Div 31 Earthwork.pdf", ftype: "pdf" },
    { name: "Spec — Div 32 Exterior improvements.pdf", ftype: "pdf" },
    { name: "Pre-bid meeting minutes.pdf", ftype: "pdf" },
    { name: "Subcontractor list.xlsx", ftype: "xlsx" },
    { name: "Cost estimate worksheet.xlsx", ftype: "xlsx" },
    { name: "RFI log.xlsx", ftype: "xlsx" },
    { name: "Submittal log.xlsx", ftype: "xlsx" },
    { name: "Project schedule.pdf", ftype: "pdf" },
    { name: "Addendum 01.pdf", ftype: "pdf" },
    { name: "Addendum 02.pdf", ftype: "pdf" },
    { name: "Code analysis.pdf", ftype: "pdf" },
    { name: "Environmental site assessment.pdf", ftype: "pdf" },
    { name: "Site photo — context view.jpg", ftype: "jpg" },
    { name: "Site photo — adjacent buildings.jpg", ftype: "jpg" },
    { name: "LEED scorecard.xlsx", ftype: "xlsx" },
    { name: "Sustainability narrative.docx", ftype: "docx" },
    { name: "Cost benchmark report.pdf", ftype: "pdf" },
  ];
  const sizes = ["1.4 MB", "2.1 MB", "3.6 MB", "4.8 MB", "2.9 MB", "5.2 MB", "1.8 MB", "3.2 MB", "6.4 MB", "412 KB", "2.4 MB", "1.1 MB"];
  const uploaders = ["Victor Mezhvinsky", "Sam Lee"];
  const seededNames = new Set(seeded.map(f => f.name));
  const available = placeholderPool.filter(p => !seededNames.has(p.name));
  const placeholders = [];
  for (let i = 0; i < placeholderCount && revisions.length > 0; i++) {
    const rev = revisions[i % revisions.length];
    const item = available[i % available.length] || { name: "Document " + (seeded.length + i + 1) + ".pdf", ftype: "pdf" };
    placeholders.push({
      id: project.id + "-placeholder-" + i,
      name: item.name,
      size: sizes[i % sizes.length],
      ftype: item.ftype,
      uploaded: rev.date || "—",
      uploadedBy: uploaders[i % uploaders.length],
      revisionId: rev.id,
      _placeholder: true,
    });
  }
  const fbp = [...seeded, ...placeholders];
  const ftypeIcon = (t) => {
    const tt = (t || "").toLowerCase();
    if (tt === "pdf") return { icon: "picture_as_pdf", tone: "pdf" };
    if (tt === "dwg" || tt === "dxf") return { icon: "architecture", tone: "dwg" };
    if (tt === "xlsx" || tt === "xls" || tt === "csv") return { icon: "table_view", tone: "sheet" };
    if (tt === "docx" || tt === "doc" || tt === "txt") return { icon: "description", tone: "doc" };
    if (tt === "jpg" || tt === "jpeg" || tt === "png" || tt === "image") return { icon: "image", tone: "image" };
    return { icon: "insert_drive_file", tone: "other" };
  };
  const initialExpanded = {};
  revisions.forEach((r, i) => { initialExpanded[r.id] = i >= revisions.length - 2; }); // open latest 2
  const [expanded, setExpanded] = uS2(initialExpanded);
  const toggleRev = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (fbp.length === 0) {
    return (
      <div style={{ marginTop: 24, border: "1px dashed rgba(39,38,53,0.15)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--bc-muted)" }}>
        <Icon name="folder_off" size={36} style={{ color: "rgba(39,38,53,0.30)" }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--raisin-800)", marginTop: 8 }}>No files uploaded yet</div>
        <div style={{ fontSize: 12.5, maxWidth: 360, margin: "8px auto 0", lineHeight: 1.5 }}>Drop plans, specs, and bid forms into this project and Cody will organize them by revision.</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>{fbp.length} files across {revisions.length} revision{revisions.length === 1 ? "" : "s"}</div>
        <button className="btn"><Icon name="upload" size={16} />Upload files</button>
      </div>
      <div className="files-tree">
        {revisions.map(r => {
          const revFiles = fbp.filter(f => f.revisionId === r.id);
          const open = !!expanded[r.id];
          return (
            <div key={r.id} className={"files-rev " + (open ? "is-open" : "")} style={{ marginBottom: 8 }}>
              <button className="files-rev-h" onClick={() => toggleRev(r.id)}>
                <Icon name={open ? "expand_more" : "chevron_right"} size={16} className="files-chev" />
                <Icon name="history" size={14} className="files-rev-icon" />
                <div className="files-rev-meta">
                  <div className="files-rev-name">{r.name}</div>
                  <div className="files-rev-sub">{r.date}{r.note ? " · " + r.note : ""}</div>
                </div>
                <span className="files-count-pill files-count-pill-sm">{revFiles.length}</span>
              </button>
              {open && (revFiles.length === 0 ? (
                <div className="files-empty files-empty-rev">No files in this revision.</div>
              ) : (
                <table className="bc-table files-table">
                  <thead><tr><th style={{ width: "46%" }}>Filename</th><th style={{ width: 80 }}>Type</th><th className="num" style={{ width: 90 }}>Size</th><th style={{ width: 150 }}>Uploaded</th><th style={{ width: 140 }}>By</th></tr></thead>
                  <tbody>
                    {revFiles.map(f => {
                      const ft = ftypeIcon(f.ftype);
                      const isDrawing = /^[A-Z]-\d{3}/.test(f.name);
                      return (
                        <tr key={f.id} style={isDrawing ? { cursor: "pointer" } : undefined}
                            onClick={isDrawing && onOpenDrawing ? () => { const m = f.name.match(/^([A-Z]-\d{3})/); if (m) onOpenDrawing(m[1], project.id); } : undefined}>
                          <td><div className="files-name-cell"><span className={"files-ftype-icon files-ftype-" + ft.tone}><Icon name={ft.icon} size={16} /></span><span className="item-title files-name-text">{f.name}</span></div></td>
                          <td><span className={"files-type-pill files-type-" + ft.tone}>{(f.ftype || "file").toUpperCase()}</span></td>
                          <td className="num">{f.size}</td>
                          <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-strong)" }}>{f.uploaded}</span></td>
                          <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.uploadedBy}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// PROJECT HOME — BID TRACKER TAB
// =====================================================
function BidTrackerTab({ project, onOpenTab, onOpenTabInNewTab, onCtxMenu }) {
  const sessions = (window.BC_DATA && window.BC_DATA.bidSessions && window.BC_DATA.bidSessions[project.id]) || [];

  if (sessions.length === 0) {
    return (
      <div style={{ marginTop: 24, border: "1px dashed rgba(39,38,53,0.15)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--bc-muted)" }}>
        <Icon name="gavel" size={36} style={{ color: "rgba(39,38,53,0.30)" }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--raisin-800)", marginTop: 8 }}>No bid sessions yet</div>
        <div style={{ fontSize: 12.5, maxWidth: 380, margin: "8px auto 0", lineHeight: 1.5 }}>Run the Bid Level Analysis skill to compare subcontractor bids. Each run will be logged here with its recommended winner.</div>
      </div>
    );
  }

  const open = (newTab) => (newTab ? onOpenTabInNewTab : onOpenTab) && (newTab ? onOpenTabInNewTab : onOpenTab)("bid");

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>{sessions.length} bid leveling session{sessions.length === 1 ? "" : "s"} run for this project</div>
      </div>
      <div className="card no-pad">
        <table className="bc-table">
          <thead>
            <tr>
              <th>Trade</th>
              <th>Recommended winner</th>
              <th className="num">Bids</th>
              <th className="num">Awarded</th>
              <th className="num">Savings</th>
              <th>Date Run</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{ cursor: "pointer" }}
                  onClick={() => onOpenTab && onOpenTab("bid")}
                  onContextMenu={(e) => onCtxMenu && onCtxMenu([
                    { label: "Open results", icon: "open_in_browser", onClick: () => onOpenTab && onOpenTab("bid") },
                    { label: "Open in new tab", icon: "tab", onClick: () => onOpenTabInNewTab && onOpenTabInNewTab("bid") },
                  ], e)}>
                <td>
                  <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="compare_arrows" size={18} style={{ opacity: 0.55 }} /></div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.trade}</div>
                      <div style={{ fontSize: 11.5, color: "var(--bc-muted)" }}>{s.division}</div>
                    </div>
                  </div>
                </td>
                <td><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontWeight: 600 }}>{s.winner}</span><span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />Pick</span></div></td>
                <td className="num">{s.subs}</td>
                <td className="num"><b>{s.amount}</b></td>
                <td className="num"><b style={{ color: "var(--tiffany-400)" }}>−{s.savings}</b></td>
                <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{s.date}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================
// PROJECT HOME — LABOR RATES TAB (project-scoped, overrides global)
// =====================================================
function ProjectLaborTab({ project }) {
  const globalRates = (window.BC_DATA && window.BC_DATA.laborRates) || [];
  const overrides = (window.BC_DATA && window.BC_DATA.laborRatesByProject && window.BC_DATA.laborRatesByProject[project.id]) || [];
  // Merge: project override row wins over the matching global trade row.
  const rows = globalRates.map(g => {
    const o = overrides.find(x => x.trade === g.trade);
    return o ? { ...g, ...o, overridden: true } : { ...g, overridden: false };
  });
  const overrideCount = rows.filter(r => r.overridden).length;

  const [drag, setDrag] = uS2(false);
  const inputRef = uR2(null);

  // Newly created projects: show only the upload zone (no table, no info note)
  if (project.isNew) {
    return (
      <div style={{ marginTop: 24 }}>
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} />
        <div
          className={"labor-prompt " + (drag ? "drag" : "")}
          style={{ marginTop: 0, padding: "48px 32px" }}
          onClick={() => inputRef.current && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); }}>
          <div className="labor-prompt-title"><Icon name="payments" size={18} />Upload project labor rates</div>
          <p>Drop a CSV or XLSX with your trade rates and overhead burdens to seed this project's rates. Until rates are uploaded, this project will use your global PDX metro rates.</p>
          <div className="labor-prompt-cta">
            <Icon name="cloud_upload" size={20} />
            <span>Drop a CSV or XLSX, or <b>click to browse</b></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      {/* Upload field — above the table */}
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} />
      <div
        className={"labor-prompt " + (drag ? "drag" : "")}
        style={{ marginTop: 0, marginBottom: 16, padding: "28px 24px" }}
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); }}>
        <div className="labor-prompt-title"><Icon name="payments" size={18} />Upload project labor rates</div>
        <p>Drop a CSV or XLSX with your trade rates and overhead burdens. Uploaded rates override the global rates for this project only.</p>
        <div className="labor-prompt-cta">
          <Icon name="cloud_upload" size={20} />
          <span>Drop a CSV or XLSX, or <b>click to browse</b></span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px" }}>
        <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>
          {rows.length} trades · {overrideCount > 0 ? <b style={{ color: "var(--orange-500)" }}>{overrideCount} project override{overrideCount === 1 ? "" : "s"}</b> : "inheriting global rates"}
        </div>
        <button className="btn"><Icon name="restart_alt" size={16} />Reset to global</button>
      </div>

      <div className="card no-pad">
        <table className="bc-table">
          <thead><tr><th>Trade</th><th className="num">Base rate</th><th className="num">Fringe</th><th className="num">Loaded rate</th><th>Source</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td><div className="item-title">{r.trade}</div></td>
                <td className="num"><span className="cell-display editable">${r.rate.toFixed(2)}</span></td>
                <td className="num"><span className="cell-display editable">{(r.fringe * 100).toFixed(0)}%</span></td>
                <td className="num"><b>${(r.rate * (1 + r.fringe)).toFixed(2)}</b></td>
                <td>
                  {r.overridden
                    ? <span className="badge b-info" style={{ background: "rgba(232,70,0,0.10)", color: "var(--orange-500)" }}>Project override</span>
                    : <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>Global · {r.region}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info note — below the table */}
      <div className="labor-prompt-title" style={{ marginTop: 16 }}>
        <Icon name="info" size={16} style={{ color: "#0074E8" }} />
        Project rates default to your global PDX metro rates. Any edits here override the global value for this project only.
      </div>
    </div>
  );
}

// =====================================================
// FILES UPLOADED — drag/drop with categorization
// =====================================================
function FilesScreen({ project, onAskAI, onOpenDrawing, projectSwitcher }) {
  const [files, setFiles] = uS2(window.BC_DATA.files);
  const [drag, setDrag] = uS2(false);
  const [categoryFilter, setCategoryFilter] = uS2("All");
  const [query, setQuery] = uS2("");

  const cats = [
  { id: "Drawings", label: "Drawings", icon: "architecture" },
  { id: "Specs", label: "Specs", icon: "list_alt" },
  { id: "Bid Forms", label: "Bid Forms", icon: "request_quote" },
  { id: "Supporting Docs", label: "Supporting Docs", icon: "folder_shared" }];


  const onDropZone = (e) => {
    e.preventDefault();setDrag(false);
    const samples = [
    { name: "A-401 — Reflected ceiling plan.pdf", category: "Drawings", confidence: "high", ftype: "pdf" },
    { name: "Bid form — Cascade Mechanical.pdf", category: "Bid Forms", confidence: "med", ftype: "pdf" }];

    samples.forEach((s, i) => {
      setTimeout(() => {
        setFiles((prev) => [
        { id: "n" + Date.now() + i, name: s.name, size: "2.1 MB", uploaded: "Just now · Victor Mezhvinsky", category: s.category, ftype: s.ftype, confidence: s.confidence, indexed: true, _new: true },
        ...prev]
        );
      }, i * 350);
    });
  };

  const setCategory = (id, target) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, category: target } : f));
  };

  const ftypeIcon = (t) => t === "pdf" ? "picture_as_pdf" : t === "image" ? "image" : t === "xlsx" ? "table_chart" : t === "dwg" ? "architecture" : "description";

  const visible = files.filter((f) =>
  (categoryFilter === "All" || f.category === categoryFilter) && (
  query === "" || f.name.toLowerCase().includes(query.toLowerCase()))
  );

  const openIfDrawing = (f) => {
    if (f.category !== "Drawings" || !onOpenDrawing) return;
    const m = f.name.match(/^([A-Z]-\d{3})/);
    if (m && window.BC_DATA.drawings.find((d) => d.id === m[1])) onOpenDrawing(m[1]);
  };

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Projects" }, { useSwitcher: true }, { label: "Files Uploaded", bold: true }]}
        actions={
        <button className="btn-primary"><Icon name="upload" size={16} />Upload files</button>
        }
        onAskAI={onAskAI}
        switcher={projectSwitcher} />
      
      <div className="canvas">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 className="page-h1">{files.length} files uploaded</h2>
          <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>Cody sorts new files automatically. Change category inline if anything's wrong.</div>
        </div>

        <div className={"upload-zone " + (drag ? "drag" : "")}
        onDragOver={(e) => {e.preventDefault();setDrag(true);}}
        onDragLeave={() => setDrag(false)}
        onDrop={onDropZone}>
          <Icon name="cloud_upload" size={40} />
          <b>Drop PDFs, DWGs, or images here</b>
          <span>Cody will categorize them automatically — you can change the category inline.</span>
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 12px", flexWrap: "wrap" }}>
          <div className="chip-group">
            <button className={"chip " + (categoryFilter === "All" ? "active" : "")} onClick={() => setCategoryFilter("All")}>
              All<span className="chip-count">{files.length}</span>
            </button>
            {cats.map((c) => {
              const n = files.filter((f) => f.category === c.id).length;
              return (
                <button key={c.id} className={"chip " + (categoryFilter === c.id ? "active" : "")} onClick={() => setCategoryFilter(c.id)}>
                  {c.label}<span className="chip-count">{n}</span>
                </button>);

            })}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--bc-muted)" }} />
            <input
              type="text"
              placeholder="Search files…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px", fontSize: 12,
                border: "1px solid rgba(39,38,53,0.14)", borderRadius: 8,
                background: "var(--bc-bg, #fff)", color: "var(--bc-strong)",
                width: 220, outline: "none", fontFamily: "inherit"
              }} />
            
          </div>
        </div>

        {/* Files table */}
        <div className="files-table-wrap">
          <table className="files-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}></th>
                <th>Name</th>
                <th style={{ width: 168 }}>Category</th>
                <th style={{ width: 88 }}>Confidence</th>
                <th style={{ width: 80 }}>Size</th>
                <th style={{ width: 200 }}>Uploaded</th>
                <th style={{ width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f) =>
              <tr key={f.id} className={f._new ? "ft-new" : ""}>
                  <td>
                    <div className="ft-ftype"><Icon name={ftypeIcon(f.ftype)} size={16} /></div>
                  </td>
                  <td>
                    <span
                    className={"ft-name " + (f.category === "Drawings" ? "linkable" : "")}
                    onClick={() => openIfDrawing(f)}>
                    {f.name}</span>
                  </td>
                  <td>
                    <select
                    className="ft-cat-select"
                    value={f.category}
                    onChange={(e) => setCategory(f.id, e.target.value)}>
                    
                      {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={"conf " + f.confidence}>{f.confidence === "high" ? "Sure" : f.confidence === "med" ? "Likely" : "Guess"}</span>
                  </td>
                  <td className="ft-meta">{f.size}</td>
                  <td className="ft-meta">{f.uploaded}</td>
                  <td>
                    <button className="ft-row-action" title="More"><Icon name="more_horiz" size={16} /></button>
                  </td>
                </tr>
              )}
              {visible.length === 0 &&
              <tr><td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "var(--bc-muted)", fontSize: 13 }}>
                  No files match.{query && <> <button className="btn-ghost" style={{ display: "inline-flex", marginLeft: 8 }} onClick={() => setQuery("")}>Clear search</button></>}
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}

Object.assign(window, { ProjectHomeScreen, FilesScreen });