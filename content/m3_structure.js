window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 3,
  title: "3 · Program structure",
  lessons: [
    {
      id: "3.1", title: "Blocks: OB, FC, FB and DB", minutes: 15,
      blocks: [
        ["p", "So far everything lived in one block, OB1. Real programs are split into <b>blocks</b>. There are four kinds you must know. Splitting makes programs reusable, testable and readable by other people."],
        ["fig", "block-hierarchy", "OB1 is the entry point. It calls functions and function blocks; blocks keep data in data blocks."],
        ["ul", [
          "<b>OB (Organization Block)</b>: the entry points called by the operating system. <b>OB1</b> every scan, <b>OB100</b> once at startup, <b>OB30</b> on a fixed time interval, and more.",
          "<b>FC (Function)</b>: a reusable routine with <b>no memory</b> of its own. Give it inputs, it returns outputs. Like a pure calculation.",
          "<b>FB (Function Block)</b>: a reusable routine <b>with memory</b>. Each use gets its own <i>instance data block</i> that remembers values between scans (timers, latched states, counters).",
          "<b>DB (Data Block)</b>: a block that holds only data. A <i>global DB</i> is readable by any block. An <i>instance DB</i> belongs to one FB instance."
        ]],
        ["h", "How to choose"],
        ["ul", [
          "Needs to remember anything between scans (a timer, a latch, a state)? <b>FB</b>.",
          "Pure calculation or a stateless action (scale a value, convert units)? <b>FC</b>.",
          "Shared settings, recipes, machine status, data for the HMI? <b>Global DB</b>.",
          "Controlling many similar devices (motors, valves, conveyors)? Write the logic <b>once</b> as an FB and create one instance per device."
        ]],
        ["note", "You already know an FB without realising: a TON timer is an FB with an instance DB that stores its elapsed time. Writing your own is the same idea, with logic you choose."],
        ["quiz", {
          q: "You want a reusable motor block with a start-delay timer inside. Which block type?",
          options: ["FC", "FB", "OB", "Global DB"],
          answer: 1,
          why: "A timer needs memory that persists across scans, which only an FB (with its instance DB) provides."
        }],
        ["quiz", {
          q: "Which block is executed automatically once per scan?",
          options: ["FC1", "FB1", "OB1", "DB1"],
          answer: 2,
          why: "OB1 is the main program cycle. Everything else runs only because OB1 (or another OB) calls it."
        }]
      ]
    },
    {
      id: "3.2", title: "Functions (FC)", minutes: 15,
      blocks: [
        ["p", "A function takes inputs, computes, and gives outputs. It has no memory: any values in it vanish when it ends. It is perfect for calculations and conversions you would otherwise copy and paste."],
        ["h", "Create a function"],
        ["click", "Project tree > PLC_1 > Program blocks > Add new block > Function (FC) > name Calc_Percent > Language: SCL > OK"],
        ["p", "Every block has an <b>interface</b> table at the top. Fill it in before writing code:"],
        ["ul", [
          "<b>Input</b>: values passed in. The function reads them.",
          "<b>Output</b>: values passed back.",
          "<b>InOut</b>: a value the function both reads and modifies.",
          "<b>Temp</b>: scratch variables, valid only during one call.",
          "<b>Constant</b>: named constants.",
          "<b>Return</b>: the function's own return value."
        ]],
        ["p", "For <code>Calc_Percent</code>: Input <code>Raw : Int</code>; Output <code>Percent : Real</code>. Then the code:"],
        ["scl", "// Convert a raw 0..27648 analog value to 0..100 percent\n#Percent := INT_TO_REAL(#Raw) / 27648.0 * 100.0;\n\n// Clamp to the valid range\nIF #Percent < 0.0 THEN\n    #Percent := 0.0;\nELSIF #Percent > 100.0 THEN\n    #Percent := 100.0;\nEND_IF;", "FC Calc_Percent"],
        ["p", "In SCL, a <code>#</code> in front of a name means a <b>local</b> variable of the block (interface variables included). A name in double quotes, such as <code>\"Start_PB\"</code>, is a <b>global</b> tag or data block."],
        ["h", "Call it"],
        ["p", "Open Main [OB1]. Drag <code>Calc_Percent</code> from the Project tree onto a network. A box appears with the input and output pins. Connect <code>Raw</code> to a tag (for example <code>%IW64</code>) and <code>Percent</code> to a Real tag."],
        ["fig", "fc-call", "How the FC looks when you drop it into a ladder network."],
        ["scl", "\"Calc_Percent\"(Raw := \"Tank_Level_Raw\", Percent => \"Tank_Level_Pct\");", "the same call written in SCL"],
        ["note", "Call it as many times as you like with different tags. Each call is independent; nothing carries over between scans. That is also the limit: you cannot keep a running total or use a timer inside an FC."],
        ["try", "Create the FC above in SCL, call it from OB1, download to PLCSIM, and test it by writing a raw value into <code>Tank_Level_Raw</code> in a watch table."],
        ["quiz", {
          q: "You declare <code>#Result</code> in the Temp section of an FC. What is its value on the next scan?",
          options: ["The same as last scan", "It is not guaranteed; Temp values are lost after each call", "Always 0", "Retentive"],
          answer: 1,
          why: "Temp memory is a scratch area reused by other blocks. Never rely on it holding a value."
        }]
      ]
    },
    {
      id: "3.3", title: "Function blocks and instance data", minutes: 25,
      blocks: [
        ["p", "Now we make the 2.8 motor starter reusable. An FB is a template. Every time you call it you provide a <b>new instance data block</b> (instance DB), which stores that call's own memory."],
        ["fig", "fb-instances", "Same code, separate data. Three motors, three instance DBs."],
        ["h", "Declare the interface"],
        ["ul", [
          "<b>Input</b>: <code>Start</code> Bool, <code>Stop_OK</code> Bool (1 = stop button healthy), <code>Overload_OK</code> Bool, <code>Fault_Reset</code> Bool, <code>StartDelay</code> Time = T#3s",
          "<b>Output</b>: <code>Motor</code> Bool, <code>Horn</code> Bool, <code>Fault</code> Bool",
          "<b>Static</b> (memory that survives between scans): <code>Run_Req</code> Bool, and <code>T_Start</code> of type <code>TON</code> (a timer declared as a multi-instance)"
        ]],
        ["scl", "// Fault latch: trips on overload, cleared by reset once healthy\nIF NOT #Overload_OK THEN\n    #Fault := TRUE;\nELSIF #Fault_Reset THEN\n    #Fault := FALSE;\nEND_IF;\n\n// Run request: seal-in, stop wins, blocked by a fault\n#Run_Req := (#Start OR #Run_Req) AND #Stop_OK AND NOT #Fault;\n\n// Start delay\n#T_Start(IN := #Run_Req, PT := #StartDelay);\n\n// Outputs\n#Horn  := #Run_Req AND NOT #T_Start.Q;\n#Motor := #T_Start.Q;", "FB Motor_Ctrl"],
        ["p", "Compare this to the simulator in lesson 2.8. It is the same logic in five lines of text rather than seven networks."],
        ["h", "Call it, once per motor"],
        ["p", "Drag <code>Motor_Ctrl</code> into OB1. TIA Portal asks to create an instance DB. Name it <code>Motor1_DB</code>. Do the same for a second call and name it <code>Motor2_DB</code>. Wire up the inputs and outputs per motor."],
        ["scl", "\"Motor1_DB\"(Start := \"M1_Start_PB\",\n             Stop_OK := \"M1_Stop_PB\",\n             Overload_OK := \"M1_Ovl_OK\",\n             Fault_Reset := \"Reset_PB\",\n             Motor => \"M1_Run\",\n             Horn => \"M1_Horn\",\n             Fault => \"M1_Fault\");\n\n\"Motor2_DB\"(Start := \"M2_Start_PB\",\n             Stop_OK := \"M2_Stop_PB\",\n             Overload_OK := \"M2_Ovl_OK\",\n             Fault_Reset := \"Reset_PB\",\n             Motor => \"M2_Run\",\n             Horn => \"M2_Horn\",\n             Fault => \"M2_Fault\");", "OB1 calling two instances"],
        ["note", "In SCL, <code>:=</code> passes a value into an input, and <code>=&gt;</code> reads a value out of an output."],
        ["warn", "Do not call the same instance DB from two places in the program. The two calls would overwrite each other's memory, producing baffling behaviour. One call site, one instance."],
        ["h", "Why this is the heart of professional programming"],
        ["ul", [
          "Fix a bug once, in the FB, and every motor benefits.",
          "Add a tenth motor with one call and one DB.",
          "A single, tested block is easier to review than ten copies that drifted apart.",
          "TIA Portal keeps a type version and can update all instances when the FB changes."
        ]],
        ["try", "Turn your 2.8 solution into this FB, create <code>Motor1_DB</code> and <code>Motor2_DB</code>, and drive both from PLCSIM. Make sure faulting motor 1 does not affect motor 2."],
        ["quiz", {
          q: "Two motors use the same FB. Where is each motor's <code>Run_Req</code> bit stored?",
          options: ["In the FB itself, shared", "In each motor's own instance data block", "In M memory", "In the CPU's load memory"],
          answer: 1,
          why: "The FB is only code. Each instance DB holds that call's Static variables."
        }]
      ]
    },
    {
      id: "3.4", title: "Data blocks and UDTs", minutes: 15,
      blocks: [
        ["p", "Some data is not tied to one block: recipes, machine settings, counts, status for the HMI. It belongs in a <b>global data block</b>."],
        ["click", "Project tree > PLC_1 > Program blocks > Add new block > Data block (DB) > Type: Global DB > name Plant_Data > OK"],
        ["p", "Add variables in the table: name, type, start value, and a Retain checkbox. A <b>start value</b> is the value loaded when the block is first downloaded. The <b>actual value</b> is the live one; compare them while online."],
        ["h", "Optimized vs standard access"],
        ["ul", [
          "<b>Optimized block access</b> (the default for new blocks): TIA arranges the memory itself, you address variables by <i>name</i>. Faster, packs data efficiently, and avoids offset mistakes. Use it unless a partner device forces otherwise.",
          "<b>Standard access</b>: fixed byte offsets you control. Needed for some older communication partners or when you read the DB through absolute addresses."
        ]],
        ["fig", "db-layout", "Standard access uses fixed offsets. Optimized access uses names only."],
        ["h", "UDT: your own data types"],
        ["p", "A <b>PLC data type</b> (UDT) groups related variables into one type. Define it once and reuse it for every device or recipe."],
        ["code", "PLC data type  Type_Motor\n  Cmd_Start    Bool\n  Cmd_Stop     Bool\n  Running      Bool\n  Fault        Bool\n  Speed_SP     Real\n  Run_Hours    DInt", "Example UDT as shown in the editor"],
        ["scl", "\"Plant_Data\".Motors[1].Cmd_Start := TRUE;\nIF \"Plant_Data\".Motors[1].Fault THEN\n    \"Plant_Data\".AlarmCount := \"Plant_Data\".AlarmCount + 1;\nEND_IF;", "using the UDT inside a DB array"],
        ["p", "A DB can hold an <code>Array[1..10] of Type_Motor</code>. An HMI can then bind to <code>Motors[3].Running</code> without anyone remembering an address."],
        ["note", "<b>Retentive</b> variables survive a power cut or a STOP&rarr;RUN transition. Use them for counts and recipes; avoid making everything retentive because retentive memory is limited."],
        ["quiz", {
          q: "Why prefer optimized block access?",
          options: ["It is mandatory for OB1", "TIA manages memory layout, so you use names, and it is faster and safer", "It allows absolute addresses", "It disables retention"],
          answer: 1,
          why: "Optimized access removes manual offsets and is the recommended default for new blocks."
        }]
      ]
    },
    {
      id: "3.5", title: "Organization blocks: startup, cyclic and errors", minutes: 15,
      blocks: [
        ["p", "OB1 is only one of many OBs. The CPU's operating system calls each organization block when a specific event happens. Think of OBs as event handlers."],
        ["ul", [
          "<b>OB1 Main</b>: every scan.",
          "<b>OB100 Startup</b>: once, when the CPU goes from STOP to RUN. Use it to initialise values and clear states.",
          "<b>OB30 to OB38 Cyclic interrupt</b>: runs at a fixed interval (default 100 ms), independent of the scan time. Use for control loops that need a constant sample time.",
          "<b>OB40 Hardware interrupt</b>: reacts at once to an input edge you configure. Used for fast events.",
          "<b>OB10 Time-of-day</b>: at a given clock time.",
          "<b>OB82, OB86 and more: diagnostic and error OBs</b>: called when a module fails, a rack fault occurs, or programming errors happen.",
          "<b>OB80 Time error</b>: called if the scan exceeds the maximum cycle time."
        ]],
        ["h", "Creating a startup OB"],
        ["click", "Program blocks > Add new block > Organization block > Startup > OB100"],
        ["scl", "// OB100: runs once at STOP -> RUN\n\"Plant_Data\".AlarmCount := 0;\n\"Plant_Data\".Recipe_Time := T#10s;\nFOR #i := 1 TO 3 DO\n    \"Plant_Data\".Motors[#i].Cmd_Start := FALSE;\nEND_FOR;", "OB100 example. #i is declared in the OB's Temp section."],
        ["h", "Cyclic interrupt OBs"],
        ["click", "Add new block > Organization block > Cyclic interrupt > cycle time 100000 (µs)"],
        ["p", "If OB1's scan time varies (it will, as your program grows), a sample-based calculation such as a PID or a filter would use an inconsistent time step. A cyclic OB runs at a steady rhythm and interrupts OB1 to do it."],
        ["fig", "ob-timeline", "OB100 runs once, OB1 repeats, and a cyclic OB such as OB30 interrupts OB1 at a fixed interval."],
        ["warn", "Keep interrupt OBs short. Every millisecond they use is stolen from OB1. If OB1 is delayed beyond the maximum cycle time, the CPU raises a time error and may go to STOP."],
        ["note", "The fault OBs are why a CPU may run or stop when a module fails. Whether it stops depends on whether you handle the error in an OB. Production programs deliberately decide this."],
        ["quiz", {
          q: "You must initialise a set of values every time the CPU starts. Where?",
          options: ["OB1, in the first network", "OB100", "OB30", "In a watch table"],
          answer: 1,
          why: "OB100 runs exactly once on every transition to RUN, which is ideal for initialisation."
        }]
      ]
    },
    {
      id: "3.6", title: "Professional structure and style", minutes: 15,
      blocks: [
        ["p", "Anyone can make a PLC program that works on the day. Professionals make one that someone else can read at 3 a.m. during a breakdown, and change without breaking it. This lesson is a checklist of habits."],
        ["h", "Structure"],
        ["ul", [
          "<b>Keep OB1 thin.</b> It should read like a table of contents: calls to blocks per machine area (<code>Conveyor1</code>, <code>Mixer</code>, <code>Alarms</code>), not logic.",
          "<b>One block per equipment piece.</b> A motor FB, a valve FB, a conveyor FB, instantiated per device.",
          "<b>Folders.</b> Group blocks in folders under Program blocks (<code>Equipment</code>, <code>Utilities</code>, <code>Interfaces</code>).",
          "<b>Separate concerns.</b> Input handling, logic, output handling; do not mix raw I/O into deep logic. Keep I/O in one place so a rewire changes one block."
        ]],
        ["h", "Naming and comments"],
        ["ul", [
          "A naming standard on day one, and use it everywhere: <code>Equipment_Function_Type</code> such as <code>Conv1_Run</code>, <code>Tank2_Level_Raw</code>.",
          "Every network gets a <b>title</b>. Every block gets a header comment saying what it does.",
          "Comment <i>why</i>, not <i>what</i>: <i>&quot;Stop wins so a held Start cannot override it&quot;</i> is useful; <i>&quot;AND the two contacts&quot;</i> is not."
        ]],
        ["h", "Robustness"],
        ["ul", [
          "<b>One writer per bit.</b> Each output or memory bit is driven from one place.",
          "<b>No magic numbers.</b> A named constant such as <code>Max_Level_Pct</code> beats a bare <code>85</code>.",
          "<b>Fail safe.</b> Wire stops and guards NC; define what every output does on a fault or on power-up.",
          "<b>Handle faults</b> deliberately: latch them, display them, require a reset."
        ]],
        ["h", "Tools TIA Portal gives you"],
        ["ul", [
          "<b>Cross-reference list</b> (right-click a tag &gt; Go to &gt; Cross-reference) shows everywhere a tag is used and whether it is read or written. Check it for duplicate writers.",
          "<b>Libraries</b>: store tested FBs and UDTs as <i>types</i> or <i>master copies</i> in the project library or a global library, and reuse them across projects. Types are versioned.",
          "<b>Compare</b>: Offline/online and project-to-project comparison tells you what changed.",
          "<b>Version control</b>: archive projects with a date/version (<i>Project &gt; Archive</i>), and keep a change log. Siemens offers Multiuser Engineering for teams, and a Git-friendly project format: the Version Control Interface (VCI) add-on in earlier versions and, from TIA Portal V21 (announced November 2025), a built-in text export for LAD, FBD, SCL and data structures. Teams adopt one deliberately."
        ]],
        ["note", "You do not need all of this on day one. But learn the habit of tidy structure now: it is far easier than retrofitting a mess."],
        ["quiz", {
          q: "Which is the best content for OB1 in a mature project?",
          options: ["All the logic in one long list of networks", "A short list of block calls, one per machine area or device", "Only the startup initialisation", "Nothing"],
          answer: 1,
          why: "A thin OB1 that calls structured blocks is easiest to read, debug and extend."
        }],
        ["try", "Take your 3.3 project and: add network titles, create a folder named Equipment for the Motor_Ctrl FB, and open the cross-reference of <code>M1_Run</code>. Does exactly one place write it?"]
      ]
    }
  ]
});
