# Syntax

The Nexus expression grammar

## Grammar (EBNF)

```text
program  := statement ( '\n' statement )*
statement:= name '=' expr | expr

expr     := atom
          | expr '>'  expr        (* pipeline    *)
          | expr '>>' expr        (* iterate     *)
          | op  '@'   arg         (* application *)
          | '{' expr ( ',' expr )* '}'  (* list  *)

atom     := name | literal | warehouse_ref
name     := [a-zA-Z_][a-zA-Z0-9_]*
literal  := string | number | bool
warehouse_ref := 'warehouse[' string ']'

op       := name
arg      := name | string | number | '{' expr ( ',' expr )* '}'
```

## Operators at a glance

| Operator | Symbol | Meaning |
| --- | --- | --- |
| Pipeline | > | Feed the left value into the right stage |
| Application | @ | Apply a named operator with a named argument |
| Iterate / converge | >> | Repeatedly apply until convergence |
| List | { } | Collect multiple expressions as a set |

## Whitespace and comments

Whitespace is insignificant except inside string literals. Line comments begin with `--`.

```text
-- This is a comment
d > saxs   -- inline comment
```

## Precedence

`>>` binds tighter than `>`, which binds tighter than `@`. Use parentheses when in doubt:

```text
(d > saxs) >> refine@pr
```
