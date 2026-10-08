window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 12,
  title: "12 · Beyond Siemens",
  lessons: [
    {
      id: "12.1", title: "Allen-Bradley / Rockwell for Siemens programmers", minutes: 30,
      blocks: [
        ["p", "Siemens is dominant in Europe and Asia; <b>Rockwell Automation's Allen-Bradley</b> controllers dominate North America and are common elsewhere. Your course also uses Allen-Bradley examples. The good news: 90 % of what you learned transfers. Only the names, the memory model and the software change."],
        ["h", "The families"],
        ["ul", [
          "<b>Micro800 / MicroLogix</b>: small, cheap controllers. Programmed in Connected Components Workbench (Micro800) or RSLogix 500 (MicroLogix, SLC 500).",
          "<b>CompactLogix</b>: mid-range, compact. Programmed in <b>Studio 5000 Logix Designer</b>.",
          "<b>ControlLogix</b>: large, modular, high performance, also in Studio 5000.",
          "<b>PLC-5 and SLC 500</b>: legacy but still working in many plants, with a different, address-based memory model."
        ]],
        ["h", "The instruction names"],
        ["fig", "s7-vs-ab", "The same ideas, different names."],
        ["p", "The ladder shape is the same: rungs, contacts on the left, outputs on the right. In Studio 5000 a contact is <code>XIC</code> (examine if closed: true when the bit is 1) or <code>XIO</code> (examine if open: true when the bit is 0). The output is <code>OTE</code> (output energise, like a coil), <code>OTL</code> latches and <code>OTU</code> unlatches. They are the NO contact, NC contact, coil, set and reset you already know."],
        ["h", "Tags instead of addresses"],
        ["p", "Modern Logix controllers (CompactLogix and ControlLogix) are <b>tag-based</b>, like TIA Portal with symbolic names: you create a tag <code>Motor_Run</code> of type BOOL and use it. There are no fixed absolute addresses to remember. The old PLC-5/SLC 500 used addresses like <code>I:1/0</code> and <code>N7:0</code>, which you may meet in legacy plants."],
        ["ul", [
          "<b>Data types</b>: BOOL, SINT (8 bit), INT (16 bit), <b>DINT (32 bit, the native size)</b>, REAL. Use DINT for integers; it is the fastest in Logix.",
          "<b>Controller tags</b> are global. <b>Program tags</b> are local to one program.",
          "I/O appears automatically as tags such as <code>Local:1:I.Data.0</code>, which you can alias to a friendly name."
        ]],
        ["h", "Timers and counters are structures"],
        ["p", "In Siemens, a timer is an instance with <code>IN</code>, <code>PT</code>, <code>Q</code> and <code>ET</code>. In Logix a timer is a <b>TIMER structure</b> with members you read in other rungs:"],
        ["code", "TON  Timer: T_Delay   Preset: 5000 (ms)   Accum: 0\n\nT_Delay.EN   enabled (the rung is true)\nT_Delay.TT   timing in progress\nT_Delay.DN   done: accumulated time reached the preset   (= Siemens Q)\nT_Delay.PRE  preset                                      (= PT)\nT_Delay.ACC  accumulated time                            (= ET)", "Studio 5000 timer"],
        ["p", "Counters have <code>.CU</code>, <code>.CD</code>, <code>.DN</code>, <code>.OV</code>, <code>.UN</code>, <code>.PRE</code>, <code>.ACC</code>. You reset a timer or counter with <code>RES</code>. A Siemens TON resets by itself when IN falls; a Logix TON also does when its rung goes false, but a <b>retentive timer RTO</b> needs RES."],
        ["h", "Program organisation"],
        ["ul", [
          "<b>Tasks</b> hold <b>programs</b>, which hold <b>routines</b>. The continuous task is like OB1; periodic tasks are like cyclic OBs; event tasks are like hardware interrupts.",
          "<b>Add-On Instructions (AOI)</b> are the Logix function blocks: reusable logic with parameters and local data.",
          "<b>UDT</b> (user-defined data types) work as in Siemens.",
          "Programs can be written in ladder, function block diagram, <b>structured text</b> or sequential function chart. Structured text is very close to SCL."
        ]],
        ["scl", "// Logix structured text, nearly identical in spirit to SCL\nIF Tank_Level < 20.0 THEN\n    Pump_Run := 1;\nELSIF Tank_Level > 80.0 THEN\n    Pump_Run := 0;\nEND_IF;", "Allen-Bradley structured text"],
        ["h", "What is genuinely different"],
        ["ul", [
          "Edits can be made <b>online</b> in run mode (test edits, accept or cancel). Convenient, and dangerous without care.",
          "Rung conditions are checked from left to right but the <b>whole rung</b> is always scanned: a 'false' rung still executes its output (an OTE turns off, a timer resets).",
          "Edge detection uses the <b>ONS</b> (one-shot) instruction, with its own storage bit; <code>OSR</code> and <code>OSF</code> also exist.",
          "Communication: EtherNet/IP and CIP are the native protocols (the equivalent of PROFINET in Siemens)."
        ]],
        ["note", "A skill that transfers: the habit of one writer per output, named signals and tested start-up is the same on every platform. Treat a new brand as a new dialect, not a new language."],
        ["quiz", {
          q: "Which Allen-Bradley instruction matches the Siemens normally closed contact?",
          options: ["XIC", "XIO", "OTL", "ONS"],
          answer: 1,
          why: "XIO (examine if open) is true when its bit is 0, like the NC contact."
        }],
        ["quiz", {
          q: "In Logix, which member of a TON timer corresponds to Siemens <code>Q</code>?",
          options: [".EN", ".TT", ".DN", ".ACC"],
          answer: 2,
          why: ".DN (done) is set when the accumulated time reaches the preset."
        }],
        ["quiz", {
          q: "What is the Logix equivalent of a Siemens function block with instance data?",
          options: ["Routine", "Add-On Instruction (AOI)", "Task", "Controller tag"],
          answer: 1,
          why: "AOIs package logic with parameters and local data for reuse."
        }],
        ["try", "Translate the start/stop seal-in of lesson 2.3 into Studio 5000 notation: write down the rung using XIC, XIO and OTE."]
      ]
    },
    {
      id: "12.2", title: "IEC 61131-3, CODESYS and practising for free", minutes: 25,
      blocks: [
        ["p", "Brands come and go; the standard stays. <b>IEC 61131-3</b> defines the programming languages almost every PLC uses: Ladder Diagram (LD), Function Block Diagram (FBD), Structured Text (ST), Sequential Function Chart (SFC) and the old Instruction List (IL). Siemens calls them LAD, FBD, SCL and S7-GRAPH (and STL), but they are the same family."],
        ["h", "The wider PLC world"],
        ["ul", [
          "<b>CODESYS</b>: a vendor-independent IEC 61131-3 development environment used inside hundreds of brands' products (for example WAGO, Festo, Eaton, many drive and robot controllers and, in rebranded form, Schneider Machine Expert).",
          "<b>Beckhoff TwinCAT</b>: a PC-based controller with real-time kernel, popular in machine building; uses Visual Studio.",
          "<b>Mitsubishi (GX Works)</b>, <b>Omron (Sysmac Studio)</b>, <b>B&amp;R (Automation Studio)</b>, <b>Schneider (EcoStruxure)</b>: all IEC based with their own style.",
          "<b>Open-source</b>: OpenPLC offers a free editor and runtime that follows IEC 61131-3, runs on Windows, Linux or a Raspberry Pi, and can control real I/O or Modbus devices."
        ]],
        ["h", "What transfers and what does not"],
        ["ul", [
          "Transfers: logic thinking, state machines, scan-cycle behaviour, naming, interlocks, safe design, commissioning, documentation.",
          "Changes: the software, instruction names, how memory is organised, the diagnostics, networking and licences.",
          "A good rule: once you can program a machine well on one platform, you need a few weeks to be productive on another."
        ]],
        ["h", "Practising without a PLC"],
        ["p", "You do not need hardware or an expensive licence to keep practising. Options, from the closest to TIA Portal to the cheapest:"],
        ["ul", [
          "<b>TIA Portal official trial</b> from Siemens: a time-limited full version for evaluation, including PLCSIM. The free Siemens Industry Online Support site also has SCE (Siemens Automation Cooperates with Education) training documents with exercises.",
          "<b>Educational or student licences</b> from your university or college, if your course provides them.",
          "<b>CODESYS</b> with its soft PLC runtime, which runs a virtual controller on your PC. Check the current licence terms for the time limits of the demo runtime.",
          "<b>OpenPLC</b>: free and open source; good for ladder and structured text practice and for connecting to a Modbus simulator.",
          "<b>Factory simulation</b> tools (for example a 3D plant simulator with a free trial) let your program drive a virtual conveyor or sorting station, which is far more motivating than lamps.",
          "<b>This app's simulators</b> for the logic fundamentals."
        ]],
        ["warn", "Use only official trials, educational licences and free software. Cracked installers and licence 'keygens' are illegal, and are among the most common ways to get malware onto a machine. They are also a bad habit for a professional. If your class gives you a key, use that."],
        ["h", "A simple practice plan"],
        ["ul", [
          "Week 1 to 2: re-do the ladder module in your simulator of choice. Aim to build all the lesson 2.x programs without looking.",
          "Week 3 to 4: one new project each week: traffic lights, sorting station, batch tank, lift with floors.",
          "Week 5 and on: one structured project in FBs with a state machine and an HMI. Write the README as if a stranger had to maintain it."
        ]],
        ["quiz", {
          q: "Which statement about IEC 61131-3 is correct?",
          options: [
            "It is a Siemens-only standard",
            "It defines common PLC languages (LD, FBD, ST, SFC, IL) used across many brands",
            "It defines the PROFINET protocol",
            "It only covers hardware"
          ],
          answer: 1,
          why: "It is the international standard for PLC programming languages."
        }],
        ["quiz", {
          q: "What is the best way to get TIA Portal for practice at no cost, legally?",
          options: [
            "A cracked installer",
            "The official time-limited trial or an educational licence",
            "Ask a friend for their license key",
            "It cannot be done"
          ],
          answer: 1,
          why: "Siemens provides evaluation versions and education programs. Cracked software is illegal and risky."
        }],
        ["try", "Install a free IEC 61131-3 environment (OpenPLC or CODESYS) and write the start/stop seal-in in ladder and the same logic in structured text. Note two differences from TIA Portal."]
      ]
    },
    {
      id: "12.3", title: "From PLC to plant data: MQTT, historians and OEE", minutes: 30,
      blocks: [
        ["p", "A modern plant wants more than a running machine: it wants numbers. How many parts today? Why did line 2 stop? Which energy use per product? The PLC holds the answers, and professional engineers also know how to move that data upward correctly."],
        ["h", "The automation pyramid, as data flow"],
        ["ul", [
          "<b>Level 0 and 1</b>: sensors, actuators and the PLC. Milliseconds.",
          "<b>Level 2</b>: HMI and SCADA: operator view, alarms, trends. Seconds.",
          "<b>Level 3</b>: MES (manufacturing execution), historian, batch management: production orders, genealogy, quality. Minutes to hours.",
          "<b>Level 4</b>: ERP, planning, finance. This follows the ISA-95 model."
        ]],
        ["h", "Ways to move the data"],
        ["ul", [
          "<b>OPC UA</b> (lesson 6.3): typed, secured, browsable. The standard for PLC to SCADA, MES and gateways.",
          "<b>MQTT</b>: a light publish/subscribe protocol for IoT and cloud. A device <b>publishes</b> a message to a <b>topic</b> (such as <code>plant1/line2/press1/temperature</code>) on a <b>broker</b>; any client <b>subscribed</b> to that topic receives it. Messages are often JSON. Quality-of-service levels 0, 1 and 2 trade speed for delivery guarantees.",
          "<b>Sparkplug B</b> adds a defined topic structure and payload to MQTT for industrial use, including birth/death messages for devices.",
          "<b>Database access / REST / web services</b> through gateways or PC-based edge devices.",
          "<b>Edge devices</b> sit between PLC and cloud: they collect, filter, buffer and forward, so the PLC itself is not exposed."
        ]],
        ["warn", "Connecting a PLC straight to the internet is a security failure (lesson 8.3). Data goes outward through a controlled gateway or DMZ, with authentication and encryption, and the PLC receives only what you explicitly design."],
        ["h", "Good data is designed"],
        ["ul", [
          "Name tags consistently (lesson 3.6) and keep an asset hierarchy: <code>Site/Area/Line/Machine/Signal</code>.",
          "Always send the <b>unit</b> and a <b>timestamp</b> from the source (DTL, lesson 10.2). Receiving time is not the event time.",
          "Send <b>states and events</b> (machine state, stop reason) as well as raw values. A running/stopped signal plus a reason code answers more questions than a hundred temperatures.",
          "Decide the rate: sample slow values slowly. 10 000 values per second to a cloud dashboard helps nobody."
        ]],
        ["h", "OEE: the one number production managers love"],
        ["p", "<b>Overall Equipment Effectiveness</b> measures how well a machine uses its planned time. It is the product of three ratios, each between 0 and 1:"],
        ["fig", "oee", "OEE = Availability x Performance x Quality."],
        ["ul", [
          "<b>Availability</b> = run time / planned production time. Losses: breakdowns, changeovers, waiting.",
          "<b>Performance</b> = actual output rate / ideal rate. Losses: slow cycles, small stops.",
          "<b>Quality</b> = good parts / total parts. Losses: scrap and rework.",
          "World-class OEE is often quoted around 85 %; many plants run at 40 to 60 %."
        ]],
        ["p", "To compute OEE reliably, the PLC must provide a clean <b>machine state</b> (running, idle, fault, waiting for material, planned stop), the <b>part count</b> and the <b>reject count</b>, with the cycle time of the product. The state machine from lesson 7.3 (PackML) exists precisely to provide these."],
        ["scl", "// Minimal OEE counters in the PLC (called once per second)\nCASE #Machine_State OF\n    1: #Run_Time := #Run_Time + 1;       // Execute\n    2: #Down_Time := #Down_Time + 1;     // Held / Aborted / Stopped\n    ELSE\n        #Idle_Time := #Idle_Time + 1;\nEND_CASE;\n\nIF #Planned_Time > 0 THEN\n    #Availability := DINT_TO_REAL(#Run_Time) / DINT_TO_REAL(#Planned_Time);\nEND_IF;\nIF #Total_Parts > 0 THEN\n    #Quality := DINT_TO_REAL(#Total_Parts - #Reject_Parts) / DINT_TO_REAL(#Total_Parts);\nEND_IF;", "OEE building blocks"],
        ["quiz", {
          q: "Availability 90 %, performance 95 %, quality 98 %. What is the OEE?",
          options: ["94 %", "83.8 %", "90 %", "76 %"],
          answer: 1,
          why: "0.90 x 0.95 x 0.98 = 0.838."
        }],
        ["quiz", {
          q: "In MQTT, what does a broker do?",
          options: [
            "Converts PLC programs",
            "Receives published messages and delivers them to clients subscribed to the topic",
            "Stores the PLC program",
            "Encrypts the PLC memory"
          ],
          answer: 1,
          why: "The broker is the central hub of the publish/subscribe pattern."
        }],
        ["quiz", {
          q: "Why should a machine send its own timestamp with each event?",
          options: [
            "To use more bandwidth",
            "The time of arrival at a server can differ greatly from the time the event happened",
            "MQTT forbids server timestamps",
            "The PLC clock is always wrong"
          ],
          answer: 1,
          why: "Network delay and buffering make arrival time unreliable for analysis."
        }],
        ["try", "A bottling line shows 82 % availability, 88 % performance and 97 % quality. Compute the OEE, then say which of the three factors is the best to improve first, and why."]
      ]
    },
    {
      id: "12.4", title: "Standards and regulations you will meet", minutes: 25,
      blocks: [
        ["p", "Automation is a regulated profession. Machines must be safe, programs maintainable, networks secure. Standards are how the industry agrees on what 'good' means. You do not need to memorise them; you need to know <b>which one answers which question</b>."],
        ["h", "Programming and engineering"],
        ["ul", [
          "<b>IEC 61131-3</b>: PLC programming languages (lesson 12.2).",
          "<b>IEC 60204-1</b> (machines) and <b>NFPA 79</b> (USA): electrical equipment of machines: wiring, protection, emergency stop categories, colours, documentation.",
          "<b>IEC 61346 / 81346</b>: reference designation (the -K1, -Q1, -B1 letters of lesson 9.5).",
          "<b>ISA 5.1</b>: instrument tag and P&amp;ID symbols."
        ]],
        ["h", "Safety"],
        ["ul", [
          "<b>ISO 12100</b>: general principles of risk assessment for machinery.",
          "<b>ISO 13849-1</b> and <b>IEC 62061</b>: safety-related control systems on machines. Results are a <b>Performance Level (PL a to e)</b> or <b>Safety Integrity Level (SIL 1 to 3)</b>.",
          "<b>IEC 61508</b>: the parent standard for functional safety of electrical systems.",
          "<b>EU Machinery Directive 2006/42/EC</b> and CE marking: the legal frame for machines sold in the EU, to be replaced by the Machinery Regulation (EU) 2023/1230 from January 2027.",
          "<b>ATEX / IECEx</b>: equipment in explosive atmospheres."
        ]],
        ["h", "Operation, alarms and HMI"],
        ["ul", [
          "<b>ISA-18.2 / IEC 62682</b>: alarm management. Typical rules: every alarm needs an operator action, a priority and a defined response. A common benchmark is about 1 to 2 new alarms per operator in 10 minutes in steady running; far more means an alarm flood.",
          "<b>ISA-101</b>: HMI design, including the 'high-performance HMI' philosophy of calm, grey screens with colour reserved for abnormal situations.",
          "<b>PackML (ISA-TR88.00.02)</b>: machine states and modes for packaging (lesson 7.3)."
        ]],
        ["h", "Batch and enterprise"],
        ["ul", [
          "<b>ISA-88 (IEC 61512)</b>: batch control: recipes, phases, units. The vocabulary of chemical, food and pharma plants.",
          "<b>ISA-95 (IEC 62264)</b>: integration of enterprise and control systems (the levels of lesson 12.3)."
        ]],
        ["h", "Security"],
        ["ul", [
          "<b>IEC 62443</b>: industrial cybersecurity: zones, conduits, security levels, and secure development (lesson 8.3).",
          "<b>NIS2</b> (EU) and sector rules add legal duties on operators of essential and important entities."
        ]],
        ["note", "Standards cost money to buy, but summaries, vendor application notes and the free SCE documents explain the practical rules. When a job involves safety, always work from the actual standard and a qualified safety engineer, not from a course."],
        ["h", "Quality systems you will hear about"],
        ["ul", [
          "<b>GAMP 5</b> and <b>21 CFR Part 11</b> in pharmaceutical plants: validated systems, audit trails, electronic signatures.",
          "<b>ISO 9001</b>: general quality management; it is why change control and documentation matter.",
          "<b>Management of Change (MOC)</b>: any program change is requested, reviewed, tested and recorded."
        ]],
        ["quiz", {
          q: "You need to document the required safety performance of an emergency-stop circuit. Which result do you expect?",
          options: ["IP rating", "Performance Level (PL) or Safety Integrity Level (SIL)", "PROFINET conformance class", "OEE"],
          answer: 1,
          why: "ISO 13849-1 gives a PL, IEC 62061 and IEC 61508 a SIL."
        }],
        ["quiz", {
          q: "Which standard family covers industrial cybersecurity?",
          options: ["ISA-88", "IEC 62443", "ISO 12100", "IEC 61131-3"],
          answer: 1,
          why: "IEC 62443 defines zones, conduits and security requirements."
        }],
        ["quiz", {
          q: "A pharmaceutical customer asks for an audit trail and electronic signatures. Which regulation do they most likely mean?",
          options: ["NFPA 79", "21 CFR Part 11", "ISA-5.1", "IEC 60204-1"],
          answer: 1,
          why: "21 CFR Part 11 covers electronic records and signatures in regulated pharma."
        }],
        ["try", "Choose a machine you know (a bottle filler, a lift, a press). Write one sentence for each: which standard governs its electrical wiring, its safety functions, its alarms and its network security."]
      ]
    },
    {
      id: "12.5", title: "Portfolio, interviews and the first year", minutes: 25,
      blocks: [
        ["p", "Knowledge gets you an interview; evidence gets you the job. Lesson 8.7 pointed to further learning. This lesson is about <b>showing</b> what you can do, and what the first year in industry is like."],
        ["h", "A portfolio that works"],
        ["p", "Employers know that most graduates have only seen a PLC in a lab. Show that you have built things. Five projects, documented well, beat fifty screenshots."],
        ["ul", [
          "<b>1. Motor control library</b>: an FB with start/stop, interlock, feedback, fault, run hours (lessons 3.3, 10.4).",
          "<b>2. A state-machine sequence</b>: a sorting, filling or batching station with modes and fault handling (lessons 10.5, 8.6).",
          "<b>3. A PID loop</b>: a tank or temperature simulation with tuning trace (lessons 7.1, 7.5).",
          "<b>4. HMI</b>: a small WinCC screen set with alarms, trends and user levels (module 5).",
          "<b>5. A documented mini project</b>: I/O list, schematic sketch, FDS (functional description), test sheet (lesson 8.4)."
        ]],
        ["note", "Each project needs a one-page README: what it does, the I/O list, a diagram, how to test it, and what you would improve. A reader should understand it in two minutes."],
        ["h", "What interviewers ask"],
        ["ul", [
          "Explain the scan cycle and why the process image exists.",
          "Describe how you would structure a program for 20 identical motors.",
          "A motor will not start although the output LED is on: how do you find the fault?",
          "How would you commission a new analog loop?",
          "What does your safety circuit do if a wire breaks?",
          "Tell me about a bug you found and how you found it."
        ]],
        ["p", "Prepare short, concrete answers using the pattern <b>situation, what I did, result</b>. Notice that nearly all these questions test <i>thinking order</i>: an engineer who checks the simple things first, makes no assumption about safety, and writes things down."],
        ["reveal", "Model answer: output LED on but motor not running", [
          ["p", "First, safety: I confirm it is safe to approach and that nobody is working on the machine. Then I work from program to field: is the output really on in the watch table? Is there 24 V at the contactor coil? Is the contactor closed and does its feedback contact reach the PLC? Is there power on the load side of the contactor? Is the overload relay or motor breaker tripped? Last, motor, cable, mechanics. I note what I find and what I changed."]
        ]],
        ["h", "Your first year"],
        ["ul", [
          "You will read far more code than you write. Learn the existing standards of the company before 'improving' them.",
          "You will be on site, in noise, dust and heat. Learn to work safely: PPE, lockout, permits.",
          "Be the person who writes things down: change logs, backups, notes on the drawing.",
          "Ask the electricians and operators. They know the machine's real faults and will trust you if you listen.",
          "Never test on a live machine without the owner's permission. Never leave a force in the CPU. Never leave a machine in an unknown state."
        ]],
        ["h", "Stay current"],
        ["ul", [
          "Follow vendor release notes (TIA Portal versions, firmware changes).",
          "Learn the neighbouring skills that make you valuable: networks, drives, a little Python for data and tests, security basics.",
          "Join a user community and answer questions: you learn twice."
        ]],
        ["quiz", {
          q: "Which is the best evidence of PLC skill for a first job?",
          options: [
            "A list of software names on a CV",
            "A few documented projects with I/O list, program and test sheet",
            "A certificate alone",
            "A long list of hobbies"
          ],
          answer: 1,
          why: "Concrete, reviewable work shows skill and communication."
        }],
        ["quiz", {
          q: "The output LED is on, but the motor does not run. What is the best first step on site?",
          options: [
            "Replace the CPU",
            "Make the area safe and check whether the contactor coil receives 24 V, working from program to field",
            "Reload the program",
            "Force the output off and on repeatedly"
          ],
          answer: 1,
          why: "Safety first, then a systematic path from the output to the load."
        }],
        ["try", "Pick the project you are proudest of. Write its README using the five-point structure above, and ask someone who has never seen it to explain it back to you."]
      ]
    }
  ]
});
