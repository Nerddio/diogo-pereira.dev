# Release checklist

Run before tagging any release. US-38, NFR-14.

```bash
pnpm generate && pnpm sweep
```

`pnpm generate` first, every time: the sweep inspects the build output, and a stale
`.output` proves nothing about the release being tagged. The script enforces this rather
than trusting it — it fails if the build is older than any source file.

---

## What the sweep checks, and what each check proves

| #   | Scope                                                    | Proves                                                                                                                            |
| --- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Commit metadata, all refs                                | Every author and committer is a GitHub noreply address, so no personal address is published through commit headers                |
| 2   | Working tree — tracked **and** untracked-but-not-ignored | Nothing is staged or sitting unstaged that would be committed next                                                                |
| 3   | Build output                                             | Nothing reaches a visitor. Also lists every email address actually served, so the contact surface is observed rather than assumed |
| 4   | Full history, `git log --all -p`                         | Nothing was ever committed and later deleted — because deletion does not remove it                                                |

Each check prints what it searched and how much of it. A check that reports "nothing
found" identically for "clean" and "the pattern was wrong" is evidence of nothing, and
this project found eight controls that passed while not working.

**The script has been made to fail on purpose.** A file containing a Dutch phone number,
postcode and street name was planted in the working tree; checks 2 reported all three and
the script exited non-zero. That test also found a false positive — the script matched its
own pattern definitions — which is why it excludes itself by exact path, and only itself.

## What it does not prove

- **Patterns, not meaning.** It looks for Dutch phone formats, Dutch postcode shape, common
  Dutch street-name suffixes and consumer email domains. An address written out in words, a
  non-Dutch format, or a phone number spelled unusually would not match.
- **Git only.** It cannot see GitHub. An address in an issue, a pull request comment or a
  release note is invisible to it and is not removed by anything here.
- **Not a privacy audit.** It checks the three things NFR-14 names. It is not a general
  search for personal data.

---

## Recorded result — 19 October 2026

Run against `c35d4fb`, 85 commits, 81 tracked files, 41 built files, 39,269 lines of
history diff.

| Scope        | Phone | Postcode | Street | CV/document |
| ------------ | ----- | -------- | ------ | ----------- |
| Working tree | none  | none     | none   | none        |
| Build output | none  | none     | none   | none        |
| Full history | none  | none     | none   | never added |

The only email address in the build output is `contact@diogo-pereira.dev`.

**Two personal email addresses are permanently in the history**, found by this sweep and
accepted rather than removed. See **D28** in `docs/STATUS.md` for the reasoning.

They are held in the script as SHA-256 digests rather than plaintext, and D28 describes
them without naming them. Writing them out would add a fresh copy to the repository and its
history — which is the exposure being recorded. The sweep caught precisely that when D28
was first drafted with the addresses spelled out. The digests are not secrecy: anyone who
already knows an address can hash it and confirm it. They avoid creating a new copy, which
is the only part still under anyone's control. Anything whose digest is not listed still
fails.

## Prevention, which is the part that lasts

- [x] Local git identity set to the GitHub noreply address.
- [ ] GitHub account → **Settings → Emails** → **Keep my email addresses private** and
      **Block command line pushes that expose my email**. The second makes git itself
      refuse a push that would expose the address, which is a control rather than a habit.
      _Not yet confirmed — tick this when done._
