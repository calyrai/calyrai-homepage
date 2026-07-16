# CALYR.aí Research Papers & Technical Documents

Repository of peer-reviewed and technical design documents for CALYR.aí research initiatives.

---

## Published Works

### 1. Hierarchical Tangential Sphere Packing for Adaptive Volume Meshing

**File:** `hierarchical_sphere_packing_mesher.md`

**Author(s):** Rupert Tscheliessnig  
**Institution:** CALYR.aí  
**Date:** July 2026  
**Status:** Technical Design Document (TDD)

**Abstract:**
A deterministic algorithm for decomposing arbitrary closed three-dimensional domains into hierarchical non-overlapping inscribed spheres. The method iteratively places the largest possible sphere in remaining free space, constrained by domain boundary and previously placed spheres. Sphere centers serve as seed points for adaptive mesh generation, with radii defining local scales. The resulting hierarchy supports multi-resolution representations and provides natural geometric error indicators.

**Key Contributions:**
- Mathematical framework for greedy maximal sphere packing
- Free radius field formulation with computational efficiency
- Connection to Laguerre/Regular triangulation meshing
- Complete software architecture with 6-phase implementation plan
- Deterministic, non-overlapping, hierarchically structured decomposition

**Sections:** 46 sections covering mathematical formulation, algorithms, implementations, visualization, and application to complex geometries (aortas, branched systems, arbitrary domains)

**Technology Stack:** Python 3.12+, NumPy, SciPy, trimesh, PyVista, Gmsh

**Next Steps:**
- Phase 1: Voxel-based demonstrator with STL input
- Phase 2: Efficient candidate search (Priority Queue + KD-tree)
- Phase 3: Adaptive octree for high-resolution packing
- Phase 4: Tetrahedral mesh generation via Gmsh
- Phase 5: Regular triangulation (Laguerre diagram)
- Phase 6: Physics-driven adaptive extension

---

## Document Organization

```
papers/
├── README.md                                 (this file)
├── hierarchical_sphere_packing_mesher.md     (technical design)
```

## How to Use These Documents

### For Implementation
1. Read **Sections 1–14** for mathematical foundation and core algorithms
2. Reference **Sections 27–31** for Python code templates
3. Follow **Section 37** implementation phases sequentially
4. Use **Section 34** test geometries for validation

### For Citation
```bibtex
@techreport{tscheliessnig2026htsp,
  title={Hierarchical Tangential Sphere Packing for Adaptive Volume Meshing},
  author={Tscheliessnig, Rupert},
  institution={CALYR.aí},
  year={2026},
  type={Technical Design Document},
  month={July}
}
```

### For Collaboration
- **Questions?** Contact: research@calyr.ai
- **Contributing?** Fork repository and submit pull requests
- **Issues?** File issues with reference to specific sections

---

## Related Resources

- **Interactive Lithos Deck:** https://calyr.ai/research/lithos/ (demonstrates aortic geometry visualization)
- **Pitch Engine:** https://calyr.ai/research/teaser/ (CALYR.aí platform overview)
- **GitHub Repository:** https://github.com/calyrai/calyrai-homepage

---

## License

These technical documents are provided under the CALYR.aí research framework. Refer to repository LICENSE file for terms of use.

---

**Last Updated:** 2026-07-16  
**Document Version:** 1.0  
**Status:** Active Development
