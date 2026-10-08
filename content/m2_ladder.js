window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 2,
  title: "2 · Ladder logic (LAD)",
  lessons: [
    {
      id: "2.1", title: "Reading a ladder diagram", minutes: 12,
      blocks: [
        ["p", "Ladder logic is drawn from a vertical <b>power rail</b> on the left. Each horizontal line is a <b>rung</b> (TIA Portal calls it a <b>network</b>). Imagine power flowing from the rail to the right. Textbooks often show a second rail on the right; TIA Portal does not draw one, and the rung simply ends at the coil. It can only pass through a contact if the contact is <i>true</i>, and when power reaches a coil the coil switches on."],
        ["fig", "ladder-anatomy", "Anatomy of a rung."],
        ["h", "The two contacts you must know"],
        ["ul", [
          "<b>Normally open contact</b> <code>--| |--</code>: passes power when its bit is <b>1</b>.",
          "<b>Normally closed contact</b> <code>--|/|--</code>: passes power when its bit is <b>0</b>."
        ]],
        ["p", "Important: these names describe what the <i>program</i> checks, not the physical device. A NO contact in the program that references an input bit simply asks &quot;is that bit 1?&quot;"],
        ["h", "Try it"],
        ["p", "Flip the switch. Watch both rungs. One uses a normally open contact, the other a normally closed contact on the same switch."],
        ["sim", {
          title: "Contacts: normally open and normally closed",
          inputs: [{ tag: "Switch_A", addr: "%I0.0", label: "Toggle switch", kind: "switch" }],
          outputs: [
            { tag: "Lamp_NO", addr: "%Q0.0", label: "On when Switch_A = 1", kind: "lamp", color: "#2fb86a" },
            { tag: "Lamp_NC", addr: "%Q0.1", label: "On when Switch_A = 0", kind: "lamp", color: "#f2b84b" }
          ],
          rungs: [
            { title: "Normally open", c: [["NO", "Switch_A"]], o: ["coil", "Lamp_NO"] },
            { title: "Normally closed", c: [["NC", "Switch_A"]], o: ["coil", "Lamp_NC"] }
          ]
        }],
        ["note", "Every rung is evaluated top to bottom, left to right, once per scan. Coils write their result immediately, and later rungs can already see it."],
        ["try", "In the simulator above, work out in advance what each lamp does when the switch is on, then flip it to check."],
        ["note", "Using Allen-Bradley (Rockwell) notes in your course? The ladder logic is the same, only the names differ. <b>XIC</b> (examine if closed) is the normally open contact. <b>XIO</b> (examine if open) is the normally closed contact. <b>OTE</b> (output energize) is the plain coil. <b>OTL</b> and <b>OTU</b> (latch and unlatch) are Set and Reset. Timers (TON, TOF, RTO) and counters (CTU, CTD) work the same way as their Siemens equivalents."],
        ["quiz", {
          q: "A normally closed contact in a program references the bit <code>Door_Closed</code>. When does it pass power?",
          options: ["When Door_Closed is 1", "When Door_Closed is 0", "Always", "Only on the first scan"],
          answer: 1,
          why: "A normally closed contact in the program is true when its bit is 0 (it inverts the bit)."
        }]
      ]
    },
    {
      id: "2.2", title: "AND, OR and NOT", minutes: 15,
      blocks: [
        ["p", "Logic from your childhood boolean algebra maps directly onto the ladder shape."],
        ["ul", [
          "<b>AND</b>: contacts in <b>series</b>. Power must pass through all of them.",
          "<b>OR</b>: contacts in <b>parallel</b> branches. Power can take any one path.",
          "<b>NOT</b>: a <b>normally closed</b> contact, which inverts."
        ]],
        ["p", "Combining them gives any logic function. Experiment with all three switches below and predict each lamp first."],
        ["sim", {
          title: "AND, OR, XOR and a combination",
          inputs: [
            { tag: "A", addr: "%I0.0", label: "Switch A", kind: "switch" },
            { tag: "B", addr: "%I0.1", label: "Switch B", kind: "switch" },
            { tag: "C", addr: "%I0.2", label: "Switch C", kind: "switch" }
          ],
          outputs: [
            { tag: "Q_AND", addr: "%Q0.0", label: "A AND B", kind: "lamp", color: "#2fb86a" },
            { tag: "Q_OR", addr: "%Q0.1", label: "A OR B", kind: "lamp", color: "#2fb86a" },
            { tag: "Q_XOR", addr: "%Q0.2", label: "A XOR B (exactly one)", kind: "lamp", color: "#f2b84b" },
            { tag: "Q_MIX", addr: "%Q0.3", label: "(A OR B) AND NOT C", kind: "lamp", color: "#4db3e0" }
          ],
          rungs: [
            { title: "AND", c: [["NO", "A"], ["NO", "B"]], o: ["coil", "Q_AND"] },
            { title: "OR", c: [["par", [[["NO", "A"]], [["NO", "B"]]]]], o: ["coil", "Q_OR"] },
            { title: "XOR", c: [["par", [[["NO", "A"], ["NC", "B"]], [["NC", "A"], ["NO", "B"]]]]], o: ["coil", "Q_XOR"] },
            { title: "(A OR B) AND NOT C", c: [["par", [[["NO", "A"]], [["NO", "B"]]]], ["NC", "C"]], o: ["coil", "Q_MIX"] }
          ]
        }],
        ["h", "In TIA Portal"],
        ["p", "To make a parallel branch, drag an <b>Open branch</b> from the toolbar above the editor, or select a contact and use the branch button. Connect the branch back with the <b>close branch</b> button. One or two clicks, and TIA draws the junction."],
        ["note", "XOR (exclusive or) is built from two AND paths in parallel. It has no dedicated ladder symbol, but FBD has an XOR box."],
        ["try", "Set A and B on and C off, then turn C on. Which lamps change, and why?"],
        ["quiz", {
          q: "Which wiring gives <i>Alarm = Door_Open OR Window_Open</i>?",
          options: ["Two contacts in series", "Two contacts in parallel branches", "One normally closed contact", "Two coils in series"],
          answer: 1,
          why: "Parallel branches give power an either/or path, which is OR."
        }]
      ]
    },
    {
      id: "2.3", title: "Start/stop with a seal-in", minutes: 20,
      blocks: [
        ["p", "A push button is momentary: it makes contact only while pressed. But a motor should keep running after you release <i>Start</i>. The PLC needs to <b>remember</b>. The classic trick is the <b>seal-in</b> (or latching) circuit, and every PLC programmer writes it hundreds of times."],
        ["p", "Idea: let the <i>output itself</i> keep the rung alive. Put a contact of the motor bit in parallel with the Start button. Once the motor is on, its own contact holds the rung true. The Stop button, in series, breaks the rung and everything drops out."],
        ["sim", {
          title: "Seal-in: both buttons are simple push buttons",
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start (normally open)", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop (normally open)", kind: "push" }
          ],
          outputs: [{ tag: "Motor", addr: "%Q0.0", label: "Motor contactor", kind: "motor" }],
          rungs: [{ title: "Start/stop seal-in", c: [["par", [[["NO", "Start_PB"]], [["NO", "Motor"]]]], ["NC", "Stop_PB"]], o: ["coil", "Motor"] }]
        }],
        ["p", "Press Start and release. The motor keeps running because its own contact feeds the rung. Press Stop and the normally closed contact opens, killing the loop."],
        ["h", "Stop-dominant, always"],
        ["p", "Put the Stop contact <b>in series after</b> the parallel branch, as above. Then Stop wins even if Start is held down. Machine builders insist on this: stopping must always work."],
        ["h", "The wiring trap: fail-safe stop buttons"],
        ["p", "In the simulation above the Stop button is wired as <i>normally open</i> and the program uses a <i>normally closed</i> contact. Real machines are done differently, and you must learn why."],
        ["fig", "estop-wiring", "Wire the stop button normally closed. A cut wire then behaves exactly like a pressed button."],
        ["p", "If a stop button were wired normally open and a wire fell off, the PLC would never see Stop, and the machine could not be stopped. With a normally closed stop button, a broken wire reads 0, which the program treats as <i>stop</i>. The machine fails safe. The consequence for the program: the signal is <b>1 when everything is fine</b>, so the program uses a <b>normally open contact</b> for Stop."],
        ["sim", {
          title: "Seal-in with a real, fail-safe NC stop button",
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start (normally open)", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop", kind: "push", nc: true }
          ],
          outputs: [{ tag: "Motor", addr: "%Q0.0", label: "Motor contactor", kind: "motor" }],
          rungs: [{ title: "Start/stop with NC stop wiring", c: [["par", [[["NO", "Start_PB"]], [["NO", "Motor"]]]], ["NO", "Stop_PB"]], o: ["coil", "Motor"] }]
        }],
        ["p", "Look at the tag chips below the ladder: <code>Stop_PB</code> reads <b>1</b> at rest and drops to <b>0</b> while pressed. The ladder now uses a <b>normally open</b> contact for Stop, so the symbols look &quot;backwards&quot; but the behaviour is right and fail-safe."],
        ["warn", "Emergency stops are never handled by ordinary PLC logic alone. Real E-stops and guards use a safety relay or a safety PLC (F-CPU). That is covered much later; for now, treat the simulator's Stop as a normal stop."],
        ["quiz", {
          q: "A stop button is wired normally closed. What should the program use for it?",
          options: ["A normally closed contact", "A normally open contact", "A coil", "A timer"],
          answer: 1,
          why: "The input is 1 while the button is healthy, so a normally open (true-when-1) contact keeps the rung alive and drops out when the input falls to 0."
        }],
        ["try", "Put the seal-in in TIA Portal: <code>Start_PB</code> in parallel with <code>Motor_Run</code>, then <code>Stop_PB</code> in series, then coil <code>Motor_Run</code>. Wire your Stop NC (set its PLCSIM bit to 1 as the &quot;healthy&quot; state)."]
      ]
    },
    {
      id: "2.4", title: "Set and reset coils", minutes: 15,
      blocks: [
        ["p", "A normal coil <code>( )</code> follows its rung: on when power arrives, off when it does not. A <b>Set</b> coil <code>(S)</code> switches the bit on and <b>keeps it on</b> even after power disappears. A <b>Reset</b> coil <code>(R)</code> switches it off. It is another way to hold a state, without needing the seal-in."],
        ["sim", {
          title: "Set / Reset latch",
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start (NO)", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop (NO)", kind: "push" }
          ],
          outputs: [{ tag: "Motor", addr: "%Q0.0", label: "Motor contactor", kind: "motor" }],
          rungs: [
            { title: "Start sets the motor", c: [["NO", "Start_PB"]], o: ["set", "Motor"] },
            { title: "Stop resets the motor", c: [["NO", "Stop_PB"]], o: ["reset", "Motor"] }
          ]
        }],
        ["p", "Press Start and release: the motor holds. Now hold <b>both</b> buttons. The result depends on which rung is lower, because the later rung is evaluated last. That is the PLC rule: <b>the last write in the scan wins</b>. Here Reset is below Set, so Stop dominates."],
        ["h", "Seal-in or set/reset?"],
        ["ul", [
          "<b>Seal-in</b>: the bit is true only while the rung is true. If the rung is interrupted (stop, fault) it falls and needs a restart. Simple, robust, the default for motors.",
          "<b>Set/Reset</b>: the bit stays set regardless of the rung. Needed for flags, memories, alarms that must be acknowledged. But it is easier to get wrong because the state hides in the coil."
        ]],
        ["h", "The dual-coil bug"],
        ["p", "Never write the same bit with a <i>normal coil</i> in two places. Try it here: both switches should turn the lamp on, but one of them never will."],
        ["sim", {
          title: "Dual-coil bug: the last rung wins",
          inputs: [
            { tag: "Switch_A", addr: "%I0.0", label: "Switch A", kind: "switch" },
            { tag: "Switch_B", addr: "%I0.1", label: "Switch B", kind: "switch" }
          ],
          outputs: [{ tag: "Lamp", addr: "%Q0.0", label: "Lamp", kind: "lamp" }],
          rungs: [
            { title: "Rung 1 writes Lamp", c: [["NO", "Switch_A"]], o: ["coil", "Lamp"] },
            { title: "Rung 2 also writes Lamp", c: [["NO", "Switch_B"]], o: ["coil", "Lamp"] }
          ]
        }],
        ["p", "Switch A alone does nothing, because rung 2 overwrites the lamp with FALSE right after. Fix it by combining the conditions into one rung with an OR branch."],
        ["warn", "TIA Portal does not forbid duplicate coils, and the cross-reference list will not warn you. Make a habit: each bit is written by exactly one rung (or by a set/reset pair)."],
        ["quiz", {
          q: "Two normal coils write the same bit in rungs 1 and 5. Rung 1 is true, rung 5 is false. What is the bit at the end of the scan?",
          options: ["TRUE", "FALSE", "Undefined", "TRUE for one scan only"],
          answer: 1,
          why: "Rung 5 executes last and writes FALSE, overwriting rung 1's result."
        }]
      ]
    },
    {
      id: "2.5", title: "Edge detection", minutes: 15,
      blocks: [
        ["p", "Sometimes you want to react to the <i>moment</i> something happens, not to its state. A button pressed for a whole second is true for dozens of scans. If your logic adds 1 each scan while the button is true, you would count dozens instead of one."],
        ["fig", "edge-diagram", "A rising edge (P, positive) or falling edge (N, negative) is true for exactly one scan."],
        ["p", "In LAD you use a <b>P contact</b> (positive edge) <code>--|P|--</code> or <b>N contact</b> (negative edge) <code>--|N|--</code>. Each one needs a <b>memory bit</b> to remember the previous state of the signal. On every scan it compares the current value with the stored one."],
        ["h", "A classic: toggle with one button"],
        ["p", "Press once: the lamp turns on. Press again: it turns off. It needs the edge to react once per press. Watch the memory bit and the <code>Pulse</code> bit in the tag chips as you press."],
        ["sim", {
          title: "One-button on/off toggle",
          inputs: [{ tag: "Push_PB", addr: "%I0.0", label: "Push button", kind: "push" }],
          outputs: [{ tag: "Lamp", addr: "%Q0.0", label: "Lamp", kind: "lamp" }],
          rungs: [
            { title: "One-scan pulse on a rising edge", c: [["P", "Push_PB", "M_Prev"]], o: ["coil", "Pulse"] },
            { title: "Lamp is off: request ON", c: [["NO", "Pulse"], ["NC", "Lamp"]], o: ["coil", "Req_On"] },
            { title: "Lamp is on: request OFF", c: [["NO", "Pulse"], ["NO", "Lamp"]], o: ["coil", "Req_Off"] },
            { title: "Apply ON", c: [["NO", "Req_On"]], o: ["set", "Lamp"] },
            { title: "Apply OFF", c: [["NO", "Req_Off"]], o: ["reset", "Lamp"] }
          ]
        }],
        ["p", "Why the <code>Req_On</code>/<code>Req_Off</code> detour? If you set the lamp in rung 2 and test it again in rung 3 within the same scan, rung 3 would see the lamp already on and switch it straight off. Deciding first and applying afterwards avoids that. This &quot;read, decide, then write&quot; habit prevents many scan-order bugs."],
        ["note", "Hold the button down: the lamp toggles only once. Release and press again to toggle again. Also try tapping very quickly. The simulator keeps the button down for at least one scan, just like a real PLC with filtered inputs."],
        ["h", "In TIA Portal"],
        ["p", "Instructions &gt; Basic instructions &gt; Bit logic operations has <code>P</code> and <code>N</code> contacts. Give each its own memory bit (an M bit or a Bool in a data block). Never share one memory bit between two edge instructions."],
        ["quiz", {
          q: "A button is held for 2 seconds. How many scans is the output of a rising-edge (P) contact true?",
          options: ["All of them", "Exactly one", "None", "Two"],
          answer: 1,
          why: "The P contact is true only on the scan where the signal changed from 0 to 1."
        }],
        ["try", "Press and hold the toggle button for several seconds, then release. How many times did the lamp change state?"]
      ]
    },
    {
      id: "2.6", title: "Timers: TON, TOF and TP", minutes: 25,
      blocks: [
        ["p", "Timers let a program act on time: delay a start, run a fan on after the light goes out, flash a lamp. IEC timers have inputs <code>IN</code> (start condition) and <code>PT</code> (preset time), and outputs <code>Q</code> (done/active) and <code>ET</code> (elapsed time)."],
        ["h", "TON: on-delay"],
        ["p", "Q turns on after IN has been continuously true for PT. If IN drops early the timer resets and Q never fires."],
        ["fig", "timing-ton", "TON. The second, short pulse is ignored."],
        ["sim", {
          title: "TON: motor starts 3 s after the switch",
          inputs: [{ tag: "Start_Sw", addr: "%I0.0", label: "Start switch", kind: "switch" }],
          outputs: [{ tag: "Motor", addr: "%Q0.0", label: "Motor contactor", kind: "motor" }],
          rungs: [
            { title: "Start delay timer", c: [["NO", "Start_Sw"]], o: ["ton", "T_Start", 3000] },
            { title: "Motor when the timer is done", c: [["NO", "T_Start.Q"]], o: ["coil", "Motor"] }
          ]
        }],
        ["p", "Switch on, then switch off before 3 s: nothing happens. Leave it on: after 3 s Q rises and the motor starts."],
        ["h", "TOF: off-delay"],
        ["p", "Q turns on immediately with IN and stays on for PT after IN falls. Typical use: a cooling fan that runs for a while after the machine stops."],
        ["fig", "timing-tof", "TOF."],
        ["sim", {
          title: "TOF: fan keeps running 5 s after the switch is turned off",
          inputs: [{ tag: "Machine_Sw", addr: "%I0.0", label: "Machine run switch", kind: "switch" }],
          outputs: [{ tag: "Fan", addr: "%Q0.0", label: "Cooling fan", kind: "motor" }],
          rungs: [
            { title: "Off-delay timer", c: [["NO", "Machine_Sw"]], o: ["tof", "T_Fan", 5000] },
            { title: "Fan runs while Q is true", c: [["NO", "T_Fan.Q"]], o: ["coil", "Fan"] }
          ]
        }],
        ["h", "TP: pulse"],
        ["p", "A rising edge on IN starts a fixed-length pulse on Q. Releasing IN early does not shorten it, and a new rising edge during the pulse is ignored."],
        ["fig", "timing-tp", "TP."],
        ["h", "Record your own timing diagram"],
        ["p", "Pick a timer, set PT, and use the IN switch (or the Pulse button) to draw a trace. Try a short pulse on a TON, then a long one. Try the same on TOF and TP."],
        ["timerplay", {}],
        ["h", "Putting two timers together: a flasher"],
        ["p", "Each timer's done bit starts the other. Together they make a free-running oscillator: the standard way to blink a lamp from logic alone."],
        ["sim", {
          title: "Flasher: 1 s on, 1 s off",
          inputs: [{ tag: "Enable", addr: "%I0.0", label: "Enable flashing", kind: "switch" }],
          outputs: [{ tag: "Lamp", addr: "%Q0.0", label: "Flashing lamp", kind: "lamp", color: "#f2b84b" }],
          rungs: [
            { title: "Off-period timer", c: [["NO", "Enable"], ["NC", "T2.Q"]], o: ["ton", "T1", 1000] },
            { title: "On-period timer", c: [["NO", "T1.Q"]], o: ["ton", "T2", 1000] },
            { title: "Lamp is on while T1 is done", c: [["NO", "T1.Q"]], o: ["coil", "Lamp"] }
          ]
        }],
        ["h", "In TIA Portal"],
        ["ul", [
          "Instructions &gt; Basic instructions &gt; Timer operations: <code>TON</code>, <code>TOF</code>, <code>TP</code>.",
          "A timer needs its own memory, the <b>instance data block</b>. When you drop one in, TIA asks to create it. Accept <i>Single instance</i> in OB1 for now. (Inside an FB you will use a multi-instance, lesson 3.3.)",
          "<code>PT</code> is a <code>Time</code> value: <code>T#3s</code>, <code>T#500ms</code>, <code>T#1m30s</code>. <code>ET</code> shows elapsed time.",
          "The output bit is <code>MyTimer.Q</code>, elapsed is <code>MyTimer.ET</code>."
        ]],
        ["h", "A traffic light from three timers"],
        ["p", "Three on-delay timers in a chain give a repeating red, green, amber cycle. This time the ladder drives an animated junction: the car only moves on green."],
        ["sim", {
          title: "Traffic light with three timers",
          plant: "traffic",
          inputs: [{ tag: "Enable", addr: "%I0.0", label: "Traffic light on", kind: "switch", init: true }],
          outputs: [
            { tag: "Red", addr: "%Q0.0", label: "Red lamp", kind: "lamp", color: "#ff4d3d" },
            { tag: "Amber", addr: "%Q0.1", label: "Amber lamp", kind: "lamp", color: "#ffbf1f" },
            { tag: "Green", addr: "%Q0.2", label: "Green lamp", kind: "lamp", color: "#3ddc84" }
          ],
          rungs: [
            { title: "Red period (4 s)", c: [["NO", "Enable"], ["NC", "T_Amb.Q"]], o: ["ton", "T_Red", 4000] },
            { title: "Green period (3 s)", c: [["NO", "T_Red.Q"]], o: ["ton", "T_Green", 3000] },
            { title: "Amber period (1 s)", c: [["NO", "T_Green.Q"]], o: ["ton", "T_Amb", 1000] },
            { title: "Red lamp", c: [["NO", "Enable"], ["NC", "T_Red.Q"]], o: ["coil", "Red"] },
            { title: "Green lamp", c: [["NO", "T_Red.Q"], ["NC", "T_Green.Q"]], o: ["coil", "Green"] },
            { title: "Amber lamp", c: [["NO", "T_Green.Q"], ["NC", "T_Amb.Q"]], o: ["coil", "Amber"] }
          ]
        }],
        ["p", "Follow one cycle in the ladder: while <code>T_Red</code> counts, red is on. When it finishes, <code>T_Green</code> starts and green is on until it finishes, then amber. When <code>T_Amb</code> finishes it resets the whole chain."],
        ["quiz", {
          q: "You need a siren to sound for exactly 4 seconds after a button press, even if the button is released after 1 second. Which timer?",
          options: ["TON", "TOF", "TP", "A counter"],
          answer: 2,
          why: "TP generates a fixed-length pulse from a rising edge regardless of what IN does next."
        }],
        ["quiz", {
          q: "IN of a TON (PT = 5 s) is true for 3 s and then false. What is Q?",
          options: ["True after 5 s", "Never true", "True for 2 s", "True for 3 s"],
          answer: 1,
          why: "TON needs IN true continuously for PT. Dropping early resets ET and Q never fires."
        }],
        ["try", "Use the flasher and think: how would you make it on for 0.5 s and off for 1.5 s? (Change PT of each timer.)"]
      ]
    },
    {
      id: "2.7", title: "Counters", minutes: 15,
      blocks: [
        ["p", "Counters track how many times something happened: bottles on a conveyor, cycles of a press, parts in a box. The three IEC counters are <b>CTU</b> (count up), <b>CTD</b> (count down) and <b>CTUD</b> (both)."],
        ["fig", "counter-diagram", "CTU. Each rising edge on CU adds 1. R clears the count."],
        ["fig", "ctu-block", "The same counter as you will see it in the TIA Portal editor: pins CU, R, PV, Q and CV."],
        ["ul", [
          "<code>CU</code>: count-up input. Counts on each <i>rising edge</i>, so a held signal still counts once.",
          "<code>R</code>: reset. While true, the count is forced to 0.",
          "<code>PV</code>: preset value, the target.",
          "<code>Q</code>: true when <code>CV</code> &ge; <code>PV</code>.",
          "<code>CV</code>: current value, an <code>Int</code>."
        ]],
        ["sim", {
          title: "Batch counter: 5 parts fill a box",
          inputs: [
            { tag: "Part_Sensor", addr: "%I0.0", label: "Part sensor (tap it)", kind: "push" },
            { tag: "Reset_PB", addr: "%I0.1", label: "Reset button", kind: "push" }
          ],
          outputs: [{ tag: "Box_Full", addr: "%Q0.0", label: "Box full lamp", kind: "lamp", color: "#2fb86a" }],
          rungs: [
            { title: "Count parts", c: [["NO", "Part_Sensor"]], o: ["ctu", "C_Parts", 5, "Reset_PB"] },
            { title: "Lamp when CV reaches PV", c: [["NO", "C_Parts.Q"]], o: ["coil", "Box_Full"] }
          ]
        }],
        ["p", "Tap the sensor five times. At CV = 5 the lamp lights and the count keeps rising if you keep tapping. Press Reset to clear it. A good program also resets the counter when the box is replaced."],
        ["h", "A counting conveyor"],
        ["p", "Now a machine that moves. The belt runs, parts pass a photo sensor, the PLC counts them and stops the belt when the box holds 5. Press <b>Start</b>, watch the count, then press <b>Reset</b> to swap in an empty box."],
        ["sim", {
          title: "Counting conveyor (animated machine)",
          plant: "conveyor",
          sensors: [{ tag: "Part_Sensor", addr: "%I0.2", label: "Photo sensor above the belt" }],
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start (NO)", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop", kind: "push", nc: true },
            { tag: "Reset_PB", addr: "%I0.3", label: "Box replaced: reset count", kind: "push" }
          ],
          outputs: [
            { tag: "Motor", addr: "%Q0.0", label: "Belt motor", kind: "motor" },
            { tag: "Box_Full", addr: "%Q0.1", label: "Box full lamp", kind: "lamp", color: "#2fb86a" }
          ],
          rungs: [
            { title: "Run request; stops when the box is full", c: [["par", [[["NO", "Start_PB"]], [["NO", "Run_Req"]]]], ["NO", "Stop_PB"], ["NC", "Box_Full"]], o: ["coil", "Run_Req"] },
            { title: "Belt motor", c: [["NO", "Run_Req"]], o: ["coil", "Motor"] },
            { title: "Count the parts", c: [["NO", "Part_Sensor"]], o: ["ctu", "C_Parts", 5, "Reset_PB"] },
            { title: "Box full", c: [["NO", "C_Parts.Q"]], o: ["coil", "Box_Full"] }
          ]
        }],
        ["p", "Notice that the PLC never sees the box. It only sees the sensor pulses and counts them. The fifth part is still on the belt when the motor stops. In a real machine you would add a sensor at the box to confirm what actually arrived."],
        ["h", "Counting up and down"],
        ["p", "A <b>CTUD</b> counter has both a count-up input (CU) and a count-down input (CD). A car park is the classic example: a car in adds one, a car out takes one away. <code>QU</code> is on when the count reaches the preset (full), and <code>QD</code> is on when it is 0 or less (empty). Note that at power-up the count is 0, so the car park starts out <i>empty</i>."],
        ["sim", {
          title: "Car park with a CTUD counter (5 spaces)",
          inputs: [
            { tag: "Car_In", addr: "%I0.0", label: "Entry barrier sensor", kind: "push" },
            { tag: "Car_Out", addr: "%I0.1", label: "Exit barrier sensor", kind: "push" },
            { tag: "Reset_PB", addr: "%I0.2", label: "Attendant reset", kind: "push" }
          ],
          outputs: [
            { tag: "Lot_Full", addr: "%Q0.0", label: "FULL sign", kind: "lamp", color: "#ff4d3d" },
            { tag: "Lot_Empty", addr: "%Q0.1", label: "EMPTY sign", kind: "lamp", color: "#4db3e0" }
          ],
          rungs: [
            { title: "Count cars in and out", c: [["NO", "Car_In"]], o: ["ctud", "C_Cars", 5, "Reset_PB", "Car_Out"] },
            { title: "FULL sign", c: [["NO", "C_Cars.QU"]], o: ["coil", "Lot_Full"] },
            { title: "EMPTY sign", c: [["NO", "C_Cars.QD"]], o: ["coil", "Lot_Empty"] }
          ]
        }],
        ["p", "Use the <b>LAD / FBD</b> switch in the simulator header to see the same counter as a function block diagram."],
        ["h", "In TIA Portal"],
        ["p", "Instructions &gt; Basic instructions &gt; Counter operations. Like a timer, a counter needs an instance data block. The outputs are <code>QU</code> and <code>CV</code>. For counts above 32767 use the <code>DInt</code> version (<code>CTU_DInt</code>). Consider whether the count must survive a power cut. If so, mark the instance DB values as retentive."],
        ["warn", "Counting a sensor that bounces (contact chatter) over-counts. Real counting sensors use a debounce time, an input filter in the hardware settings, or a high-speed counter."],
        ["quiz", {
          q: "A CTU has PV = 10 and CV is now 10. Q is...",
          options: ["False", "True", "Undefined", "True only for one scan"],
          answer: 1,
          why: "Q is true while CV is greater than or equal to PV."
        }],
        ["try", "Tap the sensor 7 times without pressing reset. What are CV and the lamp? Then press Reset and watch them clear."]
      ]
    },
    {
      id: "2.8", title: "Mini project: motor with start delay and fault", minutes: 30,
      blocks: [
        ["p", "Time to combine everything. The specification of a small but realistic motor starter:"],
        ["ul", [
          "<b>Start</b> (NO button) requests the motor. A horn sounds for 3 seconds before the motor starts.",
          "<b>Stop</b> (NC button) stops it immediately.",
          "A <b>thermal overload relay</b> (NC contact: 1 = healthy) trips on motor overheat.",
          "On a trip the motor stops and a <b>latching fault lamp</b> lights. It stays on until the overload is healthy again <i>and</i> the operator presses <b>Fault reset</b>.",
          "While faulted the motor cannot be restarted."
        ]],
        ["sim", {
          title: "Motor starter with horn, delay and latched fault",
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start (NO)", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop", kind: "push", nc: true },
            { tag: "Overload_OK", addr: "%I0.2", label: "Overload relay contact (1 = healthy)", kind: "switch", init: true },
            { tag: "Fault_Reset", addr: "%I0.3", label: "Fault reset (NO)", kind: "push" }
          ],
          outputs: [
            { tag: "Motor", addr: "%Q0.0", label: "Motor contactor", kind: "motor" },
            { tag: "Horn", addr: "%Q0.1", label: "Warning horn", kind: "lamp", color: "#f2b84b" },
            { tag: "Fault_Lamp", addr: "%Q0.2", label: "Fault lamp", kind: "lamp", color: "#ef6f6c" }
          ],
          rungs: [
            { title: "Overload trips: latch fault", c: [["NC", "Overload_OK"]], o: ["set", "Fault"] },
            { title: "Reset only when healthy", c: [["NO", "Fault_Reset"], ["NO", "Overload_OK"]], o: ["reset", "Fault"] },
            { title: "Run request (seal-in), stop wins, no fault", c: [["par", [[["NO", "Start_PB"]], [["NO", "Run_Req"]]]], ["NO", "Stop_PB"], ["NC", "Fault"]], o: ["coil", "Run_Req"] },
            { title: "3 s start delay", c: [["NO", "Run_Req"]], o: ["ton", "T_Start", 3000] },
            { title: "Horn while waiting", c: [["NO", "Run_Req"], ["NC", "T_Start.Q"]], o: ["coil", "Horn"] },
            { title: "Motor after the delay", c: [["NO", "T_Start.Q"]], o: ["coil", "Motor"] },
            { title: "Fault lamp", c: [["NO", "Fault"]], o: ["coil", "Fault_Lamp"] }
          ]
        }],
        ["h", "Walk through it"],
        ["ul", [
          "Press Start: horn for 3 s, then the motor.",
          "Turn <code>Overload_OK</code> off while it runs: the fault latches, <code>Run_Req</code> drops, everything stops.",
          "Turn it back on: the lamp stays lit. Press Fault reset: the lamp goes out and you can start again.",
          "Press Stop during the horn: the delay is cancelled and the motor never starts."
        ]],
        ["note", "Notice the structure: <b>latch the fault</b>, <b>decide whether the machine may run</b>, <b>derive timers</b>, then <b>drive the outputs</b>. Cleanly separating the decision from the output is how professionals keep larger programs understandable. In module 3 you will turn this whole thing into a reusable block."],
        ["try", "Build this in TIA Portal in OB1 with PLCSIM. Create tags for every signal, use one rung per row of the simulator, and test every bullet in the walk-through."],
        ["quiz", {
          q: "Why does the Reset rung also require <code>Overload_OK</code>?",
          options: ["To save memory", "So the fault cannot be cleared while the motor is still overheated", "Because reset needs an edge", "It is not needed"],
          answer: 1,
          why: "Allowing reset while the cause persists would let the operator restart a tripped motor, hiding the fault."
        }]
      ]
    }
  ]
});
