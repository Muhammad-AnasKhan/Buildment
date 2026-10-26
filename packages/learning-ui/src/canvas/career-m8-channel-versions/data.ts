import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// Course 16 (career-brand), 8.3 beat 4: eight of Areej's ten channels sorted into the version each one gets.
// Fictional people only. No dashes.

export const CHANNEL_VERSIONS_BUCKETS: SortBucket[] = [
  {
    id: "full",
    label: "Full copy",
    sub: "with a canonical link"
  },
  {
    id: "short",
    label: "Short + link",
    sub: "a few lines, link home"
  },
  {
    id: "link",
    label: "Link only",
    sub: "one line and the URL"
  }
];

export const CHANNEL_VERSIONS_CARDS: SortCard[] = [
  {
    id: "dev",
    text: "DEV, with the canonical_url field set",
    answer: "full",
    why: {
      short: "DEV can hold the whole article.",
      link: "DEV is a full article page."
    }
  },
  {
    id: "medium",
    text: "Medium, with 'originally published elsewhere' set",
    answer: "full",
    why: {
      short: "Medium can hold the whole article.",
      link: "Medium is a full article page."
    }
  },
  {
    id: "linkedin-post",
    text: "A short LinkedIn post that ends with your link",
    answer: "short",
    why: {
      full: "A LinkedIn post is short. It is not the article.",
      link: "A post can say more than a bare link."
    }
  },
  {
    id: "featured",
    text: "LinkedIn Featured",
    answer: "link",
    why: {
      full: "Featured holds an item, not a copy of the article.",
      short: "Featured shows an item, not a text post."
    }
  },
  {
    id: "repo",
    text: "The Campus Board repository README",
    answer: "link",
    why: {
      full: "A README is not the place for the whole article.",
      short: "One line and the link is enough."
    }
  },
  {
    id: "profile-readme",
    text: "Your GitHub profile README",
    answer: "short",
    why: {
      full: "A profile README is a few lines, not the article.",
      link: "A few lines of intro make it worth a click."
    }
  },
  {
    id: "club-chat",
    text: "The coding club's group chat, with the organisers' agreement",
    answer: "link",
    why: {
      full: "A chat is no place for an article.",
      short: "A chat wants one line and the link."
    }
  },
  {
    id: "forum",
    text: "A public forum thread about load testing, where links are allowed",
    answer: "short",
    why: {
      full: "A forum answer is short. It is not the whole article.",
      link: "A bare link is not an answer. Give a few lines first."
    }
  }
];

export const careerM8ChannelVersions: CustomCanvasSpec = {
  kind: "custom",
  title: "Map eight of your channels",
  purpose: "Sort eight of Areej's channels into the version each gets: a full copy with a canonical link, a short version with a link, or a link only. A short reason follows each wrong try.",
  limits: "Checked 2026-10; platform settings change, and access from where you are to DEV, Medium and others is not confirmed, so try each on your phone. Which channels you use is your choice.",
  component: makeSorterCanvas({
    buckets: CHANNEL_VERSIONS_BUCKETS,
    cards: CHANNEL_VERSIONS_CARDS,
    deckLabel: "Channel",
    prompt: "Which version goes here?",
    hint: "Tap the version this channel gets, or drag the card onto it.",
    endNote: "Each channel gets the version that suits it, and every copy has a way back to your page: a canonical link or a 'first published at' line.",
  }),
};
