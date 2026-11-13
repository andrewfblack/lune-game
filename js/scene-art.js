'use strict';
// Presentation only: no added story steps, rewards, choices or saved art state.
// Ranges are resolved after dialogue polishing, using existing story anchors.
(function ({ EPISODES }) {
  const image = (file, alt) => ({ src: `assets/characters/${file}.jpg`, alt });
  const art = {
    luneBread: image('lune-baguette', 'Lune in the soft baguette costume'),
    tetoBread: image('teto-baguette', 'Teto in the soft baguette costume'),
    bunny: image('gumi-bunny', 'Gumi wearing fluffy green bunny ears'),
    cocoBlue: image('coco-blue', 'Coco glowing blue with recognition'),
    castle: image('slime-castle', 'Bworple’s little slime castle with its slide'),
    parcel: image('moon-parcel', 'Pink delivery parcel with lavender ribbon'),
    letter: image('moon-letter', 'The Moon Keeper’s folded letter'),
    cookie: image('moon-cookie', 'An ordinary moon-shaped cookie'),
    key: image('silver-moon-key', 'The Moon Keeper’s silver key'),
    detector: image('family-detector', 'Rei’s pretend Family Detector'),
    robot: image('robo-duck', 'Robo-Duck 3000, a mechanical adult duck'),
    kaitoDuck: image('kaito-duck', 'Kaito Duck with hopeful sparkling eyes'),
    commander: image('slime-commander', 'Duckling number seven beside the slime controls'),
    slime: image('slime-o-matic', 'The Slime-O-Matic machine'),
    smoothie: image('smoothie-stand', 'Bworple’s smoothie stand'),
    karaoke: image('karaoke-machine', 'The karaoke machine'),
    microphone: image('moon-microphone', 'Lune’s crescent-moon microphone'),
  };
  const ranges = [];
  const text = step => step.text || step.narrator || '';
  function range(id, from, to, presentation, when = () => true, afterChoice = false) {
    const episode = EPISODES.find(part => part.id === id);
    const find = anchor => {
      if (anchor === null) return episode.steps.length;
      const index = episode.steps.findIndex(step => typeof anchor === 'function'
        ? anchor(step) : step.checkpointId === anchor || text(step).includes(anchor));
      if (index < 0) throw new Error(`Missing artwork anchor in ${id}: ${anchor}`);
      return index;
    };
    const start = find(from), end = find(to);
    if (end <= start) throw new Error(`Invalid artwork range in ${id}`);
    ranges.push({ id, start, end, presentation, when, afterChoice });
  }
  const card = item => ({ card: item });
  range('first-ah', 'For a moment, the little golden glow shines blue', 'stellar-secrets',
    { card: art.cocoBlue, portraits: { coco: art.cocoBlue } });
  range('moon-key', 'Rei wheels out a little machine', 'The visitor sets a silver',
    card(art.detector), flags => !!flags.moonKeyDetector);
  range('moon-key', 'The parcel label reads', 'With Lune watching, Rei lifts the lid', card(art.parcel));
  range('moon-key', 'Inside are a tiny silver key', 'Dear Lune, congratulations', card(art.key));
  range('moon-key', 'Dear Lune, congratulations', 'Rei takes a small bite', card(art.letter));
  // Show the whole cookie before the bite, never after it has been eaten.
  range('moon-key', step => !!step.choice?.some(option => option.optionId === 'cookie-for-rei'),
    'Rei takes a small bite', card(art.cookie));
  range('moon-key', 'The little silver key begins to glow', null, card(art.key));
  range('dares', step => !!step.choice?.some(option => option.effects?.some(effect => effect.key === 'woreBaguette')),
    step => step.checkpointId === 'lune-costume-off', { card: art.luneBread, portraits: { lune: art.luneBread } },
    flags => !!flags.woreBaguette && !flags.daresBaguetteOff, true);
  range('dares', step => step.checkpointId === 'teto-bread-on', step => step.checkpointId === 'teto-bread-off',
    { portraits: { teto: art.tetoBread } }, flags => !!flags.daresTetoBread);
  range('baguettecrisis', 'Gumi grabs a pair of fluffy green bunny ears', 'Get well soon! Keep Teto from baguettes',
    { portraits: { gumi: art.bunny } });
  range('duckdom', step => !!step.choice?.some(option => option.label.includes('puppy-dog eyes')),
    step => step.checkpointId === 'rest', card(art.kaitoDuck));
  range('workshop', 'Tails lays out a toolbox', 'something enormous inflates', card(art.robot));
  range('slimmarchives', 'THAT WAS THE MEGA SLIME BUTTON', 'DUCKLING #7: BOOP', card(art.slime));
  range('slimmarchives', 'DUCKLING #7: BOOP', 'Rei wraps Lune', card(art.commander));
  range('slimmarchives', 'Duckling #7 waddles over', 'Bworple laughed at last', card(art.commander));
  range('bworplevoice', 'bworple smoothie. blueberry flavor.', null, card(art.smoothie));
  range('bworple-castle', 'Bworple celebrates with a little slide', null, card(art.castle),
    flags => !!flags.originCastleSlide);
  range('pillowfort', 'There is a karaoke machine', 'And a friendship wall', card(art.karaoke));
  range('pillowfort', step => step.checkpointId === 'moon-microphone', step => step.checkpointId === 'room-reaction-choice',
    card(art.microphone), flags => !!flags.fortMicOpened);
  range('karaoke', step => !!step.bg, null, card(art.karaoke));
  range('miku-cover', 'They run through the song once.', 'The cover demo goes on the keepsake shelf', card(art.microphone));

  window.LUNE_SCENE_ART = {
    art,
    get(id, index, flags = {}, progress = null, speech = null) {
      const result = { card: null, portraits: {} };
      for (const rule of ranges) {
        const reached = index > rule.start || (index === rule.start && (!rule.afterChoice
          || (progress?.phase === 'reply' && progress.index === index)));
        if (rule.id === id && reached && index < rule.end && rule.when(flags)) {
          Object.assign(result.portraits, rule.presentation.portraits);
          if (rule.presentation.card) result.card = rule.presentation.card;
        }
      }
      return result;
    },
  };
})(window.LUNE_CONTENT);
