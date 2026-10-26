import type { SequenceSpec } from "../renderers/sequence/types";

// 1% Better course (one-percent-better), chapter 11.03 "Rights, friends and humour".
// Every person has rights over us: their property, their honour, their
// feelings. Friends shape us, and humour has limits.
// See spec.md.
export const rightsFriendsHumour: SequenceSpec = {
  kind: "sequence",
  title: "A borrowed charger, a joke and a friend",
  purpose: "Follow Musa through a week at school and see the sourced rule for each moment.",
  summary: "Musa returns a borrowed charger, apologises to a classmate he hurt, keeps his jokes true and kind, refuses a joke about a boy's poverty, and chooses to sit with friends who help him.",
  actors: [
    { name: "Musa" },
    { name: "Classmates" },
    { name: "Friends" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "returns charger",
      title: "Return what you borrow",
      note: "Allah commands you to return trusts to their owners (Quran 4:58). A loan must be paid back, and a thing lent must be returned (Sunan Abi Dawud 3565, sahih).",
      chips: ["Quran 4:58", "Sunan Abi Dawud 3565"],
    },
    {
      from: 0,
      to: 1,
      label: "apologises",
      title: "Seek pardon today",
      note: "Whoever has wronged his brother in his honour or anything else, let him seek his pardon today, before a day when there is no money (Sahih al-Bukhari 2449).",
      chips: ["Sahih al-Bukhari 2449"],
    },
    {
      from: 0,
      to: 0,
      label: "true jokes only",
      title: "Humour that is true",
      note: "The Prophet, peace be upon him, joked but said only what was true (Jami' at-Tirmidhi 1990, sahih). Woe to the one who lies to make people laugh (Sunan Abi Dawud 4990, hasan).",
      chips: ["Jami' at-Tirmidhi 1990", "Sunan Abi Dawud 4990"],
    },
    {
      from: 1,
      to: 0,
      label: "joke about poverty",
      tone: "warn",
      title: "Not at someone's cost",
      note: "A classmate jokes about a boy's old shoes. A Muslim is the brother of a Muslim: he does not wrong him or abandon him (Sahih al-Bukhari 2442). Musa does not laugh.",
      chips: ["Sahih al-Bukhari 2442"],
    },
    {
      from: 0,
      to: 2,
      label: "chooses friends",
      tone: "good",
      title: "Good company",
      note: "A good companion is like a musk seller and a bad one like a blacksmith's bellows (Sahih al-Bukhari 2101). A person is on the religion of his close friend, so look at whom you befriend (Jami' at-Tirmidhi 2378, hasan).",
      chips: ["Sahih al-Bukhari 2101", "Jami' at-Tirmidhi 2378"],
    },
  ],
  tryThis: [
    "Before step 2, predict: when does the hadith say to seek pardon from someone you wronged?",
    "Is there anything you have borrowed and not yet returned?",
  ],
  limits: "The bankrupt person in Sahih Muslim 2581 shows how serious others' rights are; this canvas shows small daily cases. Bigger disputes may need a trusted adult or scholar to help settle them.",
};
