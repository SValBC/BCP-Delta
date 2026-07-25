// BuildCrew.AI — Shared UI components & nav data
// Exposes globals: NavRail, ListColumn, Taskbar, Icon, Sparkle, AIAssistant, useTheme, formatMoney

const { useState, useEffect, useRef, useMemo } = React;

// Material icon helper
const Icon = ({ name, size, style, className }) => (
  <span className={"mi material-icons-outlined " + (className || "")} style={{ fontSize: size, ...(style || {}) }}>{name}</span>
);

// Gradient-painted auto_awesome icon — visual mark for any "Cody is narrating / recommending" moment
const CodyMark = ({ size = 14, style, className }) => (
  <Icon name="auto_awesome" size={size} className={"cody-mark " + (className || "")} style={style} />
);

// Shared Edit Mode banner — sits at the top of any screen in edit mode.
function EditModeBar({ editCount, onRevert, onPushGlobal, onExit }) {
  return (
    <div className="edit-mode-bar">
      <div className="edit-mode-bar-l">
        <Icon name="edit_note" size={18} />
        <div>
          <b>Edit mode is on</b>
          <div className="edit-mode-bar-sub">
            Click any highlighted field to update. {editCount > 0 ? `${editCount} pending change${editCount === 1 ? "" : "s"}.` : "No changes yet."}
          </div>
        </div>
      </div>
      <div className="edit-mode-bar-actions">
        <button className="btn-ghost" onClick={onRevert} disabled={editCount === 0}>
          <Icon name="undo" size={14} />Revert all
        </button>
        <button className="btn-primary" onClick={onPushGlobal} disabled={editCount === 0}>
          <Icon name="cloud_upload" size={14} />Push Global
        </button>
        <button className="btn-ghost" onClick={onExit} title="Exit edit mode">
          <Icon name="close" size={14} />
        </button>
      </div>
    </div>
  );
}

// Inline editable text — swaps a span/div for a contentEditable element when edit mode is on.
// Records edits to the global store so they can be reverted in bulk.
function EditableText({ editMode, editKey, original, value, onChange, multiline, className, style, placeholder }) {
  const ref = useRef(null);
  const Tag = multiline ? "div" : "span";
  const current = value != null ? value : original;
  if (!editMode) {
    return <Tag className={className} style={style}>{current}</Tag>;
  }
  const onBlur = (e) => {
    const next = (e.currentTarget.textContent || "").trim() || placeholder || original;
    onChange && onChange(editKey, original, next);
  };
  const onKeyDown = (e) => {
    if (!multiline && e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
    if (e.key === "Escape") { e.currentTarget.textContent = current; e.currentTarget.blur(); }
  };
  return (
    <Tag
      ref={ref}
      className={"editable-text " + (className || "") + (value != null && value !== original ? " is-edited" : "")}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={(e) => e.stopPropagation()}
      title="Click to edit"
    >{current}</Tag>
  );
}

// Reusable pin/unpin toggle — used on Project Home, skill result screens, drawing viewer
function PinButton({ pinId, pinnedSet, onPin, label = "Pin to Home", variant }) {
  if (!pinId || !pinnedSet || !onPin) return null;
  const isPinned = pinnedSet.has(pinId);
  if (variant === "compact") {
    // Icon-only — for DrawingViewer toolbar, which packs small icon buttons
    return (
      <button className={"dv-tool " + (isPinned ? "dv-tool-pinned" : "")}
              onClick={(e) => { e.stopPropagation(); onPin(pinId); }}
              title={isPinned ? "Unpin from Home" : label}>
        <Icon name="push_pin" size={15} />
      </button>
    );
  }
  // Default — matches .btn chrome so it slots cleanly into Taskbar actions
  return (
    <button className={"btn " + (isPinned ? "btn-pinned" : "")}
            onClick={(e) => { e.stopPropagation(); onPin(pinId); }}
            title={isPinned ? "Unpin from Home" : label}>
      <Icon name="push_pin" size={16} />
      {isPinned ? "Pinned" : "Pin"}
    </button>
  );
}

// Right-click context menu — App-level singleton driven by `ctxMenu` state
function ContextMenu({ menu, onClose }) {
  useEffect(() => {
    if (!menu) return;
    const onDoc = (e) => { if (!e.target.closest(".ctx-menu")) onClose(); };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("contextmenu", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("contextmenu", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [menu]);

  if (!menu) return null;
  // Clamp to viewport so the menu doesn't render off-screen at the cursor's edge
  const W = 220, H = (menu.items.length * 34) + 8;
  const x = Math.min(menu.x, window.innerWidth - W - 8);
  const y = Math.min(menu.y, window.innerHeight - H - 8);
  return (
    <div className="ctx-menu" style={{ position: "fixed", top: y, left: x, zIndex: 9999 }}
         onContextMenu={(e) => e.preventDefault()}>
      {menu.items.map((it, i) => (
        it.divider
          ? <div key={i} className="ctx-menu-divider" />
          : <button key={i} className="ctx-menu-item" disabled={it.disabled}
                    onClick={() => { it.onClick && it.onClick(); onClose(); }}>
              {it.icon && <Icon name={it.icon} size={14} />}
              <span>{it.label}</span>
              {it.shortcut && <span className="ctx-menu-shortcut">{it.shortcut}</span>}
            </button>
      ))}
    </div>
  );
}

const Sparkle = ({ size = 11, white, spin, style }) => (
  <span
    className={"sparkle " + (white ? "white " : "") + (spin ? "spin" : "")}
    style={{ width: size, height: size, ...(style || {}) }}
  />
);

// Share dropdown — a button + popover with the share/export options
// available for the current screen. Closes on outside click or Escape.
// Overflow menu — a 3-dot icon button that opens a list of secondary actions.
// Used in Taskbars to keep the action row uncluttered: anything that isn't a
// primary action (Share, Pin, etc.) goes under the kebab so the row stays
// focused on the user's main intents.
function OverflowMenu({ options, title = "More actions" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  if (!options || options.length === 0) return null;
  return (
    <div className="share-dd overflow-dd" ref={ref}>
      <button className="btn icon-only" onClick={() => setOpen(v => !v)} title={title} aria-label={title}>
        <Icon name="more_vert" size={18} />
      </button>
      {open && (
        <div className="ctx-menu share-menu overflow-menu">
          {options.map((o, i) => (
            <button key={i} className="ctx-menu-item"
                    onClick={() => { o.onClick && o.onClick(); setOpen(false); }}>
              {o.icon && <Icon name={o.icon} size={14} />}
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Project-specific notifications popover — shows a live feed of who's
// editing this project, what's waiting for admin approval, and the
// most recent Master changes. Opens from the bell icon in the Taskbar.
function ProjectActivityPopover({ open, onClose, projectId, projectName, activity, approvals, members }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose && onClose(); };
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  if (!open) return null;
  const nameFor = (userId) => {
    const m = (members || []).find(x => x.id === userId);
    return m ? m.name : (userId || "Someone");
  };
  const initialsFor = (userId) => {
    const m = (members || []).find(x => x.id === userId);
    return m ? m.initials : "?";
  };
  const projectFeed = activity || [];
  const editing = projectFeed.filter(a => a.kind === "editing");
  const approved = projectFeed.filter(a => a.kind === "approved");
  const projectPending = (approvals || []).filter(a => a.status === "pending" && a.projectId === projectId);

  return (
    <div className="activity-popover" ref={ref}>
      <div className="activity-popover-h">
        <div>
          <div className="activity-popover-eyebrow">Project activity</div>
          <div className="activity-popover-title">{projectName}</div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={16} /></button>
      </div>

      <div className="activity-popover-body">
        <div className="activity-section">
          <div className="activity-section-h">
            <Icon name="edit_note" size={13} />Currently drafting
            <span className="activity-section-count">{editing.length}</span>
          </div>
          {editing.length === 0 ? (
            <div className="activity-empty">No one has an open edit event on this project.</div>
          ) : (
            editing.map((a, i) => (
              <div key={"e" + i} className="activity-row">
                <div className="activity-avatar">{initialsFor(a.user)}</div>
                <div className="activity-row-body">
                  <div className="activity-row-name">{nameFor(a.user)}</div>
                  <div className="activity-row-note">{a.note}</div>
                </div>
                <span className="activity-row-time">{a.time}</span>
              </div>
            ))
          )}
        </div>

        <div className="activity-section">
          <div className="activity-section-h">
            <Icon name="pending_actions" size={13} />Waiting for approval
            <span className="activity-section-count">{projectPending.length}</span>
          </div>
          {projectPending.length === 0 ? (
            <div className="activity-empty">Nothing awaiting review on this project.</div>
          ) : (
            projectPending.map(a => (
              <div key={a.id} className="activity-row">
                <div className="activity-avatar">{initialsFor(a.requestedBy)}</div>
                <div className="activity-row-body">
                  <div className="activity-row-name">{nameFor(a.requestedBy)}</div>
                  <div className="activity-row-note">{a.summary}</div>
                </div>
                <span className="activity-row-time">{a.requestedAt}</span>
              </div>
            ))
          )}
        </div>

        <div className="activity-section">
          <div className="activity-section-h">
            <Icon name="check_circle" size={13} />Recent Master changes
            <span className="activity-section-count">{approved.length}</span>
          </div>
          {approved.length === 0 ? (
            <div className="activity-empty">No approved changes yet.</div>
          ) : (
            approved.map((a, i) => (
              <div key={"a" + i} className="activity-row">
                <div className="activity-avatar activity-avatar-approved"><Icon name="check" size={13} /></div>
                <div className="activity-row-body">
                  <div className="activity-row-name">{nameFor(a.user)}</div>
                  <div className="activity-row-note">{a.note}</div>
                </div>
                <span className="activity-row-time">{a.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ShareDropdown({ options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  if (!options || options.length === 0) return null;
  return (
    <div className="share-dd" ref={ref}>
      <button className="btn" onClick={() => setOpen(v => !v)} title="Share this screen">
        <Icon name="share" size={16} />Share
        <Icon name="expand_more" size={14} style={{ marginLeft: 2, opacity: 0.6 }} />
      </button>
      {open && (
        <div className="ctx-menu share-menu">
          {options.map((o, i) => (
            <button key={i} className="ctx-menu-item"
                    onClick={() => { o.onClick && o.onClick(); setOpen(false); }}>
              {o.icon && <Icon name={o.icon} size={14} />}
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const formatMoney = (n) => {
  if (n == null) return "N/A";
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(0) + "k";
  return "$" + n.toLocaleString();
};
const fullMoney = (n) => "$" + Math.round(n).toLocaleString();

// =====================================================
// DRAWING THUMBNAIL — abstract architectural placeholder w/ AI markups
// =====================================================
const DrawingThumb = ({ kind = "level1", color = "#E84600", markups = 12 }) => {
  // simplified line-drawing styles per kind, with orange "AI takeoff" overlays
  const stroke = "rgba(39,38,53,0.55)";
  const ink = "rgba(39,38,53,0.85)";
  const accent = color;
  if (kind === "level1") {
    return (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
        <rect x="14" y="14" width="172" height="122" fill="none" stroke={ink} strokeWidth="1.4" />
        {/* interior walls */}
        <line x1="14" y1="62" x2="120" y2="62" stroke={stroke} strokeWidth="0.8" />
        <line x1="120" y1="14" x2="120" y2="62" stroke={stroke} strokeWidth="0.8" />
        <line x1="60" y1="62" x2="60" y2="136" stroke={stroke} strokeWidth="0.8" />
        <line x1="120" y1="62" x2="120" y2="100" stroke={stroke} strokeWidth="0.8" />
        <line x1="120" y1="100" x2="186" y2="100" stroke={stroke} strokeWidth="0.8" />
        {/* doors */}
        <path d="M 30 62 A 8 8 0 0 1 38 54" fill="none" stroke={stroke} strokeWidth="0.6" />
        <path d="M 60 88 A 8 8 0 0 1 68 96" fill="none" stroke={stroke} strokeWidth="0.6" />
        {/* AI markup overlay — measurement lines */}
        <line x1="14" y1="146" x2="120" y2="146" stroke={accent} strokeWidth="0.8" />
        <line x1="14" y1="143" x2="14" y2="149" stroke={accent} strokeWidth="0.8" />
        <line x1="120" y1="143" x2="120" y2="149" stroke={accent} strokeWidth="0.8" />
        <text x="67" y="144" fill={accent} fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="700">42'-6"</text>
        {/* AI takeoff hatch */}
        <rect x="62" y="64" width="56" height="34" fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.6" strokeDasharray="2 2" />
        <circle cx="85" cy="48" r="3" fill={accent} />
        <text x="85" y="50" fill="#fff" fontSize="4" fontFamily="monospace" textAnchor="middle" fontWeight="700">1</text>
        <circle cx="150" cy="40" r="3" fill={accent} />
        <text x="150" y="42" fill="#fff" fontSize="4" fontFamily="monospace" textAnchor="middle" fontWeight="700">2</text>
        <circle cx="35" cy="100" r="3" fill={accent} />
        <text x="35" y="102" fill="#fff" fontSize="4" fontFamily="monospace" textAnchor="middle" fontWeight="700">3</text>
      </svg>
    );
  }
  if (kind === "level2") {
    return (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
        <rect x="14" y="14" width="172" height="122" fill="none" stroke={ink} strokeWidth="1.4" />
        <line x1="14" y1="74" x2="186" y2="74" stroke={stroke} strokeWidth="0.8" />
        <line x1="78" y1="14" x2="78" y2="74" stroke={stroke} strokeWidth="0.8" />
        <line x1="78" y1="74" x2="78" y2="136" stroke={stroke} strokeWidth="0.8" />
        <line x1="140" y1="74" x2="140" y2="136" stroke={stroke} strokeWidth="0.8" />
        {/* room labels */}
        <circle cx="46" cy="44" r="5" fill="none" stroke={stroke} strokeWidth="0.5" />
        <text x="46" y="46" fill={stroke} fontSize="4.5" fontFamily="monospace" textAnchor="middle">201</text>
        <circle cx="130" cy="44" r="5" fill="none" stroke={stroke} strokeWidth="0.5" />
        <text x="130" y="46" fill={stroke} fontSize="4.5" fontFamily="monospace" textAnchor="middle">202</text>
        {/* AI markup */}
        <rect x="80" y="76" width="58" height="58" fill={accent} fillOpacity="0.10" stroke={accent} strokeWidth="0.6" strokeDasharray="2 2" />
        <circle cx="56" cy="106" r="3" fill={accent} />
        <text x="56" y="108" fill="#fff" fontSize="4" fontFamily="monospace" textAnchor="middle" fontWeight="700">A</text>
        <circle cx="160" cy="106" r="3" fill={accent} />
        <text x="160" y="108" fill="#fff" fontSize="4" fontFamily="monospace" textAnchor="middle" fontWeight="700">B</text>
      </svg>
    );
  }
  if (kind === "rcp") {
    return (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
        <rect x="14" y="14" width="172" height="122" fill="none" stroke={ink} strokeWidth="1.4" />
        {/* ceiling grid */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={"v" + i} x1={14 + (i + 1) * 22} y1="14" x2={14 + (i + 1) * 22} y2="136" stroke={stroke} strokeWidth="0.4" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={"h" + i} x1="14" y1={14 + (i + 1) * 20} x2="186" y2={14 + (i + 1) * 20} stroke={stroke} strokeWidth="0.4" />
        ))}
        {/* lights */}
        {[[36,34],[80,34],[124,34],[168,34],[36,74],[80,74],[124,74],[168,74],[36,114],[80,114],[124,114],[168,114]].map(([x,y],i) => (
          <rect key={i} x={x-5} y={y-2} width="10" height="4" fill="none" stroke={stroke} strokeWidth="0.4" />
        ))}
        {/* AI markup — conflict callout */}
        <circle cx="80" cy="74" r="11" fill="none" stroke={accent} strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="80" cy="74" r="4" fill={accent} />
        <text x="80" y="76" fill="#fff" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="700">!</text>
        <line x1="91" y1="74" x2="130" y2="50" stroke={accent} strokeWidth="0.8" />
        <text x="132" y="50" fill={accent} fontSize="5" fontFamily="monospace" fontWeight="700">CEIL HT?</text>
      </svg>
    );
  }
  // elevations
  return (
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
      {/* ground line */}
      <line x1="6" y1="120" x2="194" y2="120" stroke={ink} strokeWidth="1.2" />
      {/* building mass */}
      <rect x="20" y="42" width="160" height="78" fill="none" stroke={ink} strokeWidth="1.2" />
      <rect x="60" y="22" width="80" height="20" fill="none" stroke={ink} strokeWidth="1" />
      {/* windows grid */}
      {Array.from({ length: 3 }).map((_, r) => (
        Array.from({ length: 7 }).map((__, c) => (
          <rect key={r + "-" + c} x={28 + c * 21} y={50 + r * 22} width="14" height="14" fill="none" stroke={stroke} strokeWidth="0.5" />
        ))
      ))}
      {/* entrance */}
      <rect x="92" y="98" width="16" height="22" fill="none" stroke={stroke} strokeWidth="0.6" />
      {/* AI markup — height dim */}
      <line x1="190" y1="42" x2="190" y2="120" stroke={accent} strokeWidth="0.8" />
      <line x1="187" y1="42" x2="193" y2="42" stroke={accent} strokeWidth="0.8" />
      <line x1="187" y1="120" x2="193" y2="120" stroke={accent} strokeWidth="0.8" />
      <text x="186" y="84" fill={accent} fontSize="5" fontFamily="monospace" textAnchor="end" fontWeight="700">28'-0"</text>
      {/* material callouts */}
      <circle cx="50" cy="80" r="3" fill={accent} />
      <text x="50" y="82" fill="#fff" fontSize="4" fontFamily="monospace" textAnchor="middle" fontWeight="700">M1</text>
      <circle cx="150" cy="80" r="3" fill={accent} />
      <text x="150" y="82" fill="#fff" fontSize="4" fontFamily="monospace" textAnchor="middle" fontWeight="700">M2</text>
    </svg>
  );
};

// =====================================================
// COLUMN 1 — PRIMARY NAV
// =====================================================
function NavRail({ screen, setScreen, setScreenInNewTab, user, onToggleTheme, theme, recentlyVisited, recentProjects, onOpenProject, onOpenProjectInNewTab, onOpenSettings, pinnedItems, onOpenPinned, onAddConnection, onCtxMenu, connections, collapsed, onToggleCollapsed, freshMode, onToggleFreshMode }) {
  const items = [
    { id: "home", label: "Home", icon: "home" },
    { id: "company", label: "Company", icon: "domain" },
    { id: "projects", label: "Projects", icon: "folder_open" },
    { id: "skills", label: "Skills", icon: "auto_awesome" },
    { id: "reports", label: "Reports", icon: "assessment" },
    { id: "files", label: "Files", icon: "folder_copy" },
  ];

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  return (
    <aside className={"col-nav " + (collapsed ? "is-collapsed" : "")}>
      <div className="brand">
        {/* Both logos always mounted — visibility cross-fades on collapse for
            a smoother mechanical transition. */}
        <img src="design-system/logo-full-light.svg" alt="BuildCrew.AI"
             className={"brand-full " + (collapsed ? "is-hidden" : "")} />
        <img src="design-system/logo_icon.svg" alt=""
             className={"brand-icon " + (collapsed ? "" : "is-hidden")}
             aria-hidden="true" />
        {/* First-user-experience demo toggle — hidden when nav is collapsed (no room) */}
        {onToggleFreshMode && !collapsed && (
          <button
            className={"brand-demo-toggle " + (freshMode ? "is-on" : "")}
            onClick={onToggleFreshMode}
            title={freshMode ? "Exit first-user experience demo" : "Switch to first-user experience demo"}>
            <Icon name={freshMode ? "restart_alt" : "person_add"} size={14} />
            <span>{freshMode ? "FUX · On" : "FUX"}</span>
          </button>
        )}
      </div>

      {/* Toggle button — collapses/expands the nav rail. The chevron rotates
          180° instead of swapping glyphs so the motion stays continuous. */}
      {onToggleCollapsed && (
        <button className="nav-collapse-btn"
                onClick={onToggleCollapsed}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <Icon name="chevron_left" size={16} style={collapsed ? { transform: "rotate(180deg)" } : undefined} />
        </button>
      )}

      <div className="nav-section">Workspace</div>
      {items.map(it => (
        <div key={it.id}
             data-nav-id={it.id}
             className={"nav-item " + (screen === it.id ? "active" : "")}
             title={collapsed ? it.label : undefined}
             onClick={() => setScreen(it.id)}
             onContextMenu={(e) => onCtxMenu && onCtxMenu([
               { label: "Open", icon: "open_in_browser", onClick: () => setScreen(it.id) },
               { label: "Open in new tab", icon: "tab", onClick: () => setScreenInNewTab && setScreenInNewTab(it.id) },
             ], e)}>
          <Icon name={it.icon} />
          <span>{it.label}</span>
          {it.count != null && <span className="count">{it.count}</span>}
        </div>
      ))}

      {pinnedItems && pinnedItems.length > 0 && (
        <>
          <div className="nav-section">Pinned</div>
          {pinnedItems.slice(0, 6).map(p => (
            <div key={p.id} className="nav-item"
                 title={collapsed ? p.label : undefined}
                 onClick={() => onOpenPinned && onOpenPinned(p)}
                 onContextMenu={(e) => onCtxMenu && onCtxMenu([
                   { label: "Open", icon: "open_in_browser", onClick: () => onOpenPinned && onOpenPinned(p) },
                   ...(p.kind === "project" ? [{ label: "Open in new tab", icon: "tab", onClick: () => onOpenProjectInNewTab && onOpenProjectInNewTab(p.id) }] : []),
                 ], e)}>
              <Icon name={p.icon || "push_pin"} />
              <span>{p.label}</span>
            </div>
          ))}
        </>
      )}

      {recentlyVisited && recentlyVisited.length > 0 && (
        <>
          <div className="nav-section">Recently visited</div>
          {recentlyVisited.slice(0, 4).map(rv => (
            <div key={rv.key} className="nav-item nav-recent"
                 title={collapsed ? (rv.label + (rv.subLabel ? " · " + rv.subLabel : "")) : undefined}
                 onClick={() => rv.onClick && rv.onClick()}
                 onContextMenu={(e) => onCtxMenu && onCtxMenu([
                   { label: "Open", icon: "open_in_browser", onClick: () => rv.onClick && rv.onClick() },
                 ], e)}>
              <Icon name={rv.icon || "schedule"} />
              <span className="recent-label">{rv.label}</span>
              {rv.subLabel && <span className="recent-sub">{rv.subLabel}</span>}
              {rv.running && <span className="run-dot" title="Running" />}
            </div>
          ))}
        </>
      )}

      {recentProjects && recentProjects.length > 0 && (
        <>
          <div className="nav-section">Recent projects</div>
          {recentProjects.slice(0, 4).map(p => (
            <div key={p.id} className="nav-item"
                 title={collapsed ? p.name : undefined}
                 onClick={() => onOpenProject && onOpenProject(p.id)}
                 onContextMenu={(e) => onCtxMenu && onCtxMenu([
                   { label: "Open", icon: "open_in_browser", onClick: () => onOpenProject && onOpenProject(p.id) },
                   { label: "Open in new tab", icon: "tab", onClick: () => onOpenProjectInNewTab && onOpenProjectInNewTab(p.id) },
                 ], e)}>
              <Icon name={p.icon || "folder_open"} />
              <span>{p.name}</span>
            </div>
          ))}
        </>
      )}

      <div className="nav-footer">
        <div className="nav-item theme-cycle" onClick={onToggleTheme} style={{ fontSize: 12.5 }} title={`Theme: ${theme === "light" ? "Light" : theme === "hybrid" ? "Hybrid" : "Dark"} mode (click to cycle)`}>
          <Icon name={theme === "light" ? "light_mode" : theme === "hybrid" ? "contrast" : "dark_mode"} />
          <span style={{ flex: 1 }}>{theme === "light" ? "Light mode" : theme === "hybrid" ? "Hybrid mode" : "Dark mode"}</span>
          <span className="theme-cycle-dots" aria-hidden="true">
            <span className={"tcd " + (theme === "light" ? "on" : "")} />
            <span className={"tcd " + (theme === "hybrid" ? "on" : "")} />
            <span className={"tcd " + (theme === "dark" ? "on" : "")} />
          </span>
        </div>
        <div className="nav-divider" />
        <div className="user-card-wrap" ref={userMenuRef}>
          <div className="user-card" onClick={() => setUserMenuOpen(v => !v)}>
            <div className="avatar">{user.initials}</div>
            <div className="who">
              <div className="who-name">{user.name}</div>
              <div className="who-role">{user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Member"}</div>
              <small>{user.company}</small>
            </div>
            <Icon name={userMenuOpen ? "expand_more" : "expand_less"} size={16} style={{ opacity: 0.5, marginLeft: "auto" }} />
          </div>
          {userMenuOpen && (
            <div className="user-menu">
              <div className="user-menu-item" onClick={() => { setUserMenuOpen(false); onOpenSettings && onOpenSettings(); }}>
                <Icon name="tune" size={15} /><span>Settings</span>
              </div>
              <div className="user-menu-item">
                <Icon name="person" size={15} /><span>My profile</span>
              </div>
              <div className="user-menu-item">
                <Icon name="help_outline" size={15} /><span>Help & support</span>
              </div>
              <div className="user-menu-sep" />
              <div className="user-menu-item">
                <Icon name="logout" size={15} /><span>Sign out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// =====================================================
// COLUMN 2 — CONTEXT LIST  (varies by screen)
// =====================================================
function ListColumn({ screen, ctx, setCtx, projects, skills, runs, onNewProject }) {
  // Each screen shows a different list in the middle column.
  if (screen === "home") return <HomeContextList ctx={ctx} setCtx={setCtx} runs={runs} projects={projects} />;
  if (screen === "projects") return <ProjectsList ctx={ctx} setCtx={setCtx} projects={projects} onNewProject={onNewProject} />;
  if (screen === "skills") return <SkillsList ctx={ctx} setCtx={setCtx} skills={skills} runs={runs} />;
  if (screen === "reports") return <ReportsList ctx={ctx} setCtx={setCtx} />;
  if (screen === "labor") return <LaborList ctx={ctx} setCtx={setCtx} />;
  if (screen === "settings") return <SettingsList ctx={ctx} setCtx={setCtx} />;
  if (screen === "project") return <ProjectSubnav ctx={ctx} setCtx={setCtx} projects={projects} />;
  return null;
}

function HomeContextList({ ctx, setCtx, runs, projects }) {
  const sections = [
    { id: "overview", title: "Overview", icon: "dashboard" },
    { id: "pinned", title: "Pinned items", icon: "push_pin" },
    { id: "activity", title: "Activity feed", icon: "history" },
    { id: "scheduled", title: "Scheduled runs", icon: "schedule" }
  ];
  return (
    <div className="col-list">
      <div className="col-list-head">
        <div className="row"><h2>Home</h2></div>
        <div className="sub">Your crew at a glance</div>
      </div>
      <div className="col-list-body">
        {sections.map(s => (
          <div key={s.id} className={"list-item " + (ctx.section === s.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, section: s.id })}>
            <div className="li-row">
              <Icon name={s.icon} size={16} style={{ opacity: 0.7 }} />
              <div className="li-title">{s.title}</div>
            </div>
          </div>
        ))}
        <div className="section-bar"><span>Quick jump</span><div className="line" /></div>
        {runs.slice(0, 3).map(r => (
          <div key={r.id} className="list-item" onClick={() => setCtx({ ...ctx, section: "activity" })}>
            <div className="li-title">{r.skill}</div>
            <div className="li-meta">
              <span>{r.project.split(" ").slice(0, 2).join(" ")}…</span>
              <span>·</span>
              <span>{r.when}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsList({ ctx, setCtx, projects, onNewProject }) {
  const [q, setQ] = useState("");
  const filtered = projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const filters = [
    { id: "all", label: "All projects", count: projects.length },
    { id: "draft", label: "Draft", count: projects.filter(p => p.status === "draft").length },
    { id: "bid", label: "Bid Phase", count: projects.filter(p => p.status === "working").length },
    { id: "submitted", label: "Proposal Submitted", count: projects.filter(p => p.status === "done").length },
    { id: "won", label: "Won", count: projects.filter(p => p.status === "won").length || 0 },
  ];
  const statusMap = { draft: "draft", bid: "working", submitted: "done", won: "won" };
  const activeFilter = ctx.filter || "all";
  const list = activeFilter !== "all"
    ? filtered.filter(p => p.status === statusMap[activeFilter])
    : filtered;
  return (
    <div className="col-list">
      <div className="col-list-head">
        <div className="row" style={{ alignItems: "center" }}>
          <h2 style={{ flex: 1 }}>Projects</h2>
        </div>
        <div className="list-search">
          <Icon name="search" />
          <input placeholder="Search projects…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button className="newproj-btn newproj-btn-block" onClick={onNewProject} title="New project">
          <Icon name="add" size={14} /><span>New project</span>
        </button>
      </div>
      <div className="col-list-body">
        {filters.map(f => (
          <div key={f.id} className={"list-item " + (activeFilter === f.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, filter: f.id })}>
            <div className="li-row">
              <div className="li-title" style={{ flex: 1 }}>{f.label}</div>
              <span style={{ fontSize: 11, opacity: 0.55 }}>{f.count}</span>
            </div>
          </div>
        ))}
        <div className="section-bar"><span>Recent</span><div className="line" /></div>
        {list.map(p => (
          <div key={p.id} className="list-item" onClick={() => setCtx({ ...ctx, openProject: p.id })}>
            <div className="li-title">{p.name}</div>
            <div className="li-meta">
              <span>{p.kind}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectSubnav({ ctx, setCtx, projects }) {
  const project = projects.find(p => p.id === ctx.projectId) || projects[0];
  const sections = [
    { id: "overview", label: "Project home", icon: "space_dashboard" },
    { id: "files", label: "Files uploaded", icon: "upload_file", count: 28 },
    { id: "skills", label: "Run skills", icon: "auto_awesome" },
    { id: "estimation", label: "Rough Order of Magnitude (ROM) Estimate", icon: "calculate", badge: "Updated" },
    { id: "rfc", label: "Clarifications & Potential RFIs", icon: "rule", badge: "23" },
    { id: "bid", label: "Bid Level Analysis", icon: "compare_arrows" },
    { id: "reports", label: "Custom reports", icon: "description" },
    { id: "schedule", label: "Schedule runs", icon: "schedule" }
  ];
  return (
    <div className="col-list">
      <div className="col-list-head">
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Project</div>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <h2 style={{ fontSize: 16, lineHeight: 1.25 }}>{project.name}</h2>
        </div>
        <div className="sub" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
          {project.kind} · {project.stage}
        </div>
      </div>
      <div className="col-list-body">
        {sections.map(s => (
          <div key={s.id} className={"list-item " + ((ctx.tab || "overview") === s.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, tab: s.id })}>
            <div className="li-row">
              <Icon name={s.icon} size={16} style={{ opacity: 0.7 }} />
              <div className="li-title" style={{ flex: 1 }}>{s.label}</div>
              {s.count != null && <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>{s.count}</span>}
              {s.badge && <span className="badge b-working" style={{ fontSize: 9, padding: "2px 8px" }}>{s.badge}</span>}
            </div>
          </div>
        ))}
        <div className="section-bar"><span>Recent activity</span><div className="line" /></div>
        <div className="list-item">
          <div className="li-row">
            <CodyMark size={12} />
            <div className="li-title" style={{ fontSize: 12.5 }}>Estimation v3 ready</div>
          </div>
          <div className="li-meta">12 min ago · 1,284 lines</div>
        </div>
        <div className="list-item">
          <div className="li-row">
            <Icon name="upload_file" size={14} style={{ opacity: 0.6 }} />
            <div className="li-title" style={{ fontSize: 12.5 }}>3 files added</div>
          </div>
          <div className="li-meta">3h ago · Sam Lee</div>
        </div>
      </div>
    </div>
  );
}

function SkillsList({ ctx, setCtx, skills, runs }) {
  return (
    <div className="col-list">
      <div className="col-list-head">
        <div className="row"><h2>Skills</h2></div>
        <div className="sub">Your AI crew</div>
      </div>
      <div className="col-list-body">
        {skills.map(s => (
          <div key={s.id} className={"list-item " + ((ctx.skill || skills[0].id) === s.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, skill: s.id })}>
            <div className="li-row">
              <Icon name={s.icon} size={16} style={{ opacity: 0.7 }} />
              <div className="li-title" style={{ flex: 1 }}>{s.name}</div>
            </div>
            <div className="li-meta">{s.runs} runs · {s.duration}</div>
          </div>
        ))}
        <div className="section-bar"><span>Recent runs</span><div className="line" /></div>
        {runs.slice(0, 4).map(r => (
          <div key={r.id} className="list-item">
            <div className="li-title" style={{ fontSize: 12.5 }}>{r.skill}</div>
            <div className="li-meta">{r.project.slice(0, 24)}… · {r.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsList({ ctx, setCtx }) {
  const items = [
    { id: "all", label: "All reports", count: 12 },
    { id: "shared", label: "Shared with me", count: 4 },
    { id: "templates", label: "Templates", count: 6 },
    { id: "drafts", label: "Drafts", count: 2 }
  ];
  const reports = [
    { id: "rep1", title: "Recreational Wellness: ROM v3", date: "Today", project: "Rec & Wellness Center" },
    { id: "rep2", title: "Rivergrove Bid Summary", date: "Yesterday", project: "Rivergrove Phase II" },
    { id: "rep3", title: "Mercy Clinic: Owner brief", date: "2d ago", project: "Mercy Outpatient" },
    { id: "rep4", title: "RFI Tracker: Westlake", date: "3d ago", project: "Westlake Elementary" }
  ];
  return (
    <div className="col-list">
      <div className="col-list-head">
        <div className="row"><h2>Reports</h2></div>
        <div className="sub">Build, share, export</div>
      </div>
      <div className="col-list-body">
        {items.map(f => (
          <div key={f.id} className={"list-item " + ((ctx.tab || "all") === f.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, tab: f.id })}>
            <div className="li-row">
              <div className="li-title" style={{ flex: 1 }}>{f.label}</div>
              <span style={{ fontSize: 11, opacity: 0.55 }}>{f.count}</span>
            </div>
          </div>
        ))}
        <div className="section-bar"><span>Recent</span><div className="line" /></div>
        {reports.map(r => (
          <div key={r.id} className={"list-item " + (ctx.openReport === r.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, openReport: r.id })}>
            <div className="li-title">{r.title}</div>
            <div className="li-meta"><span>{r.project}</span><span>·</span><span>{r.date}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LaborList({ ctx, setCtx }) {
  const regions = [
    { id: "pdx", label: "PDX metro", count: 24, active: true },
    { id: "sea", label: "Seattle metro", count: 18 },
    { id: "boi", label: "Boise", count: 12 },
    { id: "default", label: "National default", count: 32 }
  ];
  return (
    <div className="col-list">
      <div className="col-list-head">
        <div className="row"><h2>Labor rates</h2></div>
        <div className="sub">Applied to all skills</div>
      </div>
      <div className="col-list-body">
        <div className="section-bar"><span>Regions</span><div className="line" /></div>
        {regions.map(r => (
          <div key={r.id} className={"list-item " + ((ctx.region || "pdx") === r.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, region: r.id })}>
            <div className="li-row">
              <Icon name="place" size={16} style={{ opacity: 0.6 }} />
              <div className="li-title" style={{ flex: 1 }}>{r.label}</div>
              <span style={{ fontSize: 11, opacity: 0.55 }}>{r.count}</span>
            </div>
          </div>
        ))}
        <div className="section-bar"><span>Tools</span><div className="line" /></div>
        <div className="list-item"><div className="li-row"><Icon name="upload" size={16} style={{ opacity: 0.6 }} /><div className="li-title">Upload CSV</div></div></div>
        <div className="list-item"><div className="li-row"><Icon name="history" size={16} style={{ opacity: 0.6 }} /><div className="li-title">Version history</div></div></div>
      </div>
    </div>
  );
}

function SettingsList({ ctx, setCtx }) {
  const tabs = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "team", label: "Team & permissions", icon: "groups" },
    { id: "ai", label: "AI assistant", icon: "auto_awesome" },
    { id: "appearance", label: "Appearance", icon: "palette" },
    { id: "integrations", label: "Integrations", icon: "extension" },
    { id: "billing", label: "Billing", icon: "credit_card" },
    { id: "api", label: "API & webhooks", icon: "code" }
  ];
  return (
    <div className="col-list">
      <div className="col-list-head">
        <div className="row"><h2>Settings</h2></div>
        <div className="sub">Workspace · Acme Builders</div>
      </div>
      <div className="col-list-body">
        {tabs.map(t => (
          <div key={t.id} className={"list-item " + ((ctx.tab || "profile") === t.id ? "active" : "")}
               onClick={() => setCtx({ ...ctx, tab: t.id })}>
            <div className="li-row">
              <Icon name={t.icon} size={16} style={{ opacity: 0.7 }} />
              <div className="li-title">{t.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// CODY MESSAGE — reusable AI-generated banner
// Always at top of its screen area; dismissible; indigo base.
// =====================================================
function CodyMessage({
  eyebrow = "Cody",
  title,
  children,
  items,                 // optional [{ kind: "alert"|"platform", icon, title, when, body }]
  pillLabel,
  onPill,
  onDismiss,
  defaultDismissed = false,
  dismissible = true,
  className = ""
}) {
  const [hidden, setHidden] = useState(defaultDismissed);
  const listRef = useRef(null);
  // Cap the items list at exactly 4 visible — measure the 5th item's
  // offsetTop after render and set max-height to that, so taller items
  // don't bleed past the cutoff and shorter ones don't show a 5th.
  useEffect(() => {
    if (!items || items.length <= 4 || !listRef.current) {
      if (listRef.current) listRef.current.style.maxHeight = "";
      return;
    }
    const children = listRef.current.children;
    if (children.length > 4) {
      const fifth = children[4];
      listRef.current.style.maxHeight = fifth.offsetTop + "px";
    }
  }, [items]);
  if (hidden) return null;
  const handleDismiss = () => {
    setHidden(true);
    onDismiss && onDismiss();
  };
  return (
    <div className={"cody-msg " + className}>
      <div className="cody-msg-head">
        <div className="cody-msg-mascot">
          <img src="design-system/cody.png" alt="Cody" />
        </div>
        <div className="cody-msg-title">
          <div className="cody-msg-eyebrow"><CodyMark size={14} />{eyebrow}</div>
          {title && (
            <div className="cody-msg-h">
              {title}
              {items && items.length > 0 && (
                <span className="cody-msg-count">{items.length}</span>
              )}
            </div>
          )}
        </div>
        <div className="cody-msg-actions">
          {dismissible && (
            <button className="cody-msg-dismiss" onClick={handleDismiss} title="Dismiss">
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </div>
      {children && <div className="cody-msg-body">{children}</div>}
      {items && items.length > 0 && (
        <div className="cody-msg-list" ref={listRef}>
          {items.map((it, i) => (
            <div key={i} className={"cody-msg-list-item " + (it.kind === "alert" ? "alert" : "")}>
              <div className="ic"><Icon name={it.icon} size={15} /></div>
              <div className="body">
                <div className="head">
                  <div className="ttl-group">
                    <span className="ttl">{it.title}</span>
                    <button className="cody-msg-check" onClick={onPill} type="button">
                      Check it out <Icon name="arrow_forward" size={12} />
                    </button>
                  </div>
                  {it.when && <div className="when">{it.when}</div>}
                </div>
                <div className="text">{it.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// TASKBAR — COLUMN 3 TOP
// =====================================================
function Taskbar({ crumbs, actions, onAskAI, switcher, projectId, hasPending, onPushToMaster, onOpenNotifications, notificationCount }) {
  return (
    <div className="taskbar">
      <div className="crumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">·</span>}
            {c.useSwitcher && switcher
              ? switcher
              : c.bold ? <b>{c.label}</b> : <span>{c.label}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="right">
        {actions}
        {projectId && hasPending && onPushToMaster && (
          <button className="btn-primary taskbar-push-btn" onClick={onPushToMaster} title="Submit your pending changes for approval">
            <Icon name="publish" size={14} />Push to Master
          </button>
        )}
        {projectId && onOpenNotifications && (
          <button className="icon-btn taskbar-notify-btn" onClick={onOpenNotifications} title="Project activity">
            <Icon name="notifications" size={18} />
            {notificationCount > 0 && <span className="taskbar-notify-dot">{notificationCount}</span>}
          </button>
        )}
      </div>
    </div>
  );
}

// =====================================================
// CLIPBOARD — context-aware tray rendered as a sibling tab to Cody in
// the right rail. Surfaces shortcuts and live sections that change with
// the current screen. Today it's wired up for Project Home; other
// screens get a generic placeholder until their content is designed.
// =====================================================
function Clipboard({ context, onOpenProject, onOpenProjectTabInNewTab, onConfigureBid, onConfigureRom }) {
  const screen = context && context.screen;
  const ctx = (context && context.ctx) || {};
  const project = context && context.project;
  const isProjectHome = screen === "project" && project;

  // In-flight skill runs the user kicked off from the Clipboard. Each
  // simulates its own progress timeline, then transitions through a brief
  // "flashing" success state before settling into the regular done state.
  // Stored locally (not in BC_DATA) so they don't persist across navigation.
  const [localRuns, setLocalRuns] = useState([]);
  // Cleanup timers when the component unmounts (e.g. user closes the
  // panel mid-run) so we don't update state after unmount.
  const timersRef = useRef([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  if (!isProjectHome) {
    return (
      <div className="clipboard-body">
        <div className="clipboard-empty">
          <Icon name="content_paste" size={28} />
          <div className="clipboard-empty-title">Nothing pinned to this screen yet</div>
          <p>Open a project to see its recent skill runs and drop files here for indexing.</p>
        </div>
      </div>
    );
  }

  // Recent skill runs scoped to this project. Local in-flight runs render
  // first (newest activity), then historical from BC_DATA. Capped at 5.
  const allRuns = (window.BC_DATA && window.BC_DATA.runs) || [];
  const historicalRuns = allRuns
    .filter(r => r.projectId === project.id)
    .slice()
    .sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
  const localProjectRuns = localRuns.filter(r => r.projectId === project.id);
  const projectRuns = [...localProjectRuns, ...historicalRuns].slice(0, 5);
  const hiddenCount = (localProjectRuns.length + historicalRuns.length) - projectRuns.length;
  const skillIcon = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "calculate" :
    name === "Bid Level Analysis" ? "compare_arrows" :
    name === "Clarifications & Potential RFIs" ? "rule" :
    name === "Trade Scoping" ? "groups" :
    "auto_awesome";
  const shortSkill = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "ROM Estimate" :
    name === "Clarifications & Potential RFIs" ? "Clarifications & RFIs" :
    name;
  const skillToTab = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "estimation" :
    name === "Bid Level Analysis" ? "bid" :
    name === "Clarifications & Potential RFIs" ? "rfc" :
    name === "Trade Scoping" ? "trades" :
    null;
  const openRun = (r) => {
    if (r.status !== "done") return;
    const tab = skillToTab(r.skill);
    if (tab && onOpenProjectTabInNewTab) onOpenProjectTabInNewTab(project.id, tab);
  };

  // Skill tile catalog — the screen-aware tile grid at the top of the
  // Clipboard. Each skill carries its own accent color so the row reads
  // as a palette of distinct options at a glance. shortName is what
  // shows on the tile (kept tight so it fits in the two-column grid).
  const allSkills = (window.BC_DATA && window.BC_DATA.skills) || [];
  const skillAccent = (id) =>
    id === "estimation" ? "orange" :
    id === "bid-leveling" ? "tiffany" :
    id === "rfc" ? "indigo" :
    id === "trade-scoping" ? "raisin" :
    "raisin";
  const shortName = (name) =>
    name === "Rough Order of Magnitude (ROM) Estimate" ? "ROM Estimate" :
    name === "Clarifications & Potential RFIs" ? "Clarifications & RFIs" :
    name === "Bid Level Analysis" ? "Bid Analysis" :
    name;
  const skillIdToTab = (id) =>
    id === "estimation" ? "estimation" :
    id === "bid-leveling" ? "bid" :
    id === "rfc" ? "rfc" :
    id === "trade-scoping" ? "trades" :
    null;

  // Fake AI result shaped like BC_DATA.runs entries so the row meta logic
  // below ("12 min ago · $4.82M") works identically for local + global runs.
  const fakeResultForSkill = (skillId) => {
    if (skillId === "estimation") return { lines: 1284 + Math.floor(Math.random()*40), total: "$4.84M", confidence: 0.92, version: "v4" };
    if (skillId === "bid-leveling") return { subs: 3, divisions: 1, division: "Division 23 · HVAC", winner: "Apex Mechanical", bid: "$214.5k", savings: "$18.9k" };
    if (skillId === "rfc") return { issues: 14, critical: 2, high: 4, med: 6, low: 2 };
    if (skillId === "trade-scoping") return { trades: 13, highConfidence: 10, invited: 0, confidence: 0.89 };
    return { confidence: 0.85 };
  };

  // Spawn the simulated skill run row + progress ticker. Pulled out so
  // we can call it from a tile click directly OR from a config modal's
  // confirm callback after the user picks their run parameters.
  const runSkillSimulation = (s) => {
    const id = "local-" + Date.now() + "-" + Math.floor(Math.random()*1000);
    const newRun = {
      id,
      skill: s.name,
      skillId: s.id,
      projectId: project.id,
      status: "working",
      when: "Just now",
      progress: 0.05,
      duration: "running",
      startedAt: new Date().toISOString(),
      __local: true,
    };
    setLocalRuns(prev => [newRun, ...prev]);

    const tick = (current) => {
      const next = Math.min(0.99, current + 0.08 + Math.random() * 0.10);
      setLocalRuns(prev => prev.map(r => r.id === id ? { ...r, progress: next } : r));
      if (next < 0.99) {
        const t = setTimeout(() => tick(next), 650 + Math.random() * 350);
        timersRef.current.push(t);
      } else {
        setLocalRuns(prev => prev.map(r => r.id === id ? {
          ...r,
          status: "done",
          progress: 1,
          duration: "8m 14s",
          ai: fakeResultForSkill(s.id),
          __flashing: true,
        } : r));
        const flashOff = setTimeout(() => {
          setLocalRuns(prev => prev.map(r => r.id === id ? { ...r, __flashing: false } : r));
        }, 1200);
        timersRef.current.push(flashOff);
      }
    };
    const startTimer = setTimeout(() => tick(0.05), 250);
    timersRef.current.push(startTimer);
  };

  // Tile click router — for skills that need pre-run configuration (ROM,
  // Bid Level Analysis), open the matching modal and only kick off the
  // simulation after the user confirms. Other skills run immediately.
  const startSkill = (s) => {
    if (s.id === "bid-leveling" && onConfigureBid) {
      onConfigureBid(project.id, () => runSkillSimulation(s));
      return;
    }
    if (s.id === "estimation" && onConfigureRom) {
      onConfigureRom(project.id, () => runSkillSimulation(s));
      return;
    }
    runSkillSimulation(s);
  };

  const viewAllSkillRuns = () => {
    // Cross-tree imperative nav: ProjectHomeScreen registers a listener
    // for this event on mount and updates its internal homeTab.
    window.dispatchEvent(new CustomEvent("bc-set-home-tab", { detail: "history" }));
  };

  // Per-run secondary line (date + key stat). Matches the screenshot's
  // "20:49 · 12 sources" pattern.
  const runMeta = (r) => {
    if (r.status === "working") return `${r.when} · ${Math.round((r.progress || 0) * 100)}%`;
    if (!r.ai) return r.when;
    if (r.ai.total) return `${r.when} · ${r.ai.total}${r.ai.version ? ` · ${r.ai.version}` : ""}`;
    if (r.ai.issues != null) return `${r.when} · ${r.ai.issues} issues`;
    if (r.ai.trades != null) return `${r.when} · ${r.ai.trades} trades${r.ai.highConfidence != null ? ` · ${r.ai.highConfidence} high-conf` : ""}`;
    if (r.ai.savings) return `${r.when} · −${r.ai.savings}`;
    return r.when;
  };

  // Header context — surface the active project and (if the user is on a
  // skill result tab) the skill name, so the Clipboard reads as scoped
  // to whatever's in the main canvas.
  const skillNameForTab = (tabId) =>
    tabId === "estimation" ? "ROM Estimate" :
    tabId === "bid"        ? "Bid Level Analysis" :
    tabId === "rfc"        ? "Clarifications & RFIs" :
    tabId === "trades"     ? "Trade Scoping" :
    null;
  const activeSkillName = skillNameForTab(ctx.tab);

  return (
    <div className="clipboard-body">
      <div className="clipboard-header">
        <Icon name="folder_open" size={14} />
        <div className="clipboard-header-text">
          <div className="clipboard-header-name" title={project.name}>{project.name}</div>
          {activeSkillName && <div className="clipboard-header-skill">{activeSkillName}</div>}
        </div>
      </div>
      {/* SKILLS — colored tile grid. Tapping a tile opens the report for
          that skill on the current project in a new tab. */}
      <section className="clipboard-section">
        <div className="clipboard-section-h">
          <div className="clipboard-section-title">
            <span>Skills</span>
          </div>
        </div>
        <div className="clipboard-skills-grid">
          {allSkills.map(s => (
            <button
              key={s.id}
              type="button"
              className="clipboard-skill-tile"
              data-accent={skillAccent(s.id)}
              onClick={() => startSkill(s)}
              title={`Run ${s.name} on ${project.name}`}>
              <Icon name={s.icon} size={18} className="clipboard-skill-icon" />
              <span className="clipboard-skill-name">{shortName(s.name)}</span>
              <Icon name="play_arrow" size={16} className="clipboard-skill-arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* RECENT SKILL RUNS — flat list, screenshot-style. Each row opens
          its run in a new tab; the 3-dot button is a visual hook for a
          per-row menu (Open, Pin, Re-run, etc.) when that's designed. */}
      <section className="clipboard-section">
        <div className="clipboard-section-h">
          <div className="clipboard-section-title">
            <span>Recent skill runs</span>
          </div>
        </div>
        {projectRuns.length === 0 ? (
          <div className="clipboard-empty-sm">No skill runs yet for this project.</div>
        ) : (
          <ul className="clipboard-list">
            {projectRuns.map(r => {
              const isRunning = r.status === "working";
              const isFlashing = !!r.__flashing;
              const clickable = r.status === "done" && !!skillToTab(r.skill);
              const pct = Math.round((r.progress || 0) * 100);
              const cls = "clipboard-run "
                + (clickable ? "is-clickable " : "")
                + (isRunning ? "is-running " : "")
                + (isFlashing ? "is-flashing " : "");
              return (
                <li key={r.id}
                    className={cls.trim()}
                    onClick={clickable ? () => openRun(r) : undefined}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openRun(r); } } : undefined}
                    title={clickable ? "Open this run in a new tab" : undefined}>
                  <Icon name={skillIcon(r.skill)} size={20} className="clipboard-run-leadicon" />
                  <div className="clipboard-run-body">
                    <div className="clipboard-run-name">{shortSkill(r.skill)}</div>
                    <div className="clipboard-run-meta">
                      {isRunning && <span className="clipboard-status working"><span className="dot" /></span>}
                      {isRunning ? `${r.when} · ${pct}%` : runMeta(r)}
                    </div>
                    {isRunning && (
                      <div className="clipboard-run-progress">
                        <div className="clipboard-run-progress-bar" style={{ width: pct + "%" }} />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="clipboard-run-menu"
                    title="More actions"
                    aria-label="More actions"
                    onClick={(e) => { e.stopPropagation(); /* placeholder for per-run menu */ }}>
                    <Icon name="more_vert" size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {projectRuns.length > 0 && (
          <div className="clipboard-viewall">
            <button className="link-btn" onClick={viewAllSkillRuns}>
              View all Skill runs ({localProjectRuns.length + historicalRuns.length})
              <Icon name="arrow_forward" size={14} />
            </button>
          </div>
        )}
      </section>

      <div className="clipboard-divider" />

      {(() => {
        // Files section — drop zone + recent uploads with status pills.
        // Pulls from BC_DATA.filesByProject so the side tray mirrors the
        // Project Files tab. Newest 5 surface here; full list is one click
        // away via the View all link.
        const projectFiles = (((window.BC_DATA && window.BC_DATA.filesByProject) || {})[project.id]) || [];
        const recentFiles = projectFiles.slice().reverse().slice(0, 5);
        const ftypeIcon = (t) =>
          t === "pdf"  ? "picture_as_pdf" :
          t === "dwg"  ? "architecture" :
          t === "xlsx" || t === "csv" ? "table_view" :
          t === "docx" ? "description" :
          t === "jpg"  || t === "png" ? "image" :
          "insert_drive_file";
        const viewAllFiles = () => {
          window.dispatchEvent(new CustomEvent("bc-set-home-tab", { detail: "files" }));
        };
        return (
          <section className="clipboard-section">
            <div className="clipboard-section-h">
              <div className="clipboard-section-title">
                <span>Files</span>
              </div>
            </div>
            <button
              type="button"
              className="clipboard-drop"
              title="Drop or pick files to upload"
              onClick={(e) => { e.preventDefault(); /* upload picker — prototype stub */ }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("drag"); }}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag"); }}>
              <Icon name="cloud_upload" size={20} />
              <div className="clipboard-drop-title">Drop files to upload</div>
              <div className="clipboard-drop-sub">Cody will index and categorize them automatically</div>
            </button>
            {recentFiles.length === 0 ? (
              <div className="clipboard-empty-sm">No files yet for this project.</div>
            ) : (
              <ul className="clipboard-list clipboard-files-list">
                {recentFiles.map(f => {
                  const status = f.status || "uploaded";
                  return (
                    <li key={f.id} className="clipboard-file">
                      <Icon name={ftypeIcon(f.ftype)} size={16} className="clipboard-file-icon" />
                      <div className="clipboard-file-body">
                        <div className="clipboard-file-name" title={f.name}>{f.name}</div>
                        <div className="clipboard-file-meta">{f.size}{f.uploaded ? ` · ${f.uploaded}` : ""}</div>
                      </div>
                      {window.FileStatusBadge ? <window.FileStatusBadge status={status} /> : null}
                    </li>
                  );
                })}
              </ul>
            )}
            {projectFiles.length > 0 && (
              <div className="clipboard-viewall">
                <button className="link-btn" onClick={viewAllFiles}>
                  View all files ({projectFiles.length})
                  <Icon name="arrow_forward" size={14} />
                </button>
              </div>
            )}
          </section>
        );
      })()}
    </div>
  );
}

// =====================================================
// CODY AVATAR — high-fidelity animated mascot
// Renders the same 3D-rendered CODY video used in the greet card, with
// the reference-sheet PNG as the poster/fallback for the first frame
// (and any browser that blocks autoplay). The `mood` prop is left as a
// soft interface hook — right now every mood uses the same clip, so
// future mood-specific variants can slot in per-key without touching
// call sites.
// =====================================================
function CodyAvatar({ size = 140, mood = "idle", label = "Cody the AI assistant" }) {
  // Same asset for all moods for now — swap here when per-mood clips
  // are produced (e.g. cody-thinking.mp4, cody-happy.mp4).
  const src = "animated/cody-greet.mp4";
  const poster = "design-system/cody.png";
  return (
    <div className="cody-avatar" role="img" aria-label={label} style={{ width: size, height: size }} data-mood={mood}>
      <video
        className="cody-avatar-video"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
    </div>
  );
}

// =====================================================
// AI ASSISTANT — Docked right rail (collapsible)
// =====================================================
function AIAssistant({ open, onClose, onOpen, context, projects, pendingAction, onOpenProject, onOpenProjectTabInNewTab, onStartSkillRun, onConfigureBid, onConfigureRom }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [working, setWorking] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  // Guided-flow state machine — { id, step, projectId?, projectPickerPage?, projectName? }
  const [flow, setFlow] = useState(null);
  // Panel tab — Cody (the conversational assistant) or Clipboard (a
  // context-aware tray of shortcuts + sections). Default flips by
  // screen: Home leads with Cody (the user usually starts the day with
  // a broad question), every other screen leads with Clipboard (which
  // surfaces situational context for that view). Manual switches stick
  // until the user navigates to a different screen.
  const defaultTabForScreen = (s) => s === "home" ? "cody" : "clipboard";
  const [panelTab, setPanelTab] = useState(() => defaultTabForScreen(context?.screen));
  useEffect(() => {
    setPanelTab(defaultTabForScreen(context?.screen));
  }, [context?.screen]);
  const dragCounter = useRef(0);
  const bodyRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, working, open]);

  // Resize handle — drag the left edge of the panel to set --col-ai-open
  useEffect(() => {
    const handle = resizeRef.current;
    if (!handle) return;
    let startX = 0, startWidth = 0;
    const app = document.querySelector(".app");
    if (!app) return;
    const onMove = (e) => {
      const dx = startX - e.clientX;
      const newWidth = Math.max(320, Math.min(window.innerWidth * 0.6, startWidth + dx));
      app.style.setProperty("--col-ai-open", newWidth + "px");
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      handle.classList.remove("dragging");
    };
    const onDown = (e) => {
      e.preventDefault();
      startX = e.clientX;
      const computed = getComputedStyle(app).getPropertyValue("--col-ai-open").trim();
      startWidth = parseInt(computed, 10) || 400;
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      handle.classList.add("dragging");
    };
    handle.addEventListener("pointerdown", onDown);
    return () => handle.removeEventListener("pointerdown", onDown);
  }, [open]);

  const screenLabel = useMemo(() => {
    const s = context?.screen;
    const tab = context?.ctx?.tab;
    if (s === "project" || s === "skill-run") {
      const tabMap = {
        overview: "this project", estimation: "the estimate", rfc: "clarifications",
        bid: "bid leveling", files: "the files", skills: "skill runs",
        schedule: "the schedule", reports: "project reports"
      };
      return tabMap[tab] || "this project";
    }
    const map = {
      home: "your projects list", projects: "your projects",
      reports: "reports", labor: "labor rates", settings: "settings"
    };
    return map[s] || "this screen";
  }, [context?.screen, context?.ctx?.tab]);

  const suggestedQuestions = useMemo(() => {
    const s = context?.screen;
    const tab = context?.ctx?.tab;
    if (s === "project" || s === "skill-run") {
      if (tab === "estimation") return ["Why did Division 09 jump 22%?", "Compare v3 to v2 line by line.", "Show low-confidence line items.", "Draft a value-engineering memo."];
      if (tab === "rfc") return ["Draft the 3 critical RFIs.", "Group clarifications by responsible party.", "Which clarifications block the next deadline?", "Email the architect a status update."];
      if (tab === "bid") return ["Summarize active bids.", "Flag bids missing scope items.", "Recommend a winning sub for Division 09.", "Export bid leveling to Excel."];
      if (tab === "files") return ["Re-categorize anything I got wrong.", "Find drawings I haven't indexed yet.", "Summarize the latest spec addendum.", "Diff this drawing set vs. the prior issue."];
      if (tab === "skills" || tab === "schedule") return ["Run Estimation v4 on the new sheets.", "What's the fastest skill to run right now?", "Schedule a nightly RFC sweep."];
      if (tab === "reports") return ["Draft a weekly status report for this project.", "Pull the cost trend chart since kickoff."];
      return ["Walk me through what changed since yesterday.", "What are the biggest risks on this project?", "Summarize this project for a kickoff call.", "Open the most recent estimate."];
    }
    if (s === "home") return ["Catch me up to date on any changes since my last visit.", "What are the biggest risks on my projects?", "What projects did we bid this week?"];
    if (s === "projects") return ["Find projects with open critical RFCs.", "Show projects waiting on me.", "Which projects are over budget?", "Group projects by stage."];
    if (s === "skills") return ["Which skill should I run next?", "What did the last estimation flag?", "Show me runs that need review."];
    if (s === "reports") return ["Draft a weekly client report.", "Compare this week vs. last.", "Pull a cost trend across all projects."];
    if (s === "labor") return ["Recalculate burdened rates with the new update.", "Flag rates that look off-market.", "Compare our rates to regional benchmarks."];
    if (s === "settings") return ["Walk me through team permissions.", "Help me connect a new data source."];
    return ["Summarize active bids.", "Show any budget risks.", "What projects need attention?"];
  }, [context?.screen, context?.ctx?.tab]);

  const send = (text) => {
    const t = text || input.trim();
    if (!t) return;
    setMessages(m => [...m, { role: "user", text: t }]);
    setInput("");
    setWorking(true);
    setTimeout(() => {
      setWorking(false);
      setMessages(m => [...m, makeAIReply(t, context)]);
    }, 1400);
  };

  const resetChat = () => { setMessages([]); setInput(""); setWorking(false); setFlow(null); };

  // ---- GUIDED FLOWS (Create project / Add files / Get ROM estimate) ----
  // Helpers push specialized AI messages with embedded interactive UI
  // (project picker, dropzone, success link). The reducer-style handlers
  // below advance the flow based on user input.
  const pushAI = (msg) => setMessages(m => [...m, { role: "ai", ...msg }]);
  const pushUser = (text) => setMessages(m => [...m, { role: "user", text }]);

  const projectPickerStep = (introText, page = 0) => {
    // 4 projects per page, ordered most-recent-edit first
    const sorted = [...(projects || [])].filter(p => !p.archived);
    const pageStart = page * 4;
    const pageEnd = pageStart + 4;
    const slice = sorted.slice(pageStart, pageEnd);
    const hasMore = sorted.length > pageEnd;
    pushAI({
      text: introText,
      picker: {
        projects: slice,
        page,
        hasMore,
        allowTypeAhead: true,
      }
    });
  };

  const startCreateProjectFlow = () => {
    resetChat();
    setFlow({ id: "create-project", step: "drop" });
    setTimeout(() => {
      pushAI({
        text: "Great. Let's set up a new project. Drag and drop your project files (plans, specs, owner narratives) anywhere into this panel and I'll get started.",
        dropzone: { instruction: "Drop your project files here", kind: "create" }
      });
    }, 200);
  };

  const startAddFilesFlow = () => {
    resetChat();
    setFlow({ id: "add-files", step: "pick-project", pickerPage: 0 });
    setTimeout(() => {
      projectPickerStep("Sure, which project would you like to add files to?", 0);
    }, 200);
  };

  const startRomEstimateFlow = () => {
    resetChat();
    setFlow({ id: "rom-estimate", step: "existing-or-new" });
    setTimeout(() => {
      pushAI({
        text: "Happy to run a ROM estimate. Is this for an existing project, or do you want to set up a new one?",
        choice: {
          options: [
            { label: "Existing project", value: "existing", icon: "folder_open" },
            { label: "New project", value: "new", icon: "add" },
          ]
        }
      });
    }, 200);
  };

  // React to pendingAction tokens from the App (greet pills / prompt bar)
  useEffect(() => {
    if (!pendingAction || !pendingAction.token) return;
    if (pendingAction.id === "free-text" && pendingAction.payload) {
      send(pendingAction.payload);
    } else if (pendingAction.id === "create-project") {
      startCreateProjectFlow();
    } else if (pendingAction.id === "add-files") {
      startAddFilesFlow();
    } else if (pendingAction.id === "rom-estimate") {
      startRomEstimateFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction && pendingAction.token]);

  // ---- USER ACTIONS within an active flow ----
  const onPickProject = (proj) => {
    if (!flow) return;
    pushUser(proj.name);
    if (flow.id === "add-files") {
      setFlow({ ...flow, step: "drop", projectId: proj.id });
      setTimeout(() => {
        pushAI({
          text: `Perfect. I'll add files to ${proj.name}. Drag and drop them anywhere into this panel.`,
          dropzone: { instruction: "Drop your files here", kind: "add-files", projectId: proj.id, projectName: proj.name }
        });
      }, 600);
    } else if (flow.id === "rom-estimate") {
      setFlow({ ...flow, step: "rom-new-files", projectId: proj.id });
      setTimeout(() => {
        pushAI({
          text: `Got it. Running ROM on ${proj.name}. Do you have any new files you'd like to add before I run the estimate?`,
          dropzone: { instruction: "Drop new files here", kind: "rom-files", projectId: proj.id, projectName: proj.name, optional: true }
        });
      }, 600);
    }
  };
  const onPickerMore = (currentPage) => {
    const nextPage = currentPage + 1;
    setFlow(f => f ? { ...f, pickerPage: nextPage } : f);
    setTimeout(() => projectPickerStep("Here are some more. Pick one or type the name.", nextPage), 200);
  };
  const onPickerTypeProject = (name) => {
    if (!name.trim() || !flow) return;
    const fake = { id: "typed-" + Date.now().toString(36), name: name.trim() };
    onPickProject(fake);
  };
  const onChoice = (value) => {
    if (!flow) return;
    if (flow.id === "rom-estimate" && flow.step === "existing-or-new") {
      pushUser(value === "existing" ? "Existing project" : "New project");
      if (value === "existing") {
        setFlow({ ...flow, step: "pick-project", pickerPage: 0 });
        setTimeout(() => projectPickerStep("Which project should I estimate?", 0), 600);
      } else {
        setFlow({ ...flow, step: "drop", subFlow: "new-then-rom" });
        setTimeout(() => {
          pushAI({
            text: "Let's set up the new project first. Drag and drop the project files into this panel.",
            dropzone: { instruction: "Drop your project files here", kind: "create-then-rom" }
          });
        }, 600);
      }
    }
  };
  const onNothingNewToAdd = () => {
    if (!flow) return;
    pushUser("Nothing new to add.");
    const projName = flow.projectName || (projects || []).find(p => p.id === flow.projectId)?.name || "this project";
    setFlow({ ...flow, step: "running-rom" });
    setTimeout(() => {
      pushAI({
        text: `Kicking off the ROM Estimate skill on ${projName}. I'll let you know when it finishes, so you can keep working in the meantime.`,
        successLink: { projectId: flow.projectId, projectName: projName, label: "Open " + projName, kind: "rom-running" }
      });
      // Fire the actual skill run animation
      if (flow.projectId && onStartSkillRun) onStartSkillRun(flow.projectId, "estimation");
      setFlow(null);
    }, 800);
  };
  const onSuccessLinkClick = (link) => {
    if (link.projectId && onOpenProject) {
      onOpenProject(link.projectId);
      onClose && onClose();
    }
  };

  // Drag-and-drop files anywhere in the body. Drag counter handles nested
  // dragenter/dragleave from child elements.
  const onBodyDragEnter = (e) => {
    if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes("Files")) return;
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) setDragOver(true);
  };
  const onBodyDragOver = (e) => {
    if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes("Files")) return;
    e.preventDefault();
  };
  const onBodyDragLeave = () => {
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragOver(false);
  };
  const onBodyDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOver(false);
    const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []);
    if (files.length === 0) return;
    const fileList = files.map(f => f.name).join(", ");
    pushUser(`Uploaded: ${fileList}`);
    setWorking(true);

    // Flow-aware drop handling — the active flow determines the AI response
    const activeFlow = flow;
    setTimeout(() => {
      setWorking(false);
      if (activeFlow && (activeFlow.id === "create-project" || (activeFlow.id === "rom-estimate" && activeFlow.step === "drop"))) {
        // Cody "creates" the project from the dropped files
        const newProjectId = "new-" + Date.now().toString(36);
        const newProjectName = "Crestview Aquatic Center"; // demo placeholder
        if (activeFlow.id === "create-project") {
          pushAI({
            text: `Indexed ${files.length} ${files.length === 1 ? "file" : "files"} and set up your new project. I detected it's a ${files.length > 2 ? "civic recreation" : "commercial"} build. Feel free to adjust the project name and details on Project Home.`,
            successLink: { projectId: "rec-wellness", projectName: newProjectName, label: "Open " + newProjectName, kind: "project-created" }
          });
          setFlow(null);
        } else {
          // rom-estimate path — files dropped during new-project sub-step
          setFlow({ ...activeFlow, step: "rom-new-files", projectId: "rec-wellness", projectName: newProjectName });
          pushAI({
            text: `Indexed ${files.length} ${files.length === 1 ? "file" : "files"} and created ${newProjectName}. Any other files you'd like to add before I run the ROM estimate?`,
            dropzone: { instruction: "Drop additional files here", kind: "rom-files", projectId: "rec-wellness", projectName: newProjectName, optional: true }
          });
        }
      } else if (activeFlow && activeFlow.id === "add-files" && activeFlow.step === "drop") {
        const proj = (projects || []).find(p => p.id === activeFlow.projectId);
        const name = proj ? proj.name : "your project";
        pushAI({
          text: `Done. I added ${files.length} ${files.length === 1 ? "file" : "files"} to ${name} and indexed ${files.length === 1 ? "it" : "them"} so I can reference ${files.length === 1 ? "it" : "them"} in any future skill run.`,
          successLink: { projectId: activeFlow.projectId, projectName: name, label: "Open " + name, kind: "files-added" }
        });
        setFlow(null);
      } else if (activeFlow && activeFlow.id === "rom-estimate" && activeFlow.step === "rom-new-files") {
        const projName = activeFlow.projectName || (projects || []).find(p => p.id === activeFlow.projectId)?.name || "your project";
        pushAI({
          text: `Indexed ${files.length} new ${files.length === 1 ? "file" : "files"}. Kicking off the ROM Estimate on ${projName} now. I'll surface results when it's done.`,
          successLink: { projectId: activeFlow.projectId, projectName: projName, label: "Open " + projName, kind: "rom-running" }
        });
        if (activeFlow.projectId && onStartSkillRun) onStartSkillRun(activeFlow.projectId, "estimation");
        setFlow(null);
      } else {
        // Default behavior — no active flow
        pushAI({
          text: `Got it. I've indexed ${files.length} ${files.length === 1 ? "file" : "files"} (${fileList}). Want me to extract takeoffs, summarize the content, or run a skill against ${files.length === 1 ? "it" : "them"}?`,
          suggest: ["Extract takeoffs", "Summarize the content", "Run a skill on these"],
        });
      }
    }, 1100);
  };

  // Collapsed mode — narrow strip with the mascot
  if (!open) {
    return (
      <div className="ai-rail-collapsed" onClick={onOpen} title="Open Cody, your AI assistant">
        <div className="ai-rail-mascot">
          <img src="design-system/cody.png" alt="Cody" />
          <span className="ai-rail-pulse" />
        </div>
        <div className="ai-rail-label">Ask Cody</div>
      </div>
    );
  }

  const isEmpty = messages.length === 0 && !working;

  return (
    <div className={"ai-panel " + (panelTab === "clipboard" ? "is-clipboard" : "")}>
      <div className="ai-resize-handle" ref={resizeRef} title="Drag to resize" />
      <div className="ai-panel-head ask-cody">
        <div className="ai-panel-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={panelTab === "cody"}
            className={"ai-panel-tab " + (panelTab === "cody" ? "active" : "")}
            onClick={() => setPanelTab("cody")}>
            <CodyMark size={14} />
            <span>Cody</span>
          </button>
          <button
            role="tab"
            aria-selected={panelTab === "clipboard"}
            className={"ai-panel-tab " + (panelTab === "clipboard" ? "active" : "")}
            onClick={() => setPanelTab("clipboard")}>
            <Icon name="content_paste" size={14} />
            <span>Clipboard</span>
          </button>
        </div>
        <button className="icon-btn" onClick={onClose} title="Close"><Icon name="close" size={18} /></button>
      </div>

      {panelTab === "cody" && <>
      <div className="ai-panel-body" ref={bodyRef}
           onDragEnter={onBodyDragEnter}
           onDragOver={onBodyDragOver}
           onDragLeave={onBodyDragLeave}
           onDrop={onBodyDrop}>
        {isEmpty && (
          <>
            <div className="ai-greeting-hero">
              <CodyAvatar size={140} mood="idle" />
              <div className="ai-greeting-hero-text">
                <div className="ai-greeting-hero-name">Hi, I'm Cody.</div>
                <p>If you have a task for me or anything that you'd like for me to take a look at, just shoot me a question or drag and drop your file to start!</p>
              </div>
            </div>
            <div className="ai-drop-hint">
              <Icon name="cloud_upload" size={14} />
              <span>Drop plans, specs, or images anywhere in this panel to upload.</span>
            </div>
          </>
        )}
        {dragOver && (
          <div className="ai-drop-overlay">
            <Icon name="cloud_upload" size={44} />
            <div className="ai-drop-overlay-title">Drop to upload</div>
            <div className="ai-drop-overlay-sub">Cody will index and analyze your files</div>
          </div>
        )}
        {messages.map((m, i) => (
          m.role === "user"
            ? <div key={i} className="chat-msg user"><div className="user-bubble">{m.text}</div></div>
            : <AIResponse
                key={i}
                message={m}
                onSendSuggest={send}
                onPickProject={onPickProject}
                onPickerMore={onPickerMore}
                onPickerTypeProject={onPickerTypeProject}
                onChoice={onChoice}
                onNothingNewToAdd={onNothingNewToAdd}
                onSuccessLinkClick={onSuccessLinkClick}
              />
        ))}
        {working && (
          <div className="chat-msg ai">
            <CodyMark size={16} className="ai-resp-sparkle" />
            <div className="working"><span className="dot" />Working.</div>
          </div>
        )}
      </div>

      {isEmpty && (
        <div className="ai-suggested-questions">
          <div className="ai-suggested-label">Easy Convo Starters</div>
          <div className="ai-suggested-chips">
            {suggestedQuestions.map((q, i) => (
              <button key={i} className="ai-suggested-chip" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-panel-input">
        <div className="ai-input-wrap">
          <textarea
            placeholder="Ask something"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="send" disabled={!input.trim()} onClick={() => send()}>
            <Icon name="arrow_forward" size={16} />
          </button>
        </div>
      </div>
      </>}

      {panelTab === "clipboard" && (
        <Clipboard
          context={context}
          onOpenProject={onOpenProject}
          onOpenProjectTabInNewTab={onOpenProjectTabInNewTab}
          onConfigureBid={onConfigureBid}
          onConfigureRom={onConfigureRom}
        />
      )}
    </div>
  );
}

function AIResponse({ message, onSendSuggest, onPickProject, onPickerMore, onPickerTypeProject, onChoice, onNothingNewToAdd, onSuccessLinkClick }) {
  const [typeAheadValue, setTypeAheadValue] = useState("");
  return (
    <div className="chat-msg ai">
      <Sparkle size={11} className="ai-resp-sparkle" />
      <div className="ai-resp-content">
        {message.text && <p>{message.text}</p>}

        {/* Choice prompt — radio-style buttons (e.g. "Existing project" / "New project") */}
        {message.choice && message.choice.options && (
          <div className="ai-choice">
            {message.choice.options.map((opt, i) => (
              <button key={i} className="ai-choice-btn" onClick={() => onChoice && onChoice(opt.value)}>
                {opt.icon && <Icon name={opt.icon} size={16} />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Project picker — list of 4 projects with optional "Another project" pager + type-ahead */}
        {message.picker && (
          <div className="ai-picker">
            {message.picker.projects.map((p, i) => (
              <button key={p.id || i} className="ai-picker-row" onClick={() => onPickProject && onPickProject(p)}>
                <Icon name={p.icon || "folder_open"} size={16} className="ai-picker-icon" />
                <div className="ai-picker-meta">
                  <div className="ai-picker-name">{p.name}</div>
                  {p.kind && <div className="ai-picker-sub">{p.kind}</div>}
                </div>
                <Icon name="arrow_forward" size={14} className="ai-picker-go" />
              </button>
            ))}
            {message.picker.hasMore && (
              <button className="ai-picker-more" onClick={() => onPickerMore && onPickerMore(message.picker.page)}>
                <Icon name="more_horiz" size={14} />Another project
              </button>
            )}
            {message.picker.allowTypeAhead && (
              <div className="ai-picker-typeahead">
                <Icon name="search" size={14} />
                <input
                  type="text"
                  placeholder="Or type a project name…"
                  value={typeAheadValue}
                  onChange={(e) => setTypeAheadValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && typeAheadValue.trim()) { onPickerTypeProject && onPickerTypeProject(typeAheadValue); setTypeAheadValue(""); } }}
                />
                <button
                  className="ai-picker-typeahead-go"
                  disabled={!typeAheadValue.trim()}
                  onClick={() => { onPickerTypeProject && onPickerTypeProject(typeAheadValue); setTypeAheadValue(""); }}>
                  Use
                </button>
              </div>
            )}
          </div>
        )}

        {/* Inline dropzone — instructs user to drop files anywhere in the panel */}
        {message.dropzone && (
          <div className="ai-inline-dropzone">
            <Icon name="cloud_upload" size={28} />
            <div className="ai-inline-dropzone-title">{message.dropzone.instruction}</div>
            <div className="ai-inline-dropzone-sub">Drag files anywhere into this panel</div>
            {message.dropzone.optional && (
              <button className="ai-inline-dropzone-skip" onClick={() => onNothingNewToAdd && onNothingNewToAdd()}>
                <Icon name="check" size={14} />Nothing new to add
              </button>
            )}
          </div>
        )}

        {/* Success card — primary CTA links back to the relevant project */}
        {message.successLink && (
          <div className={"ai-success-link " + (message.successLink.kind === "rom-running" ? "running" : "")}>
            <div className="ai-success-icon">
              <Icon name={message.successLink.kind === "rom-running" ? "auto_awesome" : "check_circle"} size={20} />
            </div>
            <div className="ai-success-meta">
              <div className="ai-success-title">{message.successLink.projectName}</div>
              <div className="ai-success-sub">
                {message.successLink.kind === "project-created" && "Project created · ready to explore"}
                {message.successLink.kind === "files-added" && "Files added · indexed and ready"}
                {message.successLink.kind === "rom-running" && "ROM estimate is running"}
              </div>
            </div>
            <button className="ai-success-cta" onClick={() => onSuccessLinkClick && onSuccessLinkClick(message.successLink)}>
              Open<Icon name="arrow_forward" size={14} />
            </button>
          </div>
        )}
        {message.table && (
          <div className="ai-resp-table">
            <div className="ai-resp-table-title">{message.table.title}</div>
            <div className="ai-resp-table-rows">
              {message.table.rows.map((r, i) => (
                <div key={i} className={"ai-resp-trow" + (r.recommended ? " rec" : "")}>
                  <span className="ai-resp-trow-name">{r.name}</span>
                  <span className="ai-resp-trow-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {message.recommended && (
          <div className="ai-resp-recommended">
            <div className="ai-resp-recommended-title">Recommended</div>
            <p>{message.recommended}</p>
          </div>
        )}
        {message.insights && (
          <div className="ai-resp-insights">
            <div className="ai-resp-insights-title">KEY INSIGHTS <Icon name="search" size={14} /></div>
            <ul>
              {message.insights.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        )}
        {message.suggest && (
          <div className="ai-resp-suggest">
            {message.suggest.map((s, i) => (
              <button key={i} className="ai-resp-chip" onClick={() => onSendSuggest(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function makeAIReply(t, context) {
  const lower = t.toLowerCase();
  if (lower.includes("summarize active bids") || (lower.includes("summarize") && lower.includes("bid"))) {
    return {
      role: "ai",
      text: "Here is a summary of your active bids for all detected divisions:",
      table: {
        title: "Division 22 – Plumbing",
        rows: [
          { name: "ThermalTech Solutions", value: "$369,800.00", recommended: true },
          { name: "Ewing Electric Co.", value: "$380,000.00" },
          { name: "Apex Electric Group", value: "$392,000.00" },
          { name: "Summit Mechanical", value: "$412,000.00" },
        ],
      },
      recommended: "ThermalTech Solutions has the strongest scope completeness and solid historical performance on comparable projects. I'd recommend proceeding to award.",
      insights: [
        "Ewing Electric Co. has a $127K scope gap in fixture allowances.",
        "Apex Electric Group is a flagged outlier, 23% above average leveled bid.",
        "ThermalTech Solutions is within 2% of the ROM estimate.",
      ],
      suggest: ["What were the scope gaps?", "How reliable is this?", "What's the ROM for plumbing?"],
    };
  }
  if (lower.includes("estimate") || lower.includes("changed")) {
    return {
      role: "ai",
      text: "Keen eye! The estimate moved from $4.71M to $4.82M, a 2.3% increase. The biggest driver is Division 09 carpet (Shaw Haze), where transportation costs roughly doubled following the recent county code update.",
      suggest: ["Show affected line items", "Cite source documents", "Export to PDF"],
    };
  }
  if (lower.includes("rfc") || lower.includes("clarification")) {
    return {
      role: "ai",
      text: "There are 3 critical clarifications on this project. Top of the stack: missing fire-rating callouts on stair B doors (D-12, D-13, D-14) and conflicting ceiling height between A-101 and A-301 in the Lobby.",
      suggest: ["Draft RFI emails", "Group by responsible party", "Show all clarifications"],
    };
  }
  if (lower.includes("budget") || lower.includes("risk")) {
    return {
      role: "ai",
      text: "Two projects have notable budget risk. Mercy Outpatient Clinic is trending 4% over ROM driven by Division 23 mechanical equipment lead times. Rivergrove Phase II is at risk of schedule slip if the steel package isn't released by Friday.",
      suggest: ["Open Mercy Outpatient", "Show steel package status", "Notify the team"],
    };
  }
  if (lower.includes("attention")) {
    return {
      role: "ai",
      text: "Three projects need your attention: Rec & Wellness has an estimation flag on Division 09. Mercy Outpatient is awaiting your sign-off on the bid leveling. Rivergrove Phase II has 2 critical RFCs blocking the next milestone.",
      suggest: ["Open Rec & Wellness", "Review Mercy bid leveling", "Show the critical RFCs"],
    };
  }
  return {
    role: "ai",
    text: "On it. Cody's pulled the relevant sheets and spec sections for you. Say the word and I can prep a follow-up note for your team.",
    suggest: ["Show the sheets", "Draft the note", "What else can you do?"],
  };
}

// expose globals
Object.assign(window, { Icon, Sparkle, CodyMark, CodyAvatar, PinButton, ContextMenu, ShareDropdown, OverflowMenu, EditModeBar, EditableText, NavRail, ListColumn, Taskbar, AIAssistant, CodyMessage, ProjectActivityPopover, formatMoney, fullMoney, DrawingThumb });
