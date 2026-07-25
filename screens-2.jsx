// BuildCrew.AI — Project Home + Files screens
const { useState: uS2, useEffect: uE2, useRef: uR2, useMemo: uM2 } = React;

// =====================================================
// FILE UPLOAD STATUS BADGE — shared between the Project Files tab and
// the Clipboard's recent files list so the language is consistent
// everywhere. Three states: uploaded (final, green), processing
// (indexing in progress, orange + pulsing dot), failed (red).
// =====================================================
function FileStatusBadge({ status }) {
  if (status === "processing") {
    return (
      <span className="file-status file-status-processing">
        <span className="dot" />Processing
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="file-status file-status-failed">
        <Icon name="error_outline" size={11} />Failed
      </span>
    );
  }
  return (
    <span className="file-status file-status-uploaded">
      <Icon name="check_circle" size={11} />Uploaded
    </span>
  );
}

// =====================================================
// PROJECT HOME (workspace overview when project opened)
// =====================================================
function ProjectHomeScreen({ project, onOpenTab, onOpenTabInNewTab, onAskAI, onOpenDrawing, projectSwitcher, pinnedSet, onPin, skillRuns, skillCompletions, onStartSkillRun, onStopSkillRun, onConfigureBid, onCtxMenu, editMode, setEditMode, edits, recordEdit, revertEdits, editCount, onPushGlobal, divisionFormat, divisionFormatOther, hasPendingEdits, onPushToMaster, onOpenNotifications, notificationCount }) {
  const drawings = window.BC_DATA.drawings || [];
  // Project Home sub-tabs: overview | files | takeoffs | drawings | labor | history
  const [homeTab, setHomeTab] = uS2("overview");

  // First-visit walkthrough for Project Home. Fires once per user via
  // localStorage — a project name is interpolated into step 1 so the
  // tooltip greets them by project.
  const PROJECT_HOME_TOUR_STEPS = [
    { id: "header", selector: ".col-detail .page-h1", placement: "below",
      title: "Welcome to Project Home",
      desc: "This is your command center for " + (project && project.name ? project.name : "this project") + " — everything Cody knows about it lives on the tabs below." },
    { id: "subtabs", selector: "[data-tour-id=\"project-subtabs\"]", placement: "below",
      title: "Six tabs organize this project",
      desc: "Overview (Cody's brief + recent activity), Files (uploads by revision), Takeoffs (structured quantities), Drawings (sheets + master floorplan overlays), Project Rates (labor + material rates), and Skills History (every run)." },
    { id: "cody", selector: "[data-tour-id=\"project-cody-brief\"]", placement: "below",
      title: "Cody's daily brief",
      desc: "At the top of every project, Cody surfaces what's changed since you were last here. Come back to this daily — it's the fastest way to catch up on team activity." },
    { id: "runskill", selector: "[data-tour-id=\"project-run-skill\"]", placement: "below",
      title: "Run a Skill on this project",
      desc: "Kick off any of the four Skills on this project from these cards. Results start as your private draft — Push to Master to make them visible to the team." },
    { id: "bell", selector: ".taskbar-notify-btn", placement: "left",
      title: "Notifications + the Clipboard",
      desc: "The bell shows who else is editing this project and what's waiting for approval. The Clipboard on the right is now scoped to this project — Skills, files, and activity all filtered to what matters here.",
      isFinal: true, finalLabel: "Got it", finalIcon: "check" },
  ];
  const [projectHomeTourActive, completeProjectHomeTour] = window.useFirstVisitTour
    ? window.useFirstVisitTour("bc_tour_seen_project_home", !!project && !project.isNew)
    : [false, () => {}];
  // Listen for cross-tree sub-tab requests (e.g. the Clipboard's "View
  // all skill runs" link, which sits in the right panel and can't reach
  // setHomeTab directly through React props).
  uE2(() => {
    const handler = (e) => {
      if (e && e.detail && typeof e.detail === "string") setHomeTab(e.detail);
    };
    window.addEventListener("bc-set-home-tab", handler);
    return () => window.removeEventListener("bc-set-home-tab", handler);
  }, []);

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
      name: "Revision " + nextNum + ": New revision",
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
        projectId={project.id}
        hasPending={!!(hasPendingEdits && (hasPendingEdits[project.id] || []).length)}
        onPushToMaster={onPushToMaster ? () => onPushToMaster(project.id) : undefined}
        onOpenNotifications={onOpenNotifications ? () => onOpenNotifications(project.id) : undefined}
        notificationCount={notificationCount}
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
                    <b>{activeRevision ? activeRevision.name : "N/A"}</b>
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
        <div className="report-tabs" style={{ marginBottom: 4 }} data-tour-id="project-subtabs">
          <button className={"report-tab " + (homeTab === "overview" ? "active" : "")} onClick={() => setHomeTab("overview")}>
            <Icon name="dashboard" size={14} />Overview
          </button>
          <button className={"report-tab " + (homeTab === "files" ? "active" : "")} onClick={() => setHomeTab("files")}>
            <Icon name="folder_copy" size={14} />Files
          </button>
          <button className={"report-tab " + (homeTab === "takeoffs" ? "active" : "")} onClick={() => setHomeTab("takeoffs")}>
            <Icon name="straighten" size={14} />Takeoffs
            <span className="report-tab-count">{(((window.BC_DATA && window.BC_DATA.takeoffsByProject) || {})[project.id] || []).length}</span>
          </button>
          <button className={"report-tab " + (homeTab === "drawings" ? "active" : "")} onClick={() => setHomeTab("drawings")}>
            <Icon name="architecture" size={14} />Drawings
            <span className="report-tab-count">{((window.BC_DATA && window.BC_DATA.drawings) || []).length}</span>
          </button>
          <button className={"report-tab " + (homeTab === "labor" ? "active" : "")} onClick={() => setHomeTab("labor")}>
            <Icon name="engineering" size={14} />Project Rates
          </button>
          <button className={"report-tab " + (homeTab === "history" ? "active" : "")} onClick={() => setHomeTab("history")}>
            <Icon name="history" size={14} />Skills History
            <span className="report-tab-count">{((window.BC_DATA && window.BC_DATA.runs) || []).filter(r => r.projectId === project.id).length}</span>
          </button>
        </div>

        {homeTab === "files" && <ProjectFilesTab project={project} onOpenDrawing={onOpenDrawing} />}
        {homeTab === "takeoffs" && <ProjectTakeoffsTab project={project} onOpenDrawing={onOpenDrawing} divisionFormat={divisionFormat} divisionFormatOther={divisionFormatOther} />}
        {homeTab === "drawings" && <ProjectDrawingsTab project={project} onOpenDrawing={onOpenDrawing} />}
        {homeTab === "labor" && <ProjectLaborTab project={project} />}
        {homeTab === "history" && <ProjectHistoryTab project={project} onOpenTab={onOpenTab} />}

        {homeTab === "overview" && <>
        {/* CODY'S BRIEF — AI-generated, top of screen, dismissible.
            Hidden for newly created projects (no activity to summarize yet). */}
        {!project.isNew && (
        <div style={{ marginTop: 16 }} data-tour-id="project-cody-brief">
        <CodyMessage
          eyebrow="Cody's brief · since yesterday at 4:42 PM"
          title="Here's what's changed since you were last here"
          pillLabel="Walk me through it"
          onPill={onAskAI}
          items={[
          { kind: "platform", icon: "auto_awesome", title: "Estimation v3 created", body: <>I rebuilt the ROM after Sam uploaded <b>3 new mechanical sheets</b>. Total moved from $11.94M → <b>$12.21M</b> (+2.3%). Confidence rose to 91%.</>, when: "12 min ago" },
          { kind: "alert", icon: "warning", title: "Division 09 carpet jumped 22%", body: <>A recent county code update doubled transport on <b>Shaw Haze</b>. I've already swapped the line item. Flag if you want to revert.</>, when: "1h ago" },
          { kind: "alert", icon: "rule", title: "Drawing conflict on Lobby 101", body: <>Ceiling height differs between <b>A-101 (12'-0")</b> and <b>A-301 (11'-0")</b>. Logged as RFC-014, blocking the lighting takeoff.</>, when: "2h ago" },
          { kind: "platform", icon: "upload_file", title: "3 drawings indexed", body: <>Sam uploaded M-201, M-202, M-203. I extracted <b>47 new takeoff items</b> and refreshed the mechanical sheet group.</>, when: "3h ago" },
          { kind: "alert", icon: "help_outline", title: "Pool deck slip resistance missing", body: <>09 65 00 needs a <b>DCOF target</b> before this section goes out. I drafted clarification language. Review and send.</>, when: "Yesterday" }]
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
                  <div className="value" style={{ color: "var(--bc-muted)" }}>N/A</div>
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
                  <div className="value" style={{ color: "var(--bc-muted)" }}>N/A</div>
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
                  <div className="value" style={{ color: "var(--bc-muted)" }}>N/A</div>
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
        <div data-tour-id="project-run-skill" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
          {[
          { id: "estimation", title: "Rough Order of Magnitude (ROM) Estimate", icon: "calculate", desc: "Delivers end-to-end estimation capabilities, from initial quantity takeoffs through materials selection, labor calculations, and scheduling to produce comprehensive project estimates. Integrates all estimating phases into a single, cohesive workflow for maximum efficiency.", lastRun: null, success: false },
          { id: "rfc", title: "Clarifications & Potential RFIs", icon: "rule", desc: "Performs thorough document analysis across all project files, identifying inconsistencies, errors, and optimization opportunities. Creates detailed reports highlighting potential issues and improvements to enhance project quality and efficiency.", lastRun: null, success: false },
          { id: "bid", title: "Bid Level Analysis", icon: "compare_arrows", desc: "Compares contractor bids fairly by standardizing submissions, identifying missing or inconsistent scope items, and adjusting costs so every bid reflects an equivalent scope, ensuring award decisions are based on true value, not just the lowest number.", lastRun: null, success: false },
          { id: "trades", title: "Trade Scoping", icon: "groups", desc: "Compiles every trade referenced across your uploaded documentation and drafts a scope of work for each, ready to attach to bid invitations. Feeds directly into the trade-invite workflow so bids go out the door faster.", lastRun: null, success: false }].
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

        {/* RECENT SKILL RUNS — approved runs only. Master-visible history
            for this project; the runner's own drafts show up on their
            Home screen instead. Capped at 5. */}
        {(() => {
          const allRuns = (window.BC_DATA && window.BC_DATA.runs) || [];
          const projectRuns = allRuns
            .filter(r => r.projectId === project.id)
            .filter(r => r.status !== "done" || r.approved !== false)   // hide unapproved drafts on Project Home
            .slice()
            .sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
          if (projectRuns.length === 0) return null;
          const visibleRuns = projectRuns.slice(0, 5);
          const hiddenCount = projectRuns.length - visibleRuns.length;
          const skillIcon = (name) =>
            name === "Rough Order of Magnitude (ROM) Estimate" ? "calculate" :
            name === "Bid Level Analysis" ? "compare_arrows" :
            name === "Clarifications & Potential RFIs" ? "rule" :
            name === "Trade Scoping" ? "groups" :
            "auto_awesome";
          const skillToTab = (name) =>
            name === "Rough Order of Magnitude (ROM) Estimate" ? "estimation" :
            name === "Bid Level Analysis" ? "bid" :
            name === "Clarifications & Potential RFIs" ? "rfc" :
            name === "Trade Scoping" ? "trades" :
            null;
          return (
            <div style={{ marginBottom: 28 }}>
              <div className="card no-pad">
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
                    {visibleRuns.map(r => {
                      const isBid = r.skill === "Bid Level Analysis" && r.ai && r.ai.winner;
                      return (
                        <tr key={r.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const tab = r.status === "done" ? skillToTab(r.skill) : null;
                              if (tab && onOpenTab) onOpenTab(tab);
                            }}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon name={skillIcon(r.skill)} size={18} style={{ opacity: 0.55 }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div className="item-title">{r.skill}</div>
                                {r.skill === "Bid Level Analysis" && r.ai && r.ai.division && (
                                  <div style={{ fontSize: 11, color: "var(--bc-muted)", marginTop: 2 }}>
                                    {r.ai.division}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {r.status === "done"
                              ? <span className="badge b-done"><Icon name="check_circle" size={11} />Approved</span>
                              : <span className="badge b-working"><span className="dot" />{Math.round((r.progress || 0) * 100)}%</span>
                            }
                          </td>
                          <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.when}</span></td>
                          <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.duration}</span></td>
                          <td className="num">
                            {isBid ? (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, lineHeight: 1.35 }}>
                                <b>{r.ai.winner}</b>
                                <span style={{ fontSize: 11.5, color: "var(--bc-muted)", fontWeight: 500 }}>
                                  {r.ai.bid} bid
                                  {r.ai.savings && <> · <b style={{ color: "var(--tiffany-400)" }}>−{r.ai.savings}</b></>}
                                </span>
                              </div>
                            ) : (
                              <>
                                {r.ai && r.ai.total && <b>{r.ai.total}</b>}
                                {r.ai && r.ai.issues != null && <b>{r.ai.issues} issues</b>}
                                {r.ai && r.ai.savings && !r.ai.winner && <b style={{ color: "var(--tiffany-400)" }}>−{r.ai.savings}</b>}
                                {!r.ai && "N/A"}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button className="link-btn" onClick={() => setHomeTab("history")}>
                  View Skills History
                  {hiddenCount > 0 && <span style={{ color: "var(--bc-muted)", fontWeight: 500, marginLeft: 4 }}>({hiddenCount} more)</span>}
                  <Icon name="arrow_forward" size={14} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* RECENTLY VISITED DRAWINGS — a quick-glance widget on the Overview.
            Top 6 most-viewed sheets stand in for true visit recency until
            we wire up a real lastVisitedAt timestamp. The full browseable
            list (with trade filters + sort) lives on the Drawings tab. */}
        <div className="section-h" style={{ marginTop: 64 }}>
          <Icon name="architecture" size={16} style={{ color: "var(--orange-500)" }} />
          <h3>Recently Visited Drawings</h3>
        </div>
        {(() => {
          const recentDrawings = drawings.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
          return (
            <>
              <div style={{ fontSize: 11, color: "var(--bc-muted)", marginBottom: 12 }}>
                {recentDrawings.length} of {drawings.length} sheets · {recentDrawings.reduce((a, d) => a + d.markups, 0)} AI markups
              </div>
              <div className="drawings-strip" style={{ marginBottom: 12 }}>
                {recentDrawings.map((d) =>
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
                {recentDrawings.length === 0 &&
                <div style={{ gridColumn: "1 / -1", padding: "32px 16px", textAlign: "center", color: "var(--bc-muted)", fontSize: 13, border: "1px dashed rgba(39,38,53,0.15)", borderRadius: 12 }}>
                  No drawings have been visited yet for this project.
                </div>
                }
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
                <button className="link-btn" onClick={() => setHomeTab("drawings")}>
                  View all drawings
                  {drawings.length > recentDrawings.length && <span style={{ color: "var(--bc-muted)", fontWeight: 500, marginLeft: 4 }}>({drawings.length - recentDrawings.length} more)</span>}
                  <Icon name="arrow_forward" size={14} />
                </button>
              </div>
            </>
          );
        })()}
        </>}

      </div>
      {projectHomeTourActive && window.CoachmarkTour && (
        <window.CoachmarkTour steps={PROJECT_HOME_TOUR_STEPS} onComplete={completeProjectHomeTour} />
      )}
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
    { name: "A-103 Roof plan.pdf", ftype: "pdf" },
    { name: "A-104 Mezzanine plan.pdf", ftype: "pdf" },
    { name: "A-202 Building elevations (west).pdf", ftype: "pdf" },
    { name: "A-203 Building elevations (east).pdf", ftype: "pdf" },
    { name: "A-302 Reflected ceiling plan.pdf", ftype: "pdf" },
    { name: "A-401 Wall sections.pdf", ftype: "pdf" },
    { name: "A-402 Stair sections.pdf", ftype: "pdf" },
    { name: "A-501 Exterior details.pdf", ftype: "pdf" },
    { name: "A-502 Interior details.pdf", ftype: "pdf" },
    { name: "A-601 Door schedule.pdf", ftype: "pdf" },
    { name: "A-602 Window schedule.pdf", ftype: "pdf" },
    { name: "A-603 Finish schedule.pdf", ftype: "pdf" },
    { name: "A-701 Toilet room details.pdf", ftype: "pdf" },
    { name: "A-702 Millwork details.pdf", ftype: "pdf" },
    { name: "S-201 Foundation details.pdf", ftype: "pdf" },
    { name: "S-301 Level 2 framing.pdf", ftype: "pdf" },
    { name: "S-401 Connection details.dwg", ftype: "dwg" },
    { name: "S-501 Lateral system details.pdf", ftype: "pdf" },
    { name: "M-301 HVAC details.pdf", ftype: "pdf" },
    { name: "M-501 Equipment schedule.pdf", ftype: "pdf" },
    { name: "M-601 HVAC controls schematic.pdf", ftype: "pdf" },
    { name: "E-201 Lighting plan.pdf", ftype: "pdf" },
    { name: "E-301 Panel schedule.pdf", ftype: "pdf" },
    { name: "E-401 One-line diagram.pdf", ftype: "pdf" },
    { name: "E-501 Riser diagram.pdf", ftype: "pdf" },
    { name: "P-201 Plumbing fixture schedule.pdf", ftype: "pdf" },
    { name: "P-301 Drainage diagram.pdf", ftype: "pdf" },
    { name: "FP-101 Fire protection plan.pdf", ftype: "pdf" },
    { name: "FP-201 Sprinkler details.pdf", ftype: "pdf" },
    { name: "C-101 Site plan.pdf", ftype: "pdf" },
    { name: "C-201 Grading plan.pdf", ftype: "pdf" },
    { name: "C-301 Utility plan.pdf", ftype: "pdf" },
    { name: "L-101 Landscape plan.pdf", ftype: "pdf" },
    { name: "ID-101 Interior elevations.pdf", ftype: "pdf" },
    { name: "Spec - Div 03 Concrete.pdf", ftype: "pdf" },
    { name: "Spec - Div 05 Metals.pdf", ftype: "pdf" },
    { name: "Spec - Div 07 Thermal & Moisture.pdf", ftype: "pdf" },
    { name: "Spec - Div 11 Equipment.pdf", ftype: "pdf" },
    { name: "Spec - Div 22 Plumbing.pdf", ftype: "pdf" },
    { name: "Spec - Div 23 HVAC.pdf", ftype: "pdf" },
    { name: "Spec - Div 26 Electrical.pdf", ftype: "pdf" },
    { name: "Spec - Div 31 Earthwork.pdf", ftype: "pdf" },
    { name: "Spec - Div 32 Exterior improvements.pdf", ftype: "pdf" },
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
    { name: "Site photo - context view.jpg", ftype: "jpg" },
    { name: "Site photo - adjacent buildings.jpg", ftype: "jpg" },
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
      uploaded: rev.date || "N/A",
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
                  <thead><tr><th style={{ width: "40%" }}>Filename</th><th style={{ width: 70 }}>Type</th><th className="num" style={{ width: 80 }}>Size</th><th style={{ width: 140 }}>Uploaded</th><th style={{ width: 130 }}>By</th><th style={{ width: 110 }}>Status</th></tr></thead>
                  <tbody>
                    {revFiles.map(f => {
                      const ft = ftypeIcon(f.ftype);
                      const isDrawing = /^[A-Z]-\d{3}/.test(f.name);
                      const status = f.status || "uploaded";
                      return (
                        <tr key={f.id} style={isDrawing ? { cursor: "pointer" } : undefined}
                            onClick={isDrawing && onOpenDrawing ? () => { const m = f.name.match(/^([A-Z]-\d{3})/); if (m) onOpenDrawing(m[1], project.id); } : undefined}>
                          <td><div className="files-name-cell"><span className={"files-ftype-icon files-ftype-" + ft.tone}><Icon name={ft.icon} size={16} /></span><span className="item-title files-name-text">{f.name}</span></div></td>
                          <td><span className={"files-type-pill files-type-" + ft.tone}>{(f.ftype || "file").toUpperCase()}</span></td>
                          <td className="num">{f.size}</td>
                          <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-strong)" }}>{f.uploaded}</span></td>
                          <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.uploadedBy}</span></td>
                          <td><FileStatusBadge status={status} /></td>
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
// =====================================================
// PROJECT HOME — DRAWINGS TAB
// List of every detected drawing sheet on the project. Each row shows a
// preview thumbnail, the sheet ID/title, how many items Cody took off
// the sheet, and the source PDF it was detected in. Click → opens the
// drawing viewer for that sheet.
// =====================================================
// =====================================================
// MASTER FLOORPLAN — layered trade overlay
// Renders a single architectural base plan with per-trade markups
// (structural columns, HVAC ducts, electrical fixtures, plumbing runs)
// as togglable SVG layers. Solves the coordination problem: subs can
// see how their scope overlaps with adjacent trades on the same sheet.
// =====================================================
function MasterFloorplan({ projectId }) {
  const TRADES = [
    { id: "struct", label: "Structural", color: "#48C1B5" },
    { id: "mech",   label: "Mechanical", color: "#FFBD15" },
    { id: "elec",   label: "Electrical", color: "#5047F3" },
    { id: "plumb",  label: "Plumbing",   color: "#00A3E0" },
  ];
  // Master sheets — every plan-view sheet in the project that has a
  // reconciled overlay available. Pulled from BC_DATA so real projects
  // can carry hundreds of sheets. Falls back to a minimal set so the
  // control still works if no data is present.
  const FALLBACK_SHEETS = [
    { id: "A-101", label: "Level 1 floor plan",    subtitle: "Aquatic center + lobby",   template: "L1" },
    { id: "A-102", label: "Level 2 floor plan",    subtitle: "Offices + fitness studios", template: "L2" },
    { id: "A-301", label: "RCP — Lobby",           subtitle: "Coffered ceiling grid",     template: "RCP" },
  ];
  const sheets = uM2(() => {
    const seeded = (window.BC_DATA && window.BC_DATA.masterSheetsByProject && projectId && window.BC_DATA.masterSheetsByProject[projectId]) || [];
    return seeded.length ? seeded : FALLBACK_SHEETS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const [activeSheetId, setActiveSheetId] = uS2((sheets[0] && sheets[0].id) || "");
  const [active, setActive] = uS2(new Set(TRADES.map(t => t.id))); // default: all on
  const [recentIds, setRecentIds] = uS2([]); // ordered most-recent first, capped at 4
  const [pickerOpen, setPickerOpen] = uS2(false);
  const [query, setQuery] = uS2("");
  const pickerRef = uR2(null);

  // Close the picker on outside click / Escape
  uE2(() => {
    if (!pickerOpen) return;
    const onDoc = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setPickerOpen(false); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  const isOn = (id) => active.has(id);
  const toggle = (id) => setActive(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const setAll = (on) => setActive(new Set(on ? TRADES.map(t => t.id) : []));
  const allOn = active.size === TRADES.length;
  const noneOn = active.size === 0;

  const activeSheetMeta = sheets.find(s => s.id === activeSheetId) || sheets[0];
  const activeTemplate = (activeSheetMeta && activeSheetMeta.template) || "L1";

  // Compose the sheet lists shown inside the picker.
  const recentSheets = recentIds.map(id => sheets.find(s => s.id === id)).filter(Boolean);
  const q = query.trim().toLowerCase();
  const filteredSheets = q
    ? sheets.filter(s => `${s.id} ${s.label} ${s.subtitle}`.toLowerCase().includes(q))
    : sheets;

  const selectSheet = (id) => {
    setActiveSheetId(id);
    setRecentIds(prev => {
      const next = [id, ...prev.filter(x => x !== id)];
      return next.slice(0, 4);
    });
    setPickerOpen(false);
    setQuery("");
  };

  return (
    <div className="masterplan-card">
      <div className="masterplan-h">
        <div>
          <div className="masterplan-eyebrow">Master Floorplan · Trade Overlays</div>
          <div className="masterplan-title">Layered view — {activeSheetMeta ? activeSheetMeta.label : "Sheet"}</div>
          <div className="masterplan-sub">
            Toggle any trade to see how its scope overlaps with the base architectural plan.
            Every sub is looking at the same sheet, so coordination issues surface before they hit the field.
          </div>
        </div>
      </div>

      {/* Sheet picker — dropdown scales to hundreds of sheets, with a
          live search and a "Recently visited" shortlist of the last four
          sheets the user opened. */}
      <div className="masterplan-picker" ref={pickerRef}>
        <button
          type="button"
          className={"masterplan-picker-trigger " + (pickerOpen ? "is-open" : "")}
          onClick={() => setPickerOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}>
          <span className="masterplan-picker-ref">{activeSheetMeta ? activeSheetMeta.id : "—"}</span>
          <span className="masterplan-picker-stack">
            <span className="masterplan-picker-name">{activeSheetMeta ? activeSheetMeta.label : "Select a sheet"}</span>
            <span className="masterplan-picker-sub">{activeSheetMeta ? activeSheetMeta.subtitle : ""}</span>
          </span>
          <span className="masterplan-picker-meta">{sheets.length} sheets</span>
          <Icon name="expand_more" size={18} />
        </button>
        {pickerOpen && (
          <div className="masterplan-picker-menu" role="listbox">
            <div className="masterplan-picker-search">
              <Icon name="search" size={14} />
              <input
                type="text"
                autoFocus
                placeholder="Search sheets by number, name, or area…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="masterplan-picker-clear" onClick={() => setQuery("")} title="Clear search">
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <div className="masterplan-picker-scroll">
              {!q && recentSheets.length > 0 && (
                <div className="masterplan-picker-section">
                  <div className="masterplan-picker-label">
                    <Icon name="schedule" size={11} />Recently visited
                  </div>
                  {recentSheets.map(s => (
                    <button key={"rec-" + s.id}
                            type="button"
                            role="option"
                            aria-selected={s.id === activeSheetId}
                            className={"masterplan-picker-item " + (s.id === activeSheetId ? "is-active" : "")}
                            onClick={() => selectSheet(s.id)}>
                      <span className="masterplan-picker-item-ref">{s.id}</span>
                      <span className="masterplan-picker-item-stack">
                        <span className="masterplan-picker-item-name">{s.label}</span>
                        <span className="masterplan-picker-item-sub">{s.subtitle}</span>
                      </span>
                      {s.id === activeSheetId && <Icon name="check" size={14} />}
                    </button>
                  ))}
                </div>
              )}
              <div className="masterplan-picker-section">
                <div className="masterplan-picker-label">
                  {q ? `Results (${filteredSheets.length})` : `All sheets (${sheets.length})`}
                </div>
                {filteredSheets.length === 0 ? (
                  <div className="masterplan-picker-empty">No sheets match "{query}".</div>
                ) : filteredSheets.map(s => (
                  <button key={s.id}
                          type="button"
                          role="option"
                          aria-selected={s.id === activeSheetId}
                          className={"masterplan-picker-item " + (s.id === activeSheetId ? "is-active" : "")}
                          onClick={() => selectSheet(s.id)}>
                    <span className="masterplan-picker-item-ref">{s.id}</span>
                    <span className="masterplan-picker-item-stack">
                      <span className="masterplan-picker-item-name">{s.label}</span>
                      <span className="masterplan-picker-item-sub">{s.subtitle}</span>
                    </span>
                    {s.id === activeSheetId && <Icon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="masterplan-toggles">
        <button
          type="button"
          className={"masterplan-toggle masterplan-toggle-all " + (allOn ? "is-on" : "")}
          onClick={() => setAll(!allOn)}
          title={allOn ? "Hide all trade overlays" : "Show all trade overlays"}>
          <Icon name={allOn ? "layers" : "layers_clear"} size={14} />
          {allOn ? "All trades on" : (noneOn ? "All trades off" : "Show all trades")}
        </button>
        <div className="masterplan-toggle-sep" />
        {TRADES.map(t => (
          <button
            key={t.id}
            type="button"
            className={"masterplan-toggle " + (isOn(t.id) ? "is-on" : "")}
            style={isOn(t.id) ? { "--trade-color": t.color, borderColor: t.color, background: t.color + "18" } : { "--trade-color": t.color }}
            onClick={() => toggle(t.id)}>
            <span className="masterplan-swatch" style={{ background: t.color }} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="masterplan-canvas">
        <svg key={activeSheetId} viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet" className="masterplan-svg" aria-label="Layered floorplan">
          {/* =========================================================
              ARCHITECTURAL BASE — always visible. Walls, doors, room
              labels, and a subtle grid form the constant reference frame.
              Layout changes per active sheet (Level 1 / Level 2 / RCP). */}
          <g className="masterplan-layer-arch">
            {/* faint grid — same on every sheet */}
            <g opacity="0.10">
              {[80, 160, 240, 320].map(x => (
                <line key={"gx" + x} x1={x} y1="20" x2={x} y2="260" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
              ))}
              {[80, 140, 200].map(y => (
                <line key={"gy" + y} x1="20" y1={y} x2="380" y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
              ))}
            </g>
            {/* exterior walls — consistent envelope across sheets */}
            <rect x="20" y="20" width="360" height="240" fill="none" stroke="currentColor" strokeWidth="2" />

            {activeTemplate === "L1" && <>
              {/* interior partitions */}
              <line x1="20"  y1="120" x2="220" y2="120" stroke="currentColor" strokeWidth="1.2" />
              <line x1="220" y1="20"  x2="220" y2="120" stroke="currentColor" strokeWidth="1.2" />
              <line x1="140" y1="120" x2="140" y2="260" stroke="currentColor" strokeWidth="1.2" />
              <line x1="220" y1="120" x2="220" y2="200" stroke="currentColor" strokeWidth="1.2" />
              <line x1="220" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1.2" />
              <line x1="300" y1="20"  x2="300" y2="120" stroke="currentColor" strokeWidth="1.2" />
              {/* door swings */}
              <path d="M 60 120  A 14 14 0 0 1 74 106" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              <path d="M 140 170 A 12 12 0 0 1 152 158" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              <path d="M 220 160 A 12 12 0 0 0 232 172" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              <path d="M 300 60  A 12 12 0 0 1 312 48" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              {/* room labels */}
              {[
                { x: 120, y: 70,  n: "LOBBY" },
                { x: 260, y: 70,  n: "AQUATIC CENTER" },
                { x: 340, y: 70,  n: "STORAGE" },
                { x: 80,  y: 190, n: "LOCKERS" },
                { x: 180, y: 190, n: "OFFICES" },
                { x: 300, y: 165, n: "MECH ROOM" },
                { x: 300, y: 230, n: "POOL DECK" },
              ].map(r => (
                <text key={r.n} x={r.x} y={r.y} fill="currentColor" fillOpacity="0.55" fontSize="7" fontFamily="var(--font-ui)" textAnchor="middle" fontWeight="700" letterSpacing="0.5">{r.n}</text>
              ))}
            </>}

            {activeTemplate === "L2" && <>
              {/* Level 2 partitions — corridor down the middle, offices
                  along the perimeter, group fitness studios at south. */}
              <line x1="20"  y1="80"  x2="380" y2="80"  stroke="currentColor" strokeWidth="1.2" />
              <line x1="20"  y1="180" x2="380" y2="180" stroke="currentColor" strokeWidth="1.2" />
              <line x1="120" y1="20"  x2="120" y2="80"  stroke="currentColor" strokeWidth="1.2" />
              <line x1="220" y1="20"  x2="220" y2="80"  stroke="currentColor" strokeWidth="1.2" />
              <line x1="300" y1="20"  x2="300" y2="80"  stroke="currentColor" strokeWidth="1.2" />
              <line x1="180" y1="180" x2="180" y2="260" stroke="currentColor" strokeWidth="1.2" />
              <line x1="280" y1="180" x2="280" y2="260" stroke="currentColor" strokeWidth="1.2" />
              {/* door swings */}
              <path d="M 60 80   A 12 12 0 0 1 72 68"  fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              <path d="M 160 80  A 12 12 0 0 1 172 68" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              <path d="M 260 80  A 12 12 0 0 1 272 68" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              <path d="M 140 180 A 12 12 0 0 0 152 192" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.60" />
              {/* room labels */}
              {[
                { x: 70,  y: 50, n: "OFFICE 201" },
                { x: 170, y: 50, n: "OFFICE 202" },
                { x: 260, y: 50, n: "CONF" },
                { x: 340, y: 50, n: "OFFICE 203" },
                { x: 200, y: 135, n: "CORRIDOR" },
                { x: 100, y: 225, n: "STUDIO A" },
                { x: 230, y: 225, n: "STUDIO B" },
                { x: 330, y: 225, n: "RESTROOMS" },
              ].map(r => (
                <text key={r.n} x={r.x} y={r.y} fill="currentColor" fillOpacity="0.55" fontSize="7" fontFamily="var(--font-ui)" textAnchor="middle" fontWeight="700" letterSpacing="0.5">{r.n}</text>
              ))}
            </>}

            {activeTemplate === "RCP" && <>
              {/* Reflected Ceiling Plan — 2x2 acoustic tile grid overlay
                  as the base, with soffit outlines and a coffered lobby. */}
              <g opacity="0.20">
                {[60, 100, 140, 180, 220, 260, 300, 340].map(x => (
                  <line key={"rx" + x} x1={x} y1="20" x2={x} y2="260" stroke="currentColor" strokeWidth="0.5" />
                ))}
                {[60, 100, 140, 180, 220].map(y => (
                  <line key={"ry" + y} x1="20" y1={y} x2="380" y2={y} stroke="currentColor" strokeWidth="0.5" />
                ))}
              </g>
              {/* coffered lobby ceiling */}
              <rect x="90" y="70" width="160" height="90" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="110" y="90" width="120" height="50" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
              {/* soffit / bulkhead outlines */}
              <line x1="20"  y1="220" x2="380" y2="220" stroke="currentColor" strokeWidth="1.2" />
              <line x1="280" y1="20"  x2="280" y2="220" stroke="currentColor" strokeWidth="1.2" />
              {/* labels */}
              {[
                { x: 170, y: 130, n: "COFFERED CEILING" },
                { x: 200, y: 245, n: "9'-0\" CLG" },
                { x: 330, y: 130, n: "OPEN TO STRUCTURE" },
              ].map(r => (
                <text key={r.n} x={r.x} y={r.y} fill="currentColor" fillOpacity="0.55" fontSize="7" fontFamily="var(--font-ui)" textAnchor="middle" fontWeight="700" letterSpacing="0.5">{r.n}</text>
              ))}
            </>}
          </g>

          {/* =========================================================
              STRUCTURAL — Level 1/L2: full column grid + beams. RCP:
              exposed beam pattern at ceiling. */}
          {isOn("struct") && (activeTemplate === "L1" || activeTemplate === "L2") && (
            <g className="masterplan-layer masterplan-layer-struct">
              {[
                [80, 60, 160, 60], [160, 60, 240, 60], [240, 60, 320, 60],
                [80, 140, 160, 140], [160, 140, 240, 140], [240, 140, 320, 140],
                [80, 220, 160, 220], [240, 220, 320, 220],
                [80, 60, 80, 220], [160, 60, 160, 220], [240, 60, 240, 220], [320, 60, 320, 220],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={"b" + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#48C1B5" strokeWidth="1.5" opacity="0.75" />
              ))}
              {[
                [80, 60], [160, 60], [240, 60], [320, 60],
                [80, 140], [160, 140], [240, 140], [320, 140],
                [80, 220], [160, 220], [240, 220], [320, 220],
              ].map(([cx, cy], i) => (
                <g key={"col" + i}>
                  <circle cx={cx} cy={cy} r="4" fill="#48C1B5" />
                  <circle cx={cx} cy={cy} r="6" fill="none" stroke="#48C1B5" strokeWidth="1" opacity="0.60" />
                </g>
              ))}
              {["A", "B", "C", "D"].map((letter, i) => (
                <text key={letter} x={80 + i * 80} y="14" fill="#48C1B5" fontSize="7" fontFamily="var(--font-ui)" fontWeight="700" textAnchor="middle">{letter}</text>
              ))}
            </g>
          )}
          {isOn("struct") && activeTemplate === "RCP" && (
            <g className="masterplan-layer masterplan-layer-struct">
              {/* exposed beam bays visible above the ceiling grid */}
              {[80, 160, 240, 320].map(x => (
                <line key={"rcp-col" + x} x1={x} y1="20" x2={x} y2="260" stroke="#48C1B5" strokeWidth="2" opacity="0.55" />
              ))}
              {[60, 140, 220].map(y => (
                <line key={"rcp-beam" + y} x1="20" y1={y} x2="380" y2={y} stroke="#48C1B5" strokeWidth="1" opacity="0.35" strokeDasharray="4 3" />
              ))}
              {[[80, 60], [160, 60], [240, 60], [320, 60], [80, 140], [160, 140], [240, 140], [320, 140], [80, 220], [160, 220], [240, 220], [320, 220]].map(([cx, cy], i) => (
                <circle key={"c" + i} cx={cx} cy={cy} r="3.5" fill="#48C1B5" opacity="0.85" />
              ))}
            </g>
          )}

          {/* =========================================================
              MECHANICAL — sheet-specific HVAC layout. */}
          {isOn("mech") && activeTemplate === "L1" && (
            <g className="masterplan-layer masterplan-layer-mech">
              <line x1="30" y1="90" x2="215" y2="90" stroke="#FFBD15" strokeWidth="4" opacity="0.60" strokeLinecap="round" />
              <line x1="225" y1="90" x2="370" y2="90" stroke="#FFBD15" strokeWidth="4" opacity="0.60" strokeLinecap="round" />
              <line x1="290" y1="140" x2="290" y2="240" stroke="#FFBD15" strokeWidth="4" opacity="0.60" strokeLinecap="round" />
              <line x1="100" y1="90" x2="100" y2="140" stroke="#FFBD15" strokeWidth="2" opacity="0.55" />
              <line x1="180" y1="90" x2="180" y2="140" stroke="#FFBD15" strokeWidth="2" opacity="0.55" />
              <line x1="260" y1="90" x2="260" y2="140" stroke="#FFBD15" strokeWidth="2" opacity="0.55" />
              {[
                [70, 90], [140, 90], [210, 90], [270, 90], [340, 90],
                [100, 155], [180, 155], [260, 155], [290, 175], [290, 215],
              ].map(([cx, cy], i) => (
                <rect key={"d" + i} x={cx - 5} y={cy - 5} width="10" height="10" fill="none" stroke="#FFBD15" strokeWidth="1.4" opacity="0.85" />
              ))}
              <text x="382" y="86" fill="#FFBD15" fontSize="6" fontFamily="var(--font-ui)" fontWeight="700" textAnchor="end">HVAC-1</text>
            </g>
          )}
          {isOn("mech") && activeTemplate === "L2" && (
            <g className="masterplan-layer masterplan-layer-mech">
              {/* trunk down the corridor, branches into each office */}
              <line x1="30" y1="130" x2="370" y2="130" stroke="#FFBD15" strokeWidth="4" opacity="0.60" strokeLinecap="round" />
              {[60, 120, 180, 240, 300, 340].map(x => (
                <line key={"vl2" + x} x1={x} y1="80" x2={x} y2="130" stroke="#FFBD15" strokeWidth="1.6" opacity="0.55" />
              ))}
              {[
                [60, 50], [120, 50], [180, 50], [240, 50], [300, 50], [340, 50],
                [100, 220], [200, 220], [320, 220],
              ].map(([cx, cy], i) => (
                <rect key={"d2" + i} x={cx - 5} y={cy - 5} width="10" height="10" fill="none" stroke="#FFBD15" strokeWidth="1.4" opacity="0.85" />
              ))}
              <text x="382" y="126" fill="#FFBD15" fontSize="6" fontFamily="var(--font-ui)" fontWeight="700" textAnchor="end">HVAC-2</text>
            </g>
          )}
          {isOn("mech") && activeTemplate === "RCP" && (
            <g className="masterplan-layer masterplan-layer-mech">
              {/* dominant on RCP — diffusers on ceiling grid + exposed duct routes */}
              <line x1="30" y1="110" x2="370" y2="110" stroke="#FFBD15" strokeWidth="3.5" opacity="0.55" strokeLinecap="round" />
              <line x1="30" y1="170" x2="370" y2="170" stroke="#FFBD15" strokeWidth="3.5" opacity="0.55" strokeLinecap="round" />
              {[
                [80, 110], [140, 110], [200, 110], [260, 110], [320, 110],
                [80, 170], [140, 170], [200, 170], [260, 170], [320, 170],
                [110, 60], [230, 60], [110, 220], [230, 220],
              ].map(([cx, cy], i) => (
                <rect key={"drcp" + i} x={cx - 5} y={cy - 5} width="10" height="10" fill="none" stroke="#FFBD15" strokeWidth="1.4" opacity="0.85" />
              ))}
            </g>
          )}

          {/* =========================================================
              ELECTRICAL — sheet-specific lighting + panels. */}
          {isOn("elec") && activeTemplate === "L1" && (
            <g className="masterplan-layer masterplan-layer-elec">
              {[
                [60, 50], [100, 50], [140, 50], [180, 50],
                [60, 90], [100, 90], [140, 90], [180, 90],
                [260, 50], [310, 50], [360, 50],
                [260, 100], [310, 100], [360, 100],
                [60, 165], [110, 165], [160, 175],
                [200, 175], [280, 175], [340, 175],
              ].map(([cx, cy], i) => (
                <g key={"lt" + i}>
                  <rect x={cx - 5} y={cy - 3} width="10" height="6" fill="none" stroke="#5047F3" strokeWidth="1" />
                  <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#5047F3" strokeWidth="1" />
                </g>
              ))}
              <rect x="45" y="230" width="14" height="20" fill="#5047F3" opacity="0.85" />
              <text x="52" y="243" fill="#fff" fontSize="6" fontFamily="var(--font-ui)" fontWeight="700" textAnchor="middle">P1</text>
              <path d="M 52 230 L 52 200 L 100 200 L 100 175 M 100 200 L 200 200 L 200 175 M 200 200 L 300 200 L 300 175" fill="none" stroke="#5047F3" strokeWidth="1" opacity="0.55" strokeDasharray="3 2" />
            </g>
          )}
          {isOn("elec") && activeTemplate === "L2" && (
            <g className="masterplan-layer masterplan-layer-elec">
              {/* office-heavy — grid of 2x4 troffers */}
              {[
                [50, 40], [90, 40], [130, 40], [170, 40], [210, 40], [250, 40], [290, 40], [330, 40], [360, 40],
                [50, 60], [90, 60], [130, 60], [170, 60], [210, 60], [250, 60], [290, 60], [330, 60], [360, 60],
                [70, 210], [130, 210], [200, 210], [260, 210], [320, 210],
                [70, 240], [130, 240], [200, 240], [260, 240], [320, 240],
              ].map(([cx, cy], i) => (
                <g key={"lt2" + i}>
                  <rect x={cx - 5} y={cy - 3} width="10" height="6" fill="none" stroke="#5047F3" strokeWidth="1" />
                  <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#5047F3" strokeWidth="1" />
                </g>
              ))}
              <rect x="360" y="130" width="14" height="20" fill="#5047F3" opacity="0.85" />
              <text x="367" y="143" fill="#fff" fontSize="6" fontFamily="var(--font-ui)" fontWeight="700" textAnchor="middle">P2</text>
            </g>
          )}
          {isOn("elec") && activeTemplate === "RCP" && (
            <g className="masterplan-layer masterplan-layer-elec">
              {/* dominant on RCP — pendants + recessed downlights */}
              {[
                [110, 100], [150, 100], [190, 100], [230, 100],
                [110, 130], [150, 130], [190, 130], [230, 130],
                [60, 200], [100, 200], [140, 200], [180, 200], [220, 200], [260, 200],
                [320, 100], [360, 100], [320, 200], [360, 200],
              ].map(([cx, cy], i) => (
                <circle key={"rl" + i} cx={cx} cy={cy} r="3" fill="none" stroke="#5047F3" strokeWidth="1.2" />
              ))}
              {/* exit signs */}
              {[[20, 80], [380, 80], [200, 260]].map(([cx, cy], i) => (
                <g key={"exit" + i}>
                  <rect x={cx - 6} y={cy - 3} width="12" height="6" fill="#5047F3" opacity="0.85" />
                  <text x={cx} y={cy + 2} fill="#fff" fontSize="4" fontFamily="var(--font-ui)" fontWeight="700" textAnchor="middle">EXIT</text>
                </g>
              ))}
            </g>
          )}

          {/* =========================================================
              PLUMBING — sheet-specific fixtures + runs. */}
          {isOn("plumb") && activeTemplate === "L1" && (
            <g className="masterplan-layer masterplan-layer-plumb">
              {[
                [45, 155], [45, 175], [45, 195], [45, 215],
                [90, 235], [110, 235], [130, 235],
              ].map(([cx, cy], i) => (
                <circle key={"pf" + i} cx={cx} cy={cy} r="4" fill="none" stroke="#00A3E0" strokeWidth="1.5" />
              ))}
              {[[260, 235], [300, 235], [340, 235]].map(([cx, cy], i) => (
                <circle key={"sh" + i} cx={cx} cy={cy} r="3.5" fill="#00A3E0" opacity="0.85" />
              ))}
              <path d="M 30 155 L 30 220 L 130 220 L 130 235" fill="none" stroke="#00A3E0" strokeWidth="1.4" opacity="0.65" strokeDasharray="4 2" />
              <path d="M 250 250 L 340 250 L 340 235" fill="none" stroke="#00A3E0" strokeWidth="1.4" opacity="0.65" strokeDasharray="4 2" />
              <text x="30" y="150" fill="#00A3E0" fontSize="6" fontFamily="var(--font-ui)" fontWeight="700">CW/HW</text>
            </g>
          )}
          {isOn("plumb") && activeTemplate === "L2" && (
            <g className="masterplan-layer masterplan-layer-plumb">
              {/* restrooms + drinking fountains cluster */}
              {[
                [305, 205], [305, 220], [305, 235], [305, 250],
                [335, 205], [335, 220], [335, 235], [335, 250],
                [40, 130], [40, 145],
              ].map(([cx, cy], i) => (
                <circle key={"pl2" + i} cx={cx} cy={cy} r="4" fill="none" stroke="#00A3E0" strokeWidth="1.5" />
              ))}
              <path d="M 30 100 L 30 200 L 300 200 L 300 220 M 300 200 L 340 200 L 340 220" fill="none" stroke="#00A3E0" strokeWidth="1.4" opacity="0.65" strokeDasharray="4 2" />
              <text x="30" y="95" fill="#00A3E0" fontSize="6" fontFamily="var(--font-ui)" fontWeight="700">CW/HW</text>
            </g>
          )}
          {isOn("plumb") && activeTemplate === "RCP" && (
            <g className="masterplan-layer masterplan-layer-plumb">
              {/* sprinkler heads on ceiling grid */}
              {[
                [70, 90], [140, 90], [210, 90], [280, 90], [350, 90],
                [70, 150], [140, 150], [210, 150], [280, 150], [350, 150],
                [70, 210], [140, 210], [210, 210], [280, 210], [350, 210],
              ].map(([cx, cy], i) => (
                <g key={"sp" + i}>
                  <circle cx={cx} cy={cy} r="2.5" fill="none" stroke="#00A3E0" strokeWidth="1" />
                  <circle cx={cx} cy={cy} r="1" fill="#00A3E0" />
                </g>
              ))}
              <text x="30" y="80" fill="#00A3E0" fontSize="6" fontFamily="var(--font-ui)" fontWeight="700">SPKLR</text>
            </g>
          )}
        </svg>
      </div>

      <div className="masterplan-legend">
        <Icon name="info" size={13} />
        <span>
          <b>{active.size}</b> of {TRADES.length} trade layer{active.size === 1 ? "" : "s"} visible.{" "}
          Every sub sees the same architectural base, so scope conflicts stay visible before they hit the field.
        </span>
      </div>
    </div>
  );
}

function ProjectDrawingsTab({ project, onOpenDrawing }) {
  const drawings = (window.BC_DATA && window.BC_DATA.drawings) || [];
  const files = (window.BC_DATA && window.BC_DATA.files) || [];
  const [tradeFilter, setTradeFilter] = uS2("All");
  const [query, setQuery] = uS2("");

  // Source file lookup: each drawing's id is the prefix of its source PDF
  // name (e.g. "A-101 Level 1 floor plan.pdf"). Fall back to a synthetic
  // filename if no real file is in the indexed set yet.
  const sourceFor = (d) => {
    const match = files.find(f => f.name && f.name.startsWith(d.id));
    return match ? match.name : `${d.id} ${d.title}.pdf`;
  };

  const trades = uM2(() => {
    const set = new Set(drawings.map(d => d.trade).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [drawings]);

  const visible = uM2(() => {
    const q = query.trim().toLowerCase();
    return drawings.filter(d => {
      if (tradeFilter !== "All" && d.trade !== tradeFilter) return false;
      if (q) {
        const blob = `${d.id} ${d.title} ${d.trade} ${d.scale}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [drawings, tradeFilter, query]);

  if (project.isNew || drawings.length === 0) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 32, textAlign: "center" }}>
        <Icon name="architecture" size={28} style={{ color: "var(--orange-500)", opacity: 0.8 }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginTop: 10 }}>No drawings detected yet</div>
        <div style={{ fontSize: 13, color: "var(--bc-muted)", maxWidth: 420, margin: "8px auto 0", lineHeight: 1.55 }}>
          Upload a drawing set on the Files tab and Cody will detect individual sheets and surface them here.
        </div>
      </div>
    );
  }

  const totalTakeoffs = visible.reduce((sum, d) => sum + (d.markups || 0), 0);

  return (
    <div style={{ marginTop: 24 }}>
      <MasterFloorplan projectId={project.id} />

      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <div className="chip-group">
          {trades.map(t => (
            <button key={t}
                    className={"chip " + (tradeFilter === t ? "active" : "")}
                    onClick={() => setTradeFilter(t)}>
              {t}
              <span className="chip-count">{t === "All" ? drawings.length : drawings.filter(d => d.trade === t).length}</span>
            </button>
          ))}
        </div>
        <div className="takeoff-search">
          <Icon name="search" size={14} />
          <input
            type="text"
            placeholder="Search sheets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--bc-muted)", marginBottom: 8 }}>
        Showing <b>{visible.length}</b> of {drawings.length} sheets · <b>{totalTakeoffs}</b> items taken off
      </div>

      <div className="card no-pad">
        <table className="bc-table drawings-table">
          <thead>
            <tr>
              <th style={{ width: 96 }}>Preview</th>
              <th>Sheet</th>
              <th>Sheet Type</th>
              <th className="num">Items taken off (AI)</th>
              <th>Source file</th>
              <th className="center" style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(d => (
              <tr key={d.id}
                  className="drawing-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => onOpenDrawing && onOpenDrawing(d.id)}>
                <td>
                  <div className="drawing-thumb-cell">
                    <DrawingThumb kind={d.thumb} color={d.color} markups={d.markups} />
                  </div>
                </td>
                <td>
                  <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--bc-muted)", fontWeight: 700, fontSize: 12 }}>{d.id}</span>
                    {d.title}
                    {d.status === "flagged" && <span className="badge b-warn" style={{ fontSize: 9 }}><Icon name="flag" size={10} />Flagged</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--bc-muted)", marginTop: 3 }}>
                    {d.scale}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5 }}>{d.trade || "—"}</span>
                </td>
                <td className="num">
                  <b>{d.markups}</b>
                  <span style={{ fontSize: 11, color: "var(--bc-muted)", marginLeft: 4 }}>items</span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="picture_as_pdf" size={14} style={{ color: "var(--bc-muted)" }} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 12 }}>{sourceFor(d)}</span>
                  </div>
                </td>
                <td className="center">
                  <button
                    className="btn-ghost"
                    style={{ padding: "4px 6px" }}
                    title="More actions"
                    onClick={(e) => { e.stopPropagation(); }}>
                    <Icon name="more_vert" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================
// PROJECT HOME — TAKEOFFS TAB
// Structured quantity-takeoff dataset that powers the rest of the
// preconstruction workflow. Surfaces the full provenance trail per item:
// what it is, what trade/division owns it, how much of it, where it
// came from in the drawings, the spec/revision context, AI confidence,
// linked cost code, and historical benchmark. Primary columns render in
// the table; secondary fields appear when a row is expanded.
// =====================================================
function ProjectTakeoffsTab({ project, onOpenDrawing, divisionFormat, divisionFormatOther }) {
  const format = divisionFormat || "masterformat";
  const allItems = (((window.BC_DATA && window.BC_DATA.takeoffsByProject) || {})[project.id]) || [];

  // MasterFormat: 50-division standard (CSI Work Results). Items keep
  // their existing two-digit `division` value (e.g. "03" → Concrete).
  const MF_LABELS = {
    "01": "General Requirements", "02": "Existing Conditions", "03": "Concrete",
    "04": "Masonry", "05": "Metals", "06": "Wood, Plastics & Composites",
    "07": "Thermal & Moisture Protection", "08": "Openings", "09": "Finishes",
    "10": "Specialties", "11": "Equipment", "12": "Furnishings",
    "13": "Special Construction", "14": "Conveying Equipment",
    "21": "Fire Suppression", "22": "Plumbing", "23": "HVAC",
    "26": "Electrical", "27": "Communications", "28": "Electronic Safety",
    "31": "Earthwork", "32": "Exterior Improvements", "33": "Utilities",
  };
  // Uniformat II: 7 top-level element groups. We derive the group from
  // the first letter of each item's existing assembly code.
  const UF_LABELS = {
    "A": "Substructure", "B": "Shell", "C": "Interiors",
    "D": "Services", "E": "Equipment & Furnishings",
    "F": "Special Construction & Demolition", "G": "Building Sitework",
  };
  // Omniclass Table 22 (Work Results) — aligned 1:1 with MasterFormat,
  // so we surface the same divisions with the 22- table prefix.

  // Group an item by the currently selected format and return { key, label }.
  const groupOf = (i) => {
    if (format === "uniformat") {
      const letter = (i.assembly || "?").charAt(0);
      return { key: letter, label: `${letter} · ${UF_LABELS[letter] || "Other elements"}` };
    }
    if (format === "omniclass") {
      const div = i.division;
      return { key: div, label: `22-${div} · ${MF_LABELS[div] || "Other"}` };
    }
    if (format === "other") {
      const label = (divisionFormatOther && divisionFormatOther.trim()) || "Custom format";
      return { key: "all", label };
    }
    // masterformat (default)
    const div = i.division;
    return { key: div, label: `Div ${div} · ${MF_LABELS[div] || "Other"}` };
  };
  // Resolve the set of indexed drawing IDs once — used to decide whether a
  // takeoff's source reference is clickable (resolves to a drawing in the
  // viewer) or just a plain string. Verifying AI outputs against the
  // source drawing is the main reason this column exists.
  const drawingIds = uM2(() => {
    const ids = new Set();
    for (const d of ((window.BC_DATA && window.BC_DATA.drawings) || [])) ids.add(d.id);
    return ids;
  }, []);
  const openSource = (id) => { if (onOpenDrawing && id && drawingIds.has(id)) onOpenDrawing(id); };
  const [tradeFilter, setTradeFilter] = uS2("all");
  const [confFilter, setConfFilter] = uS2("all");
  const [query, setQuery] = uS2("");
  const [expanded, setExpanded] = uS2(new Set());

  const trades = uM2(() => {
    const set = new Set(allItems.map(i => i.trade));
    return ["all", ...Array.from(set).sort()];
  }, [allItems]);

  const visible = uM2(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter(i => {
      if (tradeFilter !== "all" && i.trade !== tradeFilter) return false;
      if (confFilter !== "all" && i.confidence !== confFilter) return false;
      if (q) {
        const blob = `${i.item} ${i.trade} ${i.division} ${i.sourceDrawing} ${i.spec} ${i.assembly} ${i.room}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [allItems, tradeFilter, confFilter, query]);

  const toggleRow = (id) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  if (project.isNew || allItems.length === 0) {
    return (
      <div className="card" style={{ marginTop: 24, padding: 32, textAlign: "center" }}>
        <Icon name="straighten" size={28} style={{ color: "var(--orange-500)", opacity: 0.8 }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginTop: 10 }}>No takeoff items yet</div>
        <div style={{ fontSize: 13, color: "var(--bc-muted)", maxWidth: 420, margin: "8px auto 16px", lineHeight: 1.55 }}>
          Run a takeoff on the indexed drawings and Cody will build the structured dataset that powers estimates, bid leveling, and clarifications.
        </div>
        <button className="btn-primary"><Icon name="play_arrow" size={14} />Run takeoff</button>
      </div>
    );
  }

  const confBadge = (level) => {
    if (level === "high") return <span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />High</span>;
    if (level === "med")  return <span className="badge b-warn" style={{ fontSize: 9 }}>Med</span>;
    if (level === "low")  return <span className="badge"        style={{ fontSize: 9, background: "rgba(181, 54, 54, 0.10)", color: "#B53636" }}>Low</span>;
    return <span className="badge" style={{ fontSize: 9 }}>{level}</span>;
  };
  const totalsByDiv = {};
  for (const i of visible) totalsByDiv[i.division] = (totalsByDiv[i.division] || 0) + 1;

  return (
    <div style={{ marginTop: 24 }}>
      {/* Filter row — trade dropdown, confidence chips, search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="takeoff-select"
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}>
            {trades.map(t => (
              <option key={t} value={t}>{t === "all" ? `All trades (${allItems.length})` : t}</option>
            ))}
          </select>
          <div className="chip-group">
            {["all", "high", "med", "low"].map(c => (
              <button key={c}
                      className={"chip " + (confFilter === c ? "active" : "")}
                      onClick={() => setConfFilter(c)}>
                {c === "all" ? "All confidence" : c.charAt(0).toUpperCase() + c.slice(1)}
                <span className="chip-count">{c === "all" ? allItems.length : allItems.filter(i => i.confidence === c).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="takeoff-search">
          <Icon name="search" size={14} />
          <input
            type="text"
            placeholder="Search items, drawings, specs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--bc-muted)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          Showing <b>{visible.length}</b> of {allItems.length} items
          {Object.keys(totalsByDiv).length > 1 && <> across {Object.keys(totalsByDiv).length} divisions</>}
        </div>
        <div style={{ fontSize: 11, color: "var(--bc-muted)" }}>
          Organized by <b style={{ color: "var(--orange-500)" }}>{
            format === "uniformat" ? "Uniformat" :
            format === "omniclass" ? "Omniclass" :
            format === "other" ? (divisionFormatOther || "Custom format") :
            "MasterFormat"
          }</b>
        </div>
      </div>

      {/* Group visible items by the current format. Each group gets a
          section-header row (full-width, sticky to its band) so users
          can scan the dataset by Division. The Division column inside
          each row shows the format-appropriate code (Div 03 / B1010 /
          22-03) so rows stay self-describing even when sorted/filtered. */}
      {(() => {
        const groups = [];
        const byKey = {};
        for (const i of visible) {
          const g = groupOf(i);
          if (!byKey[g.key]) {
            byKey[g.key] = { ...g, items: [] };
            groups.push(byKey[g.key]);
          }
          byKey[g.key].items.push(i);
        }
        // Sort groups by key (alphabetical for letters, numeric for divisions).
        groups.sort((a, b) => String(a.key).localeCompare(String(b.key), undefined, { numeric: true }));
        const divCellText = (i) =>
          format === "uniformat" ? (i.assembly || "—").split(" ")[0] :
          format === "omniclass" ? `22-${i.division}` :
          `Div ${i.division}`;
        const divColHeader =
          format === "uniformat" ? "Element" :
          format === "omniclass" ? "Code" :
          "Div";
        return (
      <div className="card no-pad">
        <table className="bc-table takeoff-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th>Item</th>
              <th>Trade</th>
              <th>{divColHeader}</th>
              <th className="num">Quantity</th>
              <th>Source</th>
              <th>Confidence</th>
              <th className="num" style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <React.Fragment key={g.key}>
                <tr className="takeoff-group-row">
                  <td colSpan={8}>
                    <div className="takeoff-group-label">
                      <span>{g.label}</span>
                      <span className="takeoff-group-count">{g.items.length} {g.items.length === 1 ? "item" : "items"}</span>
                    </div>
                  </td>
                </tr>
                {g.items.map(i => {
              const isOpen = expanded.has(i.id);
              return (
                <React.Fragment key={i.id}>
                  <tr
                    className={"takeoff-row " + (isOpen ? "is-open" : "")}
                    onClick={() => toggleRow(i.id)}
                    style={{ cursor: "pointer" }}>
                    <td className="center">
                      <Icon name={isOpen ? "expand_more" : "chevron_right"} size={16} style={{ color: "var(--bc-muted)" }} />
                    </td>
                    <td>
                      <div className="item-title">{i.item}</div>
                      <div style={{ fontSize: 11, color: "var(--bc-muted)", marginTop: 2 }}>{i.assembly}</div>
                    </td>
                    <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12 }}>{i.trade}</span></td>
                    <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{divCellText(i)}</span></td>
                    <td className="num">
                      <b>{i.qty.toLocaleString()}</b>
                      <span style={{ fontSize: 11, color: "var(--bc-muted)", marginLeft: 4 }}>{i.unit}</span>
                    </td>
                    <td>
                      {drawingIds.has(i.sourceDrawing) ? (
                        <button
                          type="button"
                          className="takeoff-source-link"
                          title={`Open ${i.sourceDrawing} in the drawing viewer`}
                          onClick={(e) => { e.stopPropagation(); openSource(i.sourceDrawing); }}>
                          {i.sourceDrawing}
                          <Icon name="north_east" size={12} />
                        </button>
                      ) : (
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12 }}>{i.sourceDrawing}</span>
                      )}
                      {i.detail && i.detail !== "—" && <span style={{ fontSize: 11, color: "var(--bc-muted)", marginLeft: 6 }}>· {i.detail}</span>}
                    </td>
                    <td>{confBadge(i.confidence)}<span style={{ fontSize: 11, color: "var(--bc-muted)", marginLeft: 6 }}>{Math.round(i.confidenceScore * 100)}%</span></td>
                    <td className="center">
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 6px" }}
                        title="More actions"
                        onClick={(e) => { e.stopPropagation(); }}>
                        <Icon name="more_vert" size={16} />
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="takeoff-detail-row">
                      <td></td>
                      <td colSpan={7}>
                        <div className="takeoff-detail">
                          <div className="takeoff-detail-grid">
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Building</div>
                              <div className="takeoff-detail-value">{i.building}</div>
                            </div>
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Level</div>
                              <div className="takeoff-detail-value">{i.level}</div>
                            </div>
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Room / Area</div>
                              <div className="takeoff-detail-value">{i.room}</div>
                            </div>
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Detail reference</div>
                              <div className="takeoff-detail-value">{i.detail}</div>
                            </div>
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Specification</div>
                              <div className="takeoff-detail-value">{i.spec}</div>
                            </div>
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Revision</div>
                              <div className="takeoff-detail-value">{i.revision}</div>
                            </div>
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Linked cost code</div>
                              <div className="takeoff-detail-value" style={{ fontFamily: "var(--font-mono, monospace)" }}>{i.costCode}</div>
                            </div>
                            <div className="takeoff-detail-cell">
                              <div className="takeoff-detail-label">Historical benchmark</div>
                              <div className="takeoff-detail-value">{i.benchmark}</div>
                            </div>
                          </div>
                          {i.aiNotes && (
                            <div className="takeoff-detail-notes">
                              <Icon name="auto_awesome" size={13} />
                              <div>
                                <div className="takeoff-detail-label">Cody's notes</div>
                                <div className="takeoff-detail-value">{i.aiNotes}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
        );
      })()}
    </div>
  );
}

// Sample rows populated when the user drops a rate sheet — stands in
// for real CSV/XLSX parsing. Kept here alongside the tab so the
// project-level view is self-contained.
const PROJECT_SAMPLE_LABOR_UPLOAD = [
  { trade: "Project Manager",           rate: 152.00, fringe: 0.42 },
  { trade: "Superintendent",            rate: 126.00, fringe: 0.42 },
  { trade: "Foreman: Carpenter",        rate: 90.00,  fringe: 0.55 },
  { trade: "Carpenter, Journey",        rate: 76.00,  fringe: 0.58 },
  { trade: "Carpenter, Apprentice",     rate: 56.00,  fringe: 0.55 },
  { trade: "Ironworker",                rate: 80.00,  fringe: 0.55 },
  { trade: "Electrician, Journey",      rate: 87.00,  fringe: 0.60 },
  { trade: "Plumber",                   rate: 85.00,  fringe: 0.58 },
  { trade: "Operating Engineer",        rate: 90.00,  fringe: 0.60 },
  { trade: "Laborer",                   rate: 45.00,  fringe: 0.48 },
];
const PROJECT_SAMPLE_MATERIAL_UPLOAD = [
  { trade: "Ready-mix concrete, 4000 PSI",      rate: 198.00,  fringe: 0.08 },
  { trade: "Reinforcing steel, Grade 60",       rate: 0.94,    fringe: 0.10 },
  { trade: "Structural steel, A992 W-shapes",   rate: 2895.00, fringe: 0.12 },
  { trade: "Steel deck, 3\" composite",         rate: 4.20,    fringe: 0.10 },
  { trade: "Gypsum wallboard, 5/8\" type X",    rate: 1.15,    fringe: 0.06 },
  { trade: "Acoustic ceiling tile, 24x24",      rate: 3.25,    fringe: 0.06 },
  { trade: "Broadloom carpet, 32 oz nylon",     rate: 4.90,    fringe: 0.08 },
  { trade: "Storefront glazing, aluminum",      rate: 78.00,   fringe: 0.10 },
  { trade: "Wood door, solid core paint grade", rate: 645.00,  fringe: 0.08 },
];

function ProjectLaborTab({ project }) {
  const globalRates = (window.BC_DATA && window.BC_DATA.laborRates) || [];
  const overrides = (window.BC_DATA && window.BC_DATA.laborRatesByProject && window.BC_DATA.laborRatesByProject[project.id]) || [];
  // Merge preset labor rates + per-project overrides. Overrides win per
  // trade; we also flag which fields differ so we can highlight them.
  const presetLaborRows = globalRates.map(g => {
    const o = overrides.find(x => x.trade === g.trade);
    if (!o) return { ...g, overridden: false };
    return {
      ...g,
      ...o,
      overridden: true,
      rateChanged: o.rate !== g.rate,
      fringeChanged: o.fringe !== g.fringe,
    };
  });
  const overrideCount = presetLaborRows.filter(r => r.overridden).length;

  const [activeType, setActiveType] = uS2("labor");
  const [laborUpload, setLaborUpload] = uS2(null);
  const [materialUpload, setMaterialUpload] = uS2(null);
  const currentUpload = activeType === "labor" ? laborUpload : materialUpload;
  const currentSetUpload = activeType === "labor" ? setLaborUpload : setMaterialUpload;

  const simulateUpload = () => {
    if (activeType === "labor") {
      setLaborUpload({ fileName: project.name + " · labor rates.xlsx", uploadedAt: "Just now", rates: PROJECT_SAMPLE_LABOR_UPLOAD });
    } else {
      setMaterialUpload({ fileName: project.name + " · material rates.xlsx", uploadedAt: "Just now", rates: PROJECT_SAMPLE_MATERIAL_UPLOAD });
    }
  };
  const removeUpload = () => currentSetUpload(null);

  // Rows to render in the table for the active type.
  // Labor: if uploaded → uploaded rows; else preset+override merge.
  // Materials: if uploaded → uploaded rows; else nothing (show upload-only).
  const usingUpload = !!currentUpload;
  const laborRows = laborUpload ? laborUpload.rates.map(r => ({ ...r, overridden: false, region: "Uploaded" })) : presetLaborRows;
  const rows = activeType === "labor" ? laborRows : (materialUpload ? materialUpload.rates : []);
  const showEmptyMaterials = activeType === "materials" && !materialUpload;

  const fmtRate = (n) => n >= 100
    ? "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "$" + n.toFixed(2);

  // Newly created projects render just the toggle + upload zone.
  if (project.isNew) {
    return (
      <div style={{ marginTop: 24 }}>
        <ProjectRatesHeader activeType={activeType} setActiveType={setActiveType} />
        <div className="rates-drop" onClick={simulateUpload}
             onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
             onDragLeave={(e) => e.currentTarget.classList.remove("drag")}
             onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag"); simulateUpload(); }}>
          <Icon name="cloud_upload" size={22} />
          <div className="rates-drop-title">Upload project {activeType === "labor" ? "labor" : "material"} rates</div>
          <div className="rates-drop-sub">
            Drop a CSV or XLSX with {activeType === "labor" ? "trade rates and fringe" : "material costs and delivery/tax markup"}.
            Uploaded rates apply to this project only.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <ProjectRatesHeader activeType={activeType} setActiveType={setActiveType} />

      {!currentUpload ? (
        <button
          type="button"
          className="rates-drop"
          onClick={(e) => { e.preventDefault(); simulateUpload(); }}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
          onDragLeave={(e) => e.currentTarget.classList.remove("drag")}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag"); simulateUpload(); }}>
          <Icon name="cloud_upload" size={22} />
          <div className="rates-drop-title">
            Drop {activeType === "labor" ? "your labor" : "your material"} rate sheet for this project
          </div>
          <div className="rates-drop-sub">
            {activeType === "labor"
              ? "CSV or XLSX with trade + base rate + fringe. Uploaded rates fully replace the defaults + any per-trade overrides for this project."
              : "CSV or XLSX with material + base rate + markup. Cody parses and populates the rate list."}
          </div>
        </button>
      ) : (
        <div className="rates-file-banner">
          <Icon name="task" size={18} className="rates-file-icon" />
          <div className="rates-file-body">
            <div className="rates-file-name">{currentUpload.fileName}</div>
            <div className="rates-file-sub">
              {currentUpload.rates.length} {activeType === "labor" ? "trades" : "materials"} parsed · Uploaded {currentUpload.uploadedAt}
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost rates-file-remove"
            title={activeType === "labor" ? "Remove file and restore preset + overrides" : "Remove file and clear the list"}
            onClick={removeUpload}>
            <Icon name="delete_outline" size={14} />Remove file
          </button>
        </div>
      )}

      {showEmptyMaterials ? (
        <div className="rates-empty">
          <Icon name="inventory_2" size={28} />
          <div className="rates-empty-title">No project material rates yet</div>
          <div className="rates-empty-sub">Drop a materials rate sheet above and every line item will populate — base rate, delivery/tax markup, and the loaded rate Cody uses on this project's estimates.</div>
        </div>
      ) : (
        <>
          {activeType === "labor" && !laborUpload && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "12px 0 12px" }}>
              <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>
                {presetLaborRows.length} trades · {overrideCount > 0 ? <b style={{ color: "var(--orange-500)" }}>{overrideCount} project override{overrideCount === 1 ? "" : "s"}</b> : "inheriting global rates"}
              </div>
              <button className="btn"><Icon name="restart_alt" size={16} />Reset to global</button>
            </div>
          )}

          <div className="card no-pad" style={{ marginTop: 16 }}>
            <div className="card-h">
              <Icon name={activeType === "labor" ? "engineering" : "inventory_2"} style={{ color: "var(--orange-500)" }} />
              <h3>{activeType === "labor" ? "Trades & rates" : "Materials & rates"}</h3>
              {usingUpload && <span className="rates-source-pill"><Icon name="cloud_done" size={11} />From upload</span>}
              <div className="right">
                <button className="btn-ghost"><Icon name="add" size={14} />Add {activeType === "labor" ? "trade" : "material"}</button>
                <button className="btn-ghost"><Icon name="history" size={14} />History</button>
              </div>
            </div>
            <table className="bc-table">
              <thead><tr>
                <th>{activeType === "labor" ? "Trade" : "Material"}</th>
                <th className="num">Base rate</th>
                <th className="num">Fringe</th>
                <th className="num">Loaded rate</th>
                {activeType === "labor" && !laborUpload && <th>Source</th>}
              </tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const loadedChanged = r.overridden && (r.rateChanged || r.fringeChanged);
                  const orange = { color: "var(--orange-500)", fontWeight: 600 };
                  return (
                    <tr key={i}>
                      <td><div className="item-title">{r.trade}</div></td>
                      <td className="num"><span className="cell-display editable" style={r.rateChanged ? orange : null}>{fmtRate(r.rate)}</span></td>
                      <td className="num"><span className="cell-display editable" style={r.fringeChanged ? orange : null}>{(r.fringe * 100).toFixed(0)}%</span></td>
                      <td className="num"><b style={loadedChanged ? { color: "var(--orange-500)" } : null}>{fmtRate(r.rate * (1 + r.fringe))}</b></td>
                      {activeType === "labor" && !laborUpload && (
                        <td>
                          {r.overridden ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span className="badge b-info" style={{ background: "rgba(232,70,0,0.10)", color: "var(--orange-500)", alignSelf: "flex-start" }}>Project override</span>
                              {r.editedBy && (
                                <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--bc-muted)" }}>
                                  by {r.editedBy}{r.editedAt ? ` · ${r.editedAt}` : ""}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>Global · {r.region}</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {activeType === "labor" && !laborUpload && (
            <div className="labor-prompt-title" style={{ marginTop: 16 }}>
              <Icon name="info" size={16} style={{ color: "#0074E8" }} />
              Labor rates default to your company's PDX metro rates. Edits or an uploaded sheet override the global value for this project only.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Small header shared between the new-project and populated states of
// ProjectLaborTab — title + Labor/Materials toggle on the right.
function ProjectRatesHeader({ activeType, setActiveType }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
      <div>
        <h2 className="page-h2" style={{ margin: 0, fontSize: 18 }}>
          Project {activeType === "labor" ? "labor" : "material"} rates
        </h2>
        <p className="page-sub" style={{ marginTop: 4 }}>
          {activeType === "labor"
            ? "Trade wage rates + fringe used by every skill run on this project. Upload a sheet to override defaults."
            : "Unit-cost material rates + delivery/tax markup used on this project's estimates. Upload to populate."}
        </p>
      </div>
      <div className="seg rates-toggle" role="tablist" aria-label="Rate type">
        <button role="tab" aria-selected={activeType === "labor"} className={activeType === "labor" ? "active" : ""} onClick={() => setActiveType("labor")}>
          <Icon name="engineering" size={14} />Labor rates
        </button>
        <button role="tab" aria-selected={activeType === "materials"} className={activeType === "materials" ? "active" : ""} onClick={() => setActiveType("materials")}>
          <Icon name="inventory_2" size={14} />Material rates
        </button>
      </div>
    </div>
  );
}

// =====================================================
// PROJECT HOME — SKILLS HISTORY TAB
// Chronological list of every skill run on this project with a Bid-
// Leveling-style dropdown to filter by skill type. Reuses the
// .trade-dd / .trade-trigger / .trade-menu styles for the filter so it
// visually matches the BidLevelingScreen selector.
// =====================================================
function ProjectHistoryTab({ project, onOpenTab }) {
  const allRuns = ((window.BC_DATA && window.BC_DATA.runs) || []).filter(r => r.projectId === project.id);
  const sortedRuns = [...allRuns].sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
  const [filter, setFilter] = uS2("all");
  const [open, setOpen] = uS2(false);
  const filterRef = uR2(null);
  uE2(() => {
    if (!open) return;
    const onDoc = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const skillCounts = {};
  for (const r of sortedRuns) skillCounts[r.skill] = (skillCounts[r.skill] || 0) + 1;
  const skillOptions = Object.keys(skillCounts).sort();
  const visibleRuns = filter === "all" ? sortedRuns : sortedRuns.filter(r => r.skill === filter);

  const skillIcon = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "calculate" :
    name === "Bid Level Analysis" ? "compare_arrows" :
    name === "Clarifications & Potential RFIs" ? "rule" :
    name === "Trade Scoping" ? "groups" :
    "auto_awesome";
  const shortName = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "ROM Estimate" :
    name === "Clarifications & Potential RFIs" ? "Clarifications & RFIs" :
    name;
  const skillToTab = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "estimation" :
    name === "Bid Level Analysis" ? "bid" :
    name === "Clarifications & Potential RFIs" ? "rfc" :
    name === "Trade Scoping" ? "trades" :
    null;
  const resultSummary = (r) => {
    if (!r.ai) return "N/A";
    if (r.ai.total) return <><b>{r.ai.total}</b>{r.ai.version ? <span style={{ color: "var(--bc-muted)" }}> · {r.ai.version}</span> : null}{r.ai.confidence ? <span style={{ color: "var(--bc-muted)" }}> · {Math.round(r.ai.confidence * 100)}% conf</span> : null}</>;
    if (r.ai.issues != null) return <><b>{r.ai.issues} issues</b><span style={{ color: "var(--bc-muted)" }}> · {r.ai.critical} critical</span></>;
    if (r.ai.savings) return <><b style={{ color: "var(--tiffany-400)" }}>{r.ai.savings} saved</b>{r.ai.division ? <span style={{ color: "var(--bc-muted)" }}> · {r.ai.division}</span> : null}</>;
    return "N/A";
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>
          {visibleRuns.length} of {sortedRuns.length} skill {sortedRuns.length === 1 ? "run" : "runs"}
        </div>
        <div className="trade-dd history-filter-dd" ref={filterRef} style={{ marginBottom: 0 }}>
          <button className={"trade-trigger " + (open ? "open" : "")} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
            <span className="trade-trigger-stack">
              <span className="trade-trigger-code">Filter</span>
              <b className="trade-trigger-name">{filter === "all" ? "All skills" : shortName(filter)}</b>
            </span>
            <span className="trade-trigger-meta">{filter === "all" ? sortedRuns.length : (skillCounts[filter] || 0)} runs</span>
            <Icon name="expand_more" size={16} />
          </button>
          {open && (
            <div className="trade-menu">
              <button
                className={"trade-menu-item " + (filter === "all" ? "active" : "")}
                onClick={() => { setFilter("all"); setOpen(false); }}>
                <div className="trade-menu-info">
                  <div className="trade-menu-code">All</div>
                  <div className="trade-menu-name">All skills</div>
                  <div className="trade-menu-meta">{sortedRuns.length} runs across {skillOptions.length} skill{skillOptions.length === 1 ? "" : "s"}</div>
                </div>
                {filter === "all" && <Icon name="check" size={14} />}
              </button>
              {skillOptions.map(s => (
                <button key={s}
                        className={"trade-menu-item " + (filter === s ? "active" : "")}
                        onClick={() => { setFilter(s); setOpen(false); }}>
                  <div className="trade-menu-info">
                    <div className="trade-menu-code"><Icon name={skillIcon(s)} size={11} style={{ marginRight: 4, verticalAlign: "-1px" }} />Skill</div>
                    <div className="trade-menu-name">{shortName(s)}</div>
                    <div className="trade-menu-meta">{skillCounts[s]} run{skillCounts[s] === 1 ? "" : "s"}</div>
                  </div>
                  {filter === s && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {visibleRuns.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--bc-muted)" }}>
          No skill runs match this filter yet.
        </div>
      ) : (
        <div className="card no-pad">
          <table className="bc-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Run date</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Result</th>
                <th className="center">Open</th>
              </tr>
            </thead>
            <tbody>
              {visibleRuns.map(r => {
                const tabId = skillToTab(r.skill);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon name={skillIcon(r.skill)} size={16} style={{ color: "var(--orange-500)", opacity: 0.85 }} />
                        {shortName(r.skill)}
                      </div>
                    </td>
                    <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.when}</span></td>
                    <td>
                      {r.status === "done"
                        ? <span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />Done</span>
                        : r.status === "working"
                          ? <span className="badge b-warn" style={{ fontSize: 9 }}><Icon name="hourglass_top" size={10} />Running</span>
                          : <span className="badge" style={{ fontSize: 9 }}>{r.status}</span>}
                    </td>
                    <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.duration}</span></td>
                    <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5 }}>{resultSummary(r)}</span></td>
                    <td className="center">
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        title="Open this run"
                        disabled={!tabId}
                        onClick={() => { if (tabId && onOpenTab) onOpenTab(tabId); }}>
                        <Icon name="open_in_new" size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
    { name: "A-401 Reflected ceiling plan.pdf", category: "Drawings", confidence: "high", ftype: "pdf" },
    { name: "Bid form - Cascade Mechanical.pdf", category: "Bid Forms", confidence: "med", ftype: "pdf" }];

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
          <span>Cody will categorize them automatically. You can change the category inline.</span>
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

Object.assign(window, { ProjectHomeScreen, FilesScreen, FileStatusBadge });