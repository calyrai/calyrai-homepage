# calyr.aí

## 01 · Scientific intelligence for engineered systems

eyebrow: SCIENTIFIC AÍ FOR ENGINEERED SYSTEMS
tagline: VSC-5 evidence. Surrogate speed. Oracle decisions
description: calyr.aí turns high-fidelity simulations and experiments into fast, uncertainty-aware models—and selects what should be computed, measured, or designed next.

## 02 · Explore the system

### data
label: 01 · AORTA CASE
title: Patient-specific evidence
summary: Each case begins with a patient-specific aorta and a precise question: how will a device, anatomy, or boundary condition change the physical response?
how: HOW · We reconstruct anatomy from imaging, document geometry and assumptions, define device and material behaviour, and run VSC-5, CFD, or FEA. Every result remains linked to the model configuration that produced it.
details: INPUT · imaging, anatomy, device geometry, materials, boundary conditions, measurements | OUTPUT · traceable pressure, flow, deformation, stress, and device-response evidence
next: NEXT → SURROGATE

### surrogate
label: 02 · FAST DESIGN SPACE
title: Surrogate exploration
summary: The high-fidelity cases become a fast surrogate that can compare many anatomy and device variants without repeating every expensive simulation.
how: HOW · We select informative training cases, learn the relationship between parameters and physical responses, then test the surrogate against unseen reference runs. Prediction error and limits of validity remain visible.
details: INPUT · curated VSC-5, CFD, FEA, and experimental reference cases | OUTPUT · rapid predictions, parameter sensitivities, design trends, and quantified uncertainty
next: NEXT → ORACLE

<!--
### prediction
label: CONTROLLED EXPLORATION
title: Prediction
summary: Evaluate new states, variants, sensitivities, and uncertainty in real time.
how: HOW · We evaluate controlled variants with the validated surrogate and retain uncertainty with every prediction.
details: INPUT · validated surrogate | OUTPUT · controlled exploration
next: NEXT → ORACLE
-->

### oracle
label: 03 · NEXT VALIDATION
title: Aorta Oracle
summary: The Oracle turns the surrogate into a decision loop. It identifies where another simulation or experiment can reduce uncertainty or improve the design most effectively.
how: HOW · We combine the target response, engineering constraints, surrogate sensitivity, and uncertainty. Candidate cases are ranked by expected information value rather than explored by trial and error.
details: INPUT · clinical or engineering goal, admissible design space, constraints, uncertainty | OUTPUT · ranked next VSC-5 run, device variant, measurement, or physical validation
next: RETURN → VSC-5 / EXPERIMENT

## Links

start_label: No decisions in time.
email_label: Can calyr.aí build a surrogate and Oracle for it?
limit_label: Push the limit
explore_label: Explore the system
explore_url: https://github.com/calyrai/CALYR-Research
limit_url: https://github.com/calyrai/CALYR-Research/issues
challenge_label: Start the challenge
challenge_email: hello@calyr.ai
challenge_subject: Can calyr.aí build a surrogate and Oracle for this problem?
challenge_body: Hi, this is [name]. The problem is: [briefly describe the difficult decision, simulation, or experiment]. Available evidence: [data, simulations, experiments, or measurements]. The result we need is: [desired prediction or decision]. Can we build a validated surrogate and Oracle for it?

## Research buttons

### 01 · Aorta
summary: Patient-specific flow, wall mechanics, and devices.

### 02 · Nanoparticles
summary: SBPA concepts connect structure, properties, bioactivity, corona formation, transport, and uptake.

### 03 · Nanobiophysics
summary: Interfaces, binding, assembly, and membrane interaction.

### 04 · DOE / PPMS
summary: Designed experiments, parameter spaces, and predictive process models.

## Impressum

label: 04 · IMPRESSUM
title: calyr.aí
name: Rupert Glisnig
role: Founder and responsible for content
address: Ogugasse 3/3/13, 1220 Vienna, Austria
email: hello@calyr.ai
description: Develops scientific surrogate and Oracle workflows for engineered systems. This website presents the research approach, demonstrators, and contact path. Rupert Glisnig is responsible for its editorial content.

<!--
## 05 · AÍ-ssisted surrogate modelling

## 06 · Pythia

## 07 · Examples

## 08 · System

## 09 · Company

Name: Rupert Glisnig  
Function: Founder  
Address: Ogugasse 3/3/13, 1220 Vienna, Austria
-->
