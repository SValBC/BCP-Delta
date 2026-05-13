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
        crumbs={[{ label: "Workspace" }, { label: "Reports", bold: true }, { label: "Recreational Wellness — ROM v3" }]}
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
            <h2 className="page-h1">Recreational Wellness — ROM v3</h2>
            <p className="page-sub">Drag blocks from skill results to assemble a custom report. Cody will keep them in sync if the underlying data changes.</p>

            <div className="card no-pad" style={{ marginTop: 18 }}>
              <div className="card-h"><Icon name="view_list" style={{ color: "var(--orange-500)" }} /><h3>Report sections</h3><div className="right"><button className="btn-ghost"><Icon name="add" size={14}/>Add section</button></div></div>
              <div style={{ padding: 14 }}>
                {sections.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 10px", borderBottom: i < sections.length - 1 ? "1px solid rgba(39,38,53,0.06)" : "none", alignItems: "center" }}>
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
            <div className="page-preview" style={{ border: "1px solid rgba(39,38,53,0.10)", borderRadius: 8, padding: "32px 28px", aspectRatio: "8.5/11", display: "flex", flexDirection: "column", gap: 14, fontSize: 11, color: "var(--bc-strong)" }}>
              <div style={{ borderBottom: "2px solid var(--orange-500)", paddingBottom: 10 }}>
                <div style={{ fontFamily: "var(--font-marketing)", color: "var(--orange-500)", fontSize: 22, lineHeight: 1 }}>buildcrew.ai</div>
                <div style={{ fontSize: 10, color: "var(--bc-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 4 }}>Rough Order of Magnitude · v3</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Recreational and Wellness Center</div>
                <div style={{ color: "var(--bc-muted)", fontSize: 10 }}>1208 Riverside Ave, Portland OR · Apr 28, 2026</div>
              </div>
              <div style={{ background: "rgba(232,70,0,0.06)", padding: 10, borderRadius: 6 }}>
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
        <div style={{ marginBottom: 14 }}>
          <h2 className="page-h1">PDX metro · v2.4</h2>
          <p className="page-sub">Last updated 4 days ago. These rates apply to every skill run on projects in the PDX region. Cody will warn if you have a project that uses these rates with a different region tag.</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 }}>
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

function SettingsScreen({ ctx, onAskAI, theme, onToggleTheme }) {
  const tab = ctx.tab || "profile";
  return (
    <div className="col-detail">
      <Taskbar
        crumbs={[{ label: "Workspace" }, { label: "Settings", bold: true }, { label: tab }]}
        actions={<button className="btn-primary"><Icon name="save" size={16}/>Save</button>}
        onAskAI={onAskAI}
      />
      <div className="canvas">
        <h2 className="page-h1">{tab === "profile" ? "Profile" : tab === "appearance" ? "Appearance" : tab === "ai" ? "AI assistant" : tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>

        {tab === "profile" && (
          <div style={{ maxWidth: 640, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 22 }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>JP</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>Jamie Park</div>
                <div style={{ color: "var(--bc-muted)", fontSize: 13 }}>Senior estimator · Acme Builders</div>
                <button className="btn-ghost" style={{ marginTop: 6, padding: "4px 8px" }}><Icon name="upload" size={14}/>Upload photo</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>First name</label><input defaultValue="Jamie" /></div>
              <div className="field"><label>Last name</label><input defaultValue="Park" /></div>
              <div className="field" style={{ gridColumn: "1 / -1" }}><label>Email</label><input defaultValue="jamie.park@acmebuilders.com" /></div>
              <div className="field"><label>Role</label><select defaultValue="senior"><option value="senior">Senior estimator</option><option>Estimator</option><option>Project manager</option></select></div>
              <div className="field"><label>Default region</label><select defaultValue="pdx"><option value="pdx">PDX metro</option><option>Seattle metro</option><option>Boise</option></select></div>
            </div>
          </div>
        )}

        {tab === "appearance" && (
          <div style={{ maxWidth: 640, marginTop: 16 }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <Icon name={theme === "light" ? "light_mode" : "dark_mode"} size={24} style={{ color: "var(--orange-500)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{theme === "light" ? "Light" : "Dark"} theme</div>
                <div style={{ fontSize: 12, color: "var(--bc-muted)" }}>{theme === "light" ? "Bright canvas with subtle borders." : "Dark Raisin canvas with white content sheets."}</div>
              </div>
              <div className={"toggle " + (theme === "dark" ? "on" : "")} onClick={onToggleTheme} />
            </div>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
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
            <div className="field"><label>Tone</label><select defaultValue="crew"><option value="crew">Crew (default — wry, helpful)</option><option>Strictly formal</option><option>Brief & to the point</option></select></div>
            <div className="field"><label>Auto-suggestions</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}><div className="toggle on" /><span style={{ fontSize: 13, color: "rgba(39,38,53,0.70)" }}>Show 3 suggested follow-ups after each response</span></div>
            </div>
            <div className="field"><label>Cross-project memory</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}><div className="toggle on" /><span style={{ fontSize: 13, color: "rgba(39,38,53,0.70)" }}>Cody remembers patterns across all your projects</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ReportsScreen, LaborScreen, SettingsScreen });
