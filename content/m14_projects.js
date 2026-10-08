window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 14,
  title: "14 · Projects",
  lessons: [
    {
      id: "P1", title: "HMI project: bottle packing line", minutes: 60,
      blocks: [
        ["p", "<b>The brief.</b> A conveyor carries bottles toward a packing case. The operator needs a panel that shows the bottle moving, shows the case filling, lets them choose <b>Automatic</b> or <b>Manual</b> mode and <b>Start</b> or <b>Stop</b> the belt. You will build both halves: a small simulation in the PLC (so you need no real conveyor) and the HMI screen on a KTP600 Basic Panel."],
        ["fig", "bottle-screen", "The finished screen and the animations it uses. All objects must sit inside the panel's 320 &times; 240 pixel work area."],
        ["h", "What you will practise"],
        ["ul", [
          "Adding an HMI to an existing PLC project and connecting the two (lesson 5.1)",
          "Giving the panel an IP address in the PLC's subnet",
          "Sharing tags: one tag table, both devices (lesson 5.2)",
          "Button animations: <i>Appearance</i> for mode, <i>Horizontal movement</i> for the bottle, <i>Visibility</i> for the case",
          "Testing in the runtime simulator before touching hardware"
        ]],
        ["note", "Panel and software names here follow the Siemens Basic Panel course material this project is based on (KTP600 Basic color PN). The same steps work on other Basic and Comfort panels; the toolbox looks slightly different on newer WinCC versions."],

        ["h", "Step 1 · Simulate the bottle in the PLC"],
        ["p", "Create a function block <b>Simulation [FB2]</b>. It counts from 0 to 50, and each count is one step of the bottle along the belt. When the count reaches 50 the bottle has left the conveyor and a sensor pulse is raised."],
        ["fig", "fb2-simulation", "FB2: an interface table, a CTU counter (multi-instance) in network 1 and the bottle sensor pulse in network 2."],
        ["p", "<b>Interface</b>: inputs <code>start</code> and <code>pulse</code> (Bool), output <code>bottle_sensor</code> (Bool), static <code>IEC_Counter_0</code> (the counter instance) and temp <code>status_counter</code> (Int). <code>pulse</code> is a clock: use a clock memory byte (CPU properties &gt; System and clock memory) so it ticks without you coding a timer."],
        ["p", "The same logic written in SCL, if you prefer text:"],
        ["scl", "// FB Simulation: bottle runs from 0 to 50, then raises a sensor pulse\n#IEC_Counter_0(CU := #start AND #pulse,\n               R  := #status_counter >= 50,\n               PV := 50,\n               CV => #status_counter);\n\n// true for exactly one scan when the count is 50\n#bottle_sensor := (#status_counter = 50);", "FB Simulation"],
        ["p", "Why does the sensor pulse last one scan? In the scan where the count becomes 50, network 2 sees 50 and the sensor is true. In the next scan the counter's <code>R</code> input sees 50 and resets the count to 0, so the sensor goes false again."],
        ["quiz", {
          q: "Why is the counter's reset tied to <code>status_counter &gt;= 50</code>?",
          options: ["To stop the PLC", "So the bottle count restarts at 0 for the next bottle", "To make the clock faster", "To clear all HMI tags"],
          answer: 1,
          why: "Each pass of 0 to 50 is one bottle crossing the belt. Resetting at the end lets the next bottle start from the left again."
        }],
        ["h", "Practise the counting logic"],
        ["p", "Before building the screen, try the packing logic itself: press Start, tap the bottle sensor each time a bottle arrives, and the case lamp lights when the case holds four."],
        ["sim", {
          title: "Packing counter: four bottles fill a case",
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start (NO)", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop", kind: "push", nc: true },
            { tag: "Bottle_Sensor", addr: "%I0.2", label: "Bottle sensor (tap it)", kind: "push" },
            { tag: "Case_Replaced", addr: "%I0.3", label: "Case replaced: reset", kind: "push" }
          ],
          outputs: [
            { tag: "Belt", addr: "%Q0.0", label: "Belt motor", kind: "motor" },
            { tag: "Case_Full", addr: "%Q0.1", label: "Case full lamp", kind: "lamp", color: "#2fb86a" }
          ],
          rungs: [
            { title: "Run request; stops when the case is full", c: [["par", [[["NO", "Start_PB"]], [["NO", "Run_Req"]]]], ["NO", "Stop_PB"], ["NC", "Case_Full"]], o: ["coil", "Run_Req"] },
            { title: "Belt motor", c: [["NO", "Run_Req"]], o: ["coil", "Belt"] },
            { title: "Count bottles into the case", c: [["NO", "Bottle_Sensor"]], o: ["ctu", "C_Case", 4, "Case_Replaced"] },
            { title: "Lamp when the case holds four", c: [["NO", "C_Case.Q"]], o: ["coil", "Case_Full"] }
          ]
        }],

        ["h", "Step 2 · Add the HMI and its connection"],
        ["click", "Project tree > Add new device > HMI > SIMATIC Basic Panel > 6\" Display > KTP600 Basic color PN > OK"],
        ["p", "In the wizard keep the default layout, and let it connect the panel to the PLC. Then compare what you see to the figure below: the project tree on the left, the work area in the middle with the panel and its F1 to F6 keys, the toolbox on the right and the properties window along the bottom."],
        ["fig", "wincc-interface", "The WinCC engineering interface. You will spend most of this project in the work area and the properties window."],
        ["h", "Step 3 · Give the panel an IP address"],
        ["p", "The panel has to be reachable from your PC and from the PLC, so it needs an address in the PLC's subnet. If the PLC is <code>192.168.0.1</code>, use <code>192.168.0.5</code> for the panel (the course specification uses this address for all applications)."],
        ["fig", "hmi-ip-flow", "Reading the MAC, switching to Transfer mode, assigning and checking the address."],
        ["note", "Put the panel in <b>Transfer mode</b> first, otherwise the engineering PC cannot find it. If the panel is not visible in <i>Accessible devices</i>, check the cable and your PC's own IP settings before suspecting the project."],
        ["h", "Step 4 · Tags, shared between PLC and HMI"],
        ["fig", "common-tags", "A tag created in the PLC appears in the HMI list. You do not retype it."],
        ["p", "Create the PLC data block <b>conveyor_DB</b> (non-optimised, or set <i>Accessible from HMI</i> on each variable) and give it these tags:"],
        ["ul", [
          "<code>man</code>, <code>auto</code>: Bool, set by the mode buttons",
          "<code>on</code>, <code>off</code>: Bool, set by Start and Stop",
          "<code>automan</code>: Int or Bool, 1 = automatic, 0 = manual (the look of the mode button depends on it)",
          "<code>sensor_bottle</code>, <code>reset_counter</code>, <code>motor</code>, <code>motorauto</code>",
          "<code>status_counter</code>: Int, 0 to 50, the bottle position"
        ]],
        ["fig", "hmi-arch", "The engineering PC, the panel and the PLC share one tag list."],

        ["h", "Step 5 · Mode buttons that change colour"],
        ["p", "Draw two buttons, <b>Automatic</b> and <b>Manual</b>, on the screen. Make <b>Manual</b> change colour when the machine is in manual mode: white text on a blue background when <code>automan = 0</code>, no flashing."],
        ["click", "Select the button > Properties > Animations > Appearance > Tag: conveyor_DB_automan > Type: Range > add range 0 with foreground white and background blue, Flashing: No", "In WinCC"],
        ["fig", "button-appearance", "The Appearance animation: the PLC tag decides, the button just reflects it."],
        ["p", "Now test it. Start the runtime simulation and flip the tag in PLCSIM:"],
        ["click", "Online > Simulation > Start (on the HMI)"],
        ["fig", "rt-simulator", "The runtime simulator shows the panel as it will look on the machine."],
        ["try", "Make the Manual button turn blue when <code>automan = 0</code>, and show the plain grey button when <code>automan = 1</code>. Screenshot the two states for your notes."],

        ["h", "Step 6 · Start and Stop buttons"],
        ["p", "Create a <b>Start</b> button (<code>on</code>) and a <b>Stop</b> button (<code>off</code>). Make Stop a <b>red</b> background so the two cannot be confused. Remember lesson 5.2: the buttons only set command bits; the PLC decides whether to run."],
        ["warn", "A Stop on the HMI is a <i>normal</i> stop. It is never a substitute for the hardwired emergency stop (lesson 8.2)."],

        ["h", "Step 7 · Move the bottle"],
        ["p", "Draw a bottle (a rectangle and a neck, grouped) at the left of the conveyor. Then:"],
        ["click", "Select the bottle > Properties > Animations > Movements > Horizontal movement (double-click) > Tag: status_counter, range 0 to 50, start and end position in pixels", "In WinCC"],
        ["p", "As the counter rises from 0 to 50, the bottle slides from the start position to the end position. In the Allen-Bradley panels the idea is identical: a number held in a location sets the object's position."],
        ["h", "Step 8 · The case and its bottles"],
        ["ul", [
          "Draw a <b>rectangle</b> for the case with a transparent background; choose the border width, position and size.",
          "Draw lines for the case if you want a lid. Select everything by dragging a border around it, then <i>Edit &gt; Group</i>.",
          "Add <b>Visibility</b> animations on the rectangle and the lines using <code>Conveyor_DB_reset_counter</code>: invisible at value 1.",
          "Draw a <b>circle</b> in the lower right field of the case, copy and paste it for the other bottles.",
          "Give each circle a Visibility animation on the case count, with each one needing <b>one more</b> than the one before. The last bottle's range is the value only it reaches."
        ]],
        ["p", "The <b>expression editor</b> lets you write the condition for visibility (for example <code>Bottles_In_Case &gt;= 3</code>) instead of a plain range."],
        ["h", "Step 9 · Save, load, test"],
        ["p", "Save the project, load the HMI to the panel (or run it in the simulator) and test the whole line: start the belt, watch the bottle, watch the case fill, replace the case."],

        ["h", "Acceptance checklist"],
        ["ul", [
          "The bottle moves smoothly from the left to the right as the count goes 0 to 50.",
          "The Manual button is blue when <code>automan = 0</code>; Stop is red.",
          "Pressing Start while the case is full does nothing (the PLC refuses).",
          "The case fills one bottle at a time and the lamp or visibility reflects the count.",
          "Everything fits inside the 320 &times; 240 work area; the screen is readable at arm's length.",
          "The HMI tag list and the PLC tag list match; you can explain each one."
        ]],
        ["reveal", "Stuck? Common problems", [
          ["ul", [
            "<b>Tag not found in the HMI list:</b> the DB is optimised and the variable is not marked accessible from HMI/OPC UA.",
            "<b>Panel not reachable:</b> Transfer mode is off, or the panel and PC are in different subnets.",
            "<b>Bottle does not move:</b> the animation range does not match the tag's real range (0 to 50), or the FB is never called from OB1.",
            "<b>Colour never changes:</b> the Appearance range uses the wrong value (0 vs 1), or the tag is the wrong one."
          ]]
        ]],
        ["h", "Extensions"],
        ["ul", [
          "Add a speed setpoint (I/O field) that changes how fast the counter climbs.",
          "Add an alarm when the case is full and the belt is still asked to run.",
          "Port the screen to Allen-Bradley (lesson 12.1) and note what each tool calls the same ideas."
        ]],
        ["try", "Finish the whole project and tick every acceptance item above. Write three lines in My notes: what was the hardest step, and why."]
      ]
    },
    {
      id: "P2", title: "Design project: an operator overview screen", minutes: 40,
      blocks: [
        ["p", "<b>The brief.</b> A small batch reactor has three feed lines (A, B, C), a coolant circuit, a pump and a run sequence. Design the operator's main screen. You are not drawing pretty pictures: you are deciding what the operator must see, where, and what happens when something goes wrong."],
        ["fig", "hmi-layout", "A process screen with bars, limits, warning triangles, a trend, interlocks, a reserved faceplate zone and a navigation column."],
        ["h", "Design brief, in four moves"],
        ["ul", [
          "<b>1 · List the process values.</b> For each: units, range, normal band, alarm limits, how fast it changes.",
          "<b>2 · Zone the screen.</b> Process area, trend, status, reserved faceplate, navigation. Keep navigation in the same place on every screen.",
          "<b>3 · Decide what is a command.</b> Every control action goes through a standard faceplate. No ad-hoc buttons.",
          "<b>4 · Decide what shouts.</b> Only abnormal situations get bright colours (a yellow triangle beside a bar that left its band)."
        ]],
        ["p", "Real specifications also say where information appears. Common practice puts level 1 (overview) on the main screen, level 2 on process areas and level 3 on equipment detail, each reachable by the same navigation column."],
        ["h", "Task 1 · Tag and alarm table"],
        ["p", "Make a table with one row per signal: name, data type, unit, range, warning limit, alarm limit, acquisition cycle. Use 1 s for slow values, faster only when the operator really needs it."],
        ["quiz", {
          q: "A value turns yellow with a triangle when it leaves its normal band. Why avoid bright colours on healthy values?",
          options: ["Bright colours cost more memory", "A screen full of bright colours hides the one thing that matters", "The panel cannot show them", "Operators dislike colours"],
          answer: 1,
          why: "Colour carries meaning. If everything is bright, an abnormal value no longer stands out."
        }],
        ["h", "Task 2 · Wireframe the screen"],
        ["p", "On paper or in any drawing tool, lay out the screen: bars on the left, trend below, interlocks and run status in the middle, reserved faceplate zone and navigation on the right. Mark which object each tag drives."],
        ["h", "Task 3 · Define the faceplate"],
        ["p", "Pick one object (say, the feed A valve). Define what its faceplate shows: current state, auto/manual, setpoint, command buttons, interlocks that block it. When the operator selects the object on the screen, that faceplate appears in the reserved zone."],
        ["reveal", "A sample faceplate for a valve", [
          ["ul", [
            "<b>Header:</b> name and tag (V-5A, Feed A valve)",
            "<b>State:</b> Open, Closed, Travelling, Fault",
            "<b>Mode:</b> Auto or Manual",
            "<b>Commands (manual only):</b> Open, Close",
            "<b>Interlocks:</b> a list that shows <i>why</i> a command is blocked",
            "<b>Alarm:</b> acknowledge button if active"
          ]]
        ]],
        ["warn", "Do not rely on the screen for safety. A stop that protects people is wired, not clicked (lesson 8.2)."],
        ["try", "Produce the tag table, a wireframe and one faceplate definition. Ask Claude to review them against the design rules in lesson 5.2."]
      ]
    },
    {
      id: "P3", title: "Choose and document a portfolio project", minutes: 30,
      blocks: [
        ["p", "Employers and examiners ask for evidence. A short, finished, <i>documented</i> project says more than a long list of courses. Choose one project, finish it, and write it up."],
        ["h", "Pick one"],
        ["ul", [
          "<b>Control + HMI:</b> the bottle packing line (project P1).",
          "<b>Process control:</b> the tank level PID lab (lesson 7.5).",
          "<b>Machine:</b> the sorting station capstone (lesson 8.6).",
          "<b>Professional:</b> the guided S7-1500 sorting station end to end (lesson 13.3)."
        ]],
        ["p", "Links: <a href=\"#/P1\">P1 bottle packing</a>, <a href=\"#/7.5\">7.5 tank PID</a>, <a href=\"#/8.6\">8.6 sorting capstone</a>, <a href=\"#/13.3\">13.3 S7-1500 project</a>."],
        ["h", "The one-page write-up"],
        ["ul", [
          "<b>Goal:</b> two sentences. What does the machine do, for whom?",
          "<b>Hardware and I/O:</b> a table of inputs and outputs with addresses.",
          "<b>Program structure:</b> which OBs, FCs, FBs and DBs, and why.",
          "<b>HMI:</b> a screenshot of each screen and the tags it uses.",
          "<b>Tests:</b> a list of what you tried, what happened, and what you fixed (lesson 8.4 FAT).",
          "<b>What I would improve:</b> honest and specific."
        ]],
        ["p", "Keep the project in version control (lesson 8.5) and add the write-up to the repository so a reviewer can open both."],
        ["try", "Write your one-page write-up for the project you picked, and keep a copy beside the project files."]
      ]
    }
  ]
});
