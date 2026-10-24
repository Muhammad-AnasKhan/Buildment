import type { SequenceSpec } from "../renderers/sequence/types";

// Learn and Build with AI course, chapter 3.5 "Listen to meet it, read to
// learn it". Lina puts three trusted sources into a source notebook, listens
// to an audio overview on her walk, reads the textbook chapter, and checks one
// claim the audio made: it was wrong, and it left out a detail. See spec.md.
export const listenThenRead: SequenceSpec = {
  kind: "sequence",
  title: "Listen first, then read and check",
  purpose: "See why the audio overview is where you meet a topic, and the source page is where you check it.",
  summary:
    "Lina chooses three trusted sources and adds them to a source notebook, which makes a short audio overview. She listens on her walk and meets the main words. That evening she reads the textbook chapter at her own pace. She checks one claim: the audio said a router uses the first route that matches, but the page says the most specific match wins, and the audio left out the default route. She writes the correct rule in her own words.",
  actors: [
    { name: "Lina", sub: "routing week" },
    { name: "Her sources", sub: "slides, book, lab" },
    { name: "Notebook", sub: "web version" },
    { name: "Audio", sub: "short overview" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "choose 3 trusted",
      title: "Choose the sources first",
      note: "Her lecturer's slides on routing, the textbook chapter her lecturer set, and her lab sheet, without the page that has her lab partner's name. She leaves out an unknown video and an old forum thread.",
      chips: ["slides", "textbook chapter", "lab sheet"],
    },
    {
      from: 0,
      to: 2,
      label: "add the sources",
      title: "Put them in a source notebook",
      note: "She opens the web version in her phone's browser and adds the three sources. The notebook answers from these and nothing else, so what she leaves out matters as much as what she adds.",
    },
    {
      from: 2,
      to: 3,
      label: "make an overview",
      title: "A focused audio overview",
      note: "Her focus prompt: 'How a router decides where to send a packet. A second-year student. Use the words from my slides.' She checks the file size, then tries the download option in her browser at night, when her data is cheaper. If it had failed, she would have listened while connected.",
      chips: ["focused with a prompt", "size checked first"],
    },
    {
      from: 3,
      to: 0,
      label: "listen on a walk",
      title: "Meet the topic while walking",
      note: "On her walk to the university she hears the main ideas and the new words: next hop, routing table, default route. She is meeting the topic, not learning it yet.",
    },
    {
      from: 0,
      to: 1,
      label: "read the chapter",
      title: "Read at her own pace",
      note: "That evening she reads the textbook chapter with a pen. The words are familiar now, so she spends her time on the hard part: how a router chooses between routes. She slows down and reads that page twice.",
    },
    {
      from: 0,
      to: 1,
      label: "check one claim",
      tone: "warn",
      outcome: "audio was wrong",
      title: "Check one claim against the page",
      note: "The audio said a router uses the first route in its table that matches. The page says the most specific match wins. The audio also left out what happens when nothing matches: the router uses its default route if it has one.",
      chips: ["audio: first match", "page: most specific"],
    },
    {
      from: 0,
      to: 0,
      label: "write the fix",
      tone: "good",
      outcome: "rule corrected",
      title: "Write the correct rule",
      note: "On her routing page, in her own words and with the page number: 'Several routes match? The most specific wins. None match? The default route.' She adds it to her next quiz.",
    },
  ],
  tryThis: [
    "At step 6, read the audio's claim and the page's rule side by side before you look at the badge.",
    "Which step could Lina drop if her data ran out, and which could she not?",
  ],
  limits:
    "One audio, one claim checked. On another day the claim you check may be correct; check one anyway, and more on hard parts. Tool features, languages and limits change: check the tool's help page today. Every step works without audio, by reading the sources.",
};
