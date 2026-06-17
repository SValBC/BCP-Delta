// BuildCrew.AI — Reports / Labor / Settings
const { useState: uS4 } = React;

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

function LaborScreen({ ctx, onAskAI }) {
  const rows = window.BC_DATA.laborRates;
  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Workspace" }, { label: "Labor rates" }, { label: "PDX metro", bold: true }]}
        actions={<><button className="btn"><Icon name="upload" size={16}/>Import CSV</button><button className="btn-primary"><Icon name="save" size={16}/>Save changes</button></>}
        onAskAI={onAskAI}
      />
      <div className="canvas">
        <div style={{ marginBottom: 16 }}>
          <h2 className="page-h1">PDX metro · v2.4</h2>
          <p className="page-sub">Last updated 4 days ago. These rates apply to every skill run on projects in the PDX region. Cody will warn if you have a project that uses these rates with a different region tag.</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
          <div className="kpi"><Icon className="bg" name="construction" /><div className="label">Trades tracked</div><div className="value">{rows.length}</div></div>
          <div className="kpi"><Icon className="bg" name="payments" /><div className="label">Avg base rate</div><div className="value">${(rows.reduce((a, r) => a + r.rate, 0) / rows.length).toFixed(0)}</div></div>
          <div className="kpi"><Icon className="bg" name="folder_open" /><div className="label">Projects affected</div><div className="value">4</div></div>
        </div>

        <div className="card no-pad">
          <div className="card-h">
            <Icon name="engineering" style={{ color: "var(--orange-500)" }} />
            <h3>Trades & rates</h3>
            <div className="right">
              <button className="btn-ghost"><Icon name="add" size={14}/>Add trade</button>
              <button className="btn-ghost"><Icon name="history" size={14}/>History</button>
            </div>
          </div>
          <table className="bc-table">
            <thead><tr><th>Trade</th><th className="num">Base rate</th><th className="num">Fringe</th><th className="num">Loaded rate</th><th>Region</th><th></th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><div className="item-title">{r.trade}</div></td>
                  <td className="num"><span className="cell-display editable">${r.rate.toFixed(2)}</span></td>
                  <td className="num"><span className="cell-display editable">{(r.fringe * 100).toFixed(0)}%</span></td>
                  <td className="num"><b>${(r.rate * (1 + r.fringe)).toFixed(2)}</b></td>
                  <td><span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--bc-muted)" }}>{r.region}</span></td>
                  <td className="center"><button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="more_horiz" size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

function SettingsScreen({ ctx, onAskAI, theme, onToggleTheme, connections, onAddConnection, onToggleConnection }) {
  const [tab, setTab] = uS4((ctx && ctx.tab) || "profile");
  const sections = [
    { id: "profile",     label: "Profile",       icon: "person" },
    { id: "appearance",  label: "Appearance",    icon: "palette" },
    { id: "ai",          label: "AI assistant",  icon: "auto_awesome" },
    { id: "connections", label: "Connections",   icon: "hub" },
  ];
  const activeMeta = sections.find(s => s.id === tab) || sections[0];
  const titleByTab = {
    profile: "Profile",
    appearance: "Appearance",
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

Object.assign(window, { ReportsScreen, LaborScreen, WorkspaceFilesScreen, SettingsScreen });
