window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 9,
  title: "9 · Electrical and field devices",
  lessons: [
    {
      id: "9.1", title: "Electrical basics for PLC people", minutes: 20,
      blocks: [
        ["p", "A PLC program never switches a motor. It switches a <i>voltage on a wire</i>, and everything after that wire is electrical engineering. You do not need to be an electrician to program PLCs, but you do need to understand enough electricity to talk to one, read their drawings and find out why your output is on while the motor is dead."],
        ["h", "Voltage, current, resistance, power"],
        ["ul", [
          "<b>Voltage (V)</b> is the electrical push, measured between two points. A sensor is powered by 24 V <i>between</i> its + and 0 V wires.",
          "<b>Current (A)</b> is the flow of charge. A PLC input draws a few milliamps; a motor draws amps.",
          "<b>Resistance (&Omega;)</b> opposes current. <b>Ohm's law:</b> <code>V = I &times; R</code>.",
          "<b>Power (W)</b> is <code>P = V &times; I</code>. A 24 V lamp drawing 0.5 A uses 12 W."
        ]],
        ["p", "Worked example. A 250 &Omega; resistor carries a 4 to 20 mA signal. At 4 mA the voltage across it is <code>0.004 &times; 250 = 1 V</code>; at 20 mA it is <code>0.020 &times; 250 = 5 V</code>. That is exactly how an analog input turns a current into something it can measure (lesson 9.3)."],
        ["h", "DC and AC"],
        ["ul", [
          "<b>DC</b> (direct current) has fixed polarity: +24 V and 0 V. Control circuits, sensors and PLC I/O are normally 24 V DC.",
          "<b>AC</b> (alternating current) swings positive and negative 50 times a second (50 Hz in Europe and most of the world, 60 Hz in North America). Mains sockets (230 V) and industrial motors (400 V three-phase) use AC.",
          "<b>Three-phase</b> uses three AC lines L1, L2, L3, each shifted by a third of a cycle. It gives smooth power to motors, which is why factories use it."
        ]],
        ["fig", "motor-circuit", "The key idea of industrial control: a small, safe 24 V DC control circuit switches a large AC power circuit."],
        ["h", "Control circuit versus power circuit"],
        ["p", "Look at the figure. The PLC output carries milliamps at 24 V. It energises the <b>coil</b> of a <b>contactor</b> K1. The contactor's heavy <b>power contacts</b> then connect the motor to 400 V. The two circuits are electrically separate, linked only by the magnetic field in the contactor. This is called <b>galvanic isolation</b>, and it is why a mistake in the PLC cannot send mains voltage into your laptop."],
        ["h", "Protection devices"],
        ["ul", [
          "<b>Fuse</b>: a deliberate weak link that melts on a short circuit. One-shot.",
          "<b>Circuit breaker (MCB)</b>: trips on overload or short circuit; resettable. Cable protection.",
          "<b>Motor protection circuit breaker (MPCB)</b>: a breaker with an adjustable thermal and magnetic trip, set to the motor's rated current. Motor protection.",
          "<b>Overload relay</b>: measures motor current and opens a contact if it stays too high for too long. Its NC contact is usually wired into the PLC as an input (the <code>Overload_OK</code> signal from lesson 2.8).",
          "<b>Earth (PE)</b> and <b>residual-current devices (RCD)</b>: protect people from touch voltage."
        ]],
        ["warn", "Short circuits and overloads are different. A <b>short circuit</b> is a near-zero-resistance path and gives hundreds of amps instantly: the fuse or magnetic trip must act in milliseconds. An <b>overload</b> is a modest excess over minutes: the thermal trip handles it. A PLC program cannot protect against either. Hardware does."],
        ["h", "Wire colours and numbers"],
        ["p", "Rules differ by country and plant, but common practice is: brown, black and grey for L1, L2, L3; blue for neutral; green/yellow only for earth (PE). In 24 V DC control, many plants use red for +24 V and blue for 0 V. Always follow the plant's own standard and the drawings, never assume. Every wire in a good cabinet also carries a printed <b>wire number</b> at both ends that matches the schematic."],
        ["warn", "Mains and motor circuits can kill. Never work on live equipment unless you are trained and authorised. The safe routine is: isolate, lock out and tag out, prove dead with a tested meter, then work. This course teaches programming; wiring and testing power circuits is for qualified persons."],
        ["quiz", {
          q: "A 24 V lamp is rated 12 W. What current does it draw?",
          options: ["0.5 A", "2 A", "288 A", "12 A"],
          answer: 0,
          why: "I = P / V = 12 / 24 = 0.5 A."
        }],
        ["quiz", {
          q: "Why do we switch a motor with a contactor instead of directly from a PLC output?",
          options: [
            "PLC outputs cannot be switched on and off",
            "A PLC output can only carry a small current at 24 V, and the contactor isolates the control circuit from the power circuit",
            "Contactors are faster than outputs",
            "Motors only work with relays"
          ],
          answer: 1,
          why: "The output switches the contactor coil. The contactor's power contacts carry the motor current and keep the two circuits separate."
        }],
        ["quiz", {
          q: "What is the job of the overload relay in the motor circuit?",
          options: [
            "To start the motor smoothly",
            "To open a contact if the motor current stays too high, protecting the motor from overheating",
            "To convert AC to DC",
            "To measure motor speed"
          ],
          answer: 1,
          why: "It is a thermal protection device, and its contact is also fed to the PLC so the program can show a fault."
        }],
        ["try", "Find the rating plate of any motor, pump or fan you can safely see. Write down voltage, current, power (kW) and speed. Then work out what <code>P = &radic;3 &times; V &times; I &times; cos&phi; &times; &eta;</code> says for a three-phase motor, or simply check that the current looks sensible for the kW."]
      ]
    },
    {
      id: "9.2", title: "Relays, contactors and motor starting", minutes: 25,
      blocks: [
        ["p", "Motors are the workhorses of industry: pumps, fans, conveyors, compressors, mixers. Most PLC programs spend their time starting and stopping them, so you should know the hardware that does it, how each starting method behaves and which signals reach the PLC."],
        ["h", "Relay and contactor"],
        ["p", "Both work the same way: current in a coil makes an electromagnet pull a set of contacts closed (or open). A <b>relay</b> switches small loads and often has changeover contacts. A <b>contactor</b> is built for heavy loads, with arc-quenching, and usually has three main (power) contacts plus a few small <b>auxiliary contacts</b>."],
        ["ul", [
          "<b>Coil terminals</b> are marked <code>A1</code> and <code>A2</code>.",
          "<b>Main contacts</b> are numbered <code>1/L1 - 2/T1</code>, <code>3/L2 - 4/T2</code>, <code>5/L3 - 6/T3</code>.",
          "<b>Auxiliary contacts</b>: NO is numbered <code>13-14</code>, NC is <code>21-22</code>. The first digit is the contact number, the second shows NO (3-4) or NC (1-2).",
          "<b>Overload relay</b> uses <code>95-96</code> (NC) and <code>97-98</code> (NO)."
        ]],
        ["note", "A contactor's auxiliary NO contact (13-14) is the best way to give the PLC feedback that the contactor really closed. The PLC output only says the program <i>asked</i> for it."],
        ["h", "Relay outputs versus transistor outputs"],
        ["ul", [
          "<b>Relay output</b>: a small relay inside the module. Switches AC or DC loads, usually up to about 2 A, isolated, slower, wears out. Good for mixed voltages and occasional switching.",
          "<b>Transistor (solid-state) output</b>: usually 24 V DC, around 0.5 A, very fast, no wear. Needed for pulse outputs and fast switching. Cannot switch AC.",
          "On the S7-1200 the type is in the CPU name: <code>DC/DC/DC</code> means DC supply, DC inputs, DC (transistor) outputs; <code>DC/DC/Rly</code> means relay outputs; <code>AC/DC/Rly</code> means mains supply."
        ]],
        ["warn", "Switching a coil (an inductive load) on DC creates a voltage spike when it turns off. Put a <b>flyback (freewheel) diode</b> across DC coils, or use a relay with a built-in suppressor. Many contactors have a suppressor module on the coil. Without it, the spike shortens output life and can reset the CPU."],
        ["h", "Direct-on-line (DOL) starter"],
        ["p", "The simplest starter: a breaker (MPCB), a contactor and an overload relay, exactly the circuit in lesson 9.1. When the contactor closes, the motor sees full voltage at once. The starting current is typically <b>6 to 8 times</b> the running current for a fraction of a second. For small motors this is fine."],
        ["fig", "contactor-wiring", "Real wiring of the DOL idea: a transistor output switches the contactor coil, the contactor switches the motor."],
        ["h", "Star-delta starter"],
        ["p", "For larger motors the inrush is too large. A star-delta starter first connects the three windings in <b>star</b>, giving the motor only about 58 % of line voltage (1/&radic;3), so starting current and torque fall to about one third. After a few seconds a timer switches to <b>delta</b> (full voltage) for normal running."],
        ["ul", [
          "Three contactors: <b>K1</b> (main), <b>K2</b> (star), <b>K3</b> (delta).",
          "K2 and K3 must <b>never</b> be closed together, or you short-circuit the supply. Provide a hardware interlock (mechanical interlock or NC auxiliary contacts) <i>and</i> a software interlock.",
          "Sequence: K1 + K2 on, wait time, K2 off, short pause (about 50 ms), K3 on."
        ]],
        ["sim", {
          title: "Star-delta sequence with interlock",
          inputs: [
            { tag: "Start_PB", addr: "%I0.0", label: "Start", kind: "push" },
            { tag: "Stop_PB", addr: "%I0.1", label: "Stop (NC)", kind: "push", nc: true }
          ],
          outputs: [
            { tag: "K1_Main", addr: "%Q0.0", label: "K1 main", kind: "lamp", color: "#2fb86a" },
            { tag: "K2_Star", addr: "%Q0.1", label: "K2 star", kind: "lamp", color: "#f2b84b" },
            { tag: "K3_Delta", addr: "%Q0.2", label: "K3 delta", kind: "lamp", color: "#4db3e0" },
            { tag: "Motor", addr: "-", label: "Motor running", kind: "motor", color: "#2fb86a" }
          ],
          rungs: [
            { title: "Run request (seal-in, stop wins)", c: [["par", [[["NO", "Start_PB"]], [["NO", "Run"]]]], ["NO", "Stop_PB"]], o: ["coil", "Run"] },
            { title: "Star time 4 s", c: [["NO", "Run"]], o: ["ton", "T_Star", 4000] },
            { title: "Changeover gap 0.5 s after star", c: [["NO", "T_Star.Q"]], o: ["ton", "T_Gap", 500] },
            { title: "K1 main contactor", c: [["NO", "Run"]], o: ["coil", "K1_Main"] },
            { title: "K2 star: while starting, locked out by K3", c: [["NO", "Run"], ["NC", "T_Star.Q"], ["NC", "K3_Delta"]], o: ["coil", "K2_Star"] },
            { title: "K3 delta: after the gap, locked out by K2", c: [["NO", "Run"], ["NO", "T_Gap.Q"], ["NC", "K2_Star"]], o: ["coil", "K3_Delta"] },
            { title: "Motor turns whenever K1 and K2 or K3 is on", c: [["NO", "K1_Main"], ["par", [[["NO", "K2_Star"]], [["NO", "K3_Delta"]]]]], o: ["coil", "Motor"] }
          ]
        }],
        ["p", "Press Start: K1 and K2 come on at once (star). After 4 s K2 drops, there is a 0.5 s gap in which only K1 is on, then K3 closes (delta). The two interlock contacts guarantee that K2 and K3 can never overlap, even if you edit the timers."],
        ["h", "Soft starter and frequency converter"],
        ["ul", [
          "<b>Soft starter</b>: thyristors ramp the voltage up smoothly. Gentle start and stop (pumps, belts). Runs at full speed after the ramp. No speed control.",
          "<b>Variable frequency drive (VFD)</b>: converts the supply to a variable frequency and voltage, so the speed can be set anywhere from near zero to above nominal. It also protects the motor, and is commanded over PROFINET (module 6) or by analog and digital signals.",
          "Use DOL for small or rarely started motors, star-delta or soft starter for large fixed-speed motors, VFD when speed matters or energy savings (pumps and fans) are wanted."
        ]],
        ["quiz", {
          q: "Why are K2 (star) and K3 (delta) interlocked?",
          options: [
            "To make the motor start faster",
            "If both close together they short-circuit the supply lines",
            "The timer needs them",
            "To reduce the noise"
          ],
          answer: 1,
          why: "Star and delta connect the windings in incompatible ways. Both together create a short circuit, so both hardware and software must prevent it."
        }],
        ["quiz", {
          q: "Which auxiliary contact numbering is a normally open contact?",
          options: ["21-22", "13-14", "95-96", "A1-A2"],
          answer: 1,
          why: "Ending digits 3-4 mark a normally open contact (13-14). 1-2 endings (21-22, 95-96) are normally closed. A1/A2 is the coil."
        }],
        ["quiz", {
          q: "You need to control a pump's flow smoothly between 30 % and 100 % speed. Which starter?",
          options: ["Direct-on-line", "Star-delta", "Soft starter", "Variable frequency drive"],
          answer: 3,
          why: "Only a VFD changes the running speed. DOL, star-delta and soft starters start the motor but then run it at line speed."
        }],
        ["try", "In the star-delta simulator, work out what would happen if you removed the two interlock contacts and set T_Gap to 0. Then explain, in a sentence, which hardware would have to protect you."]
      ]
    },
    {
      id: "9.3", title: "Sensors in depth", minutes: 25,
      blocks: [
        ["p", "A control system can only act on what it can measure. Sensors are the PLC's eyes and ears, and most real-world faults are not in the program but in a dirty lens, a misaligned bracket or a wire that came loose. Knowing how sensors work tells you where to look."],
        ["h", "Digital (on/off) sensors"],
        ["ul", [
          "<b>Limit switch / mechanical switch</b>: a lever or plunger moves a contact. Cheap, robust, wears out.",
          "<b>Inductive proximity</b>: detects <b>metal</b> without touching, up to a few millimetres. Very common, immune to dirt and oil.",
          "<b>Capacitive proximity</b>: detects almost any material, including liquids and plastic. Used for level through a tank wall.",
          "<b>Photoelectric</b>: light beam. <i>Through-beam</i> (separate emitter and receiver, longest range, most reliable), <i>retro-reflective</i> (reflector on the far side) and <i>diffuse</i> (light bounces off the object, short range, colour dependent).",
          "<b>Ultrasonic and radar</b>: measure distance by echo, even to liquids or soft objects.",
          "<b>Magnetic (reed / Hall)</b>: detect a magnet in a pneumatic cylinder piston (lesson 9.4)."
        ]],
        ["h", "Three-wire sensors: PNP and NPN"],
        ["p", "Most electronic sensors have three wires: <b>brown = +24 V</b>, <b>blue = 0 V</b>, <b>black = signal</b> (IEC 60947-5-2 colours). The difference between PNP and NPN is what the signal wire does when the sensor switches."],
        ["fig", "pnp-npn", "PNP sensors switch +24 V onto the signal wire; NPN sensors connect it to 0 V."],
        ["fig", "cpu1214-terminals", "The terminal blocks of an S7-1200 CPU 1214C (covers open). Learn where L+, M, 1M and the inputs are."],
        ["fig", "prox-wiring", "A PNP sensor wired to %I0.0, with 1M jumpered to M."],
        ["ul", [
          "<b>PNP (sourcing)</b>: output goes to +24 V when active. The usual choice in Europe.",
          "<b>NPN (sinking)</b>: output goes to 0 V when active. More common in Asia and with sourcing input modules.",
          "S7-1200/1500 digital input modules accept either, depending on how the module's common (1M) is wired. If a sensor never switches, check PNP/NPN before blaming the program."
        ]],
        ["h", "NO or NC sensor output?"],
        ["p", "Sensors come with normally open (NO) or normally closed (NC) outputs, selected by model or a wire. For safety-relevant signals use <b>NC logic</b> (a signal that is 1 when healthy), so a broken wire or a dead sensor looks like a fault rather than a silent, valid 'not detected'. This is the same fail-safe thinking as the NC stop button."],
        ["h", "Analog sensors"],
        ["p", "Measuring quantities such as pressure, level, flow and temperature needs a signal that varies continuously. The three common standards:"],
        ["ul", [
          "<b>4 to 20 mA</b> (current loop): the industrial favourite. Immune to wire resistance and noise, works over long cables, can power the sensor itself (two-wire).",
          "<b>0 to 10 V</b> (voltage): simple and cheap, but loses accuracy over long cables and is noise sensitive.",
          "<b>Special inputs</b>: Pt100 (RTD) and thermocouple modules for temperature, strain-gauge modules for load cells."
        ]],
        ["fig", "loop-420", "4 mA is 0 % and 20 mA is 100 %. A current of 0 mA can only mean a broken wire."],
        ["p", "The <b>live zero</b> (4 mA = 0 %) is a clever trick. A wire break gives 0 mA, which is outside the valid range, so the module can raise a fault (it typically reports wire break under about 3.6 mA, depending on the module and its setting). A 0 to 20 mA signal could not tell 'zero pressure' from 'cable cut'."],
        ["p", "In a Siemens analog input the current is converted so that <code>4 mA = 0</code> and <code>20 mA = 27648</code>. This is the <code>NORM_X / SCALE_X</code> scaling you practised in lesson 4.2."],
                ["sim", {
          title: "4 to 20 mA to engineering units (0 to 10 bar) with wire-break detection",
          inputs: [{ tag: "Current_mA", addr: "%IW64", label: "Loop current", kind: "slider", min: 0, max: 24, step: 0.5, init: 12, unit: "mA" }],
          outputs: [
            { tag: "Wire_Break", addr: "%Q0.0", label: "Wire break (below 3.6 mA)", kind: "lamp", color: "#f2554b" },
            { tag: "Overrange", addr: "%Q0.1", label: "Above 20.5 mA", kind: "lamp", color: "#f2b84b" }
          ],
          rungs: [
            { title: "Normalise 4 to 20 mA to 0.0 to 1.0 (only if the signal is valid)", c: [["CMP", ">=", "Current_mA", 3.6, "Real"]], o: ["norm", "Current_mA", 4, 20, "Norm"] },
            { title: "Scale to 0 to 10 bar", c: [["CMP", ">=", "Current_mA", 3.6, "Real"]], o: ["scale", "Norm", 0, 10, "Pressure_bar"] },
            { title: "Wire break", c: [["CMP", "<", "Current_mA", 3.6, "Real"]], o: ["coil", "Wire_Break"] },
            { title: "Overrange", c: [["CMP", ">", "Current_mA", 20.5, "Real"]], o: ["coil", "Overrange"] }
          ]
        }],
        ["p", "Drag the slider to 0 mA: the pressure is not 'zero bar', it is a <i>fault</i>. At 12 mA you read half of the range."],
        ["h", "Temperature sensing"],
        ["ul", [
          "<b>Pt100</b>: a platinum resistor of 100 &Omega; at 0 &deg;C that rises to about 138.5 &Omega; at 100 &deg;C. Accurate and stable. Use 3-wire or 4-wire connection so lead resistance does not add error.",
          "<b>Thermocouple (types K, J, ...)</b>: two dissimilar metals produce a few millivolts that depend on temperature. Wide range (to 1000 &deg;C and more), fast, less accurate, needs cold-junction compensation and the correct thermocouple extension cable."
        ]],
        ["h", "Position and speed: encoders"],
        ["ul", [
          "<b>Incremental encoder</b>: gives pulses on tracks A and B (90&deg; apart so direction is known) and a zero mark Z. Position is counted from where it was powered, so a reference run is needed.",
          "<b>Absolute encoder</b>: reports its exact position at all times, even after power loss (SSI, PROFINET, etc.).",
          "Fast pulses need a <b>high-speed counter</b> (HSC) input; ordinary inputs and the scan time are far too slow. See module 10."
        ]],
        ["quiz", {
          q: "Why is a 4 to 20 mA signal preferred over 0 to 20 mA?",
          options: [
            "It uses less power",
            "A reading of 0 mA can only mean a wire break or power loss, so faults are detectable",
            "It is more precise",
            "PLCs cannot read 0 mA"
          ],
          answer: 1,
          why: "The live zero separates a real minimum value (4 mA) from a failed circuit (about 0 mA)."
        }],
        ["quiz", {
          q: "A pressure transmitter outputs 12 mA, range 0 to 10 bar. What pressure is it measuring?",
          options: ["3 bar", "5 bar", "6 bar", "8 bar"],
          answer: 1,
          why: "(12 - 4) / (20 - 4) = 0.5, so 50 % of 10 bar = 5 bar."
        }],
        ["quiz", {
          q: "An inductive proximity sensor is installed over a plastic part on a conveyor. What happens?",
          options: ["It detects the part normally", "It does not detect it: inductive sensors respond to metal", "It detects only when wet", "It always outputs 1"],
          answer: 1,
          why: "Use a capacitive or photoelectric sensor for non-metallic parts."
        }],
        ["try", "Take a 4 to 20 mA level transmitter spanning 0 to 3 m. Calculate the level for 6.4 mA, 12 mA and 19.2 mA by hand, then check with the NORM_X/SCALE_X simulator in lesson 4.2 (use raw values 4320, 13824 and 26265)."]
      ]
    },
    {
      id: "9.4", title: "Actuators: pneumatics, hydraulics, valves", minutes: 25,
      blocks: [
        ["p", "Actuators turn PLC decisions into physical action. Motors you know. The other big family on a machine is <b>fluid power</b>: compressed air (pneumatics) and pressurised oil (hydraulics). Most packaging, assembly and handling machines move with air cylinders."],
        ["h", "Pneumatics in one page"],
        ["ul", [
          "A compressor supplies air at about 6 bar. A <b>filter-regulator-lubricator</b> (FRL) unit cleans and regulates it.",
          "A <b>cylinder</b> converts air pressure into a straight push or pull. <i>Single-acting</i> cylinders use a spring to return; <i>double-acting</i> ones are driven by air in both directions.",
          "A <b>directional valve</b> routes the air. It is named by ports/positions: a <b>5/2</b> valve has five ports and two positions; a <b>3/2</b> valve has three ports and two positions.",
          "<b>Solenoid</b> valves are switched electrically (24 V DC). <i>Single-solenoid, spring return</i> is monostable: power off and the valve returns to its home position. <i>Double-solenoid</i> valves are bistable: they stay in the last position until the other coil is energised.",
          "<b>Flow-control (throttle) valves</b> set the cylinder speed. Throttling the <i>exhaust</i> air (meter-out) gives smoother motion than throttling the supply.",
          "<b>Magnetic sensors</b> on the cylinder body detect the piston magnet and give the PLC the end positions."
        ]],
        ["fig", "cylinder-valve", "A single-solenoid 5/2 valve drives a double-acting cylinder. Two sensors report the end positions."],
        ["h", "Valve safety: what happens on power failure?"],
        ["p", "When the 24 V disappears or the PLC stops, a spring-return valve goes to its home position by itself. A double-solenoid valve stays where it was. Decide per machine which is safe: a clamp that opens on power loss may drop the part; a clamp that stays closed may trap a hand. This is a <b>fail-safe design decision</b>, not a programming detail."],
        ["h", "Program the cylinder"],
        ["p", "The ladder is short: the solenoid <code>Y1</code> follows a request, and the sensors confirm the motion. Use the simulator: press and hold Extend, release it and the spring returns the piston."],
        ["sim", {
          title: "Single-solenoid cylinder with position sensors",
          plant: "cylinder",
          inputs: [{ tag: "Extend_PB", addr: "%I0.0", label: "Extend (hold)", kind: "push" }],
          outputs: [{ tag: "Y1", addr: "%Q0.0", label: "Y1 extend solenoid", kind: "lamp", color: "#ffbf1f" }],
          sensors: [
            { tag: "B1", addr: "%I0.1", label: "B1 retracted (back)" },
            { tag: "B2", addr: "%I0.2", label: "B2 extended (front)" }
          ],
          rungs: [
            { title: "Extend while the button is held", c: [["NO", "Extend_PB"]], o: ["coil", "Y1"] },
            { title: "(info) Both sensors on at once would mean a sensor fault", c: [["NO", "B1"], ["NO", "B2"]], o: ["coil", "Sensor_Fault"] }
          ]
        }],
        ["note", "Rung 2 shows a standard professional check: two sensors that physically exclude each other cannot both be 1. If they are, a sensor is stuck or mis-wired, so alarm it."],
        ["h", "Hydraulics in brief"],
        ["ul", [
          "A pump pushes oil at <b>100 to 350 bar</b> into cylinders and motors. Huge force from a small package: presses, injection moulding machines, lifts, heavy mobile equipment.",
          "Valves are directional and proportional. <b>Proportional valves</b> take a 0 to 10 V or 4 to 20 mA command, so oil flow is controlled smoothly; a PLC analog output drives them.",
          "Needs a tank, filters, cooler and careful maintenance. Leaks are messy and pressure is dangerous: depressurise before opening any line."
        ]],
        ["h", "Process valves"],
        ["ul", [
          "<b>On/off valve</b>: open or closed. Usually a solenoid pilot valve plus a position-feedback switch for open and closed.",
          "<b>Control valve</b>: positions anywhere from 0 to 100 % in response to 4 to 20 mA. It is the 'output' of a PID loop (module 7). It has a defined <b>fail position</b> on signal loss: fail-open or fail-closed, chosen for safety (a cooling-water valve fails open, a fuel valve fails closed).",
          "Always ask: what is the safe state, and does the hardware or the program provide it?"
        ]],
        ["quiz", {
          q: "A single-solenoid, spring-return 5/2 valve drives a cylinder. The solenoid loses power. What happens?",
          options: ["The cylinder stays where it was", "The spring returns the valve to its home position and the cylinder moves back", "The cylinder extends fully", "Nothing: valves have no springs"],
          answer: 1,
          why: "A monostable valve returns to home when de-energised, which is the whole point of the spring."
        }],
        ["quiz", {
          q: "Why should a sequence wait for a cylinder sensor instead of a fixed time?",
          options: [
            "Sensors are cheaper than timers",
            "The cylinder may be slow, blocked or faulty; confirming the real position keeps the sequence correct and detects faults",
            "Timers do not work in sequences",
            "PLCs cannot measure time accurately"
          ],
          answer: 1,
          why: "A timer only assumes the movement happened. A sensor proves it, and the absence of a sensor signal within a timeout is a useful alarm."
        }],
        ["quiz", {
          q: "A control valve in a cooling-water line must stay open if the signal cable breaks. Which fail position?",
          options: ["Fail-closed", "Fail-open", "Fail-last-position", "It does not matter"],
          answer: 1,
          why: "Cooling must continue on failure, so the valve must be fail-open."
        }],
        ["try", "Add a timeout to the cylinder: if Y1 has been on for more than 3 s and B2 is still 0, set a Cyl_Fault bit and turn Y1 off. Which timer do you need, and what resets the fault?"]
      ]
    },
    {
      id: "9.5", title: "Reading schematics and P&IDs", minutes: 25,
      blocks: [
        ["p", "Every machine comes with drawings. The electrical <b>schematic</b> shows how it is wired; the <b>I/O list</b> maps each wire to a PLC address; on a process plant the <b>P&amp;ID</b> shows pipes, vessels and instruments. A PLC engineer who cannot read them is guessing. Reading them well makes you fast at finding faults."],
        ["h", "Electrical schematic basics"],
        ["ul", [
          "Drawn with standard symbols (IEC 60617): contacts, coils, breakers, motors, lamps, push buttons.",
          "Power circuits and control circuits are drawn on separate sheets. Power is read top to bottom: supply, breaker, contactor, overload, motor.",
          "Control circuits are drawn as <b>ladder-style</b> rungs between two vertical lines: 24 V on the left, 0 V on the right. Exactly like PLC ladder, which is no accident.",
          "Each device has a <b>device tag</b> (K1, S1, B3) shown next to the symbol and a <b>cross-reference</b> at the coil listing where its contacts are used (sheet and column).",
          "Each terminal has a number (X1:5) and each wire has a wire number."
        ]],
        ["fig", "tag-naming", "Device letters tell you what a thing is at a glance. Instruments on P&IDs follow ISA 5.1."],
        ["h", "The I/O list"],
        ["p", "The I/O list is the bridge between wiring and software. A good one has one row per signal:"],
        ["code", "Address   Tag            Description            Type   Terminal  Range/State\n%I0.0      Start_PB       Start push button      DI     X1:5      NO\n%I0.1      Stop_PB        Stop push button       DI     X1:6      NC (1 = healthy)\n%I0.2      Overload_OK    Overload relay F1      DI     X1:7      NC (1 = healthy)\n%Q0.0      K1_Main        Contactor K1 coil      DO     X2:3      24 V DC\n%IW64      Tank_Level     Level LT-101           AI     X3:1,2    4-20 mA = 0-3 m", "I/O list excerpt"],
        ["p", "Use it three ways: to create the tag table, to check wiring during commissioning (lesson 9.6) and to find a fault from the tag name down to a terminal."],
        ["h", "Process and instrumentation diagrams (P&ID)"],
        ["p", "A P&amp;ID is the 'map' of a process plant. Symbols show tanks, pumps, valves and lines; circles show instruments. The tag in the circle is read letter by letter (ISA 5.1): the <b>first letter</b> is the measured variable, the <b>following letters</b> the function."],
        ["ul", [
          "<b>First letters</b>: L level, P pressure, T temperature, F flow, A analysis, S speed.",
          "<b>Following letters</b>: I indicator, T transmitter, C controller, S switch, V valve, A alarm, Y relay/compute, E element (primary sensor).",
          "<b>LIC-101</b>: level indicating controller, loop 101. <b>FT-205</b>: flow transmitter, loop 205. <b>PSH-310</b>: pressure switch, high. <b>TV-402</b>: temperature control valve."
        ]],
        ["note", "Use the loop number in your PLC tag names and your HMI (for example <code>LT101_Level</code>, <code>LV101_Out</code>). Operators, instrument technicians and programmers then all speak the same language."],
        ["h", "Tracing a fault in a drawing"],
        ["p", "Suppose conveyor motor M1 will not run although the HMI shows 'running'. Work through the chain systematically, from the program towards the field:"],
        ["ul", [
          "Is the PLC output Q0.0 on (watch table or LED on the module)?",
          "Is there 24 V at the K1 coil terminals A1/A2? If not: terminal, wire, fuse, suppressor.",
          "Is K1 pulled in? Does its auxiliary contact give feedback?",
          "Is there voltage at the K1 output terminals T1/T2/T3? If not: contactor contacts. If yes:",
          "Is the overload relay F1 tripped, or the motor breaker Q1 off?",
          "Motor and cable last: insulation, connections, mechanical jam."
        ]],
        ["quiz", {
          q: "On a P&amp;ID you see an instrument circle labelled <code>FIC-205</code>. What is it?",
          options: ["Flow indicating controller, loop 205", "Frequency inverter controller", "Fire indicator contact", "Fixed input channel 205"],
          answer: 0,
          why: "F = flow, I = indicating, C = controller, 205 = loop number."
        }],
        ["quiz", {
          q: "In an IEC-style schematic, which device letter marks a sensor or transducer?",
          options: ["-Q", "-B", "-K", "-H"],
          answer: 1,
          why: "-B is for sensors and transducers. -Q is a breaker, -K a contactor/relay, -H a lamp or horn."
        }],
        ["try", "Sketch the control schematic for the star-delta starter in lesson 9.2 with 24 V on the left and 0 V on the right: Start and Stop buttons, K1, K2, K3 with their interlock contacts and the timer. Compare it with the ladder in the simulator."]
      ]
    },
    {
      id: "9.6", title: "Commissioning checks and safe testing", minutes: 20,
      blocks: [
        ["p", "Commissioning is when software meets hardware, and it is where most mistakes show up. Wrong wire, wrong address, sensor inverted, motor running backwards: all normal. A professional works through a <b>checklist</b> so that nothing is missed and nothing is energised that should not be."],
        ["h", "The order of work"],
        ["ul", [
          "<b>1. Dead checks</b>: with the power off, check continuity, earthing, insulation and that every wire is on the terminal the drawing says. Nothing is energised.",
          "<b>2. Energise the control supply only</b>: 24 V present? Polarity right? Is the PLC alive with no errors on the diagnostic LEDs?",
          "<b>3. Input checks</b>: operate each sensor and button by hand and watch the bit in a <b>watch table</b>. Does the right tag change? Is NO/NC as expected?",
          "<b>4. Output checks with the power circuit isolated</b>: force each output, listen for the contactor, check the signal arrives at the field device. Motors are still disconnected or locked out.",
          "<b>5. Safety functions</b>: prove every emergency stop and light curtain actually removes power or stops motion. Never trust that it does.",
          "<b>6. Power circuits on</b>: check motor rotation direction (swap two phases if wrong), then run each drive on its own, unloaded.",
          "<b>7. Dry run of the sequence</b> without product, then with product, then at full speed."
        ]],
        ["h", "TIA Portal tools for commissioning"],
        ["ul", [
          "<b>Watch table</b>: a list of tags with live values (monitor) and the option to write a value once (<i>modify</i>). It does not stop the program from overwriting the value in the next scan.",
          "<b>Force table</b>: <b>forces</b> a physical input or output to a fixed value, regardless of the program, until the force is released. Very powerful, very dangerous.",
          "<b>Online &amp; diagnostics</b>: shows the device state, the diagnostic buffer and module errors (lesson 8.1)."
        ]],
        ["click", "Project tree > <your PLC> > Watch and force tables > Add new watch table", "In TIA Portal"],
        ["warn", "<b>Forcing</b> an output overrides the program and any interlock written in it. A forced contactor stays closed even if the guard door opens. Use forces only when the area is safe, tell everyone, mark the cabinet, and remove every force before handing over. An unrecorded force left in a CPU has caused real accidents. Check the force table at every handover."],
                ["sim", {
          title: "Why forcing is dangerous: the force overrides the interlock",
          inputs: [
            { tag: "Run_Cmd", addr: "%I0.0", label: "Run command", kind: "switch" },
            { tag: "Guard_Closed", addr: "%I0.1", label: "Guard door closed", kind: "switch", init: true },
            { tag: "Force_On", addr: "-", label: "Force table: force %Q0.0 = TRUE", kind: "switch" }
          ],
          outputs: [{ tag: "Motor_Q", addr: "%Q0.0", label: "Motor contactor", kind: "motor", color: "#f2554b" }],
          rungs: [
            { title: "Program logic: run only with the guard closed", c: [["NO", "Run_Cmd"], ["NO", "Guard_Closed"]], o: ["coil", "Motor_Logic"] },
            { title: "What the physical output really does (program OR force)", c: [["par", [[["NO", "Motor_Logic"]], [["NO", "Force_On"]]]]], o: ["coil", "Motor_Q"] }
          ]
        }],
        ["p", "Open the guard door and set Run: the motor stops, as designed. Now switch the force on: the motor runs with the door open. The program is correct, but the force makes it irrelevant."],
        ["h", "Loop check"],
        ["p", "For each analog instrument, a <b>loop check</b> proves the whole chain: the instrument technician simulates 0 %, 50 % and 100 % at the transmitter (or with a loop calibrator injecting 4, 12 and 20 mA) and the programmer confirms the value on the HMI follows. For an output, drive the control valve to 0 %, 50 % and 100 % and check it at the valve. Record every result on a signed sheet."],
        ["code", "Loop:  LT-101 tank level\nRange: 0 - 3.0 m   (4-20 mA)\nStep   Injected   Expected   PLC (raw)   HMI      Pass\n 0 %    4.0 mA     0.00 m     0           0.00 m   [ ]\n50 %   12.0 mA     1.50 m    13824        1.50 m   [ ]\n100 %  20.0 mA     3.00 m    27648        3.00 m   [ ]", "Loop check sheet"],
        ["h", "Motor rotation and mechanical checks"],
        ["ul", [
          "Check the direction with the motor <b>uncoupled</b> or with a brief 'bump' start. A pump running backwards can damage the seal.",
          "To reverse a three-phase motor, swap any two of the three phases. Never do it live.",
          "Check that mechanical stops and hard limits stop motion safely if a sensor fails."
        ]],
        ["h", "Document as you go"],
        ["p", "Note every wiring correction on the drawings in red, every setting change in the project and every test on the checklist. The Site Acceptance Test (lesson 8.4) will ask for exactly these records."],
        ["quiz", {
          q: "What is the key danger of forcing an output in the force table?",
          options: [
            "It slows the CPU",
            "The output is fixed regardless of the program, so interlocks and safety logic cannot switch it off",
            "It deletes the program",
            "It only works in RUN mode"
          ],
          answer: 1,
          why: "A force overrides the program. Use it only in a prepared, safe situation and always remove it afterwards."
        }],
        ["quiz", {
          q: "In what order should commissioning proceed?",
          options: [
            "Run the full sequence first, then check the wiring",
            "Dead checks, control supply, inputs, outputs with power isolated, safety functions, power circuits, sequence",
            "Power circuits first, then inputs",
            "Safety functions last, after production starts"
          ],
          answer: 1,
          why: "Work from the safest, simplest checks to the most dangerous, and prove safety functions before running anything with product."
        }],
        ["try", "Write a one-page commissioning checklist for a small conveyor with one motor, a start button, an e-stop and a photo sensor, following the seven steps above."]
      ]
    }
  ]
});
