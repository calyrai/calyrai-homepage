// data/docs.js — Tile-aligned documentation tree
// window.CALYR_DOCS: sections[] → { id, title, pages[] → { id, title, src } }

window.CALYR_DOCS = [

  {
    id: 'start',
    title: 'Getting started',
    pages: [
      { id: 'master_todo', title: 'Master To-Do List', src: 'docs/todo_master.html' },
      { id: 'overview', title: 'Overview', src: 'docs/start_overview.html' },
      { id: 'quickstart', title: 'Quick start', src: 'docs/start_quickstart.html' }
    ]
  },

  {
    id: 'tilemap',
    title: 'Tile map',
    pages: [
      { id: 'scientific_infrastructure', title: 'Scientific infrastructure orchestration', src: 'docs/ecosystem_scientific_infrastructure.html' }
    ]
  },

  {
    id: 'ai',
    title: 'AI',
    pages: [
      { id: 'narrative', title: 'Nexus narrative', src: 'docs/nexus_narrative.html' },
      { id: 'ai_landscape', title: 'AI landscape map', src: 'pages/ai_landscape_map.html?v=20260508-linkedin' }
    ]
  },

  {
    id: 'data',
    title: 'Data',
    pages: [
      { id: 'archive', title: 'Archive', src: 'docs/archive.html' },
      { id: 'warehouse', title: 'Warehouse', src: 'docs/warehouse.html' },
      { id: 'connectpaper', title: 'Connectpaper and Zotero', src: 'docs/api_connectpaper.html' }
    ]
  },

  {
    id: 'knowledge',
    title: 'Knowledge',
    pages: [
      { id: 'core', title: 'Nexus philosophy', src: 'docs/philosophy_core.html' },
      { id: 'syntax', title: 'Syntax', src: 'docs/language_syntax.html' },
      { id: 'semantics', title: 'Semantics', src: 'docs/language_semantics.html' },
      { id: 'types', title: 'Type system', src: 'docs/types.html' },
      { id: 'constraints', title: 'Constraint system', src: 'docs/constraints.html' }
    ]
  },

  {
    id: 'infrastructure',
    title: 'Infrastructure',
    pages: [
      { id: 'modules', title: 'Module system', src: 'docs/modules.html' },
      { id: 'model', title: 'Execution model', src: 'docs/execution_model.html' },
      { id: 'graph', title: 'Graph and cache', src: 'docs/execution_graph.html' },
      { id: 'saxs', title: 'SAXS', src: 'docs/inst_saxs.html' },
      { id: 'spr', title: 'SPR', src: 'docs/inst_spr.html' },
      { id: 'itc', title: 'ITC', src: 'docs/inst_itc.html' },
      { id: 'chrom', title: 'Chromatography', src: 'docs/inst_chrom.html' },
      { id: 'md', title: 'MD and LAMMPS', src: 'docs/inst_md.html' }
    ]
  },

  {
    id: 'orchestration',
    title: 'Orchestration',
    pages: [
      { id: 'nexus', title: 'Nexus concept', src: 'docs/nexus_concept.html' },
      { id: 'coupling', title: 'Coupling', src: 'docs/nexus_coupling.html' },
      { id: 'pipeline', title: 'Pipeline  >', src: 'docs/op_pipeline.html' },
      { id: 'apply', title: 'Apply  @', src: 'docs/op_apply.html' },
      { id: 'iterate', title: 'Iterate  >>', src: 'docs/op_iterate.html' },
      { id: 'list', title: 'List  { }', src: 'docs/op_list.html' },
      { id: 'terminal', title: 'Nexus terminal', src: 'docs/terminal.html' },
      { id: 'cli', title: 'CLI', src: 'docs/api_cli.html' }
    ]
  },

  {
    id: 'visualization',
    title: 'Visualization',
    pages: [
      { id: 'examples', title: 'Example scripts', src: 'docs/examples.html' },
      { id: 'python', title: 'Python API', src: 'docs/api_python.html' },
      { id: 'matomic_howto', title: 'Metabolic how-to snippets', src: 'docs/method_matomic_howto.html' },
      { id: 'matomic_snippets', title: 'Metabolic snippet catalog', src: 'docs/method_matomic_snippets.html' },
      { id: 'roadmap', title: 'Roadmap', src: 'docs/roadmap.html' }
    ]
  },

  {
    id: 'internal',
    title: 'Internal operations',
    pages: [
      { id: 'calyr_online_gruendung_at', title: 'Online-Gruendung Oesterreich', src: 'docs/calyr_online_gruendung_at.html' },
      { id: 'calyr_online_founding_en', title: 'Online founding Austria (EN)', src: 'docs/calyr_online_founding_en.html' },
      { id: 'calyr_gruendung', title: 'Calyr Gruendung', src: 'docs/calyr_gruendung.html' },
      { id: 'calyr_gruendung_pitch', title: 'Calyr Gruendung (Pitch)', src: 'docs/calyr_gruendung_pitch.html' },
      { id: 'docs_system', title: 'Docs system', src: 'docs/internal_docs_system.html' }
    ]
  }

];
