// BuildCrew.AI — Reports / Labor / Settings
const { useState: uS4, useMemo: uM4 } = React;

function ReportsScreen({ ctx, onAskAI }) {
  const sections = [
    { title: "Executive summary", desc: "Cover page + 1-pager owner brief", from: "Estimation v3" },
    { title: "Cost by division", desc: "Bar chart + table, CSI 50", from: "Estimation v3" },
    { title: "Critical clarifications", desc: "Top 3 issues with sheet refs", from: "RFC sweep" },
    { title: "Awarded subs", desc: "Recommendation memo", from: "Bid leveling" }
  ];
  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Workspace" }, { label: "Reports", bold: true }, { label: "Recreational Wellness: ROM v3" }]}
        actions={<><button className="btn"><Icon name="visibility" size={16}/>Preview</button><button className="btn-primary"><Icon name="picture_as_pdf" size={16}/>Export PDF</button></>}
        onAskAI={onAskAI}
      />
      <div className="canvas">
        {/* Cody's intro — top of screen, dismissible */}
        <CodyMessage
          eyebrow="Cody can help"
          title="Want me to write a cover letter for this report?"
          dismissible={true}
        >
          <p>Tell me the audience and tone, and I'll draft an opener you can edit. I'll cite the same source documents the rest of the report uses.</p>
          <div className="suggest" style={{ marginTop: 8 }}>
            <button className="chip">Owner-facing</button>
            <button className="chip">Internal team</button>
            <button className="chip">Public agency</button>
          </div>
        </CodyMessage>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)", marginBottom: 4 }}>Custom report builder</div>
            <h2 className="page-h1">Recreational Wellness: ROM v3</h2>
            <p className="page-sub">Drag blocks from skill results to assemble a custom report. Cody will keep them in sync if the underlying data changes.</p>

            <div className="card no-pad" style={{ marginTop: 20 }}>
              <div className="card-h"><Icon name="view_list" style={{ color: "var(--orange-500)" }} /><h3>Report sections</h3><div className="right"><button className="btn-ghost"><Icon name="add" size={14}/>Add section</button></div></div>
              <div style={{ padding: 16 }}>
                {sections.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 12px", borderBottom: i < sections.length - 1 ? "1px solid rgba(39,38,53,0.06)" : "none", alignItems: "center" }}>
                    <Icon name="drag_indicator" style={{ color: "rgba(39,38,53,0.30)" }} />
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(232,70,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--orange-500)", fontSize: 13 }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>{s.desc}</div>
                    </div>
                    <span className="badge b-info">{s.from}</span>
                    <button className="icon-btn"><Icon name="more_horiz" size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="section-h" style={{ marginTop: 0 }}><Icon name="article" size={16} style={{ color: "var(--orange-500)" }} /><h3>Preview</h3></div>
            <div className="page-preview" style={{ border: "1px solid rgba(39,38,53,0.10)", borderRadius: 8, padding: "32px 28px", aspectRatio: "8.5/11", display: "flex", flexDirection: "column", gap: 16, fontSize: 11, color: "var(--bc-strong)" }}>
              <div style={{ borderBottom: "2px solid var(--orange-500)", paddingBottom: 12 }}>
                <div style={{ fontFamily: "var(--font-marketing)", color: "var(--orange-500)", fontSize: 22, lineHeight: 1 }}>buildcrew.ai</div>
                <div style={{ fontSize: 10, color: "var(--bc-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 4 }}>Rough Order of Magnitude · v3</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Recreational and Wellness Center</div>
                <div style={{ color: "var(--bc-muted)", fontSize: 10 }}>1208 Riverside Ave, Portland OR · Apr 28, 2026</div>
              </div>
              <div style={{ background: "rgba(232,70,0,0.06)", padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 700 }}>Total project ROM</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>$4,823,640</div>
              </div>
              <div style={{ height: 4, background: "rgba(39,38,53,0.05)", borderRadius: 100 }}><div style={{ width: "59%", height: "100%", background: "var(--orange-500)", borderRadius: 100 }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><span>Materials 59%</span><span>Labor 41%</span></div>
              <div style={{ height: 1, background: "rgba(39,38,53,0.08)" }} />
              <div style={{ fontSize: 10, color: "var(--bc-muted)" }}>Page 1 of 14</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample rates surfaced when the user drops an upload — stands in for
// what parsing a real CSV/XLSX would produce. Same three columns for
// both labor and materials so the table stays consistent (fringe on the
// materials side is interpreted as the tax + delivery + waste markup).
const SAMPLE_LABOR_UPLOAD = [
  { trade: "Project Manager",           rate: 155.00, fringe: 0.42 },
  { trade: "Superintendent",            rate: 128.00, fringe: 0.42 },
  { trade: "Foreman: Carpenter",        rate: 92.00,  fringe: 0.55 },
  { trade: "Carpenter, Journey",        rate: 78.00,  fringe: 0.58 },
  { trade: "Carpenter, Apprentice",     rate: 58.00,  fringe: 0.55 },
  { trade: "Ironworker",                rate: 82.00,  fringe: 0.55 },
  { trade: "Electrician, Journey",      rate: 89.00,  fringe: 0.60 },
  { trade: "Plumber",                   rate: 87.00,  fringe: 0.58 },
  { trade: "Operating Engineer",        rate: 92.00,  fringe: 0.60 },
  { trade: "Laborer",                   rate: 46.00,  fringe: 0.48 },
];
const SAMPLE_MATERIAL_UPLOAD = [
  { trade: "Ready-mix concrete, 4000 PSI",      rate: 195.00,  fringe: 0.08 },
  { trade: "Reinforcing steel, Grade 60",       rate: 0.94,    fringe: 0.10 },
  { trade: "Structural steel, A992 W-shapes",   rate: 2895.00, fringe: 0.12 },
  { trade: "Steel deck, 3\" composite",         rate: 4.20,    fringe: 0.10 },
  { trade: "Gypsum wallboard, 5/8\" type X",    rate: 1.15,    fringe: 0.06 },
  { trade: "Acoustic ceiling tile, 24x24",      rate: 3.25,    fringe: 0.06 },
  { trade: "Broadloom carpet, 32 oz nylon",     rate: 4.90,    fringe: 0.08 },
  { trade: "Storefront glazing, aluminum",      rate: 78.00,   fringe: 0.10 },
  { trade: "Wood door, solid core paint grade", rate: 645.00,  fringe: 0.08 },
];

// Shared body used by both the standalone LaborScreen and the Company >
// Project Rates tab. Users toggle between Labor and Materials; either
// type can be replaced by an uploaded rates document, which fully takes
// over that rate set until removed.
function LaborRatesPanel() {
  const presetLabor = window.BC_DATA.laborRates || [];
  const [activeType, setActiveType] = uS4("labor");
  const [laborUpload, setLaborUpload] = uS4(null);       // null or { fileName, rates }
  const [materialUpload, setMaterialUpload] = uS4(null); // null or { fileName, rates }

  const currentUpload = activeType === "labor" ? laborUpload : materialUpload;
  const currentSetUpload = activeType === "labor" ? setLaborUpload : setMaterialUpload;

  // Prototype stand-in for a real upload flow — clicking the drop zone
  // populates the tab with a sample rate set to demonstrate the takeover
  // behavior. In production this would parse the actual CSV/XLSX.
  const simulateUpload = () => {
    if (activeType === "labor") {
      setLaborUpload({
        fileName: "PDX_metro_labor_rates_2026.xlsx",
        uploadedAt: "Just now",
        rates: SAMPLE_LABOR_UPLOAD,
      });
    } else {
      setMaterialUpload({
        fileName: "PDX_metro_material_costs_2026.xlsx",
        uploadedAt: "Just now",
        rates: SAMPLE_MATERIAL_UPLOAD,
      });
    }
  };
  const removeUpload = () => currentSetUpload(null);

  // Resolve which rate set to render.
  const rows = activeType === "labor"
    ? (laborUpload ? laborUpload.rates : presetLabor)
    : (materialUpload ? materialUpload.rates : []);
  const showEmptyMaterials = activeType === "materials" && !materialUpload;
  const usingUpload = !!currentUpload;

  // Formatting helpers — larger values (material lump sums) use a
  // localized number format for readability.
  const fmtRate = (n) => {
    if (n >= 100) return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return "$" + n.toFixed(2);
  };
  const fmtLoaded = (n) => fmtRate(n);

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h2 className="page-h1">
            {activeType === "labor" ? "Labor rates" : "Material rates"}
          </h2>
          <p className="page-sub">
            {activeType === "labor"
              ? "Trade wage rates + fringe used by every skill run on this company's projects. Upload your own rate sheet to override the defaults."
              : "Unit-cost rates for common materials + delivery/tax markup. Upload a rate sheet to populate this list."}
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

      {/* Upload area — either a drop zone (no file yet) or a compact file
          banner with a delete action once a rate sheet is uploaded. */}
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
            Drop {activeType === "labor" ? "your labor" : "your material"} rate sheet
          </div>
          <div className="rates-drop-sub">
            CSV or XLSX with trade, base rate, and fringe columns. Cody will parse it and{" "}
            {activeType === "labor" ? "replace the defaults below" : "populate the rate list"}.
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
            title={activeType === "labor" ? "Remove file and reset to default trades" : "Remove file and clear the list"}
            onClick={removeUpload}>
            <Icon name="delete_outline" size={14} />Remove file
          </button>
        </div>
      )}

      {showEmptyMaterials ? (
        <div className="rates-empty">
          <Icon name="inventory_2" size={28} />
          <div className="rates-empty-title">No material rates yet</div>
          <div className="rates-empty-sub">Drop a materials rate sheet above and every line item will populate here — base rate, fringe (delivery + tax), and the loaded rate Cody uses in every estimate.</div>
        </div>
      ) : (
        <div className="card no-pad" style={{ marginTop: 16 }}>
          <div className="card-h">
            <Icon name={activeType === "labor" ? "engineering" : "inventory_2"} style={{ color: "var(--orange-500)" }} />
            <h3>{activeType === "labor" ? "Trades & rates" : "Materials & rates"}</h3>
            {usingUpload && <span className="rates-source-pill"><Icon name="cloud_done" size={11} />From upload</span>}
            <div className="right">
              <button className="btn-ghost"><Icon name="add" size={14}/>Add {activeType === "labor" ? "trade" : "material"}</button>
              <button className="btn-ghost"><Icon name="history" size={14}/>History</button>
            </div>
          </div>
          <table className="bc-table">
            <thead><tr>
              <th>{activeType === "labor" ? "Trade" : "Material"}</th>
              <th className="num">Base rate</th>
              <th className="num">Fringe</th>
              <th className="num">Loaded rate</th>
              <th></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><div className="item-title">{r.trade}</div></td>
                  <td className="num"><span className="cell-display editable">{fmtRate(r.rate)}</span></td>
                  <td className="num"><span className="cell-display editable">{(r.fringe * 100).toFixed(0)}%</span></td>
                  <td className="num"><b>{fmtLoaded(r.rate * (1 + r.fringe))}</b></td>
                  <td className="center"><button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more_horiz" size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function LaborScreen({ ctx, onAskAI }) {
  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Workspace" }, { label: "Labor rates" }, { label: "PDX metro", bold: true }]}
        actions={<><button className="btn"><Icon name="upload" size={16}/>Import CSV</button><button className="btn-primary"><Icon name="save" size={16}/>Save changes</button></>}
        onAskAI={onAskAI}
      />
      <div className="canvas">
        <LaborRatesPanel />
      </div>
    </div>
  );
}

// =====================================================
// COMPANY APPROVALS PANEL
// Admin review queue for Push-to-Master submissions. Each row is one
// edit event; admins expand to see the full change list, then Approve
// or Deny with an optional reason. Admins can even approve entries they
// submitted themselves (per the user's decision that admins also go
// through the approval flow as a safety check).
// =====================================================
function CompanyApprovalsPanel({ approvals, members, projects, currentUser, onResolve }) {
  const [statusFilter, setStatusFilter] = uS4("pending");
  const [expandedId, setExpandedId] = uS4(null);
  const [denyForId, setDenyForId] = uS4(null);
  const [denyReason, setDenyReason] = uS4("");
  const nameFor = (userId) => (members.find(m => m.id === userId) || {}).name || userId || "Someone";
  const initialsFor = (userId) => (members.find(m => m.id === userId) || {}).initials || "?";
  const projectNameFor = (projectId) => (projects.find(p => p.id === projectId) || {}).name || projectId;

  const counts = { pending: 0, approved: 0, denied: 0 };
  for (const a of approvals) counts[a.status] = (counts[a.status] || 0) + 1;
  const visible = approvals.filter(a => statusFilter === "all" || a.status === statusFilter);

  const iconForKind = (k) =>
    k === "takeoff"      ? "straighten" :
    k === "skill_run"    ? "auto_awesome" :
    k === "file_upload"  ? "upload_file" :
    k === "labor_rate"   ? "engineering" :
    k === "project_meta" ? "edit" :
    k === "revision"     ? "history" :
    "edit_note";

  const openDeny = (id) => { setDenyForId(id); setDenyReason(""); };
  const submitDeny = () => {
    if (!denyForId) return;
    onResolve && onResolve(denyForId, "denied", denyReason);
    setDenyForId(null);
    setDenyReason("");
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <div className="chip-group">
          <button className={"chip " + (statusFilter === "pending"  ? "active" : "")} onClick={() => setStatusFilter("pending")}>Pending<span className="chip-count">{counts.pending || 0}</span></button>
          <button className={"chip " + (statusFilter === "approved" ? "active" : "")} onClick={() => setStatusFilter("approved")}>Approved<span className="chip-count">{counts.approved || 0}</span></button>
          <button className={"chip " + (statusFilter === "denied"   ? "active" : "")} onClick={() => setStatusFilter("denied")}>Denied<span className="chip-count">{counts.denied || 0}</span></button>
          <button className={"chip " + (statusFilter === "all"      ? "active" : "")} onClick={() => setStatusFilter("all")}>All<span className="chip-count">{approvals.length}</span></button>
        </div>
        <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>
          Nothing hits <b style={{ color: "var(--raisin-800)" }}>Master</b> until you approve it.
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <Icon name="task_alt" size={28} style={{ color: "var(--tiffany-400)" }} />
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginTop: 8 }}>Queue clear</div>
          <div style={{ fontSize: 13, color: "var(--bc-muted)", marginTop: 4 }}>No {statusFilter === "all" ? "" : statusFilter} approval requests right now.</div>
        </div>
      ) : (
        <div className="card no-pad">
          <table className="bc-table">
            <thead>
              <tr>
                <th style={{ width: 30 }}></th>
                <th>Requester</th>
                <th>Project</th>
                <th>Summary</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="center" style={{ width: 210 }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(a => {
                const open = expandedId === a.id;
                const isSelfSubmitted = a.__submittedByCurrentUser || (currentUser && a.requestedBy === currentUser.id);
                return (
                  <React.Fragment key={a.id}>
                    <tr className="company-approval-row" style={{ cursor: "pointer" }} onClick={() => setExpandedId(open ? null : a.id)}>
                      <td className="center"><Icon name={open ? "expand_more" : "chevron_right"} size={16} style={{ color: "var(--bc-muted)" }} /></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="company-member-avatar">{initialsFor(a.requestedBy)}</div>
                          <div>
                            <div className="item-title">{a.requestedByName || nameFor(a.requestedBy)}</div>
                            {isSelfSubmitted && <div style={{ fontSize: 10.5, color: "var(--orange-500)", fontWeight: 700, marginTop: 1 }}>YOUR SUBMISSION</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12.5 }}>
                          <Icon name="folder_open" size={13} style={{ color: "var(--orange-500)" }} />
                          {projectNameFor(a.projectId)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, color: "var(--raisin-800)" }}>{a.summary}</div>
                        <div style={{ fontSize: 11, color: "var(--bc-muted)", marginTop: 2 }}>{(a.changes || []).length} change{(a.changes || []).length === 1 ? "" : "s"}</div>
                      </td>
                      <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{a.requestedAt}</span></td>
                      <td>
                        {a.status === "pending"  && <span className="badge b-warn" style={{ fontSize: 9 }}><Icon name="pending" size={10} />Pending</span>}
                        {a.status === "approved" && <span className="badge b-done" style={{ fontSize: 9 }}><Icon name="check" size={10} />Approved</span>}
                        {a.status === "denied"   && <span className="badge" style={{ fontSize: 9, background: "rgba(181, 54, 54, 0.10)", color: "#B53636" }}><Icon name="block" size={10} />Denied</span>}
                      </td>
                      <td className="center">
                        {a.status === "pending" ? (
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
                            <button className="btn" onClick={() => openDeny(a.id)}>
                              <Icon name="close" size={12} />Deny
                            </button>
                            <button className="btn-primary" onClick={() => onResolve && onResolve(a.id, "approved")}>
                              <Icon name="check" size={12} />Approve
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--bc-muted)" }}>
                            {a.status === "approved" ? "Approved" : "Denied"} by {nameFor(a.resolvedBy)}
                          </span>
                        )}
                      </td>
                    </tr>
                    {open && (
                      <tr className="company-approval-detail-row">
                        <td></td>
                        <td colSpan={6}>
                          <div className="company-approval-detail">
                            <div className="company-detail-label">Changes bundled in this edit event</div>
                            <ul className="company-approval-changes">
                              {(a.changes || []).map((c, i) => (
                                <li key={i}>
                                  <Icon name={iconForKind(c.kind)} size={14} />
                                  <span>{c.label}</span>
                                </li>
                              ))}
                            </ul>
                            {a.status === "denied" && a.denyReason && (
                              <div style={{ marginTop: 12, padding: 10, background: "rgba(181, 54, 54, 0.06)", borderLeft: "3px solid #B53636", borderRadius: 6 }}>
                                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#B53636", marginBottom: 4 }}>Denied — reason</div>
                                <div style={{ fontSize: 12.5, color: "var(--raisin-800)" }}>{a.denyReason}</div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Deny reason modal */}
      {denyForId && (
        <div className="modal-backdrop" onClick={() => setDenyForId(null)}>
          <div className="modal-shell" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <div>
                <div className="modal-eyebrow" style={{ color: "#B53636" }}><Icon name="block" size={12} style={{ marginRight: 8, verticalAlign: "-2px" }} />Deny submission</div>
                <h2>Send this back to the requester?</h2>
                <p>Tell them what's blocking the push. They'll see this reason on their edit event so they can address it.</p>
              </div>
              <button className="modal-close" onClick={() => setDenyForId(null)}><Icon name="close" size={18} /></button>
            </div>
            <div style={{ padding: "16px 28px" }}>
              <div className="field">
                <label>Reason for denial</label>
                <textarea
                  autoFocus
                  rows={4}
                  placeholder="e.g. Rate change needs backup from published wage tables."
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div className="push-modal-foot" style={{ background: "#fff" }}>
              <div />
              <div className="push-modal-foot-actions">
                <button className="btn" onClick={() => setDenyForId(null)}>Cancel</button>
                <button className="btn-primary" style={{ background: "#B53636", borderColor: "#B53636" }} onClick={submitDeny}>
                  <Icon name="block" size={14} />Deny submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// COMPANY SCREEN — company-wide workspace view
// Tabs: Projects · Members · Project Rates · Analytics · Settings
// Settings tab is admin-only. Current user role is read from
// BC_DATA.user.role so switching that value flips the visible tabs.
// =====================================================
function CompanyScreen({ ctx, onAskAI, onOpenProject, projects, approvals, onResolveApproval }) {
  const user = (window.BC_DATA && window.BC_DATA.user) || {};
  const company = (window.BC_DATA && window.BC_DATA.company) || { name: user.company || "Company", plan: "—", seats: { used: 0, total: 0 } };
  const members = (window.BC_DATA && window.BC_DATA.companyMembers) || [];
  const runs = (window.BC_DATA && window.BC_DATA.runs) || [];
  const isAdmin = user.role === "admin";
  const projs = projects || (window.BC_DATA && window.BC_DATA.projects) || [];
  const allApprovals = approvals || (window.BC_DATA && window.BC_DATA.pendingApprovals) || [];
  const pendingApprovalCount = allApprovals.filter(a => a.status === "pending").length;

  const tabs = [
    { id: "projects",  label: "Projects",     icon: "folder_open" },
    { id: "members",   label: "Members",      icon: "group" },
    ...(isAdmin ? [{ id: "approvals", label: "Approvals",    icon: "rule_folder" }] : []),
    { id: "rates",     label: "Project Rates", icon: "engineering" },
    { id: "analytics", label: "Analytics",    icon: "insights" },
    ...(isAdmin ? [{ id: "settings", label: "Settings", icon: "settings" }] : []),
  ];
  const [tab, setTab] = uS4((ctx && ctx.tab) || "projects");

  // First-visit walkthrough — fires once per user (localStorage-gated).
  const COMPANY_TOUR_STEPS = [
    { id: "header", selector: "[data-tour-id=\"company-header\"]", placement: "below",
      title: "Your company workspace",
      desc: "This is your Acme Builders workspace. Everything at the company level lives here — every project, every team member, and the standards they all share." },
    { id: "tabs", selector: "[data-tour-id=\"company-tabs\"]", placement: "below",
      title: "Six views into your company",
      desc: "Projects shows every job across the whole team, Members is your roster, Approvals is where admins review Push-to-Master requests, Project Rates holds your labor + material rate sheets, Analytics rolls up KPIs across all projects, and Settings covers company-wide config." },
    { id: "invite", selector: "[data-tour-id=\"company-invite\"]", placement: "below",
      title: "Invite the team",
      desc: "Growing the team is one click. Invite by email and pick their role — Admin, Collaborator, or Viewer — right in the invitation." },
    ...(isAdmin ? [{ id: "approvals", selector: "[data-tour-tab=\"approvals\"]", placement: "below",
      title: "The Approvals queue",
      desc: "This is where you'll spend time keeping the Master version stable. Every teammate's Push-to-Master lands here for review before it hits any project's canonical version.",
      isFinal: true, finalLabel: "Got it", finalIcon: "check" }] : [
        { id: "done-nonadmin", selector: "[data-tour-id=\"company-tabs\"]", placement: "below",
          title: "You're set",
          desc: "Head into any tab to start exploring your company workspace.",
          isFinal: true, finalLabel: "Got it", finalIcon: "check" }
      ]),
  ];
  const [companyTourActive, completeCompanyTour] = window.useFirstVisitTour
    ? window.useFirstVisitTour("bc_tour_seen_company", !!(window.isFreshDemoMode && window.isFreshDemoMode()))
    : [false, () => {}];

  // ---- Members tab state ----
  const [memberQuery, setMemberQuery] = uS4("");
  const [memberRoleFilter, setMemberRoleFilter] = uS4("all");
  const [expandedMember, setExpandedMember] = uS4(null);
  const toggleMember = (id) => setExpandedMember(prev => prev === id ? null : id);

  const roleBadge = (role) => (
    <span className={"company-role-pill company-role-" + role}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
  );
  const projectNameFor = (id) => (projs.find(p => p.id === id) || {}).name || id;

  const visibleMembers = uM4(() => {
    const q = memberQuery.trim().toLowerCase();
    return members.filter(m => {
      if (memberRoleFilter !== "all" && m.role !== memberRoleFilter) return false;
      if (q) {
        const blob = `${m.name} ${m.email} ${m.title || ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [members, memberQuery, memberRoleFilter]);

  const roleCounts = uM4(() => {
    const c = { admin: 0, collaborator: 0, viewer: 0 };
    for (const m of members) c[m.role] = (c[m.role] || 0) + 1;
    return c;
  }, [members]);

  // ---- Analytics tab metrics ----
  const analytics = uM4(() => {
    const totalProjects = projs.length;
    const activeProjects = projs.filter(p => p.status !== "archived").length;
    const totalRuns = runs.length;
    const doneRuns = runs.filter(r => r.status === "done");
    const avgConfidence = doneRuns.length
      ? doneRuns.reduce((s, r) => s + ((r.ai && r.ai.confidence) || 0), 0) / doneRuns.filter(r => r.ai && r.ai.confidence).length || 0
      : 0;
    const bySkill = {};
    for (const r of runs) bySkill[r.skill] = (bySkill[r.skill] || 0) + 1;
    const skillEntries = Object.entries(bySkill).sort((a, b) => b[1] - a[1]);
    const totalSavings = runs.reduce((sum, r) => {
      const s = r.ai && r.ai.savings;
      if (!s || typeof s !== "string") return sum;
      const num = parseFloat(s.replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return sum;
      return sum + (s.toLowerCase().includes("k") ? num * 1000 : num);
    }, 0);
    return { totalProjects, activeProjects, totalRuns, avgConfidence, skillEntries, totalSavings };
  }, [projs, runs]);

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Workspace" }, { label: "Company", bold: true }, { label: (tabs.find(t => t.id === tab) || tabs[0]).label }]}
        onAskAI={onAskAI}
      />
      <div className="canvas">
        {/* Company header */}
        <div className="company-header" data-tour-id="company-header">
          <div className="company-avatar">
            <Icon name="domain" size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="company-eyebrow">Company workspace</div>
            <h1 className="page-h1" style={{ marginBottom: 4 }}>{company.name}</h1>
            <div className="company-meta">
              <span><Icon name="badge" size={12} />{company.plan} plan</span>
              <span><Icon name="group" size={12} />{company.seats.used} of {company.seats.total} seats</span>
              <span><Icon name="place" size={12} />{company.address}</span>
            </div>
          </div>
          <div className="company-header-actions">
            <button className="btn" data-tour-id="company-invite"><Icon name="mail" size={14} />Invite member</button>
          </div>
        </div>

        {/* Tab strip */}
        <div className="report-tabs" style={{ marginTop: 24 }} data-tour-id="company-tabs">
          {tabs.map(t => (
            <button key={t.id}
                    data-tour-tab={t.id}
                    className={"report-tab " + (tab === t.id ? "active" : "")}
                    onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={14} />{t.label}
              {t.id === "projects"  && <span className="report-tab-count">{projs.length}</span>}
              {t.id === "members"   && <span className="report-tab-count">{members.length}</span>}
              {t.id === "approvals" && pendingApprovalCount > 0 && <span className="report-tab-count report-tab-count-attn">{pendingApprovalCount}</span>}
            </button>
          ))}
        </div>

        {/* ================== PROJECTS TAB ================== */}
        {tab === "projects" && (
          <div style={{ marginTop: 20 }}>
            <div className="card no-pad">
              <div className="card-h">
                <Icon name="folder_open" style={{ color: "var(--orange-500)" }} />
                <h3>{projs.length} projects</h3>
              </div>
              <table className="bc-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Phase</th>
                    <th>Estimate</th>
                    <th className="num">Members</th>
                    <th>Status</th>
                    <th className="center" style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {projs.map(p => {
                    const memberCount = members.filter(m => (m.projects || []).some(pp => pp.projectId === p.id)).length;
                    return (
                      <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => onOpenProject && onOpenProject(p.id)}>
                        <td>
                          <div className="item-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Icon name={p.icon || "folder_open"} size={16} style={{ color: "var(--orange-500)", opacity: 0.85 }} />
                            {p.name}
                          </div>
                        </td>
                        <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{p.phase || "—"}</span></td>
                        <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12 }}>{p.estimate || "—"}</span></td>
                        <td className="num"><b>{memberCount}</b></td>
                        <td>
                          {p.status === "working" && <span className="badge b-working"><span className="dot" />Running</span>}
                          {p.status === "done" && <span className="badge b-done">Ready</span>}
                          {(!p.status || (p.status !== "working" && p.status !== "done")) && <span className="badge">{p.status || "Active"}</span>}
                        </td>
                        <td className="center">
                          <button className="btn-ghost" style={{ padding: "4px 8px" }} onClick={(e) => { e.stopPropagation(); onOpenProject && onOpenProject(p.id); }}>
                            <Icon name="open_in_new" size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================== MEMBERS TAB ================== */}
        {tab === "members" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
              <div className="chip-group">
                <button className={"chip " + (memberRoleFilter === "all" ? "active" : "")} onClick={() => setMemberRoleFilter("all")}>All<span className="chip-count">{members.length}</span></button>
                <button className={"chip " + (memberRoleFilter === "admin" ? "active" : "")} onClick={() => setMemberRoleFilter("admin")}>Admins<span className="chip-count">{roleCounts.admin || 0}</span></button>
                <button className={"chip " + (memberRoleFilter === "collaborator" ? "active" : "")} onClick={() => setMemberRoleFilter("collaborator")}>Collaborators<span className="chip-count">{roleCounts.collaborator || 0}</span></button>
                <button className={"chip " + (memberRoleFilter === "viewer" ? "active" : "")} onClick={() => setMemberRoleFilter("viewer")}>Viewers<span className="chip-count">{roleCounts.viewer || 0}</span></button>
              </div>
              <div className="takeoff-search">
                <Icon name="search" size={14} />
                <input type="text" placeholder="Search members by name, email, or title…" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} />
              </div>
            </div>

            <div className="card no-pad">
              <table className="bc-table">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}></th>
                    <th>Member</th>
                    <th>Company role</th>
                    <th>Date added</th>
                    <th className="num">Projects</th>
                    <th className="center" style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map(m => {
                    const open = expandedMember === m.id;
                    return (
                      <React.Fragment key={m.id}>
                        <tr className="company-member-row" style={{ cursor: "pointer" }} onClick={() => toggleMember(m.id)}>
                          <td className="center"><Icon name={open ? "expand_more" : "chevron_right"} size={16} style={{ color: "var(--bc-muted)" }} /></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <div className="company-member-avatar">{m.initials}</div>
                              <div style={{ minWidth: 0 }}>
                                <div className="item-title">{m.name}</div>
                                <div style={{ fontSize: 11.5, color: "var(--bc-muted)", marginTop: 1 }}>
                                  {m.email}{m.title ? <> · {m.title}</> : null}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{roleBadge(m.role)}</td>
                          <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{m.dateAdded}</span></td>
                          <td className="num"><b>{(m.projects || []).length}</b></td>
                          <td className="center">
                            <button className="btn-ghost" style={{ padding: "4px 6px" }} onClick={(e) => e.stopPropagation()}>
                              <Icon name="more_vert" size={16} />
                            </button>
                          </td>
                        </tr>
                        {open && (
                          <tr className="company-member-detail-row">
                            <td></td>
                            <td colSpan={5}>
                              <div className="company-member-detail">
                                <div className="company-detail-label">Project access ({(m.projects || []).length})</div>
                                {(m.projects || []).length === 0 ? (
                                  <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>Not invited to any projects yet.</div>
                                ) : (
                                  <div className="company-project-grid">
                                    {m.projects.map(pp => (
                                      <div key={pp.projectId} className="company-project-chip">
                                        <Icon name="folder_open" size={13} style={{ color: "var(--orange-500)" }} />
                                        <span className="company-project-chip-name">{projectNameFor(pp.projectId)}</span>
                                        {roleBadge(pp.role)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {visibleMembers.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--bc-muted)" }}>No members match this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================== APPROVALS TAB (admins only) ================== */}
        {tab === "approvals" && isAdmin && (
          <CompanyApprovalsPanel
            approvals={allApprovals}
            members={members}
            projects={projs}
            currentUser={user}
            onResolve={onResolveApproval}
          />
        )}

        {/* ================== PROJECT RATES TAB ================== */}
        {tab === "rates" && (
          <div style={{ marginTop: 20 }}>
            <LaborRatesPanel />
          </div>
        )}

        {/* ================== ANALYTICS TAB ================== */}
        {tab === "analytics" && (
          <div style={{ marginTop: 20 }}>
            <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
              <div className="kpi">
                <Icon className="bg" name="folder_open" />
                <div className="label">Total projects</div>
                <div className="value">{analytics.totalProjects}</div>
                <div className="delta" style={{ color: "var(--bc-muted)" }}>{analytics.activeProjects} active</div>
              </div>
              <div className="kpi kpi-accent" style={{ "--kpi-accent": "#5047F3" }}>
                <Icon className="bg" name="auto_awesome" />
                <div className="label">Skill runs (all-time)</div>
                <div className="value">{analytics.totalRuns}</div>
                <div className="delta" style={{ color: "var(--bc-muted)" }}>Across every project</div>
              </div>
              <div className="kpi">
                <Icon className="bg" name="verified" />
                <div className="label">Avg AI confidence</div>
                <div className="value">{Math.round((analytics.avgConfidence || 0) * 100)}%</div>
                <div className="delta" style={{ color: "var(--bc-muted)" }}>Completed runs only</div>
              </div>
              <div className="kpi kpi-accent" style={{ "--kpi-accent": "#E84600" }}>
                <Icon className="bg" name="savings" />
                <div className="label">Total bid savings surfaced</div>
                <div className="value">${(analytics.totalSavings / 1000).toFixed(0)}k</div>
                <div className="delta" style={{ color: "var(--bc-muted)" }}>Bid Level Analysis skill</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
              <div className="card no-pad">
                <div className="card-h">
                  <Icon name="bar_chart" style={{ color: "var(--orange-500)" }} />
                  <h3>Skill usage</h3>
                </div>
                <div style={{ padding: 16 }}>
                  {analytics.skillEntries.length === 0 ? (
                    <div style={{ color: "var(--bc-muted)", fontSize: 13 }}>No skill runs yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {analytics.skillEntries.map(([name, count]) => {
                        const pct = Math.round((count / analytics.totalRuns) * 100);
                        return (
                          <div key={name} className="company-analytics-bar">
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, color: "var(--raisin-800)" }}>{name}</span>
                              <span style={{ color: "var(--bc-muted)" }}><b style={{ color: "var(--raisin-800)" }}>{count}</b> · {pct}%</span>
                            </div>
                            <div className="company-analytics-bar-track">
                              <div className="company-analytics-bar-fill" style={{ width: pct + "%" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="card no-pad">
                <div className="card-h">
                  <Icon name="group" style={{ color: "var(--orange-500)" }} />
                  <h3>Team composition</h3>
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { key: "admin",        label: "Admins",         value: roleCounts.admin || 0,        color: "#E84600" },
                    { key: "collaborator", label: "Collaborators",  value: roleCounts.collaborator || 0, color: "#5047F3" },
                    { key: "viewer",       label: "Viewers",        value: roleCounts.viewer || 0,       color: "#48C1B5" },
                  ].map(r => {
                    const pct = members.length ? Math.round((r.value / members.length) * 100) : 0;
                    return (
                      <div key={r.key}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: "var(--raisin-800)" }}>{r.label}</span>
                          <span style={{ color: "var(--bc-muted)" }}><b style={{ color: "var(--raisin-800)" }}>{r.value}</b> · {pct}%</span>
                        </div>
                        <div className="company-analytics-bar-track">
                          <div className="company-analytics-bar-fill" style={{ width: pct + "%", background: r.color }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 4, fontSize: 12, color: "var(--bc-muted)", borderTop: "1px solid rgba(15,18,32,0.08)", paddingTop: 10 }}>
                    <b style={{ color: "var(--raisin-800)" }}>{members.length}</b> total members · {company.seats.total - members.length} open seats
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================== SETTINGS TAB (admin only) ================== */}
        {tab === "settings" && isAdmin && (
          <div style={{ marginTop: 20, maxWidth: 720 }}>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Company profile</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field"><label>Company name</label><input defaultValue={company.name} /></div>
                <div className="field"><label>Founded</label><input defaultValue={company.founded} /></div>
                <div className="field" style={{ gridColumn: "1 / -1" }}><label>Address</label><input defaultValue={company.address} /></div>
                <div className="field" style={{ gridColumn: "1 / -1" }}><label>Website</label><input defaultValue={company.website} /></div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Permission defaults</div>
              <div style={{ fontSize: 12.5, color: "var(--bc-muted)", marginBottom: 16 }}>Choose which role newly-invited members receive by default. You can always change this per-invite.</div>
              <div className="field"><label>Default role for new invites</label>
                <select defaultValue={company.defaultRole}>
                  <option value="collaborator">Collaborator (can edit assigned projects)</option>
                  <option value="viewer">Viewer (read-only on assigned projects)</option>
                  <option value="admin">Admin (company-wide changes)</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(15,18,32,0.06)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Allow guest access</div>
                  <div style={{ fontSize: 12, color: "var(--bc-muted)", marginTop: 2 }}>Let external clients view specific projects without a paid seat.</div>
                </div>
                <div className={"toggle " + (company.allowGuests ? "on" : "")} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(15,18,32,0.06)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Single sign-on (SSO)</div>
                  <div style={{ fontSize: 12, color: "var(--bc-muted)", marginTop: 2 }}>Require members to authenticate through your identity provider.</div>
                </div>
                <div className={"toggle " + (company.ssoEnabled ? "on" : "")} />
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Seats & billing</div>
              <div style={{ fontSize: 12.5, color: "var(--bc-muted)", marginBottom: 12 }}>You're using <b style={{ color: "var(--raisin-800)" }}>{company.seats.used}</b> of <b style={{ color: "var(--raisin-800)" }}>{company.seats.total}</b> seats on the {company.plan} plan.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn"><Icon name="add" size={14} />Add seats</button>
                <button className="btn"><Icon name="receipt_long" size={14} />View invoices</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {companyTourActive && window.CoachmarkTour && (
        <window.CoachmarkTour steps={COMPANY_TOUR_STEPS} onComplete={completeCompanyTour} />
      )}
    </div>
  );
}

function WorkspaceFilesScreen({ ctx, onAskAI, projects, filesByProject, onDeleteFile, onCtxMenu }) {
  const projs = projects || (window.BC_DATA && window.BC_DATA.projects) || [];
  const fbp = filesByProject || (window.BC_DATA && window.BC_DATA.filesByProject) || {};

  // Map file extensions to icons + tone color
  const ftypeIcon = (t) => {
    const tt = (t || "").toLowerCase();
    if (tt === "pdf") return { icon: "picture_as_pdf", tone: "pdf" };
    if (tt === "dwg" || tt === "dxf") return { icon: "architecture", tone: "dwg" };
    if (tt === "xlsx" || tt === "xls" || tt === "csv") return { icon: "table_view", tone: "sheet" };
    if (tt === "docx" || tt === "doc" || tt === "txt") return { icon: "description", tone: "doc" };
    if (tt === "jpg" || tt === "jpeg" || tt === "png" || tt === "image") return { icon: "image", tone: "image" };
    return { icon: "insert_drive_file", tone: "other" };
  };
  const ftypeLabel = (t) => (t || "file").toUpperCase();

  // Expanded state — project & revision toggles
  const initialExpanded = {};
  projs.forEach((p, i) => { initialExpanded["proj:" + p.id] = i < 2; });
  const [expanded, setExpanded] = uS4(initialExpanded);
  const isOpen = (k) => !!expanded[k];
  const toggle = (k) => setExpanded(prev => ({ ...prev, [k]: !prev[k] }));

  // Search / filter
  const [search, setSearch] = uS4("");
  const [typeFilter, setTypeFilter] = uS4("all");
  const [projectFilter, setProjectFilter] = uS4("all");

  // Build a flat list for KPI totals
  const allFiles = projs.flatMap(p => (fbp[p.id] || []).map(f => ({ ...f, projectId: p.id, projectName: p.name })));
  const totalFiles = allFiles.length;
  const totalBytes = allFiles.reduce((a, f) => a + (f.sizeBytes || 0), 0);
  const totalSize = (() => {
    if (totalBytes >= 1073741824) return (totalBytes / 1073741824).toFixed(1) + " GB";
    if (totalBytes >= 1048576) return (totalBytes / 1048576).toFixed(1) + " MB";
    return (totalBytes / 1024).toFixed(0) + " KB";
  })();
  const typesPresent = Array.from(new Set(allFiles.map(f => (f.ftype || "").toLowerCase()))).filter(Boolean).sort();

  // Apply filters at the project level
  const matchesFilters = (f) => {
    if (typeFilter !== "all" && (f.ftype || "").toLowerCase() !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.name.toLowerCase().includes(q) && !(f.uploadedBy || "").toLowerCase().includes(q)) return false;
    }
    return true;
  };

  const visibleProjects = projs.filter(p => projectFilter === "all" || projectFilter === p.id);

  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Workspace" }, { label: "Files", bold: true }]}
        actions={
          <>
            <button className="btn"><Icon name="upload" size={16} />Upload files</button>
            <button className="btn"><Icon name="download" size={16} />Export manifest</button>
          </>
        }
        onAskAI={onAskAI}
      />
      <div className="canvas">
        <div style={{ marginBottom: 16 }}>
          <h2 className="page-h1">All project files</h2>
          <p className="page-sub">Manage every file uploaded across your projects. Files are organized by project and revision. Deletions affect any historical skill runs that reference them.</p>
        </div>

        {/* KPI strip — matches the look of other top-level screens */}
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
          <div className="kpi">
            <Icon className="bg" name="folder_copy" />
            <div className="label">Total files</div>
            <div className="value">{totalFiles}</div>
            <div className="delta" style={{ color: "var(--bc-muted)" }}>Across {projs.length} projects</div>
          </div>
          <div className="kpi">
            <Icon className="bg" name="storage" />
            <div className="label">Storage used</div>
            <div className="value">{totalSize}</div>
            <div className="delta" style={{ color: "var(--bc-muted)" }}>{typesPresent.length} file types</div>
          </div>
          <div className="kpi">
            <Icon className="bg" name="picture_as_pdf" />
            <div className="label">Drawings & specs</div>
            <div className="value">{allFiles.filter(f => ["pdf", "dwg", "dxf"].includes((f.ftype || "").toLowerCase())).length}</div>
            <div className="delta" style={{ color: "var(--bc-muted)" }}>PDF / DWG indexed by Cody</div>
          </div>
          <div className="kpi">
            <Icon className="bg" name="history" />
            <div className="label">Latest upload</div>
            <div className="value" style={{ fontSize: 15, lineHeight: 1.2 }}>May 5, 2026</div>
            <div className="delta" style={{ color: "var(--bc-muted)" }}>Recreational Wellness · rev 4</div>
          </div>
        </div>

        {/* Filter toolbar — same visual style as other screens */}
        <div className="files-toolbar">
          <div className="files-search">
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Search filename or uploader…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="icon-btn" onClick={() => setSearch("")} title="Clear search" style={{ width: 24, height: 24 }}>
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <div className="files-filter-group">
            <label className="files-filter-lbl">Project</label>
            <select className="files-filter-select" value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
              <option value="all">All projects</option>
              {projs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="files-filter-group">
            <label className="files-filter-lbl">Type</label>
            <select className="files-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All types</option>
              {typesPresent.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="files-toolbar-spacer" />
          <button className="btn-ghost" onClick={() => {
            const allKeys = {};
            projs.forEach(p => {
              allKeys["proj:" + p.id] = true;
              (p.revisions || []).forEach(r => { allKeys["rev:" + p.id + ":" + r.id] = true; });
            });
            setExpanded(allKeys);
          }}>
            <Icon name="unfold_more" size={14} />Expand all
          </button>
          <button className="btn-ghost" onClick={() => setExpanded({})}>
            <Icon name="unfold_less" size={14} />Collapse all
          </button>
        </div>

        {/* Project > Revision > File tree */}
        <div className="files-tree">
          {visibleProjects.map(p => {
            const projFiles = (fbp[p.id] || []).filter(matchesFilters);
            const revisions = p.revisions || [];
            const projKey = "proj:" + p.id;
            const projOpen = isOpen(projKey);
            return (
              <div key={p.id} className={"files-proj " + (projOpen ? "is-open" : "")}>
                <button className="files-proj-h" onClick={() => toggle(projKey)}>
                  <Icon name={projOpen ? "expand_more" : "chevron_right"} size={18} className="files-chev" />
                  <div className="files-proj-icon">
                    <Icon name={p.icon || "folder"} size={18} />
                  </div>
                  <div className="files-proj-meta">
                    <div className="files-proj-name">{p.name}</div>
                    <div className="files-proj-sub">{p.kind} · {projFiles.length} file{projFiles.length === 1 ? "" : "s"} · {revisions.length} revision{revisions.length === 1 ? "" : "s"}</div>
                  </div>
                  <span className="files-count-pill">{projFiles.length}</span>
                </button>

                {projOpen && (
                  <div className="files-proj-body">
                    {revisions.length === 0 ? (
                      <div className="files-empty">No revisions yet.</div>
                    ) : revisions.map(r => {
                      const revFiles = projFiles.filter(f => f.revisionId === r.id);
                      const revKey = "rev:" + p.id + ":" + r.id;
                      const revOpen = isOpen(revKey);
                      if (revFiles.length === 0 && (search || typeFilter !== "all")) return null;
                      return (
                        <div key={r.id} className={"files-rev " + (revOpen ? "is-open" : "")}>
                          <button className="files-rev-h" onClick={() => toggle(revKey)}>
                            <Icon name={revOpen ? "expand_more" : "chevron_right"} size={16} className="files-chev" />
                            <Icon name="history" size={14} className="files-rev-icon" />
                            <div className="files-rev-meta">
                              <div className="files-rev-name">{r.name}</div>
                              <div className="files-rev-sub">{r.date}{r.note ? " · " + r.note : ""}</div>
                            </div>
                            <span className="files-count-pill files-count-pill-sm">{revFiles.length}</span>
                          </button>

                          {revOpen && (
                            revFiles.length === 0 ? (
                              <div className="files-empty files-empty-rev">No files in this revision yet.</div>
                            ) : (
                              <table className="bc-table files-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: "44%" }}>Filename</th>
                                    <th style={{ width: 88 }}>Type</th>
                                    <th className="num" style={{ width: 112 }}>Size</th>
                                    <th style={{ width: 160 }}>Date uploaded</th>
                                    <th style={{ width: 160 }}>Uploaded by</th>
                                    <th className="center" style={{ width: 80 }}></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {revFiles.map(f => {
                                    const ft = ftypeIcon(f.ftype);
                                    return (
                                      <tr key={f.id}
                                          onContextMenu={(e) => onCtxMenu && onCtxMenu([
                                            { label: "Open", icon: "open_in_new", onClick: () => {} },
                                            { label: "Download", icon: "download", onClick: () => {} },
                                            { divider: true },
                                            { label: "Delete", icon: "delete", danger: true, onClick: () => onDeleteFile && onDeleteFile({ ...f, projectId: p.id, projectName: p.name, revisionName: r.name }) },
                                          ], e)}>
                                        <td>
                                          <div className="files-name-cell">
                                            <span className={"files-ftype-icon files-ftype-" + ft.tone}>
                                              <Icon name={ft.icon} size={16} />
                                            </span>
                                            <span className="item-title files-name-text">{f.name}</span>
                                          </div>
                                        </td>
                                        <td>
                                          <span className={"files-type-pill files-type-" + ft.tone}>{ftypeLabel(f.ftype)}</span>
                                        </td>
                                        <td className="num">{f.size}</td>
                                        <td>
                                          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-strong)" }}>{f.uploaded}</span>
                                        </td>
                                        <td>
                                          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{f.uploadedBy}</span>
                                        </td>
                                        <td className="center">
                                          <button className="icon-btn files-del-btn"
                                                  title="Delete file"
                                                  onClick={() => onDeleteFile && onDeleteFile({ ...f, projectId: p.id, projectName: p.name, revisionName: r.name })}>
                                            <Icon name="delete_outline" size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {visibleProjects.length === 0 && (
            <div className="files-empty" style={{ padding: 24 }}>No projects match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ ctx, onAskAI, theme, onToggleTheme, connections, onAddConnection, onToggleConnection, divisionFormat, divisionFormatOther, onSetDivisionFormat, onSetDivisionFormatOther }) {
  const [tab, setTab] = uS4((ctx && ctx.tab) || "profile");
  const sections = [
    { id: "profile",     label: "Profile",       icon: "person" },
    { id: "appearance",  label: "Appearance",    icon: "palette" },
    { id: "preferences", label: "Preferences",   icon: "tune" },
    { id: "ai",          label: "AI assistant",  icon: "auto_awesome" },
    { id: "connections", label: "Connections",   icon: "hub" },
  ];
  const activeMeta = sections.find(s => s.id === tab) || sections[0];
  const titleByTab = {
    profile: "Profile",
    appearance: "Appearance",
    preferences: "Preferences",
    ai: "AI assistant",
    connections: "Connections",
  };
  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Workspace" }, { label: "Settings", bold: true }, { label: activeMeta.label }]}
        actions={
          <span className="autosave-hint" title="Changes are saved automatically">
            <Icon name="cloud_done" size={14} />Autosaved
          </span>
        }
        onAskAI={onAskAI}
      />
      <div className="canvas">
        <div className="settings-layout">
          {/* Left side-nav for Settings sections */}
          <aside className="settings-side">
            {sections.map(s => (
              <button key={s.id}
                      className={"settings-side-item " + (tab === s.id ? "is-active" : "")}
                      onClick={() => setTab(s.id)}>
                <Icon name={s.icon} size={16} />
                <span>{s.label}</span>
              </button>
            ))}
          </aside>

          <section className="settings-content">
            <h2 className="page-h1">{titleByTab[tab] || activeMeta.label}</h2>

        {tab === "profile" && (
          <div style={{ maxWidth: 640, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>JP</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>Victor Mezhvinsky</div>
                <div style={{ color: "var(--bc-muted)", fontSize: 13 }}>Senior estimator · Acme Builders</div>
                <button className="btn-ghost" style={{ marginTop: 8, padding: "4px 8px" }}><Icon name="upload" size={14}/>Upload photo</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="field"><label>First name</label><input defaultValue="Victor" /></div>
              <div className="field"><label>Last name</label><input defaultValue="Mezhvinsky" /></div>
              <div className="field" style={{ gridColumn: "1 / -1" }}><label>Email</label><input defaultValue="victor.mezhvinsky@acmebuilders.com" /></div>
              <div className="field"><label>Role</label><select defaultValue="senior"><option value="senior">Senior estimator</option><option>Estimator</option><option>Project manager</option></select></div>
              <div className="field"><label>Default region</label><select defaultValue="pdx"><option value="pdx">PDX metro</option><option>Seattle metro</option><option>Boise</option></select></div>
            </div>
          </div>
        )}

        {tab === "appearance" && (
          <div style={{ maxWidth: 640, marginTop: 16 }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <Icon name={theme === "light" ? "light_mode" : "dark_mode"} size={24} style={{ color: "var(--orange-500)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{theme === "light" ? "Light" : "Dark"} theme</div>
                <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>{theme === "light" ? "Bright canvas with subtle borders." : "Dark Raisin canvas with white content sheets."}</div>
              </div>
              <div className={"toggle " + (theme === "dark" ? "on" : "")} onClick={onToggleTheme} />
            </div>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <Icon name="density_medium" size={24} style={{ color: "var(--orange-500)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>Density</div>
                <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>Adjust panel widths and padding. Use Tweaks panel to see effect.</div>
              </div>
            </div>
          </div>
        )}

        {tab === "preferences" && (
          <div style={{ maxWidth: 720, marginTop: 16 }}>
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <Icon name="category" size={24} style={{ color: "var(--orange-500)", marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Division formatting</div>
                  <div style={{ fontSize: 13, color: "var(--bc-muted)", marginTop: 4, lineHeight: 1.55 }}>
                    Choose how the platform organizes takeoffs, estimates, and reports. Switching formats re-groups all project datasets in real time.
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
                {[
                  { id: "masterformat", label: "MasterFormat", desc: "50-division CSI Work Results (Div 01–48). Default for most US estimators." },
                  { id: "uniformat",    label: "Uniformat",    desc: "Elemental classification (A Substructure → G Sitework). Common for early-stage budgeting." },
                  { id: "omniclass",    label: "Omniclass",    desc: "Table 22 Work Results with the 22- prefix. International / BIM-aligned." },
                  { id: "other",        label: "Other",        desc: "Use a custom format your team has standardized on." },
                ].map(opt => {
                  const active = divisionFormat === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={"settings-format-card " + (active ? "is-active" : "")}
                      onClick={() => onSetDivisionFormat && onSetDivisionFormat(opt.id)}>
                      <div className="settings-format-card-h">
                        <span className="settings-format-card-name">{opt.label}</span>
                        <Icon name={active ? "check_circle" : "radio_button_unchecked"} size={18} />
                      </div>
                      <div className="settings-format-card-desc">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
              {divisionFormat === "other" && (
                <div className="field" style={{ marginTop: 16 }}>
                  <label>Specify your formatting</label>
                  <input
                    type="text"
                    placeholder="e.g. CSI MasterSpec, custom CSI-13, internal coding…"
                    value={divisionFormatOther || ""}
                    onChange={(e) => onSetDivisionFormatOther && onSetDivisionFormatOther(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "ai" && (
          <div style={{ maxWidth: 640, marginTop: 16 }}>
            <CodyMessage
              eyebrow="About me"
              title="Cody is your friendly intern"
            >
              <p>I'll cite sources, admit when I'm uncertain, and ask follow-ups. You can change my tone below.</p>
            </CodyMessage>
            <div className="field"><label>Tone</label><select defaultValue="crew"><option value="crew">Crew (default, wry, helpful)</option><option>Strictly formal</option><option>Brief & to the point</option></select></div>
            <div className="field"><label>Auto-suggestions</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}><div className="toggle on" /><span style={{ fontSize: 13, color: "rgba(39,38,53,0.70)" }}>Show 3 suggested follow-ups after each response</span></div>
            </div>
            <div className="field"><label>Cross-project memory</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}><div className="toggle on" /><span style={{ fontSize: 13, color: "rgba(39,38,53,0.70)" }}>Cody remembers patterns across all your projects</span></div>
            </div>
          </div>
        )}

        {tab === "connections" && (() => {
          const list = connections ? Object.values(connections) : [];
          return (
            <div style={{ maxWidth: 760, marginTop: 16 }}>
              <p className="page-sub" style={{ marginTop: 0, marginBottom: 20 }}>
                Connect BuildCrew to the tools you use to manage your projects. Cody will pull drawings, specs, bids, and notes from these sources to power skill runs.
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, color: "var(--bc-muted)" }}>
                  {list.length} active connection{list.length === 1 ? "" : "s"}
                </div>
                <button className="btn-primary" onClick={onAddConnection}>
                  <Icon name="add_link" size={14} />Add connection
                </button>
              </div>

              {list.length === 0 ? (
                <div style={{ border: "1px solid rgba(39,38,53,0.08)", borderRadius: 12, padding: 32, textAlign: "center" }}>
                  <Icon name="hub" size={36} style={{ color: "rgba(39,38,53,0.30)" }} />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--raisin-800)", marginTop: 8 }}>No connections yet</div>
                  <div style={{ fontSize: 12.5, color: "var(--bc-muted)", maxWidth: 380, margin: "8px auto 0", lineHeight: 1.5 }}>
                    Add connections to Bluebeam, Procore, Dropbox, and more so Cody can pull files directly from the tools you already use.
                  </div>
                </div>
              ) : (
                <div className="connect-list">
                  {list.map(c => (
                    <div key={c.id} className="connect-row is-connected">
                      <ConnectLogo domain={c.domain} brand={c.brand || "#272635"} icon={c.icon} name={c.name} />
                      <div className="connect-row-meta">
                        <div className="connect-row-name-row">
                          <span className="connect-name">{c.name}</span>
                          {c.category && <span className="connect-row-cat">{c.category}</span>}
                        </div>
                        {c.desc && <div className="connect-desc">{c.desc}</div>}
                      </div>
                      <span className="connect-status"><span className="connect-status-dot" />Connected</span>
                      <button className="btn-ghost connect-btn-disc"
                              onClick={() => onToggleConnection && onToggleConnection(c.id, false)}>
                        <Icon name="link_off" size={14} />Disconnect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
          </section>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReportsScreen, LaborScreen, LaborRatesPanel, CompanyScreen, WorkspaceFilesScreen, SettingsScreen });
