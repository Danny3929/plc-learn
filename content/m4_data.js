window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 4,
  title: "4 · Data, analog and SCL",
  lessons: [
    {
      id: "4.1", title: "Compare, move and math", minutes: 15,
      blocks: [
        ["p", "Bit logic only handles on/off. To work with numbers you need three families of instructions: <b>comparison</b> (is this greater than that?), <b>move</b> (copy a value) and <b>math</b> (add, subtract, scale). In LAD they appear as boxes; in SCL they are ordinary operators."],
        ["h", "Comparison"],
        ["p", "A comparison box acts like a contact: it passes power if the comparison is true. The operators are <code>==</code> equal, <code>&lt;&gt;</code> not equal, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>. Both sides must have the <b>same data type</b>; the box has a type selector."],
        ["scl", "#High_Level := \"Tank_Level_Pct\" > 80.0;\n#Low_Level  := \"Tank_Level_Pct\" < 20.0;", "comparison gives a Bool"],
        ["h", "Move"],
        ["p", "<code>MOVE</code> copies a value from <code>IN</code> to <code>OUT1</code> when power flows into <code>EN</code>. In SCL it is just <code>:=</code>."],
        ["h", "Math"],
        ["p", "<code>ADD</code>, <code>SUB</code>, <code>MUL</code>, <code>DIV</code>, and <code>CALCULATE</code>, which evaluates a whole expression in one box. Math boxes have an <code>EN</code> input (run when true) and an <code>ENO</code> output (true if it succeeded; false on overflow or divide by zero)."],
        ["scl", "#Total := #A + #B * 2;\n#Avg   := #Sum / 5.0;\n#Rem   := #Count MOD 10;", "SCL operators"],
        ["h", "Three traps"],
        ["ul", [
          "<b>Integer division truncates.</b> With <code>Int</code> values, <code>7 / 2</code> is <code>3</code>. For decimals convert to Real first: <code>INT_TO_REAL(#A) / 2.0</code>.",
          "<b>Mixed types.</b> You cannot freely add an Int to a Real. Convert explicitly with <code>INT_TO_REAL</code>, <code>REAL_TO_INT</code>, or the <code>CONVERT</code> box. Be explicit even when newer TIA versions allow implicit conversion.",
          "<b>Divide by zero or overflow</b> sets ENO false and gives a bad value. Check your divisor."
        ]],
        ["h", "A real example: pump with hysteresis"],
        ["p", "A pump fills a tank. It starts at 20 % and stops at 80 %. Between the two it keeps whatever it was doing. If you used a single threshold the pump would chatter on and off around the limit. The two thresholds are called <b>hysteresis</b>."],
        ["scl", "IF #Level_Pct < 20.0 THEN\n    #Pump := TRUE;\nELSIF #Level_Pct > 80.0 THEN\n    #Pump := FALSE;\nEND_IF;\n// Between 20 and 80 the pump keeps its previous value.\n// #Pump must therefore be a Static variable or an output, not Temp.", "pump control"],
        ["h", "Try it in ladder"],
        ["p", "Compare, MOVE and math blocks work on <b>numbers</b>, not just bits. Drag the level slider. A comparison box passes power only when its test is true; a MOVE copies a value when it has power on EN; ADD calculates. Watch the green value beside each output."],
        ["sim", {
          title: "Compare, MOVE and ADD in ladder",
          inputs: [
            { tag: "Level_Pct", addr: "%MD10", label: "Tank level (drag the slider)", kind: "slider", min: 0, max: 100, step: 1, init: 50, unit: "%" },
            { tag: "Enable", addr: "%I0.0", label: "Enable the calculations", kind: "switch", init: true }
          ],
          outputs: [
            { tag: "High_Alarm", addr: "%Q0.0", label: "Level above 80 %", kind: "lamp", color: "#ff4d3d" },
            { tag: "Low_Alarm", addr: "%Q0.1", label: "Level below 20 %", kind: "lamp", color: "#4db3e0" }
          ],
          rungs: [
            { title: "High level alarm", c: [["CMP", ">", "Level_Pct", 80, "Real"]], o: ["coil", "High_Alarm"] },
            { title: "Low level alarm", c: [["CMP", "<", "Level_Pct", 20, "Real"]], o: ["coil", "Low_Alarm"] },
            { title: "Copy the level for the HMI", c: [["NO", "Enable"]], o: ["move", "Level_Pct", "HMI_Level", "Real"] },
            { title: "Add a 5 % margin", c: [["NO", "Enable"]], o: ["math", "+", "Level_Pct", 5, "Level_Margin", "Real"] }
          ]
        }],
        ["try", "Switch Enable off and move the slider. Which outputs stop updating, and which keep working? Why?"],
        ["h", "Playable: a tank with float switches"],
        ["p", "Hysteresis does not always need numbers. Two float switches and a set/reset pair give the same effect. The low float <b>sets</b> the pump, the high float <b>resets</b> it. In between, the pump keeps whatever it was doing. Water is constantly drawn off, so the tank keeps cycling."],
        ["sim", {
          title: "Tank level control with two float switches",
          plant: "tank",
          sensors: [
            { tag: "Low_Sensor", addr: "%I0.1", label: "ON when the level is below 20 %" },
            { tag: "High_Sensor", addr: "%I0.2", label: "ON when the level is above 80 %" }
          ],
          inputs: [{ tag: "Auto", addr: "%I0.0", label: "Automatic mode", kind: "switch", init: true }],
          outputs: [{ tag: "Pump", addr: "%Q0.0", label: "Fill pump", kind: "motor" }],
          rungs: [
            { title: "Low level: start the pump", c: [["NO", "Auto"], ["NO", "Low_Sensor"]], o: ["set", "Pump"] },
            { title: "High level: stop the pump", c: [["NO", "High_Sensor"]], o: ["reset", "Pump"] },
            { title: "Not in auto: pump off", c: [["NC", "Auto"]], o: ["reset", "Pump"] }
          ]
        }],
        ["try", "Switch off Auto while the tank is half full and watch the level fall. Then switch it on again: what must happen before the pump starts?"],
        ["quiz", {
          q: "Two <code>Int</code> variables A = 7 and B = 2. What does <code>A / B</code> give?",
          options: ["3.5", "3", "4", "An error"],
          answer: 1,
          why: "Integer division drops the fraction. Convert to Real if you need 3.5."
        }],
        ["quiz", {
          q: "Why use two thresholds (20 % and 80 %) instead of one?",
          options: ["To save memory", "To stop the pump chattering around the limit", "It is required by the CPU", "To count faster"],
          answer: 1,
          why: "Hysteresis creates a dead band so small fluctuations do not toggle the output."
        }]
      ]
    },
    {
      id: "4.2", title: "Analog signals and scaling", minutes: 20,
      blocks: [
        ["p", "A temperature, level or pressure is a continuous quantity. A sensor turns it into an electrical signal (4-20 mA or 0-10 V). The analog input module converts that signal into an integer. Your program must turn the integer back into engineering units (&deg;C, bar, %)."],
        ["fig", "analog-chain", "Every analog value follows this chain. The program does the last two steps."],
        ["h", "The Siemens raw range"],
        ["p", "For a Siemens analog input in its nominal range, the module reports <b>0 to 27648</b>. For 0-10 V, 0 V is 0 and 10 V is 27648. For 4-20 mA, <b>4 mA is 0</b> and 20 mA is 27648. Beyond 27648 the value goes into an over-range zone, and values near 32767 or -32768 normally mean an error such as overflow or a broken wire. Check your module's manual for exact codes."],
        ["fig", "analog-graph", "A straight line maps current to raw value, and raw value to temperature."],
        ["note", "The S7-1200 CPU 1214C's built-in analog inputs (%IW64, %IW66) are <b>0-10 V only</b>. For 4-20 mA signals you add an analog input signal module, such as an SM 1231, and set the channel to <i>Current 4...20 mA</i> in its Properties."],
        ["h", "Scaling with NORM_X and SCALE_X"],
        ["p", "Two instructions do the arithmetic. <code>NORM_X</code> converts a value in a range into a fraction between 0.0 and 1.0. <code>SCALE_X</code> converts that fraction into any range you like. (Search their names in the Instructions task card.)"],
        ["scl", "// Raw 0..27648  ->  0.0..1.0  ->  0.0..150.0 degrees C\n#Norm := NORM_X(MIN := 0, VALUE := \"Temp_Raw\", MAX := 27648);\n#Temp_C := SCALE_X(MIN := 0.0, VALUE := #Norm, MAX := 150.0);\n\n// Never trust a signal: limit it before using it\n#Temp_C := LIMIT(MN := 0.0, IN := #Temp_C, MX := 150.0);", "scaling and limiting"],
        ["h", "Try it in ladder"],
        ["p", "Drag the raw value and watch the two blocks turn it into degrees. At 0 the temperature is 0 &deg;C, at 13824 it is 75 &deg;C, and at 27648 it is 150 &deg;C. Push it to the end and the over-temperature alarm trips."],
        ["sim", {
          title: "Scaling an analog value with NORM_X and SCALE_X",
          inputs: [
            { tag: "Temp_Raw", addr: "%IW64", label: "Raw analog value (drag the slider)", kind: "slider", min: 0, max: 27648, step: 1, init: 13824, unit: "" },
            { tag: "Enable", addr: "%I0.0", label: "Enable scaling", kind: "switch", init: true }
          ],
          outputs: [{ tag: "Over_Temp", addr: "%Q0.0", label: "Above 120 \u00B0C", kind: "lamp", color: "#ff4d3d" }],
          rungs: [
            { title: "Normalize 0..27648 to 0.0..1.0", c: [["NO", "Enable"]], o: ["norm", "Temp_Raw", 0, 27648, "Temp_Norm"] },
            { title: "Scale 0.0..1.0 to 0..150 degrees C", c: [["NO", "Enable"]], o: ["scale", "Temp_Norm", 0, 150, "Temp_C"] },
            { title: "Over-temperature alarm", c: [["CMP", ">", "Temp_C", 120, "Real"]], o: ["coil", "Over_Temp"] }
          ]
        }],
        ["p", "The same maths by hand: <code>Value = Raw / 27648 &times; (Max - Min) + Min</code>. A raw value of 13824 (half of 27648) on a 0-150 &deg;C transmitter is 75 &deg;C."],
        ["h", "Make it robust"],
        ["ul", [
          "<b>Limit</b> the result, or raise an alarm for out-of-range values, so wiring faults cannot make the plant think it is at 900 &deg;C.",
          "<b>Detect a broken wire</b>: a 4-20 mA signal below 4 mA is a fault, not a low reading.",
          "<b>Filter noise</b>: smooth a jumpy signal. A simple first-order filter is <code>Filtered := Filtered + (New - Filtered) * 0.1</code>. Run it in a cyclic OB so the time step is constant.",
          "<b>Wrap it in an FB</b> with min, max, filter time and fault outputs. You will scale hundreds of signals; write it once."
        ]],
        ["try", "Create a Real tag <code>Temp_C</code> and an Int tag <code>Temp_Raw</code>. Write the two scaling lines in an FC. Set <code>Temp_Raw</code> to 0, 13824 and 27648 in a watch table and check that you read 0, 75 and 150."],
        ["quiz", {
          q: "A 4-20 mA transmitter spans 0-100 &deg;C. The module shows raw 13824. What is the temperature?",
          options: ["13.8 &deg;C", "50 &deg;C", "100 &deg;C", "12 &deg;C"],
          answer: 1,
          why: "13824 is half of 27648, so the signal is at the middle of its range: 12 mA, which is 50 &deg;C on a 0-100 &deg;C span."
        }],
        ["quiz", {
          q: "A 4-20 mA input suddenly reads below the 4 mA mark (a negative raw value). What is the sensible assumption?",
          options: ["The temperature is very low", "A wiring fault or sensor failure that must raise an alarm", "Normal behaviour", "The scaling is wrong"],
          answer: 1,
          why: "The signal range starts at 4 mA, so anything below it indicates a broken wire or dead transmitter."
        }]
      ]
    },
    {
      id: "4.3", title: "SCL fundamentals", minutes: 20,
      blocks: [
        ["p", "<b>SCL</b> (Structured Control Language) is Siemens' version of Structured Text. It reads like a simple programming language, and it is the right tool for calculations, loops, data handling and compact reusable blocks. Everything in this lesson works in any SCL block (OB, FC or FB)."],
        ["h", "The basics"],
        ["scl", "// A comment to the end of the line\n(* A comment\n   over several lines *)\n\n#Count := #Count + 1;                 // assignment uses :=\n#Ready := #Pressure_OK AND NOT #Fault; // boolean logic\n\"Motor1_Run\" := #Ready;               // a global tag in quotes", "Syntax"],
        ["ul", [
          "Every statement ends with a semicolon.",
          "<code>:=</code> assigns; <code>=</code> compares.",
          "<code>#name</code> is local to the block (its interface); <code>\"name\"</code> is a global tag or data block.",
          "Keywords are not case sensitive, but write them in capitals by convention."
        ]],
        ["h", "Decisions"],
        ["scl", "IF #Temp > 90.0 THEN\n    #Alarm := TRUE;\nELSIF #Temp < 80.0 THEN\n    #Alarm := FALSE;\nEND_IF;\n\nCASE #Mode OF\n    0:    #Speed := 0.0;\n    1:    #Speed := 50.0;\n    2, 3: #Speed := 100.0;\n    ELSE  #Speed := 0.0;\nEND_CASE;", "IF and CASE"],
        ["h", "Loops"],
        ["scl", "// Average of 5 samples stored in an array\n#Sum := 0.0;\nFOR #i := 1 TO 5 DO\n    #Sum := #Sum + #Samples[#i];\nEND_FOR;\n#Avg := #Sum / 5.0;", "FOR loop"],
        ["p", "There are also <code>WHILE ... DO ... END_WHILE</code> and <code>REPEAT ... UNTIL ... END_REPEAT</code>."],
        ["warn", "A loop runs to completion <i>inside a single scan</i>. A loop that waits for a sensor (<code>WHILE NOT #Sensor DO ...</code>) would freeze the CPU, because the input only updates between scans. Never wait inside a scan. Use state variables (lesson 4.4) and let successive scans do the waiting."],
        ["h", "Calling blocks and timers"],
        ["scl", "// Timer as a multi-instance in an FB (declared in Static as: T_Delay : TON)\n#T_Delay(IN := #Start, PT := T#5s);\nIF #T_Delay.Q THEN\n    #Go := TRUE;\nEND_IF;\n\n// Function call with named parameters\n#Result := \"Calc_Percent\"(Raw := #Raw);", "Calls"],
        ["h", "When to choose SCL over LAD"],
        ["ul", [
          "Calculations, scaling, arrays, loops, string handling: <b>SCL</b>.",
          "Interlocks and simple sequential logic that electricians must read: <b>LAD</b>.",
          "Large state machines: SCL's <code>CASE</code> is usually clearer.",
          "Mixed projects are normal: the same OB1 can call an FC written in SCL and an FB written in LAD."
        ]],
        ["quiz", {
          q: "Which statement is valid SCL assignment?",
          options: ["<code>#Count = #Count + 1;</code>", "<code>#Count := #Count + 1;</code>", "<code>#Count + 1 := #Count;</code>", "<code>SET #Count;</code>"],
          answer: 1,
          why: "SCL assigns with <code>:=</code>. A single <code>=</code> is a comparison."
        }],
        ["quiz", {
          q: "Why is <code>WHILE NOT #Sensor DO ... END_WHILE</code> dangerous for waiting on a sensor?",
          options: ["It uses too much memory", "The input only updates between scans, so the loop can never end and the scan stalls", "SCL has no WHILE", "Sensors are slow"],
          answer: 1,
          why: "The program only sees a frozen input image during the scan, so the loop would spin until the watchdog fires."
        }],
        ["try", "Write a small SCL FC that takes an Array[1..5] of Real and returns the maximum, using a FOR loop and an IF."]
      ]
    },
    {
      id: "4.4", title: "State machines", minutes: 25,
      blocks: [
        ["p", "Most machines do things in a <b>sequence</b>: idle, start, run, fault, recover. Long chains of seal-ins and flags become unreadable. A <b>state machine</b> replaces them with one variable that says which state the machine is in, plus clear rules for moving between states."],
        ["fig", "state-machine", "States are boxes; transitions are arrows with a condition."],
        ["h", "Drive it yourself"],
        ["p", "This is the state machine from the lesson, running. Press Start and wait for the delay. Trip the overload while running. Try pressing Start while in FAULT, and Reset while the overload is still tripped. Read the log to see which rule fired."],
        ["statesim", {}],
        ["p", "Implementation recipe in SCL, using one <code>Int</code> variable <code>#State</code> in the FB's Static section:"],
        ["ul", [
          "<b>Handle global transitions first</b> (events that apply in every state, like an overload).",
          "<b>One CASE branch per state</b>, containing only the transitions out of that state.",
          "<b>Derive all outputs from the state</b>, after the CASE. Outputs are never set inside the state logic. This prevents conflicting writes."
        ]],
        ["scl", "// Global transition: an overload sends us to FAULT from anywhere\nIF NOT #Overload_OK THEN\n    #State := 3;\nEND_IF;\n\n// The start-delay timer runs only while STARTING\n#T_Start(IN := (#State = 1), PT := T#3s);\n\nCASE #State OF\n    0:  // IDLE\n        IF #Start AND #Stop_OK THEN\n            #State := 1;\n        END_IF;\n    1:  // STARTING (horn sounding)\n        IF NOT #Stop_OK THEN\n            #State := 0;\n        ELSIF #T_Start.Q THEN\n            #State := 2;\n        END_IF;\n    2:  // RUNNING\n        IF NOT #Stop_OK THEN\n            #State := 0;\n        END_IF;\n    3:  // FAULT\n        IF #Fault_Reset AND #Overload_OK THEN\n            #State := 0;\n        END_IF;\n    ELSE\n        #State := 3;   // unknown state: be safe\nEND_CASE;\n\n// Outputs come only from the state\n#Horn  := (#State = 1);\n#Motor := (#State = 2);\n#Fault := (#State = 3);", "FB Motor_Ctrl, rewritten as a state machine"],
        ["p", "Compare it with lesson 3.3. The behaviour is the same, but now adding a new state (say, a <i>Cooling</i> phase) is a new box and a new branch rather than a rewrite. The machine can also tell the HMI &quot;I am in state 1&quot; directly."],
        ["h", "Good habits"],
        ["ul", [
          "Give states names with constants (<code>St_Idle = 0</code>, <code>St_Starting = 1</code>...) rather than bare numbers.",
          "Always include an <code>ELSE</code> branch to catch an impossible value.",
          "Make state transitions mutually exclusive and easy to draw. If you cannot draw it, you cannot debug it.",
          "Expose <code>#State</code> as an output so you can watch it live in a watch table."
        ]],
        ["note", "This pattern is the foundation of sequencers, batch processes and machine modes. The GRAPH language in TIA Portal draws the same idea graphically."],
        ["try", "Add a <b>Cooling</b> state: after Running is stopped, a fan runs for 10 s before returning to Idle. Draw the new diagram first, then change the code."],
        ["quiz", {
          q: "In a state-machine FB, where should the outputs (Motor, Horn) be set?",
          options: ["Inside each state, wherever convenient", "After the CASE, derived from the state value", "In a separate OB", "Outputs are not allowed"],
          answer: 1,
          why: "Deriving outputs from the state in one place avoids conflicting writes and makes behaviour predictable."
        }]
      ]
    }
  ]
});
