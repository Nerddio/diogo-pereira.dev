# ADR-008 — Contact information exposure

|                |                                  |
| -------------- | -------------------------------- |
| **Status**     | **Accepted** — 7 October 2026    |
| **Date**       | 7 October 2026                   |
| **Deciders**   | Diogo Pereira (tech lead)        |
| **Depends on** | ADR-002, ADR-003 (accepted)      |
| **Relates to** | NFR-05, US-38, US-48, US-49, D24 |

## Context

A portfolio that cannot be contacted has failed at its only job, so some contact information
has to be public. The question is which, and the answer is constrained by a property that is
easy to underestimate: **publishing to an indexed domain is close to irreversible.** A page
can be deleted; the copy a scraper took cannot. A detail published for a week and removed is
public permanently, and nothing in the deletion tells you where it went.

There are four surfaces here, not one, and only the first is obvious.

1. **The rendered pages** — what a visitor reads.
2. **The structured data** — the JSON-LD `Person` block, which is machine-readable by
   construction and therefore a materially easier harvesting target than markup. D24 already
   removed the email and street address from it.
3. **The repository's working tree** — public, so every file is readable whether or not a
   route renders it.
4. **The repository's git history** — also public, and the one that goes wrong silently. A
   file deleted in a later commit is still in the history of every clone, and removing it
   means rewriting history that other people may already hold.

The source material is the CV handed to strangers at interviews, which carries a phone
number and more. The decision is which parts of that move onto a public indexed domain, and
the answer is not "all of it, it's already out there" — a document handed to one recruiter
and a page crawled continuously by everything are different acts.

The threat here is not an attacker. There is nothing to steal. It is volume: scrapers,
automated recruiter dialling lists, and the long tail of anyone who ever obtains the data
afterwards.

## Decision

**Published:** name, job title, locality and country (Gouda, Netherlands), work rights,
languages, email address, LinkedIn, GitHub, and the professional experience content at the
level already printed on the public CV.

**Not published anywhere** — not on a page, not in the structured data, not in the working
tree, not in git history: **phone number, postal address, downloadable CV file.**

### The email address is published in plain text, deliberately unobfuscated

It appears as a readable `mailto:` link on the Contact page and in the footer. It will be
harvested. That is accepted rather than fought, because every available defence costs a
legitimate reader more than it costs a scraper.

- **HTML entity encoding** is reversed by anything that parses HTML, which is every scraper.
- **Assembling the address in JavaScript** breaks NFR-03, which requires every route to be
  complete and readable with client-side JavaScript disabled, and leaves the one piece of
  information the page exists to convey missing for a reader whose scripts did not run.
- **An image of the address** cannot be copied, cannot be clicked, and cannot be read by a
  screen reader, which puts it straight through the WCAG 2.2 AA conformance ADR-006 and
  NFR-04 commit to.

The control that actually works is at the mailbox, not on the page. The address published is
on the domain this site already owns, forwarded to a personal inbox by Cloudflare Email
Routing, which carries unlimited inbound mail at no cost on the plan this project already
uses. Because it exists for this purpose and nothing else, it can be retired and replaced if
it is ever drowned -- and that property is what makes publishing it acceptable at all. Spam
filtering handles the rest. US-49 carries the change.

It replaced a personal Gmail address, which was the original intention and was wrong for a
reason worth recording rather than quietly correcting. A Gmail address is also a Google
account login, so publishing one on an indexed domain gives away half a credential pair,
permanently, and invites phishing that works better for being addressed to an account known
to be live. It also has no retirement path, which defeats the mitigation above: the argument
for publishing an address unobfuscated rests on being able to abandon it, and nobody can
abandon the address their logins recover to.

What the alias does not do is conceal the personal address from someone who receives a
reply, because routing forwards mail inward and sending as the alias is a paid feature this
project does not buy. That is the right side of the trade. The exposure removed is to
everyone who never writes -- which is the whole of the scraping problem -- and the exposure
kept is to a person already being answered deliberately.

### No phone number

A phone number on an indexed domain cannot be withdrawn, and its dominant real use is
automated recruiter dialling rather than the hiring engineer this site is written for. The
cost is friction for a recruiter who prefers to call — they ask by email first, which is a
delay of hours, not a lost conversation.

### Locality and country, not a postal address

A recruiter needs to know he is in the Netherlands and can legally work there. "Gouda, NL"
answers that completely. A street address answers nothing anyone needs and is a
personal-safety question as much as a privacy one.

### No downloadable CV file. A print stylesheet instead

Experience lives as HTML on the About page, and a `@media print` stylesheet (US-48) turns
that page into a clean document the visitor's own browser saves as a PDF.

This serves a real case rather than a hypothetical one: a visitor arriving from LinkedIn has
not necessarily seen a CV, and may want something to keep or forward rather than a page to
read. The gap is the artefact, not the information -- the About page already carries the
experience content at the level the public CV states it.

Generating the document in the visitor's browser rather than shipping a file is what removes
the costs. Nothing enters git history, so nothing becomes permanent by accident. There is no
document metadata, because no document exists until the visitor makes one -- no author
field, no producer string, no local filesystem path left behind by whatever exported it. It
cannot go stale, because it is rendered from the page as it stands. And it stays inside
every gate the pipeline already runs: Lighthouse, the accessibility scan and the link check
all apply to the page it is made from.

What this gives up: a browser-printed page looks like a browser-printed page, not a designed
CV. Some recruitment processes also expect to receive a file by email, and that still means
asking. Both are real costs and neither is worth a permanent artefact sitting outside the
pipeline.

Note on reasoning this record does _not_ use: the project brief argued that "HTML outranks a
PDF for search". Search engines do index PDFs, and no attempt was made here to verify a
ranking claim, so it is not relied on. The argument above stands without it.

### Commit metadata

Commits are authored with the GitHub noreply address. A real address in a public
repository's history is permanently harvestable, and unlike a page it cannot be removed
without rewriting history that others may have cloned. US-38 verifies the whole surface
before release by searching the working tree, the build output and `git log -p` for a phone
number, a postal address or a CV file — history included, because that is the surface a
reviewer would not think to check.

## Options considered

**A CV PDF behind an email gate — rejected.** It is the conventional pattern and it would
capture addresses of interested visitors. It needs a backend and a store of personal data,
both removed by ADR-002 and ADR-003, and it withholds a document from someone evaluating you
in order to extract their details first. For a candidate seeking work, that is the wrong way
round.

**A CV PDF with the phone number removed, published on the site — rejected.** Proposed as a
way to serve a visitor who arrives from LinkedIn having never seen a CV, with a note
directing anyone who would rather call to the copy held on LinkedIn. The goal is right, and
the print stylesheet above serves it; the mechanism carries three costs that are invisible
at the moment the file is committed.

Removing text from a PDF and hiding it are different operations that look identical. A white
box drawn over a number, or white text, leaves the characters in the text layer, where
`pdftotext` recovers them in one command. Even a genuine deletion can leave the earlier
version in the file, because PDFs support incremental updates that append a revision rather
than rewriting the bytes.

PDFs also carry metadata nobody sees: author, creator and producer strings, timestamps, and
depending on the exporting tool the local filesystem path and account name of the source
document.

And committing it makes it permanent, which is the mechanic this whole record is about. The
wrong version landing once puts a phone number in the history of every clone, and unlike a
leaked credential a phone number cannot be rotated.

None of that makes it impossible. Stripping the metadata, plus a test that extracts the
committed file's text layer and fails the build on a phone-number pattern, would make it
safe, and that test is roughly fifteen lines. It was rejected because the print stylesheet
reaches the same goal with none of the surface.

The accompanying idea of holding the phone-bearing copy on LinkedIn needs checking before
anything relies on it: if the mechanism is a document featured on a public profile, the
number is public anyway and the split buys nothing.

**A contact form instead of `mailto:` — rejected.** Already out of scope: it needs spam
handling, a mail service and a privacy notice for two fields, plus a backend this
architecture does not have. A `mailto:` link has none of those and fails in exactly one way,
visibly, for a visitor with no mail client configured — who can still copy the address,
because it is plain text.

**LinkedIn only, no email published — considered seriously.** It is the strongest position
against harvesting, since LinkedIn absorbs the spam. Rejected because messaging on LinkedIn
requires an account, which excludes a reader who does not have one and makes the only route
to a response depend on a third party's product decisions. An email address that works
without anyone's permission is worth the spam.

**Publishing everything already on the CV — rejected.** The argument is that the document is
already circulating so nothing is withheld in practice. It conflates a document handed to a
named person with a page crawled continuously and copied without limit. The phone number is
the specific loss, and it is unrecoverable.

## Consequences

**Gained**

- The irreversible items are never published, so the decision cannot be regretted. Every
  published item is one that can be withdrawn in a meaningful sense or is already public.
- Experience content sits inside the pipeline's existing metadata, structured data,
  accessibility and performance gates rather than in a file outside all of them, and the
  document a visitor takes away is generated from it, so it cannot disagree with the page.
- Nothing about the contact surface depends on a backend, a store of personal data, or a
  GDPR position more complicated than "none is collected".

**Accepted costs**

- **The published email will be scraped and will receive spam.** This is the price of being
  reachable without an account, and it is paid at the mailbox. It is survivable only because
  the address is disposable; it would not be acceptable for a personal account.
- **A reply discloses the personal address** to that correspondent, since sending as the
  alias is not free. Acceptable: the recipient is someone already being answered.
- **Forwarded mail can be classified as spam by the destination provider**, and the first
  test message was. Forwarding re-sends the message from Cloudflare's servers while it still
  claims to come from the original sender's domain, so the sender authentication fails and
  the mismatch is exactly what a spam filter looks for. Nothing is misconfigured; it is
  inherent to forwarding. The destination mailbox needs a rule exempting the address, and
  US-49 does not count as done until a message arrives in the inbox rather than the spam
  folder. An unmonitored spam folder would make this change worse than no change.
- **The document a visitor produces is a printed web page, not a designed CV.** Some
  recruitment processes also expect a file to arrive by email, which still means asking.
- **A recruiter who prefers the phone has to email first.**
- **US-38 has to actually run.** This decision is only true if the repository is checked,
  and the check must cover git history, which is the part that cannot be fixed afterwards.

**Security**

The failure mode worth naming is the one that looks harmless at the time: committing a file
containing a phone number, a signed document or an old CV, then deleting it in a later
commit. Deleting a file does not remove it from history — every clone made before or after
still contains it, and `git log -p` finds it immediately. It is the same mechanic that makes
a committed credential permanent and the reason a leaked token must be rotated rather than
deleted. The defence is not to commit it, which is why US-38 searches history rather than
only the working tree.

The structured data deserves its own mention. Schema.org permits `email` and a full
`PostalAddress` on a `Person`, and a tool suggesting them would be giving correct advice
about the format. D24 withheld both because a machine-readable field is an easier target
than a link in markup and neither buys a recruiter anything.

**Verified before acceptance**

The current Contact page publishes an email address, LinkedIn and GitHub, and nothing else —
no phone number, no postal address, no file. That address is still the personal Gmail one;
US-49 replaces it and must land before this record describes the site accurately. Cloudflare's
pricing documentation was checked on 7 October 2026 for the claim that inbound routing is
free: it lists inbound Email Routing as unlimited on the Workers Free plan. The JSON-LD `Person` block carries
`addressLocality` and `addressCountry` only, with no email and no street. Both confirmed by
reading the files rather than the specification. The full history search is US-38's job and
has not yet been run, so this record describes the working tree and the built output, not
yet the history.

Two decisions here are taken rather than built. US-48 carries the print stylesheet, and until
it ships a visitor wanting a document still has to ask by email. US-49 carries the address
change, and until it ships the personal address remains published — which is why it is M4
work rather than backlog.

**Reversibility**

Asymmetric, which is the point. Publishing a phone number later takes one commit; removing
one after it has been indexed is not possible at all. The same holds for a CV file in git
history. Starting minimal costs little and can be undone; starting generous cannot.
