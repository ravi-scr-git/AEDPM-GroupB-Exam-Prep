/* AEDPM Group-B Exam Preparation App - Interactive Mind Maps & Design Flows */

window.AEDPM_MINDMAPS = [
  {
    id: "flow_os_memory",
    title: "OS Process Memory Map & Address Space Layout",
    category: "Technical: Operating Systems",
    description: "Detailed memory map showing the virtual address space layout of a 32-bit / 64-bit user process in Unix/Linux and Windows.",
    type: "memory_map",
    svg: `
    <svg viewBox="0 0 850 560" class="flow-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gKernel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b91c1c"/><stop offset="1%" stop-color="#7f1d1d"/></linearGradient>
        <linearGradient id="gStack" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d97706"/><stop offset="1%" stop-color="#b45309"/></linearGradient>
        <linearGradient id="gMmap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="1%" stop-color="#0369a1"/></linearGradient>
        <linearGradient id="gHeap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#16a34a"/><stop offset="1%" stop-color="#15803d"/></linearGradient>
        <linearGradient id="gBss" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6b7280"/><stop offset="1%" stop-color="#4b5563"/></linearGradient>
        <linearGradient id="gData" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4f46e5"/><stop offset="1%" stop-color="#3730a3"/></linearGradient>
        <linearGradient id="gText" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#059669"/><stop offset="1%" stop-color="#047857"/></linearGradient>
      </defs>

      <!-- Background -->
      <rect width="850" height="560" fill="#1e293b" rx="12"/>
      
      <!-- Address labels Left -->
      <text x="50" y="45" fill="#f87171" font-family="monospace" font-size="13" font-weight="bold">0xFFFFFFFF (Top of 32-bit Address Space)</text>
      <text x="50" y="110" fill="#cbd5e1" font-family="monospace" font-size="12">0xC0000000 (3GB Boundary)</text>
      <text x="50" y="175" fill="#f59e0b" font-family="monospace" font-size="12">Top of User Stack (%esp / %rsp)</text>
      <text x="50" y="275" fill="#38bdf8" font-family="monospace" font-size="12">mmap() Shared Libraries (libc.so / DLLs)</text>
      <text x="50" y="360" fill="#4ade80" font-family="monospace" font-size="12">Program Break (brk / sbrk)</text>
      <text x="50" y="420" fill="#94a3b8" font-family="monospace" font-size="12">BSS Segment (Uninitialized Data)</text>
      <text x="50" y="470" fill="#818cf8" font-family="monospace" font-size="12">Data Segment (Initialized Globals)</text>
      <text x="50" y="520" fill="#34d399" font-family="monospace" font-size="12">Text Segment (Machine Code)</text>
      <text x="50" y="545" fill="#cbd5e1" font-family="monospace" font-size="13" font-weight="bold">0x00000000 (Bottom of Address Space)</text>

      <!-- Memory Layout Box -->
      <g transform="translate(360, 25)">
        <!-- Kernel -->
        <rect x="0" y="0" width="450" height="75" fill="url(#gKernel)" rx="6"/>
        <text x="225" y="32" fill="#fff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">KERNEL SPACE (1 GB)</text>
        <text x="225" y="55" fill="#fca5a5" font-family="sans-serif" font-size="12" text-anchor="middle">Page Tables, Device Drivers, Process Control Blocks (PCB)</text>

        <!-- User Stack -->
        <rect x="0" y="85" width="450" height="75" fill="url(#gStack)" rx="6"/>
        <text x="225" y="118" fill="#fff" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">USER STACK (Grows Downward ▼)</text>
        <text x="225" y="140" fill="#fde68a" font-family="sans-serif" font-size="12" text-anchor="middle">Local variables, function call frames, return addresses, arguments</text>

        <!-- Unallocated Gap -->
        <rect x="0" y="165" width="450" height="40" fill="#0f172a" stroke="#334155" stroke-dasharray="4 4" rx="4"/>
        <text x="225" y="190" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">▲ Dynamic Growth Space ▼</text>

        <!-- Memory Mapping Segment -->
        <rect x="0" y="210" width="450" height="55" fill="url(#gMmap)" rx="6"/>
        <text x="225" y="238" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">MEMORY MAPPING SEGMENT (mmap)</text>
        <text x="225" y="255" fill="#bae6fd" font-family="sans-serif" font-size="11" text-anchor="middle">Shared memory, dynamic linked libraries (libc.so, kernel32.dll)</text>

        <!-- Heap -->
        <rect x="0" y="270" width="450" height="70" fill="url(#gHeap)" rx="6"/>
        <text x="225" y="302" fill="#fff" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">RUNTIME HEAP (Grows Upward ▲)</text>
        <text x="225" y="324" fill="#bbf7d0" font-family="sans-serif" font-size="12" text-anchor="middle">Dynamic memory allocation: malloc(), calloc(), realloc(), C++ new</text>

        <!-- BSS Segment -->
        <rect x="0" y="345" width="450" height="45" fill="url(#gBss)" rx="6"/>
        <text x="225" y="367" fill="#fff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">BSS SEGMENT (Block Started by Symbol)</text>
        <text x="225" y="382" fill="#e2e8f0" font-family="sans-serif" font-size="11" text-anchor="middle">Uninitialized global & static variables (automatically zeroed by OS)</text>

        <!-- Data Segment -->
        <rect x="0" y="395" width="450" height="50" fill="url(#gData)" rx="6"/>
        <text x="225" y="420" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">INITIALIZED DATA SEGMENT</text>
        <text x="225" y="435" fill="#c7d2fe" font-family="sans-serif" font-size="11" text-anchor="middle">Global & static variables initialized explicitly in source code</text>

        <!-- Text Segment -->
        <rect x="0" y="450" width="450" height="50" fill="url(#gText)" rx="6"/>
        <text x="225" y="475" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">TEXT SEGMENT (Executable Binary Code)</text>
        <text x="225" y="490" fill="#a7f3d0" font-family="sans-serif" font-size="11" text-anchor="middle">Read-Only assembly instructions shared across multiple process instances</text>
      </g>
    </svg>
    `,
    details: [
      "Text Segment: Stored in read-only pages to prevent accidental self-modifying code and allow safe memory sharing across forks.",
      "Data Segment: Contains explicit initialized global/static variables (e.g. `int count = 100;`).",
      "BSS Segment: Zero-initialized upon process exec. Does not consume physical disk space in the ELF binary.",
      "Heap: Managed by runtime memory allocator (glibc ptmalloc, jemalloc, tcmalloc). Managed via `brk()` and `mmap()` syscalls.",
      "Stack: Automatically managed by CPU call/ret instructions. Exceeding stack limits triggers Stack Overflow (SIGSEGV)."
    ]
  },
  {
    id: "flow_cpu_memory_hierarchy",
    title: "Computer Memory & Storage Hierarchy Map",
    category: "Technical: Computer Architecture",
    description: "Visual hierarchy showing capacity, access latency, bandwidth, and cost-per-bit from CPU registers to cold storage.",
    type: "hierarchy_map",
    svg: `
    <svg viewBox="0 0 850 520" class="flow-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="850" height="520" fill="#0f172a" rx="12"/>
      
      <!-- Pyramid Layers -->
      <!-- Tier 1: Registers -->
      <polygon points="425,30 360,95 490,95" fill="#dc2626"/>
      <text x="425" y="70" fill="#fff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">CPU REGISTERS</text>
      <text x="425" y="85" fill="#fecaca" font-family="monospace" font-size="10" text-anchor="middle">&lt; 1 KB | ~0.5 ns</text>

      <!-- Tier 2: L1/L2/L3 Cache -->
      <polygon points="355,100 495,100 540,175 310,175" fill="#ea580c"/>
      <text x="425" y="132" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">ON-CHIP SRAM CACHE (L1, L2, L3)</text>
      <text x="425" y="152" fill="#ffedd5" font-family="monospace" font-size="11" text-anchor="middle">L1: 32-64KB (~1ns) | L2: 1MB (~4ns) | L3: 32-64MB (~15ns)</text>

      <!-- Tier 3: Main Memory RAM -->
      <polygon points="305,180 545,180 600,265 250,265" fill="#d97706"/>
      <text x="425" y="215" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">MAIN MEMORY: DDR4 / DDR5 DRAM</text>
      <text x="425" y="235" fill="#fef3c7" font-family="monospace" font-size="11" text-anchor="middle">16 GB - 512 GB | 50 - 80 ns latency | 50-100 GB/s bandwidth</text>

      <!-- Tier 4: NVMe SSD -->
      <polygon points="245,270 605,270 665,360 185,360" fill="#0284c7"/>
      <text x="425" y="307" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">SOLID STATE DRIVES (NVMe PCIe Gen 4/5 SSD)</text>
      <text x="425" y="327" fill="#e0f2fe" font-family="monospace" font-size="11" text-anchor="middle">1 TB - 16 TB | 10 - 50 µs latency | 7,000 MB/s read</text>

      <!-- Tier 5: Hard Disk Drive -->
      <polygon points="180,365 670,365 735,445 115,445" fill="#4338ca"/>
      <text x="425" y="397" fill="#fff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">MAGNETIC HARD DISK DRIVES (HDD - SAS/SATA)</text>
      <text x="425" y="417" fill="#e0e7ff" font-family="monospace" font-size="11" text-anchor="middle">4 TB - 24 TB | 5 - 10 ms seek latency | 250 MB/s</text>

      <!-- Tier 6: Tape Storage -->
      <polygon points="110,450 740,450 790,505 60,505" fill="#374151"/>
      <text x="425" y="475" fill="#fff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">COLD ARCHIVAL: LTO MAGNETIC TAPE / CLOUD GLACIER</text>
      <text x="425" y="492" fill="#d1d5db" font-family="monospace" font-size="10" text-anchor="middle">Petabytes | Seconds to Minutes mount time | Lowest cost per TB</text>

      <!-- Side Indicators -->
      <line x1="60" y1="40" x2="60" y2="440" stroke="#f43f5e" stroke-width="3" marker-end="url(#arrow)"/>
      <text x="75" y="240" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="bold" transform="rotate(-90 75 240)">▲ HIGHER SPEED &amp; COST PER BIT</text>

      <line x1="790" y1="40" x2="790" y2="440" stroke="#10b981" stroke-width="3"/>
      <text x="805" y="240" fill="#10b981" font-family="sans-serif" font-size="13" font-weight="bold" transform="rotate(90 805 240)">▼ HIGHER CAPACITY &amp; PERSISTENCE</text>
    </svg>
    `,
    details: [
      "Access speed differences are immense: CPU register access is 100,000,000 times faster than a mechanical hard drive seek!",
      "Locality of Reference: Temporal Locality (accessed data will be accessed again soon) and Spatial Locality (adjacent data will be accessed soon) make caches effective.",
      "Cache Miss Penalties: L1 miss falls to L2, L2 miss falls to L3, L3 miss incurs a severe 50-80ns DRAM bus stall."
    ]
  },
  {
    id: "flow_railway_prs_architecture",
    title: "Indian Railways PRS (CONCERT) & Enterprise Flow",
    category: "Indian Railways IT: Enterprise Architecture",
    description: "End-to-end multi-tier architecture of the Passenger Reservation System (CONCERT), IRCTC web gateway, and terminal stations.",
    type: "system_architecture",
    svg: `
    <svg viewBox="0 0 850 540" class="flow-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="850" height="540" fill="#111827" rx="12"/>

      <!-- Title -->
      <text x="425" y="32" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">CRIS CONCERT (PRS) ENTERPRISE ARCHITECTURE</text>

      <!-- Client Tier -->
      <g transform="translate(40, 60)">
        <rect x="0" y="0" width="770" height="70" fill="#1f2937" stroke="#374151" rx="8"/>
        <text x="385" y="25" fill="#f3f4f6" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">CLIENT &amp; ACCESS CHANNELS TIER</text>
        <rect x="20" y="35" width="160" height="25" fill="#2563eb" rx="4"/>
        <text x="100" y="52" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Station PRS Counters</text>
        <rect x="210" y="35" width="160" height="25" fill="#2563eb" rx="4"/>
        <text x="290" y="52" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">IRCTC Web &amp; Mobile</text>
        <rect x="400" y="35" width="160" height="25" fill="#2563eb" rx="4"/>
        <text x="480" y="52" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Post Offices / YTSK Agents</text>
        <rect x="590" y="35" width="160" height="25" fill="#2563eb" rx="4"/>
        <text x="670" y="52" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">TTE Handhelds (HHT)</text>
      </g>

      <!-- Network / Security Tier -->
      <g transform="translate(40, 150)">
        <rect x="0" y="0" width="770" height="60" fill="#1e1b4b" stroke="#4338ca" rx="8"/>
        <text x="385" y="22" fill="#a5b4fc" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SECURE INGRESS &amp; HIGH CONCURRENCY MANAGEMENT</text>
        <text x="385" y="44" fill="#e0e7ff" font-family="monospace" font-size="11" text-anchor="middle">Anti-DDoS Scrubbing ➔ WAF ➔ F5 BIG-IP Load Balancers (SSL Offloading &amp; Rate Limiting)</text>
      </g>

      <!-- Application Tier -->
      <g transform="translate(40, 230)">
        <rect x="0" y="0" width="770" height="110" fill="#064e3b" stroke="#059669" rx="8"/>
        <text x="385" y="24" fill="#6ee7b7" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">APPLICATION PROCESSING &amp; BUSINESS LOGIC TIER</text>
        
        <rect x="30" y="40" width="220" height="55" fill="#047857" rx="6"/>
        <text x="140" y="62" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CONCERT Core Engine</text>
        <text x="140" y="80" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">Train schedule, quota rules, fares</text>

        <rect x="275" y="40" width="220" height="55" fill="#047857" rx="6"/>
        <text x="385" y="62" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Waitlist &amp; Charting Engine</text>
        <text x="385" y="80" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">RAC/WL churning, 4-hr chart release</text>

        <rect x="520" y="40" width="220" height="55" fill="#047857" rx="6"/>
        <text x="630" y="62" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Payment &amp; Refund Gateways</text>
        <text x="630" y="80" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">UPI, Net Banking, instant refunds</text>
      </g>

      <!-- Database Tier -->
      <g transform="translate(40, 360)">
        <rect x="0" y="0" width="770" height="95" fill="#451a03" stroke="#b45309" rx="8"/>
        <text x="385" y="24" fill="#fcd34d" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">ENTERPRISE CLUSTERED DATABASE TIER (Primary: New Delhi)</text>
        
        <rect x="40" y="40" width="320" height="42" fill="#78350f" rx="6"/>
        <text x="200" y="65" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Oracle RAC Multi-Node Active Cluster</text>

        <rect x="410" y="40" width="320" height="42" fill="#78350f" rx="6"/>
        <text x="570" y="65" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">In-Memory Redis Caching (Seat Inventory)</text>
      </g>

      <!-- DR Tier -->
      <g transform="translate(40, 470)">
        <rect x="0" y="0" width="770" height="50" fill="#1f2937" stroke="#dc2626" rx="6"/>
        <text x="385" y="30" fill="#f87171" font-family="monospace" font-size="12" text-anchor="middle">⇄ Oracle Data Guard Real-Time Sync ➔ DISASTER RECOVERY CENTRE (Secunderabad)</text>
      </g>
    </svg>
    `,
    details: [
      "CONCERT nodes run across major railway geographic centers with synchronized transaction journaling.",
      "During Tatkal window (10:00 AM AC, 11:00 AM Non-AC), concurrency surges to over 30,000 bookings per minute.",
      "Redis caching provides millisecond seat availability checks, protecting backend database transactions."
    ]
  },
  {
    id: "flow_dar_procedure",
    title: "Railway Servants (D&A) Rules 1968: Major vs Minor Penalty Flow",
    category: "Establishment Rules: Disciplinary Procedures",
    description: "Complete statutory procedural flowchart showing SF-11 Minor Penalty vs SF-5 Major Penalty paths, inquiry stages, appeals, and revision.",
    type: "legal_procedure_flow",
    svg: `
    <svg viewBox="0 0 850 540" class="flow-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="850" height="540" fill="#0f172a" rx="12"/>
      <text x="425" y="30" fill="#e2e8f0" font-family="sans-serif" font-size="17" font-weight="bold" text-anchor="middle">RAILWAY SERVANTS (D&amp;A) RULES, 1968 PROCEDURE FLOW</text>

      <!-- Incident / Report -->
      <rect x="275" y="45" width="300" height="40" fill="#334155" stroke="#64748b" rx="6"/>
      <text x="425" y="70" fill="#fff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Vigilance / Safety / Administrative Report</text>

      <!-- Decision Split -->
      <polygon points="425,100 520,135 425,170 330,135" fill="#0284c7"/>
      <text x="425" y="140" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Penalty Choice?</text>

      <!-- Minor Path (Left) -->
      <line x1="330" y1="135" x2="160" y2="135" stroke="#38bdf8" stroke-width="2"/>
      <line x1="160" y1="135" x2="160" y2="175" stroke="#38bdf8" stroke-width="2"/>
      <rect x="40" y="175" width="240" height="45" fill="#0369a1" rx="6"/>
      <text x="160" y="198" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Issue SF-11 (Minor Penalty)</text>
      <text x="160" y="212" fill="#bae6fd" font-family="sans-serif" font-size="10" text-anchor="middle">Charged official given 10 days to reply</text>

      <rect x="40" y="240" width="240" height="50" fill="#0284c7" rx="6"/>
      <text x="160" y="263" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Consider Defense Representation</text>
      <text x="160" y="278" fill="#bae6fd" font-family="sans-serif" font-size="10" text-anchor="middle">Inquiry optional under Rule 11(1)(b)</text>

      <rect x="40" y="310" width="240" height="45" fill="#047857" rx="6"/>
      <text x="160" y="333" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Speaking Order: Impose Minor Penalty</text>
      <text x="160" y="347" fill="#a7f3d0" font-family="sans-serif" font-size="10" text-anchor="middle">Censure, Pass withhold, Withhold Increment</text>

      <!-- Major Path (Right) -->
      <line x1="520" y1="135" x2="680" y2="135" stroke="#f43f5e" stroke-width="2"/>
      <line x1="680" y1="135" x2="680" y2="175" stroke="#f43f5e" stroke-width="2"/>
      <rect x="550" y="175" width="260" height="45" fill="#be123c" rx="6"/>
      <text x="680" y="198" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Issue SF-5 (Major Penalty)</text>
      <text x="680" y="212" fill="#fecdd3" font-family="sans-serif" font-size="10" text-anchor="middle">Articles, Imputations, Documents, Witnesses</text>

      <rect x="550" y="240" width="260" height="50" fill="#9f1239" rx="6"/>
      <text x="680" y="263" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Appoint IO (SF-7) &amp; PO (SF-8)</text>
      <text x="680" y="278" fill="#fecdd3" font-family="sans-serif" font-size="10" text-anchor="middle">Formal inquiry under Rule 9 hearings</text>

      <rect x="550" y="310" width="260" height="45" fill="#881337" rx="6"/>
      <text x="680" y="333" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Serve IO Report (15 Days Representation)</text>
      <text x="680" y="347" fill="#fecdd3" font-family="sans-serif" font-size="10" text-anchor="middle">DA passes Speaking Order (Comp. Ret./Removal)</text>

      <!-- Common Appellate Process Bottom -->
      <g transform="translate(150, 390)">
        <rect x="0" y="0" width="550" height="55" fill="#312e81" stroke="#6366f1" rx="8"/>
        <text x="275" y="25" fill="#fff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">APPELLATE STAGE (Rule 18 to 24)</text>
        <text x="275" y="44" fill="#c7d2fe" font-family="sans-serif" font-size="11" text-anchor="middle">Appeal within 45 days to Appellate Authority (Speaking Order mandatory)</text>
      </g>

      <g transform="translate(150, 465)">
        <rect x="0" y="0" width="550" height="55" fill="#4c1d95" stroke="#a855f7" rx="8"/>
        <text x="275" y="25" fill="#fff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">REVISION (Rule 25) &amp; PRESIDENTIAL REVIEW (Rule 31)</text>
        <text x="275" y="44" fill="#e9d5ff" font-family="sans-serif" font-size="11" text-anchor="middle">Revision within 6 months to GM / Railway Board / President of India</text>
      </g>
    </svg>
    `,
    details: [
      "Rule 14(ii) Exception: DA can dispense with formal inquiry where it is reasonably impracticable to conduct one.",
      "Ramzan Khan Judgement: Furnishing the Inquiry Officer's report to the charged official with 15 days to represent is a constitutional prerequisite before the Disciplinary Authority decides the penalty.",
      "Subsistence Allowance during suspension: Initially 50% basic pay + DA, modifiable by +/- 50% after 3 months depending on who causes delay."
    ]
  },
  {
    id: "flow_works_programme_budget",
    title: "Railway Works Programme & Capital Budget Cycle Flow",
    category: "Financial Rules: Works Programme",
    description: "Step-by-step lifecycle of capital railway projects from initial traffic surveys, pink book sanction to completion report.",
    type: "financial_lifecycle_flow",
    svg: `
    <svg viewBox="0 0 850 520" class="flow-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="850" height="520" fill="#022c22" rx="12"/>
      <text x="425" y="32" fill="#34d399" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">WORKS PROGRAMME &amp; CAPITAL BUDGET LIFECYCLE</text>

      <!-- Stage 1 -->
      <g transform="translate(30, 60)">
        <rect x="0" y="0" width="170" height="90" fill="#065f46" stroke="#10b981" rx="6"/>
        <text x="85" y="25" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">STAGE 1: SURVEYS</text>
        <text x="85" y="48" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Reconnaissance (RES)</text>
        <text x="85" y="65" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Preliminary Survey</text>
        <text x="85" y="80" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Traffic Survey (TS)</text>
      </g>

      <!-- Arrow -->
      <polygon points="215,105 235,105 235,100 245,105 235,110 235,105" fill="#10b981"/>

      <!-- Stage 2 -->
      <g transform="translate(250, 60)">
        <rect x="0" y="0" width="170" height="90" fill="#065f46" stroke="#10b981" rx="6"/>
        <text x="85" y="25" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">STAGE 2: FINANCIAL VET</text>
        <text x="85" y="48" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Abstract Estimate</text>
        <text x="85" y="65" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">DCF / IRR Analysis</text>
        <text x="85" y="80" fill="#fcd34d" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ROR &gt;= 10% Required</text>
      </g>

      <!-- Arrow -->
      <polygon points="435,105 455,105 455,100 465,105 455,110 455,105" fill="#10b981"/>

      <!-- Stage 3 -->
      <g transform="translate(470, 60)">
        <rect x="0" y="0" width="160" height="90" fill="#065f46" stroke="#10b981" rx="6"/>
        <text x="80" y="25" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">STAGE 3: SANCTION</text>
        <text x="80" y="48" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">ZWP approval by GM</text>
        <text x="80" y="65" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">IRPSM submission</text>
        <text x="80" y="80" fill="#f43f5e" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PINK BOOK Sanction</text>
      </g>

      <!-- Arrow -->
      <polygon points="645,105 665,105 665,100 675,105 665,110 665,105" fill="#10b981"/>

      <!-- Stage 4 -->
      <g transform="translate(680, 60)">
        <rect x="0" y="0" width="140" height="90" fill="#065f46" stroke="#10b981" rx="6"/>
        <text x="70" y="25" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">STAGE 4: TECHNICAL</text>
        <text x="70" y="52" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Detailed Estimate</text>
        <text x="70" y="72" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">Technical Sanction</text>
      </g>

      <!-- Bottom Row: Execution & Closing -->
      <g transform="translate(80, 200)">
        <rect x="0" y="0" width="690" height="130" fill="#044e42" stroke="#059669" rx="8"/>
        <text x="345" y="25" fill="#a7f3d0" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">STAGE 5: TENDERING &amp; EXECUTION (GCC 2022)</text>
        
        <rect x="30" y="40" width="190" height="70" fill="#065f46" rx="6"/>
        <text x="125" y="62" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">IREPS e-Tendering</text>
        <text x="125" y="80" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">EMD + Performance Guarantee (5%)</text>
        <text x="125" y="95" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">Letter of Acceptance (LOA)</text>

        <rect x="250" y="40" width="190" height="70" fill="#065f46" rx="6"/>
        <text x="345" y="62" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Execution &amp; Billing</text>
        <text x="345" y="80" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">Electronic Measurement (e-MB)</text>
        <text x="345" y="95" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">SD deduction @ 10% (max 5%)</text>

        <rect x="470" y="40" width="190" height="70" fill="#065f46" rx="6"/>
        <text x="565" y="62" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Variations &amp; PVC</text>
        <text x="565" y="80" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">Variations up to 25% at rate</text>
        <text x="565" y="95" fill="#d1fae5" font-family="sans-serif" font-size="10" text-anchor="middle">Price Variation Clause (&gt;12 mo)</text>
      </g>

      <!-- Stage 6: Project Close -->
      <g transform="translate(180, 360)">
        <rect x="0" y="0" width="490" height="120" fill="#134e4a" stroke="#2dd4bf" rx="8"/>
        <text x="245" y="28" fill="#5eead4" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">STAGE 6: COMMISSIONING &amp; COMPLETION</text>
        <text x="245" y="55" fill="#fff" font-family="sans-serif" font-size="12" text-anchor="middle">CRS (Commissioner of Railway Safety) Inspection &amp; Authorization</text>
        <text x="245" y="78" fill="#fef08a" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Preparation of Completion Report within 6 Months</text>
        <text x="245" y="100" fill="#ccfbf1" font-family="sans-serif" font-size="11" text-anchor="middle">Release of Security Deposit after Defect Liability Period</text>
      </g>
    </svg>
    `,
    details: [
      "Pink Book works: Sanctioned by Railway Board / Parliament for works costing above Rs. 2.5 Crore.",
      "LAW Book (List of Approved Works): Sanctioned by General Manager for works between Rs. 50 Lakhs and Rs. 2.5 Crore.",
      "Completion Report: Reconciles sanctioned vs actual outlay, liquidates outstanding liabilities, and closes work orders."
    ]
  }
];
