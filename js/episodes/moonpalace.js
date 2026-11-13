'use strict';
// MP01–MP06 — Chapter 1, adapted from TETO (Explain Teto Files).
// Source numbers are 0-based linear_conversation indexes, not visible turns.
// New connective dialogue and opt-out branches are adaptation, not source quotes.
// Star Momo uses a separate presentation ID pending family continuity review;
// this does not rewrite the existing laundry-basket Momo scene or save ID.
(function ({ registerCharacter, registerEpisode, EPISODES }) {
  registerCharacter('momo-star', {
    name: 'MOMO · STAR', img: 'assets/characters/momo-star.jpg', color: '#b9a3ff',
    title: 'Lavender Star Companion',
    bio: 'The star presentation of Momo in the origin chat. Says Utau, Loid and Utauloid. Coco is Momo’s brother. How this connects to the later Momo is still for Kaidon to decide.',
  });
  registerCharacter('coco', {
    name: 'COCO', img: 'assets/characters/coco.jpg', color: '#ffe087',
    title: 'Momo’s Golden Star Brother',
    bio: 'A little golden star who reunites with Momo in Rei’s laboratory. Says Loid and likes tiny pool floats.',
  });
  registerCharacter('auntie', {
    name: 'AUNTIE', img: 'assets/characters/moon-visitor.svg', color: '#d9c8ff',
    title: 'A Visitor from Lune’s Family',
    bio: 'Auntie arrives with Coco and knows a lullaby about the moon and cherry blossoms. Her full story is still a mystery. Portrait is a temporary story card.',
  });
  registerCharacter('duckula', {
    name: 'DUCKULA', img: 'assets/characters/duckula.jpg', color: '#ffe087',
    title: 'Talking Inflatable Duck · Captain of Sass',
    bio: 'A talking inflatable duck with a compartment full of floats and very questionable cookie bookkeeping.',
  });
  registerCharacter('cookie-guard', {
    name: 'COOKIE GUARD', img: 'assets/characters/cookie-guard.jpg', color: '#ffc78c',
    title: 'Moon Palace Security Applicant',
    bio: 'A magical talking cookie who chose a job instead of the snack plate. Ordinary moon cookies are just ordinary snacks.',
  });
  registerCharacter('luka', {
    name: 'LUKA', img: 'assets/characters/luka.jpg', color: '#ffb6dc',
    title: 'Sleepover Guest',
    bio: 'Luka joins the first sleepover with MEIKO and Gumi, and helps everyone keep the games gentle.',
  });

  function origin(episode) {
    registerEpisode({ chapter: 1, requiredFor: 1, badge: 'ORIGIN STORY', ...episode });
  }

  origin(window.LUNE_FIRST_AH);

  origin(window.LUNE_MOON_KEY);

  origin(window.LUNE_CAPTAIN_DUCKULA);

  origin(window.LUNE_HUG_ALARM);

  origin(window.LUNE_ROYAL_DARE);

  origin(window.LUNE_BWORPLE_CASTLE);

  // Registration appends when there is no anchor. Keep origins before the old
  // living-room opening without changing any of the existing stable IDs.
  EPISODES.sort((a, b) => a.chapter - b.chapter);
})(window.LUNE_CONTENT);
