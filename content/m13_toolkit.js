window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 13,
  title: "13 · Professional toolkit",
  lessons: [
    {
      id: "13.1", title: "Safety programming in practice", minutes: 35,
      blocks: [
        ["p", "Lesson 8.2 explained why safety is different. This lesson shows how a safety function is actually built in TIA Portal: the hardware, the separate safety program, the standard blocks, and the checks that make it legal to run. Job advertisements for controls engineers list this skill again and again."],
        ["warn", "This is an introduction to the concepts. Designing and validating real safety functions requires training, the current standards (ISO 13849-1, IEC 62061, IEC 60204-1), the Siemens safety manuals and a competent safety engineer. Never rely on this course alone for a safety decision."],
        ["h", "What makes a controller a safety controller"],
        ["fig", "safety-arch", "One F-CPU runs two programs: the standard one and a separate, signed safety program."],
        ["fig", "estop-fdi-wiring", "Both contacts of the e-stop go to separate channels of the F-DI module."],
        ["ul", [
          "<b>F-CPU</b>: a fail-safe CPU (the model name carries an <b>F</b>, for example 1511F, 1516F, or the S7-1200 FC types). It runs standard and safety programs side by side.",
          "<b>F-I/O</b>: fail-safe input and output modules. Inputs read two channels; outputs can switch off safely. They talk to the CPU over <b>PROFIsafe</b>, a safety layer on top of PROFINET that detects corrupted, delayed, repeated or missing messages.",
          "<b>Software option</b>: <b>STEP 7 Safety</b> (Basic or Advanced, licensed). It adds the safety editors, the F-block library and the Safety Administration editor.",
          "<b>Safe drives</b>: a drive with <b>STO</b> (Safe Torque Off) removes the torque without contactors. STO can be commanded through PROFIsafe."
        ]],
        ["h", "Structure of a safety program"],
        ["ul", [
          "The safety program has its own <b>F-OB</b>, <b>F-FBs/F-FCs</b> and <b>F-DBs</b>, edited in LAD or FBD (not free SCL) with restricted instructions. The compiler generates extra checks.",
          "Code runs in an <b>F-runtime group</b>. For each group you set the <b>maximum cycle time</b>, the longest allowed time between two calls; the F-CPU monitors it and goes to a safe state if it is exceeded. F-I/O and F-communications have their own <b>F-monitoring time</b>.",
          "<b>Standard-to-safety data exchange</b> is deliberately narrow: only through defined interface data. A standard HMI cannot just write into the safety program.",
          "The <b>Safety Administration</b> editor (areas: General, F-runtime group, F-blocks, F-compliant PLC data types, Settings) shows the safety mode status, the <b>collective F-signature</b> and the access protection (password). <b>Disable safety mode</b> works online only, for the whole safety program, and on S7-1200/1500 F-CPUs it is time-limited. Any change gives a new signature, so a modified safety program is detectable."
        ]],
        ["fig", "safety-admin-mock", "The Safety Administration editor: safety mode, collective signature, password, F-runtime groups (illustrative mock-up)."],
        ["h", "The building blocks you will use"],
        ["ul", [
          "<b>ESTOP1</b>: emergency stop up to stop category 1. Inputs E_STOP, ACK_NEC, ACK and TIME_DEL; outputs Q (drops at once) and Q_DELAY (drops after TIME_DEL, for a controlled stop). With ACK_NEC = 1 a rising edge on ACK is needed to restart.",
          "<b>FDBACK</b>: feedback monitoring. Checks that a contactor really dropped within a time (finds welded contacts). Inputs ON, FEEDBACK and FDB_TIME; outputs Q and ERROR.",
          "<b>TWO_H_EN</b>: two-hand monitoring (the logic of lesson 11.1, certified). Inputs IN1, IN2, ENABLE and DISCTIME (0 to 500 ms).",
          "<b>SFDOOR</b>: safety door monitoring. Two channels IN1 and IN2, plus OPEN_NEC (the door must be opened once at start-up).",
          "<b>MUT_P</b>: muting for light curtains (allows a pallet through while blocking a person). Takes two or four muting sensors and a maximum muting time TIME_MAX (up to 10 minutes).",
          "<b>ACK_GL</b>: global acknowledge for passivated or faulted F-I/O. A rising edge on ACK_GLOB reintegrates all F-I/O of the F-runtime group at once."
        ]],
        ["note", "Block names and parameter details differ slightly between library versions. Use the instruction help for your TIA Portal version."],
        ["h", "Passivation and reintegration"],
        ["p", "If an F-I/O channel fails or its communication is disturbed, the system <b>passivates</b> it: it replaces the real value with a fail-safe value (0 for an input), and the CPU does <b>not</b> stop. After the fault is removed, the channel must be <b>reintegrated</b> (switched back to process data), usually after an explicit operator acknowledge. This is why safety programs need an ACK."],
        ["h", "A dual-channel e-stop with discrepancy monitoring"],
        ["p", "A real emergency stop has two channels. If they ever disagree for longer than a short time, one contact is stuck or a wire is shorted, and the system must fault, not guess. Try it: open one channel only and watch the fault. Then use 'Welded' to model a contactor that did not drop."],
        ["sim", {
          title: "Two-channel e-stop, discrepancy and feedback monitoring",
          inputs: [
            { tag: "ES1", addr: "%I0.0", label: "E-stop channel 1 (NC, ON = pressed)", kind: "switch", nc: true },
            { tag: "ES2", addr: "%I0.1", label: "E-stop channel 2 (NC, ON = pressed)", kind: "switch", nc: true },
            { tag: "Ack_PB", addr: "%I0.2", label: "Acknowledge / reset", kind: "push" },
            { tag: "Welded", addr: "%I0.3", label: "Contactor contact welded (feedback)", kind: "switch" }
          ],
          outputs: [
            { tag: "K_Safe", addr: "%Q0.0", label: "Safety contactor", kind: "motor", color: "#2fb86a" },
            { tag: "Fault_Lamp", addr: "%Q0.1", label: "Safety fault", kind: "lamp", color: "#f2554b" }
          ],
          rungs: [
            { title: "Channels disagree for 0.5 s", c: [["par", [[["NO", "ES1"], ["NC", "ES2"]], [["NC", "ES1"], ["NO", "ES2"]]]]], o: ["ton", "T_Disc", 500] },
            { title: "Contactor should be off, feedback says closed for 0.5 s", c: [["NC", "K_Safe"], ["NO", "Welded"]], o: ["ton", "T_Fb", 500] },
            { title: "Latch the safety fault", c: [["par", [[["NO", "T_Disc.Q"]], [["NO", "T_Fb.Q"]]]]], o: ["set", "Fault"] },
            { title: "Reset the fault: both channels healthy, feedback fine, ACK edge", c: [["NO", "ES1"], ["NO", "ES2"], ["NC", "Welded"], ["P", "Ack_PB", "m_ack1"]], o: ["reset", "Fault"] },
            { title: "Enable (manual start) after ACK, if healthy and no fault", c: [["NO", "ES1"], ["NO", "ES2"], ["NC", "Fault"], ["P", "Ack_PB", "m_ack2"]], o: ["set", "Enable"] },
            { title: "Either channel opens: enable drops", c: [["par", [[["NC", "ES1"]], [["NC", "ES2"]]]]], o: ["reset", "Enable"] },
            { title: "Safety contactor", c: [["NO", "Enable"], ["NO", "ES1"], ["NO", "ES2"]], o: ["coil", "K_Safe"] },
            { title: "Fault lamp", c: [["NO", "Fault"]], o: ["coil", "Fault_Lamp"] }
          ]
        }],
        ["p", "Things to notice: the contactor does not start by itself after the e-stop is released (manual acknowledge, as required to avoid unexpected restart); one channel pressed gives a stop and then, after 0.5 s, a latched fault; and the output is the logic AND of both channels and the enable bit."],
        ["h", "From idea to validated function"],
        ["ul", [
          "<b>1. Risk assessment</b> (ISO 12100) says which safety functions are needed.",
          "<b>2. Safety requirement specification</b>: what triggers it, what must happen, response time, performance level or SIL.",
          "<b>3. Design</b>: choose components with certified values; calculate the PL/SIL.",
          "<b>4. Implement</b> with F-blocks and the guidelines of the manual.",
          "<b>5. Verify</b> against the specification, test every path including fault injection (cut a wire, open one channel).",
          "<b>6. Validate</b> on the real machine: does it reduce the risk? Record the collective signature in the report.",
          "<b>7. Change control</b>: any change means a new signature and a new test of the affected function."
        ]],
        ["quiz", {
          q: "What does passivation do?",
          options: [
            "Switches the CPU to STOP",
            "Replaces the value of a failed F-I/O channel with a fail-safe value so the system stays safe",
            "Deletes the safety program",
            "Increases the cycle time"
          ],
          answer: 1,
          why: "A passivated channel provides its safe value (for inputs, 0), and the CPU keeps running. The channel is reintegrated after the fault is cleared and acknowledged."
        }],
        ["quiz", {
          q: "Why does the e-stop circuit have a discrepancy timer between the two channels?",
          options: [
            "To slow down the stop",
            "A permanently different state of the channels means a stuck contact or wiring fault, which must be detected and not ignored",
            "Because inputs are slow",
            "To save energy"
          ],
          answer: 1,
          why: "Two channels are only useful if disagreement is detected. Otherwise a single failure could hide and the redundancy would be lost."
        }],
        ["quiz", {
          q: "What is the collective signature of the safety program used for?",
          options: [
            "Licensing",
            "To prove the safety program has not been changed since it was validated",
            "To speed up the download",
            "To encrypt the HMI"
          ],
          answer: 1,
          why: "It changes when anything in the safety program changes, so it is recorded at acceptance."
        }],
        ["try", "Add to the simulator a lamp that shows 'Press ACK to restart' when both channels are healthy and Enable is off. Which rung and which tags do you need?"]
      ]
    },
    {
      id: "13.2", title: "Commissioning a drive with Startdrive", minutes: 35,
      blocks: [
        ["p", "Lesson 6.4 covered how the PLC talks to a drive over PROFINET. This lesson is about getting the drive itself running: the motor data, limits, identification and testing that decide whether a VFD behaves. Skipping steps here causes nuisance trips, noisy motors and damaged equipment."],
        ["fig", "startdrive-flow", "The seven steps of a typical SINAMICS G120 commissioning with Startdrive."],
        ["h", "1. Add the drive to the project"],
        ["p", "In the project, add the control unit and power module of the drive from the hardware catalog (for example a G120 with a CU250S-2 PN control unit), or add a device by <b>Detect connected devices</b>. In the network view, connect it to the PLC's PROFINET line and assign the PROFINET device name and IP address (lesson 6.1)."],
        ["h", "Wire the control unit"],
        ["p", "On a CU250S-2 the terminals sit behind two front doors. For a first test wire only what you need: a start switch from the drive's own 24 V (terminal 9) to digital input 0 (terminal 5), the input reference (DI COM 1, terminal 69) to GND (terminal 28), and a speed potentiometer to the 10 V supply (terminal 1), analog input 0 (terminal 3) and GND (terminal 2). Terminal 4 (AI 0-) goes to GND."],
        ["fig", "cu250s-terminals", "Terminals of a SINAMICS G120 CU250S-2 with a start switch and a speed potentiometer wired."],
        ["note", "The drive's digital inputs switch on above about 11 V and off below 5 V, unlike an S7-1200 input (15 V and 5 V). Never copy threshold values from one product to another."],
        ["h", "2. Choose the telegram"],
        ["p", "The <b>PROFIdrive telegram</b> decides which data cyclically goes between PLC and drive. <b>Telegram 1</b> is the simplest: control word STW1 and speed setpoint NSOLL_A out, status word ZSW1 and actual speed NIST_A in. <b>Telegram 20</b> (PZD 2/6) keeps STW1 and NSOLL_A and returns six words: ZSW1 plus smoothed speed, current, torque and power values and one more status word. Telegram 1 is PZD 2/2. The same telegram must be set in the drive and the PLC hardware configuration, or communication will not start."],
        ["h", "3. Enter the motor data (from the nameplate)"],
        ["code", "p0010 = 1         Quick commissioning (parameters can be changed)\np0300             Motor type (asynchronous or synchronous)\np0304             Rated motor voltage (V)\np0305             Rated motor current (A)\np0307             Rated motor power (kW)\np0308             Power factor (cos phi)\np0310             Rated motor frequency (Hz)\np0311             Rated motor speed (rpm)\np0010 = 0         Finish: the drive calculates its internal model", "Key motor parameters (check the drive's parameter manual for your firmware)"],
        ["warn", "Check the star/delta connection on the motor's terminal box <b>and</b> the voltage on the nameplate. A motor rated 230/400 V connected in delta on a 400 V supply is correct; wrong data means wrong current limits and an unprotected motor."],
        ["h", "4. Limits and ramps"],
        ["ul", [
          "<b>p1080</b> minimum speed and <b>p1082</b> maximum speed (rpm). A pump should not run at 0 rpm in a pipe.",
          "<b>p1120</b> ramp-up time and <b>p1121</b> ramp-down time (s). Both are referenced to the maximum speed p1082, so a smaller step takes proportionally less time. While <b>p0010</b> is above 0 the pulses cannot be enabled: set it back to 0. Too short and the drive trips on overcurrent (starting) or overvoltage (braking).",
          "<b>p2000</b> reference speed: the speed that corresponds to <b>100 % = 16384</b> in the PROFIdrive speed words. Keep it equal to the maximum speed to avoid confusion."
        ]],
        ["h", "5. Motor identification and optimisation"],
        ["p", "The drive measures the motor's electrical data so it can control it accurately. A <b>stationary measurement</b> (<code>p1900 = 2</code> on many firmware versions, then command ON; the available values differ by firmware, so check the manual) needs no rotation. A rotating measurement, with the motor uncoupled, is more accurate and enables the <b>speed controller optimisation</b>. Never run the identification with the load attached unless the manual says so."],
        ["h", "6. Test with the control panel, then from the PLC"],
        ["p", "Startdrive has a <b>control panel</b> that takes the master control away from the PLC while you test. Start with a small speed, check the direction of rotation, then the ramps. Hand control back to the PLC and watch the control and status words."],
        ["p", "From the PLC the drive starts when the control word is <code>16#047E</code> and runs when it is <code>16#047F</code>; the speed setpoint is a percentage of p2000 scaled to 16384 (lesson 6.4). Try the scaling here:"],
        ["sim", {
          title: "PROFIdrive speed setpoint: 100 % = 16384",
          inputs: [
            { tag: "Run", addr: "%I0.0", label: "Run command (STW1 bit 0 = ON)", kind: "switch" },
            { tag: "Speed_pct", addr: "%MD10", label: "Speed setpoint", kind: "slider", min: 0, max: 100, step: 5, init: 50, unit: "%" }
          ],
          outputs: [
            { tag: "Drive_Run", addr: "%Q0.0", label: "Drive running (ZSW1 bit 2)", kind: "motor", color: "#2fb86a" }
          ],
          rungs: [
            { title: "Scale percent to the PROFIdrive speed word (x 163.84)", c: [["NO", "Run"]], o: ["math", "*", "Speed_pct", 163.84, "NSOLL_A", "Real"] },
            { title: "Drive runs only with ON and a setpoint above 0", c: [["NO", "Run"], ["CMP", ">", "Speed_pct", 0, "Real"]], o: ["coil", "Drive_Run"] }
          ]
        }],
        ["h", "7. Save, and save again"],
        ["ul", [
          "Copy <b>RAM to ROM</b> in the drive (parameter <code>p0971 = 1</code> or the Startdrive 'save' button), otherwise the settings are lost at power-off.",
          "Save the TIA Portal project, so the drive settings are in the project.",
          "Do a <b>backup</b> of the drive parameters to a file for the handover documentation."
        ]],
        ["h", "Typical faults and first thoughts"],
        ["ul", [
          "<b>F30001 (overcurrent)</b>: ramp too short, wrong motor data, motor or cable short circuit, or a mechanical jam.",
          "<b>F07011 (motor overtemperature)</b>: overload, blocked cooling or wrong thermal settings.",
          "<b>No communication</b>: telegram mismatch, wrong device name, IP duplicate, the drive in 'local' mode.",
          "<b>Motor runs the wrong way</b>: swap two motor phases (power off, locked out) or reverse the direction in the parameters."
        ]],
        ["note", "Treat fault codes as hints and always read the actual text in the diagnostics of your drive. Fault numbers and parameter lists vary between drive families and firmware."],
        ["quiz", {
          q: "The PLC sends a speed setpoint of 8192 in a PROFIdrive speed word. What speed does the drive aim for?",
          options: ["8192 rpm", "50 % of the reference speed p2000", "100 % of p2000", "It depends on the ramp time"],
          answer: 1,
          why: "16384 corresponds to 100 %, so 8192 is 50 % of the reference speed."
        }],
        ["quiz", {
          q: "After successful commissioning the drive loses all settings at power cycle. What was forgotten?",
          options: [
            "The telegram",
            "Copying RAM to ROM (saving the parameters in the drive)",
            "The PROFINET cable",
            "The nameplate"
          ],
          answer: 1,
          why: "Parameters live in RAM until saved to the non-volatile memory."
        }],
        ["quiz", {
          q: "The drive trips with overcurrent every time it starts a heavy conveyor. What is the first parameter to check?",
          options: ["The IP address", "The ramp-up time (p1120) and the motor data", "The PROFINET name", "The control word 16#047E"],
          answer: 1,
          why: "A ramp that is too short asks for torque the drive cannot deliver, and wrong motor data causes wrong current limits."
        }],
        ["try", "Write down the commissioning checklist for a 1.5 kW pump motor on a G120 with telegram 1: telegram, motor data, limits, ramps, identification, test, save. Add what you would check before the first start with water in the pump."]
      ]
    },
    {
      id: "13.3", title: "Guided project: an S7-1500 sorting station end to end", minutes: 60,
      blocks: [
        ["p", "Siemens' own education programme (SCE) trains with a sorting station: a conveyor, a few sensors and two pushers. You built the logic in lesson 8.6. Here you build the <b>whole project the professional way</b>, with milestones. Use PLCSIM (or PLCSIM Advanced) if you have no hardware, and tick every item."],
        ["h", "The plant"],
        ["code", "Inputs                                   Outputs\n%I0.0  S1_Start      (NO)               %Q0.0  K1_Conveyor\n%I0.1  S2_Stop       (NC)               %Q0.1  Y1_Pusher_A   (extend)\n%I0.2  S3_EStop      (NC)               %Q0.2  Y2_Pusher_B   (extend)\n%I0.3  B1_Entry      photo sensor       %Q0.3  H1_Run lamp\n%I0.4  B2_Metal      inductive          %Q0.4  H2_Fault lamp\n%I0.5  B3_Full       capacitive (hi)\n%I0.6  B4_PusherA_back / %I0.7 B5_PusherA_front\n%I1.0  B6_PusherB_back / %I1.1 B7_PusherB_front\n\nRule: metal parts go to bin A, tall plastic parts to bin B, others fall off the end.", "I/O list (design your own addresses)"],
        ["h", "Milestone 1 · Project and hardware"],
        ["ul", [
          "Create the project with a clear name and version, for example <code>Sorter_V0.1</code>.",
          "Add an S7-1500 CPU (for example a CPU 1511-1 PN or 1516-3 PN/DP) and the I/O modules; or use an unspecified CPU first and specify it later.",
          "Set the IP address and PROFINET name, the clock memory byte, and system memory byte (lesson 1.3).",
          "Decide the protection level and the web server settings now (lesson 13.6)."
        ]],
        ["h", "Milestone 2 · Names and tags"],
        ["ul", [
          "Write the I/O list as a tag table with comments. One row per signal.",
          "Naming rule: sensors begin with B, valves Y, buttons S. Same as the schematic (lesson 9.5).",
          "Create UDTs for repeating things: <code>UDT_Pusher</code> (Cmd, Fb_Back, Fb_Front, Fault)."
        ]],
        ["h", "Milestone 3 · Program structure"],
        ["code", "Program blocks\n  Main [OB1]              calls everything, nothing else\n  Startup [OB100]         sets safe start values\n  Cyclic_100ms [OB30]     slow tasks (counters, OEE)\n  Conveyor [FB]           motor with start delay, fault, feedback\n  Pusher [FB]             extends on command, monitors sensors, timeout\n  Sorter_Seq [FB]         the sequence (step chain, lesson 10.5)\n  Sorter_DB               instance data of Sorter_Seq\n  Signals [FC]            maps raw I/O to clean tags", "Suggested structure"],
        ["h", "Milestone 4 · Logic in blocks"],
        ["ul", [
          "Write <code>Pusher</code> once; instantiate twice. Include a timeout: if no front sensor after 2 s, fault.",
          "Write the sequence as a step chain with these steps: idle, run belt, identify, travel, push, return, done. Show the step number on a tag for the HMI.",
          "Use a position array indexed by encoder pulses if you have an encoder, otherwise a timer-based queue of 3 positions (lesson 11.3).",
          "Add the e-stop in a way that removes power from outputs: through a hardware relay, not only through the program (lesson 8.2)."
        ]],
        ["h", "Milestone 5 · HMI"],
        ["ul", [
          "Screens: overview (belt, sensors, pushers), alarms, setup (counters, timeouts).",
          "Operator rights: operators start and stop; technicians change setup; no one but engineers change safety (lesson 5.4).",
          "A step display: 'Waiting for pusher A front sensor' (lesson 10.5)."
        ]],
        ["h", "Milestone 6 · Test plan"],
        ["code", "ID   Test                                       Expected                      Result\nT1   Start with all sensors off                 Belt runs, lamp H1 on         [ ]\nT2   Metal part passes                          Pusher A extends, retracts    [ ]\nT3   Two parts 0.5 s apart                      Both sorted correctly         [ ]\nT4   Pusher A front sensor never comes          Fault after 2 s, belt stops   [ ]\nT5   Press e-stop while belt runs               All outputs off               [ ]\nT6   Release e-stop                             No automatic restart          [ ]\nT7   Power cycle during a sort                  Safe start, no motion         [ ]\nT8   Download changed program                   Version and date correct      [ ]", "Test plan (extend it)"],
        ["h", "Milestone 7 · Diagnostics and handover"],
        ["ul", [
          "Add alarm texts, a diagnostics page (lesson 8.1) and a trace of the sorting event (lesson 10.7).",
          "Produce the documentation: I/O list, structure, state chart, test sheet (lesson 8.4).",
          "Archive the project as a versioned file or in Git (lessons 8.5 and 13.4) with a clear tag for the release."
        ]],
        ["quiz", {
          q: "In the structure, OB1 only calls other blocks. What is the main benefit?",
          options: [
            "It runs faster",
            "The top level reads like a table of contents and each function can be tested and reused on its own",
            "It saves memory",
            "OB1 cannot hold logic"
          ],
          answer: 1,
          why: "A thin main block keeps the program readable and the parts reusable (lesson 3.6)."
        }],
        ["quiz", {
          q: "Test T6 checks that nothing restarts after an e-stop release. Which requirement does it verify?",
          options: ["Performance", "Prevention of unexpected restart", "Network speed", "Programming style"],
          answer: 1,
          why: "A machine must not start by itself when the e-stop is released: it needs a deliberate restart action."
        }],
        ["try", "Do the project. At the end, hand the folder (or a screenshot set, the test sheet and the I/O list) to a friend and ask them to find one thing they would change. Record it in the project's change log."]
      ]
    },
    {
      id: "13.4", title: "TIA Portal V21, S7-1200 G2 and Git", minutes: 30,
      blocks: [
        ["p", "Siemens releases a new TIA Portal roughly every year or two, and the platform moves with it. Knowing what changed helps you choose versions, read job requirements and keep projects maintainable. This lesson reflects the information available in October 2026; check Siemens' release notes before you rely on any detail."],
        ["h", "The S7-1200 G2"],
        ["p", "The S7-1200 G2 is the second generation of the compact controller. It shares the name and the look of the original, but it is a <b>different product line</b>, with its own hardware support package (HSP) in TIA Portal and its own firmware numbering."],
        ["ul", [
          "It needs a recent TIA Portal with the G2 hardware support package (HSP). Several documented features, such as UMC user management and the F-BaseID display, are tied to firmware <b>V4.1</b>, which Siemens documents for TIA Portal V21. Check the compatibility table for your exact firmware.",
          "Its programming is the same as the S7-1500 with a few exceptions: no software units, no ProDiag, no breakpoints, and no STL or GRAPH.",
          "It has OPC UA server and client functions. As on the S7-1200 and S7-1500, using the OPC UA server or client needs a licence.",
          "Check the update rate: the server publish interval is limited, so it is for supervision and data collection, not for fast control.",
          "Always check the <b>compatibility</b> of firmware, HSP and TIA version before an upgrade."
        ]],
        ["h", "Version control with Git"],
        ["p", "Until recently, a TIA Portal project was a large binary container that could not be merged line by line. Siemens has introduced a <b>text-based export format (SIMATIC Source Documents, 'SD')</b>, first for LAD blocks, data blocks and PLC data types and extended in V21 to FBD and SCL blocks. Because the files are text, standard tools like Git can show exactly what changed, who changed it and when."],
        ["code", "git init\ngit add .\ngit commit -m \"Sorter V0.1 baseline\"\ngit tag v0.1\n\n# new feature on its own branch\ngit switch -c feature/pusher-timeout\n# ...edit in TIA, export the changed blocks...\ngit diff                      # see which networks changed\ngit commit -am \"Add 2 s pusher timeout\"\ngit switch main && git merge feature/pusher-timeout", "A minimal Git routine for exported TIA sources"],
        ["ul", [
          "Commit small and often, with a message that says <b>why</b>.",
          "One person owns each block at a time. Text diffs help, but merging two people's changes in graphics-based LAD still needs a human look.",
          "Add a <code>.gitignore</code> so temporary files and caches stay out.",
          "Tag every version that goes to a machine (<code>git tag Line2_FAT</code>), so you can recreate exactly what ran."
        ]],
        ["h", "Testing and the Test Suite"],
        ["p", "Siemens offers a <b>Test Suite</b> option for automated tests of blocks (check which TIA Portal version and licence include it). Together with the text export it can make a pipeline possible: on every commit, build the project, run the tests in a simulation, and report the result. Lesson 13.5 shows the idea."],
        ["h", "Other things to watch in a new release"],
        ["ul", [
          "<b>Upgrading a project is one-way.</b> A project saved in V21 cannot be opened in V20. Keep a copy before upgrading, and upgrade all engineering PCs together.",
          "New <b>HSP</b> (hardware support packages) add new modules to older TIA versions.",
          "Check the <b>licence</b> and the <b>Windows version</b> support for the new release.",
          "Read the 'What is new' document, and test the upgrade on a copy of a real project first."
        ]],
        ["quiz", {
          q: "Which PLC language is NOT available on the S7-1200 G2?",
          options: ["LAD", "SCL", "GRAPH", "FBD"],
          answer: 2,
          why: "Siemens lists STL and GRAPH among the languages the S7-1200 G2 does not support, although it follows the S7-1500 instruction set otherwise."
        }],
        ["quiz", {
          q: "Why did the text-based export format make Git useful for TIA projects?",
          options: [
            "Git can now run the PLC",
            "Text files let Git show line-by-line differences, history and branches, which a binary project container cannot",
            "It compresses the project",
            "It removes the licence"
          ],
          answer: 1,
          why: "Version control needs diffable text to be effective."
        }],
        ["quiz", {
          q: "Before upgrading all your projects to a new TIA Portal version you should:",
          options: [
            "Delete the old versions",
            "Keep a copy of each project in the old version and test the upgrade on a copy",
            "Upgrade only the HMI",
            "Nothing: upgrades are always reversible"
          ],
          answer: 1,
          why: "Project upgrades are not reversible, and an unexpected compile error on the live version is costly."
        }],
        ["try", "Set up a Git repository for the sorter project. Make three commits with meaningful messages, create a branch, and look at the difference with <code>git log --oneline</code>."]
      ]
    },
    {
      id: "13.5", title: "PLCSIM Advanced and automated testing", minutes: 30,
      blocks: [
        ["p", "Testing at the machine is expensive, risky and slow. The professional answer is to test as much as possible <b>before</b> arriving: on a PC, with a virtual controller, repeatably. You met plain PLCSIM in lesson 1.5; this lesson goes further."],
        ["h", "PLCSIM versus PLCSIM Advanced"],
        ["fig", "plcsim-adv", "PLCSIM Advanced exposes virtual S7-1500 instances to test scripts, simulations and HMIs."],
        ["ul", [
          "<b>PLCSIM</b> (included with Professional): quick interactive testing in TIA Portal. Tag tables, sequence tables, and SIM tables. Simulates S7-1200 and S7-1500.",
          "<b>S7-PLCSIM Advanced</b> (separate licence): simulates <b>S7-1500</b> and ET 200SP CPUs (it does not do the S7-1200). Offers many <b>instances</b> at once, a <b>virtual Ethernet adapter</b> so that HMIs and other PCs can connect with TCP/IP, and an <b>API</b> (a .NET/COM library) so programs can read and write PLC data and control the simulation. One licence covers two instances, up to 16 in total. Simulated instances show a PLCSIM suffix in TIA Portal, port topology is not simulated, and the supported CPU list depends on the PLCSIM Advanced version.",
          "Typical extras: run-mode control, simulating module errors and OBs (for example OB 83, 86, 122 triggered through the API) and, depending on the version, time scaling to run long processes faster. Check the version's manual for what is available."
        ]],
        ["h", "What to test, and how"],
        ["ul", [
          "<b>Unit tests</b>: one FB at a time. Set inputs, step the cycle, check outputs. Fast and precise. For example: the Motor_Ctrl FB must not start with the overload tripped.",
          "<b>Integration tests</b>: the whole project against a simulated plant model (a 3D plant simulator, or a script that behaves like a tank).",
          "<b>Fault injection</b>: cut a sensor, freeze a heartbeat, simulate a module failure. Check the alarms.",
          "<b>Regression tests</b>: re-run the same tests after every change so old bugs do not return."
        ]],
        ["h", "A test written as a script"],
        ["p", "The exact syntax depends on the API and language (C#, Python wrapper, or a test tool). The structure is always the same, shown here as pseudocode:"],
        ["code", "plc = connect(instance = \"Sorter\")\nplc.power_on(); plc.run()\n\n# Test: pusher fault when front sensor never comes\nplc.write(\"S1_Start\", True);   plc.step(ms = 200)\nplc.write(\"B2_Metal\", True);   plc.step(ms = 100)\n# do NOT set B5_PusherA_front\nplc.step(ms = 2500)\nassert plc.read(\"Fault_PusherA\") == True,  \"timeout should have raised the fault\"\nassert plc.read(\"K1_Conveyor\")  == False, \"belt must stop on fault\"\nprint(\"T4 PASS\")", "Pseudocode for an automated test"],
        ["h", "Tips"],
        ["ul", [
          "Make tests <b>deterministic</b>: always start from the same state (cold restart, known values).",
          "Name tests like the test plan (T4) so results trace back to requirements.",
          "Keep test code in version control with the project (lesson 13.4).",
          "A simulated plant is never the real plant. Passing tests reduce risk; they do not remove commissioning (lesson 9.6)."
        ]],
        ["quiz", {
          q: "You need to run a test script that automatically drives inputs and checks outputs of a virtual S7-1500. Which tool fits?",
          options: ["Plain PLCSIM tag table", "S7-PLCSIM Advanced with its API", "The CPU web server", "A watch table"],
          answer: 1,
          why: "The API of PLCSIM Advanced is made for programmatic control of virtual instances."
        }],
        ["quiz", {
          q: "Why is fault injection valuable in simulation?",
          options: [
            "It is fun",
            "Faults that are dangerous or expensive to create on the real machine can be tested safely and repeatedly",
            "It speeds up the CPU",
            "It replaces the FAT"
          ],
          answer: 1,
          why: "Simulation lets you prove how the program reacts to sensor failure, timeouts and module errors without risk."
        }],
        ["try", "Write three test cases (inputs, steps, expected outputs) for your Motor_Ctrl FB: normal start, start with overload tripped, and stop while running. Run them manually in PLCSIM now; script them later."]
      ]
    },
    {
      id: "13.6", title: "Hands-on: hardening a CPU, MQTT and OPC UA", minutes: 40,
      blocks: [
        ["p", "Lessons 8.3 and 12.3 explained the ideas of OT security and plant data. Here you do some of it: lock down a CPU in TIA Portal, then stand up a small MQTT broker and an OPC UA client on your PC so you can see data move."],
        ["warn", "Do the network exercises only on your own PC and a test network. Never connect experiments to a production PLC, and never expose a broker or an OPC UA server to the internet."],
        ["h", "Part 1 · Harden the CPU"],
        ["p", "In the CPU properties in TIA Portal, the <b>Protection &amp; Security</b> area controls who can do what. Walk through it for any S7-1500 project:"],
        ["ul", [
          "<b>Access level</b>: do not leave 'Full access (no protection)'. Choose at least a level that needs a password to write, and set passwords for each level.",
          "<b>Connection mechanisms</b>: keep <b>'Permit access with PUT/GET communication from remote partner'</b> switched <b>off</b> unless a device really needs it. It lets anyone on the network read and write CPU memory.",
          "<b>Secure PG/PC and HMI communication</b>: enable it so engineering tools use encrypted, authenticated links.",
          "<b>Web server</b>: HTTPS only, users with minimal rights, disabled if unused (lesson 10.7).",
          "<b>Certificates</b>: use the project's <b>Global security settings</b> and certificate manager to create and assign certificates. Do not leave default self-signed certificates in a plant.",
          "<b>Unused services</b>: switch off what you do not use (OPC UA server, NTP, unused interfaces).",
          "<b>Document</b> the passwords in the plant's password safe, not in the program."
        ]],
        ["fig", "cpu-protection-mock", "CPU properties: where the protection and security settings live (illustrative mock-up)."],
        ["h", "Part 2 · A local MQTT broker"],
        ["p", "Install the free <b>Eclipse Mosquitto</b> broker on your PC. For a local test, create a small config file <code>mosquitto.conf</code>:"],
        ["code", "listener 1883 127.0.0.1\nallow_anonymous true", "mosquitto.conf (for a local-only test)"],
        ["code", "mosquitto -c mosquitto.conf -v\n\n# in a second terminal, listen to everything under plant1\nmosquitto_sub -h 127.0.0.1 -t \"plant1/#\" -v", "Run the broker and a subscriber"],
        ["p", "Now publish a pretend measurement from Python (install with <code>pip install paho-mqtt</code>):"],
        ["code", "import json, time, random\nimport paho.mqtt.client as mqtt\n\nclient = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)\nclient.connect(\"127.0.0.1\", 1883)\nclient.loop_start()\n\nwhile True:\n    msg = {\"v\": round(70 + random.random() * 5, 1), \"u\": \"C\",\n           \"ts\": time.strftime(\"%Y-%m-%dT%H:%M:%SZ\", time.gmtime())}\n    client.publish(\"plant1/line2/press1/temp\", json.dumps(msg), qos=1)\n    time.sleep(2)", "publisher.py"],
        ["fig", "mqtt-flow", "In a real plant an edge gateway or the PLC's MQTT client publishes, and a broker distributes."],
        ["p", "A real S7-1500 or S7-1200 can publish itself: Siemens provides an <b>MQTT client library (LMQTT)</b> with the function block <code>LMQTT_Client</code> that you call in a program. For production use the connection must use <b>TLS</b>, which needs the broker's CA certificate imported into TIA Portal's global certificate store and used for the connection, and a broker with users and access control lists."],
        ["h", "Part 3 · Read the PLC through OPC UA"],
        ["p", "Enable the OPC UA server in the CPU (it needs a licence on many CPUs; check lesson 6.3), mark the variables you want to expose, and download. Browse with a free client like UaExpert first to see the node IDs, then read from a script (<code>pip install asyncua</code>):"],
        ["code", "import asyncio\nfrom asyncua import Client\n\nasync def main():\n    async with Client(\"opc.tcp://192.168.0.1:4840\") as c:\n        node = c.get_node('ns=3;s=\"DB_Data\".\"Tank_Level\"')\n        print(\"Level =\", await node.read_value())\n\nasyncio.run(main())", "read_plc.py (node IDs depend on your project)"],
        ["note", "For anything beyond a lab, set the OPC UA security policy to a signed and encrypted mode, use a user name and password or a certificate, and trust only the client certificates you know."],
        ["h", "Checklist for a secured connection"],
        ["ul", [
          "Authentication: who is the client, who is the server?",
          "Encryption: TLS between the client and the server.",
          "Least privilege: read-only access unless writing is really needed.",
          "Segmentation: the broker and gateways live in a DMZ, not on the machine network.",
          "Monitoring: log connections and failed logins; review them."
        ]],
        ["quiz", {
          q: "Why should 'Permit access with PUT/GET communication from remote partner' normally stay off?",
          options: [
            "It slows the CPU",
            "It allows other devices on the network to read and write CPU memory without strong protection",
            "It disables OPC UA",
            "It deletes the program"
          ],
          answer: 1,
          why: "PUT/GET access is a classic weak point; enable it only for a partner that cannot use a more secure method, and restrict it with network controls."
        }],
        ["quiz", {
          q: "In MQTT, a subscriber subscribed to <code>plant1/#</code> receives:",
          options: [
            "Only messages to exactly plant1",
            "Messages published to any topic that starts with plant1/",
            "Nothing, # is invalid",
            "Only messages with QoS 2"
          ],
          answer: 1,
          why: "# is the multi-level wildcard and matches everything under the prefix."
        }],
        ["quiz", {
          q: "Which is the safest place for an MQTT broker that cloud applications use?",
          options: [
            "On the same network as the PLCs",
            "In a DMZ between the plant network and the outside, with TLS and user control",
            "On the PLC itself",
            "On an open port of the internet"
          ],
          answer: 1,
          why: "A DMZ keeps the plant network isolated while allowing controlled data flow."
        }],
        ["try", "Run the broker and the publisher, subscribe with mosquitto_sub, then change the publisher to send a JSON with a machine state ('running', 'fault'). Extend the topic name to include the machine id."]
      ]
    }
  ]
});
