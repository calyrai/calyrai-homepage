import { CalyrObject } from "./CalyrObject";

export class Theme {
  primaryColor: string;

  constructor(primaryColor: string) {
    this.primaryColor = primaryColor;
  }
}

export abstract class ScientificObject extends CalyrObject {
  category?: string;
  theme: Theme;
  keywords: string[];
  assets: string[];
  projectionModes: string[];

  constructor(
    id: string,
    title: string,
    options: {
      body?: string;
      category?: string;
      color: string;
      keywords?: string[];
      assets?: string[];
      projectionModes?: string[];
    }
  ) {
    super(id, title, options.body);
    this.category = options.category;
    this.theme = new Theme(options.color);
    this.keywords = options.keywords || [];
    this.assets = options.assets || [];
    this.projectionModes = options.projectionModes || ["tile", "arte", "atlas", "workspace"];
  }
}

export class Publication extends ScientificObject {
  authors: string[];
  journal?: string;
  year?: number;

  constructor(
    id: string,
    title: string,
    options: {
      body?: string;
      category?: string;
      color: string;
      authors?: string[];
      journal?: string;
      year?: number;
      keywords?: string[];
      assets?: string[];
      projectionModes?: string[];
    }
  ) {
    super(id, title, options);
    this.authors = options.authors || [];
    this.journal = options.journal;
    this.year = options.year;
  }
}

export class Project extends ScientificObject {}

export class EngineObject extends ScientificObject {}

export class Workflow extends ScientificObject {}

export class Dataset extends ScientificObject {}

export class Theory extends ScientificObject {}

export class Module extends ScientificObject {}

export function buildFlagshipObjects(): ScientificObject[] {
  return [
    new Publication("spr", "SPR Structural Evaluation", {
      category: "Biophysics",
      color: "#00E5FF",
      keywords: ["SPR", "structure", "evaluation"],
      projectionModes: ["tile", "arte", "atlas", "workspace", "slide"]
    }),
    new Publication("saxs", "Real/Fourier Space SAXS", {
      category: "Structural Biology",
      color: "#FFD400",
      keywords: ["SAXS", "real-space", "fourier-space"]
    }),
    new Publication("cryoem-saxs", "Hybrid Structural Biology", {
      category: "Integrative Biology",
      color: "#FF4DF5",
      keywords: ["CryoEM", "SAXS", "hybrid"]
    }),
    new Project("redhuman", "RedHuman", {
      category: "Flagship Project",
      color: "#FF5555",
      keywords: ["human", "translational", "project"]
    }),
    new EngineObject("alphafold", "AlphaFold Engine", {
      category: "Engine",
      color: "#8A63FF",
      keywords: ["protein", "prediction", "workflow"]
    }),
    new EngineObject("lidar", "LiDAR Engine", {
      category: "Engine",
      color: "#3CD278",
      keywords: ["scan", "reconstruction", "viewer"]
    }),
    new EngineObject("asc-surrogate", "ASC Surrogate Modelling", {
      category: "Engine",
      color: "#3C82FF",
      keywords: ["HPC", "surrogate", "modelling"]
    })
  ];
}