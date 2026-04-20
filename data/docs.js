// data/docs.js — Nexus documentation tree
// window.CALYR_DOCS: sections[] → { id, title, pages[] → { id, title, src } }
// src is relative to docs/ inside the homepage.

window.CALYR_DOCS = [

  {
    id:    'start',
    title: 'Getting started',
    pages: [
      { id: 'overview',  title: 'Overview',       src: 'docs/start_overview.html' },
      { id: 'quickstart',title: 'Quick start',    src: 'docs/start_quickstart.html' }
    ]
  },

  {
    id:    'philosophy',
    title: 'Philosophy',
    pages: [
      { id: 'core',      title: 'Nexus Philosophy', src: 'docs/philosophy_core.html' },
      { id: 'narrative', title: 'Full narrative',   src: 'docs/nexus_narrative.html' }
    ]
  },

  {
    id:    'language',
    title: 'Language',
    pages: [
      { id: 'syntax',    title: 'Syntax',         src: 'docs/language_syntax.html' },
      { id: 'semantics', title: 'Semantics',      src: 'docs/language_semantics.html' }
    ]
  },

  {
    id:    'modules',
    title: 'Modules',
    pages: [
      { id: 'modules',   title: 'Module system',  src: 'docs/modules.html' }
    ]
  },

  {
    id:    'types',
    title: 'Types',
    pages: [
      { id: 'types',     title: 'Type system',    src: 'docs/types.html' }
    ]
  },

  {
    id:    'operators',
    title: 'Operators',
    pages: [
      { id: 'pipeline',  title: 'Pipeline  >',    src: 'docs/op_pipeline.html' },
      { id: 'apply',     title: 'Apply  @',        src: 'docs/op_apply.html' },
      { id: 'iterate',   title: 'Iterate  >>',     src: 'docs/op_iterate.html' },
      { id: 'list',      title: 'List  { }',        src: 'docs/op_list.html' }
    ]
  },

  {
    id:    'execution',
    title: 'Execution',
    pages: [
      { id: 'model',     title: 'Execution model', src: 'docs/execution_model.html' },
      { id: 'graph',     title: 'Graph & cache',   src: 'docs/execution_graph.html' }
    ]
  },

  {
    id:    'constraints',
    title: 'Constraints',
    pages: [
      { id: 'constraints', title: 'Constraint system', src: 'docs/constraints.html' }
    ]
  },

  {
    id:    'nexus',
    title: 'Nexus',
    pages: [
      { id: 'nexus',     title: 'Nexus concept',  src: 'docs/nexus_concept.html' },
      { id: 'coupling',  title: 'Coupling',        src: 'docs/nexus_coupling.html' }
    ]
  },

  {
    id:    'instruments',
    title: 'Instrument layers',
    pages: [
      { id: 'saxs',      title: 'SAXS',            src: 'docs/inst_saxs.html' },
      { id: 'spr',       title: 'SPR',             src: 'docs/inst_spr.html' },
      { id: 'itc',       title: 'ITC',             src: 'docs/inst_itc.html' },
      { id: 'chrom',     title: 'Chromatography',  src: 'docs/inst_chrom.html' },
      { id: 'md',        title: 'MD / LAMMPS',     src: 'docs/inst_md.html' }
    ]
  },

  {
    id:    'warehouse',
    title: 'Warehouse',
    pages: [
      { id: 'archive',   title: 'Archive',         src: 'docs/archive.html' },
      { id: 'warehouse', title: 'Warehouse',       src: 'docs/warehouse.html' }
    ]
  },

  {
    id:    'examples',
    title: 'Examples',
    pages: [
      { id: 'examples',  title: 'Example scripts', src: 'docs/examples.html' }
    ]
  },

  {
    id:    'api',
    title: 'API reference',
    pages: [
      { id: 'python',    title: 'Python API',      src: 'docs/api_python.html' },
      { id: 'cli',       title: 'CLI',             src: 'docs/api_cli.html' }
    ]
  },

  {
    id:    'terminal',
    title: 'Terminal',
    pages: [
      { id: 'terminal',  title: 'Nexus Terminal',  src: 'docs/terminal.html' }
    ]
  },

  {
    id:    'roadmap',
    title: 'Roadmap',
    pages: [
      { id: 'roadmap',   title: 'Roadmap',         src: 'docs/roadmap.html' }
    ]
  },

  {
    id:    'internal',
    title: '— Internal',
    pages: [
      { id: 'docs_system', title: 'Docs system',   src: 'docs/internal_docs_system.html' }
    ]
  }

];
