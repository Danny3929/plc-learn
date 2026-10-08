window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 6,
  title: "6 · Networks and communication",
  lessons: [
    {
      id: "6.1", title: "PROFINET and IP addressing", minutes: 20,
      blocks: [
        ["p", "Modern PLC systems are networks. Your CPU talks to I/O stations, drives, HMIs and your laptop, all over <b>Ethernet</b>. Siemens' industrial flavour is <b>PROFINET</b>: standard Ethernet cabling and switches, with a real-time protocol on top."],
        ["fig", "profinet-topology", "A small PROFINET network. Every device has an IP address and a PROFINET device name."],
        ["h", "Roles in PROFINET"],
        ["ul", [
          "<b>IO controller</b>: the device that controls I/O, normally the PLC CPU.",
          "<b>IO device</b>: a field device that provides I/O: ET 200SP stations, drives, valve terminals.",
          "<b>IO supervisor</b>: an engineering tool, such as TIA Portal on your PC, used to configure and diagnose."
        ]],
        ["h", "Two names for each device"],
        ["ul", [
          "<b>IP address</b>, like <code>192.168.0.1</code>: how devices find each other on the network.",
          "<b>PROFINET device name</b>, like <code>io-rack1</code>: how the controller identifies which physical device is which. The controller then gives that device its IP address at start-up."
        ]],
        ["p", "Names must be <b>unique</b> and lower case with no spaces. A new or replaced device has no name until you assign one (in TIA Portal: right-click the device in the Network view, <i>Assign device name</i>)."],
        ["h", "IP addresses and subnets in 60 seconds"],
        ["p", "An IPv4 address has four numbers (0 to 255). A <b>subnet mask</b> tells which part identifies the network and which part identifies the device. With mask <code>255.255.255.0</code>, the first three numbers are the network; the last is the device. Two devices can talk directly only if they share the same network part."],
        ["subnet", { title: "IP subnet checker" }],
        ["p", "Common beginner failure: your PC is <code>192.168.0.10</code> and the PLC is <code>192.168.1.1</code>. Different subnets, so TIA Portal cannot find the PLC. Fix it by changing your PC's adapter address (or the PLC's) so the first three numbers match."],
        ["h", "In TIA Portal"],
        ["click", "Device view > select the CPU > Properties > General > PROFINET interface [X1] > Ethernet addresses"],
        ["p", "Set the IP address and subnet mask here. This only describes the plan: to put the address into a real CPU, download it or use <i>Online &amp; diagnostics &gt; Functions &gt; Assign IP address</i>."],
        ["warn", "Duplicate IP addresses cause intermittent chaos: devices appear and disappear. Keep an IP and name list for the plant and never reuse an address."],
        ["quiz", {
          q: "PC is 192.168.0.10, PLC is 192.168.0.25, mask 255.255.255.0. Can they talk directly?",
          options: ["No, different networks", "Yes, same subnet", "Only with a router", "Only through the internet"],
          answer: 1,
          why: "The first three numbers (192.168.0) match, so both are in the same network."
        }],
        ["try", "Use the checker above. Find a pair of addresses that is in the same /25 subnet (mask 255.255.255.128) but would be different under /26. Write them down in your notes."]
      ]
    },
    {
      id: "6.2", title: "Distributed I/O with ET 200SP", minutes: 20,
      blocks: [
        ["p", "Instead of wiring every sensor back to the PLC cabinet, you can place small I/O stations <b>near the machine</b> and connect them with one network cable. That is <b>distributed I/O</b>, and it saves metres of wiring and a lot of commissioning time."],
        ["fig", "et200sp", "An ET 200SP station: a head module, I/O modules on base units, and a server module at the end."],
        ["ul", [
          "The <b>interface (head) module</b>, for example IM 155-6 PN, talks PROFINET to the controller.",
          "<b>Base units</b> carry the terminals. <b>I/O modules</b> plug into them and can be exchanged without rewiring.",
          "A <b>server module</b> closes the backplane bus at the right-hand end."
        ]],
        ["h", "Add one to the project"],
        ["click", "Project tree > Add new device > Distributed I/O > ET 200SP > Interface modules > PROFINET > IM 155-6 PN > Add"],
        ["p", "Then, in the <b>Network view</b>, drag from the green PROFINET port of the IO device to the controller's port. The station is now assigned to the CPU. Open its <b>Device view</b> and drag the I/O modules from the hardware catalog into the slots, in the same order as the real rack."],
        ["h", "What happens to addresses"],
        ["p", "Each module gets I/O addresses automatically, e.g. a DI 8 might be <code>%I8.0</code> to <code>%I8.7</code>. From the program's point of view this is no different from the CPU's own inputs. You create tags for them in the tag table as usual."],
        ["note", "Pay attention to <b>module order, count and types</b> in the configuration. If the real station differs from the configured one, the CPU raises diagnostics and the module (or the whole station) can refuse to run."],
        ["h", "Practical points"],
        ["ul", [
          "<b>Update time</b>: how often the IO device exchanges data. A default of about 1 to 4 ms is fine for most I/O; fast drives may need shorter.",
          "<b>Device replacement without a PG</b>: with the topology configured (which port connects to which), a CPU can give a new, unnamed device its name automatically.",
          "<b>Diagnostics</b>: a failed station raises a diagnostic event (OB82 or similar). Decide what the program should do.",
          "<b>Shared device / I/O with multiple controllers</b> exists but is an advanced topic."
        ]],
        ["quiz", {
          q: "Which module of an ET 200SP station talks PROFINET to the controller?",
          options: ["The server module", "The interface (head) module", "Any I/O module", "The base unit"],
          answer: 1,
          why: "The interface module (e.g. IM 155-6 PN) is the station's network connection."
        }],
        ["try", "Add an ET 200SP to your project with one DI and one DQ module. Connect it to the CPU in the Network view and check the I/O addresses it was given."]
      ]
    },
    {
      id: "6.3", title: "Modbus TCP, OPC UA and open communication", minutes: 25,
      blocks: [
        ["p", "Not everything speaks PROFINET. Meters, instruments, PCs, other brands of PLC, and IT systems use other protocols. Know the main ones and when to choose each."],
        ["fig", "protocol-map", "Pick the protocol by who you are talking to."],
        ["h", "Modbus TCP"],
        ["p", "Modbus is old, simple and everywhere. Data is organised as numbered <b>registers</b>: coils (single bits) and holding registers (16-bit words). The <b>client</b> asks, the <b>server</b> answers. On S7-1200/1500 the instruction blocks are <code>MB_CLIENT</code> and <code>MB_SERVER</code>."],
        ["scl", "// Read 2 holding registers starting at address 40001 from a remote device\n// #conn : \"TCON_IP_v4\" holds the partner IP address and port 502\n\"MB_CLIENT_DB\"(REQ := #request,\n               DISCONNECT := FALSE,\n               MB_MODE := 0,            // 0 = read, 1 = write\n               MB_DATA_ADDR := 40001,   // first holding register\n               MB_DATA_LEN := 2,\n               MB_DATA_PTR := #buffer,  // Array of Word\n               CONNECT := #conn,\n               DONE => #done,\n               BUSY => #busy,\n               ERROR => #error,\n               STATUS => #status);", "Reading Modbus registers"],
        ["ul", [
          "Raise <code>REQ</code> with a pulse to start a job. <code>BUSY</code> tells you it is running, <code>DONE</code> that it finished, <code>ERROR</code> and <code>STATUS</code> explain failures. Never ignore <code>STATUS</code>.",
          "<b>Address pitfalls</b>: vendors document registers starting at 0 or at 1, and sometimes with the 4xxxx offset. If your values are off by one register, this is why. Read the partner's manual.",
          "32-bit values (floats) span two registers. The <b>word order</b> varies between devices: swap if the number looks absurd."
        ]],
        ["h", "OPC UA"],
        ["p", "<b>OPC UA</b> is the modern, vendor-neutral way to expose PLC data to IT systems: SCADA, MES, historians, cloud gateways. Unlike Modbus, values have names, types and structure, and the connection is secured with certificates."],
        ["ul", [
          "Enable the server in the CPU properties (<i>OPC UA &gt; Server &gt; Activate</i>) on CPUs that support it. On the S7-1200 the OPC UA server needs firmware V4.4 or newer <b>and a runtime licence per CPU</b>. The S7-1500 and the newer S7-1200 G2 have their own requirements, so check the documentation for your CPU and firmware.",
          "Mark the variables you want to publish as accessible (the same <i>Accessible from HMI/OPC UA/Web API</i> attribute you met in lesson 5.1).",
          "Test with a free OPC UA client such as UaExpert before connecting the real consumer."
        ]],
        ["h", "Open user communication (TCP/UDP)"],
        ["p", "When a partner defines its own byte format (a barcode reader, a weighing scale, a PC program), use the <b>open user communication</b> blocks such as <code>TSEND_C</code> and <code>TRCV_C</code>. You define the frame, so you must handle start and end markers, conversions and timeouts yourself."],
        ["h", "Choosing"],
        ["ul", [
          "I/O stations and drives: <b>PROFINET</b>.",
          "Another Siemens device: <b>S7 communication</b> (check access protection settings).",
          "Cheap third-party instrument with a register map: <b>Modbus TCP</b>.",
          "SCADA, MES and anything IT: <b>OPC UA</b>.",
          "A device with its own message format: <b>open TCP</b>."
        ]],
        ["warn", "Every network service you enable is an attack surface. Turn on only what you use, and only on the network segment that needs it (lesson 8.3)."],
        ["quiz", {
          q: "A SCADA package needs typed, named, secured data from a PLC. Which protocol is best?",
          options: ["Modbus TCP", "OPC UA", "PROFINET IO", "Raw UDP"],
          answer: 1,
          why: "OPC UA carries typed, structured, named data with certificate-based security, the standard IT/OT interface."
        }],
        ["quiz", {
          q: "Your Modbus reading is consistently one register off. What is the most likely cause?",
          options: ["A broken cable", "Register numbering starts at 0 in one place and 1 in another", "The PLC is too slow", "Wrong subnet mask"],
          answer: 1,
          why: "Documentation and software disagree about whether register numbers start at 0 or 1 (and about the 4xxxx offset)."
        }]
      ]
    },
    {
      id: "6.4", title: "Drives over PROFINET", minutes: 25,
      blocks: [
        ["p", "Motors in modern plants are driven by <b>frequency converters</b> (drives) such as the Siemens SINAMICS family. You rarely wire speed with analog signals now. Instead the PLC sends the drive a <b>control word</b> and a <b>speed setpoint</b> over PROFINET, and the drive reports back a <b>status word</b> and the <b>actual speed</b>."],
        ["fig", "profidrive", "PROFIdrive telegram 1: the simplest speed-control message, two words each way."],
        ["h", "Setting it up"],
        ["note", "Parameter names: in SINAMICS, <b>p</b> parameters are adjustable (for example p1120 ramp-up time) and <b>r</b> parameters are read-only values (for example r0027 output current). You will see both in Startdrive and on the operator panel."],
        ["ul", [
          "Add the drive to the project (<b>Startdrive</b> is the TIA Portal add-on for configuring SINAMICS drives).",
          "Connect it to the CPU in the Network view and set its telegram type (for speed control, <i>standard telegram 1</i>).",
          "Commission the motor data in the drive. This is the drive's job; the PLC does not need it.",
          "In the PLC, use the telegram's I/O addresses: a word out for the control word, a word out for the setpoint, and two words in."
        ]],
        ["h", "The control word"],
        ["p", "The control word (<code>STW1</code>) is a 16-bit word where each bit is a command. Build one below. Names follow the standard Siemens telegram 1; always confirm against the manual of your drive."],
        ["bits", {
          title: "STW1: control word builder",
          word: "STW1",
          width: 16,
          initial: 0x047E,
          sub: "Click bits to flip them, or load a preset",
          bits: [
            { n: 0, name: "ON / OFF1 (1 = run, 0 = ramp down and stop)" },
            { n: 1, name: "No OFF2 (1 = normal, 0 = coast to a stop)" },
            { n: 2, name: "No OFF3 (1 = normal, 0 = fast emergency ramp)" },
            { n: 3, name: "Enable operation" },
            { n: 4, name: "Do not disable the ramp-function generator (RFG)" },
            { n: 5, name: "Enable RFG (ramp output follows the setpoint; 0 = freeze)" },
            { n: 6, name: "Enable setpoint (0 = ramp down)" },
            { n: 7, name: "Acknowledge fault (0 to 1 edge)" },
            { n: 10, name: "Control by PLC (must be 1)" },
            { n: 11, name: "Reverse direction" }
          ],
          presets: [
            { label: "Ready (stopped) 047E", value: 0x047E },
            { label: "Run 047F", value: 0x047F },
            { label: "Coast stop (OFF2) 047D", value: 0x047D },
            { label: "Fault acknowledge 04FE", value: 0x04FE },
            { label: "All off 0000", value: 0 }
          ]
        }],
        ["p", "Normal operation: <code>16#047E</code> (ready, motor stopped) then <code>16#047F</code> (run). Setting bit 0 to 1 starts, clearing it stops with the drive's ramp. Bit 10 must be 1 or the drive ignores the PLC."],
        ["h", "Reading the status word"],
        ["p", "The drive answers with a status word (<code>ZSW1</code>). Each bit is a fact about the drive. Click through some typical examples:"],
        ["bits", {
          title: "ZSW1: status word decoder",
          word: "ZSW1",
          width: 16,
          initial: 0x0231,
          sub: "Typical example values. Click bits to explore.",
          bits: [
            { n: 0, name: "Ready to start" },
            { n: 1, name: "Ready (ON given, no fault)" },
            { n: 2, name: "Operation enabled (motor follows setpoint)" },
            { n: 3, name: "Fault active" },
            { n: 4, name: "OFF2 inactive" },
            { n: 5, name: "OFF3 inactive" },
            { n: 6, name: "Closing lockout active" },
            { n: 7, name: "Alarm active" },
            { n: 8, name: "Speed within tolerance of the setpoint" },
            { n: 9, name: "Master control requested" },
            { n: 10, name: "Comparison speed reached or exceeded" },
            { n: 14, name: "Motor rotates clockwise" }
          ],
          presets: [
            { label: "Ready to start (0231)", value: 0x0231 },
            { label: "Switched on, not enabled (0233)", value: 0x0233 },
            { label: "Running at setpoint (0337)", value: 0x0337 },
            { label: "Fault (0278)", value: 0x0278 }
          ]
        }],
        ["p", "Your program reads these bits to show the state on the HMI and to decide what to do next. Bit 3 (fault) leads to a fault-acknowledge sequence using control-word bit 7. Bit 2 tells you the motor really is running, which is different from having asked it to run."],
        ["h", "The speed setpoint"],
        ["p", "<code>NSOLL_A</code> is a signed 16-bit value where <b>16384 (16#4000) means 100 %</b> of the drive's reference speed. So 50 % is 8192, and a negative number reverses. The speed in rpm is <code>n = NSOLL_A &times; P2000 / 16384</code>, where <code>P2000</code> is the drive's <b>reference speed</b>. During motor commissioning the drive normally sets it equal to the maximum speed (P1082). The actual speed comes back in <code>NIST_A</code> with the same scaling."],
        ["scl", "// Command: stopped -> run\n\"Drive1_STW1\" := W#16#047E;\nIF \"Run_Cmd\" THEN\n    \"Drive1_STW1\" := W#16#047F;\nEND_IF;\n\n// Speed 0..100 % to the drive's scale, limited first\n#Spd := LIMIT(MN := 0.0, IN := \"Speed_SP_Pct\", MX := 100.0);\n\"Drive1_NSOLL\" := REAL_TO_INT(#Spd / 100.0 * 16384.0);\n\n// Reading back: ZSW1 bit 2 = operation enabled, bit 3 = fault\n\"Drive1_Running\" := \"Drive1_ZSW1\".%X2;\n\"Drive1_Fault\"   := \"Drive1_ZSW1\".%X3;", "Driving a SINAMICS in SCL"],
        ["h", "Commissioning the drive"],
        ["p", "Before the PLC can control a drive, the drive itself must be set up. The usual order, following Siemens' training material for the G120:"],
        ["ul", [
          "<b>Reset to factory settings</b> so you start from a known state (in Startdrive, on the operator panel, or by a parameter reset).",
          "<b>Basic (quick) commissioning</b>: enter the motor nameplate data, choose the control mode and the ramp times.",
          "<b>Motor data identification and speed-controller optimisation</b>, where the drive measures the motor and tunes its own loops.",
          "<b>Set the communication</b>: PROFINET interface, device name, IP address and the telegram (standard telegram 1 for plain speed control).",
          "<b>Test from the engineering tool first</b> (the Startdrive control panel) before handing control to the PLC. If the drive does not run from there, no PLC program will fix it."
        ]],
        ["note", "Siemens also supplies ready-made library blocks (for example the <b>SINA_SPEED</b> block in the drive library) that wrap all of this for you: control word, setpoint scaling, fault handling. Use them in real projects. Knowing what is inside means you can debug them."],
        ["warn", "A drive moves real machinery. Test first with the motor uncoupled and the area clear, and keep the drive's own <b>Safe Torque Off</b> and e-stop wiring independent of the PLC program. Never rely on a control word bit for safety."],
        ["quiz", {
          q: "What does 16384 in the drive's speed setpoint word represent?",
          options: ["16384 rpm", "100 % of reference speed", "Maximum current", "A fault code"],
          answer: 1,
          why: "In PROFIdrive's standardised setpoint, 16384 (16#4000) is 100 % of the reference speed."
        }],
        ["quiz", {
          q: "Which control-word bit must always be 1 for the drive to accept commands from the PLC?",
          options: ["Bit 0", "Bit 7", "Bit 10 (control by PLC)", "Bit 15"],
          answer: 2,
          why: "Bit 10 tells the drive that the PLC is allowed to control it; without it the control word is ignored."
        }]
      ]
    }
  ]
});
