// BuildCrew.AI — Screens (Home, Projects, Skills, Reports, Labor, Settings, Project Home, Files)
const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

// =====================================================
// FIRST-USER EXPERIENCE (FUX)
// One-time onboarding sequence shown on a fresh account:
//   1. Hex-ripple loading video (plays once)
//   2. "Welcome to BuildCrew.AI, [first name]" (4s)
//   3. "To start, tell us a little about yourself…" (4s)
//   4. Four onboarding questions (user-paced)
//   5. Thank-you message → onComplete → fresh-user Home
// =====================================================
function FUXOnboarding({ user, onComplete }) {
  const PHASES = ["video", "welcome", "intro", "q1", "q2", "q3", "q4", "thanks"];
  const [phase, setPhase] = useS("video");
  const [videoEnding, setVideoEnding] = useS(false);
  const [answers, setAnswers] = useS({ q1: [], q2: [], q3: [], q4: null });

  const firstName = (user && user.name) ? user.name.split(" ")[0] : "there";
  const company = (user && user.company) || "your company";

  const advance = () => {
    const i = PHASES.indexOf(phase);
    if (i < PHASES.length - 1) setPhase(PHASES[i + 1]);
    else onComplete && onComplete();
  };

  // Auto-advance timers for welcome/intro/thanks
  useE(() => {
    if (phase === "welcome" || phase === "intro") {
      const t = setTimeout(advance, 4000);
      return () => clearTimeout(t);
    }
    if (phase === "thanks") {
      // Hold for the full 4000ms .fux-fade keyframe (0 → 1 → 0) so the
      // thank-you message has time to fade OUT before we unmount and
      // hand off to the Home screen.
      const t = setTimeout(() => onComplete && onComplete(), 4000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Fallback for the video phase — if for any reason `onEnded` doesn't fire
  // (autoplay blocked, no media, etc.), kick off the fade-out after 8s so the
  // flow never sticks.
  useE(() => {
    if (phase !== "video") return;
    const t = setTimeout(endVideo, 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Video → welcome handoff: trigger a 700ms fade-out on the video first,
  // THEN advance the phase. The welcome message has its own fade-in so the
  // two transitions chain into a smooth crossfade.
  const endVideo = () => {
    if (videoEnding) return;
    setVideoEnding(true);
    setTimeout(() => advance(), 700);
  };

  const questions = {
    q1: {
      title: "What are the most time-consuming elements of your job?",
      hint: "Select one or more",
      multi: true,
      options: [
        { id: "drawings", label: "Reviewing drawings and specs", icon: "architecture" },
        { id: "estimating", label: "Preparing estimates and takeoffs", icon: "calculate" },
        { id: "coordination", label: "Coordinating with subcontractors", icon: "groups" },
        { id: "rfis", label: "Tracking RFIs and clarifications", icon: "rule" },
      ],
    },
    q2: {
      title: "Which of these would you consider most problematic or annoying?",
      hint: "Select one or more",
      multi: true,
      options: [
        { id: "takeoffs", label: "Manual quantity takeoffs", icon: "straighten" },
        { id: "bids", label: "Comparing bids across formats", icon: "compare_arrows" },
        { id: "missing", label: "Chasing down missing documents", icon: "find_in_page" },
        { id: "updates", label: "Updating schedules and budgets", icon: "schedule" },
      ],
    },
    q3: {
      title: "What's currently in your tech stack that supports your daily workflows?",
      hint: "Select one or more",
      multi: true,
      options: [
        { id: "bluebeam", label: "Bluebeam Revu", icon: "draw" },
        { id: "procore", label: "Procore", icon: "domain" },
        { id: "ost", label: "OnScreen Takeoff / PlanSwift", icon: "square_foot" },
        { id: "excel", label: "Microsoft Excel", icon: "table_view" },
      ],
    },
    q4: {
      title: "How familiar are you with AI?",
      hint: "Pick the one that fits best",
      multi: false,
      options: [
        { id: "daily", label: "I use AI tools daily" },
        { id: "some", label: "I've experimented with a few" },
        { id: "heard", label: "I've heard about it but haven't tried" },
        { id: "new", label: "Brand new to me" },
      ],
    },
  };

  const onPick = (qid, optId) => {
    setAnswers(prev => {
      const q = questions[qid];
      if (q.multi) {
        const cur = prev[qid] || [];
        const next = cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId];
        return { ...prev, [qid]: next };
      }
      return { ...prev, [qid]: optId };
    });
  };

  const canContinue = (qid) => {
    const q = questions[qid];
    const val = answers[qid];
    return q.multi ? Array.isArray(val) && val.length > 0 : !!val;
  };

  const isQuestionPhase = phase.startsWith("q");

  return (
    <div className="fux-canvas">
      {phase === "video" && (
        <video
          key="fux-video"
          className={"fux-video " + (videoEnding ? "is-ending" : "")}
          src="animated/skill-loading.mp4"
          autoPlay
          muted
          playsInline
          onEnded={endVideo}
          aria-hidden="true"
        />
      )}

      {phase === "welcome" && (
        <div key="fux-welcome" className="fux-stage fux-fade">
          <div className="fux-title">Welcome to BuildCrew.AI, {firstName}.</div>
        </div>
      )}

      {phase === "intro" && (
        <div key="fux-intro" className="fux-stage fux-fade">
          <div className="fux-title">To start, tell us a little about yourself and your role at {company}.</div>
        </div>
      )}

      {isQuestionPhase && (() => {
        const q = questions[phase];
        return (
          <div key={"fux-" + phase} className="fux-stage fux-fade-in">
            <div className="fux-q">
              <div className="fux-q-progress">Question {Number(phase.slice(1))} of 4</div>
              <h2 className="fux-q-title">{q.title}</h2>
              <div className="fux-q-hint">{q.hint}</div>
              <div className="fux-q-options">
                {q.options.map(opt => {
                  const selected = q.multi
                    ? (answers[phase] || []).includes(opt.id)
                    : answers[phase] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      className={"fux-option " + (selected ? "is-selected" : "")}
                      onClick={() => onPick(phase, opt.id)}>
                      {opt.icon && <Icon name={opt.icon} size={18} />}
                      <span>{opt.label}</span>
                      <span className="fux-option-check">
                        <Icon name={selected ? "check_circle" : (q.multi ? "check_box_outline_blank" : "radio_button_unchecked")} size={18} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="fux-q-foot">
                <button
                  className="btn-primary fux-q-next"
                  disabled={!canContinue(phase)}
                  onClick={advance}>
                  {phase === "q4" ? "Finish" : "Continue"}
                  <Icon name="arrow_forward" size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {phase === "thanks" && (
        <div key="fux-thanks" className="fux-stage fux-fade">
          <div className="fux-title">Thanks, {firstName}.</div>
          <div className="fux-subtitle">Setting up your workspace…</div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// FUX COACHMARKS — guided tour of key UI elements shown after a fresh
// user lands on Home for the first time. Sequenced tooltips highlight
// the side nav, theme switcher, Home content, Ask Cody, and the
// Create-first-project CTA.
// =====================================================
function FUXCoachmarks({ onComplete, onNewProject }) {
  const STEPS = [
    { id: "nav",    selector: ".col-nav",                        placement: "right",  title: "Side navigation",     desc: "Your workspace lives here. Jump between Home, Projects, Skills, Reports, and Files at any time." },
    { id: "theme",  selector: ".col-nav .theme-cycle",           placement: "right",  title: "Theme switcher",       desc: "Click to cycle between Light, Hybrid, and Dark — pick whichever reads best for your screen." },
    { id: "home",   selector: ".greet",                          placement: "below",  title: "Your Home screen",     desc: "Personalized just for you. As you work, this is where your most important info — recent projects, pinned items, and skill runs — surfaces first." },
    { id: "recent", selector: null,                              placement: "center", title: "Recent projects",     desc: "Quick access to the projects you've opened most recently. As soon as you create one, it'll appear here." },
    { id: "pinned", selector: null,                              placement: "center", title: "Pinned items",         desc: "Star any project, skill result, or drawing to pin it to Home for one-click access." },
    { id: "runs",   selector: null,                              placement: "center", title: "Recent skill runs",    desc: "A live log of every Cody skill run across your projects — with status, results, and links straight to the report." },
    { id: "cody",   selector: ".ai-rail-collapsed, .ai-panel",   placement: "left",   title: "Ask Cody",             desc: "Your AI assistant. Drag-drop files, ask follow-up questions, or kick off a guided skill run from here." },
    { id: "create", selector: ".greet-content .ai-pill",         placement: "below",  title: "Create your first project", desc: "Ready to get started? Drop in your plans and Cody will index them. Or skip for now and come back any time.", isFinal: true },
  ];
  const [step, setStep] = useS(0);
  const [pos, setPos] = useS({ top: 0, left: 0, placement: "center" });
  const cur = STEPS[step];

  // Position the tooltip card relative to the target element on each step.
  // Apply a temporary highlight class to the target while it's active.
  useE(() => {
    if (!cur) return;
    let target = null;
    if (cur.selector) {
      // selector may be a comma-separated list — pick the first visible match
      const candidates = cur.selector.split(",").map(s => s.trim());
      for (const s of candidates) {
        const el = document.querySelector(s);
        if (el && el.offsetParent !== null) { target = el; break; }
      }
    }
    if (target) {
      const rect = target.getBoundingClientRect();
      let top, left;
      if (cur.placement === "right")      { top = rect.top + rect.height / 2;  left = rect.right + 20; }
      else if (cur.placement === "left")  { top = rect.top + rect.height / 2;  left = rect.left - 20; }
      else if (cur.placement === "below") { top = rect.bottom + 16;            left = rect.left + rect.width / 2; }
      else if (cur.placement === "above") { top = rect.top - 16;               left = rect.left + rect.width / 2; }
      else                                { top = window.innerHeight / 2;      left = window.innerWidth / 2; }
      setPos({ top, left, placement: cur.placement });
      target.classList.add("is-coachmark-target");
    } else {
      setPos({ top: window.innerHeight / 2, left: window.innerWidth / 2, placement: "center" });
    }
    return () => { if (target) target.classList.remove("is-coachmark-target"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const advance = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete && onComplete();
  };
  const skip = () => onComplete && onComplete();
  const startNewProject = () => {
    onComplete && onComplete();
    onNewProject && onNewProject();
  };

  if (!cur) return null;

  const tooltipStyle = pos.placement === "center"
    ? { top: "50%", left: "50%" }
    : { top: pos.top, left: pos.left };

  return (
    <div className="fux-coachmarks" role="dialog" aria-modal="true" aria-label={cur.title}>
      <div className={"fux-coach-tip fux-coach-" + pos.placement} style={tooltipStyle}>
        <div className="fux-coach-progress">Step {step + 1} of {STEPS.length}</div>
        <h3 className="fux-coach-title">{cur.title}</h3>
        <p className="fux-coach-desc">{cur.desc}</p>
        <div className="fux-coach-foot">
          <button className="btn-ghost fux-coach-skip" onClick={skip}>
            {cur.isFinal ? "Maybe later" : "Skip tour"}
          </button>
          {cur.isFinal ? (
            <button className="btn-primary" onClick={startNewProject}>
              <Icon name="add" size={14} />Create my project
            </button>
          ) : (
            <button className="btn-primary" onClick={advance}>
              Next<Icon name="arrow_forward" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HOME
// =====================================================
function HomeScreen({ ctx, projects, runs, onPin, pinnedSet, onOpenProject, onOpenProjectInNewTab, onOpenDrawing, onAskAI, onNewProject, onOpenDailyReport, onCtxMenu, onAskCodyPrompt, onStartCreateProjectFlow, onStartAddFilesFlow, onStartRomEstimateFlow, freshMode, user, onFuxFullyComplete }) {
  const [greetPrompt, setGreetPrompt] = useS("");
  // FUX onboarding sequence — shown once per fresh-mode session.
  const [fuxDone, setFuxDone] = useS(false);
  // After FUX completes, a guided coachmark tour highlights key UI elements
  // (side nav, theme switcher, Home sections, Ask Cody, Create-project CTA).
  // The tour is delayed slightly so the post-FUX fade-in finishes first,
  // then the user advances at their own pace.
  const [coachmarksActive, setCoachmarksActive] = useS(false);
  const [coachmarksDone, setCoachmarksDone] = useS(false);
  useE(() => {
    if (freshMode && fuxDone && !coachmarksDone && !coachmarksActive) {
      const t = setTimeout(() => setCoachmarksActive(true), 900);
      return () => clearTimeout(t);
    }
  }, [freshMode, fuxDone, coachmarksDone, coachmarksActive]);
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

  // Fresh-user mode — no projects in the workspace yet. Show a focused
  // welcome moment with a single CTA pointing at the New Project modal.
  const isFresh = !projects || projects.length === 0;

  // First-user experience onboarding takes over the entire screen until
  // the user finishes (or skips reaching the end of the sequence).
  if (freshMode && !fuxDone) {
    return (
      <div className="col-detail">
        <FUXOnboarding
          user={user}
          onComplete={() => {
            setFuxDone(true);
            onFuxFullyComplete && onFuxFullyComplete();
          }}
        />
      </div>
    );
  }

  // After completing FUX, fade the Home content in so the handoff from the
  // onboarding thank-you to the empty Home feels continuous, not a hard cut.
  const justFinishedFux = freshMode && fuxDone;

  return (
    <div className={"col-detail " + (justFinishedFux ? "fux-post-fade" : "")}>
      <Taskbar
        crumbs={[{ label: "Home", bold: true }]}
        onAskAI={onAskAI} />

      <div className="canvas">
        <div className="greet">
          <div className="greet-content">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "rgba(39,38,53,0.55)", marginBottom: 8 }}>
              {isFresh ? "Welcome aboard" : "Tuesday morning · April 28"}
            </div>
            <h1>{isFresh ? "Welcome to BuildCrew, Victor." : "Welcome back, Victor."}</h1>
            {isFresh && (
              <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.55, color: "rgba(39,38,53,0.70)", maxWidth: 540 }}>
                You're all set up. The fastest way to see what Cody can do is to start your first project — drop in your plans and specs and Cody will take it from there.
              </p>
            )}

            {/* Inline Cody prompt bar — submitting routes the text into the Ask Cody panel */}
            {!isFresh && (
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
            )}

            <div style={{ display: "flex", gap: 8, marginTop: isFresh ? 20 : 16, flexWrap: "wrap" }}>
              {isFresh ? (
                <button className="ai-pill" onClick={onNewProject}>
                  <Icon name="add" size={14} style={{ color: "#fff" }} />Create your first project
                </button>
              ) : (
                <>
                  <button className="ai-pill" onClick={onOpenDailyReport || onAskAI}><Icon name="auto_awesome" size={14} style={{ color: "#fff" }} />Brief me on overnight</button>
                  <button className="quick-pill" onClick={() => onNewProject && onNewProject()}>
                    <Icon name="add" size={14} />Create new project
                  </button>
                  <button className="quick-pill" onClick={() => onStartRomEstimateFlow && onStartRomEstimateFlow()}>
                    <Icon name="calculate" size={14} />Get a ROM estimate
                  </button>
                  <button className="quick-pill" onClick={() => onStartAddFilesFlow ? onStartAddFilesFlow() : onOpenProject("rec-wellness", { tab: "files" })}>
                    <Icon name="upload_file" size={14} />Add files to an existing project
                  </button>
                </>
              )}
            </div>
          </div>
          <span className="robot">
            <video
              src="animated/cody-greet.mp4"
              poster="design-system/cody.png"
              autoPlay
              muted
              playsInline
              aria-hidden="true"
              onEnded={(e) => {
                const v = e.currentTarget;
                // Pause on the last frame, then replay after a 10s delay.
                setTimeout(() => { try { v.currentTime = 0; v.play(); } catch (err) {} }, 10000);
              }}
            />
          </span>
        </div>

        {/* RECENT PROJECTS — card grid, 64px gap from the greeting */}
        {!isFresh && (() => {
          const recent = projects.filter(p => !p.archived).slice(0, 4);
          if (recent.length === 0) return null;
          return (
            <>
              <div className="section-h" style={{ marginTop: 64 }}>
                <Icon name="folder_open" size={16} style={{ color: "var(--orange-500)" }} />
                <h3>RECENT PROJECTS</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {recent.map((p) => (
                  <div key={p.id} className="pin-card" onClick={() => onOpenProject(p.id)}
                       onContextMenu={(e) => onCtxMenu && onCtxMenu([
                         { label: "Open", icon: "open_in_browser", onClick: () => onOpenProject(p.id) },
                         { label: "Open in new tab", icon: "tab", onClick: () => onOpenProjectInNewTab && onOpenProjectInNewTab(p.id) },
                         { divider: true },
                         { label: pinnedSet.has(p.id) ? "Unpin" : "Pin", icon: "push_pin", onClick: () => onPin(p.id) },
                       ], e)}>
                    <Icon className="bg" name={p.icon} />
                    <span className="pin-kind">{p.kind}</span>
                    <span className="pin-title">{p.name}</span>
                    <span className="pin-meta">
                      <Icon name="schedule" size={13} style={{ opacity: 0.55 }} />
                      <span>Last viewed · {p.lastEdit}</span>
                      <span style={{ marginLeft: "auto", fontWeight: 700, color: "var(--bc-strong)" }}>{p.estimate}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

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
                         style={{ background: "rgba(0,116,232,0.04)", border: "1px solid rgba(0,116,232,0.20)" }}
                         onClick={() => onOpenDrawing && onOpenDrawing(c.drawing.id, c.proj.id)}
                         onContextMenu={(e) => onCtxMenu && onCtxMenu([
                           { label: "Open", icon: "open_in_browser", onClick: () => onOpenDrawing && onOpenDrawing(c.drawing.id, c.proj.id) },
                           { divider: true },
                           { label: "Unpin", icon: "push_pin", onClick: () => onPin(c.pinId) },
                         ], e)}>
                      <span className="pin-toggle" onClick={(e) => {e.stopPropagation();onPin(c.pinId);}}><Icon name="push_pin" /></span>
                      <Icon className="bg" name="architecture" />
                      <span className="pin-kind" style={{ color: "#0074E8" }}>Drawing · {c.drawing.trade}</span>
                      <span className="pin-title">{c.drawing.id} — {c.drawing.title}</span>
                      <span className="pin-meta">
                        <Icon name="folder_open" size={13} style={{ opacity: 0.55, color: "#0074E8" }} />
                        <span>{c.proj.name}</span>
                        <span style={{ marginLeft: "auto", color: "#0074E8", fontWeight: 700 }}>{c.drawing.scale}</span>
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
        {!isFresh && runs && runs.length > 0 && (<>
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
        </>)}
      </div>
      {coachmarksActive && !coachmarksDone && (
        <FUXCoachmarks
          onComplete={() => { setCoachmarksActive(false); setCoachmarksDone(true); }}
          onNewProject={onNewProject}
        />
      )}
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

        {projects.length === 0 ? (
          <div style={{ border: "1px dashed rgba(39,38,53,0.15)", borderRadius: 16, padding: 64, textAlign: "center", marginTop: 24 }}>
            <Icon name="folder_open" size={48} style={{ color: "rgba(39,38,53,0.30)" }} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--raisin-800)", marginTop: 12 }}>No projects yet</div>
            <div style={{ fontSize: 13, color: "var(--bc-muted)", maxWidth: 420, margin: "8px auto 20px", lineHeight: 1.5 }}>
              Create your first project to start uploading drawings, running skills, and tracking bids. Cody will index everything automatically.
            </div>
            <button className="btn-primary" onClick={onNewProject}>
              <Icon name="add" size={16} />Create your first project
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>);

}

Object.assign(window, { HomeScreen, ProjectsScreen });