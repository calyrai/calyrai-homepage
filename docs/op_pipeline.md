# Pipeline `>`

Pipe a typed value into the next computation stage

## Signature

$$a : T_1 \;>\; f : T_1 \to T_2 \;\Rightarrow\; T_2$$

The pipeline operator feeds the output of the left-hand expression as the single input of the right-hand stage. Both sides must agree on the transferring type.

## Examples

```text
d > saxs                  -- Dataset → Signal(q-space)
s > compute@pr            -- Signal(q-space) → Distribution(r-space)
p > fit@guinier           -- Distribution → Fit
d > saxs > compute@pr > fit@guinier   -- full chain
```

## Chaining

Pipeline chains associate left-to-right. The following are equivalent:

```text
d > saxs > compute@pr
(d > saxs) > compute@pr
```

## Multiple sources

To pipe a list into a stage that accepts lists, wrap in `{ }`:

```text
{d1, d2, d3} > merge > saxs
```
