'use strict';
// E04 — adapted from source conversation messages 120–140.
// The foot-picture machine is mentioned but fully explored in a later episode.
// This is a regular Chapter 2 episode; it unlocks after The Secret Pillow Fort.
(function ({ registerEpisode }) {
  registerEpisode({
    id: 'workshop',
    chapter: 2,
    requiredFor: 2,
    after: 'pillowfort',
    requires: ['pillowfort'],
    name: "Tails' Workshop & the Big Duck Mix-up",
    emoji: '🔧',
    desc: "Help Tails build a Robo-Duck… careful with the red button",
    badge: 'NEW EPISODE',
    keepsake: 'tailsWrench',
    passport: 'Tails’ Robo-Duck became a five-story inflatable duck, then waddled home while the ducklings stayed.',
    source: 'messages 120–140',
    revisit: 'Tails has lit up his workshop again. The giant inflatable duck is gone—goodbye, enormous quack!—and the seventeen ducklings are snoozing.',
    steps: [
      { bg: 'pillowfort' },
      { say: 'tails', text: 'Hey Lune, come look at my workbench! I have so many inventions to show you.' },
      { say: 'tails', text: 'I saw the pillow fort, the ducklings, and your robotic voice... we are DEFINITELY going to get along.' },
      { narrator: 'Tails lays out a toolbox: a wrench, a screwdriver, a tiny speaker, and a glowing blinking machine labeled “ROBO-DUCK 3000.”' },
      { say: 'tails', text: 'I wanted to build a little robot helper. A duck. A nice PAR-SIZED one, of course.' },
      { choice: [
        { label: '🔧 Grab the wrench and tighten all the bolts.', reply: { say: 'tails', text: 'Nice! You’re a natural. Safety first, inventions second!' } },
        { label: '🔩 Pick the screwdriver and double-check the wiring.', reply: { say: 'tails', text: 'Good spot—the wiring was the wonky part. You’re pretty tech-savvy yourself.' } },
      ] },
      { say: 'tails', text: 'Okay... activating power. Umm. Do you hear that?' },
      { narrator: 'BEEP! The machine warbles, whirs, and starts to wobble like a very stressed robot duck.' },
      { narrator: 'BEEP! The screen flashes: “QUACK.EXE ERROR… SEARCHING FOR SIBLING…”' },
      { narrator: 'Five seconds later, something enormous INFLATES slowly behind the couch with a rubbery HONK.' },
      { say: 'sonic', text: 'WHY IS THAT THING BIGGER THAN MY HOUSE?!' },
      { say: 'miku', text: 'EVERYBODY! NOBODY PANIC! IT’S JUST A VERY BIG DUCK!' },
      { say: 'bworple', text: 'bworple has never seen a duck this big. a big fan.' },
      { say: 'tails', text: 'My blueprints said “small duck.” NOWHERE did it say “five-story duck.”' },
      { say: 'rei', text: 'Lune, you told me only the DUCKS go, not the DUCKLINGS! Can you remind us which you meant?' },
      { choice: [
        { label: '🦆 “Big ducks are allowed… but NO robot ducklings!”', reply: { say: 'tails', text: 'That’s what I heard too—no ROBOT ducklings. Got it!' } },
        { label: '🐥 “You mean bye-bye BIG duck, ducklings STAY.”', reply: { say: 'rei', text: 'OH! You meant the giant one goes home! Got it!' } },
      ] },
      { say: 'knuckles', text: 'That is a LOT of baguette-shaped duck. Maybe ask it to waddle out backward?' },
      { choice: [
        { label: '🚪 If the big duck agrees, let it honk its way home.', reply: { say: 'tails', text: 'Makes sense! All ducks want a nice long walk.' } },
        { label: '🐥 Keep it at the fort—six feet of friendship.', reply: { say: 'sonic', text: 'Buddy, I like ducks but your house is not a duck park!' } },
      ] },
      { choice: [
        { label: '🐥 Ducklings stay; giant inflatable duck says goodbye.', reply: { say: 'bworple', text: 'goodbye, enormous quack. bworple will miss you.' } },
        { label: '🚪 If everybody agrees, waddle it out the door.', reply: { say: 'tails', text: 'Agreement reached! Big duck leaves, ducklings stay!' } },
      ] },
      { narrator: 'HONNNNNK! The giant inflatable duck rises with tremendous dignity, waddles to the door, and disappears with one final rubbery SQUEAK.' },
      { say: 'sonic', text: 'FINALLY, I can see the front door again!' },
      { say: 'miku', text: 'The seventeen ducklings are still here. Good.' },
      { narrator: 'Bworple waves a tiny handkerchief. Bworple Jr. peeps in solidarity. The room is a very normal duck-scale room again.' },
      { say: 'tails', text: 'So… the Robo-Duck 3000 turned into—well—you saw it. Do you still want to help me fix it?' },
      { choice: [
        { label: '🔧 "Of course! Ducks the right size this time."', reply: { say: 'tails', text: 'Perfect! New rule: measure twice, waddle once.' } },
        { label: '💙 "Yeah. Thanks for making room for my ideas."', reply: { say: 'tails', text: 'Any time. You’re an excellent inventor, Lune.' } },
      ] },
      { narrator: 'Tails digs out a shiny wrench and tags it with a tiny sticky note: “For LUNE — Chief Duck Inventor.”' },
      { do: 'done', id: 'workshop' },
    ],
  });
})(window.LUNE_CONTENT);
