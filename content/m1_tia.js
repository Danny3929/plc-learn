window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 1,
  title: "1 · TIA Portal essentials",
  lessons: [
    {
      id: "1.1", title: "What TIA Portal is and what you need", minutes: 10,
      blocks: [
        ["p", "<b>TIA Portal</b> (Totally Integrated Automation Portal) is Siemens' single engineering environment. One program, one project file, covering several jobs:"],
        ["ul", [
          "<b>STEP 7</b>: programming and configuring PLCs (what this course uses).",
          "<b>WinCC</b>: designing HMI screens (operator panels), covered in a later module.",
          "<b>Startdrive</b>: setting up Siemens drives and motors.",
          "<b>S7-PLCSIM</b>: a virtual PLC on your PC, so you can test with no hardware."
        ]],
        ["h", "Editions"],
        ["ul", [
          "<b>STEP 7 Basic</b>: S7-1200 only.",
          "<b>STEP 7 Professional</b>: S7-1200, S7-1500 and older families. This is what you want for a full course.",
          "<b>S7-PLCSIM</b>: the simulator for S7-1200 and S7-1500 CPUs. It is a separate install that must match your TIA Portal version (for example TIA V19 with PLCSIM V19). <b>S7-PLCSIM Advanced</b> is a different, separately licensed product for S7-1500, with extras such as more instances and scripting. You do not need it for this course."
        ]],
        ["h", "What your PC needs"],
        ["ul", [
          "Windows 10 or 11, 64-bit (Pro or Enterprise are the safest; check the Siemens installation notes for your exact version).",
          "16 GB RAM or more is strongly recommended. TIA Portal is heavy.",
          "An SSD and <b>tens of gigabytes of free disk space</b> (budget 30 GB or more, and more again for PLCSIM). The installer extracts to a temporary folder first.",
          "Administrator rights, and a restart before installation if Windows has pending updates."
        ]],
        ["note", "Siemens normally offers a time-limited trial (21 days historically) of TIA Portal and PLCSIM on its support website, and sells student and standard licences. Check the Siemens site for the current terms and the exact download; I cannot verify what is on offer today."],
        ["note", "<b>Which version?</b> TIA Portal V21 was announced in November 2025, and V19 and V20 are still widely installed. This course works on V17 or later; menu names and dialogs differ slightly between versions. The trial package normally includes STEP 7 Professional, WinCC and PLCSIM."],
        ["warn", "Install TIA Portal and PLCSIM of the <b>same version</b> and install them from the same download family. Mixed versions are the most common cause of &quot;PLCSIM cannot see my CPU&quot; problems."],
        ["try", "Check your free disk space on C: (File Explorer &gt; This PC). If it is under 40 GB, free some up before you start the installer."],
        ["quiz", {
          q: "You want to practise on an S7-1500 without buying hardware. What do you need?",
          options: ["STEP 7 Basic only", "STEP 7 Professional plus a matching PLCSIM", "WinCC only", "Nothing, TIA Portal programs without a CPU"],
          answer: 1,
          why: "Basic only covers S7-1200. S7-1500 needs Professional, and PLCSIM provides the virtual CPU."
        }]
      ]
    },
    {
      id: "1.2", title: "A tour of the interface", minutes: 12,
      blocks: [
        ["p", "TIA Portal has two views you can toggle between with the link in the bottom-left corner. <b>Portal view</b> is a task-oriented launcher with big buttons (Create project, Devices &amp; networks, PLC programming...). <b>Project view</b> is the real working environment. Professionals live in Project view, and so will you."],
        ["fig", "tia-view", "The Project view. Numbers match the list below."],
        ["ul", [
          "<b>1 Project tree</b>: everything in the project in a tree: devices, program blocks, tag tables, watch tables. Double-click to open.",
          "<b>2 Work area</b>: the editor. A block program, the hardware view, a tag table. Several tabs can be open.",
          "<b>3 Task cards</b>: tabs on the right edge. <i>Instructions</i> (the toolbox of LAD/SCL instructions), <i>Testing</i>, <i>Libraries</i>.",
          "<b>4 Inspector window</b>: properties of whatever is selected, plus the <i>Info &gt; Compile</i> tab where error messages appear.",
          "<b>5 Portal view / editor bar</b>: switch views and jump between open editors."
        ]],
        ["h", "Commands you will use constantly"],
        ["ul", [
          "<b>Compile</b>: right-click the device or use the toolbar. <code>Ctrl+B</code> compiles the selected object.",
          "<b>Download to device</b>: <i>Online &gt; Download to device</i> (<code>Ctrl+L</code>), or the toolbar button.",
          "<b>Go online or offline</b>: <i>Online &gt; Go online</i>. <i>Go offline</i> is <code>Ctrl+M</code>.",
          "<b>Start the simulator</b>: <i>Online &gt; Simulation &gt; Start</i>.",
          "<code>Ctrl+S</code> saves the project."
        ]],
        ["note", "Menu items show their shortcut beside them (the Online menu in Siemens documentation shows Ctrl+L for Download to device and Ctrl+M for Go offline). Shortcuts differ between versions and can be changed under <i>Options &gt; Settings &gt; General &gt; Keyboard shortcuts</i> (customising is possible from V14 SP1). Learn the menu path first; the shortcut follows."],
        ["try", "Open TIA Portal, switch between Portal view and Project view once, and find the Instructions task card and the Inspector window."],
        ["quiz", {
          q: "Where do compile errors and warnings appear?",
          options: ["Project tree", "Inspector window, Info &gt; Compile tab", "Portal view only", "The Instructions task card"],
          answer: 1,
          why: "After a compile, the Inspector window's Info tab lists errors with double-click-to-jump links."
        }]
      ]
    },
    {
      id: "1.3", title: "Your first project and hardware", minutes: 15,
      blocks: [
        ["p", "Every TIA Portal job starts with a <b>project</b>, then a description of the <b>hardware</b>. The program needs to know which CPU it is for, because that decides which instructions exist and which addresses are real."],
        ["h", "Create the project"],
        ["click", "Portal view > Create new project > name it FirstProject > Create"],
        ["p", "Choose a short path with no unusual characters, on a drive with space. Then pick <b>Configure a device &gt; Add new device</b>."],
        ["h", "Add the PLC"],
        ["click", "Add new device > Controllers > SIMATIC S7-1200 > CPU > CPU 1214C DC/DC/DC > Add"],
        ["p", "Pick a version number from the drop-down. If you plan to use PLCSIM, check Siemens' documentation for which CPU versions your PLCSIM release supports; a mismatch is a common cause of download problems."],
        ["fig", "hw-config", "Device view. 1 communication module slots, 2 the CPU with its built-in I/O, 3 the hardware catalog on the right where you drag extra modules from."],
        ["h", "What got created"],
        ["ul", [
          "<b>Device configuration</b>: a virtual rack. The CPU 1214C has 14 digital inputs (I0.0 to I1.5), 10 digital outputs (Q0.0 to Q1.1) and 2 analog inputs (IW64, IW66) built in.",
          "<b>Program blocks</b> with one block already present: <b>Main [OB1]</b>, the program that runs every scan.",
          "<b>PLC tags</b> and <b>Watch and force tables</b> folders (empty for now)."
        ]],
        ["p", "Select the CPU in the device view and look at the <b>Inspector &gt; Properties &gt; General</b>. You will find the IP address (PROFINET interface), the system and clock memory settings, and protection options. You will use these in lesson 1.5."],
        ["note", "Real projects begin by recreating the physical hardware exactly: same CPU order number, same modules in the same slots. If they differ, the PLC will reject the download or run with faults."],
        ["try", "Create the project, add the CPU 1214C DC/DC/DC, open Device configuration and find the I/O addresses of the built-in inputs in the Device overview table."],
        ["quiz", {
          q: "Which block is created automatically with a new PLC and runs on every scan?",
          options: ["OB100", "Main [OB1]", "DB1", "FC1"],
          answer: 1,
          why: "Main [OB1] is the program cycle organization block, executed once per scan."
        }]
      ]
    },
    {
      id: "1.4", title: "Tags and addresses", minutes: 15,
      blocks: [
        ["p", "Your program refers to the real world by <b>address</b>, a location in the CPU's I/O or memory. Humans prefer <b>names</b>. A <b>tag</b> links the two: <code>Start_PB</code> means <code>%I0.0</code>."],
        ["fig", "address-map", "%I0.3 means input area, byte 0, bit 3. Bits run 0 to 7 inside a byte."],
        ["h", "The tag table"],
        ["fig", "tag-table", "The default tag table. Every named signal lives here."],
        ["click", "Project tree > PLC_1 > PLC tags > Default tag table"],
        ["p", "In the first empty row, type a name, keep the type <code>Bool</code>, and type an address such as <code>%I0.0</code>. Add a comment. Do this for a start button, a stop button, and a motor output."],
        ["h", "Naming that scales"],
        ["ul", [
          "Describe the <b>thing</b>, not the address: <code>Conveyor1_Run</code>, not <code>Q0_3</code>.",
          "Use consistent words: <code>_PB</code> push button, <code>_Sen</code> sensor, <code>_Run</code> command, <code>_Fault</code>.",
          "No spaces; letters, digits and underscores. Start with a letter.",
          "Use comments for the physical details: &quot;Start button, panel A, terminal X1:3&quot;."
        ]],
        ["note", "You can also type an address straight onto a contact in the editor (for example <code>%I0.0</code>). TIA Portal then creates a tag called Tag_1 for you. It works, but rename it immediately; unnamed tags make programs unreadable."],
        ["warn", "The address <code>%I0.0</code> refers to the <i>hardware channel</i>. If you rewire a sensor to a different terminal, change the address in the tag table once and every use in the program follows. That is the whole point of tags."],
        ["quiz", {
          q: "What does <code>%Q0.3</code> refer to?",
          options: ["Input byte 0, bit 3", "Output byte 0, bit 3", "Memory byte 3, bit 0", "Analog output 3"],
          answer: 1,
          why: "Q is the output area. 0 is the byte and 3 is the bit."
        }],
        ["quiz", {
          q: "Why use tag names instead of raw addresses?",
          options: ["The PLC runs faster", "Programs are readable and wiring changes happen in one place", "Raw addresses are not allowed", "Tags use less memory"],
          answer: 1,
          why: "Names carry meaning, and the tag table maps them to addresses centrally."
        }],
        ["try", "Create three tags in the default tag table: <code>Start_PB</code> %I0.0, <code>Stop_PB</code> %I0.1, <code>Motor_Run</code> %Q0.0. Give each a comment."]
      ]
    },
    {
      id: "1.5", title: "Compile, download and PLCSIM", minutes: 20,
      blocks: [
        ["p", "Your project on disk is <b>offline</b>. The program only runs after you <b>compile</b> it and <b>download</b> it to a CPU, real or simulated."],
        ["fig", "online-offline", "Download pushes the project to the CPU. Going online lets TIA Portal watch the real running program."],
        ["h", "Step 1: compile"],
        ["click", "Project tree > select PLC_1 > Compile (Ctrl+B)"],
        ["p", "Errors (red) must be fixed. Warnings (yellow) deserve a look. Details appear in <b>Inspector &gt; Info &gt; Compile</b>."],
        ["h", "Step 2: allow simulation"],
        ["p", "PLCSIM talks to TIA Portal like a real PLC, and recent CPUs are locked down by default. If the download is refused, check two things (names vary by version):"],
        ["ul", [
          "CPU <b>Properties &gt; General &gt; Protection &amp; Security &gt; Connection mechanisms</b>: tick <i>Permit access with PUT/GET communication from remote partner</i>.",
          "Project <b>Properties &gt; Protection</b>: <i>Support simulation during block compilation</i> should be ticked. In recent versions it usually is by default; if PLCSIM reports that blocks were not compiled for simulation, tick it and compile again."
        ]],
        ["warn", "Both settings reduce security. They are fine for a learning simulation. On a real plant PLC, leave PUT/GET off unless a design requires it."],
        ["fig", "tia-online-menu", "The Online menu. The numbers match the three things you will use in this lesson."],
        ["h", "Step 3: start the simulator and download"],
        ["click", "Online > Simulation > Start simulation"],
        ["p", "PLCSIM opens. TIA Portal then shows the <b>Extended download to device</b> dialog. Choose PG/PC interface type <code>PN/IE</code> and the PLCSIM adapter, click <b>Start search</b>, select the found CPU, then <b>Load</b>. On the last page choose <b>Start module</b>."],
        ["h", "Step 4: go online and watch"],
        ["click", "Go online > open Main [OB1] > Monitoring on/off (glasses icon)"],
        ["p", "Contacts and wires turn green when they carry power. To change an input in PLCSIM use its <b>SIM table</b>: add your tag (for example <code>Start_PB</code>) and tick the bit."],
        ["h", "Watch tables"],
        ["p", "For a spreadsheet-like view of many tags, create a watch table: <b>Project tree &gt; PLC_1 &gt; Watch and force tables &gt; Add new watch table</b>. Type tag names in the Name column, click the glasses, and use <b>Modify</b> to set values."],
        ["warn", "<b>Force</b> tables override a signal permanently and bypass the program. Never force on real equipment unless you know exactly what that signal is connected to."],
        ["h", "If it will not work"],
        ["ul", [
          "No CPU found: version mismatch between TIA Portal and PLCSIM, or the wrong adapter selected.",
          "&quot;Block compiled without simulation support&quot;: enable the project simulation option and recompile.",
          "Download blocked: PUT/GET not permitted (see above).",
          "CPU in STOP: press Run in PLCSIM, or <i>Online &gt; Start CPU</i> in TIA Portal."
        ]],
        ["quiz", {
          q: "What must happen before a program can be downloaded?",
          options: ["Nothing", "It must compile without errors", "The CPU must be in STOP forever", "A watch table must exist"],
          answer: 1,
          why: "A project with compile errors cannot be loaded; fix them in the Info &gt; Compile tab."
        }],
        ["try", "Start PLCSIM, download your hardware configuration, set the CPU to RUN, go online, and confirm that the PLC shows green RUN status. If you get stuck, tell Claude the exact message."]
      ]
    },
    {
      id: "1.6", title: "Your first program", minutes: 15,
      blocks: [
        ["p", "Time to write real logic. The goal: <b>the motor output follows the start button</b>. It is the &quot;Hello World&quot; of PLCs."],
        ["h", "Preview it in the simulator first"],
        ["sim", {
          title: "Your first rung: contact and coil",
          inputs: [{ tag: "Start_PB", addr: "%I0.0", label: "Start push button", kind: "push" }],
          outputs: [{ tag: "Motor_Run", addr: "%Q0.0", label: "Motor contactor", kind: "motor" }],
          rungs: [{ title: "Motor follows the button", c: [["NO", "Start_PB"]], o: ["coil", "Motor_Run"] }]
        }],
        ["p", "Press and hold the button. Power flows through the contact to the coil, and the output switches on. Release it and the rung goes dead. This is real ladder behaviour, scan by scan."],
        ["h", "Now build it in TIA Portal"],
        ["click", "Project tree > PLC_1 > Program blocks > double-click Main [OB1]"],
        ["ul", [
          "In the <b>Instructions</b> task card open <i>Basic instructions &gt; Bit logic operations</i>. Drag a <b>normally open contact</b> (<code>--| |--</code>) onto Network 1. (Or use the toolbar above the network.)",
          "Drag a <b>coil</b> (<code>--( )--</code>) to the right end of the same network.",
          "Click the <code>&lt;??.?&gt;</code> above the contact and type <code>Start_PB</code> (the name from your tag table). Do the same for the coil with <code>Motor_Run</code>."
        ]],
        ["click", "Compile > Download to device > Go online > Monitoring"],
        ["p", "In the PLCSIM SIM table set <code>Start_PB</code> (%I0.0) on and off, and watch the rung and <code>Motor_Run</code> (%Q0.0) respond."],
        ["note", "If the contact or coil shows a red box, the tag name is missing or mistyped. Right-click it and choose <i>Define tag</i> or fix the name."],
        ["try", "Build and run this rung in TIA Portal, in PLCSIM, with monitoring on. Take a screenshot and show Claude if anything is red."],
        ["quiz", {
          q: "In the rung <code>Start_PB</code> then <code>Motor_Run</code>, when is Motor_Run on?",
          options: ["Always", "Only while Start_PB is true", "Only for one scan after Start_PB is pressed", "Never, it needs a timer"],
          answer: 1,
          why: "The coil reflects the power reaching it, so it follows the contact. Remembering the press needs a seal-in, lesson 2.3."
        }]
      ]
    }
  ]
});
