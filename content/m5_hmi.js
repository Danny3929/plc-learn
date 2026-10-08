window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 5,
  title: "5 · HMI with WinCC",
  lessons: [
    {
      id: "5.1", title: "HMI panels, runtime and connections", minutes: 15,
      blocks: [
        ["p", "An <b>HMI</b> (Human-Machine Interface) is the screen operators use to see what a machine is doing and to give it commands. The PLC does the control; the HMI shows and requests. In TIA Portal you design HMI screens with <b>WinCC</b>, in the same project as the PLC."],
        ["fig", "hmi-arch", "One engineering project, two devices. The HMI and PLC exchange tags over the network."],
        ["fig", "wincc-interface", "The WinCC engineering interface: 1 project tree, 2 menu bar, 3 work area, 4 toolbox, 5 properties window, 6 details view."],
        ["h", "Types of HMI device"],
        ["ul", [
          "<b>Basic Panels</b>: low-cost touch panels for simple machines.",
          "<b>Comfort Panels</b>: larger, more features (alarms, recipes, scripts, trends).",
          "<b>WinCC Unified</b> panels and PC runtime: the newer generation. Web-based, scripts written in JavaScript, and screens that scale to different devices.",
          "<b>PC runtime</b>: HMI software on an industrial PC. Also used for SCADA-style systems with many screens."
        ]],
        ["p", "Which products exist and what each supports changes between TIA Portal versions, so always check the Siemens documentation for your version when choosing a device."],
        ["h", "Add an HMI to the project"],
        ["click", "Project tree > Add new device > HMI > choose a panel (or a PC runtime) > Add"],
        ["p", "The <b>HMI device wizard</b> that follows lets you set a screen layout, a header, alarm window and navigation buttons, and offers to connect the HMI to your PLC. Accept the connection."],
        ["h", "The connection"],
        ["p", "In <b>Devices &amp; networks</b> (Network view), an <b>HMI connection</b> links the HMI to the CPU. When both devices sit in the same TIA project this is an <i>integrated connection</i>: the HMI can pick PLC tags directly from a list, without typing addresses."],
        ["note", "For PLC data blocks with <b>optimized access</b>, the HMI can only see variables marked <i>Accessible from HMI/OPC UA/Web API</i> (check each variable's attributes, and the setting's default in your version). A tag the HMI cannot find is usually this setting."],
        ["fig", "common-tags", "Tags are common to the whole project: create one in the PLC and it is available in the HMI."],
        ["p", "The panel also needs its own IP address in the PLC's subnet. Read its MAC address, put it in Transfer mode and assign the address under <b>Online &amp; diagnostics</b>."],
        ["fig", "hmi-ip-flow", "Giving a panel an address."],
        ["h", "Test without hardware"],
        ["p", "Run the HMI in <b>simulation</b> alongside PLCSIM: <b>Online &gt; Simulation &gt; Start</b> on the HMI device. The runtime window opens on your PC and reads the simulated PLC, so you can build and test screens with no panel in sight."],
        ["quiz", {
          q: "Who should own the machine's logic and interlocks?",
          options: ["The HMI", "The PLC", "Whoever writes the screens", "The operator"],
          answer: 1,
          why: "The PLC runs the control logic. The HMI is a window onto it. If the HMI is switched off, the machine must remain safe and consistent."
        }],
        ["try", "Add an HMI device (any Basic or Comfort panel) to your project and let the wizard connect it to PLC_1. Open the Network view and find the connection."]
      ]
    },
    {
      id: "5.2", title: "Screens, tags and good design", minutes: 25,
      blocks: [
        ["p", "An HMI project is a set of <b>screens</b> made from objects (text, buttons, fields, bars, gauges), connected to <b>HMI tags</b> that read and write PLC values."],
        ["fig", "hmi-screen", "An overview screen. 1 process picture, 2 operator input field, 3 command buttons, 4 alarm bar, 5 navigation."],
        ["fig", "hmi-layout", "A process screen in an HMI specification: bars with limits, warning triangles, a trend, status, a reserved faceplate zone and navigation. Compare it with the overview screen above."],
        ["h", "HMI tags"],
        ["ul", [
          "<b>External tags</b> read or write a PLC variable. They have an <i>acquisition cycle</i> (how often to poll, e.g. 1 s).",
          "<b>Internal tags</b> live only in the HMI. Used for screen state, such as the selected tab.",
          "Choose the cycle by need. A level that changes slowly needs 1 s; polling hundreds of tags at 100 ms overloads the connection."
        ]],
        ["h", "Common objects and what they do"],
        ["ul", [
          "<b>I/O field</b>: shows a value (output), lets the operator type one (input), or both.",
          "<b>Button</b>: runs an <i>event</i> when pressed, released or clicked.",
          "<b>Bar and gauge</b>: show an analog value graphically.",
          "<b>Animations</b> such as <i>Appearance</i> and <i>Visibility</i> change colour or hide an object depending on a tag value: a pump icon turns green when running."
        ]],
        ["fig", "button-appearance", "An Appearance animation: a PLC tag value picks the button's foreground and background colour."],
        ["h", "Buttons: command bits, not outputs"],
        ["p", "A <b>Start</b> button should not set a physical output. It should set a <b>command bit</b> in a PLC data block, and the PLC program decides whether to act on it:"],
        ["scl", "// In the PLC, once per scan\nIF \"DB_HMI\".Cmd_Start AND \"Interlocks_OK\" AND NOT \"Fault\" THEN\n    \"Pump1_Run_Req\" := TRUE;\nEND_IF;\n\n// Clear the one-shot command so a press means one request\n\"DB_HMI\".Cmd_Start := FALSE;", "PLC side of an HMI command"],
        ["p", "Typical button events: <b>Press</b>: set a bit (<code>SetBit</code>). <b>Release</b>: reset it (<code>ResetBit</code>). That gives a momentary &quot;hold to jog&quot; behaviour. For latching buttons use <code>InvertBit</code>."],
        ["h", "Try it: the HMI requests, the PLC decides"],
        ["p", "A tank filled by a pump, shown on a small HMI. Start the pump, move the setpoint, and push it above 90 with PLC validation switched <b>off</b>. Then turn validation on and repeat. The alarm bar uses the same acknowledgement life cycle as the previous lesson."],
        ["hmiplay", {}],
        ["note", "Everything on the screen must fit inside the panel's work area (for a KTP600 that is 320 &times; 240 pixels). Put your project into practice in <a href=\"#/P1\">project P1: bottle packing line</a>."],
        ["h", "Design rules that operators love"],
        ["ul", [
          "<b>One idea per screen</b>. An overview, then detail screens. Do not cram a plant onto one panel.",
          "<b>Consistent colours</b>: grey for idle, green for running, red for faulted. And use the <b>same</b> colour for the same meaning everywhere.",
          "<b>Reserve bright colours for abnormal situations</b>. A screen full of bright colours hides the one that matters.",
          "<b>Large touch targets</b> and clear labels. Operators wear gloves.",
          "<b>Always show state</b>: a button should show whether it is currently on, not just ask to be pressed.",
          "<b>Consistent navigation</b>: the same bar in the same place on every screen, built once in the <b>template</b>."
        ]],
        ["warn", "Never rely on the HMI for safety functions. An HMI button must not be the only way to stop a hazardous machine. Stops and e-stops are hardwired through safety circuits (lesson 8.2)."],
        ["quiz", {
          q: "What should a Start button on an HMI do?",
          options: ["Set the physical output directly", "Set a command bit in the PLC, which the PLC logic validates", "Start the HMI runtime", "Reset the PLC"],
          answer: 1,
          why: "The PLC owns the logic. The HMI only requests; interlocks and faults can still refuse it."
        }],
        ["try", "Build an overview screen: a bar for a Real tag (0 to 100), an I/O field for a setpoint, Start and Stop buttons that write command bits, and a visibility animation that shows a green circle when the pump runs."]
      ]
    },
    {
      id: "5.3", title: "Alarms and trends", minutes: 20,
      blocks: [
        ["p", "Operators must know when something is wrong and be able to look back at what happened. Two WinCC features cover this: <b>alarms</b> (events) and <b>trends</b> (history of values)."],
        ["h", "Alarm types"],
        ["ul", [
          "<b>Discrete alarms</b>: triggered by a single bit in a PLC tag. The PLC sets a bit in a DB (for example <code>Alarm.Word0, bit 0</code>) and the HMI shows the text.",
          "<b>Analog alarms</b>: triggered when a value crosses a limit, e.g. level &gt; 90. You can set the limit in the HMI, but doing it in the PLC is more consistent.",
          "<b>PLC alarms</b>: generated by the PLC itself (diagnostic events and program alarm instructions) and shown automatically on the HMI."
        ]],
        ["p", "Alarms belong to <b>classes</b>: for example <i>Errors</i> (need acknowledgement), <i>Warnings</i> (no acknowledgement) and <i>System</i> events. The class sets colour and whether a person must confirm."],
        ["h", "Alarm life cycle"],
        ["fig", "alarm-lifecycle", "An alarm that needs acknowledgement passes through these states."],
        ["p", "Try it yourself. Switch the fault on and off in different orders, and watch what happens to the alarm and the horn."],
        ["alarm", { title: "Alarm life cycle" }],
        ["ul", [
          "<b>Active, unacknowledged</b> flashes and sounds the horn: someone must see it.",
          "<b>Acknowledged</b> stops the flashing but the alarm stays while the fault persists.",
          "<b>Gone, unacknowledged</b>: the fault disappeared before anyone noticed, but the alarm stays flashing so the event is not missed.",
          "<b>Cleared</b> only when both the fault is gone and a person has confirmed it."
        ]],
        ["h", "Good alarm practice"],
        ["ul", [
          "<b>Every alarm needs an action.</b> If the operator can do nothing about it, it is information, not an alarm.",
          "<b>Avoid alarm floods.</b> One root fault should not raise 40 alarms. Suppress consequential ones: when a pump trips, the low-flow alarm that follows is noise.",
          "<b>Suppress by state, not by hiding.</b> Alarms that are meaningless in a given plant state (for example a low-pressure alarm while the line is deliberately shut down) are suppressed by logic, and the suppression is visible and logged. Alarms that are only a nuisance can be <i>shelved</i> temporarily.",
          "<b>Give alarms priorities</b> so the operator sees the urgent ones first.",
          "<b>Use clear text</b>: &quot;Tank 1 high level&quot;, not &quot;Alarm 17&quot;. Include what to do, if short.",
          "<b>Time-stamp at the PLC</b> so the sequence of events is accurate."
        ]],
        ["h", "Trends"],
        ["p", "A <b>trend view</b> plots tag values over time. Values are recorded by a <b>data log</b> at a given interval and stored on the panel or a PC (and can be exported to CSV). Use trends for the values operators use to diagnose problems, such as temperatures, pressures and flows, and keep the logging rate sensible so storage does not fill."],
        ["quiz", {
          q: "A fault appears and then disappears before the operator looks. The alarm was not acknowledged. What state is it in?",
          options: ["Cleared", "Gone, unacknowledged: it stays visible until acknowledged", "Deleted", "Active, acknowledged"],
          answer: 1,
          why: "Unacknowledged alarms remain until a person confirms them so that brief faults are never silently lost."
        }],
        ["try", "In the PLC, create a Word <code>Alarm_Word</code> in a DB. Set bit 0 when the tank level exceeds 90. In WinCC create a discrete alarm for that bit with the text &quot;Tank 1 high level&quot;."]
      ]
    },
    {
      id: "5.4", title: "Recipes and user management", minutes: 20,
      blocks: [
        ["h", "Recipes"],
        ["p", "A <b>recipe</b> is a named set of values for one product: for example mixing times, temperatures and speeds for &quot;Product A&quot; and &quot;Product B&quot;. Changing product means loading another data record, not editing ten values by hand."],
        ["ul", [
          "<b>HMI recipes</b> (WinCC recipe view): the HMI stores the data records and synchronises them with PLC variables. The operator picks a record and presses <i>Transfer to PLC</i>.",
          "<b>PLC-side recipes</b>: the PLC holds the recipe table as an array in a DB, and the HMI selects an index. Good when the PLC must work without the HMI, or when records must be validated against limits."
        ]],
        ["scl", "// Recipe held in the PLC as an array of a UDT\n// \"Recipe_DB\".Recipes : Array[1..20] of \"Type_Recipe\"\nIF \"DB_HMI\".Recipe_Load THEN\n    \"Active_Recipe\" := \"Recipe_DB\".Recipes[\"DB_HMI\".Recipe_Index];\n    \"DB_HMI\".Recipe_Load := FALSE;\nEND_IF;", "Selecting a recipe by index"],
        ["warn", "Always range-check values coming from the HMI in the PLC. An operator who types 9000 for a temperature should not heat a tank to 9000. Use <code>LIMIT</code> or an explicit check, because the PLC cannot trust the screen."],
        ["h", "User management"],
        ["p", "Operators, supervisors and engineers should not all be able to do everything. WinCC lets you define <b>user groups</b> with <b>authorisation levels</b> and attach a level to each object: only a supervisor can change a setpoint, only an engineer can edit a recipe."],
        ["ul", [
          "<b>Operator</b>: view, start and stop, acknowledge alarms.",
          "<b>Supervisor</b>: change setpoints and recipes.",
          "<b>Engineer / maintenance</b>: calibration, bypasses, parameters.",
          "Add an <b>auto-logout</b> timer so a left-logged-in panel does not stay privileged.",
          "Never ship default passwords. Change them at commissioning."
        ]],
        ["note", "User rights on the HMI are a convenience layer and an audit tool. They are not a security boundary: anyone with network access to the PLC could still write its tags. Real protection is covered in lesson 8.3."],
        ["quiz", {
          q: "Where should the limits of an operator-entered setpoint be enforced?",
          options: ["Only on the HMI screen", "In the PLC, as well as on the HMI", "Nowhere", "In the recipe name"],
          answer: 1,
          why: "The HMI limits are a courtesy. The PLC is the final authority and must reject unsafe values."
        }]
      ]
    },
    {
      id: "5.5", title: "From HMI to SCADA", minutes: 20,
      blocks: [
        ["p", "An HMI shows you one machine. A <b>SCADA</b> system (Supervisory Control And Data Acquisition) supervises a whole plant or even several sites: a water network, a power substation group, a pipeline, a factory with dozens of machines. The PLCs still do the real-time control. SCADA collects what they know, shows it, stores it and lets operators give supervisory commands."],
        ["h", "What SCADA does"],
        ["ul", [
          "<b>Collects</b> data from PLCs and remote units, often hundreds of thousands of tags.",
          "<b>Transfers</b> it over networks, from short factory Ethernet to radio or cellular links to remote sites.",
          "<b>Analyses and displays</b> it: overview screens, trends, alarm lists, reports.",
          "<b>Controls at the supervisory level</b>: start a pump, change a setpoint, run a recipe. The fast control loops stay in the PLC."
        ]],
        ["fig", "scada-arch", "A typical SCADA architecture. Control stays in the PLCs; SCADA supervises, records and reports."],
        ["h", "The layers"],
        ["ul", [
          "<b>Field level</b>: sensors, valves, drives.",
          "<b>Control level</b>: PLCs, and RTUs (remote terminal units) at distant sites.",
          "<b>Network</b>: usually a control network of switches, plus radio or cellular links for remote sites.",
          "<b>SCADA servers</b>: poll the PLCs, run the alarm logic and keep the live data. Often two, for redundancy.",
          "<b>Historian</b>: a database that archives values and alarms with time stamps.",
          "<b>Clients</b>: operator stations and web clients that display the data.",
          "<b>Enterprise level</b>: MES, ERP and reporting, usually separated from the control network by a firewall (lesson 8.3)."
        ]],
        ["h", "Centralised or distributed?"],
        ["p", "A <b>centralised</b> design has one computer doing the monitoring and storing everything. It is simple, but it is a single point of failure. A <b>distributed</b> design spreads the work over several servers, perhaps one per area, with clients connecting to whichever server holds the data they need. It scales better and survives the loss of one machine. Most modern systems are client/server and distributed."],
        ["h", "HMI or SCADA?"],
        ["ul", [
          "<b>HMI panel</b>: one machine, runs on a panel, usually one or a few screens, often no long-term history.",
          "<b>SCADA</b>: many machines or sites, runs on PCs or servers, with an archive, reports, redundancy and many users.",
          "In Siemens' world the lines blur: <b>WinCC Professional</b> and <b>WinCC Unified</b> on PCs are used for SCADA-sized projects, while panels handle single machines. Newer versions add server redundancy and central archiving; check what your version offers."
        ]],
        ["h", "Tags, polling and archiving"],
        ["ul", [
          "SCADA reads tags by <b>polling</b> on a fixed cycle, or by <b>exception</b> (only values that changed). Faster polling costs network and server load.",
          "<b>Time-stamp at the source</b> where possible, so events from different PLCs are in true order even if the network lagged.",
          "Archive with <b>compression</b> (store only meaningful changes) and decide how long to keep data.",
          "Remote sites should <b>buffer data locally</b> and send it when the link returns, so a radio outage does not leave a hole in the history."
        ]],
        ["h", "Alarms at plant scale"],
        ["p", "With thousands of points, alarm management becomes a design job. Give alarms priorities, suppress consequential ones by plant state, shelve known nuisance alarms with a record of who did it, and review alarm statistics regularly. A SCADA system that shows 500 alarms an hour has no useful alarms."],
        ["h", "Things to decide when designing one"],
        ["ul", [
          "The <b>control requirements</b>: sequences, analog loops, speed of data acquisition.",
          "<b>Operator stations</b> and what each role must see.",
          "<b>Archiving</b> needs: how much history, how fast, for how long.",
          "<b>Reliability and availability</b>: redundant servers, networks and power.",
          "<b>Scalability</b>: the system will grow, so choose an architecture that can.",
          "<b>Security</b>: segmentation, user rights and remote access."
        ]],
        ["note", "If the SCADA server fails, the plant must keep running safely on the PLCs. Never put essential control or safety logic in the supervisory layer."],
        ["try", "Pick a system you know, such as a water pumping station with three pumps and two tanks. List the PLC tags SCADA would collect, five alarms with priorities, and what the archive would store."],
        ["quiz", {
          q: "A SCADA server crashes at a water works. What should happen to the pumps?",
          options: ["They stop immediately", "They keep running under PLC control", "They switch to manual only", "They wait for the server to restart"],
          answer: 1,
          why: "Real-time control lives in the PLCs. SCADA supervises and records, so the plant keeps running while the server is restored."
        }],
        ["quiz", {
          q: "A remote pumping station loses its radio link for two hours. What lets you keep a complete history?",
          options: ["Faster polling", "Local buffering at the site, sent when the link returns", "Fewer tags", "Nothing can be done"],
          answer: 1,
          why: "Store-and-forward buffering at the remote unit fills the gap in the archive once communication returns."
        }]
      ]
    }

  ]
});
