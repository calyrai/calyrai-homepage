// data/docs.js — Six-pearl documentation tree
// window.CALYR_DOCS: sections[] → { id, title, pages[] → { id, title, src } }

window.CALYR_DOCS = [

  {
    id: 'theory',
    title: 'Theory',
    pages: [
      { id: 'overview', title: 'Theory · Overview', src: 'docs/atlas_overview.html' },
      { id: 'tilemap', title: 'Tile map', src: 'docs/ecosystem_scientific_infrastructure.html' },
      { id: 'data_archive', title: 'Data · Archive', src: 'docs/archive.html' },
      { id: 'data_warehouse', title: 'Data · Warehouse', src: 'docs/warehouse.html' },
      { id: 'data_connectpaper', title: 'Data · Connectpaper and Zotero', src: 'docs/api_connectpaper.html' }
    ]
  },

  {
    id: 'calyrai',
    title: 'Calyrai',
    pages: [
      { id: 'overview', title: 'Calyrai · Overview', src: 'docs/calyrai_overview.html' },
      { id: 'ai_narrative', title: 'AI · Nexus narrative', src: 'docs/nexus_narrative.html' },
      { id: 'ai_landscape', title: 'AI · Landscape map', src: 'pages/ai_landscape_map.html?v=20260508-linkedin' },
      { id: 'knowledge_philosophy', title: 'Knowledge · Nexus philosophy', src: 'docs/philosophy_core.html' },
      { id: 'knowledge_syntax', title: 'Knowledge · Syntax', src: 'docs/language_syntax.html' },
      { id: 'knowledge_semantics', title: 'Knowledge · Semantics', src: 'docs/language_semantics.html' },
      { id: 'knowledge_types', title: 'Knowledge · Type system', src: 'docs/types.html' },
      { id: 'knowledge_constraints', title: 'Knowledge · Constraint system', src: 'docs/constraints.html' },
      { id: 'viz_examples', title: 'Visualization · Example scripts', src: 'docs/examples.html' },
      { id: 'viz_python', title: 'Visualization · Python API', src: 'docs/api_python.html' },
      { id: 'viz_matomic_howto', title: 'Visualization · Metabolic how-to', src: 'docs/method_matomic_howto.html' },
      { id: 'viz_matomic_snippets', title: 'Visualization · Metabolic snippets', src: 'docs/method_matomic_snippets.html' }
    ]
  },

  {
    id: 'access',
    title: 'Access',
    pages: [
      { id: 'overview', title: 'Access · Overview', src: 'docs/relay_overview.html' },
      { id: 'start_master_todo', title: 'Getting started · Master To-Do', src: 'docs/todo_master.html' },
      { id: 'start_overview', title: 'Getting started · Overview', src: 'docs/start_overview.html' },
      { id: 'start_quickstart', title: 'Getting started · Quick start', src: 'docs/start_quickstart.html' }
    ]
  },

  {
    id: 'engine',
    title: 'Engine',
    pages: [
      { id: 'overview', title: 'Engine · Overview', src: 'docs/runtime_overview.html' },
      { id: 'infra_modules', title: 'Infrastructure · Module system', src: 'docs/modules.html' },
      { id: 'infra_model', title: 'Infrastructure · Execution model', src: 'docs/execution_model.html' },
      { id: 'infra_graph', title: 'Infrastructure · Graph and cache', src: 'docs/execution_graph.html' },
      { id: 'infra_saxs', title: 'Infrastructure · SAXS', src: 'docs/inst_saxs.html' },
      { id: 'infra_spr', title: 'Infrastructure · SPR', src: 'docs/inst_spr.html' },
      { id: 'infra_itc', title: 'Infrastructure · ITC', src: 'docs/inst_itc.html' },
      { id: 'infra_chrom', title: 'Infrastructure · Chromatography', src: 'docs/inst_chrom.html' },
      { id: 'infra_md', title: 'Infrastructure · MD and LAMMPS', src: 'docs/inst_md.html' },
      { id: 'orch_overview', title: 'Orchestration · Nexus overview', src: 'docs/nexus/00_overview.md' },
      { id: 'orch_core', title: 'Orchestration · Nexus core concepts', src: 'docs/nexus/01_core_concepts.md' },
      { id: 'orch_capabilities', title: 'Orchestration · Nexus capabilities', src: 'docs/nexus/02_capabilities.md' },
      { id: 'orch_lineage', title: 'Orchestration · Nexus intellectual lineage', src: 'docs/nexus/03_lineage.md' },
      { id: 'orch_warehouse', title: 'Orchestration · Semantic warehouse', src: 'docs/nexus/04_warehouse.md' },
      { id: 'orch_first_principles', title: 'Orchestration · Nexus first principles', src: 'docs/nexus/05_first_principles.md' },
      { id: 'orch_fair', title: 'Orchestration · Nexus FAIR data', src: 'docs/nexus/06_fair_data.md' },
      { id: 'orch_formal', title: 'Orchestration · Nexus formal foundations', src: 'docs/nexus/07_formal_foundations.md' },
      { id: 'orch_why', title: 'Orchestration · Why biopharma needs it', src: 'docs/nexus/08_why_biopharma.md' },
      { id: 'orch_alphafold', title: 'Orchestration · AlphaFold vs Nexus', src: 'docs/nexus/09_alphafold_service_vs_nexus.md' },
      { id: 'orch_substrate', title: 'Orchestration · Substrate independence', src: 'docs/nexus/10_substrate_independence.md' },
      { id: 'orch_writing', title: 'Orchestration · Writing morphogenesis', src: 'docs/nexus/11_writing_morphogenesis.md' },
      { id: 'orch_coupling', title: 'Orchestration · Coupling', src: 'docs/nexus_coupling.html' },
      { id: 'orch_pipeline', title: 'Orchestration · Pipeline  >', src: 'docs/op_pipeline.html' },
      { id: 'orch_apply', title: 'Orchestration · Apply  @', src: 'docs/op_apply.html' },
      { id: 'orch_iterate', title: 'Orchestration · Iterate  >>', src: 'docs/op_iterate.html' },
      { id: 'orch_list', title: 'Orchestration · List  { }', src: 'docs/op_list.html' },
      { id: 'orch_terminal', title: 'Orchestration · Nexus terminal', src: 'docs/terminal.html' },
      { id: 'orch_cli', title: 'Orchestration · CLI', src: 'docs/api_cli.html' }
    ]
  },

  {
    id: 'sandbox',
    title: "G'labs (Sandbox)",
    pages: [
      { id: 'overview', title: "G'labs (Sandbox) · Overview", src: 'docs/glabs_overview.html' },
      { id: 'roadmap', title: "G'labs || · Roadmap", src: 'docs/roadmap.html' },
      { id: 'internal_online_gruendung_at', title: 'Internal · Online-Gruendung Oesterreich', src: 'docs/calyr_online_gruendung_at.html' },
      { id: 'internal_online_founding_en', title: 'Internal · Online founding Austria (EN)', src: 'docs/calyr_online_founding_en.html' },
      { id: 'internal_calyr_gruendung', title: 'Internal · Calyr Gruendung', src: 'docs/calyr_gruendung.html' },
      { id: 'internal_gruendung_pitch', title: 'Internal · Calyr Gruendung (Pitch)', src: 'docs/calyr_gruendung_pitch.html' },
      { id: 'internal_docs_system', title: 'Internal · Docs system', src: 'docs/internal_docs_system.html' }
    ]
  },

  {
    id: 'gallery',
    title: 'Gallery',
    pages: [
      { id: 'blog_index', title: 'Gallery · Blog', src: 'docs/projects_blog_index.html' },
      { id: 'post_saxs_sasview', title: 'Gallery · SAS Opsis', src: 'docs/projects_post_saxs_sasview.html' },
      { id: 'post_saxs_igm', title: 'Gallery · SAXS IGM', src: 'docs/projects_post_saxs_igm.html' },
      { id: 'post_spr_data', title: 'Gallery · SPR extended theory', src: 'docs/projects_post_spr_data.html' }
    ]
  }

];
