window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 7,
  title: "7 · Advanced control",
  lessons: [
    {
      id: "7.1", title: "PID control", minutes: 30,
      blocks: [
        ["p", "On/off logic cannot hold a temperature at exactly 60 &deg;C, or a tank at 75 % level, or a motor at constant speed against a changing load. For that you need <b>closed-loop control</b>, and the workhorse is the <b>PID controller</b>."],
        ["fig", "pid-loop", "The loop: measure, compare with the setpoint, compute an output, act on the process, measure again."],
        ["h", "The simplest controller: ON / OFF"],
        ["p", "An ON/OFF controller drives the output fully on when the value is below the setpoint and fully off when it is above. A home thermostat does exactly this. It is cheap and robust, and often good enough for slow processes such as a tank or an oven. The catch is <b>chatter</b>: right at the setpoint it would switch on and off continuously. To prevent that you add <b>hysteresis</b>, a band around the setpoint inside which the output keeps its last state (the same idea you met in lesson 4.1)."],
        ["p", "The cost of ON/OFF control is that the value always swings across the band. When that swing is too large, or the process is fast, a continuous controller does better. You can compare both in the simulator below: switch the controller to <b>ON / OFF</b> and widen the hysteresis."],
        ["h", "What the three letters do"],
        ["ul", [
          "<b>P (proportional)</b>: output proportional to the error now. Bigger error, bigger push. Alone it leaves a steady <i>offset</i>.",
          "<b>I (integral)</b>: adds up the error over time, so any lasting error keeps increasing the output until it is gone. It removes the offset but can overshoot.",
          "<b>D (derivative)</b>: reacts to how fast the value is changing. It damps overshoot, but amplifies noise."
        ]],
        ["h", "Play with a real loop"],
        ["p", "The simulator is a heated tank: a slow process with a short delay. The green line is the measured value (PV), the orange dashed line is the setpoint. Try the presets, then drag the sliders yourself."],
        ["pid", { title: "PID loop simulator", process: true, onoff: true }],
        ["ul", [
          "<b>P only</b>: settles, but short of the setpoint. That gap is the offset.",
          "<b>PI</b>: reaches the setpoint exactly, with a little overshoot.",
          "<b>PID</b>: faster and with less overshoot.",
          "<b>Too aggressive</b>: gain too high and integral too fast: the loop oscillates. This is what a badly tuned loop looks like on a real plant.",
          "Switch on the <b>disturbance</b>. A good controller recovers quickly; a poor one wanders."
        ]],
        ["h", "Where do good numbers come from? Tuning rules"],
        ["p", "Guessing gets old quickly. Most tuning rules start from a simple model of the process: a <b>gain K</b> (how much the value moves per unit of output), a <b>time constant &tau;</b> (how slowly it moves) and a <b>dead time &theta;</b> (how long before anything moves at all). You can read these off a step test: change the output by a known amount and record the response. The simulator has sliders for all three."],
        ["ul", [
          "<b>SIMC</b> (simple internal model control): <code>Kp = &tau; / (K &middot; 2&theta;)</code>, <code>Ti = min(&tau;, 8&theta;)</code>. Smooth and robust. A good default.",
          "<b>Ziegler-Nichols</b> works from the <i>ultimate gain</i> Ku (the gain at which the loop oscillates steadily) and the oscillation period Tu. For PID: <code>Kp = 0.6 Ku</code>, <code>Ti = Tu / 2</code>, <code>Td = Tu / 8</code>. Fast, but the most aggressive of the three.",
          "<b>Chien-Hrones-Reswick (CHR)</b> works from the step-test model. The 0 % overshoot version gives for PID <code>Kp = 0.6 &tau; / (K&theta;)</code>, <code>Ti = &tau;</code>, <code>Td = 0.5 &theta;</code>. Cautious."
        ]],
        ["p", "Pick a rule with the buttons above the chart, then watch the response. Change the process sliders and apply a rule again: the numbers follow. On the default process, Ziegler-Nichols PID settles fastest and overshoots a little, while the SIMC and CHR PI settings are slower but never overshoot."],
        ["note", "<b>Auto-tuning</b> automates the same idea. A common method makes the output switch like a relay so the value oscillates around the setpoint, measures the oscillation, and computes parameters from it. PID_Compact's pretuning and fine tuning use a similar principle: they excite the process, measure how it responds and calculate PID values. Always check the result on the real plant, with safe limits in place."],
        ["warn", "Tuning rules give a starting point, not an answer. Real processes are not perfect first-order-plus-dead-time models. They saturate, change with load and have noise. Always limit the output, test with a disturbance, and make small changes."],
        ["h", "PID in TIA Portal: PID_Compact"],
        ["p", "S7-1200 and S7-1500 provide the <code>PID_Compact</code> instruction. It is a <b>technology object</b>, so it comes with a configuration editor and a built-in commissioning tool."],
        ["ul", [
          "Call it from a <b>cyclic interrupt OB</b> (such as OB30) so the sample time is constant, as in lesson 3.5.",
          "<code>Setpoint</code> and <code>Input</code> (your scaled Real measurement, or <code>Input_PER</code> for the raw analog word). <code>Output</code> gives 0 to 100 %, or <code>Output_PER</code> for an analog output, or <code>Output_PWM</code> for a switching output.",
          "<code>Mode</code>: 0 inactive, 1 pretuning, 2 fine tuning, 3 automatic, 4 manual (set <code>ModeActivate</code> to change).",
          "The <b>Commissioning</b> editor offers <i>Pretuning</i> and <i>Fine tuning</i>. The controller runs a test, measures how the process responds and computes the P, I and D values for you."
        ]],
        ["scl", "// In a cyclic interrupt OB (e.g. OB30, 100 ms)\n\"PID_Compact_1\"(Setpoint := \"Temp_SP\",\n                Input := \"Temp_C\",\n                Output => \"Heater_Pct\");", "calling PID_Compact"],
        ["h", "Tuning habits"],
        ["ul", [
          "Start with <b>P only</b>, raise gain until the response is lively, back off a little.",
          "Add <b>I</b> to remove the offset; make it slower than the process.",
          "Add <b>D</b> only if needed, and only if the signal is clean.",
          "Always limit the output (0 to 100 %) and make sure the integral stops growing when the output is at its limit (anti-windup, which PID_Compact does for you).",
          "<b>Reverse-acting loops</b> (cooling, not heating) need the logic inverted in the configuration."
        ]],
        ["quiz", {
          q: "Why does an ON/OFF controller need hysteresis?",
          options: ["To make the output smoother", "To stop it switching on and off continuously around the setpoint", "To remove the steady-state error", "To avoid dead time"],
          answer: 1,
          why: "Without a band, tiny changes around the setpoint would flip the output every scan. Hysteresis holds the last state inside the band."
        }],
        ["quiz", {
          q: "A P-only controller holds the temperature a few degrees below setpoint. What fixes the offset?",
          options: ["More derivative", "Adding integral action", "Reducing the sample time", "A bigger heater"],
          answer: 1,
          why: "Integral action keeps adding output while any error remains, so the error is driven to zero."
        }],
        ["try", "In the simulator, find a PID setting that reaches 60 % in the least time with no more than 5 % overshoot. Then turn on the disturbance and see whether it still recovers cleanly."]
      ]
    },
    {
      id: "7.2", title: "Motion control basics", minutes: 25,
      blocks: [
        ["p", "Moving something to an exact position, at a controlled speed, in step with other axes, is <b>motion control</b>. Typical uses: pick-and-place, feeders, cutters, packaging. TIA Portal has a built-in motion toolbox for S7-1200 and S7-1500."],
        ["fig", "motion-profile", "A move is a profile: speed up, travel, slow down. Acceleration and jerk set how gentle it is."],
        ["h", "Pieces"],
        ["ul", [
          "<b>Technology object (TO) axis</b>: in the project tree, <i>Technology objects &gt; Add new object &gt; Motion Control &gt; TO_PositioningAxis</i>. It holds the configuration: units, limits, drive type, dynamics.",
          "<b>The drive</b>: either a drive connected over PROFINET (PROFIdrive, lesson 6.4) or a stepper/servo driven by <b>pulse train outputs (PTO)</b> directly from the CPU (transistor-output S7-1200 models).",
          "<b>Motion blocks</b> (the PLCopen-style <code>MC_</code> instructions) that you call from the program."
        ]],
        ["h", "The usual instructions"],
        ["ul", [
          "<code>MC_Power</code>: enables the axis. Must be on before anything moves.",
          "<code>MC_Reset</code>: clears axis errors.",
          "<code>MC_Home</code>: sets the reference point (homing). Absolute moves require a homed axis.",
          "<code>MC_MoveAbsolute</code>, <code>MC_MoveRelative</code>: go to a position, or move a distance.",
          "<code>MC_MoveVelocity</code>, <code>MC_MoveJog</code>: run at a speed, or jog while a button is held.",
          "<code>MC_Halt</code>: stop smoothly."
        ]],
        ["p", "Motion blocks are <b>edge-triggered</b>: a rising edge on <code>Execute</code> starts the command. The outputs tell you what happened: <code>Busy</code> (running), <code>Done</code> (finished), <code>CommandAborted</code> (cancelled by another command), <code>Error</code> (with an <code>ErrorID</code>)."],
        ["scl", "// Axis enabled\n\"MC_Power_DB\"(Axis := \"Axis_1\", Enable := \"Axis_On\", StartMode := 1, StopMode := 0,\n              Status => \"Axis_Powered\");\n\n// Move to 250 mm at 100 mm/s on a rising edge of #Go\n\"MC_MoveAbsolute_DB\"(Axis := \"Axis_1\", Execute := #Go, Position := 250.0, Velocity := 100.0,\n                     Done => #Done, Busy => #Busy, Error => #Error);", "enable and move"],
        ["h", "How a servo knows where it is: encoders"],
        ["p", "A <b>servo</b> is a motor with a feedback device and a controller that closes position, speed and current loops around it. The feedback is usually an <b>encoder</b> on the motor shaft. An <b>incremental encoder</b> produces two pulse trains, A and B, shifted by a quarter period (<b>quadrature</b>). Which one changes first tells you the direction, and every edge is one step of position. An index pulse Z marks one position per turn."],
        ["encoder", { title: "Incremental encoder: quadrature signals" }],
        ["ul", [
          "<b>Decoding x4</b> counts every edge of A and B, so a 12-slot disc gives 48 counts per turn. Higher decoding means higher resolution from the same disc.",
          "<b>Incremental</b> encoders only know movement since power-up, so the machine must <b>home</b> (find a reference) after every start. <b>Absolute</b> encoders know their position at once.",
          "Fast counting is done by <b>high-speed counters</b> in the hardware, not by the normal program scan, which would miss pulses."
        ]],
        ["h", "Motion profiles: how long does a move take?"],
        ["p", "A controlled move accelerates, cruises and decelerates. The area under the velocity curve is the distance. If the distance is too short to reach the top speed, the profile becomes a triangle. Try different numbers:"],
        ["profile", { title: "Motion profile calculator" }],
        ["p", "Acceleration is usually the limit that matters: large loads need gentle acceleration, and the drive and mechanics set the maximum. Real profiles also limit <b>jerk</b> (the change of acceleration) to give smooth S-curves."],
        ["h", "Synchronising axes"],
        ["p", "Many machines need one axis to follow another. An <b>electronic gear</b> makes a slave axis follow a master at a fixed ratio. An <b>electronic cam</b> follows a position table instead of a ratio. A <b>virtual master</b> is a master axis that exists only in software and drives the whole machine. Typical examples are <b>cut-to-length</b> and <b>flying shear</b> applications, where a knife must match the speed of moving material for the instant of the cut."],
        ["h", "Sequencing a move"],
        ["p", "In real programs you wrap these in a small state machine (lesson 4.4): power the axis, home it, wait for <code>Done</code>, then run the next move. Never start a new command while one is busy unless you intend to override it."],
        ["warn", "Moving machinery is dangerous. Configure software and hardware limit switches, test with the drive disabled or the mechanism uncoupled, and add physical end stops. Treat homing as a first-class feature."],
        ["quiz", {
          q: "Which instruction must be active before an axis can be commanded to move?",
          options: ["MC_MoveAbsolute", "MC_Power", "MC_Halt", "PID_Compact"],
          answer: 1,
          why: "MC_Power enables the axis. Without it, move commands are rejected."
        }],
        ["quiz", {
          q: "What does the area under a velocity-time curve represent?",
          options: ["Acceleration", "Distance travelled", "Jerk", "Power"],
          answer: 1,
          why: "Distance is the integral of velocity over time: the area under the curve."
        }]
      ]
    },
    {
      id: "7.3", title: "Machine modes, sequences and batching", minutes: 25,
      blocks: [
        ["p", "As machines grow, &quot;start&quot; and &quot;stop&quot; are not enough. You need to deal with <b>modes</b> (automatic, manual, maintenance), <b>holds</b> (pause without losing the batch), <b>aborts</b> and <b>restarts</b>. The industry has a standard answer: a common <b>state model</b>."],
        ["fig", "packml", "A simplified PackML-style state model. Machines from different makers behave consistently."],
        ["ul", [
          "<b>Acting states</b> (Starting, Execute, Completing, Holding, Stopping, Aborting...) do work and end by themselves.",
          "<b>Waiting states</b> (Idle, Held, Complete, Stopped, Aborted) wait for a command.",
          "A <b>Stop</b> or <b>Abort</b> command can be given from nearly any state. Abort is the urgent one."
        ]],
        ["p", "PackML (for packaging machines) and ISA-88 (for batch processes) both use this idea. If the whole plant uses a common model, then the HMI, the line controller and the maintenance staff all understand every machine without special explanations."],
        ["h", "A recipe-driven sequencer"],
        ["p", "A batch is a list of <b>steps</b>. Each step has a time and some setpoints. Keep the steps as <b>data</b> (a recipe table) and the logic as a <b>generic engine</b>:"],
        ["scl", "// Static: State : Int; Step : Int; T_Step : TON; Recipe : Array[1..10] of \"Type_Step\"; StepCount : Int\n// Type_Step: Duration : Time; Heater_SP : Real; Stirrer : Bool\n\n#T_Step(IN := (#State = 20), PT := #Recipe[#Step].Duration);\n\nCASE #State OF\n    10: // IDLE\n        IF #Cmd_Start THEN\n            #Step := 1;\n            #State := 20;\n        END_IF;\n    20: // EXECUTE one step\n        IF #T_Step.Q THEN\n            IF #Step < #StepCount THEN\n                #State := 21;\n            ELSE\n                #State := 30;\n            END_IF;\n        END_IF;\n    21: // NEXT STEP (one scan, resets the timer)\n        #Step := #Step + 1;\n        #State := 20;\n    30: // COMPLETE\n        IF #Cmd_Reset THEN\n            #State := 10;\n        END_IF;\nEND_CASE;\n\n// Outputs follow the active step\nIF #State = 20 THEN\n    #Heater_SP := #Recipe[#Step].Heater_SP;\n    #Stirrer   := #Recipe[#Step].Stirrer;\nELSE\n    #Heater_SP := 0.0;\n    #Stirrer   := FALSE;\nEND_IF;", "FB Batch_Sequencer"],
        ["note", "State 21 exists only to drop the timer's <code>IN</code> for one scan, which resets it before the next step starts. Small tricks like this are why sequences need testing with unusual cases: what happens on a Stop in the middle of a step?"],
        ["h", "Practical points"],
        ["ul", [
          "Add <b>Hold</b>, <b>Stop</b> and <b>Abort</b> transitions that are valid from every acting state. Decide what each must do to the outputs.",
          "Make the recipe selectable and <b>validated</b> (limits, step count) before it runs.",
          "Log batch start, end and any deviation: traceability matters in food, pharma and chemicals.",
          "Keep the <b>sequence</b> logic separate from the <b>equipment</b> logic (pump, valve blocks), so you can change the recipe without touching the equipment code."
        ]],
        ["quiz", {
          q: "In a state model, which kind of state ends by itself without an operator command?",
          options: ["Waiting states like Idle", "Acting states like Starting or Completing", "Only Held", "None"],
          answer: 1,
          why: "Acting states perform work and then transition when their job is done; waiting states need a command."
        }],
        ["try", "Extend the sequencer with a <b>Hold</b> state: a Hold command from Execute pauses the step timer, and a Resume continues it. Sketch the diagram first."]
      ]
    },
    {
      id: "7.4", title: "Libraries and reusable templates", minutes: 20,
      blocks: [
        ["p", "A professional does not rewrite a motor block for every project. They keep a <b>library</b> of tested, versioned blocks and reuse them. TIA Portal has libraries built in."],
        ["fig", "library-types", "Types are versioned. Update the type, release it, then update the instances in each project."],
        ["h", "Two kinds of library content"],
        ["ul", [
          "<b>Types</b>: blocks, UDTs, HMI faceplates with a <b>version history</b>. When you update a type, every project that uses it can be brought up to date. Use for stable, shared standards.",
          "<b>Master copies</b>: plain copies you paste and then change. Use for starting points, such as a project template or a whole machine skeleton."
        ]],
        ["p", "<b>Project library</b> belongs to one project. A <b>global library</b> is a separate file you can open in any project, share with a team, and archive."],
        ["h", "A workflow"],
        ["ul", [
          "Develop the block in a project and test it.",
          "Add it to the library as a <b>type</b>, giving it a version like <code>1.0.0</code> and marking it <i>released</i>.",
          "Use it in projects. TIA Portal tracks which type version every instance uses.",
          "To change it, create a new <b>version</b> in the library (<code>1.1.0</code>), test, release, and update the instances.",
          "Document the change in the version comment so a colleague knows why."
        ]],
        ["note", "Siemens publishes ready-made libraries (for example basic controls and drive control libraries) and a programming guideline for S7-1200/1500 on its industry support portal. Use them as references for good structure, and check their licence and version compatibility before relying on them."],
        ["h", "What makes a block library-worthy"],
        ["ul", [
          "A <b>small, clear interface</b>: inputs, outputs, and nothing hidden.",
          "<b>No global tags</b> inside the block. Everything it needs arrives through its interface, so it works in any project.",
          "<b>Documented</b>: block comment, parameter comments, a note on what the outputs mean.",
          "<b>Tested</b> with unusual inputs, not just the happy path.",
          "<b>Versioned</b> with a change history."
        ]],
        ["quiz", {
          q: "You fixed a bug in a motor block used in 12 projects. What is the cleanest way to roll it out?",
          options: ["Copy the code into each project by hand", "Update the library type to a new version and update the instances", "Tell each team to remember the fix", "Delete the old type"],
          answer: 1,
          why: "Typed library content has a version history and instances can be updated centrally, so every project gets the same tested fix."
        }],
        ["try", "Create a project library, add your <code>Motor_Ctrl</code> FB as a type with version 1.0.0, then change its comment and release 1.0.1. Update the instance in your project."]
      ]
    },
    {
      id: "7.5", title: "PID lab: level control of a tank", minutes: 35,
      blocks: [
        ["p", "This lesson follows a classic lab: control the <b>level of a tank</b> with a Siemens PLC and <code>PID_Compact</code>. A pump circulates water, an <b>air-to-close</b> proportional valve sets the flow into the tank, a level transmitter measures the result, and a hand valve drains the tank at a steady rate. The controller must hold the level at a setpoint in centimetres."],
        ["h", "Concepts in one place"],
        ["ul", [
          "<b>Process variable (PV)</b>: what you control, here the level in cm.",
          "<b>Setpoint (SP)</b>: where you want it.",
          "<b>Manipulated variable (output)</b>: what the controller changes, here the valve signal.",
          "<b>Disturbance</b>: anything else that moves the PV, such as opening the drain valve.",
          "<b>Closed loop</b>: the sensor feeds the result back so the controller can correct. It is more complex than open loop but keeps working when conditions change."
        ]],
        ["h", "The trap: an air-to-close valve"],
        ["p", "An air-to-close valve <b>closes</b> as its control signal rises. So when the level is too low and the controller raises its output, the valve closes further and the level drops even more. The loop runs away. The fix is the <b>Invert control logic</b> option, which makes the controller reverse acting. Try it yourself, first without the option:"],
        ["pidtank", { title: "PID lab: tank level (air-to-close valve)" }],
        ["ul", [
          "With <b>Invert control logic</b> off, press <b>Lab values</b> and watch the level run away to the bottom of the tank.",
          "Tick the box: the same settings now hold the level at the setpoint.",
          "Try <b>P only</b>: the level settles away from the setpoint. That gap is the steady-state error. Then try <b>PI</b>.",
          "Switch on the drain disturbance and see which settings recover best."
        ]],
        ["note", "Kp 30, Ti 1.5 s and Td 0.25 s are the kind of values a lab manual gives for one specific rig. They are a starting point. Your own plant needs its own tuning, using the methods in lesson 7.1."],
        ["h", "Build it in TIA Portal"],
        ["ul", [
          "<b>Support program</b>: write a function (for example <code>SystemOperation</code>) that starts the pump when the process starts and switches on an indicator. As long as there is flow, the controller can work in automatic mode.",
          "<b>Cyclic interrupt OB</b>: <code>PID_Compact</code> is a technology instruction that needs a steady sample time. Create a cyclic interrupt OB (100 ms) and place the PID_Compact block in it (<i>Instructions &gt; Technology &gt; PID Control &gt; Compact PID</i>).",
          "<b>Configure</b>: set the controller type to length (cm). Tick <b>Invert control logic</b> for the air-to-close valve. Use <code>Input</code> for the level in cm and <code>Output_PER</code> for the analog output to the valve converter.",
          "<b>Process value limits</b>: high limit 25.0 cm, low limit 0.0 cm. Leave scaling alone if you use <code>Input</code> directly.",
          "<b>PID parameters</b>: enable manual entry and type Kp, Ti and Td. To get <b>P</b> control set Ti and Td to 0. For <b>PI</b> set Td to 0.",
          "<b>HMI</b>: add a panel, connect it to the PLC, and build a screen with the setpoint field, the level display and a trend, as in lesson 5.2."
        ]],
        ["scl", "// Cyclic interrupt OB (e.g. OB30, 100 ms)\n\"PID_Compact_1\"(Setpoint := \"Level_SP_cm\",\n                Input := \"Level_cm\",\n                Output_PER => \"Valve_Out\");", "PID_Compact in the cyclic OB"],
        ["warn", "A real process station has water, electricity and moving parts. Follow the lab procedure: start up in the right order, never leave the pump running dry, and shut down by stopping the pump, draining the tank and switching off the supply."],
        ["try", "In the simulator: find settings that bring the level to 20 cm within about 8 seconds with no more than 1 cm overshoot. Then switch the disturbance on and note how far the level dips."],
        ["quiz", {
          q: "The inflow valve is air-to-close and the controller is direct acting. The level is below the setpoint. What happens?",
          options: ["The level rises to the setpoint", "The output rises, the valve closes further and the level falls: the loop runs away", "Nothing, the valve stays as it is", "The PID block reports an error immediately"],
          answer: 1,
          why: "A direct-acting controller raises its output when the level is low. With an air-to-close valve that closes the valve more. Invert control logic fixes it."
        }],
        ["quiz", {
          q: "How do you turn a PID_Compact configuration into a P-only controller?",
          options: ["Set Kp to 0", "Set Ti and Td to 0", "Disable the block", "Set the setpoint to 0"],
          answer: 1,
          why: "Setting Ti = 0 removes the integral action and Td = 0 removes the derivative action, leaving proportional only."
        }]
      ]
    }

  ]
});
