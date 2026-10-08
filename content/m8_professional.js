window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 8,
  title: "8 · Professional practice",
  lessons: [
    {
      id: "8.1", title: "Diagnostics and troubleshooting", minutes: 25,
      blocks: [
        ["p", "Writing programs is half the job. The other half is finding out why a machine does not do what it should, often at night, under pressure. Good troubleshooters are systematic, not lucky."],
        ["fig", "diag-path", "Follow the signal. Check the middle, then decide which half the fault is in."],
        ["h", "Method"],
        ["ul", [
          "<b>Observe first</b>: what exactly is wrong, since when, what changed? Ask the operator. Read the alarm text and the diagnostic buffer before touching anything.",
          "<b>Divide and conquer</b>: test in the middle of the signal chain. If the input image is correct, the problem is after it; if not, before.",
          "<b>One change at a time</b>, and write it down. If it does not help, undo it.",
          "<b>Compare with something that works</b>: a twin machine, a backup, an earlier version."
        ]],
        ["h", "Tools in TIA Portal"],
        ["ul", [
          "<b>Online &amp; diagnostics</b> (Project tree &gt; device &gt; Online &amp; diagnostics): the <b>diagnostic buffer</b> lists time-stamped events such as module faults, STOP causes and errors. First place to look.",
          "<b>Device view online</b>: modules show green, or a red or yellow symbol with the fault. Hover for details.",
          "<b>Monitoring</b> of a block (glasses icon): shows live power flow in LAD and live values in SCL.",
          "<b>Watch tables</b>: observe and modify tags together. Force tables override signals; use with great care.",
          "<b>Cross-reference</b>: where is a tag written? Often reveals a second writer overwriting your value.",
          "<b>Trace</b> (Project tree &gt; Traces): records tag values at the PLC's own rate, so you can see fast events a watch table would miss.",
          "<b>Compare</b> (offline/online): is the running program the one you think it is?",
          "On the CPU itself: status LEDs (RUN/STOP, ERROR, MAINT), and on S7-1500, the display with diagnostics."
        ]],
        ["h", "Classic problems and what they usually mean"],
        ["ul", [
          "<b>CPU in STOP</b>: check the diagnostic buffer: programming error, missing OB, module fault, or somebody pressed STOP.",
          "<b>An output is on in the program but not on the machine</b>: output module, fuse, wiring, or a force overriding it.",
          "<b>An input never changes</b>: sensor, cable, 24 V supply, wrong address in the tag table.",
          "<b>Intermittent faults</b>: loose connectors, duplicate IP addresses, electrical noise, an alarm that clears itself.",
          "<b>Behaviour changed after a change</b>: compare to the backup; check cross-references for new writers."
        ]],
        ["warn", "Before using Modify or Force on a live machine, know what is connected to that signal. An unexpected valve or drive movement can injure someone."],
        ["quiz", {
          q: "The CPU has gone to STOP unexpectedly. What is the first thing to read?",
          options: ["The HMI trend", "The diagnostic buffer", "The tag table", "The library"],
          answer: 1,
          why: "The diagnostic buffer records time-stamped events, including why and when the CPU stopped."
        }],
        ["try", "In your project, deliberately cause a CPU STOP (for example by removing OB1 or forcing an error). Read the diagnostic buffer and find the exact reason and time."]
      ]
    },
    {
      id: "8.2", title: "Functional safety basics", minutes: 20,
      blocks: [
        ["p", "Some failures can injure or kill. <b>Functional safety</b> is the discipline that makes machines stop safely when something goes wrong. It is not ordinary PLC logic, and doing it badly is a serious matter."],
        ["fig", "safety-chain", "A typical safety function: two-channel input, safety logic, two contactors in series, and feedback."],
        ["h", "The key ideas"],
        ["ul", [
          "<b>Redundancy</b>: two channels. A single fault (a welded contact, a cut wire) must not remove the safety function.",
          "<b>Diagnostics</b>: the system checks itself: both channels must agree, and contactors must prove they dropped (feedback).",
          "<b>Risk assessment</b>: you decide how safe a function must be based on severity, frequency of exposure and avoidability. The result is a required <b>Performance Level (PL)</b> or <b>Safety Integrity Level (SIL)</b>.",
          "<b>Certified components</b>: safety relays, safety PLCs and safety I/O are certified for these levels."
        ]],
        ["h", "Siemens options"],
        ["ul", [
          "<b>Safety relays</b> (e.g. 3SK, 3SF series): fixed, simple functions such as e-stop monitoring. No programming.",
          "<b>Fail-safe CPUs</b> (S7-1200 F, S7-1500 F) with <b>F-I/O</b>: programmable safety logic in the same hardware family. You write the <b>safety program</b> in a separate, protected area (the Safety Administration editor), using certified F-blocks. Safe values, F-signatures and a password protect it from accidental change.",
          "<b>Safe drive functions</b> such as <b>Safe Torque Off (STO)</b>, built into the drive."
        ]],
        ["h", "Rules of thumb for learners"],
        ["ul", [
          "<b>Never use standard PLC logic for a safety function.</b> That includes HMI buttons and ordinary inputs.",
          "<b>E-stops and guard interlocks</b> are wired to safety hardware, using NC contacts and two channels.",
          "<b>Safety work needs training and certification</b> (for example the TÜV Functional Safety Engineer or Siemens SITRAIN safety courses) and a signed validation. This course gives you only the vocabulary.",
          "<b>Document and validate</b> every safety function: test it, record the test, and re-test after every change."
        ]],
        ["note", "Relevant standards you will meet: EN ISO 13849 (machine safety, Performance Levels), IEC 62061 and IEC 61508 (SIL). Learn the names; use the actual standards when you do real safety work."],
        ["quiz", {
          q: "Which statement is correct?",
          options: ["An HMI Stop button is enough to safeguard a machine", "A safety function needs redundant channels, diagnostics and certified components", "Safety logic can be written in any ordinary OB", "NO contacts are preferred for e-stops"],
          answer: 1,
          why: "Functional safety needs redundancy, self-checks and certified parts. Ordinary logic and HMI buttons are never enough."
        }]
      ]
    },
    {
      id: "8.3", title: "Industrial cybersecurity", minutes: 20,
      blocks: [
        ["p", "Plants used to be isolated. Now they are connected to office networks, remote support and the cloud, so industrial systems are targets. A PLC that stops production or damages equipment because of an attack is a real incident, not a theory."],
        ["fig", "defense-depth", "Defense in depth: assume any single layer can fail, and add another."],
        ["h", "Network structure"],
        ["ul", [
          "<b>Segment</b> the network into zones: office IT, DMZ, control, field. Control devices should not sit on the office network.",
          "<b>Firewalls</b> between zones allow only the traffic that is needed (specific ports and partners).",
          "<b>No direct internet</b> for controllers. Remote access through a controlled, authenticated gateway (VPN, with logging).",
          "A <b>DMZ</b> hosts interfaces such as an OPC UA gateway or historian that bridge IT and OT."
        ]],
        ["h", "On the PLC"],
        ["ul", [
          "<b>Access protection</b>: set a password and an access level on every CPU (Properties &gt; Protection &amp; Security). Levels range from full access to no access without a password; choose the lowest that works.",
          "<b>Know-how protection</b>: protect blocks you do not want copied or changed.",
          "<b>Turn off what you do not use</b>: web server, PUT/GET access (which you enabled for PLCSIM in lesson 1.5), OPC UA, unused ports.",
          "<b>Secure communication</b>: use encrypted, certificate-based connections where the CPU supports them.",
          "<b>Keep firmware and TIA Portal updated</b> following the vendor's security bulletins, with testing."
        ]],
        ["h", "Everyday habits"],
        ["ul", [
          "<b>No default or shared passwords.</b> Change them at commissioning and store them in a password manager.",
          "<b>Treat USB sticks and laptops as hazards</b>: scan before connecting them to a plant network.",
          "<b>Backups</b>: keep offline copies of every PLC and HMI project, plus a recovery plan. Backups are your answer to ransomware.",
          "<b>Least privilege</b>: engineers need engineering rights; operators do not."
        ]],
        ["note", "The reference standard family is <b>IEC 62443</b>, which covers security for industrial automation and control systems, and defines zones, conduits and security levels. Siemens' own guidance (&quot;Operational Guidelines for Industrial Security&quot;) is a good starting point."],
        ["warn", "The PUT/GET and simulation settings that make PLCSIM work lower security. They are for your learning PC. Do not copy them onto a production CPU."],
        ["quiz", {
          q: "Which design is the most secure for a controller that must send data to an office dashboard?",
          options: ["Put the PLC on the office network", "Put the PLC on the control network and publish data through a DMZ gateway with a firewall", "Open the PLC to the internet with a strong password", "Disable all passwords for convenience"],
          answer: 1,
          why: "A DMZ gateway limits what crosses the boundary and keeps the controller off the office network and the internet."
        }]
      ]
    },
    {
      id: "8.4", title: "FAT, SAT and project documentation", minutes: 20,
      blocks: [
        ["p", "Real projects are not just programs; they are deliveries. A customer pays for a machine that must be shown to work, in a way both sides can verify. The V-model is a handy picture of how a project proceeds and how each design step is checked by a test."],
        ["fig", "fab-lifecycle", "Each design phase on the left has a matching test on the right."],
        ["h", "Phases and tests"],
        ["ul", [
          "<b>Requirements (URS)</b>: what the customer needs, in testable statements.",
          "<b>Functional design (FDS)</b>: how the machine will behave: modes, sequences, interlocks, alarms.",
          "<b>Detailed design</b>: electrical drawings, I/O list, software design, network plan.",
          "<b>Build and program</b>.",
          "<b>Module/unit tests</b>: each block tested alone (use PLCSIM).",
          "<b>FAT (Factory Acceptance Test)</b>: the complete machine tested at the builder's workshop, witnessed by the customer.",
          "<b>SAT (Site Acceptance Test)</b>: tested again once installed on site, with real utilities and the real process."
        ]],
        ["h", "What a good test plan contains"],
        ["ul", [
          "<b>I/O checkout (loop check)</b>: every input and output verified from field device to the PLC tag, and recorded. Nothing is assumed.",
          "<b>Functional tests</b>: each mode and sequence is run against the FDS.",
          "<b>Interlocks and alarms</b>: provoke each, check the response and the alarm text.",
          "<b>Failure behaviour</b>: loss of power, network, air, a sensor wire cut. What does the machine do?",
          "<b>Performance</b>: throughput, cycle time, accuracy, where specified.",
          "<b>Sign-off sheet</b> for each test: date, who, result, any deviation."
        ]],
        ["h", "Documents you hand over"],
        ["ul", [
          "Electrical schematics and I/O list, with addresses and tag names.",
          "PLC and HMI projects (archived), with a version and date, and a <b>change log</b>.",
          "Network and IP/name list, passwords handed over securely.",
          "Operating and maintenance manual, alarm list with causes and remedies.",
          "Test records for FAT and SAT, and an as-built functional description."
        ]],
        ["note", "Fixing a mistake gets roughly ten times more expensive at each later phase. Finding it in a PLCSIM unit test costs minutes; finding it at the customer's site during SAT can cost days."],
        ["quiz", {
          q: "What is the purpose of the FAT?",
          options: ["Final commissioning on site", "To test the complete machine at the builder's factory, before shipment", "To design the electrics", "To train the operators"],
          answer: 1,
          why: "FAT is the factory test. It catches problems while they are still cheap to fix."
        }]
      ]
    },
    {
      id: "8.5", title: "Version control, teamwork and backups", minutes: 20,
      blocks: [
        ["p", "Several people will work on the same plant, sometimes years apart. Without discipline you lose track of what changed and why. These habits separate a hobbyist from a professional."],
        ["h", "Backups: three kinds"],
        ["ul", [
          "<b>Project archive</b> (<i>Project &gt; Archive</i>): a compressed copy of the whole TIA project. Archive at each milestone with a name like <code>Line1_v1.4.0_2026-10-03.zap</code>.",
          "<b>Online backup of the device</b> (<i>Online &gt; Backup from online device</i>): a snapshot of what is really in the CPU, including data. Take it at commissioning and before and after every change.",
          "<b>Upload</b> of a device with no project (<i>Upload device as new station</i>): recovers the hardware and the compiled program, but you may lose comments and some names that the CPU does not store. Treat it as a last resort, not a backup plan."
        ]],
        ["p", "Store backups <b>off the engineering PC</b>: on a server, with a second copy offline."],
        ["h", "Versioning and change control"],
        ["ul", [
          "Use <b>semantic versions</b>: <code>major.minor.patch</code>. A fix is a patch, new feature a minor, a breaking change a major.",
          "Keep a <b>change log</b> in the project: date, who, what and why, plus the ticket or request.",
          "<b>Compare</b> before and after (the compare editor shows block differences) so you can describe exactly what a change did.",
          "<b>Never work directly on the only copy</b> of a production program. Work on a copy, test in PLCSIM, then deploy."
        ]],
        ["h", "Teams"],
        ["ul", [
          "<b>Multiuser engineering</b>: several engineers work on one project from different PCs, with local copies and a central server.",
          "<b>Version Control Interface (VCI)</b>: exports blocks to text files so a tool like Git can store history, compare and merge. A common approach for code review in larger teams. TIA Portal V21 (announced November 2025) adds a built-in Git-friendly export format for LAD, FBD, SCL and data structures, aimed at the same goal.",
          "<b>Code review</b>: a second pair of eyes catches duplicate coils, magic numbers and unclear names.",
          "<b>Naming and structure standards</b> (lesson 3.6) written down and shared so everyone follows them."
        ]],
        ["h", "Commissioning checklists"],
        ["ul", [
          "Backup the existing system first.",
          "Confirm the hardware matches the configuration, and the CPU has the right firmware.",
          "Make small, reversible changes; monitor after every download.",
          "Record the final state: archive, online backup, change log entry."
        ]],
        ["quiz", {
          q: "Which backup captures the exact state of a running CPU, including its data?",
          options: ["Project archive only", "Backup from online device", "A screenshot", "Exporting the tag table"],
          answer: 1,
          why: "An online backup snapshots what is really in the CPU, which can differ from the offline project."
        }]
      ]
    },
    {
      id: "8.6", title: "Capstone: a sorting station", minutes: 60,
      blocks: [
        ["p", "Time to put everything together. This capstone is a realistic mini project that uses nearly every skill in the course. Do it in TIA Portal with PLCSIM, in your own time, and ask Claude to review each stage."],
        ["h", "The machine"],
        ["p", "A <b>conveyor sorting station</b>: parts arrive on a belt, a sensor detects them, a height sensor decides <i>tall</i> or <i>short</i>, and a diverter pushes tall parts into a second chute. A counter tracks each type. A reset button and an HMI complete the station."],
        ["ul", [
          "<b>Inputs</b>: Start (NO), Stop (NC wired), Part_Sensor, Tall_Sensor, Overload_OK, Reset, plus an analog belt-speed feedback.",
          "<b>Outputs</b>: Belt motor (via a drive, telegram 1), Diverter solenoid, Horn, Fault lamp, Running lamp."
        ]],
        ["h", "Stage 1: design on paper"],
        ["ul", [
          "List every input and output with name, address and comment.",
          "Draw a state diagram: Idle, Starting (horn 3 s), Running, Fault.",
          "Write the interlock rules as sentences before any code."
        ]],
        ["h", "Stage 2: build"],
        ["ul", [
          "Hardware: S7-1200 or S7-1500 in the project; an HMI panel; optionally an ET 200SP with the sensors.",
          "Tag table and naming standard from lesson 3.6.",
          "A <code>Conveyor_Ctrl</code> FB (state machine, SCL) and a <code>Sort_Ctrl</code> FB (edge detection on the part sensor, diverter timing with a TP timer, counters).",
          "A scaling FC for the belt speed feedback.",
          "OB1 contains only calls. OB100 initialises counters and states."
        ]],
        ["h", "Stage 3: HMI"],
        ["ul", [
          "An overview screen with belt state, counters, speed, Start/Stop/Reset buttons (writing command bits).",
          "Alarm for the overload and an alarm for a part jam (no part for 30 s while running).",
          "Two user levels: operator and supervisor. The counter-reset is supervisor-only."
        ]],
        ["h", "Stage 4: test"],
        ["ul", [
          "Test every block alone in PLCSIM with a watch table.",
          "Write a short test plan (see lesson 8.4) with at least 15 numbered tests, including: Stop during the horn delay, overload while running, tall and short parts back-to-back, and power-cycle recovery.",
          "Record pass/fail for each, fix, and re-run the failed ones."
        ]],
        ["h", "Stage 5: deliver"],
        ["ul", [
          "Archive the project with a version, and take an online backup of PLCSIM's CPU.",
          "Write a one-page handover: I/O list, state diagram, alarm list, how to reset a fault.",
          "Add the <code>Conveyor_Ctrl</code> FB to a library as a type, version 1.0.0."
        ]],
        ["note", "This is a portfolio piece. Photographs of the screens, the state diagram and the test record, together, tell an employer more than any certificate."],
        ["try", "Finish stage 1 (the I/O list and state diagram) and send it to Claude for review before you start building."],
        ["try", "Complete the whole project. Then take every unclear naming choice, every magic number and every missing comment and fix them. That last 10 percent is what makes it professional."],
        ["quiz", {
          q: "Where should the part-jam timeout (30 s) be set so an engineer can change it without editing logic?",
          options: ["As a magic number inside the rung", "As a named, documented parameter (constant or DB value, with limits)", "In the HMI only", "It should never change"],
          answer: 1,
          why: "Named parameters in a DB or an FB input make behaviour adjustable, documented and checked, without touching the logic."
        }]
      ]
    },
    {
      id: "8.7", title: "Where to go next", minutes: 15,
      blocks: [
        ["p", "You now have the full path: PLC basics, TIA Portal, ladder and SCL, program structure, HMI, networks, advanced control and professional practice. Skill comes from practice and from reading real documentation. This lesson points you at the best places to continue."],
        ["h", "Free official material"],
        ["ul", [
          "<b>Siemens SCE (Automation Cooperates with Education)</b>: free TIA Portal training documents for S7-1200 and S7-1500 with step-by-step exercises, translated into many languages. They are provided for use in education and R&amp;D, so read the terms. Search for <i>Siemens SCE learning and training documents</i>.",
          "<b>Siemens Industry Online Support</b> (support.industry.siemens.com): manuals, FAQs, application examples and downloads. Learn to read the manual of your own CPU; it answers most questions.",
          "<b>The TIA Portal information system</b>: press F1 on any instruction or dialog. It is accurate for your exact version.",
          "<b>SITRAIN</b>: Siemens' paid courses and certification paths, useful if an employer will fund them."
        ]],
        ["h", "What this course did not cover"],
        ["p", "So you know what to look for next:"],
        ["ul", [
          "<b>GRAPH</b> and sequence-style programming; <b>high-speed counters</b> and pulse outputs in detail.",
          "<b>CPU web server</b>, <b>data logging</b> and file handling.",
          "<b>TIA Portal Openness</b> (scripting the engineering tool) and <b>WinCC Unified</b> JavaScript.",
          "<b>Safety programming</b> with F-CPUs, <b>technology modules</b> and T-CPUs for motion.",
          "<b>S7-PLCSIM Advanced</b> for S7-1500 (more realistic simulation, scripting).",
          "<b>SIMATIC AX</b>, the text-first, Git-friendly Siemens tool.",
          "<b>Other brands</b>: the ideas (scan cycle, tags, IEC languages) transfer to Rockwell, Beckhoff, CODESYS and others."
        ]],
        ["h", "A simple study plan"],
        ["ul", [
          "<b>Weeks 1 to 2</b>: modules 0 to 2. Redo every ladder simulator without the lesson open.",
          "<b>Weeks 3 to 4</b>: install TIA Portal and PLCSIM. Rebuild each lesson project for real.",
          "<b>Weeks 5 to 6</b>: modules 3 and 4. Convert your motor starter to an FB with a state machine.",
          "<b>Weeks 7 to 8</b>: modules 5 to 7 with an HMI and a PID loop on a simulated process.",
          "<b>After that</b>: the capstone in lesson 8.6, then a second project of your own."
        ]],
        ["note", "Practise reading other people's programs. Open the SCE examples or any library block and ask: what does each network do, and what would I change? Reading is half of the job."],
        ["try", "Write your own two-sentence goal (for example: <i>build a sorting station with an HMI by the end of next month</i>) and put it in this lesson's notes box."],
        ["quiz", {
          q: "You are unsure how an instruction behaves in your TIA Portal version. What is the most reliable source?",
          options: ["A forum post from five years ago", "The information system (F1) and the manual for your CPU and firmware", "A video summary", "Guessing and testing on the machine"],
          answer: 1,
          why: "The built-in help and the official manual match your exact version and firmware, so they are the authority."
        }]
      ]
    }
  ]
});

