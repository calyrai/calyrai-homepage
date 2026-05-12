# SBPA — Structural Bayesian Protein Assembly

Project post

 The SbpA S-layer protein (1268 residues, *Lysinibacillus sphaericus*) is not a mystery to be solved by a single prediction — it is a system to be understood through the convergence of multiple experimental and computational signals.

 SBPA treats AlphaFold not as ground truth but as a **probabilistic structural prior**. The PAE (Predicted Aligned Error) matrix is not a confidence decoration — it is a structural uncertainty topology that determines which inter-domain vectors are constrained and which are free. High-PAE interfaces are conformationally ambiguous; the pipeline treats them as soft degrees of freedom rather than fixed contacts.

 The architecture is: FASTA → AF prior (engine-agnostic) → PAE uncertainty analysis → cryo-EM hull fitting → SAXS validation → weighted ensemble optimisation → Bayesian posterior ranking → convergence landscape.

 The output is not a structure. It is a **convergence landscape** — a multi-dimensional score field over the ensemble of candidate states, encoding SAXS compatibility, cryo-EM consistency, PAE prior plausibility, and ensemble spread simultaneously. States that satisfy all constraints simultaneously rise to the surface. States that satisfy only one remain diffuse.

 Calyrai renders this landscape as an atmosphere: high-confidence states appear stable and bright; low-confidence states drift and dim. The visual is not decoration — it is the answer.

 Open full project: [nexus/projects/sbpa](nexus/projects/sbpa)
