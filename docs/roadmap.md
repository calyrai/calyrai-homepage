# Roadmap

Where Nexus is going

## Near-term (0.2)

- **Modular package system** — `nexus_language_saxs`, `nexus_language_spr`, `nexus_language_nexus`, `nexus_language_warehouse` as individually pip-installable packages with isolated dependency trees.

- **Live SAS Opsis** — streaming analysis during beam time, real-time $P(r)$ and Guinier display in the browser.

- **NMR instrument layer** — chemical shift perturbations as constraints on binding site geometry.

- **Cryo-EM instrument layer** — density maps as volumetric constraints on 3D structure.

- **MCMC solver improvements** — HMC / NUTS sampler replacing the current random-walk MH.

## Medium-term (0.3 – 0.5)

- **Nexus Cloud** — managed warehouse + compute on Calyr.aí infrastructure, zero local install.

- **Collaborative sessions** — shared Nexus contexts with real-time co-editing.

- **Instrument plugin SDK** — formal specification for third-party instrument layers, with automated type-checking and sandbox testing.

- **Publication export** — one-command export of a Nexus result to a reproducible supplement package (data + code + figures).

## Long-term vision

 Every biophysical measurement in the world — past, present, and future — expressed as a `Constraint` in a single global warehouse. Nexus becomes the language in which molecular science is written.

**Contributing:** The Nexus language specification and reference implementation are developed openly. If you want to propose a new operator, instrument layer, or solver, open an issue or contact us via the [contact page](pages/contact.html).
