// Mock data for the BuildCrew.AI prototype
window.BC_DATA = {
  user: { name: "Jamie Park", company: "Acme Builders", initials: "JP" },

  projects: [
    {
      id: "rec-wellness",
      name: "Recreational and Wellness Center",
      kind: "Commercial · 84,000 SF",
      icon: "pool",
      status: "working",
      statusLabel: "3 skills running",
      lastEdit: "2h ago",
      estimate: "$4.82M",
      pinned: true,
      files: 28,
      reports: 4,
      progress: 0.64,
      address: "1208 Riverside Ave, Portland OR",
      stage: "Schematic design",
      phase: "bid", archived: false,
      revisions: [
        { id: "rev1", name: "Revision 1 — Initial upload", date: "Apr 18, 2026", note: "Owner program + site plan" },
        { id: "rev2", name: "Revision 2 — Drawings added", date: "Apr 22, 2026", note: "Architectural set issued" },
        { id: "rev3", name: "Revision 3 — RFC responses", date: "Apr 28, 2026", note: "Lobby ceiling height resolved" },
        { id: "rev4", name: "Revision 4 — Mechanical addendum", date: "May 5, 2026", note: "M-201 / M-202 / M-203 indexed" }
      ],
      scope: "Two-story 84,000 SF municipal recreation and wellness facility in Portland, OR. Program includes a 25-meter 8-lane competition pool, fitness studios, multipurpose gymnasium, locker rooms, and a public lobby/cafe. Site sits on a brownfield with documented soils issues. Targeting LEED Silver and a Q4 2026 substantial completion. Owner is the City Parks Bureau; CMGC delivery."
    },
    {
      id: "rivergrove",
      name: "Rivergrove Residences Phase II",
      kind: "Multifamily · 48 units",
      icon: "apartment",
      status: "done",
      statusLabel: "Estimate ready",
      lastEdit: "yesterday",
      estimate: "$12.1M",
      pinned: true,
      files: 41,
      reports: 6,
      progress: 1,
      address: "4400 SE Powell Blvd, Portland OR",
      stage: "Bidding",
      phase: "won", archived: false,
      revisions: [
        { id: "rev1", name: "Revision 1 — Initial upload", date: "Mar 12, 2026", note: "Phase II program" },
        { id: "rev2", name: "Revision 2 — Drawing set updated", date: "Apr 1, 2026", note: "100% DD set" },
        { id: "rev3", name: "Revision 3 — Bid set finalized", date: "Apr 20, 2026", note: "Issued for bid" }
      ],
      scope: "48-unit affordable multifamily project, Phase II of the Rivergrove development. 4-story Type V wood-frame over Type I podium, with structured parking. Mix of 1BR, 2BR, and 3BR units; ground-floor community space. Targeting Earth Advantage Platinum."
    },
    {
      id: "westlake",
      name: "Westlake Elementary Addition",
      kind: "Education · 32,000 SF",
      icon: "school",
      status: "draft",
      statusLabel: "Draft",
      lastEdit: "3d ago",
      estimate: "—",
      pinned: false,
      files: 12,
      reports: 0,
      progress: 0.10,
      address: "2400 NW 185th Ave, Beaverton OR",
      stage: "Pre-design",
      phase: "draft", archived: false,
      revisions: [
        { id: "rev1", name: "Revision 1 — Initial draft", date: "May 4, 2026", note: "Owner kickoff packet" }
      ]
    },
    {
      id: "mercy-clinic",
      name: "Mercy Outpatient Clinic",
      kind: "Healthcare · Fit-out",
      icon: "local_hospital",
      status: "working",
      statusLabel: "1 skill running",
      lastEdit: "14m ago",
      estimate: "$2.14M",
      pinned: false,
      files: 19,
      reports: 2,
      progress: 0.42,
      address: "830 NE Oregon St, Portland OR",
      stage: "Design development",
      phase: "lost", archived: false,
      revisions: [
        { id: "rev1", name: "Revision 1 — Initial upload", date: "Apr 1, 2026", note: "Tenant fit-out program" },
        { id: "rev2", name: "Revision 2 — Schematic update", date: "Apr 15, 2026", note: "Layout revisions" },
        { id: "rev3", name: "Revision 3 — Mechanical drawings added", date: "May 2, 2026", note: "Full HVAC set" }
      ]
    },
    {
      id: "bayside",
      name: "Bayside Industrial Warehouse",
      kind: "Industrial · 120,000 SF",
      icon: "warehouse",
      status: "done",
      statusLabel: "Bid ready",
      lastEdit: "5d ago",
      estimate: "$8.30M",
      pinned: false,
      files: 33,
      reports: 5,
      progress: 1,
      address: "3300 Ne Marine Dr, Portland OR",
      stage: "Bidding",
      phase: "won", archived: false,
      revisions: [
        { id: "rev1", name: "Revision 1 — Initial upload", date: "Feb 20, 2026", note: "Owner program + site survey" },
        { id: "rev2", name: "Revision 2 — Drawing set updated", date: "Mar 15, 2026", note: "100% CD set issued" }
      ]
    },
    {
      id: "emerson-tower",
      name: "Emerson Tower Lobby Renovation",
      kind: "Commercial · Renovation",
      icon: "business",
      status: "draft",
      statusLabel: "Draft",
      lastEdit: "1w ago",
      estimate: "—",
      pinned: false,
      files: 6,
      reports: 0,
      progress: 0.05,
      address: "1500 SW 5th Ave, Portland OR",
      stage: "Pre-design",
      phase: "draft", archived: true,
      revisions: [
        { id: "rev1", name: "Revision 1 — Initial draft", date: "Apr 30, 2026", note: "Lobby concept brief" }
      ]
    }
  ],

  // Skills available
  skills: [
    {
      id: "estimation",
      name: "Rough Order of Magnitude (ROM) Estimate",
      desc: "ROM cost estimate by CSI division and labor vs materials.",
      icon: "calculate",
      duration: "~12 min",
      runs: 4
    },
    {
      id: "bid-leveling",
      name: "Bid Level Analysis",
      desc: "Compare subcontractor bids and surface the best fit by division.",
      icon: "compare_arrows",
      duration: "~8 min",
      runs: 2
    },
    {
      id: "rfc",
      name: "Clarifications & Potential RFIs",
      desc: "Detect inconsistencies and missing detail across documents.",
      icon: "rule",
      duration: "~6 min",
      runs: 7
    }
  ],

  // Files for the active project
  files: [
    { id: "f1", name: "A-101 — Level 1 floor plan.pdf", size: "4.2 MB", uploaded: "3h ago · Jamie Park", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f2", name: "A-102 — Level 2 floor plan.pdf", size: "3.9 MB", uploaded: "3h ago · Jamie Park", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f3", name: "A-201 — Elevations.pdf", size: "5.8 MB", uploaded: "3h ago · Jamie Park", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f4", name: "A-301 — Building sections.pdf", size: "4.1 MB", uploaded: "Yesterday · Sam Lee", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f5", name: "S-100 — Structural framing.dwg", size: "2.4 MB", uploaded: "Yesterday · Sam Lee", category: "Drawings", ftype: "dwg", confidence: "high", indexed: true },

    { id: "f6", name: "Project manual — Div 09 Finishes.pdf", size: "1.8 MB", uploaded: "2d ago · Jamie Park", category: "Specs", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f7", name: "Spec book — Div 08 Openings.pdf", size: "2.2 MB", uploaded: "2d ago · Jamie Park", category: "Specs", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f8", name: "Mechanical specifications.pdf", size: "3.4 MB", uploaded: "2d ago · Jamie Park", category: "Specs", ftype: "pdf", confidence: "med", indexed: true },

    { id: "f9", name: "Bid form — Northwest Drywall Co.pdf", size: "182 KB", uploaded: "4d ago · Sam Lee", category: "Bid Forms", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f10", name: "Bid form — Apex Mechanical.xlsx", size: "94 KB", uploaded: "4d ago · Sam Lee", category: "Bid Forms", ftype: "xlsx", confidence: "med", indexed: true },
    { id: "f11", name: "Bid form — Stratus Electric.pdf", size: "210 KB", uploaded: "4d ago · Sam Lee", category: "Bid Forms", ftype: "pdf", confidence: "high", indexed: true },

    { id: "f12", name: "Geotech report.pdf", size: "8.2 MB", uploaded: "1w ago · Jamie Park", category: "Supporting Docs", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f13", name: "Site photo — east facade.jpg", size: "2.1 MB", uploaded: "1w ago · Sam Lee", category: "Supporting Docs", ftype: "image", confidence: "high", indexed: true },
    { id: "f14", name: "Owner program narrative.docx", size: "412 KB", uploaded: "2w ago · Jamie Park", category: "Supporting Docs", ftype: "doc", confidence: "high", indexed: true },
  ],

  // Skill runs (for project home and home page)
  runs: [
    { id: "r1", skill: "Rough Order of Magnitude (ROM) Estimate", project: "Recreational and Wellness Center", projectId: "rec-wellness", status: "done", when: "12 min ago", duration: "11m 32s", ai: { lines: 1284, total: "$4.82M", confidence: 0.91 } },
    { id: "r2", skill: "Clarifications & Potential RFIs", project: "Recreational and Wellness Center", projectId: "rec-wellness", status: "done", when: "1h ago", duration: "5m 18s", ai: { issues: 23, critical: 3, high: 7, med: 9, low: 4 } },
    { id: "r3", skill: "Bid Level Analysis", project: "Rivergrove Residences Phase II", projectId: "rivergrove", status: "done", when: "yesterday", duration: "9m 04s", ai: { subs: 6, divisions: 22, savings: "$184k" } },
    { id: "r4", skill: "Rough Order of Magnitude (ROM) Estimate", project: "Mercy Outpatient Clinic", projectId: "mercy-clinic", status: "working", when: "now", duration: "running", progress: 0.42 }
  ],

  // Estimation report — line items
  estimation: {
    project: "Recreational and Wellness Center",
    grandTotal: 4823640,
    laborTotal: 1976692,
    materialTotal: 2846948,
    contingency: 0.08,
    confidence: 0.91,
    laborMaterial: [
      { name: "Materials", value: 2846948, color: "#E84600" },
      { name: "Labor", value: 1976692, color: "#5047F3" }
    ],
    divisions: [
      { code: "01", name: "General Requirements", desc: "GCs, project mgmt, mobilization", amount: 312420, pct: 6.5, items: [
        { name: "Project management & supervision", qty: 24, unit: "WK", unitCost: 8200, total: 196800, refs: [] },
        { name: "Mobilization & site setup", qty: 1, unit: "LS", unitCost: 68400, total: 68400, refs: ["A-101"] },
        { name: "Temporary facilities & utilities", qty: 24, unit: "WK", unitCost: 1965, total: 47220, refs: ["A-101"] }
      ] },
      { code: "03", name: "Concrete", desc: "Foundations, slabs", amount: 482360, pct: 10.0, items: [
        { name: "Cast-in-place concrete, 4000 PSI", qty: 1840, unit: "CY", unitCost: 198, total: 364320, refs: ["A-101"] },
        { name: "Reinforcing steel, grade 60", qty: 92000, unit: "LB", unitCost: 0.92, total: 84640, refs: ["A-101"] },
        { name: "Concrete finishing, broom & seal", qty: 36400, unit: "SF", unitCost: 0.92, total: 33488, refs: ["A-101"] }
      ] },
      { code: "04", name: "Masonry", desc: "CMU, brick veneer", amount: 218200, pct: 4.5 },
      { code: "05", name: "Metals", desc: "Structural steel, deck", amount: 421800, pct: 8.7 },
      { code: "06", name: "Wood, Plastics & Composites", desc: "Rough + finish carpentry", amount: 195400, pct: 4.0 },
      { code: "07", name: "Thermal & Moisture Protection", desc: "Roofing, insulation", amount: 286100, pct: 5.9 },
      { code: "08", name: "Openings", desc: "Doors, windows, glazing", amount: 412700, pct: 8.6 },
      { code: "09", name: "Finishes", desc: "Drywall, flooring, ceiling", amount: 624830, pct: 13.0, flagged: true, items: [
        { name: "Broadloom carpet, 32oz nylon (Shaw Haze)", qty: 14200, unit: "SF", unitCost: 4.85, total: 68870, refs: ["A-101", "A-102"], flagged: true, note: "+22% — county code transport update" },
        { name: "Gypsum wall board, 5/8\" type X", qty: 38400, unit: "SF", unitCost: 1.12, total: 43008, refs: ["A-101"] },
        { name: "Acoustic ceiling tile, 24×24", qty: 11800, unit: "SF", unitCost: 3.20, total: 37760, refs: ["A-301"] },
        { name: "Resilient flooring, sheet vinyl", qty: 8200, unit: "SF", unitCost: 7.10, total: 58220, refs: ["A-101", "A-102"] },
        { name: "Wall finishes & paint", qty: 1, unit: "LS", unitCost: 88900, total: 88900, refs: ["A-201"] }
      ] },
      { code: "10", name: "Specialties", desc: "Toilet partitions, signage", amount: 84200, pct: 1.7 },
      { code: "11", name: "Equipment", desc: "Athletic, fitness equipment", amount: 318400, pct: 6.6 },
      { code: "13", name: "Special Construction", desc: "Pool tank + filtration", amount: 528600, pct: 11.0, flagged: true, items: [
        { name: "Pool tank, gunite, 25m × 8 lane", qty: 1, unit: "LS", unitCost: 384000, total: 384000, refs: ["A-201"], flagged: true, note: "+18% above PNW benchmark" },
        { name: "Pool filtration & circulation system", qty: 1, unit: "LS", unitCost: 96400, total: 96400, refs: [] },
        { name: "Pool deck finish, slip-resistant", qty: 4200, unit: "SF", unitCost: 11.95, total: 50190, refs: ["A-101"] }
      ] },
      { code: "21", name: "Fire Suppression", desc: "Sprinklers, standpipes", amount: 142800, pct: 3.0 },
      { code: "22", name: "Plumbing", desc: "Domestic, sanitary", amount: 312900, pct: 6.5 },
      { code: "23", name: "HVAC", desc: "Air handling, hydronics", amount: 488200, pct: 10.1 },
      { code: "26", name: "Electrical", desc: "Power, lighting", amount: 295730, pct: 6.1 }
    ],
    lineItems: [
      { id: "li1", div: "09", code: "09 68 13", name: "Broadloom carpet, 32oz nylon", note: "Shaw Haze", qty: 14200, unit: "SF", unitCost: 4.85, total: 68870, conf: "med", flagged: true, refs: ["A-101", "A-102"] },
      { id: "li2", div: "09", code: "09 29 00", name: "Gypsum wall board, 5/8\" type X", qty: 38400, unit: "SF", unitCost: 1.12, total: 43008, conf: "high", refs: ["A-101"] },
      { id: "li3", div: "09", code: "09 51 13", name: "Acoustic ceiling tile, 24×24", qty: 11800, unit: "SF", unitCost: 3.20, total: 37760, conf: "high", refs: ["A-301"] },
      { id: "li4", div: "08", code: "08 11 13", name: "Interior hollow metal doors", qty: 42, unit: "EA", unitCost: 685.00, total: 28770, conf: "high", refs: ["A-201"] },
      { id: "li5", div: "08", code: "08 71 00", name: "Door hardware sets, Grade 1", qty: 42, unit: "EA", unitCost: 412.00, total: 17304, conf: "high", refs: ["A-602"] },
      { id: "li6", div: "03", code: "03 30 00", name: "Cast-in-place concrete, 4000 PSI", qty: 1840, unit: "CY", unitCost: 198.00, total: 364320, conf: "high", refs: ["A-101", "S-100"] },
      { id: "li7", div: "23", code: "23 81 00", name: "Rooftop air handling unit, 25-ton", qty: 4, unit: "EA", unitCost: 28400.00, total: 113600, conf: "med", refs: ["M-201"] },
      { id: "li8", div: "13", code: "13 11 00", name: "Pool tank, gunite, 25m × 8 lane", qty: 1, unit: "LS", unitCost: 384000.00, total: 384000, conf: "low", flagged: true, refs: ["A-401", "M-202"] },
      { id: "li9", div: "26", code: "26 51 00", name: "LED 2×4 troffer, 4000K", qty: 218, unit: "EA", unitCost: 142.00, total: 30956, conf: "high", refs: ["E-101"] }
    ]
  },

  // RFC issues
  rfc: {
    project: "Recreational and Wellness Center",
    issues: [
      { id: "RFI-001", title: "Missing fire-rating callouts on stair B doors", desc: "Sheets A-501 and A-502 reference \"see schedule\" but the door schedule on A-602 has no rating column for D-12, D-13, D-14.", category: "Missing Information", refs: ["A-501", "A-602"], priority: "critical" },
      { id: "RFI-002", title: "Conflicting ceiling height — Lobby 101", desc: "A-101 plan shows 12'-0\" AFF; reflected ceiling A-301 shows 11'-0\" with soffit detail.", category: "Document Conflict", refs: ["A-101", "A-301"], priority: "critical" },
      { id: "RFI-003", title: "Pool deck slip resistance not specified", desc: "Spec section 09 65 00 references \"non-slip finish\" with no DCOF/COF target.", category: "Missing Information", refs: ["09 65 00"], priority: "critical" },
      { id: "RFI-004", title: "Glazing performance — south curtainwall", desc: "Energy code requires SHGC ≤ 0.40; spec calls out \"insulated glazing\" without SHGC value.", category: "Missing Information", refs: ["08 44 13"], priority: "med" },
      { id: "RFI-005", title: "Plumbing fixture count below code", desc: "Code requires 8 WCs for women; drawings show 6 WCs in W101 + W202.", category: "Document Conflict", refs: ["P-101"], priority: "critical" },
      { id: "RFI-006", title: "Roof drain locations not coordinated", desc: "Structural shows beam at 24'-6\"; plumbing shows roof drain at same location.", category: "Document Conflict", refs: ["S-200", "P-301"], priority: "med" },
      { id: "RFI-007", title: "Resilient base spec mismatch", desc: "Finish schedule says \"Roppe pinnacle\"; spec 09 65 13 lists \"Johnsonite Millwork\".", category: "Document Conflict", refs: ["A-602", "09 65 13"], priority: "med" },
      { id: "RFI-008", title: "Casework missing dimensions — Reception 102", desc: "Elevation A-302 / 1 has no plan callouts for cabinet depth.", category: "Missing Information", refs: ["A-302"], priority: "med" },
      { id: "RFI-009", title: "GFCI requirements unclear in pool area", desc: "E-201 panel schedule does not call out GFCI breakers for branch circuits within 10' of pool edge.", category: "Missing Information", refs: ["E-201"], priority: "med" },
      { id: "RFI-010", title: "Wall type W-3A used but not in legend", desc: "Wall type W-3A appears on A-103 but is not in the partition legend on A-001.", category: "Document Conflict", refs: ["A-103", "A-001"], priority: "low" },
      { id: "RFI-011", title: "Door D-08 swing direction inconsistent", desc: "Plan A-101 shows left-hand reverse; schedule A-602 shows right-hand.", category: "Document Conflict", refs: ["A-101", "A-602"], priority: "low" },
      { id: "RFI-012", title: "ADA approach clearance — Pool men's restroom", desc: "Maneuvering clearance shown is 60\" — meets minimum; flagging only to confirm interpretation. Designer confirmed no clarification needed.", category: "No clarification needed", refs: ["A-602"], priority: "na" },
      { id: "RFI-013", title: "GC overtime burden assumption", desc: "Cody assumed standard prevailing-wage burden including no overtime. Carry as a qualification on the bid.", category: "Qualification", refs: ["01 22 00"], priority: "low" }
    ]
  },

  // Bid leveling
  bidLeveling: {
    project: "Rivergrove Residences Phase II",
    trades: [
      {
        id: "div-09",
        division: "Division 09",
        name: "Finishes",
        subs: [
          { id: "s1", name: "Northwest Drywall Co.", contact: "M. Reyes", bid: 412300, included: true, recommended: false },
          { id: "s2", name: "Pinnacle Interiors LLC", contact: "K. Hayashi", bid: 384720, included: true, recommended: true },
          { id: "s3", name: "Apex Finishes Group", contact: "T. Sullivan", bid: 451100, included: true, recommended: false },
          { id: "s4", name: "Cascade Wall Systems", contact: "D. Park", bid: 401900, included: true, recommended: false }
        ],
        lineItems: [
          { name: "Mobilization & general conditions", values: [18000, 12500, 22000, 15800] },
          { name: "Gypsum board, 5/8\" type X (38,400 SF)", values: [42500, 38900, 46100, 41200], note: "Material spec match" },
          { name: "Acoustic ceiling tile (11,800 SF)", values: [37200, 35400, 41800, 36900] },
          { name: "Resilient flooring (8,200 SF)", values: [62100, 58400, 68200, 60800] },
          { name: "Carpet & broadloom (14,200 SF)", values: [88400, 82100, 94600, 86200] },
          { name: "Wall finishes & paint", values: [94100, 88900, 102300, 91800] },
          { name: "Exclusions credit", values: [-12500, -7400, 0, -8800], excluded: [false, false, true, false], note: "Two subs exclude pool deck finish" }
        ],
        spread: 17.3,
        exclusions: 2,
        recommendedNote: "Lowest qualified"
      },
      {
        id: "div-22",
        division: "Division 22",
        name: "Plumbing",
        subs: [
          { id: "p1", name: "ThermalTech Solutions", contact: "L. Pham", bid: 369800, included: true, recommended: true },
          { id: "p2", name: "Ewing Electric Co.", contact: "B. Ewing", bid: 380000, included: true, recommended: false },
          { id: "p3", name: "Apex Electric Group", contact: "T. Sullivan", bid: 392000, included: true, recommended: false },
          { id: "p4", name: "Summit Mechanical", contact: "R. Summit", bid: 412000, included: true, recommended: false }
        ],
        lineItems: [
          { name: "Mobilization & site setup", values: [11200, 13800, 12400, 14600] },
          { name: "Domestic water — copper rough-in", values: [62400, 68200, 71400, 78900] },
          { name: "Sanitary drainage — DWV", values: [54200, 56800, 59100, 64400] },
          { name: "Storm drainage — interior roof drains", values: [38600, 41200, 43800, 47200] },
          { name: "Fixtures — WC, lavatory, urinals", values: [98400, 99800, 104200, 108600], note: "Spec match across all bidders" },
          { name: "Water heaters & circulation", values: [42500, 45200, 47800, 51000] },
          { name: "Pool make-up & filtration tie-in", values: [62500, 54800, 53300, 47300], note: "Scope varies — see qualification log" }
        ],
        spread: 11.4,
        exclusions: 0,
        recommendedNote: "Lowest qualified · within 2% of ROM"
      },
      {
        id: "div-26",
        division: "Division 26",
        name: "Electrical",
        subs: [
          { id: "e1", name: "Cascade Power & Light", contact: "J. Tao", bid: 528900, included: true, recommended: false },
          { id: "e2", name: "Stark Electric Inc.", contact: "A. Stark", bid: 502400, included: true, recommended: true },
          { id: "e3", name: "Greenline Electric", contact: "C. Lin", bid: 547600, included: true, recommended: false }
        ],
        lineItems: [
          { name: "Mobilization & service coordination", values: [16800, 14200, 19400] },
          { name: "Service entrance + main switchgear", values: [128400, 118600, 132800] },
          { name: "Branch circuit rough-in", values: [142500, 138200, 148900] },
          { name: "Panelboards & distribution", values: [88600, 84800, 91200] },
          { name: "Lighting fixtures — interior", values: [98400, 94100, 102300] },
          { name: "Lighting fixtures — pool & exterior", values: [54200, 52500, 53000] },
          { name: "GFCI & life-safety devices", values: [0, 0, 0], excluded: [true, true, true], note: "All bidders exclude — qualified scope" }
        ],
        spread: 8.5,
        exclusions: 3,
        recommendedNote: "Best price-to-completeness"
      }
    ]
  },

  // Drawings (with AI takeoff markups) — keyed by sheet code
  drawings: [
    { id: "A-101", title: "Level 1 floor plan",       scale: "1/8\" = 1'-0\"",  markups: 47, status: "done",    thumb: "level1", color: "#E84600", trade: "Architectural", views: 184, planOrder: 12 },
    { id: "A-102", title: "Level 2 floor plan",       scale: "1/8\" = 1'-0\"",  markups: 38, status: "done",    thumb: "level2", color: "#48C1B5", trade: "Architectural", views: 142, planOrder: 13 },
    { id: "A-201", title: "Building elevations",     scale: "1/8\" = 1'-0\"",  markups: 24, status: "done",    thumb: "elev",   color: "#B600E9", trade: "Architectural", views: 96,  planOrder: 18 },
    { id: "A-301", title: "Reflected ceiling — Lobby", scale: "1/4\" = 1'-0\"", markups: 12, status: "flagged", thumb: "rcp",    color: "#FFBD15", trade: "Architectural", views: 211, planOrder: 24 },
    { id: "S-101", title: "Foundation plan",          scale: "1/8\" = 1'-0\"",  markups: 18, status: "done",    thumb: "level1", color: "#48C1B5", trade: "Structural",    views: 88,  planOrder: 31 },
    { id: "M-201", title: "HVAC level 1",             scale: "1/8\" = 1'-0\"",  markups: 22, status: "done",    thumb: "rcp",    color: "#FFBD15", trade: "Mechanical",    views: 64,  planOrder: 42 },
    { id: "E-101", title: "Power plan, level 1",      scale: "1/8\" = 1'-0\"",  markups: 31, status: "done",    thumb: "level2", color: "#B600E9", trade: "Electrical",    views: 128, planOrder: 51 },
    { id: "P-101", title: "Plumbing — pool deck",     scale: "1/4\" = 1'-0\"",  markups: 9,  status: "flagged", thumb: "elev",   color: "#E84600", trade: "Plumbing",      views: 73,  planOrder: 58 }
  ],
  // Cost item ↔ drawing references
  costItemDrawings: {
    "li1": ["A-101", "A-102"],
    "li2": ["A-101"],
    "li3": ["A-301"],
    "li6": ["A-101"],
    "li8": ["A-201"]
  },

  // ----------------------------------------------------------
  // PER-DRAWING TAKEOFF — what Cody pulled off each individual sheet.
  // Used by the Drawing Viewer's bottom drawer.
  // Each material has hotspots (x/y/w/h in viewBox 200×150) so hovering
  // a row highlights it on the drawing.
  // ----------------------------------------------------------
  drawingTakeoffs: {
    "A-101": {
      sheetTitle: "A-101 — Level 1 floor plan",
      groups: [
        { code: "03", name: "Concrete", items: [
          { id: "t-A101-1", material: "Cast-in-place concrete, 4000 PSI", desc: "Slab on grade, lobby + pool deck", qty: 940, unit: "CY", hotspot: { x: 14, y: 14, w: 172, h: 80 } },
          { id: "t-A101-2", material: "Reinforcing steel, grade 60",     desc: "#5 @ 16\" o.c. each way",            qty: 47000, unit: "LB", hotspot: { x: 14, y: 14, w: 172, h: 80 } }
        ]},
        { code: "09", name: "Finishes", items: [
          { id: "t-A101-3", material: "Broadloom carpet, 32oz nylon (Shaw Haze)", desc: "Lobby and corridor zones", qty: 6800, unit: "SF", hotspot: { x: 60, y: 62, w: 60, h: 38 } },
          { id: "t-A101-4", material: "Resilient flooring, sheet vinyl",          desc: "Locker rooms and back-of-house", qty: 4400, unit: "SF", hotspot: { x: 14, y: 62, w: 46, h: 74 } },
          { id: "t-A101-5", material: "Gypsum wall board, 5/8\" type X",          desc: "Interior partitions",      qty: 18800, unit: "SF", hotspot: { x: 60, y: 62, w: 1, h: 74 } }
        ]},
        { code: "13", name: "Special Construction", items: [
          { id: "t-A101-6", material: "Pool deck finish, slip-resistant", desc: "Around 25m competition pool",      qty: 4200, unit: "SF", hotspot: { x: 120, y: 62, w: 66, h: 38 } }
        ]}
      ]
    },
    "A-102": {
      sheetTitle: "A-102 — Level 2 floor plan",
      groups: [
        { code: "06", name: "Wood, Plastics & Composites", items: [
          { id: "t-A102-1", material: "Wood blocking, fire-treated",   desc: "At all wall-mounted equipment",  qty: 1800, unit: "LF", hotspot: { x: 14, y: 14, w: 172, h: 60 } }
        ]},
        { code: "08", name: "Openings", items: [
          { id: "t-A102-2", material: "Interior hollow metal doors",   desc: "Type HM-1, 3'-0\" × 7'-0\"",      qty: 24, unit: "EA", hotspot: { x: 78, y: 14, w: 4, h: 60 } },
          { id: "t-A102-3", material: "Door hardware sets, Grade 1",   desc: "Office function w/ closer",       qty: 24, unit: "EA", hotspot: { x: 140, y: 74, w: 4, h: 62 } }
        ]},
        { code: "09", name: "Finishes", items: [
          { id: "t-A102-4", material: "Broadloom carpet, 32oz nylon",  desc: "Office and meeting areas",        qty: 7400, unit: "SF", hotspot: { x: 80, y: 76, w: 58, h: 58 } },
          { id: "t-A102-5", material: "Acoustic ceiling tile, 24×24",  desc: "Drop ceiling throughout",         qty: 7800, unit: "SF", hotspot: { x: 14, y: 14, w: 172, h: 122 } }
        ]}
      ]
    },
    "A-201": {
      sheetTitle: "A-201 — Building elevations",
      groups: [
        { code: "04", name: "Masonry", items: [
          { id: "t-A201-1", material: "Brick veneer, modular",                desc: "South + east elevations",        qty: 8400, unit: "SF", hotspot: { x: 20, y: 50, w: 80, h: 70 } }
        ]},
        { code: "07", name: "Thermal & Moisture Protection", items: [
          { id: "t-A201-2", material: "Air & vapor barrier, fluid-applied",  desc: "Behind veneer assembly",        qty: 14200, unit: "SF", hotspot: { x: 20, y: 42, w: 160, h: 78 } },
          { id: "t-A201-3", material: "Mineral wool insulation, R-21",       desc: "Continuous exterior",           qty: 14200, unit: "SF", hotspot: { x: 20, y: 42, w: 160, h: 78 } }
        ]},
        { code: "08", name: "Openings", items: [
          { id: "t-A201-4", material: "Aluminum storefront glazing",         desc: "Punched openings, IGU",         qty: 1860, unit: "SF", hotspot: { x: 28, y: 50, w: 147, h: 44 } }
        ]}
      ]
    },
    "A-301": {
      sheetTitle: "A-301 — Reflected ceiling — Lobby",
      groups: [
        { code: "09", name: "Finishes", items: [
          { id: "t-A301-1", material: "Acoustic ceiling tile, 24×24",  desc: "Lobby + adjacent corridors",       qty: 3400, unit: "SF", hotspot: { x: 14, y: 14, w: 172, h: 122 } },
          { id: "t-A301-2", material: "Gypsum soffit, 5/8\" type X",   desc: "Lobby perimeter dropdown",         qty: 460,  unit: "SF", hotspot: { x: 14, y: 14, w: 172, h: 22 } }
        ]},
        { code: "26", name: "Electrical", items: [
          { id: "t-A301-3", material: "LED 2×4 troffer, 4000K",        desc: "Recessed in ACT grid",             qty: 48,   unit: "EA", hotspot: { x: 80, y: 64, w: 22, h: 22 } }
        ]}
      ]
    },
    "S-101": {
      sheetTitle: "S-101 — Foundation plan",
      groups: [
        { code: "03", name: "Concrete", items: [
          { id: "t-S101-1", material: "Spread footings, 4000 PSI",      desc: "F1.0 through F4.0",             qty: 240, unit: "CY", hotspot: { x: 14, y: 14, w: 172, h: 122 } },
          { id: "t-S101-2", material: "Reinforcing steel, grade 60",    desc: "Mat reinforcement",             qty: 28000, unit: "LB", hotspot: { x: 14, y: 14, w: 172, h: 122 } },
          { id: "t-S101-3", material: "Anchor bolts, 3/4\" × 18\"",     desc: "At perimeter columns",          qty: 86, unit: "EA", hotspot: { x: 14, y: 14, w: 172, h: 1 } }
        ]}
      ]
    },
    "M-201": {
      sheetTitle: "M-201 — HVAC level 1",
      groups: [
        { code: "23", name: "HVAC", items: [
          { id: "t-M201-1", material: "Rooftop air handling unit, 25-ton", desc: "AHU-1, AHU-2",                  qty: 2, unit: "EA", hotspot: { x: 80, y: 64, w: 22, h: 22 } },
          { id: "t-M201-2", material: "Galvanized rectangular duct",       desc: "Supply mains",                  qty: 2400, unit: "LB", hotspot: { x: 14, y: 74, w: 172, h: 1 } },
          { id: "t-M201-3", material: "VAV terminal box w/ reheat",        desc: "Zone-level units",              qty: 18, unit: "EA", hotspot: { x: 36, y: 34, w: 132, h: 80 } }
        ]}
      ]
    },
    "E-101": {
      sheetTitle: "E-101 — Power plan, level 1",
      groups: [
        { code: "26", name: "Electrical", items: [
          { id: "t-E101-1", material: "Distribution panel, 480/277V, 400A", desc: "Main switchgear MSB-1",       qty: 1,   unit: "EA", hotspot: { x: 14, y: 60, w: 8, h: 16 } },
          { id: "t-E101-2", material: "Branch circuit conduit, EMT, 3/4\"", desc: "Power circuits",              qty: 4800, unit: "LF", hotspot: { x: 14, y: 14, w: 172, h: 122 } },
          { id: "t-E101-3", material: "Wire, THHN copper, #12",             desc: "Branch circuit conductors",   qty: 14400, unit: "LF", hotspot: { x: 14, y: 14, w: 172, h: 122 } },
          { id: "t-E101-4", material: "Receptacle, 20A duplex",             desc: "Wall-mounted",                qty: 86, unit: "EA", hotspot: { x: 14, y: 60, w: 172, h: 4 } }
        ]}
      ]
    },
    "P-101": {
      sheetTitle: "P-101 — Plumbing, pool deck",
      groups: [
        { code: "13", name: "Special Construction", items: [
          { id: "t-P101-1", material: "Pool filtration & circulation system", desc: "Pump, filter, heater package", qty: 1, unit: "LS", hotspot: { x: 60, y: 100, w: 80, h: 36 } }
        ]},
        { code: "22", name: "Plumbing", items: [
          { id: "t-P101-2", material: "PVC sched 80 piping, 4\"",          desc: "Main pool circulation",          qty: 380, unit: "LF", hotspot: { x: 60, y: 110, w: 80, h: 4 } },
          { id: "t-P101-3", material: "Floor drain w/ trap primer",        desc: "Pool deck drainage",             qty: 14, unit: "EA", hotspot: { x: 14, y: 14, w: 172, h: 122 } }
        ]}
      ]
    }
  },

  // Labor rates
  laborRates: [
    { trade: "Project Manager",       rate: 142, fringe: 0.42, region: "PDX metro" },
    { trade: "Superintendent",        rate: 118, fringe: 0.42, region: "PDX metro" },
    { trade: "Foreman — Carpenter",   rate: 86,  fringe: 0.55, region: "PDX metro" },
    { trade: "Carpenter, Journey",    rate: 72,  fringe: 0.58, region: "PDX metro" },
    { trade: "Drywall, Journey",      rate: 64,  fringe: 0.54, region: "PDX metro" },
    { trade: "Painter, Journey",      rate: 58,  fringe: 0.50, region: "PDX metro" },
    { trade: "Electrician, JIW",      rate: 84,  fringe: 0.62, region: "PDX metro" },
    { trade: "Plumber, JIW",          rate: 88,  fringe: 0.61, region: "PDX metro" },
    { trade: "Sheet Metal, JIW",      rate: 78,  fringe: 0.58, region: "PDX metro" },
    { trade: "Laborer, Group 1",      rate: 48,  fringe: 0.48, region: "PDX metro" }
  ]
};
