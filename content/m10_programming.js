window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 10,
  title: "10 · Advanced programming",
  lessons: [
    {
      id: "10.1", title: "Arrays, structures and UDTs in practice", minutes: 25,
      blocks: [
        ["p", "Lesson 3.4 introduced data blocks and UDTs. Real machines have eight identical valves, twelve motors, forty recipe values. Writing the same logic forty times is slow and error-prone. Arrays and structures let you write it <b>once</b> and apply it to every item."],
        ["h", "Arrays"],
        ["p", "An <b>array</b> is a numbered row of items of the same data type. You choose the index range when you declare it."],
        ["ul", [
          "<code>Temps : Array[1..8] of Real</code> eight temperatures, indexes 1 to 8.",
          "<code>Flags : Array[0..15] of Bool</code> sixteen bits, indexes 0 to 15.",
          "<code>Grid : Array[0..2, 0..3] of Int</code> a two-dimensional table (3 rows, 4 columns).",
          "Access with square brackets: <code>\"DB_Data\".Temps[#i]</code>. The index can be a constant or a variable."
        ]],
        ["warn", "An index outside the declared range (<code>Temps[9]</code> above) is a programming error. The access is not done correctly and the CPU raises error OB 121. <b>Always check or limit the index</b> before using it, for example with <code>LIMIT(MN := 1, IN := #i, MX := 8)</code>."],
        ["h", "Structures and UDTs"],
        ["p", "A <b>Struct</b> groups related values of different types. A <b>UDT</b> (PLC data type) is a struct you define once and reuse everywhere, so a change in the UDT updates every use."],
        ["fig", "array-mem", "An array of a UDT: one definition, repeated four times in memory."],
        ["code", "Type \"UDT_Motor\"\n  Cmd_Run     : Bool\n  Fb_Running  : Bool\n  Fault       : Bool\n  Speed_SP    : Real\n  Run_Hours   : DInt\n  Starts      : UInt\nEnd_Type\n\nDB \"MotorDB\"\n  Motors : Array[1..4] of \"UDT_Motor\"", "Declaring a UDT and an array of it"],
        ["h", "Looping over an array"],
        ["scl", "// Count running hours for every running motor, once per second\nIF \"Clock_1s\" THEN\n    FOR #i := 1 TO 4 DO\n        IF \"MotorDB\".Motors[#i].Fb_Running THEN\n            \"MotorDB\".Motors[#i].Run_Hours := \"MotorDB\".Motors[#i].Run_Hours + 1;\n        END_IF;\n    END_FOR;\nEND_IF;\n\n// Is any motor faulted?\n#Any_Fault := FALSE;\nFOR #i := 1 TO 4 DO\n    IF \"MotorDB\".Motors[#i].Fault THEN\n        #Any_Fault := TRUE;\n        EXIT;                       // leave the loop early\n    END_IF;\nEND_FOR;", "FOR loops over an array of UDTs"],
        ["h", "Combine with function blocks"],
        ["p", "The professional pattern: write <b>one</b> FB <code>FB_Motor</code> and create an array of instances, or call it four times with four elements of the array as inputs. The motor logic lives in one place, the data lives in the array."],
        ["scl", "// Inside a parent FB, Static section declares:  Motor : Array[1..4] of \"FB_Motor\";\n// One loop then runs the SAME logic for every motor.\nFOR #i := 1 TO 4 DO\n    #Motor[#i](Cmd := \"MotorDB\".Motors[#i].Cmd_Run,\n               Feedback := \"MotorDB\".Motors[#i].Fb_Running);\n    \"MotorDB\".Motors[#i].Fault := #Motor[#i].Fault;\nEND_FOR;", "One FB, many instances (array of multi-instances)"],
        ["note", "Arrays with an undefined size, <code>Array[*]</code>, can be used as parameters of FCs and FBs, so one block can process arrays of any length. Inside, read the bounds with <code>LOWER_BOUND(ARR := #data, DIM := 1)</code> and <code>UPPER_BOUND(ARR := #data, DIM := 1)</code>. Support depends on the CPU and firmware, and in some TIA Portal versions the bound functions misbehave on InOut Array[*] parameters, so test them (passing the array as a VARIANT is the fallback)."],
        ["h", "Optimised access and retain"],
        ["ul", [
          "New data blocks default to <b>optimised block access</b>: TIA stores the values in the most efficient order. You can only use <i>symbolic</i> names. Fast and safe.",
          "Switch it off only for compatibility with external devices that read by absolute address (older HMIs, some protocols).",
          "Set <b>Retain</b> per variable for values that must survive power loss (counters, setpoints, run hours). Do not make everything retentive: the retentive memory is limited and slows startup."
        ]],
        ["quiz", {
          q: "<code>Motors : Array[1..4] of \"UDT_Motor\"</code>. Which access is a mistake?",
          options: ["<code>Motors[1].Fault</code>", "<code>Motors[4].Run_Hours</code>", "<code>Motors[0].Fault</code>", "<code>Motors[#i].Cmd_Run</code> with #i between 1 and 4"],
          answer: 2,
          why: "The array begins at index 1, so index 0 is out of range and causes a programming error."
        }],
        ["quiz", {
          q: "What is the main advantage of a UDT over separate loose variables?",
          options: [
            "It makes the CPU faster",
            "It defines the layout once, so every use stays consistent and a change applies everywhere",
            "It uses less memory",
            "It can only be used in SCL"
          ],
          answer: 1,
          why: "A UDT is a single definition reused wherever the structure appears. That is the key to maintainable, scalable programs."
        }],
        ["try", "Define <code>UDT_Valve</code> (Cmd_Open, Fb_Open, Fb_Closed, Fault) and a DB with an <code>Array[1..8]</code> of it. Write an SCL FC that sets Fault for every valve whose command has been on longer than 5 s without Fb_Open (you will need a timer per valve or a counter in the UDT)."]
      ]
    },
    {
      id: "10.2", title: "Strings, characters, date and time", minutes: 20,
      blocks: [
        ["p", "Not all data is a number. Barcodes, recipe names, operator names, alarm texts and timestamps are text and time. Machines that record production, label products or talk to a database all need these types."],
        ["h", "Characters and strings"],
        ["ul", [
          "<b>Char</b>: one character, 1 byte. <code>'A'</code>.",
          "<b>String</b>: up to 254 characters. <code>String[20]</code> declares a string with room for 20 (it uses 2 header bytes more). Single quotes: <code>'Hello'</code>.",
          "<b>WChar / WString</b>: Unicode, 2 bytes per character, for non-Latin alphabets.",
          "Always size strings to what you need. An un-sized <code>String</code> reserves 256 bytes."
        ]],
        ["scl", "#Name   := 'Pump_';\n#Number := 7;\n\n// Join text: + works in SCL, or CONCAT\n#Tag := CONCAT(IN1 := #Name, IN2 := INT_TO_STRING(#Number));  // 'Pump_7'\n#Tag := #Name + INT_TO_STRING(#Number);                          // same\n\n#L   := LEN(#Tag);                       // 6\n#Sub := MID(IN := #Tag, L := 2, P := 6); // 'ump_7'\n#Pos := FIND(IN1 := #Tag, IN2 := '_');   // 5\nIF #Tag = 'Pump_7' THEN\n    #Match := TRUE;\nEND_IF;", "Common string operations"],
        ["p", "Other useful instructions: <code>LEFT</code>, <code>RIGHT</code>, <code>INSERT</code>, <code>DELETE</code>, <code>REPLACE</code>, and the conversions <code>STRG_VAL</code> and <code>VAL_STRG</code> (string to number and back, with formatting). For raw bytes use <code>Strg_TO_Chars</code> and <code>Chars_TO_Strg</code>."],
        ["warn", "Strings are slow and use memory. Never build strings every scan if you do not need to. Create them on an event (a part produced, an alarm raised) and use a rising edge to trigger it."],
        ["h", "Time and date types"],
        ["ul", [
          "<b>Time</b>: a duration, stored in milliseconds. Written <code>T#5s</code>, <code>T#1h30m</code>. This is what timers use (<code>PT</code>).",
          "<b>Date</b>: <code>D#2026-10-04</code>.",
          "<b>Time_Of_Day</b>: a clock time: <code>TOD#14:30:00</code>.",
          "<b>DTL</b>: date and time as a structure with fields Year, Month, Day, Weekday, Hour, Minute, Second and Nanosecond. The best type for timestamps."
        ]],
        ["h", "Reading the clock"],
        ["scl", "// Read the CPU clock\n// RD_SYS_T: system time, UTC. RD_LOC_T: local time with time zone.\n#Ret := RD_LOC_T(OUT => #Now);       // #Now is a DTL\n\nIF #Now.HOUR >= 22 OR #Now.HOUR < 6 THEN\n    #Night_Mode := TRUE;               // lights dimmed at night\nELSE\n    #Night_Mode := FALSE;\nEND_IF;\n\n// A weekday check: 1 = Sunday ... 7 = Saturday\nIF #Now.WEEKDAY = 1 OR #Now.WEEKDAY = 7 THEN\n    #Weekend := TRUE;\nEND_IF;", "Using the real-time clock"],
        ["p", "Set the CPU clock and time zone in the device properties (<b>Time of day</b>) or from an <b>NTP</b> time server so that all machines in a plant agree. The CPU keeps time internally in UTC; the local time conversion uses the configured zone and daylight saving rules."],
        ["h", "Time arithmetic and durations"],
        ["scl", "// Difference between two timestamps\n#Elapsed := T_DIFF(IN1 := #End_Time, IN2 := #Start_Time);   // gives Time\n\n// Add a duration to a timestamp\n#Next_Service := T_ADD(IN1 := #Last_Service, IN2 := T#24h);\n\n// Convert Time to seconds as a real number\n#Seconds := DINT_TO_REAL(TIME_TO_DINT(#Elapsed)) / 1000.0;", "Durations and offsets"],
        ["note", "A Time variable is a DINT of milliseconds, so it overflows after about 24.8 days (<code>T#24d20h31m23s647ms</code>). For very long timing (service intervals in weeks) count minutes or hours in a DInt, or subtract timestamps with DTL."],
        ["h", "Typical uses"],
        ["ul", [
          "Time-stamped alarm and event logs.",
          "Production reports: shift start and end, time per part.",
          "Scheduled actions: pump change-over every week, lights on a timer, maintenance reminders.",
          "File names and log lines: <code>'Batch_' + date + '.csv'</code>."
        ]],
        ["quiz", {
          q: "Which type is best for a timestamp such as 2026-10-04 14:30:15?",
          options: ["Time", "String", "DTL", "Word"],
          answer: 2,
          why: "DTL stores the date and the time of day as separate fields, ready to use and compare."
        }],
        ["quiz", {
          q: "A String[20] holds the text 'Hello'. What does <code>LEN</code> return?",
          options: ["20", "5", "254", "2"],
          answer: 1,
          why: "LEN returns the current number of characters (5), not the declared maximum (20)."
        }],
        ["try", "Write an SCL snippet that builds the string <code>'Batch 17 at 14:05'</code> from an Int batch number and a DTL timestamp. Hint: convert the numbers with INT_TO_STRING, and add a leading zero when the minute is below 10."]
      ]
    },
    {
      id: "10.3", title: "Indirect addressing, VARIANT and bit access", minutes: 25,
      blocks: [
        ["p", "Normally you name a tag: <code>\"Motor1_Run\"</code>. Sometimes the program must decide <i>which</i> tag at run time: process whichever valve the operator picked, copy any block of data, handle any data type in a generic function. That is <b>indirect addressing</b>."],
        ["h", "1. Indexing an array (the safe way)"],
        ["scl", "// Operator selects valve 1..8 on the HMI\n#Sel := LIMIT(MN := 1, IN := \"HMI_Selected_Valve\", MX := 8);\n\"ValveDB\".Valves[#Sel].Cmd_Open := \"HMI_Open_Cmd\";", "Array indexing is the preferred indirect addressing"],
        ["p", "For nearly all cases an array indexed by a variable is the right tool. It is typed, bounds-checked and readable. Resist the temptation to use anything cleverer until you need to."],
        ["h", "2. Bit and byte access (slices)"],
        ["p", "You can address a single bit, byte or word inside a larger variable using <b>slice access</b>. This is how status words from drives and gateways are decoded."],
        ["scl", "// A 16-bit status word from a drive\n#Ready  := #ZSW1.%X0;      // bit 0\n#Fault  := #ZSW1.%X3;      // bit 3\n#Speed_OK := #ZSW1.%X10;   // bit 10\n\n// Low and high byte of a word\n#Lo := #ZSW1.%B1;\n#Hi := #ZSW1.%B0;\n\n// Set a bit in a control word\n#STW1.%X0 := #Run;\n#STW1.%X3 := #Run;         // operation enabled", "Slice access: .%X bit, .%B byte, .%W word"],
        ["note", "Lesson 6.4 showed the PROFIdrive control and status words. This is how you set and read those bits without the big hand-written masks."],
        ["h", "3. VARIANT"],
        ["p", "A <b>VARIANT</b> parameter is a pointer to a variable of <i>any</i> type. It lets one block work with any data. A generic logger can accept a Real, a Struct or a whole DB."],
        ["scl", "// FC \"Log_Value\": In_Value is VARIANT\nIF TypeOf(#In_Value) = Real THEN\n    // read it as a Real\n    #Ret := VariantGet(SRC := #In_Value, DST => #Val_Real);\nELSIF TypeOf(#In_Value) = Int THEN\n    #Ret := VariantGet(SRC := #In_Value, DST => #Val_Int);\nELSE\n    #Error := TRUE;\nEND_IF;", "Reading a VARIANT"],
        ["ul", [
          "<code>TypeOf</code> / <code>TypeOfElements</code> check the real type behind the pointer.",
          "<code>VariantGet</code> and <code>VariantPut</code> read and write the pointed variable.",
          "<code>MOVE_BLK_VARIANT</code> copies a block of elements between arrays.",
          "A VARIANT is only a <b>pointer</b>: it works for inputs and in/outs but cannot be stored in a data block."
        ]],
        ["h", "4. PEEK and POKE"],
        ["p", "<code>PEEK</code> and <code>POKE</code> read and write memory by byte offset. They work on I, Q, M and on data blocks with <i>standard</i> (non-optimised) access. The area codes are 16#81 inputs, 16#82 outputs, 16#83 bit memory and 16#84 data block; the DB number must be 0 for the other areas, and only the low 16 bits of the byte offset are used. POKE has an extra VALUE parameter. They are powerful and dangerous; one wrong offset corrupts unrelated data."],
        ["scl", "// Read byte 4 of non-optimised DB10\n#B := PEEK(area := 16#84, dbNumber := 10, byteOffset := 4);", "PEEK (rarely needed)"],
        ["warn", "Avoid PEEK/POKE and old-style ANY pointers (the S7-300 inheritance) in new code. They bypass type checking and break when the DB layout changes. A typed array, a UDT or a VARIANT is almost always the better answer."],
        ["h", "Which tool when"],
        ["ul", [
          "Choose one of several identical items: <b>array index</b>.",
          "Decode a status word: <b>slice access</b>.",
          "Write a generic block for several data types: <b>VARIANT</b>.",
          "Talk to an external device by byte offset: <b>PEEK/POKE</b> or, better, a UDT that matches the device's layout."
        ]],
        ["quiz", {
          q: "How do you read bit 3 of the Word variable <code>#ZSW1</code> in SCL?",
          options: ["<code>#ZSW1[3]</code>", "<code>#ZSW1.%X3</code>", "<code>#ZSW1.3</code>", "<code>BIT(#ZSW1, 3)</code>"],
          answer: 1,
          why: "Slice access uses .%X for a bit, .%B for a byte and .%W for a word."
        }],
        ["quiz", {
          q: "A function must accept either a Real or an Int as an input and handle both. Which parameter type fits?",
          options: ["Any", "VARIANT", "Pointer", "Word"],
          answer: 1,
          why: "VARIANT points to any variable, and TypeOf lets the block find out which type it received."
        }],
        ["try", "Write an SCL FC that takes a drive status word and returns the booleans Ready, Running, Fault and Warning by slice access. Use the bits from your drive's telegram table (lesson 6.4)."]
      ]
    },
    {
      id: "10.4", title: "Robust blocks: errors, handshakes and watchdogs", minutes: 25,
      blocks: [
        ["p", "A beginner's program works when everything is fine. A professional program is written for the day a sensor breaks, a network cable is pulled or an operator types nonsense. This lesson covers the habits that turn a demo into something you can leave running."],
        ["h", "Validate your inputs"],
        ["p", "Never trust a value coming from outside the block: an HMI entry, an analog input, a recipe, a network value. Check it, limit it, and flag a fault when it is wrong."],
        ["scl", "// Setpoint from the HMI: must be 0..100\n#SP_Safe := LIMIT(MN := 0.0, IN := #SP_HMI, MX := 100.0);\n#SP_Clamped := (#SP_Safe <> #SP_HMI);   // tell the operator it was changed\n\n// Never divide without checking the divisor\nIF #Divisor <> 0.0 THEN\n    #Ratio := #Value / #Divisor;\nELSE\n    #Ratio := 0.0;\n    #Error := TRUE;\nEND_IF;\n\n// Analog wire break: raw below 4 mA\nIF #Raw_Value < -4864 THEN             // module underflow for 4-20 mA\n    #Wire_Break := TRUE;\nEND_IF;", "Defensive checks"],
        ["warn", "An integer divided by zero is a runtime error, and a Real divided by zero becomes infinity or NaN (not a number) and quietly poisons every calculation that follows. In LAD, the <b>OK</b> and <b>NOT OK</b> contacts check whether a Real is a valid number. Better: do not let the bad value happen."],
        ["h", "The standard block interface: Execute, Done, Busy, Error"],
        ["p", "When a block does something that takes time (move an axis, send a message, read a file), use the same interface everywhere. It follows the PLCopen convention and you will meet it in every professional library:"],
        ["ul", [
          "<b>Execute</b> (input): start on a <i>rising edge</i>.",
          "<b>Busy</b> (output): working. Do not start another job.",
          "<b>Done</b> (output): finished successfully (one cycle or until Execute falls).",
          "<b>Error</b> (output): failed. <b>Status</b> (output, Word): an error number you document."
        ]],
        ["scl", "// Skeleton of an Execute / Busy / Done / Error block (state in Static)\nIF #Execute AND NOT #Execute_Old THEN       // rising edge\n    #State := 1; #Error := FALSE; #Status := 0;\nEND_IF;\n#Execute_Old := #Execute;\n\nCASE #State OF\n    0: #Busy := FALSE;\n    1: #Busy := TRUE;  #Done := FALSE;\n       // do the work; set #State := 2 when finished, 9 on a failure\n    2: #Busy := FALSE; #Done := TRUE;  IF NOT #Execute THEN #State := 0; END_IF;\n    9: #Busy := FALSE; #Error := TRUE; #Status := 16#8001;\n       IF NOT #Execute THEN #State := 0; END_IF;\nEND_CASE;", "Execute-Busy-Done-Error"],
        ["h", "ENO and local error handling"],
        ["p", "In LAD and FBD every instruction box has an <b>EN</b> input and an <b>ENO</b> output: ENO is 1 if the instruction executed without error. In SCL, <code>GET_ERROR</code> and <code>GET_ERR_ID</code> (local error handling) let your code react to an error in a statement instead of the CPU's default behaviour. Inserting the instruction switches local error handling on for that block. <code>GET_ERROR</code> writes the <b>first</b> error since its last execution into an operand of type <code>ErrorStruct</code> (declare it in Temp or reset it first, because it is only overwritten when an error occurs); <code>GET_ERR_ID</code> returns only the error ID as a Word. Check the instruction help for the exact call syntax:"],
        ["scl", "#Result := #Dividend / #Divisor;\nGET_ERROR(ERROR => #Err);               // #Err is of the system type ErrorStruct\nIF #Err.ERROR_ID <> 0 THEN\n    #Result := 0;\n    #Fault  := TRUE;\nEND_IF;", "Catching an error in SCL (principle)"],
        ["h", "Watchdogs and heartbeats"],
        ["p", "If a communication partner dies, the last received value just stays there, looking valid. The cure is a <b>heartbeat</b>: the sender increments a counter (or toggles a bit) every second; the receiver checks that it changes."],
        ["scl", "// Receiver: has the counter changed in the last 3 seconds?\nIF #Heartbeat_In <> #Heartbeat_Last THEN\n    #Heartbeat_Last := #Heartbeat_In;\n    #T_Watch(IN := FALSE, PT := T#3s);   // restart\nELSE\n    #T_Watch(IN := TRUE, PT := T#3s);\nEND_IF;\n#Comm_Lost := #T_Watch.Q;\n\nIF #Comm_Lost THEN\n    #Speed_SP := 0.0;                   // go to a safe state\nEND_IF;", "Heartbeat monitor"],
                ["sim", {
          title: "Heartbeat watchdog: toggle the bit at least every 3 s",
          inputs: [{ tag: "Beat", addr: "%M10.0", label: "Heartbeat bit from the partner (toggle it)", kind: "switch" }],
          outputs: [
            { tag: "Comm_OK", addr: "%Q0.0", label: "Link alive", kind: "lamp", color: "#2fb86a" },
            { tag: "Comm_Lost", addr: "%Q0.1", label: "Link lost: go to safe state", kind: "lamp", color: "#f2554b" }
          ],
          rungs: [
            { title: "Any change of the heartbeat (rising or falling edge) restarts the 3 s watchdog", c: [["par", [[["P", "Beat", "m_up"]], [["N", "Beat", "m_dn"]]]]], o: ["tof", "T_Alive", 3000] },
            { title: "Link alive while the watchdog is running", c: [["NO", "T_Alive.Q"]], o: ["coil", "Comm_OK"] },
            { title: "Link lost when it expires", c: [["NC", "T_Alive.Q"]], o: ["coil", "Comm_Lost"] }
          ]
        }],
        ["p", "Toggle the switch every second or two and the link stays alive. Stop toggling and after 3 s the lost-link lamp comes on. A frozen partner can never look healthy."],
        ["h", "Safe defaults"],
        ["ul", [
          "Decide for every output what the <b>safe state</b> is, and set it on a fault or start-up.",
          "Initialise static variables to a safe value. After a CPU cold restart everything is zero or its start value.",
          "Handle <b>power-up</b> explicitly (OB 100) rather than assuming old values are right.",
          "Document what each <code>Status</code> code means. A fault that says only 'Error' wastes hours."
        ]],
        ["quiz", {
          q: "A partner PLC stops sending data but the last values stay in the receiving DB. How does the receiver notice?",
          options: [
            "It cannot; the values look normal",
            "A heartbeat counter from the partner stops changing, and a watchdog timer detects it",
            "The CPU automatically stops",
            "The values turn to zero"
          ],
          answer: 1,
          why: "Stale data looks valid. A changing heartbeat proves the sender is alive and the link works."
        }],
        ["quiz", {
          q: "In an Execute/Busy/Done/Error block, when should the work start?",
          options: ["Whenever Execute is 1", "On a rising edge of Execute", "When Busy is 1", "On a falling edge of Done"],
          answer: 1,
          why: "A rising edge means one clear request per command. Level-driven blocks restart themselves after finishing."
        }],
        ["try", "Take the Motor_Ctrl block from lesson 3.3 and add (1) a <code>Feedback</code> input and a 2 s monitoring timer that raises <code>Fault</code> if Run is commanded but Feedback does not arrive, and (2) a <code>Status</code> word with different codes for 'overload' and 'no feedback'."]
      ]
    },
    {
      id: "10.5", title: "Sequences: GRAFCET and step chains", minutes: 30,
      blocks: [
        ["p", "Many machines do the same sequence over and over: clamp, drill, release, eject. A badly written sequence is a tangle of interlocking bits that nobody dares to change. A <b>step chain</b> is the clean answer, and the industry has a standard language for drawing it."],
        ["h", "GRAFCET / SFC"],
        ["p", "<b>GRAFCET</b> (IEC 60848), also called <b>SFC</b> (Sequential Function Chart, IEC 61131-3), describes a sequence as <b>steps</b> and <b>transitions</b>. The rules are simple:"],
        ["ul", [
          "A <b>step</b> is a box. When it is active its <b>actions</b> run (switch an output, start a timer).",
          "A <b>transition</b> is a bar between two steps, with a <b>condition</b>. When the previous step is active and the condition becomes true, the transition fires: the old step is deactivated and the next one activated.",
          "Exactly one step (the <b>initial step</b>, double box) is active at power-up.",
          "Branches allow alternatives (choose A or B) and parallel actions (do both)."
        ]],
        ["fig", "grafcet", "A pressing sequence as a GRAFCET: idle, extend, hold, retract."],
        ["note", "S7-GRAPH is Siemens' own graphical editor for this style of programming. It is an optional language of STEP 7 Professional (not the Basic edition) for the S7-1500 and the older S7-300/400. It is not available for the S7-1200 or the S7-1200 G2, whose documentation lists STL and GRAPH among the missing languages, so on those CPUs build the chain in LAD or SCL. The same chain can be built in plain LAD or SCL in any PLC, and that is what we do here. The pattern is the skill."],
        ["h", "Step chain in ladder"],
        ["p", "Each step is a bit. A transition <b>sets the next step bit</b>; the next step then <b>resets the previous one</b>. The outputs come from the step bits only. Press Start: the cylinder extends until B2, holds for 2 seconds, retracts to B1, and the machine is idle again."],
        ["sim", {
          title: "Press sequence as a step chain (S1 extend, S2 hold, S3 retract)",
          plant: "cylinder",
          inputs: [{ tag: "Start_PB", addr: "%I0.0", label: "Start cycle", kind: "push" }],
          outputs: [
            { tag: "Y1", addr: "%Q0.0", label: "Y1 extend", kind: "lamp", color: "#ffbf1f" },
            { tag: "S1", addr: "%M10.1", label: "S1 extending", kind: "lamp", color: "#2fb86a" },
            { tag: "S2", addr: "%M10.2", label: "S2 holding", kind: "lamp", color: "#f2b84b" },
            { tag: "S3", addr: "%M10.3", label: "S3 retracting", kind: "lamp", color: "#4db3e0" }
          ],
          sensors: [
            { tag: "B1", addr: "%I0.1", label: "B1 retracted" },
            { tag: "B2", addr: "%I0.2", label: "B2 extended" }
          ],
          rungs: [
            { title: "Idle = no step active", c: [["NC", "S1"], ["NC", "S2"], ["NC", "S3"]], o: ["coil", "Idle"] },
            { title: "T0: Start AND at back position -> S1", c: [["NO", "Idle"], ["NO", "Start_PB"], ["NO", "B1"]], o: ["set", "S1"] },
            { title: "T1: front position reached -> S2", c: [["NO", "S1"], ["NO", "B2"]], o: ["set", "S2"] },
            { title: "S2 active: reset S1", c: [["NO", "S2"]], o: ["reset", "S1"] },
            { title: "Step 2 action: 2 s hold timer", c: [["NO", "S2"]], o: ["ton", "T_Hold", 2000] },
            { title: "T2: hold time over -> S3", c: [["NO", "S2"], ["NO", "T_Hold.Q"]], o: ["set", "S3"] },
            { title: "S3 active: reset S2", c: [["NO", "S3"]], o: ["reset", "S2"] },
            { title: "T3: back position -> end of cycle", c: [["NO", "S3"], ["NO", "B1"]], o: ["reset", "S3"] },
            { title: "Output: extend during S1 and S2", c: [["par", [[["NO", "S1"]], [["NO", "S2"]]]]], o: ["coil", "Y1"] }
          ]
        }],
        ["p", "Notice the structure: first the transitions (set next step, reset previous one), then the actions (outputs and timers from step bits). The outputs never look at a sensor directly; the sequence decides."],
        ["h", "The same chain in SCL"],
        ["scl", "CASE #Step OF\n    0:  // IDLE\n        IF #Start AND #B1_Back THEN #Step := 1; END_IF;\n    1:  // EXTEND\n        IF #B2_Front THEN #Step := 2; END_IF;\n    2:  // HOLD 2 s\n        IF #T_Hold.Q THEN #Step := 3; END_IF;\n    3:  // RETRACT\n        IF #B1_Back THEN #Step := 0; END_IF;\n    ELSE\n        #Step := 0;\nEND_CASE;\n\n#T_Hold(IN := (#Step = 2), PT := T#2s);\n#Y1 := (#Step = 1) OR (#Step = 2);", "One integer 'Step' variable instead of many bits"],
        ["h", "What makes a sequence professional"],
        ["ul", [
          "<b>Step timeout</b>: every step that waits for a sensor also starts a timer. If the sensor never arrives, raise a fault that names the step (S1 timeout: cylinder did not reach front).",
          "<b>Modes</b>: automatic, manual and setup should share the same outputs, with a clear rule for who wins. Never drive an output from two places.",
          "<b>Fault, stop and reset</b>: define what each does to the chain: pause, return to idle, or hold position.",
          "<b>Show the step</b> on the HMI. 'Waiting for B2' tells the operator why the machine stopped.",
          "<b>Record</b>: log the step number in the diagnostics, to analyse faults later."
        ]],
        ["quiz", {
          q: "In a step chain, why do outputs come from step bits instead of sensors directly?",
          options: [
            "It is faster",
            "The sequence decides what should happen, so the output logic stays simple and the machine state is visible",
            "Sensors cannot drive outputs",
            "There are not enough inputs"
          ],
          answer: 1,
          why: "Separating decision (steps) from action (outputs) makes the machine behaviour predictable and easy to diagnose."
        }],
        ["quiz", {
          q: "Which feature turns 'the machine stopped for no reason' into a quick fault diagnosis?",
          options: ["More timers", "A step timeout that raises a fault naming the step", "A faster CPU", "Removing sensors"],
          answer: 1,
          why: "The timeout identifies which transition never fired, so the technician checks that one sensor."
        }],
        ["try", "Extend the step chain with a fourth step: after retracting, wait 1 s before returning to idle (to let the part settle). Which rung changes, and what is the new step bit set by?"]
      ]
    },
    {
      id: "10.6", title: "Interrupts, cyclic tasks and fast counting", minutes: 25,
      blocks: [
        ["p", "OB1, the main cycle, is not at a fixed rhythm: its time depends on how much program it runs. Some jobs must happen at an exact interval or react to an event faster than a scan. The CPU provides <b>interrupt OBs</b> for that."],
        ["fig", "ob-timeline", "Interrupt OBs pause the main cycle, run, and hand control back."],
        ["h", "Types of OB (recap and new)"],
        ["ul", [
          "<b>OB 1 Main</b>: the normal cyclic program.",
          "<b>OB 100 Startup</b>: once at power-up or STOP-to-RUN.",
          "<b>Cyclic interrupt OB (OB 30 to 38 and above)</b>: runs at a fixed time such as every 10 ms or 100 ms, whatever OB1 is doing. For PID loops, filters and anything that must have a fixed sample time.",
          "<b>Time-delay interrupt</b>: runs once a set time after an event you trigger.",
          "<b>Hardware interrupt (OB 40 to 47)</b>: runs when a chosen input edge occurs, with the shortest delay. For very fast events such as a high-speed registration mark.",
          "<b>Time-of-day interrupt</b>: runs at a given time or date, for example every day at midnight.",
          "<b>Diagnostic and error OBs</b>: OB 82 (diagnostic), OB 83 (module insert/remove), OB 86 (rack/station failure), OB 80 (time error), OB 121 (programming error), OB 122 (I/O access error)."
        ]],
        ["h", "Cyclic interrupts for control loops"],
        ["p", "PID control (lesson 7.1) assumes a constant sample time. If you call <code>PID_Compact</code> from OB1 whose cycle varies from 4 to 15 ms, the derivative and integral terms are noisy. Call it from a <b>cyclic interrupt OB</b> and its sample time is fixed. In TIA Portal, create an OB of type <i>Cyclic interrupt</i> and set the interval (for example 100 ms) in its properties."],
        ["click", "Project tree > Program blocks > Add new block > Organization block > Cyclic interrupt", "In TIA Portal"],
        ["warn", "An interrupt OB must finish before its next call. If the code in a 10 ms cyclic OB takes 12 ms, the CPU raises a time error (OB 80) and may stop. Keep interrupt code short and fast; do the heavy work in OB1. Also remember data shared between OB1 and the interrupt can change in the middle of an OB1 calculation."],
        ["h", "Shared data between OB1 and interrupts"],
        ["ul", [
          "Do not write the same variable from OB1 and from an interrupt. One writer, many readers.",
          "Copy a multi-word value (a Real is 4 bytes) as a block, or let only the interrupt write it and have OB1 read a copy.",
          "Use the optimised DB and the single-writer rule, and the problems disappear."
        ]],
        ["h", "High-speed counters (HSC)"],
        ["p", "An encoder can send thousands of pulses per second; a normal input read once per scan misses most of them. A <b>high-speed counter</b> is dedicated hardware that counts every edge, independent of the scan, and delivers the count (and frequency) to your program."],
        ["ul", [
          "Enable it in the CPU properties (<b>High speed counters</b>), pick the input, mode (single phase, A/B quadrature) and counting direction.",
          "The maximum frequency depends on the CPU and on the used inputs: on a CPU 1214C the first six inputs (I0.0 to I0.5) count up to 100 kHz single-phase (80 kHz for A/B quadrature) and the remaining ones up to 30 kHz (20 kHz). Reduce the input filter time: the default 6.4 ms filter limits counting to about 78 Hz.",
          "The HSC can trigger a <b>hardware interrupt</b> at a reference value, to do something at an exact position (for example, a cut).",
          "Newer firmware gives a technology object with its own instructions, for example <code>CTRL_HSC_EXT</code>, which make configuration and use simpler."
        ]],
        ["h", "Pulse outputs and motion"],
        ["p", "Stepper and servo drives that take pulse and direction signals need a <b>pulse train output (PTO)</b>. It must come from a fast <b>transistor</b> output (lesson 9.2), not a relay. In TIA Portal the motion control technology objects (lesson 7.2) generate the pulses and the profile."],
        ["quiz", {
          q: "Why call a PID instruction from a cyclic interrupt OB instead of OB1?",
          options: [
            "Cyclic OBs are more secure",
            "The sample time is constant, which the control calculation depends on",
            "OB1 cannot call PID",
            "Interrupts use less memory"
          ],
          answer: 1,
          why: "Fixed-interval execution gives a stable derivative and integral calculation."
        }],
        ["quiz", {
          q: "An encoder gives 20 000 pulses per second. How should the PLC count them?",
          options: [
            "A normal digital input and a CTU counter",
            "A high-speed counter input",
            "Every second with a timer",
            "Not possible"
          ],
          answer: 1,
          why: "A CTU reads the input once per scan, which is much too slow. An HSC counts in hardware."
        }],
        ["try", "A cyclic OB is set to 20 ms but contains code that takes 25 ms. Predict what the CPU will do, then look up OB 80 (time error) in the TIA help to confirm. How would you fix the design?"]
      ]
    },
    {
      id: "10.7", title: "Analysis tools: trace, cross-references and web server", minutes: 25,
      blocks: [
        ["p", "When a machine misbehaves once a day, staring at the ladder does not help. TIA Portal and the CPU itself provide tools to see what really happened and where things are used. Good engineers use them every day."],
        ["h", "Cross-reference list"],
        ["p", "Right-click any tag, block or DB and choose <b>Go to > Cross-references</b> (or open the list from the Tools menu). It shows every place in the program where the object is read or written, and how."],
        ["ul", [
          "Finds an output driven from <b>two places</b> (double assignment), a classic cause of 'it switches itself off'.",
          "Finds unused tags and blocks before the handover.",
          "Shows access type: read, write, read/write."
        ]],
        ["h", "Call structure and dependencies"],
        ["p", "The <b>Call structure</b> view shows which block calls which, and how much local memory each branch needs. The <b>Dependency structure</b> shows what breaks if you change a block. Use them before changing a shared FC."],
        ["h", "Program compare"],
        ["p", "<b>Compare offline/online</b> shows the differences between the project on the PC and the program in the CPU: which blocks differ and which are identical. Use it before every download to avoid overwriting a colleague's change, and to find out which version is running in the machine."],
        ["h", "The Trace tool"],
        ["p", "Watch tables show values <i>now</i>. The <b>Trace</b> records selected tags into a graph every cycle (or at a fixed interval) in the CPU, so you can look at a fast signal afterwards."],
        ["ul", [
          "Create a trace under <b>Traces</b> in the project tree, choose tags, and the recording condition (a <b>trigger</b>, for example 'Fault rises').",
          "Include <b>pre-trigger</b> samples to see what happened <i>before</i> the event.",
          "Overlay several tags (command, feedback, current) and zoom to the millisecond.",
          "Use cursors to measure delays, such as time from command to feedback. Export to CSV for reports.",
          "It is the right tool for PID tuning: plot setpoint, process value and output."
        ]],
        ["click", "Project tree > <your PLC> > Traces > Add new trace", "In TIA Portal"],
        ["fig", "trace-mock", "A trace: signals, a trigger with pre-trigger samples, and a time diagram with a cursor measurement (illustrative mock-up)."],
        ["h", "Automated testing"],
        ["p", "Professional teams also test <i>code</i>, not only machines. Wrap logic in FBs with clear inputs and outputs, then run it in PLCSIM with scripted input sequences and check the outputs. Siemens' text-based export format (SIMATIC Source Documents) is designed for tools such as Git, and a Test Suite option exists for automated block tests; together they make an automated pipeline possible (lesson 8.5). Check which of these your TIA Portal version and licence include."],
        ["h", "Diagnostic buffer"],
        ["p", "Every CPU keeps a ring buffer of events with timestamps: mode changes, module errors, program errors. It is the first place to look after a stop (lesson 8.1). Memorise the path: <b>Online &amp; diagnostics > Diagnostics > Diagnostic buffer</b>."],
        ["h", "The CPU web server"],
        ["p", "Modern CPUs contain a small web server. Enable it in the CPU properties, and you can open <code>https://&lt;CPU IP&gt;</code> in any browser, with no TIA Portal needed."],
        ["ul", [
          "Standard pages: CPU state, diagnostic buffer, module information, tag status, watch tables.",
          "Optional user-defined pages show your own HMI-style view of the machine on a phone or tablet.",
          "Perfect for a technician in the field who has only a laptop browser."
        ]],
        ["warn", "A web server is a network service. Use HTTPS only, create users with the least rights, never expose it to the internet, and switch it off if not needed (lesson 8.3)."],
        ["h", "Data logs and the memory card"],
        ["p", "A CPU can write production or process data to <b>CSV files on its memory card</b> with the <code>DataLogCreate</code>, <code>DataLogOpen</code>, <code>DataLogWrite</code> and <code>DataLogClose</code> instructions. A technician can download the file from the web server. This is a cheap way to record temperatures, counts or alarm history without a SCADA system."],
        ["quiz", {
          q: "A relay output turns off for no obvious reason. What should you check first?",
          options: [
            "The cable length",
            "The cross-reference list to see if the output is written from more than one place",
            "Replace the CPU",
            "Reduce the scan time"
          ],
          answer: 1,
          why: "The last write in the scan wins, so a second assignment elsewhere will silently override your logic."
        }],
        ["quiz", {
          q: "Why use the trace tool instead of a watch table for a 5 ms event?",
          options: [
            "Watch tables are inaccurate",
            "The trace records in the CPU at cycle resolution; a watch table refreshes slowly and misses fast events",
            "The trace uses less CPU time",
            "Only the trace shows Booleans"
          ],
          answer: 1,
          why: "The monitoring display of a watch table updates a few times per second, but a trace is sampled inside the CPU."
        }],
        ["try", "In PLCSIM, record a trace of a timer's input and output, and measure the on-delay with the cursors. Does it match the preset time?"]
      ]
    }
  ]
});
