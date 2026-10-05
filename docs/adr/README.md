# Architecture decision records

An architecture decision record captures one significant technical choice: the context it
was made in, the decision itself, the options rejected and why, and the consequences
accepted. One decision per file, one page each.

## Conventions

**Numbering is permanent.** Identifiers are allocated once and never reused or renumbered,
so gaps in the sequence are information rather than mistakes. A missing number means a
record that was reserved and not written, or written and withdrawn.

**`Date` is when the record was written. `Status` carries its own date.** These differ
whenever a decision was drafted on one day and accepted on another, which is usual here.
ADR-002 was written on 3 September and accepted on the 4th; both dates are true and the
table shows each in its own row.

**Status values used in this project:**

| Value                                    | Meaning                                                  |
| ---------------------------------------- | -------------------------------------------------------- |
| `Proposed — awaiting tech lead approval` | Drafted, not yet decided. Nothing should be built on it. |
| `**Accepted** — <date>`                  | Decided on that date. Live unless superseded.            |
| `**Superseded by ADR-0NN** — <date>`     | Replaced. Kept in the record, never deleted.             |

A superseded record stays in the repository with its reasoning intact. Deleting it would
hide the fact that the decision changed, which is the part worth reading.

**Status is written here first.** `docs/STATUS.md` summarises these records for people
scanning project state, but each file is the authoritative statement of its own status. On
3 October 2026 seven of nine files still read "awaiting tech lead approval" for decisions
accepted weeks earlier, because only the summary had been maintained. If the two disagree,
the file wins and the summary is corrected.

There is deliberately no index of records in this file. An index is a second copy of the
same state, and a second copy is a second thing to drift.
