// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "BOKU · User Training",
    "headline": "Nexus CLI:<br>From Data to Decision",
    "tagline": "Rupert Tscheliessnig"
  },
  {
    "type": "statement",
    "chapter": "Overview",
    "kicker": "What we do today",
    "headline": "How this session is structured",
    "body": "I will start with a simple idea:\n\nWhat does it actually mean for data to be usable later?\n\nThen we move to the key question:\nWhy do we need models if we want to make decisions?\n\nAfter that, I will place SPR and SAXS into that picture.\n\nAnd only then we go into Nexus and the actual workflow.\n",
    "manifesto": "First understanding, then execution."
  },
  {
    "type": "statement",
    "chapter": "FAIR data",
    "kicker": "Why this matters",
    "headline": "Data are only useful if they remain interpretable",
    "body": "When you look at a file alone, you usually don't know what it really means.\n\nYou need context:\nhow it was measured,\nwhat the sample was,\nwhat assumptions were made.\n\nThat is what FAIR data actually means in practice.\n\nIn Nexus, this is handled through structured data objects, not just raw files.\n",
    "manifesto": "Data without context cannot be reused."
  },
  {
    "type": "statement",
    "chapter": "Decision making",
    "kicker": "The core problem",
    "headline": "Looking at curves is not enough",
    "body": "A curve can look convincing.\n\nBut it does not tell you what mechanism produced it.\n\nIn fact, different models can often explain the same curve.\n\nThat means:\nIf you want to decide something, you need a model.\n",
    "manifesto": "Data show behavior. Models explain it."
  },
  {
    "type": "statement",
    "chapter": "Model",
    "kicker": "What a model is",
    "headline": "A model describes how the system evolves",
    "body": "A model is not just a fit.\n\nIt describes a process.\n\nIt tells you what happens over time,\nand how the system moves toward equilibrium.\n",
    "manifesto": "A model explains change."
  },
  {
    "type": "statement",
    "chapter": "SPR",
    "kicker": "Dynamic view",
    "headline": "SPR shows how the system evolves in time",
    "body": "With SPR, you measure a signal R(t).\n\nYou see how binding starts,\nhow fast it grows,\nand how it relaxes again.\n\nSo SPR gives you access to kinetics.\n",
    "manifesto": "SPR tells you how fast things happen."
  },
  {
    "type": "statement",
    "chapter": "SPR",
    "kicker": "Kinetic interpretation",
    "headline": "SPR is useful because it shows<br>how binding changes over time",
    "body": "We do not need the full adsorption model here.\n\nThe important point is simpler: SPR gives a time-resolved view of how the system responds.\n\nThat makes it the kinetic side of the workflow.\n",
    "manifesto": "SPR contributes the time axis."
  },
  {
    "type": "statement",
    "chapter": "SAXS",
    "kicker": "Structural view",
    "headline": "SAXS constrains what is structurally possible",
    "body": "SAXS measures scattering I(q).\n\nFrom that, you can derive P(r),\nwhich tells you about distances inside the system.\n\nThis does not replace kinetics,\nbut it restricts which models are physically possible.\n",
    "manifesto": "SAXS limits the model space."
  },
  {
    "type": "equation",
    "chapter": "SAXS model",
    "kicker": "Without Dmax",
    "headline": "Structure can be analyzed without fixing a size",
    "eq": "$$P(r) \\sim r^{D} e^{-\\alpha r}, \\qquad I(q)=\\mathrm{FFT}[P(r)](q)$$",
    "body": "Traditional SAXS analysis often starts by choosing a fixed $D_{\\max}$.\n\nBut that means you impose a hard outer size before the data have justified it.\n\nHere we do something different. We write a structured form for $P(r)$ and then obtain $I(q)$ from it through the transform relation.\n\nThat makes the logic explicit: the measured scattering is the transform of the distance distribution, not a separate object with an independently imposed cutoff.\n\nThe benefit of losing $D_{\\max}$ is that the model becomes less arbitrary, less user-dependent, and better suited to extended or heterogeneous systems where a single hard maximum size is not the right physical description.\n",
    "manifesto": "Structure from scaling, not cutoffs."
  },
  {
    "type": "statement",
    "chapter": "Time scales",
    "kicker": "One physical process",
    "headline": "We are always looking at the same system",
    "body": "At very short times,\nSPR shows how binding starts.\n\nAt very long times,\nwe observe the equilibrium state.\n\nThese are not different systems.\n\nThey are two limits of the same process.\n",
    "manifesto": "One system, two limits."
  },
  {
    "type": "statement",
    "chapter": "Nexus",
    "kicker": "What Nexus does",
    "headline": "Nexus connects all of this",
    "body": "Nexus takes your data.\n\nIt generates models.\n\nIt tests those models against the data.\n\nAnd it ranks the results.\n",
    "manifesto": "From data to decision."
  },
  {
    "type": "statement",
    "chapter": "Nexus",
    "kicker": "Control plane",
    "headline": "Nexus is not a logbook;<br>it is the control plane",
    "body": "In Calyr, Nexus is not just a place where results are collected afterward.\n\nIt is the layer that connects symbolic intent, execution, data, and evaluation.\n\nThat means a scientific action is not just \"run code\".\n\nIt is a declared transition from one well-defined state to the next.\n",
    "manifesto": "Declare first. Execute second."
  },
  {
    "type": "equation",
    "chapter": "Nexus",
    "kicker": "State transition",
    "headline": "Every run is a transition between<br>two declared scientific states",
    "eq": "$$\\mathrm{State}_t \\xrightarrow{\\mathrm{Nexus\\ declaration}} \\mathrm{Execution} \\xrightarrow{\\mathrm{Results}} \\mathrm{State}_{t+1}$$",
    "body": "The important point is that execution does not stand alone.\n\nIt is always attached to a declared state before the run and a traceable state after the run.\n\nThat is how FAIR data, reproducibility, and scientific meaning remain connected.\n",
    "manifesto": "A run is a state change, not a side effect."
  },
  {
    "type": "figure",
    "chapter": "Nexus",
    "kicker": "Closed loop",
    "headline": "Results only count after<br>validation and scoring",
    "image": "../figures/generated/validation-scoring-loop.svg",
    "alt": "Closed loop from Nexus declaration to execution, results, and validation plus scoring.",
    "caption": "Each result re-enters the evaluation layer before it becomes the next accepted state.",
    "body": "This is the closed-loop part of the system.\n\nYou do not just execute and move on.\n\nResults are validated, scored, and only then allowed back into the scientific workflow.\n"
  },
  {
    "type": "figure",
    "chapter": "Infrastructure",
    "kicker": "Where things run",
    "headline": "Nexus runs on VSC-5",
    "image": "../figures/generated/nexus-asc-remote-control.svg",
    "caption": "Your laptop is only the control interface."
  },
  {
    "type": "statement",
    "chapter": "Infrastructure",
    "kicker": "Important detail",
    "headline": "Your laptop is only the control",
    "body": "You connect via SSH.\n\nAll computation happens on VSC-5.\n\nData and results stay there.\n",
    "manifesto": "You control, the cluster computes."
  },
  {
    "type": "statement",
    "chapter": "Workflow",
    "kicker": "How to think about it",
    "headline": "The workflow follows scientific reasoning",
    "body": "You start with data.\n\nYou define a model.\n\nYou test it.\n\nAnd then you decide.\n",
    "manifesto": "Not a tool chain — a reasoning process."
  },
  {
    "type": "statement",
    "chapter": "Step 1",
    "kicker": "Login",
    "headline": "Connect to the cluster",
    "code": "ssh trupert@vsc5.vsc.ac.at\n"
  },
  {
    "type": "statement",
    "chapter": "Step 2",
    "kicker": "Start",
    "headline": "Load Nexus",
    "code": "module load nexus\nnexus --help\n"
  },
  {
    "type": "statement",
    "chapter": "Step 3",
    "kicker": "Project",
    "headline": "Create a project",
    "code": "nexus init project\ncd project\n"
  },
  {
    "type": "statement",
    "chapter": "Step 4",
    "kicker": "Data",
    "headline": "Upload your data",
    "code": "nexus upload saxs data.dat\nnexus upload spr data.csv\n"
  },
  {
    "type": "statement",
    "chapter": "Step 5",
    "kicker": "Model",
    "headline": "Define a model",
    "code": "nexus model cg --type alpha\n"
  },
  {
    "type": "statement",
    "chapter": "Step 6",
    "kicker": "Scan",
    "headline": "Explore parameters",
    "code": "nexus scan epsilon=0.1:1.0:0.1\n"
  },
  {
    "type": "statement",
    "chapter": "Step 7",
    "kicker": "Run",
    "headline": "Run the simulation",
    "code": "nexus run --backend asc\n"
  },
  {
    "type": "statement",
    "chapter": "Step 8",
    "kicker": "Analyze",
    "headline": "Analyze results",
    "code": "nexus analyze pdd\nnexus analyze pca\n"
  },
  {
    "type": "statement",
    "chapter": "Step 9",
    "kicker": "Decision",
    "headline": "Rank models",
    "code": "nexus score\nnexus results top 10\n"
  },
  {
    "type": "statement",
    "chapter": "Takeaway",
    "kicker": "Final message",
    "headline": "You can now run the full workflow",
    "body": "Upload data.\n\nRun models.\n\nGet ranked results.\n\nThat is the complete loop.\n",
    "manifesto": "From data to decision."
  }
];
