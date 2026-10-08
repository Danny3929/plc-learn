window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 11,
  title: "11 · Practice lab",
  lessons: [
    {
      id: "11.1", title: "Logic drills", minutes: 40,
      blocks: [
        ["p", "Reading teaches you the instructions; <b>solving problems</b> teaches you to program. This lesson gives you four exercises. For each one: read the specification, write the I/O list, build the program in TIA Portal and test it in PLCSIM <i>before</i> you open the solution. The solutions are hidden on purpose."],
        ["note", "How to work: (1) list inputs and outputs with addresses and tags, (2) write the behaviour as sentences, (3) draw the sequence or truth table, (4) program, (5) test every sentence, including what must <i>not</i> happen."],
        ["h", "Exercise 1 · Two-hand control of a press"],
        ["p", "A press is operated with two buttons, one for each hand, so the operator's hands are away from the tool. The press output may be on only while <b>both</b> buttons are pressed, and only if they were pressed within <b>0.5 s</b> of each other. After each cycle both buttons must be released before the press can run again."],
        ["code", "Inputs   %I0.0 Left_PB (NO)   %I0.1 Right_PB (NO)\nOutputs  %Q0.0 Press_Enable", "I/O list"],
        ["ul", [
          "<b>Hint 1</b>: pressing only one button must start a 0.5 s timer.",
          "<b>Hint 2</b>: you need a bit that says 'armed'; it becomes 1 again only when both buttons are 0.",
          "<b>Hint 3</b>: a button taped down must not allow the press to run."
        ]],
        ["reveal", "Show a solution (SCL)", [
          ["scl", "// Window timer runs while exactly one button is pressed\n#T_Sync(IN := (#Left XOR #Right), PT := T#500ms);\n\n// Armed again only when both buttons are released\nIF NOT #Left AND NOT #Right THEN\n    #Armed := TRUE;\nEND_IF;\n// Too slow: the operator must release both before trying again\nIF #T_Sync.Q THEN\n    #Armed := FALSE;\nEND_IF;\n\n#Press_Enable := #Left AND #Right AND #Armed;", "FB TwoHand"],
          ["p", "A taped-down button stays pressed, so <code>Armed</code> never returns after the first cycle: the press can start only once. That is the required safe behaviour. (Real two-hand control for personal protection must be done with a certified safety relay or safety PLC, lesson 8.2. This is a logic exercise.)"]
        ]],
        ["h", "Exercise 2 · Two interlocked motors"],
        ["p", "Motor A is a feed screw and motor B is a conveyor that carries the product away. B may only run while A is running. Stopping A must stop B automatically. Each motor has its own start and stop button (stop buttons wired NC)."],
        ["sim", {
          title: "Reference behaviour: B depends on A",
          inputs: [
            { tag: "Start_A", addr: "%I0.0", label: "Start A", kind: "push" },
            { tag: "Stop_A", addr: "%I0.1", label: "Stop A (NC)", kind: "push", nc: true },
            { tag: "Start_B", addr: "%I0.2", label: "Start B", kind: "push" },
            { tag: "Stop_B", addr: "%I0.3", label: "Stop B (NC)", kind: "push", nc: true }
          ],
          outputs: [
            { tag: "Motor_A", addr: "%Q0.0", label: "Motor A", kind: "motor", color: "#2fb86a" },
            { tag: "Motor_B", addr: "%Q0.1", label: "Motor B", kind: "motor", color: "#4db3e0" }
          ],
          rungs: [
            { title: "Motor A: seal-in, stop wins", c: [["par", [[["NO", "Start_A"]], [["NO", "Motor_A"]]]], ["NO", "Stop_A"]], o: ["coil", "Motor_A"] },
            { title: "Motor B: same, but only while A runs", c: [["par", [[["NO", "Start_B"]], [["NO", "Motor_B"]]]], ["NO", "Stop_B"], ["NO", "Motor_A"]], o: ["coil", "Motor_B"] }
          ]
        }],
        ["try", "Try starting B first, then A, then stop A. Then extend the program: B must also stop if it has run for 30 s without a part detected."],
        ["h", "Exercise 3 · Alarm with acknowledge and flashing lamp"],
        ["p", "When a fault input comes on: the horn sounds and the lamp <b>flashes</b>. The operator presses Acknowledge: the horn stops and the lamp shows <b>steady</b>. When the fault has gone <i>and</i> has been acknowledged, everything switches off. This is the standard alarm pattern (lesson 5.3)."],
        ["sim", {
          title: "Reference behaviour: alarm, acknowledge, clear",
          inputs: [
            { tag: "Alarm_In", addr: "%I0.0", label: "Fault signal", kind: "switch" },
            { tag: "Ack_PB", addr: "%I0.1", label: "Acknowledge", kind: "push" }
          ],
          outputs: [
            { tag: "Lamp", addr: "%Q0.0", label: "Alarm lamp", kind: "lamp", color: "#f2554b" },
            { tag: "Horn", addr: "%Q0.1", label: "Horn", kind: "lamp", color: "#f2b84b" }
          ],
          rungs: [
            { title: "Fault appears: latch alarm", c: [["NO", "Alarm_In"]], o: ["set", "Alm"] },
            { title: "Acknowledge only counts while the alarm is active", c: [["NO", "Alm"], ["NO", "Ack_PB"]], o: ["set", "Acked"] },
            { title: "Clear: fault gone AND acknowledged", c: [["NC", "Alarm_In"], ["NO", "Acked"]], o: ["reset", "Alm"] },
            { title: "Clear the acknowledge too", c: [["NC", "Alm"]], o: ["reset", "Acked"] },
            { title: "Flasher: 0.5 s on, 0.5 s off", c: [["NC", "T_Off.Q"]], o: ["ton", "T_On", 500] },
            { title: "Flasher: second timer", c: [["NO", "T_On.Q"]], o: ["ton", "T_Off", 500] },
            { title: "Lamp: flashing until acknowledged, then steady", c: [["par", [[["NO", "Alm"], ["NC", "Acked"], ["NO", "T_On.Q"]], [["NO", "Alm"], ["NO", "Acked"]]]]], o: ["coil", "Lamp"] },
            { title: "Horn until acknowledged", c: [["NO", "Alm"], ["NC", "Acked"]], o: ["coil", "Horn"] }
          ]
        }],
        ["p", "Test: switch the fault on, acknowledge, then switch it off. Then try switching the fault off <i>before</i> acknowledging: the lamp must keep flashing, because the operator has not yet seen the alarm."],
        ["h", "Exercise 4 · Garage door"],
        ["p", "Write the control for a garage door. One push button OPEN/CLOSE/STOP cycle (open, stop, close, stop, ...). Limit switches <code>Fully_Open</code> and <code>Fully_Closed</code>. A safety light barrier: if it is interrupted while the door is closing, the door must stop and reverse to fully open. Outputs: <code>Motor_Up</code>, <code>Motor_Down</code> (never both)."],
        ["ul", [
          "Draw the states first: closed, opening, open, closing, stopped half-way. Then program it as a state machine (lesson 4.4).",
          "Decide: what does the button do in each state? What if the barrier is interrupted while opening?",
          "Make the two motor outputs mutually exclusive in software, and think about a hardware interlock."
        ]],
        ["reveal", "Show the state table", [
          ["code", "State          Button press        Barrier broken      Limit switch\nCLOSED (0)     -> OPENING          -                   -\nOPENING (1)    -> STOPPED_UP       (ignore)            Fully_Open  -> OPEN\nOPEN (2)       -> CLOSING          -                   -\nCLOSING (3)    -> STOPPED_DOWN     -> OPENING (reverse) Fully_Closed -> CLOSED\nSTOPPED_UP (4) -> CLOSING          -                   -\nSTOPPED_DOWN(5)-> OPENING          -                   -\n\nMotor_Up   = State = 1\nMotor_Down = State = 3", "Garage door state table"],
          ["p", "Notice that the outputs depend on the state alone, so <code>Motor_Up</code> and <code>Motor_Down</code> can never be 1 together. Add a start-up rule: after a CPU restart go to a safe state (stopped), not to the last movement."]
        ]],
        ["quiz", {
          q: "In the two-hand control, why does the 'armed' bit return only when both buttons are released?",
          options: [
            "To save memory",
            "So a button taped down or held cannot start a second cycle without a fresh two-handed action",
            "To reduce the scan time",
            "Because timers need it"
          ],
          answer: 1,
          why: "Requiring both to be released forces a real, deliberate operation each cycle, defeating tape and tied-down buttons."
        }],
        ["quiz", {
          q: "In the alarm program, the fault disappears before the operator acknowledges. What should the lamp do?",
          options: ["Switch off at once", "Keep flashing until the alarm is acknowledged", "Turn steady", "Switch off after 10 s"],
          answer: 1,
          why: "An unacknowledged alarm must stay visible even if the fault has already gone: the operator has to see it first."
        }]
      ]
    },
    {
      id: "11.2", title: "Timer and counter drills", minutes: 35,
      blocks: [
        ["p", "Timers and counters appear in almost every program, and the patterns repeat. Learn these five and you will recognise them everywhere."],
        ["h", "Exercise 1 · Sequential motor start"],
        ["p", "Starting three large motors together overloads the supply. On Start: motor 1 starts at once, motor 2 two seconds later, motor 3 two seconds after that. Stop switches everything off at once. Build it with the simulator below as the reference."],
        ["sim", {
          title: "Reference: cascade start",
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop (NC)", kind: "push", nc: true }
          ],
          outputs: [
            { tag: "M1", addr: "%Q0.0", label: "Motor 1", kind: "motor", color: "#2fb86a" },
            { tag: "M2", addr: "%Q0.1", label: "Motor 2", kind: "motor", color: "#4db3e0" },
            { tag: "M3", addr: "%Q0.2", label: "Motor 3", kind: "motor", color: "#f2b84b" }
          ],
          rungs: [
            { title: "Run request", c: [["par", [[["NO", "Start_PB"]], [["NO", "Run"]]]], ["NO", "Stop_PB"]], o: ["coil", "Run"] },
            { title: "2 s after run", c: [["NO", "Run"]], o: ["ton", "T2", 2000] },
            { title: "2 s after motor 2", c: [["NO", "M2"]], o: ["ton", "T3", 2000] },
            { title: "Motor 1", c: [["NO", "Run"]], o: ["coil", "M1"] },
            { title: "Motor 2", c: [["NO", "T2.Q"]], o: ["coil", "M2"] },
            { title: "Motor 3", c: [["NO", "T3.Q"]], o: ["coil", "M3"] }
          ]
        }],
        ["try", "Extend it so that the motors stop in the <i>reverse</i> order, 2 s apart (motor 3 first). Which timer type do you need, and what must the Run bit not control any longer?"],
        ["h", "Exercise 2 · Signal stretcher"],
        ["p", "A photo sensor gives a 20 ms pulse as a part flies past. The scan is 10 ms, but the HMI polls every 500 ms and always misses it. Make the output stay on for 1 s after each pulse."],
        ["reveal", "Show a solution", [
          ["p", "This is a job for an <b>off-delay timer (TOF)</b> or a pulse timer (TP) with PT = 1 s: the sensor is IN, Q is the stretched signal."],
          ["scl", "#T_Stretch(IN := #Sensor, PT := T#1s);   // TOF instance\n#Part_Seen := #T_Stretch.Q;", "TOF stretching"],
          ["p", "TOF's Q goes high at once on the rising edge and stays on for PT after the falling edge. Use TP if you want exactly 1 s regardless of the input width."]
        ]],
        ["h", "Exercise 3 · Bottle filler"],
        ["p", "Bottles pass on a conveyor. A sensor counts them. Every 6th bottle the conveyor stops, the filling valve opens for 3 s, and then the conveyor continues. The counter resets for the next batch of 6. Show the number of bottles on the HMI."],
        ["ul", [
          "Counter: <code>CTU</code> with PV = 6 and an auto-reset after the fill.",
          "Sequence: RUN, BATCH FULL (stop belt), FILL (3 s timer), back to RUN. Use a small state machine.",
          "Think about: a bottle sensed while the belt is stopping, and what happens if the valve sticks."
        ]],
        ["reveal", "Show a solution", [
          ["scl", "// Count one pulse per bottle (rising edge handled inside CTU)\n#C_Bottles(CU := #Bottle_Sensor, R := (#State = 2 AND #T_Fill.Q), PV := 6);\n\nCASE #State OF\n    0:  // RUN\n        IF #C_Bottles.Q THEN #State := 1; END_IF;\n    1:  // STOP belt, wait for it to settle (0.5 s)\n        IF #T_Settle.Q THEN #State := 2; END_IF;\n    2:  // FILL for 3 s\n        IF #T_Fill.Q THEN #State := 0; END_IF;\n    ELSE\n        #State := 0;\nEND_CASE;\n\n#T_Settle(IN := (#State = 1), PT := T#500ms);\n#T_Fill(IN := (#State = 2), PT := T#3s);\n\n#Belt_Motor := (#State = 0);\n#Fill_Valve := (#State = 2);", "Bottle filler"],
          ["note", "The counter's Q is true while CV >= PV. It is reset only at the end of the fill, so the belt stays stopped until then."]
        ]],
        ["h", "Exercise 4 · Car park counter"],
        ["p", "A car park has 5 spaces. A sensor at the entrance and one at the exit count cars in and out. Show 'FULL' when no space is free. Reset the count when the attendant presses reset. This is the up/down counter of lesson 2.7: use the reference there to check yours."],
        ["h", "Exercise 5 · Run-time meter"],
        ["p", "Count the hours a pump has run, to schedule maintenance. The value must survive power loss. Warn when 500 hours is reached."],
        ["reveal", "Show a solution", [
          ["scl", "// Count once per second from the CPU clock memory bit (1 Hz)\n#Clock_1s := \"Clock_1Hz\";                   // system clock memory bit, 1 Hz\n\nIF #Clock_1s AND NOT #Clock_Old AND \"Pump_Running\" THEN\n    #Seconds := #Seconds + 1;\n    IF #Seconds >= 3600 THEN\n        #Seconds := 0;\n        #Hours := #Hours + 1;                    // Static, Retain\n    END_IF;\nEND_IF;\n#Clock_Old := #Clock_1s;\n\n#Service_Due := (#Hours >= 500);", "Retentive run-time meter"],
          ["p", "Mark <code>#Hours</code> and <code>#Seconds</code> as <b>Retain</b> so they survive power loss. Do not count scans or use a timer's elapsed time for long periods: a Time variable overflows after 24.8 days."]
        ]],
        ["quiz", {
          q: "A sensor pulse of 20 ms must be seen by an HMI polling every 500 ms. Which element fixes this?",
          options: ["A TON with 1 s", "A TOF or TP of 1 s on the sensor", "A faster CPU", "A normally closed contact"],
          answer: 1,
          why: "An off-delay (TOF) or pulse timer stretches the short pulse long enough to be read."
        }],
        ["quiz", {
          q: "In the cascade start, motor 3 starts 2 s after motor 2. Why is the second timer driven by M2 rather than by Run?",
          options: [
            "It saves a timer",
            "It guarantees motor 3 follows motor 2's actual start, so the delays add up and the order is kept",
            "Timers cannot use Run twice",
            "The ladder needs it for syntax"
          ],
          answer: 1,
          why: "Chaining each step on the previous output keeps the order correct even if you change one delay."
        }]
      ]
    },
    {
      id: "11.3", title: "Process drills: pumps, tanks, conveyors", minutes: 40,
      blocks: [
        ["p", "Plants run on a few recurring problems: keep a level, share the work between two pumps, route product. These drills use inputs and outputs close to real equipment."],
        ["h", "Exercise 1 · Tank with hysteresis"],
        ["p", "A float switch gives Low and High level. Pump on at Low, pump off at High. The pump must not run dry: if the supply tank signals empty, stop it. Use the tank simulator (lesson 4.1) to check your logic: it uses the same signals."],
        ["h", "Exercise 2 · Duty / standby pumps"],
        ["p", "Two identical pumps supply a system. Only one runs. At every new demand the other pump takes the lead, so the wear is equal. If the running pump faults, the other starts automatically. Only both faulted gives an alarm."],
        ["code", "Inputs   Request, Fault1, Fault2 (1 = faulted)\nOutputs  Pump1, Pump2, Alarm_Both\nStatic   Lead (1 or 2), Req_Old", "Interface"],
        ["reveal", "Show a solution (SCL)", [
          ["scl", "// Swap the lead pump on every new request\nIF #Request AND NOT #Req_Old THEN\n    #Lead := 3 - #Lead;                  // 1 <-> 2\nEND_IF;\n#Req_Old := #Request;\n\n// Wanted pump: the lead pump, or the other one if the lead has failed\n#Want1 := #Request AND ((#Lead = 1 AND NOT #Fault1) OR (#Lead = 2 AND #Fault2));\n#Want2 := #Request AND ((#Lead = 2 AND NOT #Fault2) OR (#Lead = 1 AND #Fault1));\n\n#Pump1 := #Want1 AND NOT #Fault1;\n#Pump2 := #Want2 AND NOT #Fault2;\n#Alarm_Both := #Fault1 AND #Fault2;", "FB Duty_Standby"],
          ["note", "Initialise <code>#Lead</code> to 1 and make it retentive so the alternation continues after a power cut. Add a timer to avoid hunting if the demand flickers."]
        ]],
        ["h", "Exercise 3 · Batch mixing"],
        ["p", "A mixer takes two ingredients and mixes them. Sequence: open valve A until the level sensor L1; open valve B until L2; run the stirrer for 30 s; open the drain until the tank is empty (L0 off); repeat for the number of batches set by the operator. Add a stop button which finishes the current step safely."],
        ["ul", [
          "Draw it as a step chain (lesson 10.5): Idle, Fill A, Fill B, Mix, Drain, count batch.",
          "Each filling step should have a <b>timeout</b>: if L1 does not arrive in 60 s, raise 'valve A fault'.",
          "Use a counter for the batches and compare with the setpoint."
        ]],
        ["h", "Exercise 4 · Sorting conveyor"],
        ["p", "Parts of two kinds, short and tall, travel on a conveyor. A height sensor mid-belt detects tall parts. A pusher after the sensor must push the tall ones into a bin, and let the short ones pass. The pusher is 1.2 s down the belt from the sensor."],
        ["ul", [
          "The PLC must <b>remember</b> that a tall part is coming. Delay the decision with a timer, or use a shift register (lesson 0.7) when parts follow each other closely.",
          "What happens if two tall parts are 0.5 s apart? A single timer cannot track both. That is why professional sorting uses an encoder and a position queue.",
          "This is the main idea of the capstone in lesson 8.6."
        ]],
        ["reveal", "Hint for the closely-spaced parts", [
          ["p", "Count belt pulses from the encoder instead of using seconds. Store 'tall' flags in an array indexed by position, shift the array every N pulses, and read the pusher decision from the right position. Then belt speed no longer matters."]
        ]],
        ["quiz", {
          q: "In the duty/standby logic, why swap the lead pump on each new request?",
          options: [
            "To reduce the electricity bill",
            "To spread the running hours equally and keep both pumps proven working",
            "Because the PLC requires it",
            "To avoid timers"
          ],
          answer: 1,
          why: "Alternating balances wear and avoids a standby pump that is seized when finally needed."
        }],
        ["quiz", {
          q: "Two tall parts pass 0.5 s apart, but the pusher is 1.2 s from the sensor. Why can one timer not handle it?",
          options: [
            "Timers cannot be restarted",
            "The second part restarts the timer, so the first part's push is lost or delayed",
            "The scan is too slow",
            "The sensor has no memory"
          ],
          answer: 1,
          why: "A single timer holds one delay at a time. Overlapping events need a queue, shift register or position tracking."
        }]
      ]
    },
    {
      id: "11.4", title: "Analog and SCL drills", minutes: 40,
      blocks: [
        ["p", "Analog signals are noisy, jumpy and out of range. These five small SCL functions appear in nearly every project. Write each one yourself, test it with a slider in PLCSIM, then compare."],
        ["h", "Exercise 1 · Scale with limits"],
        ["p", "Write an FC <code>Scale_AI</code>: input the raw value (Int), the engineering range (Real low and high); output the Real value, limited to the range, and a Bool <code>Wire_Break</code> when the raw value is below the underflow limit for 4 to 20 mA."],
        ["reveal", "Show a solution", [
          ["scl", "IF #Raw < -4864 THEN                  // below about 1.2 mA\n    #Wire_Break := TRUE;\n    #Value := #Low;                    // safe value; or hold the last good one\nELSE\n    #Wire_Break := FALSE;\n    #Value := SCALE_X(MIN := #Low, MAX := #High,\n                      VALUE := NORM_X(MIN := 0, VALUE := #Raw, MAX := 27648));\n    #Value := LIMIT(MN := #Low, IN := #Value, MX := #High);\nEND_IF;", "FC Scale_AI"]
        ]],
        ["h", "Exercise 2 · Hysteresis thermostat"],
        ["p", "Heater on when the temperature falls below SP minus the hysteresis, off when it rises above SP plus the hysteresis. In between: keep the last state."],
        ["reveal", "Show a solution", [
          ["scl", "IF #Temp < #SP - #Hyst THEN\n    #Heater := TRUE;\nELSIF #Temp > #SP + #Hyst THEN\n    #Heater := FALSE;\nEND_IF;\n// #Heater must be Static or an output so it remembers its state.", "Two-point control"],
          ["p", "Without hysteresis the heater would click on and off every scan around the setpoint. Hysteresis also prevents short-cycling, which destroys relays and compressors."]
        ]],
        ["h", "Exercise 3 · Moving average"],
        ["p", "Noise makes a pressure reading jump by &plusmn;2 bar. Output the average of the last 10 samples."],
        ["reveal", "Show a solution", [
          ["scl", "// Static: Buf : Array[0..9] of Real; Idx : Int; Sum : Real\n#Sum := #Sum - #Buf[#Idx] + #In;      // swap the oldest sample for the newest\n#Buf[#Idx] := #In;\n#Idx := (#Idx + 1) MOD 10;\n#Avg := #Sum / 10.0;", "Ring buffer average"],
          ["p", "It starts low because the buffer begins at zero; fill it with the first reading at start-up. A moving average delays the signal by about half the window, which matters in a control loop. For control, a first-order filter is often better:"],
          ["scl", "// First-order low-pass: Alpha = Ts / (Tf + Ts), e.g. 0.1 / (1.0 + 0.1)\n#Out := #Out + #Alpha * (#In - #Out);", "Exponential filter"]
        ]],
        ["h", "Exercise 4 · Ramp limiter"],
        ["p", "A valve must not be driven faster than 10 % per second, to avoid pressure surges. Limit the rate of change of the output."],
        ["reveal", "Show a solution", [
          ["scl", "// Called every cycle in a cyclic OB. #Ts is the cycle time in seconds (0.1)\n#Step := #Rate * #Ts;                 // 10.0 * 0.1 = 1.0 % per call\nIF #Target > #Out + #Step THEN\n    #Out := #Out + #Step;\nELSIF #Target < #Out - #Step THEN\n    #Out := #Out - #Step;\nELSE\n    #Out := #Target;\nEND_IF;", "Rate limiter"]
        ]],
        ["h", "Exercise 5 · Min, max and average since reset"],
        ["reveal", "Show a solution", [
          ["scl", "IF #Reset THEN\n    #Min := #In; #Max := #In; #Sum := 0.0; #N := 0;\nEND_IF;\nIF #In < #Min THEN #Min := #In; END_IF;\nIF #In > #Max THEN #Max := #In; END_IF;\n#Sum := #Sum + #In;\n#N := #N + 1;\n#Mean := #Sum / INT_TO_REAL(#N);       // guard against N = 0 in real code", "Statistics"]
        ]],
        ["warn", "Test each function at its edges: minimum and maximum values, a wire break, the first call after start-up and a change in the middle of the range. Most bugs live at the edges."],
        ["quiz", {
          q: "What does the hysteresis in a two-point controller prevent?",
          options: ["Overheating", "Rapid on/off switching around the setpoint", "Wire breaks", "Slow response"],
          answer: 1,
          why: "The dead band between the on and off thresholds stops the output from chattering."
        }],
        ["quiz", {
          q: "A 10-sample moving average smooths noise. What is its main drawback in a control loop?",
          options: ["It uses a lot of memory", "It delays the measured signal", "It increases noise", "It cannot run in a cyclic OB"],
          answer: 1,
          why: "The average lags the real value by roughly half the window, which can destabilise fast loops."
        }]
      ]
    },
    {
      id: "11.5", title: "Debug clinic: find the bug", minutes: 35,
      blocks: [
        ["p", "Everyone writes bugs. Professionals find them faster because they have seen the common ones. Here are six real classics. Read the code, decide what is wrong, then answer the question."],
        ["h", "Bug 1 · The lamp that ignores Sensor A"],
        ["code", "Network 3:   Sensor_A  ---------------------------( )--- Lamp\n...\nNetwork 12:  Sensor_B  ---------------------------( )--- Lamp", "Ladder (text)"],
        ["p", "The lamp follows Sensor B, and Sensor A seems to do nothing."],
        ["quiz", {
          q: "What is wrong?",
          options: [
            "Lamp is driven by two coils (double assignment); the last one in the scan wins",
            "The sensors are too slow",
            "The lamp tag must be a Word",
            "Network 12 should be above network 3"
          ],
          answer: 0,
          why: "Two coils on one output is a classic. Combine them with OR in a single network, and use the cross-reference list to find such cases."
        }],
        ["h", "Bug 2 · The timer that never lets go"],
        ["scl", "IF #Start THEN\n    #T_Delay(IN := TRUE, PT := T#5s);\nEND_IF;\n#Motor := #T_Delay.Q;", "SCL"],
        ["p", "After Start is released, the motor stays on forever."],
        ["quiz", {
          q: "Why?",
          options: [
            "The preset time is too long",
            "The timer is only called while Start is true; once Start falls, the timer is never called again, so Q keeps its last value",
            "Motor must be a Static variable",
            "TON cannot be used in SCL"
          ],
          answer: 1,
          why: "A timer must be called every scan with the condition as IN: <code>#T_Delay(IN := #Start, PT := T#5s);</code>"
        }],
        ["h", "Bug 3 · The counter that counts twice"],
        ["code", "Network 1:  --| P |-- Sensor (mem M10.0) ----( )-- Pulse_A\nNetwork 2:  --| P |-- Button (mem M10.0) ----( )-- Pulse_B", "Ladder (text)"],
        ["p", "Pulse_A and Pulse_B fire at strange times and sometimes not at all."],
        ["quiz", {
          q: "What is wrong?",
          options: [
            "P contacts do not exist in LAD",
            "Both edge contacts use the same memory bit M10.0, so they overwrite each other's previous state",
            "Sensor must be a Word",
            "Pulse outputs need a timer"
          ],
          answer: 1,
          why: "Every edge detection needs its own edge-memory bit. Using instance DBs for edge blocks avoids this mistake."
        }],
        ["h", "Bug 4 · Stop does not stop"],
        ["code", "Network 1:  Stop_PB ------------------------(R)-- Run\nNetwork 2:  Start_PB -----------------------(S)-- Run", "Ladder (text)"],
        ["p", "The operator holds Start and presses Stop. The machine keeps running."],
        ["quiz", {
          q: "What is the cause, and what is the usual rule?",
          options: [
            "Start has priority because its network comes last; for safety, put the reset after the set so that Stop wins",
            "S and R coils cannot be combined",
            "Stop_PB is a normally closed contact",
            "The CPU is too slow"
          ],
          answer: 0,
          why: "The last write in the scan wins. Put the dominant action (stop) last, or better use a reset-dominant memory (SR/RS) with the correct priority."
        }],
        ["h", "Bug 5 · The percentage that is always zero"],
        ["scl", "// #Raw is an Int from 0 to 27648; #Percent is a Real\n#Percent := (#Raw / 27648) * 100;", "SCL"],
        ["quiz", {
          q: "The result is 0 for almost every input. Why?",
          options: [
            "Percent must be an Int",
            "Raw / 27648 is an integer division and gives 0 (or 1 at full scale); convert to Real before dividing",
            "The CPU rounds up",
            "27648 is too big"
          ],
          answer: 1,
          why: "Use <code>INT_TO_REAL(#Raw) / 27648.0 * 100.0</code>, or NORM_X and SCALE_X which convert correctly."
        }],
        ["h", "Bug 6 · The forgotten counter"],
        ["scl", "// FB \"Count_Parts\", variable #Count is declared in the Temp section\n#Count := #Count + 1;\n#Total := #Count;", "SCL in an FB"],
        ["quiz", {
          q: "The total is always 1 (or a random number). What is wrong?",
          options: [
            "Temp variables are re-initialised or undefined on every call; a value that must persist belongs in Static",
            "The addition is wrong",
            "FBs cannot count",
            "Total must be Real"
          ],
          answer: 0,
          why: "Temp memory is only valid during one call. Use Static in an FB (or a DB) for anything that must be remembered."
        }],
        ["h", "How to hunt bugs"],
        ["ul", [
          "<b>Reproduce</b> it. A bug you cannot reproduce cannot be fixed.",
          "<b>Look</b> at the actual values with a watch table, then at the diagnostic buffer.",
          "<b>Narrow</b> it down: bisect the program, disable a part, check the inputs.",
          "<b>Cross-reference</b> the output: who writes it?",
          "<b>Fix the cause</b>, then add a test so it cannot return."
        ]],
        ["try", "Take your own program from earlier lessons and deliberately plant one of these bugs. Ask a friend to find it, or come back tomorrow and find it yourself."]
      ]
    },
    {
      id: "11.6", title: "Final exam", minutes: 40,
      blocks: [
        ["p", "Twenty questions across the whole course. Take your time; read each option fully. If you miss one, the explanation tells you which lesson to review."],
        ["quiz", { q: "During one scan, an input changes while the program is running. What does the program see?", options: ["The new value immediately", "The old value from the process image until the next scan", "Zero", "An error"], answer: 1, why: "The program works on the input process image captured at the start of the scan (lesson 0.2)." }],
        ["quiz", { q: "Which address is the input bit 2 of byte 4 in a Siemens PLC?", options: ["%Q4.2", "%I4.2", "%M2.4", "%IW4"], answer: 1, why: "%I is an input, then byte.bit: %I4.2 (lesson 1.4)." }],
        ["quiz", { q: "What is the main reason to use NC wiring on stop buttons?", options: ["It is cheaper", "A broken wire or lost power looks like a stop, so the failure is safe", "NC contacts are faster", "PLCs need it"], answer: 1, why: "Fail-safe logic (lesson 2.3 and 8.2)." }],
        ["quiz", { q: "Which block type keeps data between calls and has its own instance data?", options: ["OB", "FC", "FB", "Temp"], answer: 2, why: "Function blocks (lesson 3.3)." }],
        ["quiz", { q: "A TON has PT = T#5s. IN is on for 3 s, then off. What is Q?", options: ["Q goes high after 3 s", "Q stays 0: the input never reached the preset time", "Q pulses for 2 s", "Q goes high after 5 s"], answer: 1, why: "A TON needs IN to stay on for the whole preset time (lesson 2.6)." }],
        ["quiz", { q: "Which counter type counts both up and down?", options: ["CTU", "CTD", "CTUD", "TON"], answer: 2, why: "CTUD (lesson 2.7)." }],
        ["quiz", { q: "A pump should start when a level falls below 20 % and stop above 80 %. What is this called?", options: ["PID control", "Two-point control with hysteresis", "Ratio control", "Cascade"], answer: 1, why: "Lessons 4.1 and 11.4." }],
        ["quiz", { q: "A 4 to 20 mA signal reads 8 mA on a 0 to 100 bar sensor. The pressure is:", options: ["25 bar", "40 bar", "8 bar", "50 bar"], answer: 0, why: "(8 - 4) / 16 = 0.25, so 25 bar (lesson 9.3)." }],
        ["quiz", { q: "Which SCL statement is wrong?", options: ["<code>#A := #B + 1;</code>", "<code>IF #A = 1 THEN #B := 2; END_IF;</code>", "<code>#A = #B + 1;</code> (as an assignment)", "<code>FOR #i := 1 TO 5 DO ... END_FOR;</code>"], answer: 2, why: "Assignment is := (lesson 4.3)." }],
        ["quiz", { q: "What is the purpose of a UDT?", options: ["To make the CPU faster", "To define a structure once and reuse it consistently", "To store timers", "To replace an OB"], answer: 1, why: "Lesson 3.4 and 10.1." }],
        ["quiz", { q: "A PROFINET device must be reached by the CPU. What must match?", options: ["Only the colour of the cable", "Device name and an IP address in the same subnet", "The CPU's serial number", "Nothing"], answer: 1, why: "Lesson 6.1." }],
        ["quiz", { q: "Why is OPC UA preferred over raw Modbus for new IT/OT integrations?", options: ["It is older", "It has typed, named, secured data", "It needs no cable", "It is free of configuration"], answer: 1, why: "Lesson 6.3." }],
        ["quiz", { q: "A PID loop oscillates continuously. Which first step is most appropriate?", options: ["Increase Kp", "Reduce the gain (or run the tuning again) and check the sample time", "Remove the I term and the D term and do nothing else", "Increase the scan time"], answer: 1, why: "Too high a gain is the usual cause (lesson 7.1 and 7.5)." }],
        ["quiz", { q: "A star-delta starter reduces the starting current to roughly:", options: ["One tenth", "One third", "Half", "Unchanged"], answer: 1, why: "Lesson 9.2." }],
        ["quiz", { q: "Where should an emergency stop ultimately act, according to good practice?", options: ["Only in the PLC program", "Through a certified safety function (relay or safety PLC) that does not depend on standard code", "Through the HMI", "By a timer"], answer: 1, why: "Lesson 8.2." }],
        ["quiz", { q: "A PID call needs a constant sample time. Where do you call it?", options: ["From OB1 with a random scan time", "From a cyclic interrupt OB", "From a hardware interrupt", "From the HMI"], answer: 1, why: "Lesson 10.6." }],
        ["quiz", { q: "Which is the best defence against an unnoticed communication failure with stale data?", options: ["A larger buffer", "A heartbeat counter with a watchdog", "Faster polling", "Colour coding"], answer: 1, why: "Lesson 10.4." }],
        ["quiz", { q: "What does forcing an output do?", options: ["Tests the program safely", "Fixes the output to a value regardless of the program", "Resets the CPU", "Compiles the project"], answer: 1, why: "Lesson 9.6: handle with great care." }],
        ["quiz", { q: "Which backup practice is the most reliable?", options: ["One copy on the engineering laptop", "Versioned project archives on a server plus the program uploaded from the CPU, with a recovery test", "Print the ladder", "Email the project to yourself"], answer: 1, why: "Lesson 8.5." }],
        ["quiz", { q: "A machine shows OEE of 84 %. Availability is 90 %, quality 98 %. What is the performance?", options: ["95 %", "100 %", "85 %", "75 %"], answer: 0, why: "0.84 / (0.90 &times; 0.98) = 0.952, about 95 % (lesson 12.3)." }],
        ["p", "Scored 16 or more? You have covered the course. Scored less? Return to the lessons the explanations point to and retry: every quiz can be answered again."]
      ]
    }
  ]
});
