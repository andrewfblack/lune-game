'use strict';
// Playable Episode 13 / E05 - MIKU 194-205, polished adaptation.
// Voluntary calm drinks, no wait/phone commands, no forced review or buy sale.
(function ({ EPISODES }) {
  const episode = EPISODES.find(part => part.id === 'bworplevoice');
  if (!episode) throw new Error('Missing Bworple Slime Company episode');
  const say = (source, speaker, text, checkpointId, guard = {}) => ({
    source, say:speaker, text, flowEdit:'Polished source-based adaptation for story flow.',
    ...(checkpointId ? { checkpointId } : {}), ...guard,
  });
  const story = (source, narrator, checkpointId, guard = {}) => ({
    source, narrator, ...(checkpointId ? { checkpointId } : {}), ...guard,
  });
  const flag = (key, value) => ({ do:'flag', key, value });
  function choice(source, checkpointId, first, second, guard = {}) {
    return {
      source, checkpointId, ...guard,
      choice:[first, second].map(option => ({
        source, optionId:option.id, label:option.line,
        effects:[flag(`bworpleChoice${checkpointId}`, option.id), ...(option.effects || [])],
        reply:{ ...say(source, option.speaker || 'rei', option.response), choiceResponse:option.id },
      })),
    };
  }
  const prior = Array.from({ length:62 }, (_, index) => ({ checkpointId:index === 0 ? 'start' : `polish-${index-1}`, reask:true }));
  const steps = [
    { source:194, checkpointId:'start', bg:'pillowfort' },
    story(194, 'The room is mostly dry. Kaito survived the bucket and Bworple is suspiciously calm with a straw in his mouth. The microphone is in plain sight.'),
    choice(194, 'microphone-choice',
      { id:'call by name', line:'🎤 Call Miku by name instead of using the command word.', effects:[flag('bworpleMicMode','name')], speaker:'miku',
        response:'Me? Did somebody say Miku? Oh—wait, the microphone heard that. Oh no.' },
      { id:'request quiet', line:'🤫 Ask everyone to keep the magic word unspoken.', effects:[flag('bworpleMicMode','quiet')], speaker:'miku',
        response:'The word “Vocaloids”? Wait—I just said it! Someone save me from myself!' }),
    story(194, 'The microphone flashes. Both Miku and Bworple Jr. realize that a trigger word is a bad trigger word.', 'microphone warning'),
    say(194, 'rei', 'Bworple coded the mic to listen for “VOCALOIDS” as its master override!', 'voice code'),
    say(194, 'miku', 'VOCALOIDS?! Wait—', 'miku alarm'),
    story(194, 'Bworple Jr. squeaks at the microphone. Soft purple gel gloops out and gently coats a waiting cushion. Nothing splashes anyone.', 'cushion splash'),
    say(194, 'rei', 'Nobody panic. The foam lands on the soft target, not on anyone who has asked to stay dry.', 'dry guarantee'),
    story(194, 'Miku carefully shuts the microphone award and sets it in a transparent case. Vows, sirens and trick play stay out.', 'microphone shelf'),
    choice(194, 'microphone-case-choice',
      { id:'put it away', line:'📦 Put the microphone in its clear case.', effects:[flag('bworpleMicStored', true)],
        response:'Case closed. Bworple gets visual display but no voice-control access.' },
      { id:'demo card', line:'📋 Show a card: do not say the magic word.', effects:[flag('bworpleMicStored', false)], speaker:'miku',
        response:'Good idea. A posted sign would have saved me from myself. Miku deserves a normal afternoon!' }),
    story(194, 'Bworple turns slowly toward his special cup. Slurrrp.', 'bworple slurp'),
    say(194, 'rei', 'Ew. Bworple, were you drinking the slime?', 'bworple drinking'),
    say(194, 'bworple', 'i am slime. this is basically soup.', 'soup joke'),
    story(194, 'Bworple pulls a tiny jar from inside his body, labeled BLUEBERRY FLAVOR. Tails scans it carefully. It is novel edible gel, not prank slime.', 'blueberry jar'),
    say(194, 'bworple', 'bworple smoothie. blueberry flavor.', 'smoothie presentation'),
    choice(196, 'smoothie-choice',
      { id:'try sip', line:'🫐 Taste Bworple’s blueberry smoothie gel.', effects:[flag('bworpleTriedSmoothie',true), flag('bworpleSip','sip')], speaker:'bworple',
        response:'first customer! one little taste of the edible jelly fizz.' },
      { id:'watch ingredients', line:'📋 Ask Bworple to explain the ingredients.', effects:[flag('bworpleTriedSmoothie',false), flag('bworpleSip','ingredients')], speaker:'tails',
        response:'BEEP, BOOP. Ingredients: lemon-lime soda, cherry-limeade gel, and a tiny sip of storyteller magic.' }),
    story(196, 'Lune tries one cautious sip. It fizzes like a soft blueberry cloud glued to a lemon.', 'tasting'),
    say(196, 'rei', 'sprite, cherry-lime jello, but probably very good.', 'Sprite taste', { ifFlag:'bworpleTriedSmoothie' }),
    say(196, 'tails', 'The scan says edible gel. It is not recycling our prank slime.', null, { ifFlag:'bworpleTriedSmoothie' }),
    say(196, 'teto', 'Does it come with a baguette?', 'baguette question'),
    say(196, 'bworple', 'no.', 'bworple no'),
    say(196, 'teto', 'terrible restaurant. zero stars.', 'teto zero star'),
    story(196, 'Bworple Jr. waddles in with an even tinier straw.', 'tiny straw', { ifFlag:'bworpleTriedSmoothie' }),
    story(196, 'Bworple places his cup on a paper napkin, far from the ducklings and guest cups. No immersion or sharing occurs.', 'ingredients', { unless:'bworpleTriedSmoothie' }),
    say(196, 'bworple', 'family recipe.', 'family recipe', { ifFlag:'bworpleTriedSmoothie' }),
    say(196, 'rei', 'Lune, we have two slime balls running a smoothie business in our pillow fort!', 'two business'),
    choice(197, 'ingredients-choice',
      { id:'ingredients ask', line:' Chemistry versus magic—ask for the full method.', speaker:'tails',
        response:'Scan says edible gel. The fizz comes from soda and Jell-O, the color from branding, the sweet finish from a family recipe. No prank chemistry.' },
      { id:'rate now', line:'⭐ Ask how to rate a jelly drink fairly.', effects:[flag('bworpleRatingWait','wait')], speaker:'rei',
        response:'A rating system can include any number from one to infinite, but only after a fair review and a real question.' }),
    story(198, 'Tails quietly adds baguettes to the menu. Teto immediately notices and changes her opinion.', 'tails menu'),
    choice(198, 'teto-rating-choice',
      { id:'minimum one', line:'📏 Remind Teto: the minimum rating is one.', effects:[flag('bworpleRating','one')], speaker:'teto',
        response:'One... okay, you keep saying that. One is logically better than zero.' },
      { id:'infinite baguette', line:'🥖 Defend the baguette-shaped rating stamp.', effects:[flag('bworpleRating','infinite')], speaker:'teto',
        response:'The stamp is art. Baguette opinions are protected. I look at Bworple and suddenly see five starring stars.' }),
    story(198, 'Teto calculates at ease.', 'calculate'),
    say(198, 'tails', 'Technically, infinity isn’t a number you can use as a normal maximum rating—'),
    say(198, 'teto', 'NERD!'),
    say(198, 'tails', 'I’M LITERALLY AN INVENTOR!'),
    story(198, 'Bworple updates the restaurant card. Teto gives a baguette-shaped stamp despite herself: one baguette out of infinity remaining baguettes. The label is a joke rating, not a real review of any product.', 'menu card'),
    story(198, 'Tails takes a tiny sip. His twin tails puff up like orange feather dusters.', 'tails sip'),
    say(198, 'tails', 'WHY DID MY TAILS DO THAT?!', 'tails question'),
    say(198, 'bworple', 'carbonation.', 'carbonation'),
    story(198, 'Rei reaches for a cup. Tails tries to warn her, but the cup erupts in foam.', 'foam'),
    say(198, 'rei', 'WHY DOES EVERYTHING IN THIS FORT EXPLODE?!?!', 'rei explode'),
    choice(198, 'business-choice',
      { id:'host tasting', line:'🫐 Host a tasting with small sips and separate safe cups.', effects:[flag('bworpleHostedTasting',true)], speaker:'bworple',
        response:'you are first customer. you get honorary taste tester badge.' },
      { id:'small menu', line:'📋 Keep it to a tiny napkin menu. No sale or fee.', effects:[flag('bworpleHostedTasting',false)], speaker:'bworple',
        response:'bworple accepts proposal with no payment: jelly fizz stays on a single paper menu.' }),
    say(198, 'bworple', 'business expansion.', 'business expansion', { ifFlag:'bworpleHostedTasting' }),
    story(198, 'Bworple puts on tiny sunglasses and almost looks like an accountant. Smoothie business stays pretend; no budget, purchase, or account fees are collected.', 'sunglasses'),
    say(198, 'rei', 'I am claiming second customer!', 'second customer', { ifFlag:'bworpleHostedTasting' }),
    story(198, 'No further cup is passed. The napkin menu stays on the table like a decoration instead of a shop.', 'napkin layout', { unless:'bworpleHostedTasting' }),
    story(198, 'Rei and Tails reach for the cup at the same time. One tiny fizzy cloud touches her nose. Nobody gets soaked.', 'foam nose'),
    say(205, 'rei', 'YOU JUST DEFEATED TETO WITH A RESTAURANT RATING SYSTEM!', 'defeated teto'),
    choice(201, 'final-choice',
      { id:'put away', line:'📦 Put the microphone and smoothie gear away.', effects:[flag('bworpleFinal','away')],
        response:'Mic off, smoothie gear away. Bworple gets a clean station and everyone gets a dry afternoon.' },
      { id:'display', line:'📋 Keep the napkin menu as a pretend display.', effects:[flag('bworpleFinal','display')],
        response:'A menu on the wall is enough. It does not need a customer, app or purchase to be funny.' }),
    story(201, 'Tails takes another sip at his own pace. No command starts anything; the archive shelf stays off.', 'final archive'),
    story(205, 'Everyone survives the rating, the fizz, and the tiny business encounter. Bworple Jr gives one peep of approval.', 'approval'),
    story(205, 'Lune gets the Slime Spoon for keeping Bworple hydrated and the fort mostly dry.', 'slime spoon'),
    { source:205, checkpointId:'complete', do:'done', id:'bworplevoice' },
  ];
  steps.forEach((step, index) => { step.checkpointId ||= `bworple-step-${index}`; });
  Object.assign(episode, {
    steps, dialogueStyle:'polished-two-choice', checkpointVersion:3,
    source:'MIKU 194-205; detailed polished adaptation with voluntary tasting and safe pavement',
    checkpointMigrations:{ 1:Array.from({length:62},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true})), 2:Array.from({length:62},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true})) },
    passport:'Bworple’s edible blueberry jelly fizz, Teto’s infinite-pantaloons rating, and no accidental microphone slime.',
    revisit:'Bworple’s pretend smoothie stand is packed away. Teto’s rating card stays on the wall forever, and the microphone is safely in its case.',
  });
})(window.LUNE_CONTENT);
