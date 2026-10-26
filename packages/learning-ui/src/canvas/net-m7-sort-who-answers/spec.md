# Canvas spec: net-m7-sort-who-answers

Course and chapter: networking, 7.3 beat 4 (playable). Renderer: the existing sorter primitive, `makeSorterCanvas` with the `models/sorter.ts` model. No new component.

## Claim

Each level of the DNS tree knows only who runs the level below it: the root knows who runs .com and .org, a top-level server knows who runs example.com, and only the authoritative server of example.com holds the address of shop.example.com [S24].

## Touch

One card at a time, three servers under it: Root, Top-level and Authoritative. Tap a server, or drag the card onto it. A right answer flies into its server and the count ticks up; a wrong one shakes and gives a short reason, and the card stays for another try. Six cards: who runs .com, who runs example.com, the address of shop.example.com, who runs .org, who runs example.org, and the address of api.example.com.

## Limits

A simplified tree with three levels and stand-in names. The sorting follows the chapter's rule, not a full model of DNS: real lookups use caches, and each level may be many machines. The fallback, if this sorter is not built, is the quiz question in the chapter.
