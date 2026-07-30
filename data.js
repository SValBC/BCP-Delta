// Mock data for the BuildCrew.AI prototype
window.BC_DATA = {
  user: { name: "Victor Mezhvinsky", company: "Acme Builders", initials: "VM", role: "admin" },

  // Master approval workflow — pending / approved / denied approval
  // requests. Any edit event (takeoff change, skill run, upload, rate
  // update, revision) that a team member wants applied to the Master
  // version of a project starts life as one of these entries.
  pendingApprovals: [
    { id: "app-1", projectId: "rec-wellness", requestedBy: "u-mira", requestedAt: "2h ago",
      dateISO: "2026-05-26T14:00:00", status: "pending",
      summary: "3 changes across takeoffs + labor rates",
      changes: [
        { kind: "takeoff",     label: "Updated 2 line items in Division 03 · Concrete" },
        { kind: "labor_rate",  label: "Increased Superintendent rate from $118 → $122" },
        { kind: "file_upload", label: "Uploaded M-203 Pool HVAC v2 addendum" },
      ] },
    { id: "app-2", projectId: "rec-wellness", requestedBy: "u-sam", requestedAt: "Yesterday",
      dateISO: "2026-05-25T10:30:00", status: "pending",
      summary: "Ran ROM Estimate v3 with updated PDX metro rates",
      changes: [
        { kind: "skill_run",  label: "ROM Estimate v3 completed · $4.82M · 91% confidence" },
        { kind: "labor_rate", label: "Applied PDX metro labor rates v2.4 across all divisions" },
      ] },
    { id: "app-3", projectId: "rivergrove", requestedBy: "u-dan", requestedAt: "4h ago",
      dateISO: "2026-05-26T12:00:00", status: "pending",
      summary: "Updated project address",
      changes: [
        { kind: "project_meta", label: "Project address changed to 8420 SW Powell Blvd" },
      ] },
    { id: "app-4", projectId: "mercy-clinic", requestedBy: "u-kai", requestedAt: "3d ago",
      dateISO: "2026-05-23T09:00:00", status: "approved",
      summary: "Added 3 trades + 4 supplemental drawings",
      resolvedBy: "u-victor", resolvedAt: "2d ago",
      changes: [
        { kind: "labor_rate",  label: "Added 3 new trades to project rates" },
        { kind: "file_upload", label: "Uploaded 4 supplemental drawings from architect" },
      ] },
    { id: "app-5", projectId: "rec-wellness", requestedBy: "u-owen", requestedAt: "1w ago",
      dateISO: "2026-05-19T15:20:00", status: "approved",
      summary: "Bid Level Analysis for Division 09 · Finishes",
      resolvedBy: "u-victor", resolvedAt: "1w ago",
      changes: [
        { kind: "skill_run", label: "Bid Level Analysis · Pinnacle Interiors recommended · −$66.4k saved" },
      ] },
    { id: "app-6", projectId: "westlake", requestedBy: "u-jules", requestedAt: "5d ago",
      dateISO: "2026-05-21T11:00:00", status: "denied",
      summary: "Labor rate change flagged for review",
      resolvedBy: "u-victor", resolvedAt: "4d ago", denyReason: "Rate change needs backup from published wage tables.",
      changes: [
        { kind: "labor_rate", label: "Bumped Ironworker rate from $82 → $95" },
      ] },
  ],

  // Per-project activity feed — powers the "who's editing this project"
  // notifications popover in the Taskbar. Static seed for the prototype;
  // in production this would be a live event stream.
  projectActivity: {
    "rec-wellness": [
      { kind: "editing",  user: "u-mira", note: "editing takeoffs",         time: "Now" },
      { kind: "editing",  user: "u-sam",  note: "running ROM Estimate",     time: "10 min ago" },
      { kind: "approved", user: "u-victor", note: "approved 4 changes by Kai Nakamura", time: "2d ago" },
      { kind: "approved", user: "u-victor", note: "approved Bid Level Analysis for Div 09", time: "1w ago" },
      { kind: "approved", user: "u-victor", note: "approved 6 file uploads by Sam Lee",  time: "2w ago" },
    ],
    "rivergrove": [
      { kind: "editing",  user: "u-dan",  note: "editing project address",  time: "4h ago" },
      { kind: "approved", user: "u-sam",  note: "approved schedule update", time: "3d ago" },
    ],
    "mercy-clinic": [
      { kind: "approved", user: "u-victor", note: "approved 2 changes by Kai Nakamura", time: "2d ago" },
    ],
  },

  // Company workspace — team roster with per-project permission grants.
  // Roles: admin (company-wide changes), collaborator (edit assigned projects),
  // viewer (read-only on assigned projects). Used by the Company screen's
  // Members tab and the permission model throughout the app.
  company: {
    name: "Acme Builders",
    founded: "2011",
    address: "1420 SW Naito Pkwy, Portland OR 97201",
    website: "https://acmebuilders.example",
    plan: "Pro",
    seats: { used: 12, total: 25 },
    // Default role assigned to newly-invited members.
    defaultRole: "collaborator",
    allowGuests: true,
    ssoEnabled: false,
  },
  companyMembers: [
    { id: "u-victor", name: "Victor Mezhvinsky", email: "victor.mezhvinsky@acmebuilders.com", initials: "VM", role: "admin",        title: "Senior Estimator",  dateAdded: "Aug 4, 2023",  projects: [
      { projectId: "rec-wellness", role: "admin" },
      { projectId: "rivergrove",   role: "admin" },
      { projectId: "mercy-clinic", role: "admin" },
      { projectId: "bayside",      role: "admin" },
      { projectId: "westlake",     role: "admin" },
      { projectId: "emerson-tower", role: "admin" },
    ]},
    { id: "u-sam",    name: "Sam Lee",            email: "sam.lee@acmebuilders.com",           initials: "SL", role: "admin",        title: "Preconstruction Lead", dateAdded: "Feb 12, 2022", projects: [
      { projectId: "rec-wellness", role: "admin" },
      { projectId: "rivergrove",   role: "admin" },
      { projectId: "mercy-clinic", role: "collaborator" },
      { projectId: "bayside",      role: "collaborator" },
      { projectId: "westlake",     role: "admin" },
      { projectId: "emerson-tower", role: "admin" },
    ]},
    { id: "u-mira",   name: "Mira Chen",          email: "mira.chen@acmebuilders.com",         initials: "MC", role: "collaborator", title: "Estimator",         dateAdded: "May 3, 2024",  projects: [
      { projectId: "rec-wellness", role: "collaborator" },
      { projectId: "rivergrove",   role: "collaborator" },
      { projectId: "westlake",     role: "collaborator" },
    ]},
    { id: "u-dan",    name: "Dan Ortega",         email: "dan.ortega@acmebuilders.com",         initials: "DO", role: "collaborator", title: "Project Manager",    dateAdded: "Sep 21, 2023", projects: [
      { projectId: "mercy-clinic", role: "collaborator" },
      { projectId: "bayside",      role: "collaborator" },
    ]},
    { id: "u-kai",    name: "Kai Nakamura",       email: "kai.nakamura@acmebuilders.com",       initials: "KN", role: "collaborator", title: "Estimator",         dateAdded: "Nov 8, 2023", projects: [
      { projectId: "rec-wellness", role: "collaborator" },
      { projectId: "emerson-tower", role: "collaborator" },
    ]},
    { id: "u-ana",    name: "Ana Reyes",          email: "ana.reyes@acmebuilders.com",          initials: "AR", role: "collaborator", title: "Estimator",         dateAdded: "Jan 15, 2024", projects: [
      { projectId: "rivergrove",   role: "collaborator" },
      { projectId: "emerson-tower", role: "collaborator" },
    ]},
    { id: "u-tom",    name: "Tom Hollister",      email: "tom.hollister@acmebuilders.com",      initials: "TH", role: "viewer",       title: "Client Liaison",     dateAdded: "Mar 30, 2024", projects: [
      { projectId: "rec-wellness", role: "viewer" },
      { projectId: "rivergrove",   role: "viewer" },
      { projectId: "mercy-clinic", role: "viewer" },
      { projectId: "bayside",      role: "viewer" },
      { projectId: "westlake",     role: "viewer" },
      { projectId: "emerson-tower", role: "viewer" },
    ]},
    { id: "u-jules",  name: "Jules Park",         email: "jules.park@acmebuilders.com",         initials: "JP", role: "collaborator", title: "Field Engineer",     dateAdded: "Jun 6, 2024", projects: [
      { projectId: "bayside",      role: "collaborator" },
      { projectId: "westlake",     role: "collaborator" },
    ]},
    { id: "u-rio",    name: "Rio Alvarado",       email: "rio.alvarado@acmebuilders.com",       initials: "RA", role: "collaborator", title: "Cost Engineer",      dateAdded: "Feb 2, 2024", projects: [
      { projectId: "rec-wellness", role: "collaborator" },
      { projectId: "mercy-clinic", role: "collaborator" },
    ]},
    { id: "u-lena",   name: "Lena Vasquez",       email: "lena.vasquez@acmebuilders.com",       initials: "LV", role: "viewer",       title: "Owner's Rep — Bay Health", dateAdded: "Apr 18, 2024", projects: [
      { projectId: "mercy-clinic", role: "viewer" },
    ]},
    { id: "u-owen",   name: "Owen Frost",         email: "owen.frost@acmebuilders.com",         initials: "OF", role: "collaborator", title: "MEP Coordinator",    dateAdded: "Oct 11, 2023", projects: [
      { projectId: "rec-wellness", role: "collaborator" },
      { projectId: "emerson-tower", role: "collaborator" },
      { projectId: "westlake",     role: "collaborator" },
    ]},
    { id: "u-priya",  name: "Priya Shah",         email: "priya.shah@acmebuilders.com",         initials: "PS", role: "viewer",       title: "Owner's Rep — Rivergrove", dateAdded: "Jul 22, 2024", projects: [
      { projectId: "rivergrove",   role: "viewer" },
    ]},
  ],

  projects: [
    {
      id: "rec-wellness",
      name: "Recreational and Wellness Center",
      kind: "Commercial · 84,000 SF",
      icon: "folder_open",
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
        { id: "rev1", name: "Revision 1: Initial upload", date: "Apr 18, 2026", note: "Owner program + site plan" },
        { id: "rev2", name: "Revision 2: Drawings added", date: "Apr 22, 2026", note: "Architectural set issued" },
        { id: "rev3", name: "Revision 3: RFC responses", date: "Apr 28, 2026", note: "Lobby ceiling height resolved" },
        { id: "rev4", name: "Revision 4: Mechanical addendum", date: "May 5, 2026", note: "M-201 / M-202 / M-203 indexed" }
      ],
      scope: "Two-story 84,000 SF municipal recreation and wellness facility in Portland, OR. Program includes a 25-meter 8-lane competition pool, fitness studios, multipurpose gymnasium, locker rooms, and a public lobby/cafe. Site sits on a brownfield with documented soils issues. Targeting LEED Silver and a Q4 2026 substantial completion. Owner is the City Parks Bureau; CMGC delivery."
    },
    {
      id: "rivergrove",
      name: "Rivergrove Residences Phase II",
      kind: "Multifamily · 48 units",
      icon: "folder_open",
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
        { id: "rev1", name: "Revision 1: Initial upload", date: "Mar 12, 2026", note: "Phase II program" },
        { id: "rev2", name: "Revision 2: Drawing set updated", date: "Apr 1, 2026", note: "100% DD set" },
        { id: "rev3", name: "Revision 3: Bid set finalized", date: "Apr 20, 2026", note: "Issued for bid" }
      ],
      scope: "48-unit affordable multifamily project, Phase II of the Rivergrove development. 4-story Type V wood-frame over Type I podium, with structured parking. Mix of 1BR, 2BR, and 3BR units; ground-floor community space. Targeting Earth Advantage Platinum."
    },
    {
      id: "westlake",
      name: "Westlake Elementary Addition",
      kind: "Education · 32,000 SF",
      icon: "folder_open",
      status: "draft",
      statusLabel: "Draft",
      lastEdit: "3d ago",
      estimate: "N/A",
      pinned: false,
      files: 12,
      reports: 0,
      progress: 0.10,
      address: "2400 NW 185th Ave, Beaverton OR",
      stage: "Pre-design",
      phase: "draft", archived: false,
      revisions: [
        { id: "rev1", name: "Revision 1: Initial draft", date: "May 4, 2026", note: "Owner kickoff packet" }
      ]
    },
    {
      id: "mercy-clinic",
      name: "Mercy Outpatient Clinic",
      kind: "Healthcare · Fit-out",
      icon: "folder_open",
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
        { id: "rev1", name: "Revision 1: Initial upload", date: "Apr 1, 2026", note: "Tenant fit-out program" },
        { id: "rev2", name: "Revision 2: Schematic update", date: "Apr 15, 2026", note: "Layout revisions" },
        { id: "rev3", name: "Revision 3: Mechanical drawings added", date: "May 2, 2026", note: "Full HVAC set" }
      ]
    },
    {
      id: "bayside",
      name: "Bayside Industrial Warehouse",
      kind: "Industrial · 120,000 SF",
      icon: "folder_open",
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
        { id: "rev1", name: "Revision 1: Initial upload", date: "Feb 20, 2026", note: "Owner program + site survey" },
        { id: "rev2", name: "Revision 2: Drawing set updated", date: "Mar 15, 2026", note: "100% CD set issued" }
      ]
    },
    {
      id: "emerson-tower",
      name: "Emerson Tower Lobby Renovation",
      kind: "Commercial · Renovation",
      icon: "folder_open",
      status: "draft",
      statusLabel: "Draft",
      lastEdit: "1w ago",
      estimate: "N/A",
      pinned: false,
      files: 6,
      reports: 0,
      progress: 0.05,
      address: "1500 SW 5th Ave, Portland OR",
      stage: "Pre-design",
      phase: "draft", archived: true,
      revisions: [
        { id: "rev1", name: "Revision 1: Initial draft", date: "Apr 30, 2026", note: "Lobby concept brief" }
      ]
    }
  ],

  // Skills available
  skills: [
    {
      id: "rfc",
      name: "Clarifications & Potential RFIs",
      desc: "Detect inconsistencies and missing detail across documents.",
      icon: "rule",
      duration: "~6 min",
      runs: 7
    },
    {
      id: "trade-scoping",
      name: "Trade Scoping",
      desc: "Compiles every trade referenced in your uploaded documentation and drafts a scope of work for each — ready to attach to bid invitations.",
      icon: "groups",
      duration: "~4 min",
      runs: 3
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
      id: "estimation",
      name: "Rough Order of Magnitude (ROM) Estimate",
      desc: "ROM cost estimate by CSI division and labor vs materials.",
      icon: "calculate",
      duration: "~12 min",
      runs: 4
    }
  ],

  // Trade Scoping skill output — every trade referenced across the
  // project's uploaded documents, along with the drafted scope Cody
  // extracted for each. Feeds the trade-select-and-invite workflow on
  // the Trade Scoping results screen.
  tradeScoping: {
    project: "Recreational and Wellness Center",
    version: "v1",
    finishedAt: "12 min ago",
    duration: "3m 48s",
    confidence: 0.89,
    scopeItemsTotal: 128,
    filesAnalyzed: 24,
    trades: [
      { id: "div-03", division: "03", csi: "03 30 00", name: "Concrete", subs: 4, confidence: "high", confidenceScore: 0.94,
        highlights: [
          "Cast-in-place slab on grade, 4,000 PSI (36,400 SF)",
          "Reinforcing steel per structural schedule",
          "Broom finish + slip-resistant sealant on pool deck",
        ],
        scope: "Furnish and install all cast-in-place concrete including slab on grade (36,400 SF at 4,000 PSI), reinforcing steel per structural schedule S-101, and broom finish + slip-resistant sealant on pool deck per spec section 03 35 00. Includes formwork, curing compounds, and joint sealants per detail 3/S-201. Coordinate slab depression at pool tank with GC before pour. Excludes pool tank gunite (see Division 13).",
        sourceRefs: ["A-101", "S-101", "S-201", "03 30 00", "03 35 00"] },
      { id: "div-04", division: "04", csi: "04 22 00", name: "Masonry", subs: 3, confidence: "high", confidenceScore: 0.90,
        highlights: [
          "8\" CMU partitions with bond beams (4,200 SF)",
          "Grouted cells + rebar reinforcing per detail",
        ],
        scope: "Furnish and install lightweight CMU partitions in mechanical and equipment rooms (4,200 SF) per spec section 04 22 00. Includes bond beams, grouted cells with reinforcing steel per detail 1/A-501, mortar, and cleanout at base course. Coordinate wall openings with mechanical and electrical prior to laying.",
        sourceRefs: ["A-201", "A-501", "04 22 00"] },
      { id: "div-05", division: "05", csi: "05 12 00", name: "Structural Steel", subs: 4, confidence: "high", confidenceScore: 0.93,
        highlights: [
          "W-shapes (142 TN) + 3\" composite steel deck (38,400 SF)",
          "Shop primer, field paint by others",
          "Includes erection + connections per spec",
        ],
        scope: "Furnish, deliver, and erect structural steel including W-shape framing (approximately 142 TN) and 3\" composite steel deck (38,400 SF) per structural drawings S-101 through S-104. Includes shop drawings, shop primer, field connections, bracing, and safety cabling. Coordinate lift plan with GC. Field paint by Painting.",
        sourceRefs: ["S-101", "S-102", "S-201", "05 12 00", "05 31 00"] },
      { id: "div-06", division: "06", csi: "06 20 00", name: "Rough & Finish Carpentry", subs: 3, confidence: "med", confidenceScore: 0.78,
        highlights: [
          "Wood blocking + backing throughout",
          "Millwork per interior elevations (Level 1 + 2)",
        ],
        scope: "Furnish and install all rough and finish carpentry including plywood + dimensional lumber blocking behind wall finishes, backing at ADA-mounted fixtures, and finish millwork per interior elevations on A-501 through A-508. Includes reception desk casework (Level 1 lobby) and studio storage cabinets (Level 2).",
        sourceRefs: ["A-501", "A-502", "06 20 00"] },
      { id: "div-07", division: "07", csi: "07 50 00", name: "Roofing & Waterproofing", subs: 3, confidence: "high", confidenceScore: 0.88,
        highlights: [
          "TPO membrane roof over aquatic center (28,400 SF)",
          "Pool-deck waterproofing membrane",
          "Below-slab moisture barrier at lockers",
        ],
        scope: "Furnish and install single-ply TPO roofing system (28,400 SF) with rigid insulation to meet code minimum R-value per Div 07 spec set. Includes tapered insulation to internal drains, all flashings, and 20-year manufacturer warranty. Coordinate pool-deck waterproofing membrane and below-slab moisture barrier at locker rooms.",
        sourceRefs: ["A-103", "07 50 00", "07 27 00"] },
      { id: "div-08", division: "08", csi: "08 14 16", name: "Doors, Frames & Hardware", subs: 3, confidence: "high", confidenceScore: 0.96,
        highlights: [
          "84 solid-core wood doors, paint grade",
          "Hollow-metal frames throughout",
          "Hardware sets per door schedule A-601",
        ],
        scope: "Furnish and install 84 solid-core wood doors (paint grade), matching hollow-metal frames, and hardware sets per door schedule A-601. Hardware includes closers, keying, and access-control preps at coded doors. Coordinate final keying schedule with owner.",
        sourceRefs: ["A-201", "A-601", "08 14 16", "08 71 00"] },
      { id: "div-08-gz", division: "08", csi: "08 41 00", name: "Storefront & Glazing", subs: 3, confidence: "high", confidenceScore: 0.86,
        highlights: [
          "Aluminum-framed storefront, west elevation (3,800 SF)",
          "Low-e insulated glazing, argon fill",
        ],
        scope: "Furnish and install aluminum-framed storefront system with low-e insulated glazing (argon fill) at west elevation (3,800 SF) per spec section 08 41 00 and details 3/A-501. Includes weep flashings, sealants, and thermal breaks per manufacturer.",
        sourceRefs: ["A-401", "A-501", "08 41 00"] },
      { id: "div-09-dw", division: "09", csi: "09 29 00", name: "Drywall & Metal Framing", subs: 4, confidence: "high", confidenceScore: 0.95,
        highlights: [
          "Metal-stud framing + 5/8\" type X gypsum (38,400 SF)",
          "Fire-rated partitions per UL assemblies on A-501",
        ],
        scope: "Furnish and install metal-stud framing and 5/8\" type X gypsum wallboard for all interior partitions (approximately 38,400 SF) per spec section 09 29 00. Fire-rated assemblies tagged on partition types on A-501 to be built to UL listings. Includes taping, mudding, sanding to Level 4 finish.",
        sourceRefs: ["A-201", "A-501", "09 29 00", "09 22 00"] },
      { id: "div-09-fl", division: "09", csi: "09 60 00", name: "Flooring & Finishes", subs: 5, confidence: "med", confidenceScore: 0.74,
        highlights: [
          "Broadloom carpet (14,200 SF) — Shaw Haze specified",
          "Sheet vinyl in locker rooms (8,200 SF)",
          "Acoustic ceiling tile 24×24 (11,800 SF)",
        ],
        scope: "Furnish and install carpet, resilient flooring, and ceiling finishes per finish schedule A-602. Includes broadloom carpet (14,200 SF, Shaw Haze), heat-welded sheet vinyl in locker rooms (8,200 SF), and 24x24 ACT ceilings (11,800 SF). Coordinate subfloor prep and moisture testing with GC before install. Flooring for pool deck excluded (see Special Construction).",
        sourceRefs: ["A-101", "A-102", "A-602", "09 60 00", "09 68 13"] },
      { id: "div-13", division: "13", csi: "13 11 13", name: "Pool Package", subs: 2, confidence: "low", confidenceScore: 0.62,
        highlights: [
          "Gunite pool tank, 25m × 8 lane (lump sum)",
          "Filtration + circulation system",
          "Slip-resistant pool deck finish (4,200 SF)",
        ],
        scope: "Furnish and install complete pool package including gunite tank (25m × 8 lane competition pool), filtration and circulation equipment sized for turnover per pool code, and slip-resistant pool deck finish (4,200 SF). Includes pool lighting, gutters, expansion joints, and coordination with plumbing, electrical, and mechanical. Owner to provide final water treatment specifications during shop drawings.",
        sourceRefs: ["A-101", "A-201", "13 11 13", "13 11 23"] },
      { id: "div-22", division: "22", csi: "22 00 00", name: "Plumbing", subs: 4, confidence: "high", confidenceScore: 0.87,
        highlights: [
          "Domestic water + waste/vent throughout",
          "Locker room fixtures (~40 fixture units)",
          "Pool make-up water tie-in",
        ],
        scope: "Furnish and install complete plumbing system per Division 22 including domestic hot/cold water, waste/vent, storm drainage, and locker room fixtures (approximately 40 fixture units). Coordinate pool make-up water tie-in with Pool Package trade. Includes fixture rough-in, backflow prevention, and hot-water recirculation.",
        sourceRefs: ["P-101", "P-201", "22 00 00"] },
      { id: "div-23", division: "23", csi: "23 00 00", name: "HVAC", subs: 4, confidence: "high", confidenceScore: 0.90,
        highlights: [
          "Aquatic-center dedicated dehumidification unit",
          "VAV system with terminal units at Level 2",
          "Roof-mounted make-up air",
        ],
        scope: "Furnish and install complete HVAC system per Division 23 including dedicated dehumidification unit for aquatic center, VAV system with terminal units on Level 2, and roof-mounted make-up air. Includes ductwork, insulation, controls integration, and testing/balancing. Coordinate roof penetrations with roofing trade prior to installation.",
        sourceRefs: ["M-201", "M-202", "M-203", "23 00 00"] },
      { id: "div-26", division: "26", csi: "26 00 00", name: "Electrical", subs: 4, confidence: "high", confidenceScore: 0.91,
        highlights: [
          "Service entrance + main distribution",
          "Lighting + occupancy sensing throughout",
          "Pool equipment feeders per Pool Package",
        ],
        scope: "Furnish and install complete electrical system per Division 26 including service entrance, main distribution equipment, branch circuits, lighting fixtures + controls (occupancy sensing throughout), fire-alarm system, and pool equipment feeders. Coordinate underground conduit runs with site work prior to slab pour.",
        sourceRefs: ["E-101", "E-102", "E-201", "E-202", "26 00 00"] },
    ]
  },

  // Files for the active project
  files: [
    { id: "f1", name: "A-101 Level 1 floor plan.pdf", size: "4.2 MB", uploaded: "3h ago · Victor Mezhvinsky", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f2", name: "A-102 Level 2 floor plan.pdf", size: "3.9 MB", uploaded: "3h ago · Victor Mezhvinsky", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f3", name: "A-201 Elevations.pdf", size: "5.8 MB", uploaded: "3h ago · Victor Mezhvinsky", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f4", name: "A-301 Building sections.pdf", size: "4.1 MB", uploaded: "Yesterday · Sam Lee", category: "Drawings", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f5", name: "S-100 Structural framing.dwg", size: "2.4 MB", uploaded: "Yesterday · Sam Lee", category: "Drawings", ftype: "dwg", confidence: "high", indexed: true },

    { id: "f6", name: "Project manual - Div 09 Finishes.pdf", size: "1.8 MB", uploaded: "2d ago · Victor Mezhvinsky", category: "Specs", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f7", name: "Spec book - Div 08 Openings.pdf", size: "2.2 MB", uploaded: "2d ago · Victor Mezhvinsky", category: "Specs", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f8", name: "Mechanical specifications.pdf", size: "3.4 MB", uploaded: "2d ago · Victor Mezhvinsky", category: "Specs", ftype: "pdf", confidence: "med", indexed: true },

    { id: "f9", name: "Bid form - Northwest Drywall Co.pdf", size: "182 KB", uploaded: "4d ago · Sam Lee", category: "Bid Forms", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f10", name: "Bid form - Apex Mechanical.xlsx", size: "94 KB", uploaded: "4d ago · Sam Lee", category: "Bid Forms", ftype: "xlsx", confidence: "med", indexed: true },
    { id: "f11", name: "Bid form - Stratus Electric.pdf", size: "210 KB", uploaded: "4d ago · Sam Lee", category: "Bid Forms", ftype: "pdf", confidence: "high", indexed: true },

    { id: "f12", name: "Geotech report.pdf", size: "8.2 MB", uploaded: "1w ago · Victor Mezhvinsky", category: "Supporting Docs", ftype: "pdf", confidence: "high", indexed: true },
    { id: "f13", name: "Site photo - east facade.jpg", size: "2.1 MB", uploaded: "1w ago · Sam Lee", category: "Supporting Docs", ftype: "image", confidence: "high", indexed: true },
    { id: "f14", name: "Owner program narrative.docx", size: "412 KB", uploaded: "2w ago · Victor Mezhvinsky", category: "Supporting Docs", ftype: "doc", confidence: "high", indexed: true },
  ],

  // Per-project files grouped by revision — used by the Files management screen.
  // Each file: { id, name, size, sizeBytes, ftype, uploaded, uploadedBy, revisionId }
  filesByProject: {
    "rec-wellness": [
      // rev1 — Owner program + site plan
      { id: "rw-r1-1", name: "Owner program narrative.docx", size: "412 KB", sizeBytes: 421888, ftype: "docx", uploaded: "Apr 18, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "rw-r1-2", name: "Site survey - Riverside Ave.pdf", size: "6.4 MB", sizeBytes: 6710886, ftype: "pdf", uploaded: "Apr 18, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "rw-r1-3", name: "Geotech report.pdf", size: "8.2 MB", sizeBytes: 8598323, ftype: "pdf", uploaded: "Apr 18, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "rw-r1-4", name: "Brownfield env assessment.pdf", size: "2.1 MB", sizeBytes: 2202010, ftype: "pdf", uploaded: "Apr 18, 2026", uploadedBy: "Sam Lee", revisionId: "rev1" },
      // rev2 — Architectural set
      { id: "rw-r2-1", name: "A-101 Level 1 floor plan.pdf", size: "4.2 MB", sizeBytes: 4404019, ftype: "pdf", uploaded: "Apr 22, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "rw-r2-2", name: "A-102 Level 2 floor plan.pdf", size: "3.9 MB", sizeBytes: 4089446, ftype: "pdf", uploaded: "Apr 22, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "rw-r2-3", name: "A-201 Elevations.pdf", size: "5.8 MB", sizeBytes: 6081740, ftype: "pdf", uploaded: "Apr 22, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "rw-r2-4", name: "A-301 Reflected ceiling plan.pdf", size: "3.4 MB", sizeBytes: 3565158, ftype: "pdf", uploaded: "Apr 22, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      { id: "rw-r2-5", name: "S-100 Structural framing.dwg", size: "2.4 MB", sizeBytes: 2516582, ftype: "dwg", uploaded: "Apr 22, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      { id: "rw-r2-6", name: "Project manual - Div 09 Finishes.pdf", size: "1.8 MB", sizeBytes: 1887436, ftype: "pdf", uploaded: "Apr 22, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      // rev3 — RFC responses
      { id: "rw-r3-1", name: "RFC-002 ceiling height response.pdf", size: "624 KB", sizeBytes: 638976, ftype: "pdf", uploaded: "Apr 28, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      { id: "rw-r3-2", name: "A-301 R1 Reflected ceiling (rev).pdf", size: "3.6 MB", sizeBytes: 3774873, ftype: "pdf", uploaded: "Apr 28, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      { id: "rw-r3-3", name: "Site photo - east facade.jpg", size: "2.1 MB", sizeBytes: 2202010, ftype: "jpg", uploaded: "Apr 28, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      // rev4 — Mechanical addendum
      { id: "rw-r4-1", name: "M-201 HVAC level 1.pdf", size: "4.6 MB", sizeBytes: 4823449, ftype: "pdf", uploaded: "May 5, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev4", status: "uploaded" },
      { id: "rw-r4-2", name: "M-202 HVAC level 2.pdf", size: "4.3 MB", sizeBytes: 4508876, ftype: "pdf", uploaded: "May 5, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev4", status: "processing" },
      { id: "rw-r4-3", name: "M-203 Pool HVAC.pdf", size: "5.1 MB", sizeBytes: 5347737, ftype: "pdf", uploaded: "May 5, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev4", status: "uploaded" },
      { id: "rw-r4-4", name: "Mechanical specifications.pdf", size: "3.4 MB", sizeBytes: 3565158, ftype: "pdf", uploaded: "May 5, 2026", uploadedBy: "Sam Lee", revisionId: "rev4", status: "failed" },
    ],
    "rivergrove": [
      // rev1 — Phase II program
      { id: "rg-r1-1", name: "Phase II program narrative.docx", size: "388 KB", sizeBytes: 397312, ftype: "docx", uploaded: "Mar 12, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "rg-r1-2", name: "Owner pro forma.xlsx", size: "186 KB", sizeBytes: 190464, ftype: "xlsx", uploaded: "Mar 12, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "rg-r1-3", name: "Site plan - Powell Blvd.pdf", size: "4.8 MB", sizeBytes: 5033165, ftype: "pdf", uploaded: "Mar 12, 2026", uploadedBy: "Sam Lee", revisionId: "rev1" },
      // rev2 — 100% DD set
      { id: "rg-r2-1", name: "A-100 Site plan.pdf", size: "5.2 MB", sizeBytes: 5452595, ftype: "pdf", uploaded: "Apr 1, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "rg-r2-2", name: "A-101 Podium plan.pdf", size: "4.4 MB", sizeBytes: 4613734, ftype: "pdf", uploaded: "Apr 1, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "rg-r2-3", name: "A-201 Building elevations.pdf", size: "5.5 MB", sizeBytes: 5767168, ftype: "pdf", uploaded: "Apr 1, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "rg-r2-4", name: "S-200 Type V framing.pdf", size: "3.1 MB", sizeBytes: 3250585, ftype: "pdf", uploaded: "Apr 1, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      { id: "rg-r2-5", name: "Project manual - DD set.pdf", size: "12.4 MB", sizeBytes: 13002342, ftype: "pdf", uploaded: "Apr 1, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      // rev3 — Bid set
      { id: "rg-r3-1", name: "Bid form - Northwest Drywall Co.pdf", size: "182 KB", sizeBytes: 186368, ftype: "pdf", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      { id: "rg-r3-2", name: "Bid form - Pinnacle Interiors.pdf", size: "204 KB", sizeBytes: 208896, ftype: "pdf", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      { id: "rg-r3-3", name: "Bid form - Apex Finishes.xlsx", size: "94 KB", sizeBytes: 96256, ftype: "xlsx", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      { id: "rg-r3-4", name: "Bid form - Cascade Wall Systems.pdf", size: "172 KB", sizeBytes: 176128, ftype: "pdf", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      { id: "rg-r3-5", name: "Bid form - ThermalTech Solutions.pdf", size: "198 KB", sizeBytes: 202752, ftype: "pdf", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
      { id: "rg-r3-6", name: "Bid form - Stark Electric Inc.pdf", size: "212 KB", sizeBytes: 217088, ftype: "pdf", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
    ],
    "westlake": [
      { id: "wl-r1-1", name: "Owner kickoff packet.pdf", size: "1.4 MB", sizeBytes: 1468006, ftype: "pdf", uploaded: "May 4, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "wl-r1-2", name: "Existing conditions survey.pdf", size: "3.2 MB", sizeBytes: 3355443, ftype: "pdf", uploaded: "May 4, 2026", uploadedBy: "Sam Lee", revisionId: "rev1" },
      { id: "wl-r1-3", name: "Site photo - playground.jpg", size: "1.8 MB", sizeBytes: 1887436, ftype: "jpg", uploaded: "May 4, 2026", uploadedBy: "Sam Lee", revisionId: "rev1" },
    ],
    "mercy-clinic": [
      // rev1
      { id: "mc-r1-1", name: "Tenant fit-out program.docx", size: "264 KB", sizeBytes: 270336, ftype: "docx", uploaded: "Apr 1, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "mc-r1-2", name: "Lease floor plan.pdf", size: "1.6 MB", sizeBytes: 1677721, ftype: "pdf", uploaded: "Apr 1, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      // rev2
      { id: "mc-r2-1", name: "A-101 Schematic layout (rev).pdf", size: "2.8 MB", sizeBytes: 2936012, ftype: "pdf", uploaded: "Apr 15, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "mc-r2-2", name: "A-201 Schematic elevations.pdf", size: "2.4 MB", sizeBytes: 2516582, ftype: "pdf", uploaded: "Apr 15, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      { id: "mc-r2-3", name: "Casework reference photos.jpg", size: "3.1 MB", sizeBytes: 3250585, ftype: "jpg", uploaded: "Apr 15, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      // rev3
      { id: "mc-r3-1", name: "M-201 HVAC level 1.pdf", size: "4.2 MB", sizeBytes: 4404019, ftype: "pdf", uploaded: "May 2, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev3" },
      { id: "mc-r3-2", name: "M-202 HVAC level 2.pdf", size: "4.0 MB", sizeBytes: 4194304, ftype: "pdf", uploaded: "May 2, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev3" },
      { id: "mc-r3-3", name: "Mechanical specifications.pdf", size: "2.9 MB", sizeBytes: 3040870, ftype: "pdf", uploaded: "May 2, 2026", uploadedBy: "Sam Lee", revisionId: "rev3" },
    ],
    "bayside": [
      // rev1
      { id: "bs-r1-1", name: "Owner program - warehouse.docx", size: "348 KB", sizeBytes: 356352, ftype: "docx", uploaded: "Feb 20, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "bs-r1-2", name: "Site survey - Marine Dr.pdf", size: "5.8 MB", sizeBytes: 6081740, ftype: "pdf", uploaded: "Feb 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev1" },
      { id: "bs-r1-3", name: "Geotech report.pdf", size: "7.4 MB", sizeBytes: 7759462, ftype: "pdf", uploaded: "Feb 20, 2026", uploadedBy: "Sam Lee", revisionId: "rev1" },
      // rev2 — 100% CD
      { id: "bs-r2-1", name: "A-101 Warehouse floor plan.pdf", size: "6.2 MB", sizeBytes: 6501171, ftype: "pdf", uploaded: "Mar 15, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "bs-r2-2", name: "A-201 Elevations.pdf", size: "5.9 MB", sizeBytes: 6186598, ftype: "pdf", uploaded: "Mar 15, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
      { id: "bs-r2-3", name: "S-100 Foundation plan.pdf", size: "4.8 MB", sizeBytes: 5033165, ftype: "pdf", uploaded: "Mar 15, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      { id: "bs-r2-4", name: "S-200 Steel framing.dwg", size: "3.6 MB", sizeBytes: 3774873, ftype: "dwg", uploaded: "Mar 15, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      { id: "bs-r2-5", name: "E-101 Power plan.pdf", size: "3.9 MB", sizeBytes: 4089446, ftype: "pdf", uploaded: "Mar 15, 2026", uploadedBy: "Sam Lee", revisionId: "rev2" },
      { id: "bs-r2-6", name: "Project manual - full set.pdf", size: "14.2 MB", sizeBytes: 14889779, ftype: "pdf", uploaded: "Mar 15, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev2" },
    ],
    "emerson-tower": [
      { id: "et-r1-1", name: "Lobby concept brief.docx", size: "224 KB", sizeBytes: 229376, ftype: "docx", uploaded: "Apr 30, 2026", uploadedBy: "Victor Mezhvinsky", revisionId: "rev1" },
      { id: "et-r1-2", name: "Existing lobby photos.jpg", size: "4.4 MB", sizeBytes: 4613734, ftype: "jpg", uploaded: "Apr 30, 2026", uploadedBy: "Sam Lee", revisionId: "rev1" },
    ],
  },

  // Skill runs (for project home and home page)
  runs: [
    // startedAt is an ISO timestamp used to sort the Recent Skill Runs tables.
    // Most recent first when rendered.
    { id: "r4",  skill: "Rough Order of Magnitude (ROM) Estimate", project: "Mercy Outpatient Clinic",            projectId: "mercy-clinic",  status: "working", when: "now",        startedAt: "2026-05-26T16:00:00", duration: "running",  progress: 0.42 },
    { id: "r1",  skill: "Rough Order of Magnitude (ROM) Estimate", project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "12 min ago", startedAt: "2026-05-26T15:48:00", duration: "11m 32s", ai: { lines: 1284, total: "$4.82M", confidence: 0.91, version: "v3" } },
    { id: "r2",  skill: "Clarifications & Potential RFIs",         project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "1h ago",     startedAt: "2026-05-26T15:00:00", duration: "5m 18s",  ai: { issues: 23, critical: 3, high: 7, med: 9, low: 4 } },
    { id: "r3",  skill: "Bid Level Analysis",                      project: "Rivergrove Residences Phase II",   projectId: "rivergrove",    status: "done",    when: "yesterday",  startedAt: "2026-05-25T16:21:00", duration: "9m 04s",  ai: { subs: 6, divisions: 22, savings: "$184k" } },
    // Historical runs for Recreational and Wellness Center, used by the
    // Skills History tab on the ROM results screen.
    { id: "r5",  skill: "Bid Level Analysis",                      project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "2h ago",     startedAt: "2026-05-05T14:30:00", duration: "8m 42s",  ai: { subs: 3, divisions: 1, division: "Division 26 · Electrical", winner: "Stark Electric Inc.",   bid: "$502.4k", savings: "$26.5k" } },
    { id: "r6",  skill: "Bid Level Analysis",                      project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "3d ago",     startedAt: "2026-05-02T11:15:00", duration: "7m 16s",  ai: { subs: 4, divisions: 1, division: "Division 22 · Plumbing",   winner: "ThermalTech Solutions", bid: "$369.8k", savings: "$42.2k" } },
    { id: "r7",  skill: "Bid Level Analysis",                      project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "1w ago",     startedAt: "2026-04-28T16:08:00", duration: "9m 04s",  ai: { subs: 4, divisions: 1, division: "Division 09 · Finishes",   winner: "Pinnacle Interiors LLC", bid: "$384.7k", savings: "$66.4k" } },
    { id: "r8",  skill: "Rough Order of Magnitude (ROM) Estimate", project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "Apr 21",     startedAt: "2026-04-21T10:42:00", duration: "12m 08s", ai: { lines: 1268, total: "$4.71M", confidence: 0.89, version: "v2" } },
    { id: "r9",  skill: "Clarifications & Potential RFIs",         project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "Apr 18",     startedAt: "2026-04-18T09:30:00", duration: "4m 47s",  ai: { issues: 19, critical: 2, high: 6, med: 8, low: 3 } },
    { id: "r10", skill: "Rough Order of Magnitude (ROM) Estimate", project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "Mar 12",     startedAt: "2026-03-12T13:05:00", duration: "13m 22s", ai: { lines: 1192, total: "$4.49M", confidence: 0.84, version: "v1" } },
    { id: "r11", skill: "Trade Scoping",                            project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "12 min ago", startedAt: "2026-05-26T15:36:00", duration: "3m 48s",  ai: { trades: 13, highConfidence: 10, invited: 0, confidence: 0.89, version: "v1" } },
    { id: "r12", skill: "Trade Scoping",                            project: "Recreational and Wellness Center", projectId: "rec-wellness",  status: "done",    when: "Apr 24",     startedAt: "2026-04-24T09:20:00", duration: "4m 12s",  ai: { trades: 12, highConfidence: 8,  invited: 12, confidence: 0.86, version: "v0" } }
  ],

  // Estimation report — line items
  estimation: {
    project: "Recreational and Wellness Center",
    version: "v3",
    finishedAt: "May 26, 2026 · 12 min ago",
    // Which underlying document set this run was based on. Lets the user
    // see at a glance whether the estimate reflects the latest drawings.
    revision: {
      drawings: "Drawing Set Rev 4",
      drawingsDate: "May 6, 2026",
      specs: "Spec Book Rev 2",
      specsDate: "May 6, 2026",
      fileCount: 24,
    },
    // Prior ROM run for side-by-side comparison. Used by the Compare panel
    // to show KPI deltas and the biggest division movers between runs.
    previousRun: {
      version: "v2",
      finishedAt: "Apr 21, 2026",
      grandTotal: 4712820,
      laborTotal: 1932400,
      materialTotal: 2780420,
      confidence: 0.89,
      costPerSF: 56.10,
      // Top-impact divisions, pre-sorted by absolute dollar change so the
      // panel can show the biggest movers first.
      topChanges: [
        { code: "13", name: "Special Construction",   prev: 502200, curr: 528600, reason: "Pool tank lump sum revised up after benchmark refresh." },
        { code: "09", name: "Finishes",                prev: 598400, curr: 624830, reason: "Broadloom carpet unit cost increased 22% from supplier update." },
        { code: "23", name: "HVAC",                    prev: 472100, curr: 488200, reason: "Air handler equipment lead time premium applied." },
        { code: "26", name: "Electrical",              prev: 308200, curr: 295730, reason: "Reduced fixture count after lighting plan update." },
        { code: "08", name: "Openings",                prev: 396800, curr: 412700, reason: "Storefront glazing area increased on west elevation." },
      ],
    },
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
        { name: "Broadloom carpet, 32oz nylon (Shaw Haze)", qty: 14200, unit: "SF", unitCost: 4.85, total: 68870, refs: ["A-101", "A-102"], flagged: true, note: "+22% from county code transport update" },
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
      { id: "RFI-002", title: "Conflicting ceiling height in Lobby 101", desc: "A-101 plan shows 12'-0\" AFF; reflected ceiling A-301 shows 11'-0\" with soffit detail.", category: "Document Conflict", refs: ["A-101", "A-301"], priority: "critical" },
      { id: "RFI-003", title: "Pool deck slip resistance not specified", desc: "Spec section 09 65 00 references \"non-slip finish\" with no DCOF/COF target.", category: "Missing Information", refs: ["09 65 00"], priority: "critical" },
      { id: "RFI-004", title: "Glazing performance for south curtainwall", desc: "Energy code requires SHGC ≤ 0.40; spec calls out \"insulated glazing\" without SHGC value.", category: "Missing Information", refs: ["08 44 13"], priority: "med" },
      { id: "RFI-005", title: "Plumbing fixture count below code", desc: "Code requires 8 WCs for women; drawings show 6 WCs in W101 + W202.", category: "Document Conflict", refs: ["P-101"], priority: "critical" },
      { id: "RFI-006", title: "Roof drain locations not coordinated", desc: "Structural shows beam at 24'-6\"; plumbing shows roof drain at same location.", category: "Document Conflict", refs: ["S-200", "P-301"], priority: "med" },
      { id: "RFI-007", title: "Resilient base spec mismatch", desc: "Finish schedule says \"Roppe pinnacle\"; spec 09 65 13 lists \"Johnsonite Millwork\".", category: "Document Conflict", refs: ["A-602", "09 65 13"], priority: "med" },
      { id: "RFI-008", title: "Casework missing dimensions in Reception 102", desc: "Elevation A-302 / 1 has no plan callouts for cabinet depth.", category: "Missing Information", refs: ["A-302"], priority: "med" },
      { id: "RFI-009", title: "GFCI requirements unclear in pool area", desc: "E-201 panel schedule does not call out GFCI breakers for branch circuits within 10' of pool edge.", category: "Missing Information", refs: ["E-201"], priority: "med" },
      { id: "RFI-010", title: "Wall type W-3A used but not in legend", desc: "Wall type W-3A appears on A-103 but is not in the partition legend on A-001.", category: "Document Conflict", refs: ["A-103", "A-001"], priority: "low" },
      { id: "RFI-011", title: "Door D-08 swing direction inconsistent", desc: "Plan A-101 shows left-hand reverse; schedule A-602 shows right-hand.", category: "Document Conflict", refs: ["A-101", "A-602"], priority: "low" },
      { id: "RFI-012", title: "ADA approach clearance in Pool men's restroom", desc: "Maneuvering clearance shown is 60\", which meets minimum; flagging only to confirm interpretation. Designer confirmed no clarification needed.", category: "No clarification needed", refs: ["A-602"], priority: "na" },
      { id: "RFI-013", title: "GC overtime burden assumption", desc: "Cody assumed standard prevailing-wage burden including no overtime. Carry as a qualification on the bid.", category: "Qualification", refs: ["01 22 00"], priority: "low" }
    ]
  },

  // Pre-run configuration for the Bid Level Analysis skill.
  // Cody scans each project's uploaded bid files (only) and auto-categorizes
  // them into trades. Users can re-assign files to a different trade before
  // running the skill, and multi-select which trades to actually run on.
  // Shape per project: { trades: [{ id, division, name }], files: [{ id, name, size, uploaded, uploadedBy, tradeId }] }
  bidConfig: {
    "rec-wellness": {
      trades: [
        { id: "div-09", division: "09", name: "Finishes" },
        { id: "div-22", division: "22", name: "Plumbing" },
        { id: "div-23", division: "23", name: "HVAC" },
        { id: "div-26", division: "26", name: "Electrical" },
        { id: "div-13", division: "13", name: "Special Construction (Pool)" },
      ],
      files: [
        { id: "rw-bid-1",  name: "Northwest Drywall Co - bid.pdf",      size: "182 KB", uploaded: "Apr 28, 2026", uploadedBy: "Sam Lee",    tradeId: "div-09" },
        { id: "rw-bid-2",  name: "Pinnacle Interiors - finishes bid.pdf", size: "204 KB", uploaded: "Apr 28, 2026", uploadedBy: "Sam Lee",    tradeId: "div-09" },
        { id: "rw-bid-3",  name: "Apex Finishes Group - bid.xlsx",       size: "94 KB",  uploaded: "Apr 28, 2026", uploadedBy: "Sam Lee",    tradeId: "div-09" },
        { id: "rw-bid-4",  name: "Cascade Wall Systems - bid.pdf",       size: "172 KB", uploaded: "Apr 28, 2026", uploadedBy: "Sam Lee",    tradeId: "div-09" },
        { id: "rw-bid-5",  name: "ThermalTech Solutions - plumbing.pdf", size: "198 KB", uploaded: "May 2, 2026",  uploadedBy: "Victor Mezhvinsky", tradeId: "div-22" },
        { id: "rw-bid-6",  name: "Ewing Plumbing - bid response.pdf",    size: "186 KB", uploaded: "May 2, 2026",  uploadedBy: "Victor Mezhvinsky", tradeId: "div-22" },
        { id: "rw-bid-7",  name: "Summit Mechanical - plumbing.pdf",     size: "210 KB", uploaded: "May 2, 2026",  uploadedBy: "Victor Mezhvinsky", tradeId: "div-22" },
        { id: "rw-bid-8",  name: "Apex Mechanical - HVAC bid.xlsx",      size: "120 KB", uploaded: "May 5, 2026",  uploadedBy: "Victor Mezhvinsky", tradeId: "div-23" },
        { id: "rw-bid-9",  name: "Northwest HVAC Co - bid.pdf",          size: "224 KB", uploaded: "May 5, 2026",  uploadedBy: "Victor Mezhvinsky", tradeId: "div-23" },
        { id: "rw-bid-10", name: "Stark Electric Inc - bid.pdf",         size: "212 KB", uploaded: "May 4, 2026",  uploadedBy: "Sam Lee",    tradeId: "div-26" },
        { id: "rw-bid-11", name: "Cascade Power & Light - bid.pdf",      size: "188 KB", uploaded: "May 4, 2026",  uploadedBy: "Sam Lee",    tradeId: "div-26" },
        { id: "rw-bid-12", name: "Greenline Electric - bid.pdf",         size: "176 KB", uploaded: "May 4, 2026",  uploadedBy: "Sam Lee",    tradeId: "div-26" },
        { id: "rw-bid-13", name: "Pacific Aquatics - pool tank bid.pdf", size: "412 KB", uploaded: "May 5, 2026",  uploadedBy: "Victor Mezhvinsky", tradeId: "div-13" },
        { id: "rw-bid-14", name: "Aquatic Edge - pool systems.pdf",      size: "388 KB", uploaded: "May 5, 2026",  uploadedBy: "Victor Mezhvinsky", tradeId: "div-13" },
      ]
    },
    "rivergrove": {
      trades: [
        { id: "div-09", division: "09", name: "Finishes" },
        { id: "div-22", division: "22", name: "Plumbing" },
        { id: "div-26", division: "26", name: "Electrical" },
      ],
      files: [
        { id: "rg-bid-1", name: "Northwest Drywall Co - bid.pdf",       size: "182 KB", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", tradeId: "div-09" },
        { id: "rg-bid-2", name: "Pinnacle Interiors - bid.pdf",         size: "204 KB", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", tradeId: "div-09" },
        { id: "rg-bid-3", name: "Apex Finishes Group - bid.xlsx",       size: "94 KB",  uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", tradeId: "div-09" },
        { id: "rg-bid-4", name: "Cascade Wall Systems - bid.pdf",       size: "172 KB", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", tradeId: "div-09" },
        { id: "rg-bid-5", name: "ThermalTech Solutions - plumbing.pdf", size: "198 KB", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", tradeId: "div-22" },
        { id: "rg-bid-6", name: "Stark Electric Inc - bid.pdf",         size: "212 KB", uploaded: "Apr 20, 2026", uploadedBy: "Sam Lee", tradeId: "div-26" },
      ]
    },
    "mercy-clinic": {
      trades: [
        { id: "div-09", division: "09", name: "Finishes" },
        { id: "div-22", division: "22", name: "Plumbing" },
        { id: "div-23", division: "23", name: "HVAC" },
      ],
      files: [
        { id: "mc-bid-1", name: "Northwest Drywall Co - fit-out bid.pdf", size: "164 KB", uploaded: "May 2, 2026", uploadedBy: "Sam Lee",    tradeId: "div-09" },
        { id: "mc-bid-2", name: "Apex Mechanical - HVAC bid.xlsx",        size: "110 KB", uploaded: "May 2, 2026", uploadedBy: "Victor Mezhvinsky", tradeId: "div-23" },
        { id: "mc-bid-3", name: "Summit Plumbing - bid.pdf",              size: "176 KB", uploaded: "May 2, 2026", uploadedBy: "Victor Mezhvinsky", tradeId: "div-22" },
      ]
    },
    "bayside": {
      trades: [
        { id: "div-03", division: "03", name: "Concrete" },
        { id: "div-05", division: "05", name: "Metals" },
        { id: "div-26", division: "26", name: "Electrical" },
      ],
      files: [
        { id: "bs-bid-1", name: "Riverview Concrete - bid.pdf",    size: "228 KB", uploaded: "Mar 20, 2026", uploadedBy: "Victor Mezhvinsky", tradeId: "div-03" },
        { id: "bs-bid-2", name: "Cascade Steel Erectors - bid.pdf", size: "244 KB", uploaded: "Mar 20, 2026", uploadedBy: "Victor Mezhvinsky", tradeId: "div-05" },
        { id: "bs-bid-3", name: "Stark Electric Inc - warehouse.pdf", size: "212 KB", uploaded: "Mar 20, 2026", uploadedBy: "Sam Lee", tradeId: "div-26" },
      ]
    },
    "westlake": { trades: [], files: [] },
    "emerson-tower": { trades: [], files: [] },
  },

  // Bid Leveling sessions per project — each entry is one run of the skill,
  // surfaced in the Project Home "Bid Tracker" tab. Clicking revisits the
  // Bid Level Analysis result screen.
  bidSessions: {
    "rec-wellness": [
      { id: "sess-rw-3", date: "May 5, 2026",  division: "Division 26", trade: "Electrical",  winner: "Stark Electric Inc.",  amount: "$502,400", savings: "$26,500", subs: 3, spread: "8.5%",  when: "2h ago" },
      { id: "sess-rw-2", date: "May 2, 2026",  division: "Division 22", trade: "Plumbing",    winner: "ThermalTech Solutions", amount: "$369,800", savings: "$42,200", subs: 4, spread: "11.4%", when: "3d ago" },
      { id: "sess-rw-1", date: "Apr 28, 2026", division: "Division 09", trade: "Finishes",    winner: "Pinnacle Interiors LLC", amount: "$384,720", savings: "$66,380", subs: 4, spread: "17.3%", when: "1w ago" },
    ],
    "rivergrove": [
      { id: "sess-rg-2", date: "Apr 20, 2026", division: "Division 22", trade: "Plumbing", winner: "ThermalTech Solutions",  amount: "$369,800", savings: "$42,200", subs: 4, spread: "11.4%", when: "yesterday" },
      { id: "sess-rg-1", date: "Apr 18, 2026", division: "Division 09", trade: "Finishes", winner: "Pinnacle Interiors LLC", amount: "$384,720", savings: "$66,380", subs: 4, spread: "17.3%", when: "3d ago" },
    ],
    "mercy-clinic": [
      { id: "sess-mc-1", date: "May 2, 2026", division: "Division 23", trade: "HVAC", winner: "Apex Mechanical", amount: "$214,500", savings: "$18,900", subs: 3, spread: "9.8%", when: "5d ago" },
    ],
    "bayside": [
      { id: "sess-bs-1", date: "Mar 15, 2026", division: "Division 05", trade: "Metals", winner: "Cascade Steel Erectors", amount: "$612,000", savings: "$54,000", subs: 3, spread: "10.2%", when: "2w ago" },
    ],
    "westlake": [],
    "emerson-tower": [],
  },

  // Master sheets — every plan-view sheet in the project that has a
  // reconciled overlay available. Used by the Master Floorplan picker on
  // the Drawings tab. Each row: { id (sheet number), label, subtitle,
  // template (which base + overlay pattern to render: "L1" | "L2" | "RCP") }.
  masterSheetsByProject: {
    "rec-wellness": [
      // Architectural general
      { id: "A-001", label: "Site plan",             subtitle: "Riverside Ave site + landscape",     template: "L1" },
      { id: "A-100", label: "Overall Level 1",       subtitle: "Full building footprint",            template: "L1" },
      { id: "A-101", label: "Level 1 floor plan",    subtitle: "Aquatic center + lobby",             template: "L1" },
      { id: "A-102", label: "Level 2 floor plan",    subtitle: "Offices + fitness studios",          template: "L2" },
      { id: "A-103", label: "Roof plan",             subtitle: "Roof drainage + mech equipment",     template: "L1" },
      { id: "A-104", label: "Site landscape",        subtitle: "Planting + hardscape",               template: "L1" },
      // Enlarged plans
      { id: "A-110", label: "Enlarged — Lobby",             subtitle: "Level 1 lobby detail",         template: "L1" },
      { id: "A-111", label: "Enlarged — Aquatic Center",    subtitle: "Pool + deck detail",           template: "L1" },
      { id: "A-112", label: "Enlarged — Men's Lockers",     subtitle: "Level 1 locker room detail",   template: "L1" },
      { id: "A-113", label: "Enlarged — Women's Lockers",   subtitle: "Level 1 locker room detail",   template: "L1" },
      { id: "A-114", label: "Enlarged — Pool Deck",         subtitle: "Deck slope + drains",          template: "L1" },
      { id: "A-115", label: "Enlarged — Mech Room",         subtitle: "Level 1 equipment layout",     template: "L1" },
      { id: "A-120", label: "Enlarged — Studios",           subtitle: "Studios A & B detail",         template: "L2" },
      { id: "A-121", label: "Enlarged — Offices",           subtitle: "201–203 open-office layout",   template: "L2" },
      { id: "A-122", label: "Enlarged — Conference",        subtitle: "Level 2 conf + huddle rooms",  template: "L2" },
      // RCPs
      { id: "A-301", label: "RCP — Lobby",                  subtitle: "Coffered ceiling grid",         template: "RCP" },
      { id: "A-302", label: "RCP — Aquatic Center",         subtitle: "Exposed structure ceiling",     template: "RCP" },
      { id: "A-303", label: "RCP — Level 1 Circulation",    subtitle: "Corridor + support spaces",     template: "RCP" },
      { id: "A-304", label: "RCP — Level 2",                subtitle: "Office + studio ceilings",      template: "RCP" },
      { id: "A-305", label: "RCP — Studios",                subtitle: "Acoustic tile + speakers",      template: "RCP" },
      { id: "A-306", label: "RCP — Offices",                subtitle: "Suspended grid layout",         template: "RCP" },
      // Structural
      { id: "S-101", label: "Foundation plan",             subtitle: "Slab on grade + footings",       template: "L1" },
      { id: "S-102", label: "Level 1 framing",             subtitle: "Beam + column schedule",         template: "L1" },
      { id: "S-103", label: "Level 2 framing",             subtitle: "Composite deck framing",         template: "L2" },
      { id: "S-104", label: "Roof framing",                subtitle: "Bar joists + bracing",           template: "L1" },
      // Mechanical
      { id: "M-201", label: "HVAC — Level 1",              subtitle: "Ducting + diffusers",            template: "L1" },
      { id: "M-202", label: "HVAC — Level 2",              subtitle: "VAV + terminal units",           template: "L2" },
      { id: "M-203", label: "HVAC — Pool",                 subtitle: "Dedicated dehumidification",     template: "L1" },
      // Electrical
      { id: "E-101", label: "Power — Level 1",             subtitle: "Circuits + panelboards",         template: "L1" },
      { id: "E-102", label: "Power — Level 2",             subtitle: "Office receptacles + branches",  template: "L2" },
      { id: "E-201", label: "Lighting — Level 1",          subtitle: "Fixture schedule + controls",    template: "L1" },
      { id: "E-202", label: "Lighting — Level 2",          subtitle: "Occupancy sensing",              template: "L2" },
      // Plumbing
      { id: "P-101", label: "Plumbing — Level 1",          subtitle: "Waste + vent + water",           template: "L1" },
      { id: "P-102", label: "Plumbing — Level 2",          subtitle: "Restroom risers",                template: "L2" },
      { id: "P-201", label: "Pool plumbing",               subtitle: "Filtration + returns",           template: "L1" },
      // Fire protection
      { id: "FP-101", label: "Sprinkler — Level 1",        subtitle: "Wet system + heads",             template: "L1" },
      { id: "FP-102", label: "Sprinkler — Level 2",        subtitle: "Concealed head layout",          template: "L2" },
    ],
  },

  // Per-project quantity takeoff dataset. This is the structured source of
  // truth that downstream skills (ROM, Bid Level, RFC) draw from. Each row
  // is one line item with the full provenance trail attached (sheet refs,
  // spec section, revision, AI confidence + notes, cost code, benchmark).
  takeoffsByProject: {
    "rec-wellness": [
      { id: "to-1",  item: "Cast-in-place concrete, 4000 PSI",       trade: "Concrete",            division: "03", qty: 1840,  unit: "CY",  assembly: "B1010 Slab on grade",      building: "Main",   level: "L1",    room: "Pool deck / lobby",   sourceDrawing: "S-101", detail: "3/S-101",  spec: "03 30 00", revision: "Rev 4", confidence: "high", confidenceScore: 0.94, aiNotes: "Quantities reconciled with structural sheets; haunch depths assumed per spec.", costCode: "03-30-00-100", benchmark: "$198/CY · within PNW range" },
      { id: "to-2",  item: "Reinforcing steel, grade 60",            trade: "Concrete",            division: "03", qty: 92000, unit: "LB",  assembly: "B1010 Slab on grade",      building: "Main",   level: "L1",    room: "Slabs + walls",       sourceDrawing: "S-101", detail: "5/S-201",  spec: "03 20 00", revision: "Rev 4", confidence: "high", confidenceScore: 0.91, aiNotes: "Pulled from rebar schedule + slab plan; lap lengths per detail.", costCode: "03-20-00-100", benchmark: "$0.92/LB · within range" },
      { id: "to-3",  item: "Concrete finishing, broom & seal",       trade: "Concrete",            division: "03", qty: 36400, unit: "SF",  assembly: "B1010 Slab on grade",      building: "Main",   level: "L1",    room: "Pool deck",           sourceDrawing: "A-101", detail: "2/A-301",  spec: "03 35 00", revision: "Rev 4", confidence: "med",  confidenceScore: 0.78, aiNotes: "Sealant type not yet specified; assumed Sika Sikafloor.",                  costCode: "03-35-00-200", benchmark: "$0.95/SF · slightly above" },
      { id: "to-4",  item: "CMU partition, 8\" lightweight",         trade: "Masonry",             division: "04", qty: 4200,  unit: "SF",  assembly: "C1020 Interior partitions", building: "Main",   level: "L1",    room: "Mechanical rooms",    sourceDrawing: "A-201", detail: "1/A-501",  spec: "04 22 00", revision: "Rev 3", confidence: "high", confidenceScore: 0.92, aiNotes: "Includes bond beams and rebar reinforcing per detail 1/A-501.",            costCode: "04-22-00-100", benchmark: "$18.40/SF · within range" },
      { id: "to-5",  item: "Structural steel, W-shapes",             trade: "Metals",              division: "05", qty: 142,   unit: "TN",  assembly: "B1020 Roof construction",  building: "Main",   level: "Roof",  room: "Aquatic center bay",  sourceDrawing: "S-101", detail: "2/S-101",  spec: "05 12 00", revision: "Rev 4", confidence: "high", confidenceScore: 0.93, aiNotes: "Includes shop primer; field paint not in this line.",                       costCode: "05-12-00-100", benchmark: "$2,890/TN · above benchmark by 4%" },
      { id: "to-6",  item: "Steel deck, 3\" composite",              trade: "Metals",              division: "05", qty: 38400, unit: "SF",  assembly: "B1020 Roof construction",  building: "Main",   level: "Roof",  room: "—",                    sourceDrawing: "S-101", detail: "4/S-101",  spec: "05 31 00", revision: "Rev 4", confidence: "high", confidenceScore: 0.90, aiNotes: "Gauge inferred from typical detail; verify with engineer.",                 costCode: "05-31-00-100", benchmark: "$4.20/SF · within range" },
      { id: "to-7",  item: "Gypsum wall board, 5/8\" type X",        trade: "Finishes",            division: "09", qty: 38400, unit: "SF",  assembly: "C1010 Interior walls",     building: "Main",   level: "L1+L2", room: "Throughout",           sourceDrawing: "A-201", detail: "—",        spec: "09 29 00", revision: "Rev 4", confidence: "high", confidenceScore: 0.95, aiNotes: "Fire-rated assemblies tagged per UL listings on A-501.",                    costCode: "09-29-00-100", benchmark: "$1.12/SF · within range" },
      { id: "to-8",  item: "Acoustic ceiling tile, 24×24",           trade: "Finishes",            division: "09", qty: 11800, unit: "SF",  assembly: "C3030 Ceiling finishes",   building: "Main",   level: "L1+L2", room: "Lobby + offices",      sourceDrawing: "A-301", detail: "—",        spec: "09 51 13", revision: "Rev 4", confidence: "high", confidenceScore: 0.88, aiNotes: "Grid color and tile type per finish schedule on A-602.",                    costCode: "09-51-00-200", benchmark: "$3.20/SF · within range" },
      { id: "to-9",  item: "Broadloom carpet, 32oz nylon (Shaw Haze)", trade: "Finishes",          division: "09", qty: 14200, unit: "SF",  assembly: "C3020 Floor finishes",     building: "Main",   level: "L1+L2", room: "Lobby + offices",      sourceDrawing: "A-101", detail: "A-102",    spec: "09 68 13", revision: "Rev 4", confidence: "med",  confidenceScore: 0.74, aiNotes: "Unit cost up 22% from county code transport surcharge — review with owner.", costCode: "09-68-00-300", benchmark: "$4.85/SF · above benchmark by 22%" },
      { id: "to-10", item: "Resilient flooring, sheet vinyl",        trade: "Finishes",            division: "09", qty: 8200,  unit: "SF",  assembly: "C3020 Floor finishes",     building: "Main",   level: "L1",    room: "Locker rooms",         sourceDrawing: "A-101", detail: "A-102",    spec: "09 65 00", revision: "Rev 4", confidence: "high", confidenceScore: 0.89, aiNotes: "Heat-welded seams per spec; coved base counted separately.",                costCode: "09-65-00-100", benchmark: "$7.10/SF · within range" },
      { id: "to-11", item: "Storefront glazing, aluminum frame",     trade: "Openings",            division: "08", qty: 3800,  unit: "SF",  assembly: "B2020 Exterior windows",   building: "Main",   level: "L1",    room: "West elevation",       sourceDrawing: "A-201", detail: "3/A-201",  spec: "08 41 00", revision: "Rev 4", confidence: "high", confidenceScore: 0.86, aiNotes: "Updated glazing area on west elevation in Rev 4 (+220 SF).",                costCode: "08-41-00-100", benchmark: "$78/SF · within range" },
      { id: "to-12", item: "Wood doors, solid core, paint grade",    trade: "Openings",            division: "08", qty: 84,    unit: "EA",  assembly: "C1030 Interior doors",     building: "Main",   level: "L1+L2", room: "Throughout",           sourceDrawing: "A-201", detail: "Door schedule", spec: "08 14 16", revision: "Rev 4", confidence: "high", confidenceScore: 0.96, aiNotes: "Counted from door schedule on A-601; hardware sets separate.",              costCode: "08-14-00-100", benchmark: "$640/EA · within range" },
      { id: "to-13", item: "Pool tank, gunite, 25m × 8 lane",        trade: "Special Construction", division: "13", qty: 1,    unit: "LS",  assembly: "F1040 Special facilities", building: "Pool", level: "L1",    room: "Competition pool",     sourceDrawing: "A-201", detail: "2/A-202",  spec: "13 11 13", revision: "Rev 4", confidence: "low",  confidenceScore: 0.62, aiNotes: "$384k lump sum sits 18% above PNW benchmark; recommend breakdown to trade lines.", costCode: "13-11-00-100", benchmark: "$326k (Beaverton Aquatic) · +18%" },
      { id: "to-14", item: "Pool filtration & circulation system",   trade: "Special Construction", division: "13", qty: 1,    unit: "LS",  assembly: "F1040 Special facilities", building: "Pool", level: "L1",    room: "Equipment room",       sourceDrawing: "M-201", detail: "—",        spec: "13 11 23", revision: "Rev 4", confidence: "med",  confidenceScore: 0.81, aiNotes: "Pump model inferred from typical 25m installations; verify with mech engineer.", costCode: "13-11-00-200", benchmark: "$92k · within range" },
      { id: "to-15", item: "Pool deck finish, slip-resistant",       trade: "Special Construction", division: "13", qty: 4200, unit: "SF",  assembly: "F1040 Special facilities", building: "Pool", level: "L1",    room: "Pool surround",        sourceDrawing: "A-101", detail: "4/A-301",  spec: "09 65 19", revision: "Rev 4", confidence: "high", confidenceScore: 0.87, aiNotes: "Coefficient of friction per spec section 09 65 19.2.B.",                     costCode: "09-65-00-400", benchmark: "$11.95/SF · within range" }
    ]
  },

  // Per-project labor rate overrides. When a project has an entry here, those
  // rows override the global laborRates; otherwise the project inherits global.
  laborRatesByProject: {
    "rec-wellness": [
      { trade: "Project Manager",     rate: 148, fringe: 0.42, region: "PDX metro", overridden: true, editedBy: "Victor Mezhvinsky", editedAt: "May 8, 2026" },
      { trade: "Superintendent",      rate: 122, fringe: 0.42, region: "PDX metro", overridden: true, editedBy: "Victor Mezhvinsky", editedAt: "May 8, 2026" },
      { trade: "Carpenter, Journey",  rate: 74,  fringe: 0.58, region: "PDX metro", overridden: true, editedBy: "Victor Mezhvinsky", editedAt: "May 9, 2026" },
    ],
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
          { name: "Domestic water: copper rough-in", values: [62400, 68200, 71400, 78900] },
          { name: "Sanitary drainage: DWV", values: [54200, 56800, 59100, 64400] },
          { name: "Storm drainage: interior roof drains", values: [38600, 41200, 43800, 47200] },
          { name: "Fixtures: WC, lavatory, urinals", values: [98400, 99800, 104200, 108600], note: "Spec match across all bidders" },
          { name: "Water heaters & circulation", values: [42500, 45200, 47800, 51000] },
          { name: "Pool make-up & filtration tie-in", values: [62500, 54800, 53300, 47300], note: "Scope varies; see qualification log" }
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
          { name: "Lighting fixtures: interior", values: [98400, 94100, 102300] },
          { name: "Lighting fixtures: pool & exterior", values: [54200, 52500, 53000] },
          { name: "GFCI & life-safety devices", values: [0, 0, 0], excluded: [true, true, true], note: "All bidders exclude as qualified scope" }
        ],
        spread: 8.5,
        exclusions: 3,
        recommendedNote: "Best price-to-completeness"
      }
    ]
  },

  // Drawings (with AI takeoff markups) — keyed by sheet code
  drawings: [
    { id: "A-101", title: "Level 1 floor plan",       sheetType: "Floor Plan",              scale: "1/8\" = 1'-0\"",  markups: 47, status: "done",    thumb: "level1", color: "#E84600", trade: "Architectural", views: 184, planOrder: 12 },
    { id: "A-102", title: "Level 2 floor plan",       sheetType: "Floor Plan",              scale: "1/8\" = 1'-0\"",  markups: 38, status: "done",    thumb: "level2", color: "#48C1B5", trade: "Architectural", views: 142, planOrder: 13 },
    { id: "A-201", title: "Building elevations",      sheetType: "Elevation",               scale: "1/8\" = 1'-0\"",  markups: 24, status: "done",    thumb: "elev",   color: "#B600E9", trade: "Architectural", views: 96,  planOrder: 18 },
    { id: "A-301", title: "Reflected ceiling: Lobby", sheetType: "Reflected Ceiling Plan",  scale: "1/4\" = 1'-0\"",  markups: 12, status: "flagged", thumb: "rcp",    color: "#FFBD15", trade: "Architectural", views: 211, planOrder: 24 },
    { id: "S-101", title: "Foundation plan",          sheetType: "Foundation Plan",         scale: "1/8\" = 1'-0\"",  markups: 18, status: "done",    thumb: "level1", color: "#48C1B5", trade: "Structural",    views: 88,  planOrder: 31 },
    { id: "M-201", title: "HVAC level 1",             sheetType: "HVAC Plan",               scale: "1/8\" = 1'-0\"",  markups: 22, status: "done",    thumb: "rcp",    color: "#FFBD15", trade: "Mechanical",    views: 64,  planOrder: 42 },
    { id: "E-101", title: "Power plan, level 1",      sheetType: "Power Plan",              scale: "1/8\" = 1'-0\"",  markups: 31, status: "done",    thumb: "level2", color: "#B600E9", trade: "Electrical",    views: 128, planOrder: 51 },
    { id: "P-101", title: "Plumbing: pool deck",      sheetType: "Plumbing Plan",           scale: "1/4\" = 1'-0\"",  markups: 9,  status: "flagged", thumb: "elev",   color: "#E84600", trade: "Plumbing",      views: 73,  planOrder: 58 }
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
      sheetTitle: "A-101: Level 1 floor plan",
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
      sheetTitle: "A-102: Level 2 floor plan",
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
      sheetTitle: "A-201: Building elevations",
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
      sheetTitle: "A-301: Reflected ceiling, Lobby",
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
      sheetTitle: "S-101: Foundation plan",
      groups: [
        { code: "03", name: "Concrete", items: [
          { id: "t-S101-1", material: "Spread footings, 4000 PSI",      desc: "F1.0 through F4.0",             qty: 240, unit: "CY", hotspot: { x: 14, y: 14, w: 172, h: 122 } },
          { id: "t-S101-2", material: "Reinforcing steel, grade 60",    desc: "Mat reinforcement",             qty: 28000, unit: "LB", hotspot: { x: 14, y: 14, w: 172, h: 122 } },
          { id: "t-S101-3", material: "Anchor bolts, 3/4\" × 18\"",     desc: "At perimeter columns",          qty: 86, unit: "EA", hotspot: { x: 14, y: 14, w: 172, h: 1 } }
        ]}
      ]
    },
    "M-201": {
      sheetTitle: "M-201: HVAC level 1",
      groups: [
        { code: "23", name: "HVAC", items: [
          { id: "t-M201-1", material: "Rooftop air handling unit, 25-ton", desc: "AHU-1, AHU-2",                  qty: 2, unit: "EA", hotspot: { x: 80, y: 64, w: 22, h: 22 } },
          { id: "t-M201-2", material: "Galvanized rectangular duct",       desc: "Supply mains",                  qty: 2400, unit: "LB", hotspot: { x: 14, y: 74, w: 172, h: 1 } },
          { id: "t-M201-3", material: "VAV terminal box w/ reheat",        desc: "Zone-level units",              qty: 18, unit: "EA", hotspot: { x: 36, y: 34, w: 132, h: 80 } }
        ]}
      ]
    },
    "E-101": {
      sheetTitle: "E-101: Power plan, level 1",
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
      sheetTitle: "P-101: Plumbing, pool deck",
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
    { trade: "Foreman: Carpenter",   rate: 86,  fringe: 0.55, region: "PDX metro" },
    { trade: "Carpenter, Journey",    rate: 72,  fringe: 0.58, region: "PDX metro" },
    { trade: "Drywall, Journey",      rate: 64,  fringe: 0.54, region: "PDX metro" },
    { trade: "Painter, Journey",      rate: 58,  fringe: 0.50, region: "PDX metro" },
    { trade: "Electrician, JIW",      rate: 84,  fringe: 0.62, region: "PDX metro" },
    { trade: "Plumber, JIW",          rate: 88,  fringe: 0.61, region: "PDX metro" },
    { trade: "Sheet Metal, JIW",      rate: 78,  fringe: 0.58, region: "PDX metro" },
    { trade: "Laborer, Group 1",      rate: 48,  fringe: 0.48, region: "PDX metro" }
  ]
};
