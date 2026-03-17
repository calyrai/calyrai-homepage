# Theory

We start from a high-dimensional representation $x \in \mathbb{R}^d$ and compute a PCA projection.

## Notes

- PCA is computed on centered data.
- Principal components define a low-dimensional coordinate system.

```python
# pseudo-code
X = X - X.mean(axis=0)
U, S, Vt = svd(X, full_matrices=False)
Z = X @ Vt[:2].T
```
