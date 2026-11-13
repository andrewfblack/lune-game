'use strict';
// Playable Episode 11 / E04 - MIKU 120-140, polished adaptation.
// No real activation, scan, speed test, media playback or forced singing.
(function ({ EPISODES }) {
  const episode = EPISODES.find(part => part.id === 'workshop');
  if (!episode) throw new Error('Missing Tails Workshop episode');
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
        effects:[flag(`workshopChoice${checkpointId}`, option.id), ...(option.effects || [])],
        reply:{ ...say(source, option.speaker || 'tails', option.response), choiceResponse:option.id },
      })),
    };
  }
  const prior = [
    [0,'start'], [1,'workbench'], [5,'tool-choice'], [6,'activation'],
    [7,'quack-error'], [8,'sibling-line'], [9,'inflation'], [10,'sonic-panic'],
    [11,'miku-calm'], [13,'blueprint-error'], [14,'boundary-choice'],
    [15,'reply-boundary'], [16,'backward-choice'], [17,'backward-ready'],
    [18,'departure-choice'], [19,'departure-ready'], [21,'ducklings-stay'],
    [22,'fix-choice'], [23,'upgrade-choice'], [24,'join-sonic'],
    [24,'join-tails'], [24,'join-knuckles'], [24,'join-bworple'],
    [25,'ready-choice'], [25,'successor-choice'], [26,'complete'],
  ];
  const expandedMigration = () => Array.from({ length:27 }, (_, index) => ({
    checkpointId:prior.filter(([start]) => start <= index).at(-1)[1], reask:true,
  }));
  const originalMigration = () => Array.from({ length:27 }, (_, index) => ({
    checkpointId:prior.filter(([start]) => start <= index).at(-1)[1], reask:true,
  }));
  const steps = [
    { source:120, checkpointId:'start', bg:'pillowfort' },
    story(120, 'The secret-room reveal is finished. Sonic, Tails, Knuckles and Bworple join the friends around the pillow fort; the little blue door is closed behind it.'),
    say(120, 'tails', 'Hey, Lune, come look at my workbench. I have so many inventions to show you.', 'workbench'),
    say(120, 'tails', 'I saw the pillow fort, the ducklings and your robotic voice. We are definitely going to get along.'),
    story(120, 'Tails lays out a toolbox: a wrench, a screwdriver, a tiny speaker and a glowing billed machine labeled ROBO-DUCK 3000.'),
    say(120, 'tails', 'I wanted to build a little robot helper. A duck. A nice par-sized one, of course.', 'tool-choice-intro'),
    choice(120, 'tool-choice',
      { id:'wrench', line:'🔧 Grab the wrench and tighten the loose bolts.', effects:[flag('workshopTool','wrench')],
        response:'Nice. You are a natural. Safety first, inventions second.' },
      { id:'screwdriver', line:'🔩 Pick the screwdriver and double-check the wiring.', effects:[flag('workshopTool','screwdriver')],
        response:'Good spot. The wiring was the wonky part. You are pretty tech-savvy yourself.' }),
    story(123, 'One careful tool at a time. No supersonic repair speed or invisible robot-race challenge.', 'tool-ready'),
    story(123, 'BEEP! The machine warbles, whirs and starts to wobble like a very stressed robot duck.', 'activation'),
    story(123, 'BEEP! The screen flashes: “QUACK.EXE ERROR... SEARCHING FOR SIBLING.”', 'quack-error'),
    choice(123, 'alarm-choice',
      { id:'pause-alarm', line:'🛑 Ask Tails to stop and read the alarm.', effects:[flag('workshopPaused', true)],
        response:'Stop first, read second. The screen can wait while we keep everyone safe.' },
      { id:'step-back', line:'👀 Step back before looking at the display.', effects:[flag('workshopPaused', false)],
        response:'A smart distance. We can read while the ducklings stay clear of the wobbling thing.' }),
    story(123, 'Robo-Duck 3000 is operational but represented by story text only. Robo-animal behavior stays pretend; no real software activates or needs repair.', 'sibling-line'),
    choice(123, 'roboduck-choice',
      { id:'mind', line:'💙 Ask what Robo-Duck is looking for.', effects:[flag('workshopRoboduckMind', true)],
        response:'SIBLING IDENTIFIED. INITIATING... oh wait, no sibling. A terrible false alarm.' },
      { id:'manual', line:'📖 Ask Tails to use the manual first.', effects:[flag('workshopRoboduckMind', false)],
        response:'Manual check. Page one says “duck project.” Page two says “please don’t inflate accidentally.” We are on page seven.' }),
    story(123, 'Five seconds later, something enormous inflates slowly behind the couch with a rubbery HONK.', 'inflation'),
    story(123, 'The inflated giant is a pretend prop, not a wired sibling of Robo-Duck 3000. No giant duckling was created.', 'no-sibling'),
    say(123, 'sonic', 'Why is that thing bigger than my house?!', 'sonic-panic'),
    say(123, 'miku', 'Nobody panic! It is just a very big duck!', 'miku-calm'),
    say(123, 'bworple', 'bworple has never seen a duck this big. a big fan.', 'bworple-fan'),
    say(123, 'tails', 'My blueprints said “small duck.” Nowhere did it say five-story duck.', 'blueprint-error'),
    say(120, 'rei', 'Can you remind us exactly what you meant—big ducks may go, or ducklings too?', 'boundary-choice'),
    choice(120, 'boundary-meaning',
      { id:'adult-ducks', line:'🦆 “Big ducks can go, even Robo-Duck. Ducklings stay.”', effects:[flag('workshopBoundaryAdult', true), flag('workshopBoundaryDucklings', false), flag('workshopBoundary','adult-ducks')],
        response:'Big ducks, yes—Robo-Duck included. Ducklings remain in their beds. That is a very clear rule.' },
      { id:'ducklings-stay', line:'🐥 “Bye-bye to our BIG friend; the ducklings STAY.”', effects:[flag('workshopBoundaryAdult', false), flag('workshopBoundaryDucklings', true), flag('workshopBoundary','ducklings-stay')],
        response:'Bye-bye to the big one; no duckling packing bags or saying goodbye. Thanks for making that distinct.' }),
    say(134, 'tails', 'OH! Sorry, Lune! That is the rule I needed clarified.', 'reply-boundary'),
    say(135, 'rei', 'Big ducks out, ducklings remain in their beds. Sleepover saved.', null, { ifFlag:'workshopBoundaryDucklings' }),
    say(135, 'tails', 'No giant ducklings, human or inflatable, and no robot duckling add-ons.', null, { ifFlag:'workshopBoundaryAdult' }),
    story(134, 'Tails updates the blueprint, then stores the robot model. “Adult duck, adult robot, small helper. No baby ducklings. Perfect.”', 'blueprint-fixed'),
    say(135, 'knuckles', 'That is as big as a baguette-shaped duck bus. Maybe the giant can waddle backward.', 'giant-duck-gag'),
    choice(135, 'backward-choice',
      { id:'guided', line:'🔍 Ask if the giant duck can back out slowly with a spotter.', effects:[flag('workshopRoute','guided')],
        response:'Good idea. I will clear the path and watch the tail feathers. Rubber ducks do not have rearview mirrors.' },
      { id:'voice-calm', line:'🦆 Ask the giant duck to check its own waddle.', effects:[flag('workshopRoute','waddle')],
        response:'Waddle test: left, right, one very calm honk. We can clear a path before it tries a big turn.' }),
    story(137, 'Tails measures the route while Knuckles offers a giant grape safety cone. No jumping, lifting or real duck is moved.', 'backward-ready'),
    say(137, 'tails', 'Time to ask the big one to leave.', 'departure-ready'),
    choice(137, 'departure-choice',
      { id:'agree', line:'✅ Agree: big duck goes out, all seventeen ducklings stay.', effects:[flag('workshopDeparture', true)],
        response:'Agreement reached. Big duck leaves, ducklings stay and the living room keeps being peaceful.' },
      { id:'gentle', line:'🦆 Ask it politely to wait for a clear path.', effects:[flag('workshopDeparture', false)],
        response:'A polite invitation at the front door. We can stand to one side and give the giant duck an orderly exit.' }),
    story(137, 'HONNNNNK! The giant inflatable duck rises with dignity, waddles to the door and disappears with one rubbery SQUEAK.', 'departure', { ifFlag:'workshopDeparture' }),
    story(137, 'The giant duck takes one careful step, then another. Bworple waves and all seventeen ducklings peep encouragement.', 'departure-waiting', { unless:'workshopDeparture' }),
    story(137, 'Bworple waves a tiny handkerchief; Bworple Jr. peeps solidarity. The living room is a very normal duck-scale room once more.', 'ducklings-welcome'),
    say(137, 'sonic', 'Finally, I can see the front door again.', 'door-clear'),
    say(137, 'miku', 'The seventeen ducklings are still here. Good.', 'ducklings-stay'),
    say(137, 'tails', 'So the Robo-Duck 3000 turned into all of that. Do you still want to help me fix it?', 'next-choice'),
    choice(137, 'fix-choice',
      { id:'yes', line:'🔧 "Of course—ducks the right size this time."', effects:[flag('workshopFix','yes')],
        response:'Measure twice, waddle once. My new favorite engineering proverb.' },
      { id:'ideas', line:'💙 "Yeah. Thanks for making room for my ideas."', effects:[flag('workshopFix','ideas')],
        response:'Any time. You are an excellent inventor, Lune.' }),
    choice(131, 'miku-flop-choice',
      { id:'mention', line:'💬 Mention the concert idea, without playing anything.', effects:[flag('workshopFlop','mention')], speaker:'miku',
        response:'I heard you like a laugh. Even the mention made my biggest flop feel very historic.' },
      { id:'hide-flop', line:' quietly', effects:[flag('workshopFlop','hide')], speaker:'miku',
        response:'We can look at the funniest concert moments in our conversation, not on a screen. No recording or licensing required.' }),
    choice(131, 'upgrade-choice',
      { id:'voice', line:'🔊 Give Robo-Duck a friendly voice chip.', effects:[flag('workshopUpgrade','voice')],
        response:'A gentle quack chip. Preferably one that never says QUACK ERROR at bedtime.' },
      { id:'jetpack', line:'🚀 Give Robo-Duck a tiny jetpack.', effects:[flag('workshopUpgrade','jetpack')],
        response:'A very safe mini jetpack. One that does not accidentally inflate anything bigger on takeoff.' }),
    { source:131, checkpointId:'join-sonic', do:'join', id:'sonic' },
    { source:131, checkpointId:'join-tails', do:'join', id:'tails' },
    { source:131, checkpointId:'join-knuckles', do:'join', id:'knuckles' },
    { source:131, checkpointId:'join-bworple', do:'join', id:'bworple' },
    say(131, 'tails', 'Robo-Duck gets a tiny safe design upgrade. The giant ducks do not get a rematch. The ducklings go to bed, not the robot factory.', 'successor-choice', { ifFlag:'workshopRoboduckMind' }),
    say(131, 'tails', 'Even without that mind detail, Robo-Duck still needs a small fix. We can design quietly.', null, { unless:'workshopRoboduckMind' }),
    say(131, 'tails', 'Do you want to sleep after the workshop, or build a little project with me now?', 'ready-choice'),
    choice(141, 'final-choice',
      { id:'rest', line:'🌙 Sleep for now. No activating anything tonight.', effects:[flag('workshopRest','rest')],
        response:'The blueprint sleeps with you. Every duck stays put and nothing starts on its own.' },
      { id:'careful', line:'🛠️ Start one tiny safe fix.', effects:[flag('workshopRest','fix')],
        response:'One careful fix and then we save it. No one gets carried away tonight.' }),
    story(141, 'Tails quietly shows Lune the design idea for later. He puts it into storage rather than starting a full experiment.', 'ready-reaction', { ifFlag:'workshopRest' }),
    story(140, 'Tails digs out a shiny wrench and tags it with a tiny sticky note: “For LUNE — Chief Duck Inventor.”', 'wrench'),
    { source:140, checkpointId:'complete', do:'done', id:'workshop' },
  ];
  steps.forEach((step, index) => { step.checkpointId ||= `workshop-step-${index}`; });
  Object.assign(episode, {
    steps, dialogueStyle:'polished-two-choice', checkpointVersion:3,
    source:'MIKU 120-140; detailed polished adaptation',
    checkpointMigrations:{ 1:originalMigration(), 2:expandedMigration() },
    passport:'Big ducks went home, the ducklings stayed safe, Robo-Duck got a gentle upgrade and Lune earned his tiny wrench.',
    revisit:'Tails is waiting with clean blueprints and a quiet workshop. Robo-Duck sleeps safely; no giant inflatable duck is trying to fit through the door.',
  });
})(window.LUNE_CONTENT);
