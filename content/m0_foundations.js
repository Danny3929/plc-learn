window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 0,
  title: "0 · PLC foundations",
  lessons: [
    {
      id: "0.1", title: "What is a PLC?", minutes: 10,
      blocks: [
        ["p", "A <b>PLC</b> (Programmable Logic Controller) is a small, rugged industrial computer built to <b>control machines and processes</b>. It watches sensors, makes decisions with a program you write, and switches things on and off: motors, valves, lamps, heaters, robots."],
        ["fig", "plc-loop", "The control loop. Everything in this course is about writing the middle box."],
        ["h", "Why not just use a normal computer or an Arduino?"],
        ["ul", [
          "<b>Built for factories</b>: tolerates heat, vibration, electrical noise and 24 V industrial wiring.",
          "<b>Deterministic</b>: the program runs in a predictable cycle, so a machine reacts in a known, repeatable time.",
          "<b>Reliable and maintainable</b>: runs for years non-stop, modules swap in minutes, and technicians worldwide know the programming languages.",
          "<b>Standardised</b>: the languages follow an international standard (IEC 61131-3), which you will meet in lesson 0.6."
        ]],
        ["p", "PLCs began in 1968, when General Motors asked for something to replace rooms full of hard-wired relay panels. Changing a relay panel meant rewiring. Changing a PLC means changing the program. The ladder diagram look you will learn is a direct descendant of those relay drawings."],
        ["h", "Where you find them"],
        ["p", "Packaging lines, conveyors, water treatment, lifts, car-wash tunnels, bottling plants, wind turbines, building automation, test rigs. If a machine repeats a sequence reliably, a PLC is probably behind it."],
        ["note", "You do not need a physical PLC for this course. TIA Portal includes a hardware-free simulator (PLCSIM), and this app has its own ladder simulator for practice."],
        ["try", "Pick a machine you know (a vending machine, a lift, a washing machine). Write down 3 things it senses (inputs) and 3 things it switches (outputs)."],
        ["quiz", {
          q: "Which statement best describes a PLC?",
          options: ["A desktop PC running office software", "A rugged industrial controller that reads inputs, runs a program and drives outputs in a repeating cycle", "A sensor that measures temperature", "A type of electric motor"],
          answer: 1,
          why: "Inputs in, program, outputs out, repeated forever: that is the essence of a PLC."
        }]
      ]
    },
    {
      id: "0.2", title: "Inside a PLC and the scan cycle", minutes: 15,
      blocks: [
        ["p", "Before writing programs, you need a mental model of what the PLC does with them. A PLC is made of a few parts that always work together."],
        ["fig", "plc-inside", "A CPU sits between input and output modules. It keeps <i>images</i> of the I/O in its own memory."],
        ["ul", [
          "<b>Power supply</b>: usually 24 V DC for the CPU, modules and often the sensors.",
          "<b>Input modules</b>: turn field signals (24 V, 4-20 mA) into numbers the CPU can read.",
          "<b>CPU</b>: stores the program, runs it, and keeps all data.",
          "<b>Output modules</b>: turn the CPU's decisions into voltages or currents that drive actuators.",
          "<b>Memory</b>: <i>load memory</i> holds the stored program, <i>work memory</i> is where it runs, <i>retentive memory</i> keeps chosen values through a power cut."
        ]],
        ["h", "The scan cycle"],
        ["p", "The CPU does not react to inputs instantly and continuously. It works in a loop called the <b>scan cycle</b>:"],
        ["fig", "scan-cycle", "The cycle on S7-1200/1500: write outputs, read inputs, run the program, housekeeping."],
        ["p", "The important consequence: during step 3 the program sees a <b>snapshot</b> of the inputs taken in step 2. If a sensor flickers mid-scan, the program does not notice until the next scan. Outputs you set also only reach the real world at the next step 1."],
        ["h", "Play it in slow motion"],
        ["p", "Below is the scan cycle running slowly, about a second per step. Toggle the sensor and watch how the <b>input image</b> only changes at step 2, and the <b>lamp</b> only follows at the next step 1. Then press <b>Pulse sensor</b>: a short pulse that falls between two reads is never seen at all."],
        ["scanplay", {}],
        ["try", "Press Pulse sensor several times at different moments in the cycle. How often does the PLC miss it? Why would a faster scan help?"],
        ["note", "A typical scan takes a few milliseconds. Signals shorter than the scan time can be missed entirely, which is why very fast signals use special hardware (interrupts, high-speed counters). You will see this effect yourself in the edge-detection simulator."],
        ["quiz", {
          q: "A sensor pulses for 1 ms, but the scan cycle takes 10 ms and the pulse falls between two input reads. What happens?",
          options: ["The program sees it anyway", "The program never sees it", "The CPU stops", "The output turns on twice"],
          answer: 1,
          why: "Inputs are only sampled once per scan, so a pulse that does not overlap the sampling moment is invisible."
        }],
        ["quiz", {
          q: "Where does your ladder program run in the scan cycle?",
          options: ["Before the inputs are read", "Between reading inputs and writing outputs, using the input image", "Only when a button is pressed", "In the output module"],
          answer: 1,
          why: "Step 3 executes the program against the frozen input image."
        }]
      ]
    },
    {
      id: "0.3", title: "Inputs, outputs and sensors", minutes: 15,
      blocks: [
        ["p", "Everything the PLC knows comes through <b>inputs</b>; everything it does goes through <b>outputs</b>. Each is either <b>digital</b> or <b>analog</b>."],
        ["ul", [
          "<b>Digital</b> (discrete): only two states, 0 or 1. A push button, limit switch, photo-eye, contactor, lamp.",
          "<b>Analog</b>: a continuous value, such as temperature, pressure, level or speed. Typically 4-20 mA or 0-10 V, converted to a number (lesson 4.2)."
        ]],
        ["h", "A digital input and output, wired"],
        ["fig", "sensor-wiring", "A digital input sees 24 V as 1 and 0 V as 0. A digital output supplies 24 V to its load when the program turns it on."],
        ["p", "Most Siemens digital I/O is <b>24 V DC</b>. Always check the module: relay outputs can switch AC loads too, while transistor outputs are fast but DC only."],
        ["h", "Normally open vs normally closed"],
        ["fig", "no-nc", "NO = open until acted on. NC = closed until acted on."],
        ["p", "This detail matters later: it decides how you wire <i>stop</i> buttons, and it is the root of a classic beginner mistake. Remember it, we revisit it in lesson 2.3."],
        ["h", "Sensor types you will meet"],
        ["ul", [
          "<b>Push buttons and selector switches</b>: operator input.",
          "<b>Limit switches</b>: mechanical contact when something reaches a position.",
          "<b>Inductive proximity sensors</b>: detect metal without touching. Usually <b>PNP</b> (switches +24 V to the input) in Europe, and NPN in parts of Asia. A PNP sensor with a PLC input expecting +24 V is the common pairing.",
          "<b>Photoelectric sensors</b>: a light beam detects objects.",
          "<b>Analog transmitters</b>: temperature, pressure, level, flow."
        ]],
        ["warn", "This course is about programming. Real wiring on live equipment must be done by a qualified person following the manuals and local safety rules. Never experiment on mains or industrial voltages."],
        ["quiz", {
          q: "A temperature transmitter outputs a continuous 4-20 mA signal. Which kind of input is that?",
          options: ["Digital input", "Analog input", "Output module", "Memory bit"],
          answer: 1,
          why: "A continuous range of values is analog; a two-state signal is digital."
        }],
        ["quiz", {
          q: "A normally closed (NC) contact is not pressed. What signal does the PLC input see?",
          options: ["0, because nothing happened", "1, because the circuit is closed and current flows", "Undefined", "It depends on the program"],
          answer: 1,
          why: "NC means closed in its resting state, so current flows and the input reads 1."
        }]
      ]
    },
    {
      id: "0.4", title: "Bits, bytes and data types", minutes: 15,
      blocks: [
        ["p", "All PLC data is built from <b>bits</b>. A bit holds 0 or 1. Group bits and you get larger data types. Choosing the right type matters: it decides what values fit and how much memory is used."],
        ["fig", "data-types", "Bigger types are just more bits. A byte is 8 bits; a word is 2 bytes; a double word is 4."],
        ["h", "The types you will use most"],
        ["ul", [
          "<code>Bool</code>: one bit. TRUE or FALSE. Buttons, lamps, flags.",
          "<code>Byte</code>, <code>Word</code>, <code>DWord</code>: 8, 16, 32 bits treated as raw bit patterns.",
          "<code>Int</code>: 16-bit signed whole number, -32768 to 32767. Counters, raw analog values.",
          "<code>DInt</code>: 32-bit whole number, about &plusmn;2.1 billion.",
          "<code>Real</code>: 32-bit decimal number, e.g. 72.5 &deg;C. Used for scaled analog values and math.",
          "<code>Time</code>: durations such as <code>T#5s</code> or <code>T#2m30s</code>. Used by timers.",
          "<code>String</code>: text. <code>Struct</code> and UDTs group several values together."
        ]],
        ["h", "Binary and hexadecimal"],
        ["p", "Counting in binary, each bit position is worth double the one on its right: 1, 2, 4, 8, 16... So <code>0000 0101</code> is 4 + 1 = 5. Engineers also write bytes in <b>hexadecimal</b> (base 16) because one hex digit equals exactly 4 bits: <code>2#0000_1111</code> is <code>16#0F</code>, which is 15."],
        ["code", "2#1010      = 10    (binary literal)\n16#FF       = 255   (hex literal)\nT#1m30s     = 90 seconds\n72.5        = a Real", "How literals are written in TIA Portal"],
        ["note", "An <code>Int</code> cannot go past 32767. A math instruction that would overflow reports an error (its ENO output goes FALSE) and the result is not valid. When a number could exceed 32767, use <code>DInt</code> or <code>Real</code>."],
        ["quiz", {
          q: "How many different values can one byte hold?",
          options: ["8", "16", "255", "256"],
          answer: 3,
          why: "8 bits give 2^8 = 256 combinations, representing 0 to 255."
        }],
        ["quiz", {
          q: "You want to store a tank temperature of 72.5 degrees. Which data type fits?",
          options: ["Bool", "Int", "Real", "Byte"],
          answer: 2,
          why: "A decimal value needs Real. Int would lose the .5."
        }]
      ]
    },
    {
      id: "0.5", title: "Siemens PLC families and hardware", minutes: 12,
      blocks: [
        ["p", "Siemens calls its controller line <b>SIMATIC</b>. TIA Portal programs all the current ones. You only need to know the families well enough to pick one and recognise the others."],
        ["fig", "s7-family", "S7-1200 is where most learners start. The programming skills transfer directly to the S7-1500."],
        ["h", "Reading a CPU name"],
        ["p", "<code>CPU 1214C DC/DC/DC</code> decodes as:"],
        ["ul", [
          "<b>1214C</b>: S7-1200 family, performance class 14, <i>C</i> = compact, with built-in I/O.",
          "<b>DC / DC / DC</b>: supply voltage <i>DC</i>, input type <i>DC</i>, output type <i>DC</i> (transistor). The alternative <code>DC/DC/Rly</code> has relay outputs and <code>AC/DC/Rly</code> runs from mains."
        ]],
        ["h", "Two generations of S7-1200"],
        ["p", "The S7-1200 now exists in two generations. The original (<b>G1</b>, such as the CPU 1214C DC/DC/DC used throughout this course) and the newer <b>S7-1200 G2</b>, with faster processing, more memory, a smaller housing, push-in terminals and stronger motion control. G2 CPUs need a recent TIA Portal (V20 with the latest hardware support package, or V21), and their firmware numbering follows the S7-1500 line. Check the Siemens documentation for exact version requirements."],
        ["note", "Everything you learn here applies to both. Only the hardware catalog entry and a few advanced features differ. Check which generation your CPU is before you add it to the project."],
        ["h", "A modular rack"],
        ["fig", "s7-rack", "A rack is just a row of modules on a rail. Each module has a slot number that TIA Portal uses to assign its addresses."],
        ["p", "S7-1200 CPUs have the digital and analog I/O inside the CPU, with extra signal modules to the right and communication modules to the left. S7-1500 is fully modular. In both cases <b>you describe the real hardware inside TIA Portal first</b> (the hardware configuration), then write the program."],
        ["h", "What do I need to practise?"],
        ["ul", [
          "<b>Nothing physical</b>: TIA Portal plus PLCSIM simulates S7-1200 and S7-1500 CPUs. Covered in module 1.",
          "<b>Optional later</b>: a small S7-1200 (e.g. CPU 1214C) and a few switches, to feel real wiring. Not required to learn."
        ]],
        ["quiz", {
          q: "In <code>CPU 1214C DC/DC/DC</code>, what does the last DC tell you?",
          options: ["It supports AC mains", "The outputs are DC (transistor)", "It is a distributed I/O station", "It has a DC motor drive"],
          answer: 1,
          why: "The three fields are supply / inputs / outputs. Last = outputs, here DC transistor outputs."
        }]
      ]
    },
    {
      id: "0.6", title: "PLC programming languages", minutes: 12,
      blocks: [
        ["p", "The IEC 61131-3 standard defines five PLC languages. TIA Portal supports most of them, and you can mix them in one project."],
        ["ul", [
          "<b>LAD</b> (Ladder Diagram): graphical, looks like relay wiring. Best for discrete logic and for electricians. <b>This course starts here.</b>",
          "<b>FBD</b> (Function Block Diagram): graphical boxes with signal lines, like logic gates.",
          "<b>SCL</b> (Structured Control Language, = Structured Text): text, like Pascal. Best for math, loops, data handling. <b>We use it from module 3.</b>",
          "<b>GRAPH</b> (Sequential Function Chart style): steps and transitions for sequences.",
          "<b>STL</b> (Statement List): old assembly-like text, mainly legacy (S7-300/400 and S7-1500 via compatibility)."
        ]],
        ["h", "Names you will see in Siemens documents"],
        ["p", "Siemens manuals, and older TIA Portal screens, often use German abbreviations. Siemens' own IEC 61131-3 compliance manual maps the standard's languages to the STEP 7 names like this:"],
        ["ul", [
          "<b>LD</b> (Ladder Diagram) = <b>LAD</b>, German <b>KOP</b>.",
          "<b>FBD</b> (Function Block Diagram) = <b>FBD</b>, German <b>FUP</b>.",
          "<b>ST</b> (Structured Text) = <b>SCL</b>.",
          "<b>IL</b> (Instruction List) = <b>STL</b>, German <b>AWL</b>. Legacy.",
          "<b>SFC</b> (Sequential Function Chart) = <b>S7-GRAPH</b>."
        ]],
        ["note", "Text-first tools are growing. <b>SIMATIC AX</b> is Siemens' newer engineering tool built on Visual Studio Code, aimed at software-style teams: Structured Text, Git, package management and automated tests (more recently with a ladder option as well). TIA Portal remains the main tool in industry, so this course teaches it, and your SCL skills carry over directly. Check current Siemens documentation for which CPUs AX supports."],
        ["h", "The same logic three ways"],
        ["p", "A motor that starts on a Start button, keeps running by itself, and stops on a Stop button. Here is that one piece of logic in the three languages you will meet most. Every figure below is drawn by the same engine as the simulators."],
        ["fig", "three-languages", "LAD, FBD and SCL are three views of the same logic. In FBD, parallel branches become an OR box (&gt;=1), series contacts become an AND box (&amp;), and a normally closed contact becomes a small circle (negation) on the input."],
        ["note", "Professional programmers choose per task: LAD or FBD for machine interlocks and sequencing that electricians must read, SCL for calculations and reusable logic. Learning both is the goal."],
        ["quiz", {
          q: "Which language resembles a relay wiring diagram?",
          options: ["SCL", "LAD", "STL", "GRAPH"],
          answer: 1,
          why: "Ladder diagram was designed to look like the relay logic it replaced."
        }]
      ]
    },
    {
      id: "0.7", title: "Registers, shift registers and counters", minutes: 20,
      blocks: [
        ["p", "Underneath the PLC's instructions are small digital circuits built from <b>flip-flops</b>. A flip-flop stores one bit and changes it only on a clock edge. Group eight of them and you have an 8-bit <b>register</b>: the same thing as the Byte you met in lesson 0.4. Once you can see how registers and counters work, bit shifts, counters and sequences in a PLC stop feeling like magic."],
        ["h", "Play with eight flip-flops"],
        ["p", "Choose a circuit, then press <b>Clock</b>. The boxes are the flip-flops, and the traces underneath show each bit over the last 24 clock pulses."],
        ["regplay", { title: "Registers and counters" }],
        ["h", "Registers and shift registers"],
        ["ul", [
          "A <b>register</b> just stores bits until the next clock edge. A <b>parallel-load</b> register takes all eight bits at once.",
          "A <b>shift register</b> moves every bit one place on each clock. The bit that falls off one end is lost, and the bit that enters at the other end is the <b>serial input</b>. Shifting is how serial data becomes parallel data.",
          "Shifting <b>left</b> once doubles an unsigned number and shifting <b>right</b> halves it, because each place is worth twice the one to its right."
        ]],
        ["h", "Counters"],
        ["ul", [
          "A <b>binary counter</b> adds 1 on each clock. In a ripple counter each stage toggles when the one below it falls, so every stage runs at half the speed of the one before it: bit 0 is the clock divided by 2, bit 1 by 4, bit 2 by 8.",
          "An <b>up/down counter</b> adds or subtracts.",
          "A <b>ring counter</b> circulates a single 1 and is used to produce a sequence of steps, one output per step.",
          "A <b>Johnson counter</b> feeds the inverted last bit back into the first. It has twice as many states as a ring counter of the same size, and only one bit changes at a time."
        ]],
        ["h", "Where this shows up in a PLC"],
        ["ul", [
          "<b>Shift and rotate instructions</b> (<code>SHL</code>, <code>SHR</code>, <code>ROL</code>, <code>ROR</code> in TIA Portal; <code>BSL</code>/<code>BSR</code> in Allen-Bradley) work on the bits of a Byte, Word or DWord.",
          "<b>Counters</b> (CTU, CTD, CTUD from lesson 2.7) are software registers that add or subtract on a rising edge.",
          "<b>High-speed counters</b> are hardware counters that keep up with pulses much faster than the scan, for example from an encoder.",
          "A <b>ring counter</b> is the idea behind many step sequencers, and the state machines in lesson 4.4."
        ]],
        ["scl", "// Shift a value left by one place (multiply an unsigned value by 2)\n#Result := SHL(IN := #Value, N := 1);\n\n// Rotate left: the bit that falls off comes back in on the right\n#Rotated := ROL(IN := #Pattern, N := 1);", "bit shifts in SCL"],
        ["warn", "Shifting a signed integer (<code>Int</code>) left can change its sign, and bits shifted out of the top are lost. Use an unsigned type or <code>Word</code>/<code>DWord</code> when you are treating a value as a pattern of bits."],
        ["try", "In the circuit above choose <b>Binary counter (up)</b>, set Auto to 4 Hz, and watch bit 0 and bit 1. How does the speed of each trace compare with the clock? Then choose <b>Johnson counter</b> and count how many clocks it takes before the pattern repeats."],
        ["quiz", {
          q: "The binary value 0000 0110 is shifted left once (zero fed in). What is the result?",
          options: ["0000 0011", "0000 1100", "0110 0000", "0000 0111"],
          answer: 1,
          why: "Every bit moves one place left, giving 0000 1100. That is 12, double the original 6."
        }],
        ["quiz", {
          q: "In a ripple binary counter, how fast does bit 3 change compared with the clock?",
          options: ["The same speed as the clock", "Half the clock frequency", "One eighth of the clock frequency", "One sixteenth of the clock frequency"],
          answer: 3,
          why: "Each stage divides by 2, so bit 3 toggles at the clock divided by 2 four times: one sixteenth."
        }]
      ]
    }

  ]
});
