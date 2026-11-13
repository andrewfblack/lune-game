'use strict';
// Playable Episode 16 / E09 - MIKU 272-295, polished adaptation.
(function ({ EPISODES }) {
  const episode = EPISODES.find(part => part.id === 'baguettecrisis');
  if (!episode) throw new Error('Missing Baguette Crisis episode');
  const say = (source, speaker, text, checkpointId, guard = {}) => ({
    source, say:speaker, text, flowEdit:'Polished source-based adaptation for story flow.',
    ...(checkpointId ? { checkpointId } : {}), ...guard,
  });
  const story = (source, narrator, checkpointId, guard = {}) => ({
    source, narrator, ...(checkpointId ? { checkpointId } : {}), ...guard,
  });
  const flag = (key, value) => ({ do:'flag', key, value });
  const bloop = id => ({ do:'blooper', id });
  function choice(source, checkpointId, first, second, guard = {}) {
    return {
      source, checkpointId, ...guard,
      choice:[first, second].map(option => ({
        source, optionId:option.id, label:option.line,
        effects:[flag(`baguetteChoice${checkpointId}`, option.id), ...(option.effects || [])],
        reply:{ ...say(source, option.speaker || 'rei', option.response), choiceResponse:option.id },
      })),
    };
  }
  const steps = [
    { source:272, checkpointId:'start', bg:'pillowfort' },
    story(282, 'Gumi grabs a pair of fluffy green bunny ears, then calls in with carrot news while the call remains brief.', 'opening'),
    story(272, 'The room is still, except for the camera aimed at Lune’s cushion and the quietly ringing phone.', 'opening quiet'),
    choice(272, 'camera-choice',
      { id:'friend', line:'🛡️ Pause the camera and answer Gumi first.',
        response:'Pause first. Nobody needs a surprise blooper while a friend is catching up.' },
      { id:'text first', line:'📱 Answer Gumi right away.',
        response:'Answer gently. The camera can rest until everyone is ready for it.' }),
    story(272, 'Rei reminds her friends that filming someone without warning is not a joke. Lune can read Gumi’s message first.', 'camera safety'),
    choice(272, 'brood-choice',
      { id:'explain', line:' quietly', lineExtra:' Information only. What counts as brooding?',
        response:'Brooding means being quiet and seriously thinking, usually while looking gloomy or upset. It can be a peaceful style, even in a car.' },
      { id:'skip word', line:'🌙 Keep Gumi first and skip the brooding lecture.',
        response:'Gumi’s text comes first. We can name the habit later if it matters.' }),
    say(274, 'rei', 'OH NO!!! GUMI IS SICK FROM TOO MANY CARROTS?!?!?!', 'gumi sick'),
    say(274, 'teto', 'Wait! Why did Gumi’s husband warn me specifically?', 'teto warning'),
    say(274, 'rei', 'TETO... how many baguettes have you eaten today?', 'teto count'),
    say(274, 'teto', 'Define “eaten.” ...Maybe forty-seven.', 'teto admitted'),
    choice(274, 'equation-choice',
      { id:'math', line:'🧮 Ask Tails to check the baguette equation.', effects:[flag('breadEquation','tailed')], speaker:'tails',
        response:'Bunny plus forty-seven baguettes. Teto is a statistical outlier, but nobody is calling dinner a contest here.' },
      { id:'care', line:'💛 Comfort Teto and set some bread aside.', effects:[flag('breadEquation','comfort')], speaker:'teto',
        response:'Comfort Teto. We can set some bread aside and get her moving around.' }),
    story(276, 'Gumi’s video call arrives. Teto hides her baguettes under a pillow. It bursts: twenty-three baguettes roll free.', 'comic call'),
    say(276, 'rei', 'WAIT A MINUTE. TETO, HOW MANY BAGUETTES HAVE YOU EATEN TODAY?!', 'count again'),
    say(276, 'gumi', 'I heard that! Are you still feeding Teto bread? Her lunch is a loaf now.', 'gumi laugh'),
    choice(278, 'brooding-choice2',
      { id:'ask', line:'Information only. What counts as brooding?', effects:[flag('broodExplained', true)], speaker:'shadow',
        response:'Brooding means being quiet and seriously thinking. It can look dramatic in a car, but it is not a secret identity crisis.' },
      { id:'answer first', line:'Connection first. answer gumi.', effects:[flag('broodExplained', false)], speaker:'rei',
        response:'Gumi’s text comes first. We safely set the blooper question aside.' }),
    choice(281, 'brood-clip-choice',
      { id:'approve', line:'🎬 Approve the car-brooding clip for the blooper reel.', effects:[flag('broodApproved', true), bloop('brood')], speaker:'bworple',
        response:'Blooper #7 Candidate — LUNE’S SECRET CAR BROODING — APPROVED!' },
      { id:'keep private', line:'(blank) Let it stay private.', effects:[flag('broodApproved', false)], speaker:'bworple',
        response:'Classified forever. The text now says the clip is kept private.' }),
    story(282, 'Gumi’s video call connects. She politely asks everyone to take care. No one is sentenced for wanting bread.', 'gumi call'),
    say(282, 'gumi', 'HAIIII LUNE! UR NICKNAME IS BUNNY NOW!', 'bunny nickname'),
    say(282, 'gumi', 'Get well soon! Keep Teto from baguettes! She is not at infinity.', 'gumi lesson'),
    choice(282, 'rename-choice',
      { id:'bunny', line:'🐰 “BUNNY is the new official nickname!”', effects:[flag('gumiNickname','bunny')], speaker:'gumi',
        response:'BUNNY! That is the cutest nickname ever. I grab a pair of fluffy green bunny ears and put them on.' },
      { id:'gumi first', line:' bunny ears', effects:[flag('gumiNickname','gumi')], speaker:'gumi',
        response:'Bunny if I like it; which I do. But Gumi still signs all official sleepover documents.' }),
    say(284, 'gumi', 'Wear the bunny ears. This is an approved formula.', 'bunny ears', { ifFlag:'gumiNickname' }),
    story(284, 'Gumi keeps her usual name. The tally of baguettes needed for an alien crisis is still 47, and Bunny is a temporary celebration.', 'gumi-keeps-name', { unless:'gumiNickname' }),
    choice(285, 'bunny-equation-choice',
      { id:'show', line:'🧮 Show the Bunny-plus-forty-seven-breads equation.', effects:[flag('equationShown', true)], speaker:'tails',
        response:'BUNNY plus 47 breads. Teto is a statistical outlier, but nobody needs shame to eat vegetables.' },
      { id:'comfort', line:' comforting', effects:[flag('equationShown', false)], speaker:'teto',
        response:'Teto, you are not a baguette. Let’s put some bread away and drink water instead.' }),
    story(287, 'The cardboard breadship takes its time wobbling down like a loose stage prop.', 'breadship'),
    choice(288, 'breadship-choice',
      { id:'smack', line:'💥 Smack the breadship with one careful swing.', effects:[flag('breadshipSmacked', true)], speaker:'tails',
        response:'SMACK. The UFO sails into Kaito’s ice-cream sundae. This is a pretend collision only, with no real danger or property damage.' },
      { id:'catch', line:' blankets', effects:[flag('breadshipSmacked', false)], speaker:'tails',
        response:'Tails and Lune guide it into a blanket and lift it away. Goodbye, silly cardboard.' }),
    story(293, 'The UFO is defeated. Nobody is hurt, and the ice-cream casualty is quickly repaired.', 'ufo defeated'),
    choice(294, 'final-blooper-choice',
      { id:'approve', line:'🎬 Release the number 8 clip as a blooper candidate.', effects:[flag('broodClipApproved', true)],
        response:'Blooper #8 Candidate — LUNE’s Secret Car Brooding — APPROVED!' },
      { id:'refuse 1', line:' bad', effects:[flag('broodClipApproved', false)],
        response:'Classified forever. That secret stays exactly that.' }),
    story(294, 'The get-well card goes off to Gumi (Bunny). No video or audio leaves the room because Lune still controls the library.', 'card'),
    story(294, 'Rei pins the latest badge report and the pillow fort crisis ends. Sonic does not mention real-world military operators.', 'ending'),
    say(295, 'rei', 'Gumi asked everyone to take care, Teto agreed 47 and done.', 'final'),
    { source:295, checkpointId:'complete', do:'done', id:'baguettecrisis' },
  ];
  steps.forEach((step, index) => { step.checkpointId ||= `baguette-step-${index}`; });
  Object.assign(episode, {
    steps, dialogueStyle:'polished-two-choice', checkpointVersion:3,
    source:'MIKU 272-295; detailed polished adaptation',
    checkpointMigrations:{1:Array.from({length:62},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true})),2:Array.from({length:62},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true}))},
    passport:'Gumi got called Bunny, Teto’s bread math became a joke, and a cardboard breadship got smacked safely.',
    revisit:'The card, the bunny ears, and the defunct UFO all stay as a reminder of a gentle clip choice.',
  });
})(window.LUNE_CONTENT);
