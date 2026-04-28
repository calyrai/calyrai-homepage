// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · Nexus",
    "headline": "Nexus and the data warehouse",
    "tagline": "from experimental records to governed model states"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "Fragmentation",
    "headline": "Scientific data is stored,<br>but interpretation is fragmented",
    "body": "Measurements, metadata, preprocessing, fitted parameters, and report figures are often separated into disconnected files and tools.\nWhen this happens, claims drift away from the assumptions and transformations that produced them.\nNexus addresses this by treating the warehouse as a governed scientific layer rather than passive storage.\n",
    "manifesto": "The scientific object must stay intact."
  },
  {
    "type": "equation",
    "chapter": "Core",
    "kicker": "Warehouse sequence",
    "headline": "Nexus as governed middle layer",
    "eq": "$$\\\\text{EXPERIMENT} \\\\rightarrow \\\\text{REPRESENTATION} \\\\rightarrow \\\\text{MODEL STATE} \\\\rightarrow \\\\text{RESULT} \\\\rightarrow \\\\text{REPORT}$$",
    "body": "Each step is a controlled transition with explicit provenance.\nThe warehouse keeps these layers linked so every output can be traced back to the originating experiment and transformation chain.\nNexus is therefore both storage semantics and control semantics.\n"
  },
  {
    "type": "statement",
    "chapter": "Structure",
    "kicker": "Stored object",
    "headline": "The warehouse stores<br>scientific objects, not files",
    "body": "A useful record contains the observation, its provenance, its derived representation, and the model-facing state that follows from it.\nThe same logic must hold for SAXS, SPR, and chromatography.\nThe point is not more storage. The point is to keep the scientific object traversable.\n",
    "manifesto": "Store the object, not only the file."
  },
  {
    "type": "statement",
    "chapter": "Outcome",
    "kicker": "Traceability",
    "headline": "Claims remain linked<br>to their origin",
    "body": "Publication-facing outputs can be traced to result objects, model states, representations, and source experiments.\nThis is the practical value of a governed data warehouse.\nNexus is the layer that keeps this chain intact across modalities.\n",
    "manifesto": "Traceability is a warehouse property."
  }
];
