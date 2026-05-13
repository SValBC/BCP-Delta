// BuildCrew.AI — Tab bar (multi-project) + Project switcher + Drawing viewer
const { useState: useT, useEffect: useTE, useRef: useTR, useMemo: useTM } = React;

// =====================================================
// TAB BAR — top of detail column
// =====================================================
function TabBar({ tabs, activeId, onActivate, onClose, onNewTab }) {
  if (!tabs || tabs.length === 0) return null;
  return (
    <div className="tabbar">
      <div className="tabbar-scroll">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={"tab " + (activeId === tab.id ? "active " : "") + (tab.kind === "skill" ? "tab-skill " : "") + (tab.runStatus === "running" ? "tab-running" : "")}
            onClick={() => onActivate(tab.id)}
            title={tab.label}
          >
            {tab.kind === "skill" && tab.runStatus === "running" && (
              <span className="tab-progress" style={{ width: ((tab.runProgress || 0) * 100) + "%" }} />
            )}
            <span className="tab-icon-wrap">
              {tab.kind === "skill" && tab.runStatus === "running"
                ? <span className="tab-spinner" />
                : <Icon name={tab.icon || "folder_open"} size={14} />
              }
            </span>
            <span className="tab-label">{tab.label}</span>
            {tab.kind === "skill" && tab.runStatus === "running" && (
              <span className="tab-pct">{Math.round((tab.runProgress || 0) * 100)}%</span>
            )}
            {tab.kind === "skill" && tab.runStatus === "done" && (
              <span className="tab-done-dot" title="Run finished" />
            )}
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                aria-label="Close tab"
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="tab-new" onClick={onNewTab} title="New tab">
        <Icon name="add" size={16} />
      </button>
    </div>
  );
}

// =====================================================
// PROJECT SWITCHER — drop-down on breadcrumb project name
// =====================================================
function ProjectSwitcher({ project, projects, onSwitch, onOpenInTab, recentProjects }) {
  const [open, setOpen] = useT(false);
  const [q, setQ] = useT("");
  const ref = useTR(null);

  useTE(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    setTimeout(() => document.addEventListener("click", h), 0);
    return () => document.removeEventListener("click", h);
  }, [open]);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const recent = recentProjects ? recentProjects.filter(p => p.id !== project.id).slice(0, 3) : [];

  return (
    <div className="psw-wrap" ref={ref}>
      <button className={"psw-trigger " + (open ? "open" : "")} onClick={() => setOpen(v => !v)}>
        <b>{project.name}</b>
        <Icon name="unfold_more" size={14} />
      </button>
      {open && (
        <div className="psw-pop">
          <div className="psw-search">
            <Icon name="search" size={14} />
            <input
              autoFocus
              placeholder="Switch project…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          {recent.length > 0 && q === "" && (
            <>
              <div className="psw-section">Recent</div>
              {recent.map(p => (
                <ProjectSwitcherRow
                  key={p.id} p={p}
                  onSwitch={() => { setOpen(false); onSwitch(p.id); }}
                  onOpenInTab={() => { setOpen(false); onOpenInTab(p.id); }}
                />
              ))}
            </>
          )}
          <div className="psw-section">{q ? "Results" : "All projects"}</div>
          <div className="psw-list">
            {filtered.map(p => (
              <ProjectSwitcherRow
                key={p.id} p={p}
                active={p.id === project.id}
                onSwitch={() => { setOpen(false); onSwitch(p.id); }}
                onOpenInTab={() => { setOpen(false); onOpenInTab(p.id); }}
              />
            ))}
            {filtered.length === 0 && (
              <div className="psw-empty">No projects matching "{q}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectSwitcherRow({ p, active, onSwitch, onOpenInTab }) {
  return (
    <div className={"psw-row " + (active ? "active" : "")} onClick={onSwitch}>
      <Icon name={p.icon || "folder_open"} size={16} style={{ opacity: 0.7 }} />
      <div className="psw-row-body">
        <div className="psw-row-name">{p.name}</div>
        <div className="psw-row-meta">{p.kind} · {p.stage}</div>
      </div>
      {active && <span className="psw-active-pill">Current</span>}
      {!active && (
        <button
          className="psw-row-tab"
          title="Open in new tab"
          onClick={(e) => { e.stopPropagation(); onOpenInTab(); }}
        >
          <Icon name="open_in_new" size={13} />
        </button>
      )}
    </div>
  );
}

// =====================================================
// DRAWING VIEWER — full-bleed sheet view with takeoff drawer
// =====================================================
function DrawingViewer({ drawing, project, onClose, onSwitchSheet, onPopOut, onOpenCost, pinnedSet, onPin }) {
  const [hoveredItemId, setHoveredItemId] = useT(null);
  const [activeGroup, setActiveGroup] = useT("all");
  const [drawerCollapsed, setDrawerCollapsed] = useT(false);

  const takeoff = window.BC_DATA.drawingTakeoffs[drawing.id];
  const allItems = takeoff ? takeoff.groups.flatMap(g => g.items.map(it => ({ ...it, group: g }))) : [];
  const visibleItems = activeGroup === "all" ? allItems : allItems.filter(it => it.group.code === activeGroup);

  const groupTotal = useTM(() => {
    const tally = {};
    allItems.forEach(it => { tally[it.group.code] = (tally[it.group.code] || 0) + 1; });
    return tally;
  }, [drawing.id]);

  const drawings = window.BC_DATA.drawings;
  const idx = drawings.findIndex(d => d.id === drawing.id);
  const prev = idx > 0 ? drawings[idx - 1] : null;
  const next = idx < drawings.length - 1 ? drawings[idx + 1] : null;

  return (
    <div className="dv-root">
      <div className="dv-toolbar">
        <div className="dv-toolbar-left">
          <button className="dv-icon-btn" onClick={onClose} title="Back to Files">
            <Icon name="arrow_back" size={16} />
          </button>
          <div className="dv-sheet-meta">
            <div className="dv-sheet-id">{drawing.id}</div>
            <div className="dv-sheet-title">{drawing.title}</div>
          </div>
          <span className="dv-sheet-trade">{drawing.trade}</span>
          <span className="dv-sheet-scale">{drawing.scale}</span>
        </div>
        <div className="dv-toolbar-center">
          <button className="dv-nav-btn" disabled={!prev} onClick={() => prev && onSwitchSheet(prev)} title="Previous sheet">
            <Icon name="chevron_left" size={16} />
          </button>
          <div className="dv-sheet-counter">Sheet {idx + 1} of {drawings.length}</div>
          <button className="dv-nav-btn" disabled={!next} onClick={() => next && onSwitchSheet(next)} title="Next sheet">
            <Icon name="chevron_right" size={16} />
          </button>
        </div>
        <div className="dv-toolbar-right">
          <button className="dv-tool"><Icon name="zoom_in" size={15} /></button>
          <button className="dv-tool"><Icon name="zoom_out" size={15} /></button>
          <button className="dv-tool"><Icon name="fit_screen" size={15} /></button>
          <button className="dv-tool"><Icon name="straighten" size={15} /></button>
          <button className="dv-tool"><Icon name="square_foot" size={15} /></button>
          <button className="dv-tool"><Icon name="comment" size={15} /></button>
          <div className="dv-tool-sep" />
          <PinButton pinId={"drawing:" + project.id + "/" + drawing.id} pinnedSet={pinnedSet} onPin={onPin} variant="compact" />
          <button className="dv-tool" onClick={onPopOut} title="Open in new window">
            <Icon name="open_in_new" size={15} />
          </button>
        </div>
      </div>

      <div className={"dv-stage " + (drawerCollapsed ? "drawer-collapsed" : "")}>
        <div className="dv-canvas">
          <div className="dv-paper">
            <div className="dv-titleblock">
              <div className="dv-tb-row">
                <div><div className="dv-tb-label">Project</div><div className="dv-tb-val">{project.name}</div></div>
                <div><div className="dv-tb-label">Sheet</div><div className="dv-tb-val">{drawing.id}</div></div>
              </div>
              <div className="dv-tb-row">
                <div><div className="dv-tb-label">Title</div><div className="dv-tb-val">{drawing.title}</div></div>
                <div><div className="dv-tb-label">Scale</div><div className="dv-tb-val">{drawing.scale}</div></div>
              </div>
            </div>
            <DrawingArt drawing={drawing} hoveredItemId={hoveredItemId} visibleItems={visibleItems} />
          </div>
        </div>

        <div className={"dv-drawer " + (drawerCollapsed ? "collapsed" : "")}>
          <div className="dv-drawer-header">
            <div className="dv-drawer-title">
              <Icon name="auto_awesome" size={14} className="dv-cody-spark" />
              <span>Cody's takeoff</span>
              <span className="dv-drawer-count">{allItems.length} items</span>
            </div>
            <div className="dv-drawer-actions">
              <button className="dv-drawer-btn"><Icon name="add" size={13} /> Add manually</button>
              <button className="dv-drawer-collapse" onClick={() => setDrawerCollapsed(v => !v)}>
                <Icon name={drawerCollapsed ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={16} />
              </button>
            </div>
          </div>

          {!drawerCollapsed && (
            <>
              <div className="dv-drawer-tabs">
                <button className={"dv-drawer-tab " + (activeGroup === "all" ? "active" : "")} onClick={() => setActiveGroup("all")}>
                  All <span className="dv-drawer-tab-count">{allItems.length}</span>
                </button>
                {takeoff && takeoff.groups.map(g => (
                  <button key={g.code} className={"dv-drawer-tab " + (activeGroup === g.code ? "active" : "")} onClick={() => setActiveGroup(g.code)}>
                    Div {g.code} · {g.name}<span className="dv-drawer-tab-count">{groupTotal[g.code]}</span>
                  </button>
                ))}
              </div>
              <div className="dv-drawer-table">
                <div className="dv-drawer-row dv-drawer-head">
                  <div className="dv-c-mat">Material</div>
                  <div className="dv-c-loc">Location / note</div>
                  <div className="dv-c-qty">Qty</div>
                  <div className="dv-c-unit">Unit</div>
                  <div className="dv-c-act"></div>
                </div>
                {visibleItems.map(it => (
                  <div key={it.id}
                    className={"dv-drawer-row " + (hoveredItemId === it.id ? "highlighted" : "")}
                    onMouseEnter={() => setHoveredItemId(it.id)}
                    onMouseLeave={() => setHoveredItemId(null)}>
                    <div className="dv-c-mat">
                      <div className="dv-c-mat-dot" style={{ background: divColor(it.group.code) }} />
                      <div>
                        <div className="dv-c-mat-name">{it.material}</div>
                        <div className="dv-c-mat-div">Div {it.group.code} · {it.group.name}</div>
                      </div>
                    </div>
                    <div className="dv-c-loc">{it.desc}</div>
                    <div className="dv-c-qty">{formatNum(it.qty)}</div>
                    <div className="dv-c-unit">{it.unit}</div>
                    <div className="dv-c-act">
                      <button className="dv-c-act-btn" title="Open cost item" onClick={() => onOpenCost && onOpenCost(it)}>
                        <Icon name="arrow_outward" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {visibleItems.length === 0 && (
                  <div className="dv-drawer-empty">No takeoff items in this division on this sheet.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function divColor(code) {
  const map = { "03": "#E84600", "04": "#B600E9", "05": "#48C1B5", "06": "#FFBD15", "07": "#FF7A1A", "08": "#5A6FE3", "09": "#48C1B5", "13": "#E84600", "21": "#FFBD15", "22": "#5A6FE3", "23": "#FF7A1A", "26": "#FFBD15" };
  return map[code] || "#48C1B5";
}
function formatNum(n) {
  if (n >= 1000) return n.toLocaleString();
  if (n % 1 === 0) return String(n);
  return n.toFixed(2);
}

function DrawingArt({ drawing, hoveredItemId, visibleItems }) {
  return (
    <svg className="dv-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="dv-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(39,38,53,0.05)" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="200" height="150" fill="url(#dv-grid)" />
      <g className="dv-sheet-content">
        {drawing.thumb === "level1" && <SheetLevel1 />}
        {drawing.thumb === "level2" && <SheetLevel2 />}
        {drawing.thumb === "elev"   && <SheetElev />}
        {drawing.thumb === "rcp"    && <SheetRCP />}
      </g>
      {visibleItems.map(it => {
        if (!it.hotspot) return null;
        const isHovered = hoveredItemId === it.id;
        return (
          <g key={it.id}>
            <rect x={it.hotspot.x} y={it.hotspot.y}
              width={Math.max(it.hotspot.w, 1)} height={Math.max(it.hotspot.h, 1)}
              fill={isHovered ? divColor(it.group.code) : "transparent"}
              fillOpacity={isHovered ? 0.20 : 0}
              stroke={divColor(it.group.code)}
              strokeWidth={isHovered ? 0.9 : 0.4}
              strokeDasharray={isHovered ? "0" : "1.2 1"}
              strokeOpacity={isHovered ? 1 : 0.55}
              className={"dv-hotspot " + (isHovered ? "active" : "")} />
            {isHovered && (
              <g>
                <rect x={it.hotspot.x + it.hotspot.w / 2 - 22} y={it.hotspot.y - 8} width="44" height="6" rx="1" fill={divColor(it.group.code)} />
                <text x={it.hotspot.x + it.hotspot.w / 2} y={it.hotspot.y - 3.5} fontSize="3.5" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                  {formatNum(it.qty)} {it.unit}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function SheetLevel1() {
  return (
    <g stroke="#272635" strokeWidth="0.6" fill="none">
      <rect x="14" y="14" width="172" height="122" strokeWidth="0.9" />
      <line x1="60" y1="14" x2="60" y2="62" />
      <line x1="120" y1="14" x2="120" y2="62" />
      <line x1="14" y1="62" x2="186" y2="62" />
      <line x1="78" y1="62" x2="78" y2="136" />
      <line x1="140" y1="62" x2="140" y2="136" />
      <line x1="14" y1="100" x2="78" y2="100" />
      <line x1="140" y1="100" x2="186" y2="100" />
      <circle cx="105" cy="38" r="4" stroke="#E84600" strokeWidth="0.8" />
      <text x="105" y="44" fontSize="3" fill="#E84600" textAnchor="middle" fontFamily="JetBrains Mono, monospace">P</text>
      <text x="36" y="36" fontSize="3.5" fill="#272635" fontFamily="JetBrains Mono, monospace">LOBBY</text>
      <text x="36" y="84" fontSize="3" fill="#666" fontFamily="JetBrains Mono, monospace">LOCKER</text>
      <text x="160" y="84" fontSize="3" fill="#666" fontFamily="JetBrains Mono, monospace">POOL</text>
    </g>
  );
}
function SheetLevel2() {
  return (
    <g stroke="#272635" strokeWidth="0.6" fill="none">
      <rect x="14" y="14" width="172" height="122" strokeWidth="0.9" />
      <line x1="14" y1="74" x2="186" y2="74" />
      <line x1="80" y1="14" x2="80" y2="74" />
      <line x1="140" y1="14" x2="140" y2="74" />
      <line x1="60" y1="74" x2="60" y2="136" />
      <line x1="120" y1="74" x2="120" y2="136" />
      <text x="46" y="44" fontSize="3.5" fill="#272635" fontFamily="JetBrains Mono, monospace">FITNESS</text>
      <text x="106" y="44" fontSize="3" fill="#666" fontFamily="JetBrains Mono, monospace">STUDIO</text>
      <text x="160" y="44" fontSize="3" fill="#666" fontFamily="JetBrains Mono, monospace">YOGA</text>
      <text x="36" y="106" fontSize="3" fill="#666" fontFamily="JetBrains Mono, monospace">OFFICE</text>
      <text x="90" y="106" fontSize="3" fill="#666" fontFamily="JetBrains Mono, monospace">MEETING</text>
    </g>
  );
}
function SheetElev() {
  return (
    <g stroke="#272635" strokeWidth="0.6" fill="none">
      <line x1="14" y1="120" x2="186" y2="120" strokeWidth="1" />
      <rect x="20" y="50" width="160" height="70" strokeWidth="0.9" />
      <line x1="20" y1="86" x2="180" y2="86" />
      {[28, 60, 92, 124, 156].map((x, i) => (<rect key={i} x={x} y="56" width="20" height="22" fill="rgba(72,193,181,0.18)" stroke="#48C1B5" strokeWidth="0.4" />))}
      {[28, 60, 92, 124, 156].map((x, i) => (<rect key={i + 100} x={x} y="92" width="20" height="22" fill="rgba(72,193,181,0.18)" stroke="#48C1B5" strokeWidth="0.4" />))}
      <line x1="14" y1="42" x2="186" y2="42" strokeDasharray="2 1" stroke="#666" />
      <text x="100" y="40" fontSize="3" fill="#666" textAnchor="middle" fontFamily="JetBrains Mono, monospace">T.O. PARAPET</text>
    </g>
  );
}
function SheetRCP() {
  return (
    <g stroke="#272635" strokeWidth="0.4" fill="none">
      <rect x="14" y="14" width="172" height="122" strokeWidth="0.9" />
      {Array.from({ length: 8 }).map((_, i) => (<line key={i} x1={14 + (i + 1) * 21.5} y1="14" x2={14 + (i + 1) * 21.5} y2="136" stroke="#bbb" strokeWidth="0.25" />))}
      {Array.from({ length: 6 }).map((_, i) => (<line key={i} x1="14" y1={14 + (i + 1) * 17.4} x2="186" y2={14 + (i + 1) * 17.4} stroke="#bbb" strokeWidth="0.25" />))}
      {[[40, 40], [80, 40], [120, 40], [160, 40], [40, 70], [80, 70], [120, 70], [160, 70], [40, 100], [80, 100], [120, 100], [160, 100]].map(([cx, cy], i) => (
        <rect key={i} x={cx - 6} y={cy - 4} width="12" height="8" fill="rgba(255,189,21,0.50)" stroke="#FFBD15" strokeWidth="0.4" />
      ))}
    </g>
  );
}

Object.assign(window, { TabBar, ProjectSwitcher, DrawingViewer });
