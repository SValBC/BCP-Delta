// BuildCrew.AI — Project Home + Files screens
const { useState: uS2, useEffect: uE2, useRef: uR2 } = React;

// =====================================================
// PROJECT HOME (workspace overview when project opened)
// =====================================================
function ProjectHomeScreen({ project, onOpenTab, onAskAI, onOpenDrawing, projectSwitcher, pinnedSet, onPin, skillRuns, skillCompletions, onStartSkillRun, onStopSkillRun }) {
  const drawings = window.BC_DATA.drawings || [];
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
  const revisions = project.revisions || [];
  const latest = revisions[revisions.length - 1];
  const [activeRevisionId, setActiveRevisionId] = uS2(latest ? latest.id : null);
  uE2(() => { setActiveRevisionId(latest ? latest.id : null); }, [project.id]);
  const activeRevision = revisions.find(r => r.id === activeRevisionId) || latest;

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
            <button className="btn"><Icon name="share" size={16} />Share</button>
            <button className="btn-primary" onClick={() => onOpenTab("skills")}><Icon name="play_arrow" size={16} />Run a skill</button>
          </>
        }
        onAskAI={onAskAI}
        switcher={projectSwitcher} />
      
      <div className="canvas">
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 6 }}>{project.kind}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 className="page-h1" style={{ fontSize: 30 }}>{project.name}</h2>
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
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              {project.status === "working" && <span className="badge b-working"><span className="dot" />{project.statusLabel}</span>}
              {project.status === "done" && <span className="badge b-done">{project.statusLabel}</span>}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
            <p className="page-sub" style={{ margin: 0 }}>
              {project.address} · {project.stage}
            </p>
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CODY'S BRIEF — AI-generated, top of screen, dismissible */}
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

        {/* LABOR RATES PROMPT — dismissible, drag/drop the whole card, blue theme */}
        {!laborDismissed && (
          <div
            className={"labor-prompt " + (laborDrag ? "drag" : "")}
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
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 28 }}>
          <div className="kpi"><Icon className="bg" name="payments" /><div className="label">Latest ROM Estimate</div><div className="value">{project.estimate}</div><div className="delta up"><Icon name="trending_up" size={14} />+2.3% vs v2</div></div>
          <div className="kpi"><Icon className="bg" name="upload_file" /><div className="label">Documents</div><div className="value">{project.files}</div><div className="delta" style={{ color: "var(--bc-muted)" }}>3 added today</div></div>
          <div className="kpi"><Icon className="bg" name="rule" /><div className="label">Open clarifications</div><div className="value">23</div><div className="delta up"><Icon name="warning" size={14} />3 critical</div></div>
          <div className="kpi"><Icon className="bg" name="auto_awesome" /><div className="label">Skill confidence</div><div className="value">91%</div><div className="delta down"><Icon name="check" size={14} />High</div></div>
        </div>

        <div className="section-h"><Icon name="bolt" size={16} style={{ color: "var(--orange-500)" }} /><h3>Run a skill</h3></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
          { id: "estimation", title: "Rough Order of Magnitude (ROM) Estimate", icon: "calculate", desc: "Delivers end-to-end estimation capabilities, from initial quantity takeoffs through materials selection, labor calculations, and scheduling to produce comprehensive project estimates. Integrates all estimating phases into a single, cohesive workflow for maximum efficiency.", lastRun: "12 min ago", success: true },
          { id: "rfc", title: "Clarifications & Potential RFIs", icon: "rule", desc: "Performs thorough document analysis across all project files, identifying inconsistencies, errors, and optimization opportunities. Creates detailed reports highlighting potential issues and improvements to enhance project quality and efficiency.", lastRun: "1h ago", success: true },
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
              } else {
                onStartSkillRun && onStartSkillRun(project.id, s.id);
              }
            };
            return (
              <div key={s.id}
                   className={"pin-card run-skill-card " + (running ? "is-running " : "") + (justCompleted ? "is-just-completed " : "") + (hasFreshCompletion && !justCompleted ? "is-completed" : "")}
                   style={{ minHeight: 140 }}
                   onClick={handleCardClick}>
                {running && <span className="run-skill-bar" style={{ width: progress + "%" }} />}
                {justCompleted && (
                  <div className="run-skill-celebration">
                    <Icon name="check_circle" size={56} />
                  </div>
                )}
                <Icon className="bg" name={s.icon} />
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="run-skill-icon-wrap" style={{ width: 34, height: 34, borderRadius: 8, background: running ? "rgba(232,70,0,0.12)" : "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {running
                      ? <span className="run-skill-spinner" />
                      : <Icon name={s.icon} size={19} style={{ opacity: 0.55 }} />
                    }
                  </div>
                  <div className="pin-title">{s.title}</div>
                </div>
                {running ? (
                  <>
                    <div style={{ fontSize: 12, color: "var(--bc-strong)", lineHeight: 1.4 }}>
                      <span className="run-skill-stage"><span className="dot" />{stage}</span>
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-data)", fontWeight: 700, fontSize: 13, color: "var(--orange-500)" }}>{Math.round(progress)}%</span>
                      <button className="run-skill-stop" onClick={(e) => { e.stopPropagation(); onStopSkillRun && onStopSkillRun(project.id, s.id); }} title="Stop run">
                        <Icon name="stop" size={14} />Stop
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: "var(--bc-muted)", lineHeight: 1.4 }}>{s.desc}</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: effectiveSuccess ? "var(--tiffany-400)" : "var(--orange-500)" }}>
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

        {/* DRAWINGS */}
        <div className="section-h">
          <Icon name="architecture" size={16} style={{ color: "var(--orange-500)" }} />
          <h3>Drawings</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, color: "var(--bc-muted)" }}>
            {visibleDrawings.length} of {drawings.length} sheets · {visibleDrawings.reduce((a, d) => a + d.markups, 0)} AI markups
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
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
          <div style={{ gridColumn: "1 / -1", padding: "32px 16px", textAlign: "center", color: "var(--bc-muted)", fontSize: 13, border: "1px dashed rgba(39,38,53,0.15)", borderRadius: 10 }}>
              No drawings tagged <b>{drawingTrade}</b>. <button className="btn-ghost" style={{ display: "inline-flex", marginLeft: 6 }} onClick={() => setDrawingTrade("All")}>Clear filter</button>
            </div>
          }
        </div>

      </div>
    </div>);

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
        { id: "n" + Date.now() + i, name: s.name, size: "2.1 MB", uploaded: "Just now · Jamie Park", category: s.category, ftype: s.ftype, confidence: s.confidence, indexed: true, _new: true },
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
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 10px", flexWrap: "wrap" }}>
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
                padding: "7px 10px 7px 30px", fontSize: 12,
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
                <th style={{ width: 170 }}>Category</th>
                <th style={{ width: 90 }}>Confidence</th>
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
                  No files match.{query && <> <button className="btn-ghost" style={{ display: "inline-flex", marginLeft: 6 }} onClick={() => setQuery("")}>Clear search</button></>}
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}

Object.assign(window, { ProjectHomeScreen, FilesScreen });