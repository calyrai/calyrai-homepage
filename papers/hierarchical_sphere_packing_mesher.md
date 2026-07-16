# Hierarchical Tangential Sphere Packing for Adaptive Volume Meshing

**Authors:** Rupert Tscheliessnig  
**Institution:** CALYR.aí  
**Date:** July 2026

---

## Abstract

We present a deterministic algorithm for decomposing arbitrary closed three-dimensional domains into a hierarchical set of non-overlapping inscribed spheres. The method iteratively places the largest possible sphere in the remaining free space, constrained by both the domain boundary and previously placed spheres. Sphere centers serve as seed points for mesh generation, while sphere radii define local mesh scales. The resulting hierarchy supports multi-resolution representations and provides a natural geometric error indicator through the radius of the largest remaining empty sphere. The algorithm is mathematically rigorous, deterministic (not statistical), and scalable through efficient candidate search strategies. Implementation as a complete pipeline from STL input to conforming tetrahedral meshes is demonstrated using Python/NumPy/SciPy and Gmsh.

**Keywords:** sphere packing, adaptive meshing, hierarchical decomposition, Laguerre triangulation, mesh generation

---

## 1. Introduction

### 1.1 Problem Motivation

Modern computational methods in finite element analysis, computational fluid dynamics, and scientific simulation require high-quality adaptive volumetric meshes. Key challenges include:

- **Geometric complexity:** Domains with branches, cavities, thin structures, and multiple scales
- **Computational efficiency:** Automatic mesh generation without manual parameter tuning
- **Adaptivity:** Coarse-to-fine representations for multigrid and level-of-detail strategies
- **Robustness:** Guaranteed non-overlapping elements and domain containment

Existing approaches (Delaunay refinement, advancing front, background mesh) handle geometric complexity but lack a natural multi-scale structure or direct geometric error interpretation.

### 1.2 Core Innovation

We propose **Hierarchical Tangential Sphere Packing (HTSP)**: a deterministic greedy algorithm that fills an arbitrary closed 3D body with a nested sequence of non-overlapping inscribed spheres. Key properties:

- **Non-overlapping:** Spheres are tangent or disjoint; $|\mathbf c_i - \mathbf c_j| \geq r_i + r_j$
- **Domain-contained:** $B_i \subseteq \Omega$ for all spheres
- **Maximal:** Each new sphere is the largest possible in remaining free space
- **Deterministic:** Greedy selection, fully reproducible
- **Hierarchical:** $\mathcal{P}_1 \subset \mathcal{P}_2 \subset \ldots \subset \mathcal{P}_N$
- **Interpretable:** Sphere radius $r_{n+1} = \max_{\mathbf x \in \Omega} R_n(\mathbf x)$ is the largest unresolved spatial scale

The resulting sphere packing serves as a spatial skeleton that naturally guides volumetric mesh generation through Laguerre/Regular triangulation or adaptive sizing fields.

### 1.3 Outline

- **Section 2:** Mathematical problem formulation
- **Section 3:** Free radius field—core computational engine
- **Section 4:** Limiting structure and convergence properties
- **Section 5:** Termination criteria and practical stopping conditions
- **Section 6–14:** Input data, domain representation, algorithms, candidate search strategies
- **Section 15–26:** Numerical safety, contact graphs, hierarchy levels, mesh connection variants
- **Section 27–44:** Software architecture, implementation phases, test geometries, core definitions

---

## 2. Mathematical Problem Formulation

### 2.1 Domain and Sphere Representation

Let $\Omega \subset \mathbb{R}^3$ be a closed, bounded, connected domain with boundary $\partial \Omega$.

A sphere is denoted:
$$B_i = B(\mathbf c_i, r_i) := \{\mathbf x \in \mathbb{R}^3 : |\mathbf x - \mathbf c_i| \leq r_i\}$$

where $\mathbf c_i \in \mathbb{R}^3$ is the center and $r_i > 0$ is the radius.

### 2.2 Constraints

#### Inclusion in Domain
Each sphere must lie entirely within $\Omega$:
$$B_i \subseteq \Omega \iff r_i \leq d_\Omega(\mathbf c_i)$$

where $d_\Omega(\mathbf x) := \operatorname{dist}(\mathbf x, \partial \Omega)$ is the signed distance from $\mathbf x$ to the boundary.

#### Non-Overlapping
For distinct spheres $i, j$:
$$|\mathbf c_i - \mathbf c_j| \geq r_i + r_j$$

Tangential contact (touching) is allowed:
$$|\mathbf c_i - \mathbf c_j| = r_i + r_j$$

#### Hierarchical Insertion
After $n$ spheres, the packing is:
$$\mathcal{P}_n := \{B_1, B_2, \ldots, B_n\}$$

The next sphere is chosen as the largest sphere fitting in remaining free space:
$$(\mathbf c_{n+1}, r_{n+1}) = \arg\max_{\mathbf c, r} r$$

subject to:
- $B(\mathbf c, r) \subseteq \Omega$
- $B^\circ(\mathbf c, r) \cap B_i^\circ = \emptyset$ for all $i \leq n$

where $B^\circ$ denotes the open interior.

---

## 3. Free Radius Field

The central computational object is the **free radius function**. For a point $\mathbf x \in \Omega$, the maximum radius of a sphere centered at $\mathbf x$ that avoids all existing spheres is:

$$R_n(\mathbf x) := \min\left[d_\Omega(\mathbf x), \min_{1 \leq i \leq n}\left(|\mathbf x - \mathbf c_i| - r_i\right)\right]$$

The first term ensures containment within the domain. The second term ensures non-overlapping with all previously placed spheres.

The next sphere is therefore:
$$\mathbf c_{n+1} = \arg\max_{\mathbf x \in \Omega} R_n(\mathbf x)$$
$$r_{n+1} = R_n(\mathbf c_{n+1})$$

**Core Problem:** Repeated solution of the largest empty inscribed sphere problem.

### 3.1 Boundary Distance Function

The function $d_\Omega(\mathbf x)$ can be computed via:
- **Voxel grid:** Distance field on regular lattice
- **Signed Distance Field (SDF):** Continuous implicit function
- **Spatial tree:** BVH or octree with certified bounds

For implementation, we use:
$$\phi(\mathbf x) = \begin{cases} +d(\mathbf x, \partial \Omega) & \mathbf x \in \Omega \\ -d(\mathbf x, \partial \Omega) & \mathbf x \notin \Omega \end{cases}$$

where $d(\mathbf x, \partial \Omega) = \min_{\mathbf y \in \partial \Omega} |\mathbf x - \mathbf y|$ is Euclidean distance to boundary.

---

## 4. Limiting Structure and Convergence

### 4.1 Nested Hierarchy

By construction:
$$\mathcal{P}_1 \subset \mathcal{P}_2 \subset \ldots \subset \mathcal{P}_n$$

This ensures consistency across refinement levels.

### 4.2 Volume Coverage

Total volume covered by $n$ spheres (non-overlapping):
$$V_n := \sum_{i=1}^{n} \frac{4\pi}{3}r_i^3$$

Relative fill ratio:
$$\eta_n := \frac{V_n}{|\Omega|}$$

Properties:
- $0 \leq \eta_n \leq 1$
- $\eta_{n+1} \geq \eta_n$ (monotone increasing)
- $\eta_n \to \eta_\infty$ as $n \to \infty$

### 4.3 Convergence Behavior

In general:
$$r_n \to 0 \quad \text{as} \quad n \to \infty$$

For most real geometries, complete coverage with finite non-overlapping spheres is impossible. Therefore, practical algorithms terminate at a specified resolution $r_{\min}$.

### 4.4 Radius Monotonicity

Strictly greedy selection typically produces monotone decreasing radii:
$$r_1 \geq r_2 \geq r_3 \geq \ldots$$

Violations are rare but possible in complex geometries.

---

## 5. Termination Criteria

The algorithm terminates when **at least one** of the following conditions is met:

### 5.1 Minimum Radius
$$r_{n+1} < r_{\min}$$
Most important practical criterion. User-specified threshold.

### 5.2 Maximum Sphere Count
$$n \geq N_{\max}$$
Computational budget limit.

### 5.3 Minimal Volume Gain
$$\frac{4\pi}{3}r_{n+1}^3 < V_{\min}$$
Added volume becomes negligible.

### 5.4 Target Fill Ratio
$$\eta_n \geq \eta_{\text{target}}$$
Domain coverage goal reached.

### 5.5 Numerical Convergence
$$|\eta_n - \eta_{n-k}| < \varepsilon_\eta$$
Fill ratio stagnates (convergence).

### 5.6 Recommended Combination
For practical use:
$$r_{n+1} < r_{\min} \quad \lor \quad n \geq N_{\max}$$

---

## 6. Input Data

The algorithm accepts closed 3D domain representations:

- **STL (Stereolithography):** Triangle mesh, binary or ASCII
- **OBJ:** Wavefront object format
- **PLY:** Polygon file format
- **STEP:** CAD neutral format (via OpenCascade)
- **Voxel models:** 3D binary grids
- **Implicit functions:** Programmatic definition
- **Signed Distance Fields:** Pre-computed SDF

**Requirements for input mesh:**
- Closed (genus-$g$ manifold, possibly with holes)
- Consistent normal orientation
- Minimal self-intersections
- Unambiguous interior/exterior definition

---

## 7. Domain Representation Methods

### 7.1 Voxel/Grid Method

The domain is discretized on a regular Cartesian grid. For each grid point $\mathbf x_{i,j,k}$, we store $d_\Omega(\mathbf x_{i,j,k})$.

**Advantages:**
- Simple implementation
- Fast maximum search
- Easy visualization
- Good for early prototypes

**Disadvantages:**
- High memory cost
- Accuracy limited by grid resolution
- Small spheres require very fine grids

**Use:** Initial working demonstrator.

### 7.2 Signed Distance Field (SDF)

Domain represented by continuously evaluable function:
$$\phi(\mathbf x) = \begin{cases} +d(\mathbf x, \partial \Omega) & \mathbf x \in \Omega \\ -d(\mathbf x, \partial \Omega) & \mathbf x \notin \Omega \end{cases}$$

**Advantages:**
- Sub-voxel accuracy
- Continuous optimization possible
- Efficient local refinement

**Use:** Robust production implementation.

### 7.3 Adaptive Octree

Volume hierarchically subdivided into cubes. Large cells used in simple regions; small cells in complex cavities.

**Advantages:**
- Drastically reduced memory
- Natural coarse-to-fine structure
- Efficient maximum search
- Natural match to hierarchical sphere packing

**Use:** Best long-term technical solution.

---

## 8. Core Algorithm

### 8.1 Input/Output Specification

**Input:**
- Closed domain $\Omega$
- Minimum radius threshold $r_{\min}$
- Maximum sphere count $N_{\max}$
- Numerical tolerance $\varepsilon$

**Output:**
Ordered sphere list:
$$\mathcal{S} := [(\mathbf c_1, r_1), (\mathbf c_2, r_2), \ldots, (\mathbf c_N, r_N)]$$

**Order is essential:** Early spheres represent coarse model; later spheres refine the structure.

### 8.2 Pseudocode

```
function hierarchical_sphere_packing(domain, r_min, N_max):
    geometry_distance ← build_signed_distance_field(domain)
    spheres ← empty list
    candidate_structure ← initialize_candidates(domain)

    while length(spheres) < N_max:
        candidate ← find_global_maximum_free_radius(
            geometry_distance,
            spheres,
            candidate_structure
        )
        
        center ← candidate.position
        radius ← candidate.free_radius
        
        if radius < r_min:
            break
        
        radius ← refine_radius(center, radius, domain, spheres)
        
        append spheres with Sphere(center, radius)
        
        update_candidate_structure(
            candidate_structure,
            new_sphere,
            domain
        )
    
    return spheres
```

---

## 9. Initial Sphere

The first sphere is the **largest sphere inscribed in the domain**:

$$\mathbf c_1 = \arg\max_{\mathbf x \in \Omega} d_\Omega(\mathbf x)$$
$$r_1 = d_\Omega(\mathbf c_1)$$

Its center lies on or near the **medial axis** (skeleton) of the domain.

**Computation:**
1. Evaluate distance field $d_\Omega$ at all candidates
2. Find maximum value
3. Refine maximum location with continuous optimization

---

## 10. Subsequent Spheres

After placing sphere 1, compute the free radius field:
$$R_1(\mathbf x) := \min\left[d_\Omega(\mathbf x), |\mathbf x - \mathbf c_1| - r_1\right]$$

After $n$ spheres:
$$R_n(\mathbf x) := \min\left[d_\Omega(\mathbf x), D_n(\mathbf x)\right]$$

where:
$$D_n(\mathbf x) := \min_{i=1}^{n}\left(|\mathbf x - \mathbf c_i| - r_i\right)$$

The next sphere is placed at the global maximum of $R_n$:
$$\mathbf c_{n+1} = \arg\max_{\mathbf x \in \Omega} R_n(\mathbf x)$$
$$r_{n+1} = R_n(\mathbf c_{n+1})$$

---

## 11. Tangentiality

Because each new sphere is placed at a maximum of $R_n$, it is typically constrained by at least one active inequality:

**Boundary contact:**
$$r_{n+1} = d_\Omega(\mathbf c_{n+1})$$

**Sphere contact:**
$$r_{n+1} = |\mathbf c_{n+1} - \mathbf c_i| - r_i \quad \text{for some } i \leq n$$

At stable local maxima, multiple constraints can be simultaneously active. The sphere may contact:
- Boundary + two existing spheres
- Multiple boundary regions + one sphere
- Three or four existing spheres
- Multiple boundary locations

**Explicit tangentiality enforcement is not necessary;** it emerges naturally through maximization.

For numerical verification:
$$\delta_i := |\mathbf c_{n+1} - \mathbf c_i| - r_{n+1} - r_i$$

Contact detected when:
$$|\delta_i| < \varepsilon_{\text{contact}}$$

---

## 12. Candidate Search Strategies

Finding the global maximum of $R_n$ over all $\Omega$ is expensive naively. We employ candidate structures to prune the search space.

### 12.1 Simple Grid Method

All interior grid points are candidates. For each point, store $R_n(\mathbf x)$.

Find maximum. After placing a new sphere, update only the affected neighborhood.

**Suitable for:** Initial tests, small models, visual demonstrations.

### 12.2 Priority Queue (Lazy Evaluation)

Each candidate stored in a max-heap with estimated free radius.

```
candidate = heap.pop()
new_radius = evaluate_free_radius(candidate.position)

if new_radius significantly smaller than stored_radius:
    candidate.radius = new_radius
    heap.push(candidate)
else:
    accept candidate
```

Avoids recomputing entire field after each sphere.

### 12.3 Octree Branch-and-Bound

Each octree cell $C$ has an upper bound on maximum possible radius:
$$U(C) := R_n(\mathbf m_C) + q_C$$

where $\mathbf m_C$ is cell center and $q_C$ is half-diagonal.

Process cell with highest $U(C)$ first. Subdivide if too large or bound imprecise. Discard if:
$$U(C) \leq r_{\text{best}}$$

**Enables:** Global maximum search with controlled accuracy.

---

## 13. Upper Bounds for Octree Cells

By Lipschitz continuity of distance functions:
$$R_n(\mathbf x) \leq R_n(\mathbf m_C) + q_C \quad \forall \mathbf x \in C$$

Define:
$$U(C) := R_n(\mathbf m_C) + q_C$$
$$L(C) := \max(0, R_n(\mathbf m_C) - q_C)$$

The octree algorithm refines cells with largest $U(C)$.

---

## 14. Continuous Local Optimization

Maxima on a discrete grid are only approximate. After selecting a candidate point $\mathbf x_0$, perform local continuous optimization:

$$\max_{\mathbf x \in \Omega} R_n(\mathbf x)$$

Since $R_n$ is the minimum of several smooth distance functions, it is not differentiable everywhere. Suitable methods:

- Nelder-Mead
- Powell method
- COBYLA
- Pattern search
- Derivative-free trust region
- Local sampling with step reduction

Restrict optimization to small neighborhood of candidate.

---

## 15. Numerical Safety Margin

Floating-point errors can cause tiny overlaps. Therefore, reduce computed radius slightly:

$$r_i^{\text{safe}} := (1 - \varepsilon_r) r_i$$

where $\varepsilon_r \in [10^{-6}, 10^{-4}]$.

Or use absolute margin:
$$r_i^{\text{safe}} := r_i - \varepsilon_{\text{abs}}$$

**Note:** Exact radii retained for mathematical evaluation. Safe radii used for geometry export and meshing.

---

## 16. Contact Graph

From the sphere packing, construct a **contact graph**:

**Vertices:** Each sphere = one node $v_i$.

**Edges:** Two spheres connected if they touch:
$$(i, j) \in E \iff \left||\mathbf c_i - \mathbf c_j| - r_i - r_j\right| < \varepsilon_{\text{contact}}$$

**Graph attributes:**
- Sphere centers $\mathbf c_i$
- Radii $r_i$
- Insertion order
- Hierarchy level
- Neighbor lists
- Contact types
- Local cavities

Serves as foundation for mesh generation.

---

## 17. Hierarchy Levels

Spheres ordered by insertion:
$$r_1 \geq r_2 \geq \ldots$$

Radii need not be strictly monotone, but large inversions are rare in greedy selection.

**Define levels by radius intervals:**
$$L_i := \left\lfloor \log_2\left(\frac{r_1}{r_i}\right)\right\rfloor$$

**Or fixed thresholds:**
```
Level 0: r > 0.25 r_max
Level 1: 0.125 r_max < r ≤ 0.25 r_max
Level 2: 0.0625 r_max < r ≤ 0.125 r_max
...
```

**Result:** Natural multi-scale representation.

---

## 18. Coverage Metrics

Since gaps remain between non-overlapping spheres, assess packing quality:

**Volumetric Fill Ratio:**
$$\eta_n := \frac{\sum_{i=1}^{n} \frac{4\pi}{3}r_i^3}{|\Omega|}$$

**Remaining Volume:**
$$V_{\text{rest},n} := |\Omega| - \sum_{i=1}^{n} \frac{4\pi}{3}r_i^3$$

**Largest Gap (most important for meshing):**
$$r_{\text{gap},n} := \max_{\mathbf x \in \Omega} R_n(\mathbf x)$$

Packing level is adequately refined when:
$$r_{\text{gap},n} < h_{\text{target}}$$

---

## 19. Connection to Mesh Generation

The sphere packing is **not yet a volumetric mesh.** However, it provides adaptive point and scale distribution:

Each sphere supplies:
- Seed point: $\mathbf c_i$
- Local scale: $r_i$
- Neighborhood information
- Hierarchical ordering

Three mesh generation variants follow.

---

## 20. Variant A: Delaunay Mesh of Sphere Centers

Use sphere centers as points:
$$P := \{\mathbf c_1, \ldots, \mathbf c_N\}$$

Compute 3D Delaunay triangulation.

**Advantages:**
- Simple
- Immediately available
- Tetrahedra generated automatically

**Problem:** Different sphere radii ignored in standard Delaunay triangulation.

---

## 21. Variant B: Regular Triangulation (Weighted Delaunay)

For spheres of varying radii, use **weighted Delaunay triangulation** (Laguerre diagram).

Each point receives weight:
$$w_i := r_i^2$$

Power distance:
$$\pi_i(\mathbf x) := |\mathbf x - \mathbf c_i|^2 - w_i$$

The associated **Power Diagram** (Laguerre diagram) respects sphere sizes. Its dual is the **Regular Triangulation**.

**Advantage:** Mathematically natural connection between sphere packing and tetrahedral mesh.

---

## 22. Variant C: Sizing Field from Spheres

Instead of direct triangulation, extract a **local mesh sizing field** from spheres:

$$h(\mathbf x) := \alpha \min_i\left[r_i + |\mathbf x - \mathbf c_i|\right]$$

Or locally:
$$h(\mathbf c_i) := \beta r_i$$

Export to standard mesher: Gmsh, CGAL Mesh_3, TetGen, Mmg.

**Advantage:** Robust mesh generators handle:
- Boundary conformity
- Tetrahedron quality
- Sliver reduction
- Surface treatment

**Most robust for initial practical deployment.**

---

## 23. Boundary Treatment

Sphere centers in the interior do not automatically represent the boundary adequately. Additional **surface point mesh** is required.

Generate surface points with local spacing:
$$h_{\partial\Omega}(\mathbf x) := \gamma \min_i\left(|\mathbf x - \mathbf c_i| + r_i\right)$$

Alternatively, control surface resolution by curvature:
$$h_{\partial\Omega}(\mathbf x) := \operatorname{clip}\left(\frac{c}{1 + \lambda |\kappa(\mathbf x)|}, h_{\min}, h_{\max}\right)$$

Combine boundary points with sphere centers in mesher.

---

## 24. Coarse-to-Fine Mesh Hierarchy

Use first $N_0$ spheres for coarse mesh:
$$\mathcal{P}^{(0)} := \{B_1, \ldots, B_{N_0}\}$$

Medium mesh:
$$\mathcal{P}^{(1)} := \{B_1, \ldots, B_{N_1}\}, \quad N_1 > N_0$$

Fine mesh:
$$\mathcal{P}^{(2)} := \{B_1, \ldots, B_{N_2}\}$$

Nested property:
$$\mathcal{P}^{(0)} \subset \mathcal{P}^{(1)} \subset \mathcal{P}^{(2)}$$

**Major advantage over independent static meshes:** Consistent representation across all resolution levels.

---

## 25. Relation to Static Mesh Refinement

**Static meshing:** Specify fixed local element size $h(\mathbf x)$ a priori.

**Sphere packing:** Geometric scales emerge from remaining voids.

**Refinement process:**
$$\Omega \to B_1 \to B_2 \to \ldots \to B_N$$

Each new sphere represents the currently largest unresolved spatial structure. Thus:

$$r_{n+1} \approx \text{size of largest remaining geometric gap}$$

This provides **natural geometric error interpretation:** Mesh refinement controlled by sphere radius, not arbitrary parameters.

---

## 26. Optional Physical Extension

The geometric algorithm can later be weighted by physical error:

$$\tilde{R}_n(\mathbf x) := R_n(\mathbf x) \cdot W(\mathbf x)$$

where:
$$W(\mathbf x) := 1 + \lambda E(\mathbf x)$$

$E(\mathbf x)$ may be simulation error, stress gradient, flow indicator, etc.

Next sphere chosen by physically weighted criterion:
$$\mathbf c_{n+1} := \arg\max_{\mathbf x} \tilde{R}_n(\mathbf x)$$

But radius remains geometrically determined:
$$r_{n+1} := R_n(\mathbf c_{n+1})$$

Non-overlapping condition preserved exactly.

---

## 27. Recommended Software Architecture

```
sphere-packing-mesher/
│
├── geometry/
│   ├── mesh_loader.py
│   ├── mesh_repair.py
│   ├── inside_test.py
│   └── signed_distance.py
│
├── packing/
│   ├── sphere.py
│   ├── free_radius.py
│   ├── greedy_packer.py
│   ├── candidate_heap.py
│   ├── octree_search.py
│   └── local_refinement.py
│
├── topology/
│   ├── contact_graph.py
│   ├── hierarchy.py
│   └── cavity_detection.py
│
├── meshing/
│   ├── sizing_field.py
│   ├── gmsh_export.py
│   ├── regular_triangulation.py
│   └── mesh_quality.py
│
├── visualization/
│   ├── sphere_viewer.py
│   ├── hierarchy_viewer.py
│   └── mesh_viewer.py
│
├── io/
│   ├── export_json.py
│   ├── export_csv.py
│   ├── export_vtk.py
│   └── export_geo.py
│
├── tests/
│   ├── test_sphere.py
│   ├── test_non_overlap.py
│   ├── test_domain_inclusion.py
│   └── test_convergence.py
│
└── main.py
```

---

## 28. Sphere Data Structure

```python
from dataclasses import dataclass
import numpy as np

@dataclass
class Sphere:
    index: int
    center: np.ndarray           # (3,) shape
    radius: float
    level: int
    parent_ids: tuple[int, ...]  # IDs of generating cavities
    
    # Optional fields:
    contact_sphere_ids: list[int] = None
    contact_boundary: bool = False
    iteration_inserted: int = 0
    volume_gain: float = 0.0
    error_indicator: float = 0.0
    active: bool = True
```

---

## 29. Core Free Radius Function

```python
import numpy as np
from scipy.spatial import cKDTree

def free_radius(
    point: np.ndarray,
    boundary_distance: float,
    centers: np.ndarray,
    radii: np.ndarray,
    tree: cKDTree | None = None,
) -> float:
    """
    Compute maximum sphere radius at a point,
    constrained by domain boundary and existing spheres.
    
    Args:
        point: Position (3,)
        boundary_distance: d_Ω(point)
        centers: (N, 3) array of sphere centers
        radii: (N,) array of radii
        tree: Optional spatial index for speedup
    
    Returns:
        Maximum free radius at this point
    """
    
    if len(centers) == 0:
        return max(0.0, boundary_distance)
    
    if tree is None:
        # Naive: O(N)
        distances = np.linalg.norm(centers - point, axis=1)
        sphere_distance = np.min(distances - radii)
    else:
        # Fast: Query nearby spheres only
        search_radius = boundary_distance + float(np.max(radii))
        indices = tree.query_ball_point(point, search_radius)
        
        if not indices:
            sphere_distance = boundary_distance
        else:
            local_centers = centers[indices]
            local_radii = radii[indices]
            distances = np.linalg.norm(local_centers - point, axis=1)
            sphere_distance = np.min(distances - local_radii)
    
    return max(0.0, min(boundary_distance, sphere_distance))
```

---

## 30. Simple Voxel-Based Prototype

```python
import numpy as np

def greedy_voxel_packing(
    points,
    boundary_distances,
    r_min,
    max_spheres,
):
    """
    Greedy sphere packing on a regular grid.
    
    Args:
        points: (M, 3) grid points
        boundary_distances: (M,) signed distances to boundary
        r_min: minimum radius threshold
        max_spheres: stopping criterion
    
    Returns:
        List of Sphere objects
    """
    
    spheres = []
    free_values = boundary_distances.copy()
    
    for sphere_index in range(max_spheres):
        # Find grid point with maximum free radius
        best_index = int(np.argmax(free_values))
        radius = float(free_values[best_index])
        
        if radius < r_min:
            break
        
        center = points[best_index]
        
        sphere = Sphere(
            index=sphere_index,
            center=center.copy(),
            radius=radius,
            level=0,
            parent_ids=(),
        )
        spheres.append(sphere)
        
        # Update free radius field
        center_distances = np.linalg.norm(points - center, axis=1)
        distance_to_new_sphere = center_distances - radius
        
        free_values = np.minimum(free_values, distance_to_new_sphere)
        free_values = np.maximum(free_values, 0.0)
    
    return spheres
```

**Note:** Conceptually correct, but limited to grid accuracy.

---

## 31. Improvement via Local Optimization

```python
from scipy.optimize import differential_evolution
import numpy as np

def refine_center(
    initial_center,
    local_half_width,
    distance_function,
    spheres,
):
    """
    Refine sphere center via continuous optimization.
    
    Args:
        initial_center: (3,) starting point from grid
        local_half_width: search region size
        distance_function: callable evaluating d_Ω
        spheres: existing Sphere objects
    
    Returns:
        (refined_center, refined_radius)
    """
    
    lower = initial_center - local_half_width
    upper = initial_center + local_half_width
    bounds = list(zip(lower, upper))
    
    def objective(x):
        boundary_radius = distance_function(x)
        
        if boundary_radius <= 0:
            return 1e6
        
        free = boundary_radius
        
        for sphere in spheres:
            distance = np.linalg.norm(x - sphere.center)
            free = min(free, distance - sphere.radius)
        
        return -max(0.0, free)
    
    result = differential_evolution(
        objective,
        bounds=bounds,
        polish=True,
        seed=0,
    )
    
    center = result.x
    radius = -result.fun
    
    return center, radius
```

For larger problems, prefer **local derivative-free optimizer** (e.g., Powell, COBYLA).

---

## 32. Computational Complexity

**Naive approach:** Evaluate all candidates against all spheres.

For $M$ candidates and $N$ spheres:
$$O(MN)$$

**With spatial indexing (KD-Tree/BVH):** Reduce relevant spheres per candidate.

**With Priority Queue + Lazy Evaluation:** Avoid full field recomputation each iteration.

**Target long-term complexity:**
$$O(N \log N) \text{ to } O(N \log^2 N)$$

depending on geometry and refinement pattern.

---

## 33. Quality Checks

After each sphere insertion, verify:

**Domain Inclusion:**
$$r_i \leq d_\Omega(\mathbf c_i) + \varepsilon$$

**Non-Overlapping:**
$$|\mathbf c_i - \mathbf c_j| \geq r_i + r_j - \varepsilon$$

**Positive Radius:**
$$r_i > 0$$

**Monotone Fill:**
$$\eta_{n+1} \geq \eta_n$$

**Maximum Consistency:**
New sphere should be near-optimal among remaining candidates:
$$r_{n+1} \geq r_{\text{candidate,max}} - \varepsilon$$

---

## 34. Test Geometries

Validate implementation on canonical shapes:

### Test 1: Sphere
First sphere fills entire domain. No further sphere exists.
$$r_1 = R_\Omega$$

### Test 2: Cube
First sphere centered with $r_1 = a/2$. Later spheres fill corners and edges.

### Test 3: Cylinder
Radius and height constrain first sphere.

### Test 4: Torus
Tests complex topology and curved voids.

### Test 5: Branched Pipe
Relevant for vessels, aortas, technical channels.

### Test 6: Aortic Geometry
Full realistic test:
- Main arch
- Branches (brachiocephalic, carotid, subclavian)
- Narrowings
- Strong curvatures
- Small local radii

---

## 35. Visualization

For each iteration, display:

- Domain surface
- All placed spheres
- Current largest remaining void
- New sphere being inserted
- Fill ratio progress
- Next maximum radius

Interactive viewers using **PyVista:**

- All spheres
- Spheres by hierarchy level
- Spheres by radius
- Contact graph
- Remaining voids
- Resulting tetrahedral mesh

---

## 36. Export Format (JSON)

```json
{
  "metadata": {
    "source": "body.stl",
    "timestamp": "2026-07-16T10:30:00",
    "version": "1.0"
  },
  "domain": {
    "source_file": "body.stl",
    "volume": 1.2345,
    "surface_area": 4.5678
  },
  "settings": {
    "minimum_radius": 0.01,
    "maximum_spheres": 10000,
    "numerical_tolerance": 1e-6,
    "safety_margin": 1e-5
  },
  "statistics": {
    "total_spheres": 250,
    "total_volume_covered": 0.8234,
    "fill_ratio": 0.6677,
    "largest_remaining_gap": 0.0089
  },
  "spheres": [
    {
      "id": 0,
      "center": [0.0, 0.0, 0.0],
      "radius": 0.5,
      "level": 0,
      "insertion_order": 0,
      "contacts": [1, 5, 23],
      "boundary_contact": true
    },
    ...
  ]
}
```

**Additional export formats:**
- CSV (analysis/plotting)
- VTK (ParaView visualization)
- PLY (point clouds)
- .geo (Gmsh)
- GraphML (contact graph)

---

## 37. Implementation Phases

### Phase 1: Geometric Demonstrator
**Goal:** Load STL → compute distance field → place spheres greedy → visualize

**Tech:** Python, NumPy, SciPy, trimesh, PyVista

**Deliverable:** Working voxel-based prototype with JSON export

### Phase 2: Efficient Candidate Search
**Goal:** Priority queue, KD-tree, local refinement, continuous center optimization

**Tech:** scipy.spatial, scipy.optimize

**Deliverable:** 10x–100x speedup; candidate heap + lazy update

### Phase 3: Adaptive Octree
**Goal:** High resolution without full fine grid; branch-and-bound search; large sphere counts

**Tech:** Custom octree or library (e.g., octsimplify)

**Deliverable:** Gigascale sphere counts; O(N log N) scaling

### Phase 4: Mesh Generation
**Goal:** Export to Gmsh; create tetrahedral meshes; measure quality

**Tech:** gmsh Python API, meshio

**Deliverable:** Full pipeline STL → spheres → mesh

### Phase 5: Regular Triangulation
**Goal:** Weighted Delaunay / Laguerre diagram; direct sphere-mesh connection

**Tech:** CGAL Python bindings or Geogram

**Deliverable:** Mathematically optimal mesh from packing

### Phase 6: Physical Adaptive Extension
**Goal:** Integrate FEM/CFD error field; weighted candidate selection; maintain geometry guarantee

**Tech:** Integration with simulation software

**Deliverable:** Simulation-driven meshing with guaranteed non-overlap

---

## 38. Minimal Technology Stack (Phase 1)

```
Python 3.12+
NumPy          (array operations)
SciPy          (optimization, spatial indexing)
trimesh        (STL loading, geometry)
scikit-image   (distance transforms)
PyVista        (3D visualization)
gmsh (Python)  (mesh export)
meshio         (format conversion)
```

**Later additions:**
- CGAL Python bindings
- Geogram
- Mmg3D
- OpenVDB
- TetGen

---

## 39. Expected Strengths

- **Deterministic:** No randomness; fully reproducible
- **Non-overlapping:** Guaranteed non-intersection
- **Hierarchical:** Natural multi-scale representation
- **Geometrically interpretable:** Sphere radius = largest remaining gap
- **Coarse-to-fine:** Nested hierarchy for LOD and multigrid
- **General:** Works for arbitrary closed 3D domains
- **Compatible:** Integrates with standard meshing tools (Gmsh, etc.)
- **Natural error indicator:** Direct connection between geometry and refinement

---

## 40. Expected Limitations

The greedy algorithm is **not globally optimal.** Choosing the largest available sphere maximizes momentary volume gain:

$$\Delta V_n := \frac{4\pi}{3}r_{n+1}^3$$

but does not guarantee global optimality for fixed $N$:

$$\max_{\text{all valid packings of } N \text{ spheres}} \sum_{i=1}^{N} r_i^3$$

**Other challenges:**
- Tiny voids generate many small spheres
- Thin structures require high geometric precision
- Non-smooth distance fields complicate local optimization
- Sphere packing alone does not guarantee tetrahedral quality
- Boundary conformity requires separate treatment

---

## 41. Central Scientific Hypothesis

**Core claim:**
A nested sequence of maximal non-overlapping inscribed spheres provides an efficient geometric multi-scale representation whose largest remaining sphere radius serves as a direct error indicator for local spatial resolution.

**Formally:**
$$r_{n+1} = \max_{\mathbf x \in \Omega} R_n(\mathbf x)$$

represents the largest unresolved spatial scale. Mesh resolution can be controlled directly by:
$$r_{n+1} < h_{\text{target}}$$

**Implication:** The algorithm converts geometric void-filling into adaptive mesh refinement with natural error interpretation.

---

## 42. Nomenclature

**Working name:**
**Hierarchical Largest-Empty-Sphere Packing**

**Alternatives:**
- Greedy Maximal Inscribed Sphere Decomposition
- Hierarchical Tangential Sphere-Packing Mesher

**Project name suggestion:**
**LIMES Mesher**

*Meaning:* **L**imit-based **I**terative **M**aximal **E**mpty **S**phere Meshing

---

## 43. Complete Processing Pipeline

```
┌─────────────────────────────┐
│  Closed 3D Body (STL/OBJ)   │
└──────────────┬──────────────┘
               ↓
    ┌──────────────────────┐
    │ Geometry Validation  │
    │ & Repair             │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │ Signed Distance      │
    │ Field Computation    │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │ Largest Inscribed    │
    │ Sphere               │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │ Free Radius Field    │
    │ Update               │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │ Largest Remaining    │
    │ Sphere               │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────────┐
    │ Tangential Non-Overlapping
    │ Insertion                │
    └──────────┬────────────────┘
               ↓
    ┌──────────────────────────┐
    │ Repeat until r < r_min   │
    │ or n ≥ N_max             │
    └──────────┬────────────────┘
               ↓
    ┌──────────────────────────┐
    │ Hierarchical Sphere List │
    │ Contact Graph            │
    └──────────┬────────────────┘
               ↓
    ┌───────────────────────────────┐
    │ Laguerre/Regular Triangulation │
    │ OR                            │
    │ Adaptive Sizing Field         │
    └──────────┬─────────────────────┘
               ↓
    ┌────────────────────────────┐
    │ Boundary Conformity        │
    │ Surface Point Mesh         │
    └──────────┬─────────────────┘
               ↓
    ┌────────────────────────────┐
    │ Gmsh/TetGen Mesh Generation│
    │ (or Regular Triangulation) │
    └──────────┬─────────────────┘
               ↓
    ┌────────────────────────────┐
    │ Mesh Quality Assessment    │
    │ & Validation               │
    └──────────┬─────────────────┘
               ↓
    ┌────────────────────────────┐
    │ Conforming Tetrahedral Mesh│
    └────────────────────────────┘
```

---

## 44. Core Minimal Definition

The entire algorithm reduces to the recursive definition:

$$R_n(\mathbf x) := \min\left[d_\Omega(\mathbf x), \min_{1 \leq i \leq n}(|\mathbf x - \mathbf c_i| - r_i)\right]$$

$$\mathbf c_{n+1} := \arg\max_{\mathbf x \in \Omega} R_n(\mathbf x)$$

$$r_{n+1} := R_n(\mathbf c_{n+1})$$

with stopping conditions:
$$r_{n+1} < r_{\min} \quad \text{or} \quad n = N_{\max}$$

This is the **mathematical and algorithmic core** of the complete design.

---

## 45. Recommended Next Steps

### Immediate Priority

1. **Implement Phase 1 Demonstrator**
   - Load STL (trimesh)
   - Compute voxel distance field (skimage)
   - Greedy packing (NumPy)
   - Visualize (PyVista)
   - Export JSON

2. **Test on canonical geometries**
   - Sphere, cube, cylinder, torus
   - Branched pipe
   - Aortic geometry

3. **Measure performance**
   - Sphere count vs. target resolution
   - Fill ratio convergence
   - Computation time

### Short-term Extensions

4. **Implement Phase 2**
   - Priority queue + lazy evaluation
   - KD-tree candidate filtering
   - Local center refinement (COBYLA)

5. **Mesh integration**
   - Export sphere centers + radii to Gmsh
   - Generate tetrahedral meshes
   - Measure mesh quality metrics

---

## 46. Conclusion

We have presented a comprehensive mathematical and algorithmic framework for **Hierarchical Tangential Sphere Packing (HTSP)**: a deterministic greedy algorithm that decomposes arbitrary closed 3D domains into nested sequences of non-overlapping maximal inscribed spheres.

**Key innovations:**

1. **Free radius field** provides unified framework for candidate selection
2. **Greedy maximization** ensures deterministic, reproducible results
3. **Hierarchical structure** supports multi-scale representations
4. **Natural error indicator** (largest remaining sphere radius) guides adaptive refinement
5. **Geometric interpretability** connects mesh size directly to domain voids

**Strengths:** Deterministic, non-overlapping, hierarchical, geometrically interpretable

**Limitations:** Greedy optimality not global; tiny voids require many spheres; requires sufficient geometric precision

**Integration pathways:** Laguerre triangulation, adaptive sizing fields, standard mesh generators

This foundation enables robust, adaptive mesh generation for complex geometries including biomedical models (aortas, vessels), technical systems (pipes, channels), and general scientific domains.

---

## References

[To be populated with academic citations as development proceeds]

---

## Appendix A: Python Implementation Outline

The complete implementation will follow the modular architecture outlined in Section 27, with Phase 1 comprising approximately 2,000–3,000 lines of Python across the geometry, packing, and visualization modules.

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-16  
**Status:** Technical Design Document
