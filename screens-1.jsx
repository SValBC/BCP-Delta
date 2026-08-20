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
  const PHASES = ["video", "welcome", "intro", "q1", "q2", "q3", "q4", "q5", "thanks"];
  const [phase, setPhase] = useS("video");
  const [videoEnding, setVideoEnding] = useS(false);
  const [answers, setAnswers] = useS({ q1: [], q2: [], q3: [], q4: null, q5: null });
  const [otherDivisionFormat, setOtherDivisionFormat] = useS("");

  const firstName = (user && user.name) ? user.name.split(" ")[0] : "there";
  const company = (user && user.company) || "your company";

  const advance = () => {
    const i = PHASES.indexOf(phase);
    if (i < PHASES.length - 1) setPhase(PHASES[i + 1]);
    else finish();
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
      const t = setTimeout(() => finish(), 4000);
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
    q5: {
      title: "Which Division formatting do you use?",
      hint: "We'll organize takeoffs, estimates, and reports using this format throughout the platform.",
      multi: false,
      options: [
        { id: "masterformat", label: "MasterFormat",  icon: "format_list_numbered" },
        { id: "uniformat",    label: "Uniformat",      icon: "category" },
        { id: "omniclass",    label: "Omniclass",      icon: "schema" },
        { id: "other",        label: "Other",          icon: "edit" },
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
    if (q.multi) return Array.isArray(val) && val.length > 0;
    // q5 "Other" requires the user to type in their format name before continuing.
    if (qid === "q5" && val === "other") return otherDivisionFormat.trim().length > 0;
    return !!val;
  };

  // Wrap onComplete so we pass the captured answers (specifically the
  // chosen Division format) back to the App level for global use.
  const finish = () => {
    if (!onComplete) return;
    const result = {
      ...answers,
      divisionFormat: answers.q5 || "masterformat",
      divisionFormatOther: answers.q5 === "other" ? otherDivisionFormat.trim() : "",
    };
    onComplete(result);
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
              <div className="fux-q-progress">Question {Number(phase.slice(1))} of 5</div>
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
              {phase === "q5" && answers.q5 === "other" && (
                <div className="fux-q-other">
                  <label className="fux-q-other-label" htmlFor="fux-other-format">Specify your formatting</label>
                  <input
                    id="fux-other-format"
                    type="text"
                    className="fux-q-other-input"
                    autoFocus
                    placeholder="e.g. CSI MasterSpec, custom CSI-13, internal coding…"
                    value={otherDivisionFormat}
                    onChange={(e) => setOtherDivisionFormat(e.target.value)}
                  />
                </div>
              )}
              <div className="fux-q-foot">
                <button
                  className="btn-primary fux-q-next"
                  disabled={!canContinue(phase)}
                  onClick={advance}>
                  {phase === "q5" ? "Finish" : "Continue"}
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
// Home-screen coachmark tour — the 5-step FUX walkthrough that fires
// after the initial onboarding sequence completes. Wraps the generic
// CoachmarkTour with the Home-specific steps.
const HOME_TOUR_STEPS = [
  { id: "skills", selector: ".col-nav [data-nav-id=\"skills\"]", placement: "right", title: "Skills are the core of BuildCrew", desc: "Skills are the AI-powered tools that do the heavy lifting on every project: ROM estimates, bid analysis, RFI clarifications, and more. Open them from the Skills tab here, or run them straight from any project's Home screen.", skillsAnim: true },
  { id: "theme",  selector: ".col-nav .theme-cycle",           placement: "right",  title: "Theme switcher",       desc: "Click to cycle through Light, Hybrid, and Dark. Choose whichever matches your mood." },
  { id: "home",   selector: ".col-detail",                     placement: "center", title: "Your Home screen",     desc: "Personalized just for you. As you start working, your Recent projects, Pinned items, and Recent skill runs will surface here so the info that matters most is always one click away.", wireframe: true },
  { id: "cody",   selector: ".ai-rail-collapsed, .ai-panel",   placement: "left",   title: "Ask Cody",             desc: "Your AI assistant. Drag-drop files, ask follow-up questions, or kick off a guided skill run from here.", codyImage: true },
  { id: "create", selector: ".greet-content .ai-pill",         placement: "below",  title: "Create your first project", desc: "Ready to get started? I'll help you along the way. Uploading your project files, running Skills, and reviewing the results.", isFinal: true, finalLabel: "Create my project", finalIcon: "add" },
];
function FUXCoachmarks({ onComplete, onNewProject }) {
  return <CoachmarkTour steps={HOME_TOUR_STEPS} onComplete={onComplete} onFinalAction={onNewProject} />;
}

// =====================================================
// COACHMARK TOUR — generic first-visit walkthrough engine
// =====================================================
// Renders a spotlight + tooltip walkthrough for any set of steps. Same
// visual language as the Home FUX tour, but decoupled from Home. Each
// step: { id, selector, placement, title, desc, isFinal?, finalLabel?,
// finalIcon?, skillsAnim?, wireframe?, codyImage? }.
function CoachmarkTour({ steps, onComplete, onFinalAction }) {
  const STEPS = steps || [];
  const [step, setStep] = useS(0);
  const [targetRect, setTargetRect] = useS(null);
  const cur = STEPS[step];

  // Measure the current step's target element and keep its rect in state.
  // Re-measures on resize/scroll so the spotlight tracks layout changes,
  // and once on the next animation frame to catch late-settled transitions
  // (e.g. the nav rail sliding back in after the FUX onboarding finishes).
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
    // Scroll the target into view — center vertically so the tooltip
    // (which sits above or below the spotlight) also fits without clipping.
    // Uses instant scroll so the tooltip can position immediately after,
    // without racing a smooth-scroll animation.
    if (target && typeof target.scrollIntoView === "function" && cur.placement !== "center") {
      target.scrollIntoView({ block: "center", behavior: "auto" });
    }
    const measure = () => {
      if (target) setTargetRect(target.getBoundingClientRect());
      else setTargetRect(null);
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const advance = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete && onComplete();
  };
  const goBack = () => { if (step > 0) setStep(step - 1); };
  const skip = () => onComplete && onComplete();
  const doFinalAction = () => {
    onComplete && onComplete();
    onFinalAction && onFinalAction();
  };

  if (!cur) return null;

  // Spotlight box — a transparent rect over the target, surrounded by a
  // giant box-shadow that paints the rest of the viewport dim. Matches the
  // element's bounding rect exactly so the spotlight never extends past
  // the visible edges of the target (esp. critical for narrow side panels
  // like the nav rail and the collapsed Ask Cody rail).
  const hasTarget = !!targetRect;
  const spotlightStyle = hasTarget ? {
    top: targetRect.top,
    left: targetRect.left,
    width: targetRect.width,
    height: targetRect.height,
  } : null;

  // Tooltip placement — fully fixed positioning with inline transforms so
  // the placement class only styles the arrow (no transform conflicts with
  // the placement math). Falls back to centered when no target is resolved.
  const GAP = 18;
  let tooltipStyle;
  let activePlacement;
  if (!hasTarget || cur.placement === "center") {
    activePlacement = "center";
    tooltipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  } else if (cur.placement === "right") {
    activePlacement = "right";
    tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.right + GAP, transform: "translateY(-50%)" };
  } else if (cur.placement === "left") {
    activePlacement = "left";
    tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.left - GAP, transform: "translate(-100%, -50%)" };
  } else if (cur.placement === "below") {
    activePlacement = "below";
    tooltipStyle = { top: targetRect.bottom + GAP, left: targetRect.left + targetRect.width / 2, transform: "translateX(-50%)" };
  } else if (cur.placement === "above") {
    activePlacement = "above";
    tooltipStyle = { top: targetRect.top - GAP, left: targetRect.left + targetRect.width / 2, transform: "translate(-50%, -100%)" };
  } else {
    activePlacement = "center";
    tooltipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  // Render through a portal into <body> so the overlay isn't nested inside
  // any ancestor with a `transform` set. Without this, `.col-detail`'s
  // post-FUX fade animation leaves a translateY(0) transform on the
  // element, which makes it the containing block for `position: fixed`
  // children — that's why the spotlight was landing next to elements
  // instead of on them (offset by .col-detail's top-left).
  const overlay = (
    <div className="fux-coachmarks" role="dialog" aria-modal="true" aria-label={cur.title}>
      {hasTarget ? (
        <div className="fux-coach-spotlight" style={spotlightStyle} />
      ) : (
        <div className="fux-coach-backdrop" />
      )}
      {(hasTarget || cur.placement === "center") && (
      <div className={"fux-coach-tip fux-coach-" + activePlacement} style={tooltipStyle}>
        <div className="fux-coach-progress">Step {step + 1} of {STEPS.length}</div>
        <h3 className="fux-coach-title">{cur.title}</h3>
        <p className="fux-coach-desc">{cur.desc}</p>
        {cur.codyImage && (
          <div className="fux-coach-cody" aria-hidden="true">
            <img src="design-system/cody-tooltip.png" alt="" onError={(e) => { e.currentTarget.src = "design-system/cody.png"; }} />
          </div>
        )}
        {cur.skillsAnim && (
          <div className="fux-coach-skills" aria-hidden="true">
            <div className="fux-coach-skill-pill" style={{ animationDelay: "0s" }}>
              <Icon name="calculate" size={12} />
              <span>ROM Estimate</span>
            </div>
            <div className="fux-coach-skill-pill" style={{ animationDelay: "0.45s" }}>
              <Icon name="compare_arrows" size={12} />
              <span>Bid Leveling</span>
            </div>
            <div className="fux-coach-skill-pill" style={{ animationDelay: "0.9s" }}>
              <Icon name="rule" size={12} />
              <span>Clarifications/RFIs</span>
            </div>
            <div className="fux-coach-skill-pill" style={{ animationDelay: "1.35s" }}>
              <Icon name="groups" size={12} />
              <span>Trade Scoping</span>
            </div>
          </div>
        )}
        {cur.wireframe && (
          <div className="fux-coach-wire" aria-hidden="true">
            <div className="fux-coach-wire-section">
              <div className="fux-coach-wire-label">Recent projects</div>
              <div className="fux-coach-wire-row">
                <div className="fux-coach-wire-card lg" />
                <div className="fux-coach-wire-card lg" />
                <div className="fux-coach-wire-card lg" />
              </div>
            </div>
            <div className="fux-coach-wire-section">
              <div className="fux-coach-wire-label">Pinned</div>
              <div className="fux-coach-wire-row">
                <div className="fux-coach-wire-card sm" />
                <div className="fux-coach-wire-card sm" />
                <div className="fux-coach-wire-card sm" />
                <div className="fux-coach-wire-card sm" />
              </div>
            </div>
            <div className="fux-coach-wire-section">
              <div className="fux-coach-wire-label">Recent skill runs</div>
              <div className="fux-coach-wire-table">
                <div className="fux-coach-wire-bar" />
                <div className="fux-coach-wire-bar" />
                <div className="fux-coach-wire-bar" />
              </div>
            </div>
          </div>
        )}
        <div className="fux-coach-foot">
          <button className="btn-ghost fux-coach-skip" onClick={skip}>
            {cur.isFinal ? "Maybe later" : "Skip tour"}
          </button>
          <div className="fux-coach-foot-nav">
            {step > 0 && (
              <button className="btn-ghost fux-coach-back" onClick={goBack}>
                <Icon name="arrow_back" size={14} />Back
              </button>
            )}
            {cur.isFinal ? (
              <button className="btn-primary" onClick={doFinalAction}>
                <Icon name={cur.finalIcon || "check"} size={14} />{cur.finalLabel || "Got it"}
              </button>
            ) : (
              <button className="btn-primary" onClick={advance}>
                Next<Icon name="arrow_forward" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
  return ReactDOM.createPortal(overlay, document.body);
}

// =====================================================
// HOME
// =====================================================
function HomeScreen({ ctx, projects, runs, onPin, pinnedSet, onOpenProject, onOpenProjectInNewTab, onOpenDrawing, onAskAI, onNewProject, onOpenDailyReport, onCtxMenu, onAskCodyPrompt, onStartCreateProjectFlow, onStartAddFilesFlow, onStartRomEstimateFlow, freshMode, user, onFuxFullyComplete }) {
  const [greetPrompt, setGreetPrompt] = useS("");
  // FUX onboarding sequence — shown once per fresh-mode session. Persisted in
  // localStorage so switching away from and back to the Home tab doesn't
  // re-trigger the whole onboarding.
  const [fuxDone, setFuxDone] = useS(() => {
    try { return localStorage.getItem("bc_fux_done") === "1"; } catch (e) { return false; }
  });
  const markFuxDone = (answers) => {
    try { localStorage.setItem("bc_fux_done", "1"); } catch (e) {}
    setFuxDone(true);
    onFuxFullyComplete && onFuxFullyComplete(answers);
  };
  // After FUX completes, a guided coachmark tour highlights key UI elements
  // (side nav, theme switcher, Home sections, Ask Cody, Create-project CTA).
  // The tour is delayed slightly so the post-FUX fade-in finishes first,
  // then the user advances at their own pace.
  const [coachmarksActive, setCoachmarksActive] = useS(false);
  const [coachmarksDone, setCoachmarksDone] = useS(() => {
    try { return localStorage.getItem("bc_fux_coachmarks_done") === "1"; } catch (e) { return false; }
  });
  const markCoachmarksDone = () => {
    try { localStorage.setItem("bc_fux_coachmarks_done", "1"); } catch (e) {}
    setCoachmarksActive(false);
    setCoachmarksDone(true);
  };
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
    name === "Trade Scoping" ? "groups" :
    "auto_awesome";
  const skillToTab = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "estimation" :
    name === "Bid Level Analysis" ? "bid" :
    name === "Clarifications & Potential RFIs" ? "rfc" :
    name === "Trade Scoping" ? "trades" :
    null;

  // Resolve pinned IDs into renderable cards (capped at 4)
  const pinnedCards = [];
  for (const pinId of pinnedSet) {
    if (pinnedCards.length >= 4) break;
    if (typeof pinId === "string" && pinId.startsWith("skill:")) {
      const [projectId, skillId] = pinId.slice(6).split("/");
      const proj = projects.find((x) => x.id === projectId);
      const meta = {
        estimation: { icon: "calculate", eyebrow: "Skill result · Estimation", value: (proj && proj.estimate) || "N/A", delta: "+2.3% vs v2", theme: "orange" },
        rfc: { icon: "rule", eyebrow: "Skill result · Clarifications", value: "23 issues", delta: "3 critical", theme: "orange" },
        bid: { icon: "compare_arrows", eyebrow: "Skill result · Bid Level Analysis", value: "$384.7k", delta: "−$74k vs ROM", theme: "tiffany" },
        trades: { icon: "groups", eyebrow: "Skill result · Trade Scoping", value: "13 trades", delta: "10 high-confidence", theme: "raisin" },
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
          onComplete={markFuxDone}
        />
      </div>
    );
  }

  // After completing FUX, fade the Home content in so the handoff from the
  // onboarding thank-you to the empty Home feels continuous, not a hard cut.
  const justFinishedFux = freshMode && fuxDone;

  // Chip class + label from a project's `status` field. Falls back to
  // "estimating" so unknown states still get a visible badge.
  const chipClassForStatus = (s) =>
    s === "draft" ? "v3-chip-draft" :
    s === "done" ? "v3-chip-complete" :
    s === "working" ? "v3-chip-estimating" :
    "v3-chip-estimating";
  const chipLabelForStatus = (p) => {
    if (p.status === "draft") return "Draft";
    if (p.status === "done") return "Complete";
    if (p.status === "working") return "Estimating";
    return p.statusLabel || "In progress";
  };
  const chipClassForRun = (r) =>
    r.status === "done" ? "v3-chip-complete" :
    r.status === "working" ? "v3-chip-progress" :
    r.status === "failed" ? "v3-chip-failed" :
    "v3-chip-progress";
  const chipLabelForRun = (r) =>
    r.status === "done" ? "Complete" :
    r.status === "working" ? `${Math.round((r.progress || 0) * 100)}%` :
    r.status === "failed" ? "Failed" :
    r.status;

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  }).toUpperCase();

  const userFirstName = (user && user.name) ? user.name.split(" ")[0] : "there";

  return (
    <div className={"col-detail " + (justFinishedFux ? "fux-post-fade" : "")}>
      <Taskbar
        crumbs={[{ label: "Home", bold: true }]}
        onAskAI={onAskAI} />

      <div className="canvas home-v3-canvas">
       <div className="home-v3">
        {/* GREETING — Cody image + welcome + Ask Cody + quick action pills */}
        <div className="home-v3-greet">
          <div className="home-v3-greet-cody" aria-hidden="true">
            <video
              src="animated/cody-greet.mp4"
              poster="design-system/cody.png"
              autoPlay
              muted
              playsInline
              onEnded={(e) => {
                const v = e.currentTarget;
                setTimeout(() => { try { v.currentTime = 0; v.play(); } catch (err) {} }, 10000);
              }}
            />
          </div>
          <div className="home-v3-greet-content">
            <div>
              <div className="home-v3-greet-eyebrow">{isFresh ? "Welcome aboard" : todayFormatted}</div>
              <h1 className="home-v3-greet-title" style={{ marginTop: 8 }}>
                {isFresh ? `Welcome to BuildCrew, ${userFirstName}.` : `Welcome back, ${userFirstName}!`}
              </h1>
            </div>

            {/* Ask Cody bar — orange-outlined pill with sparkle + placeholder + send.
                Shown in both fresh (post-FUX Home landing) and normal modes. */}
            <div className="home-v3-ask-cody" onClick={(e) => { const ta = e.currentTarget.querySelector("input"); ta && ta.focus(); }}>
              <span className="home-v3-ask-cody-spark"><CodyMark size={16} /></span>
              <input
                type="text"
                placeholder="Ask Cody anything or pick a quick action below."
                value={greetPrompt}
                onChange={(e) => setGreetPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitGreetPrompt(); } }}
              />
              <button
                className="home-v3-ask-cody-btn"
                disabled={!greetPrompt.trim()}
                onClick={(e) => { e.stopPropagation(); submitGreetPrompt(); }}
                title="Send to Cody">
                <Icon name="arrow_forward" size={20} />
              </button>
            </div>

            {/* Quick actions — primary "Create a new project" is gradient, others outlined */}
            <div className="home-v3-quick-actions">
              {isFresh ? (
                <button className="v3-quick-pill v3-quick-pill-primary" onClick={onNewProject}>
                  <Icon name="add" size={12} />Create your first project
                </button>
              ) : (
                <>
                  <button className="v3-quick-pill v3-quick-pill-primary" onClick={onNewProject}>
                    <Icon name="add" size={12} />Create a new project
                  </button>
                  <button className="v3-quick-pill" onClick={() => onStartRomEstimateFlow && onStartRomEstimateFlow()}>
                    <Icon name="add" size={12} />Get ROM estimate
                  </button>
                  <button className="v3-quick-pill" onClick={() => onStartAddFilesFlow ? onStartAddFilesFlow() : onOpenProject("rec-wellness", { tab: "files" })}>
                    <Icon name="add" size={12} />Add files to existing project
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RECENT PROJECTS — 3-across grid of project cards */}
        {!isFresh && (() => {
          const recent = projects.filter(p => !p.archived).slice(0, 3);
          const totalCount = projects.filter(p => !p.archived).length;
          if (recent.length === 0) return null;
          return (
            <section className="home-v3-section">
              <div className="home-v3-section-h">
                <span className="home-v3-section-h-icon"><Icon name="folder" size={20} /></span>
                <h3>Recent projects</h3>
                {totalCount > recent.length && (
                  <button className="home-v3-section-see-all" onClick={() => onOpenProjectInNewTab && onOpenProject && onOpenProject(null, { screen: "projects" })}>See all projects ({totalCount})</button>
                )}
              </div>
              <div className="home-v3-projects">
                {recent.map((p) => (
                  <div key={p.id} className="v3-project-card" onClick={() => onOpenProject(p.id)}
                       onContextMenu={(e) => onCtxMenu && onCtxMenu([
                         { label: "Open", icon: "open_in_browser", onClick: () => onOpenProject(p.id) },
                         { label: "Open in new tab", icon: "tab", onClick: () => onOpenProjectInNewTab && onOpenProjectInNewTab(p.id) },
                         { divider: true },
                         { label: pinnedSet.has(p.id) ? "Unpin" : "Pin", icon: "push_pin", onClick: () => onPin(p.id) },
                       ], e)}>
                    <div className="v3-project-card-image"><Icon name={p.icon || "folder_open"} /></div>
                    <div className="v3-project-card-body">
                      <div className="v3-project-card-content">
                        <div className="v3-project-card-topline">
                          <span className={"v3-chip " + chipClassForStatus(p.status)}>{chipLabelForStatus(p)}</span>
                          <button
                            className={"v3-project-card-pin " + (pinnedSet.has(p.id) ? "is-pinned" : "")}
                            onClick={(e) => { e.stopPropagation(); onPin(p.id); }}
                            title={pinnedSet.has(p.id) ? "Unpin" : "Pin"}>
                            <Icon name="push_pin" size={20} />
                          </button>
                        </div>
                        <div className="v3-project-card-title-block">
                          <span className="v3-project-card-kind">{p.kind}</span>
                          <span className="v3-project-card-name">{p.name}</span>
                        </div>
                      </div>
                      <div className="v3-project-card-footer">
                        <div className="v3-project-card-value-block">
                          <span className="v3-project-card-value-label">Contract value</span>
                          <span className="v3-project-card-value">{p.estimate}</span>
                        </div>
                        <span className="v3-project-card-updated">Updated {p.lastEdit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* PINNED — 4-across KPI cards */}
        {pinnedCards.length > 0 && (
          <section className="home-v3-section">
            <div className="home-v3-section-h">
              <span className="home-v3-section-h-icon"><Icon name="push_pin" size={20} /></span>
              <h3>Pinned</h3>
            </div>
            <div className="home-v3-pinned" style={{ gridTemplateColumns: `repeat(${Math.min(4, pinnedCards.length)}, 1fr)` }}>
              {pinnedCards.slice(0, 4).map((c) => {
                if (c.kind === "skill") {
                  return (
                    <div key={c.pinId} className="v3-kpi-card"
                         onClick={() => onOpenProject(c.proj.id, { tab: c.skillId })}>
                      <span className="v3-kpi-eyebrow">{c.meta.eyebrow}</span>
                      <span className="v3-kpi-name">{c.proj.name}</span>
                      <div className="v3-kpi-foot">
                        <span className="v3-kpi-foot-label">{c.meta.delta}</span>
                        <span className="v3-kpi-foot-value">{c.meta.value}</span>
                      </div>
                    </div>
                  );
                }
                if (c.kind === "drawing") {
                  return (
                    <div key={c.pinId} className="v3-kpi-card"
                         onClick={() => onOpenDrawing && onOpenDrawing(c.drawing.id, c.proj.id)}>
                      <span className="v3-kpi-eyebrow">Drawing · {c.drawing.trade}</span>
                      <span className="v3-kpi-name">{c.drawing.id}: {c.drawing.title}</span>
                      <div className="v3-kpi-foot">
                        <span className="v3-kpi-foot-label">{c.proj.name}</span>
                        <span className="v3-kpi-foot-value">{c.drawing.scale}</span>
                      </div>
                    </div>
                  );
                }
                const p = c.p;
                return (
                  <div key={c.pinId} className="v3-kpi-card" onClick={() => onOpenProject(p.id)}>
                    <span className="v3-kpi-eyebrow">{p.kind}</span>
                    <span className="v3-kpi-name">{p.name}</span>
                    <div className="v3-kpi-foot">
                      <span className="v3-kpi-foot-label">Last viewed {p.lastEdit}</span>
                      <span className="v3-kpi-foot-value">{p.estimate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* RECENT SKILL RUNS — 5-column table */}
        {!isFresh && runs && runs.length > 0 && (
          <section className="home-v3-section">
            <div className="home-v3-section-h">
              <span className="home-v3-section-h-icon"><Icon name="auto_awesome" size={20} /></span>
              <h3>Recent skill runs</h3>
            </div>
            <div className="v3-runs-table">
              <div className="v3-runs-header">
                <div>Skill</div>
                <div>Project</div>
                <div>Status</div>
                <div>When</div>
                <div>Results</div>
              </div>
              {[...runs].sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || "")).map((r) => (
                <div key={r.id} className="v3-runs-row" onClick={() => {
                  const tab = r.status === "done" ? skillToTab(r.skill) : null;
                  if (tab) onOpenProject(r.projectId, { tab });
                  else onOpenProject(r.projectId);
                }}>
                  <div className="v3-runs-cell-skill">
                    <div className="v3-runs-cell-skill-icon"><Icon name={skillIcon(r.skill)} size={12} /></div>
                    <span className="v3-runs-cell-skill-name">{r.skill}</span>
                  </div>
                  <div className="v3-runs-cell-project">{r.project}</div>
                  <div><span className={"v3-chip is-sm " + chipClassForRun(r)}>{chipLabelForRun(r)}</span></div>
                  <div className="v3-runs-cell-when">{r.when}</div>
                  <div className="v3-runs-cell-result">
                    {r.ai && r.ai.total ? r.ai.total :
                     r.ai && r.ai.issues != null ? `${r.ai.issues} issues` :
                     r.ai && r.ai.savings ? <span style={{ color: "var(--v3-chip-complete-fg)" }}>−{r.ai.savings}</span> :
                     r.ai && r.ai.winner ? (<><span>{r.ai.winner}</span><div className="v3-runs-cell-result-sub">{r.ai.bid}</div></>) :
                     "—"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
       </div>
      </div>
      {coachmarksActive && !coachmarksDone && (
        <FUXCoachmarks
          onComplete={markCoachmarksDone}
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
    if (!p.estimate || p.estimate === "N/A") return -1;
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

// True only in the fresh-user demo (?demo=fresh). Product-tour surfaces
// gate their `useFirstVisitTour` calls on this so a returning user never
// sees the guided walkthroughs on Company, Project Home, Skill Results,
// or the Bid Leveling / Create Project modals.
function isFreshDemoMode() {
  try {
    return /(\?|&)demo=fresh\b/i.test((typeof window !== "undefined" && window.location && window.location.search) || "");
  } catch (e) { return false; }
}

// Shared first-visit tour hook — reads/writes localStorage so each user
// only sees each tour once. `enabled` gates whether the tour is even
// eligible (e.g. wait for the FUX to finish, or only fire when a
// specific project is loaded). Returns [active, complete] — pass
// `active` as the render gate and call `complete()` on skip/finish.
function useFirstVisitTour(storageKey, enabled) {
  const [active, setActive] = useS(false);
  useE(() => {
    if (!enabled) return;
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch (e) { /* localStorage blocked — still show the tour */ }
    const t = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(t);
  }, [enabled, storageKey]);
  const complete = () => {
    try { localStorage.setItem(storageKey, "1"); } catch (e) {}
    setActive(false);
  };
  return [active, complete];
}

Object.assign(window, { HomeScreen, ProjectsScreen, CoachmarkTour, useFirstVisitTour, isFreshDemoMode });