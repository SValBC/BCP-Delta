// BuildCrew.AI — Screens (Home, Projects, Skills, Reports, Labor, Settings, Project Home, Files)
const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

// =====================================================
// HOME
// =====================================================
function HomeScreen({ ctx, projects, runs, onPin, pinnedSet, onOpenProject, onOpenProjectInNewTab, onOpenDrawing, onAskAI, onNewProject, onOpenDailyReport, onCtxMenu, onAskCodyPrompt, onStartCreateProjectFlow, onStartAddFilesFlow, onStartRomEstimateFlow }) {
  const [greetPrompt, setGreetPrompt] = useS("");
  const submitGreetPrompt = () => {
    const t = greetPrompt.trim();
    if (!t) return;
    onAskCodyPrompt && onAskCodyPrompt(t);
    setGreetPrompt("");
  };
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

  // Resolve pinned IDs into renderable cards (capped at 4)
  const pinnedCards = [];
  for (const pinId of pinnedSet) {
    if (pinnedCards.length >= 4) break;
    if (typeof pinId === "string" && pinId.startsWith("skill:")) {
      const [projectId, skillId] = pinId.slice(6).split("/");
      const proj = projects.find((x) => x.id === projectId);
      const meta = {
        estimation: { icon: "calculate", eyebrow: "Skill result · Estimation", value: (proj && proj.estimate) || "—", delta: "+2.3% vs v2", theme: "orange" },
        rfc: { icon: "rule", eyebrow: "Skill result · Clarifications", value: "23 issues", delta: "3 critical", theme: "orange" },
        bid: { icon: "compare_arrows", eyebrow: "Skill result · Bid Level Analysis", value: "$384.7k", delta: "−$74k vs ROM", theme: "tiffany" },
      }[skillId];
      if (proj && meta) pinnedCards.push({ pinId, kind: "skill", proj, skillId, meta });
    } else if (typeof pinId === "string" && pinId.startsWith("drawing:")) {
      const [projectId, drawingId] = pinId.slice(8).split("/");
      const proj = projects.find((x) => x.id === projectId);
      const drawing = (window.BC_DATA.drawings || []).find((d) => d.id === drawingId);
      if (proj && drawing) pinnedCards.push({ pinId, kind: "drawing", proj, drawing });
    } else {
      const p = projects.find((x) => x.id === pinId);
      if (p) pinnedCards.push({ pinId, kind: "project", p });
    }
  }

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Home", bold: true }]}
        actions={<button className="btn-primary" onClick={onNewProject}><Icon name="add" size={16} />New project</button>}
        onAskAI={onAskAI} />
      
      <div className="canvas">
        <div className="greet">
          <div className="greet-content">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "rgba(39,38,53,0.55)", marginBottom: 8 }}>Tuesday morning · April 28</div>
            <h1>Welcome back, Jamie.</h1>

            {/* Inline Cody prompt bar — submitting routes the text into the Ask Cody panel */}
            <div className="greet-prompt" onClick={(e) => { const ta = e.currentTarget.querySelector("input"); ta && ta.focus(); }}>
              <CodyMark size={16} className="greet-prompt-spark" />
              <input
                type="text"
                placeholder="Ask Cody anything — or pick a quick action below"
                value={greetPrompt}
                onChange={(e) => setGreetPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitGreetPrompt(); } }}
              />
              <button
                className="greet-prompt-send"
                disabled={!greetPrompt.trim()}
                onClick={(e) => { e.stopPropagation(); submitGreetPrompt(); }}
                title="Send to Cody">
                <Icon name="arrow_forward" size={16} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button className="ai-pill" onClick={onOpenDailyReport || onAskAI}><Icon name="auto_awesome" size={14} style={{ color: "#fff" }} />Brief me on overnight</button>
              <button className="quick-pill" onClick={() => onStartCreateProjectFlow ? onStartCreateProjectFlow() : (onNewProject && onNewProject())}>
                <Icon name="add" size={14} />Create new project
              </button>
              <button className="quick-pill" onClick={() => onStartRomEstimateFlow && onStartRomEstimateFlow()}>
                <Icon name="calculate" size={14} />Get a ROM estimate
              </button>
              <button className="quick-pill" onClick={() => onStartAddFilesFlow ? onStartAddFilesFlow() : onOpenProject("rec-wellness", { tab: "files" })}>
                <Icon name="upload_file" size={14} />Add files to an existing project
              </button>
            </div>
          </div>
          <span className="robot"><img src="design-system/cody.png" alt="" /></span>
        </div>

        {pinnedCards.length > 0 && (
          <>
            <div className="section-h" style={{ marginTop: 64 }}>
              <Icon name="push_pin" size={16} style={{ color: "var(--orange-500)" }} />
              <h3>Pinned</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${pinnedCards.length}, 1fr)`, gap: 16 }}>
              {pinnedCards.map((c) => {
                if (c.kind === "skill") {
                  const isTiffany = c.meta.theme === "tiffany";
                  return (
                    <div key={c.pinId} className="pin-card"
                         style={isTiffany ? { background: "rgba(72,193,181,0.04)", border: "1px solid rgba(72,193,181,0.20)" } : { background: "rgba(232,70,0,0.04)", border: "1px solid rgba(232,70,0,0.20)" }}
                         onClick={() => onOpenProject(c.proj.id, { tab: c.skillId })}
                         onContextMenu={(e) => onCtxMenu && onCtxMenu([
                           { label: "Open", icon: "open_in_browser", onClick: () => onOpenProject(c.proj.id, { tab: c.skillId }) },
                           { divider: true },
                           { label: "Unpin", icon: "push_pin", onClick: () => onPin(c.pinId) },
                         ], e)}>
                      <span className="pin-toggle" onClick={(e) => {e.stopPropagation();onPin(c.pinId);}}><Icon name="push_pin" /></span>
                      <Icon className="bg" name={c.meta.icon} />
                      <span className="pin-kind" style={{ color: isTiffany ? "var(--tiffany-400)" : "var(--orange-500)" }}>{c.meta.eyebrow}</span>
                      <span className="pin-title">{c.proj.name}</span>
                      <span className="pin-meta">
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--bc-strong)", letterSpacing: "-0.01em" }}>{c.meta.value}</span>
                        <span style={{ marginLeft: "auto", color: isTiffany ? "var(--tiffany-400)" : "var(--orange-500)", fontWeight: 700 }}>{c.meta.delta}</span>
                      </span>
                    </div>
                  );
                }
                if (c.kind === "drawing") {
                  return (
                    <div key={c.pinId} className="pin-card"
                         onClick={() => onOpenDrawing && onOpenDrawing(c.drawing.id, c.proj.id)}
                         onContextMenu={(e) => onCtxMenu && onCtxMenu([
                           { label: "Open", icon: "open_in_browser", onClick: () => onOpenDrawing && onOpenDrawing(c.drawing.id, c.proj.id) },
                           { divider: true },
                           { label: "Unpin", icon: "push_pin", onClick: () => onPin(c.pinId) },
                         ], e)}>
                      <span className="pin-toggle" onClick={(e) => {e.stopPropagation();onPin(c.pinId);}}><Icon name="push_pin" /></span>
                      <Icon className="bg" name="architecture" />
                      <span className="pin-kind">Drawing · {c.drawing.trade}</span>
                      <span className="pin-title">{c.drawing.id} — {c.drawing.title}</span>
                      <span className="pin-meta">
                        <Icon name="folder_open" size={13} style={{ opacity: 0.55 }} />
                        <span>{c.proj.name}</span>
                        <span style={{ marginLeft: "auto", color: "var(--bc-muted)" }}>{c.drawing.scale}</span>
                      </span>
                    </div>
                  );
                }
                // project
                const p = c.p;
                return (
                  <div key={c.pinId} className="pin-card" onClick={() => onOpenProject(p.id)}
                       onContextMenu={(e) => onCtxMenu && onCtxMenu([
                         { label: "Open", icon: "open_in_browser", onClick: () => onOpenProject(p.id) },
                         { label: "Open in new tab", icon: "tab", onClick: () => onOpenProjectInNewTab && onOpenProjectInNewTab(p.id) },
                         { divider: true },
                         { label: "Unpin", icon: "push_pin", onClick: () => onPin(p.id) },
                       ], e)}>
                    <span className="pin-toggle" onClick={(e) => {e.stopPropagation();onPin(p.id);}}><Icon name="push_pin" /></span>
                    <Icon className="bg" name={p.icon} />
                    <span className="pin-kind">{p.kind}</span>
                    <span className="pin-title">{p.name}</span>
                    <span className="pin-meta">
                      <Icon name="schedule" size={13} style={{ opacity: 0.55 }} />
                      <span>Last edit · {p.lastEdit}</span>
                      <span style={{ marginLeft: "auto", fontWeight: 700, color: "var(--bc-strong)" }}>{p.estimate}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* RECENT SKILL RUNS — full width, 64px gap from previous section */}
        <div className="section-h" style={{ marginTop: 64 }}>
          <Icon name="auto_awesome" size={16} style={{ color: "var(--orange-500)" }} />
          <h3>RECENT SKILL RUNS</h3>
        </div>
        <div className="card no-pad">
          <table className="bc-table">
            <thead><tr><th>Skill</th><th>Project</th><th>Status</th><th>When</th><th className="num">Result</th></tr></thead>
            <tbody>
              {[...runs].sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || "")).map((r) =>
              <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => {
                const tab = r.status === "done" ? skillToTab(r.skill) : null;
                if (tab) onOpenProject(r.projectId, { tab });
                else onOpenProject(r.projectId);
              }}>
                  <td><div className="item-title" style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(39,38,53,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={skillIcon(r.skill)} size={18} style={{ opacity: 0.55 }} /></div>{r.skill}</div></td>
                  <td><div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.project}</div></td>
                  <td>{r.status === "done" ? <span className="badge b-done">Done</span> : <span className="badge b-working"><span className="dot" />{Math.round((r.progress || 0) * 100)}%</span>}</td>
                  <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.when}</span></td>
                  <td className="num">
                    {r.ai && r.ai.total && <b>{r.ai.total}</b>}
                    {r.ai && r.ai.issues != null && <b>{r.ai.issues} issues</b>}
                    {r.ai && r.ai.savings && <b style={{ color: "var(--tiffany-400)" }}>−{r.ai.savings}</b>}
                    {!r.ai && "—"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}

// =====================================================
// PROJECTS LIST (full grid in detail column)
// =====================================================
function ProjectsScreen({ ctx, projects, onOpen, onOpenInNewTab, pinnedSet, onPin, onAskAI, onNewProject, onCtxMenu }) {
  // Local filter & sort state (the secondary list column was removed earlier)
  const [localStatus, setLocalStatus] = useS("active");   // "active" | "archived"
  const [localPhase, setLocalPhase] = useS("all");        // "all" | "bid" | "won" | "lost"
  const [localSort, setLocalSort] = useS({ key: "date", direction: "desc" });
  const toggleLocalSort = (key) => {
    setLocalSort(prev => prev.key === key
      ? { key, direction: prev.direction === "desc" ? "asc" : "desc" }
      : { key, direction: key === "name" ? "asc" : "desc" }
    );
  };

  const estimateValue = (p) => {
    if (!p.estimate || p.estimate === "—") return -1;
    const m = p.estimate.replace(/[^0-9.]/g, "");
    const n = parseFloat(m);
    if (!Number.isFinite(n)) return -1;
    if (/M/.test(p.estimate)) return n * 1e6;
    if (/k/i.test(p.estimate)) return n * 1e3;
    return n;
  };

  const filtered = projects.filter((p) => {
    const isArchived = !!p.archived;
    if (localStatus === "archived") return isArchived;
    if (isArchived) return false;
    if (localPhase === "all") return true;
    return p.phase === localPhase;
  });

  const sorted = filtered.slice().sort((a, b) => {
    const { key, direction } = localSort;
    if (key === "date") {
      const ai = projects.indexOf(a), bi = projects.indexOf(b);
      return direction === "desc" ? ai - bi : bi - ai;
    }
    if (key === "name") {
      return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (key === "estimate") {
      const av = estimateValue(a), bv = estimateValue(b);
      // Push "—" (-1) to the end regardless of direction
      if (av < 0 && bv >= 0) return 1;
      if (bv < 0 && av >= 0) return -1;
      return direction === "desc" ? bv - av : av - bv;
    }
    return 0;
  });

  const counts = {
    active: projects.filter(p => !p.archived).length,
    archived: projects.filter(p => p.archived).length,
    draft: projects.filter(p => !p.archived && p.phase === "draft").length,
    bid: projects.filter(p => !p.archived && p.phase === "bid").length,
    won: projects.filter(p => !p.archived && p.phase === "won").length,
    lost: projects.filter(p => !p.archived && p.phase === "lost").length,
  };

  const phaseBadge = {
    draft: { label: "Draft", className: "b-draft", dot: false },
    bid: { label: "Bid Phase", className: "b-draft", dot: false },
    won: { label: "Won", className: "b-draft", dot: false },
    lost: { label: "Lost", className: "b-draft", dot: false },
  };

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Projects", bold: true }]}
        actions={<button className="btn-primary" onClick={onNewProject}><Icon name="add" size={16} />New project</button>}
        onAskAI={onAskAI} />

      <div className="canvas">
        <h2 className="page-h1" style={{ marginBottom: 16 }}>Projects</h2>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          {/* Filter 1 — Active / Archived (below title, left) */}
          <div className="chip-group">
            <button
              className={"chip " + (localStatus === "active" ? "active" : "")}
              onClick={() => { setLocalStatus("active"); setLocalPhase("all"); }}>
              Active <span className="chip-count">{counts.active}</span>
            </button>
            <button
              className={"chip " + (localStatus === "archived" ? "active" : "")}
              onClick={() => { setLocalStatus("archived"); setLocalPhase("all"); }}>
              Archived <span className="chip-count">{counts.archived}</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Filter 2 — All / Draft / Bid Phase / Won / Lost (only when Active) */}
            {localStatus === "active" && (
              <div className="chip-group">
                <button
                  data-phase="all"
                  className={"chip " + (localPhase === "all" ? "active" : "")}
                  onClick={() => setLocalPhase("all")}>
                  All <span className="chip-count">{counts.active}</span>
                </button>
                <button
                  data-phase="draft"
                  className={"chip " + (localPhase === "draft" ? "active" : "")}
                  onClick={() => setLocalPhase(localPhase === "draft" ? "all" : "draft")}>
                  Draft <span className="chip-count">{counts.draft}</span>
                </button>
                <button
                  data-phase="bid"
                  className={"chip " + (localPhase === "bid" ? "active" : "")}
                  onClick={() => setLocalPhase(localPhase === "bid" ? "all" : "bid")}>
                  Bid Phase <span className="chip-count">{counts.bid}</span>
                </button>
                <button
                  data-phase="won"
                  className={"chip " + (localPhase === "won" ? "active" : "")}
                  onClick={() => setLocalPhase(localPhase === "won" ? "all" : "won")}>
                  Won <span className="chip-count">{counts.won}</span>
                </button>
                <button
                  data-phase="lost"
                  className={"chip " + (localPhase === "lost" ? "active" : "")}
                  onClick={() => setLocalPhase(localPhase === "lost" ? "all" : "lost")}>
                  Lost <span className="chip-count">{counts.lost}</span>
                </button>
              </div>
            )}

            {/* Sort — seg control with direction toggle */}
            <div className="seg">
              <button
                className={localSort.key === "date" ? "active" : ""}
                onClick={() => toggleLocalSort("date")}
                title={"Sort by date · " + (localSort.key === "date" && localSort.direction === "asc" ? "oldest first" : "newest first")}>
                <Icon name="schedule" size={13} />Date
                {localSort.key === "date" && <Icon name={localSort.direction === "desc" ? "arrow_downward" : "arrow_upward"} size={12} />}
              </button>
              <button
                className={localSort.key === "name" ? "active" : ""}
                onClick={() => toggleLocalSort("name")}
                title={"Sort by name · " + (localSort.key === "name" && localSort.direction === "desc" ? "Z to A" : "A to Z")}>
                <Icon name="sort_by_alpha" size={13} />Name
                {localSort.key === "name" && <Icon name={localSort.direction === "asc" ? "arrow_upward" : "arrow_downward"} size={12} />}
              </button>
              <button
                className={localSort.key === "estimate" ? "active" : ""}
                onClick={() => toggleLocalSort("estimate")}
                title={"Sort by estimate · " + (localSort.key === "estimate" && localSort.direction === "asc" ? "low to high" : "high to low")}>
                <Icon name="payments" size={13} />Estimate
                {localSort.key === "estimate" && <Icon name={localSort.direction === "desc" ? "arrow_downward" : "arrow_upward"} size={12} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {sorted.map((p) =>
          <div key={p.id} className="pin-card" style={{ minHeight: 180, padding: "20px 24px" }} onClick={() => onOpen(p.id)}
               onContextMenu={(e) => onCtxMenu && onCtxMenu([
                 { label: "Open", icon: "open_in_browser", onClick: () => onOpen(p.id) },
                 { label: "Open in new tab", icon: "tab", onClick: () => onOpenInNewTab && onOpenInNewTab(p.id) },
                 { divider: true },
                 { label: pinnedSet.has(p.id) ? "Unpin" : "Pin", icon: "push_pin", onClick: () => onPin(p.id) },
               ], e)}>
              <span className="pin-toggle" onClick={(e) => {e.stopPropagation();onPin(p.id);}}>
                <Icon name={pinnedSet.has(p.id) ? "push_pin" : "push_pin"} style={{ opacity: pinnedSet.has(p.id) ? 1 : 0.30 }} />
              </span>
              <Icon className="bg" name={p.icon} />
              <span className="pin-kind">{p.kind}</span>
              <span className="pin-title">{p.name}</span>
              <div>
                {phaseBadge[p.phase] && (
                  <span className={"badge " + phaseBadge[p.phase].className}>
                    {phaseBadge[p.phase].dot && <span className="dot" />}
                    {phaseBadge[p.phase].label}
                  </span>
                )}
              </div>
              <div className="pin-meta" style={{ fontSize: 12 }}>
                <span>{p.lastEdit}</span>
                <span style={{ marginLeft: "auto", fontWeight: 700, color: "var(--bc-strong)" }}>{p.estimate}</span>
              </div>
            </div>
          )}
          {sorted.length === 0 && (
            <div className="pin-card" style={{ minHeight: 180, padding: "20px 24px", background: "transparent", border: "1.5px dashed rgba(39,38,53,0.20)", color: "var(--bc-muted)", alignItems: "center", justifyContent: "center", textAlign: "center", gridColumn: "1 / -1" }}>
              <Icon name="inbox" size={40} style={{ color: "var(--bc-muted)" }} />
              <div style={{ fontWeight: 700, marginTop: 8, color: "var(--bc-strong)" }}>No projects match these filters</div>
              <div style={{ fontSize: 12 }}>Try a different phase or clear the filter</div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

Object.assign(window, { HomeScreen, ProjectsScreen });