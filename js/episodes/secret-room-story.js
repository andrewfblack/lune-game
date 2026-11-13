'use strict';
// Playable Episode 17 / E06 - MIKU 206-232, polished adaptation.
(function ({ EPISODES }) {
  const episode = EPISODES.find(part => part.id === 'secret');
  if (!episode) throw new Error('Missing Lune-Only Room episode');
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
        effects:[flag(`secretChoice${checkpointId}`, option.id), ...(option.effects || [])],
        reply:{ ...say(source, option.speaker || 'rei', option.response), choiceResponse:option.id },
      })),
    };
  }
  const steps = [
    { source:206, checkpointId:'start', bg:'secret_room' },
    story(206, 'The Lune-Only Room has four cameras for fun, one small trust scanner and a wall of Polaroids. The big facial-recognition terminal is not required today.', 'room intro'),
    choice(206, 'camera-choice',
      { id:'calm scan', line:'🎬 “Rei, the cameras are silly. No giant scan needed.”', effects:[flag('secretTrustMode','hidden')], speaker:'tails',
        response:'The cameras are for friends, not a giant scan. Zero creeper un-gigachad required.' },
      { id:'normal face', line:'🤣 “Kaito, normal face for a professional selfie.”', effects:[flag('secretTrustMode','normal')], speaker:'kaito',
        response:'Normal face?! But my dramatic face is ready! I have been stretching these jaws.' }),
    story(208, 'Kaito tries the gigantic face. FACE NOT RECOGNIZED. Reason: too much chin. KAITO!!! THE CAMERA DOES NOT RECOGNIZE YOUR JAWLINE!!!', 'kaito gigachad'),
    story(208, 'Kaito keeps the face, which makes the scanner less useful and the blooper reel richer. He then attempts another crescent-moon smile.', 'kaito cameo'),
    say(208, 'rei', 'KAITO!!! STOP!!! YOU ARE CONFUSING THE CAMERA!!!', 'stop kaito'),
    choice(208, 'face-choice',
      { id:'fired camera', line:'😂 “Maybe give Kaito one last silly face before he retires.”', speaker:'tails',
        response:'Final gigachad: HMMMMMMMM!!! Camera sees a rectangle. The scanner logs: SUSPICIOUS RECTANGLE.' },
      { id:'camera set', line:'📸 “Smile, normal. We are using the hidden scanner.”', speaker:'tails',
        response:'Ok. Lens off. Hidden scanner on. Someone should close the gigachad stack.' }),
    story(208, 'The giant facial scanner sinks into the wall. An almost invisible little scanner appears over the doorway.', 'hidden scanner'),
    story(208, 'Kaito waves the face at the tiny scanner one last time. It beeps, ignores the jawbone and opens the door.', 'kaito accepted'),
    say(208, 'tails', 'Well, it recognizes who you are, not how ridiculous you look.', 'recognize'),
    say(208, 'rei', 'SO IT KNOWS KAITO IS RIDICULOUS!!!', 'rei lol'),
    say(208, 'kaito', 'HEY!!!', 'kaito offended'),
    story(208, 'The scanner knows everyone in the room. All seventeen ducklings are already on the eligible list, so nobody is left in the hallway.', 'ducklings trusted'),
    story(208, 'Bworple keeps a giant record of the sixteen friends and seventeen ducklings on a let’s-trust list. No one needs a top-security background check to enjoy the room.', 'access list', { ifFlag:'secretStrict' }),
    say(208, 'rei', 'ONE THING YOU ASKED ABOUT: Daisy 2.0 is restricted. It has no hallway door code, no jamming switch and no installation.', 'daisy restricted'),
    choice(208, 'trust-mode-choice',
      { id:'invisible', line:'🔍 “Make it a hidden little scanner only, nothing giant.”', effects:[flag('secretTrustMode','hidden')],
        response:'The giant scanner sinks into the wall. The room becomes much less silly and much more capable of recognizing friends.' },
      { id:'family list', line:' homeowner', lineExtra:' “Everyone we trust is already allowed.”', effects:[flag('secretTrustMode','family')],
        response:'Exactly. Friends and ducklings pass. The only locked file is Daisy 2.0, and that stays locked to everyone.' }),
    story(208, 'A tiny micro-scanner appears over the doorway and recognizes the ducklings, Vocaloids, Bworple and the Sonic friends. KAITO still cannot trigger it with a joke face.', 'scanner installed', { ifFlag:'secretTrustFamily' }),
    say(209, 'rei', 'WAIT WAIT WAIT!!! YOU’RE TELLING ME ANYONE LUNE TRUSTS CAN JUST GET IN?!?!', 'trust result', { ifFlag:'secretTrustFamily' }),
    story(209, 'Rei is not mad after all. She is impressed by how quickly the invisible scanner handles seventeen ducklings.', 'impressed', { ifFlag:'secretTrustFamily' }),
    story(209, 'The hidden micro-scanner keeps the door lock out of the way. Bworple still cannot open it with his jelly phone.', 'scanner detail', { ifFlag:'secretTrustFamily' }),
    say(210, 'kaito', 'Kaito can now show his real talent: booking the ticket, not building the bureaucracy.', 'kaito proud'),
    choice(208, 'scan-success-choice',
      { id:'hide giant', line:' garage', lineExtra:' hides panel.', effects:[flag('secretHideScanner', true)], speaker:'tails',
        response:'Hidden panel, safe screen. The scanner recognition is fast enough for ducks and people without a face performance.' },
      { id:'explain list', line:'📋 Why everyone on Lune’s list should pass.', effects:[flag('secretHideScanner', false)], speaker:'tails',
        response:'Blue list, blue light. No accounts, no database and no gigs for the receptionist.' }),
    story(208, 'The tiny scanner remains above the door. It blinks once and adds the most recent rubber duck to a perfectly mundane guest list.', 'list add', { ifFlag:'secretHideScanner' }),
    story(208, 'Tails explains the trust list plainly. Everyone recognized below has given an actual invitation.', 'explain list', { unless:'secretHideScanner' }),
    say(208, 'tails', 'So the scanner checks who you brought, not what your hat looks like.', 'tails trust'),
    say(208, 'rei', 'Well, it recognizes who you are, not how ridiculous you look.', 'identify'),
    story(206, 'The scanner cabinet is closed. Daisy 2.0 remains restricted to everyone, even trusted guests.', 'daisy restricted'),
    choice(210, 'daisy-choice',
      { id:'hidden card', line:'🚫 “Daisy 2.0 stays restricted. No secret installs.”', effects:[flag('secretDaisyRestricted', true)], speaker:'rei',
        response:'Absolutely. No secret installations, no upgrades and no hallway access. Daisy 2.0 stays classed as restricted for everyone.' },
      { id:'card only', line:' permanent', effects:[flag('secretDaisyRestricted', false)], speaker:'rei',
        response:'The door card simply says “restricted.” Nobody gets group access data, and no bathroom or garage passcard is issued.' }),
    story(210, 'Daisy 2.0’s fictional access card stays restricted. It never fills in a real form or unlocks an external account.', 'daisy card', { ifFlag:'secretDaisyRestricted' }),
    story(210, 'No one tries Daisy 2.0. The security capture is a quiet label on a piece of pretend cardboard at the desk.', 'silent label', { unless:'secretDaisyRestricted' }),
    say(227, 'rei', 'And I’m careful with you. You’re half human with a robotic voice, but I am not going to drag you around at supersonic speed or test your body limits.', 'voice boundary'),
    choice(227, 'voice-choice',
      { id:'voice-only', line:'🎤 “My robot part is my voice—not an antenna.”', effects:[flag('secretVoiceCorrection', true)], speaker:'rei',
        response:'Right. Your voice. Not a label, battery gauge or reason for a speed run.' },
      { id:'calm gently', line:'💙 “Let it be gentle; no rushing or body tests.”', effects:[flag('secretVoiceCorrection', false)], speaker:'rei',
        response:'Gentle all the way. No shoulder tackling, panic tests or unnecessary camera work.' }),
    story(208, 'Suddenly, Bworple presents his music album in the secret room. Bworple has been busier than he let on. No album cover opens a new wing.', 'album'),
    say(208, 'rei', 'WAIT... BWORPLE HAS A SONG?!?!', 'song'),
    say(208, 'tails', 'UH... LUNE? THERE’S AN ENTIRE ALBUM HERE!', 'album'),
    say(208, 'rei', 'WAIT!!! ANIMIGUCHI?!?!, the person who made that Miku song?!?!?', 'animiguchi'),
    choice(208, 'album-choice',
      { id:'band talk', line:'🎸 “Can Animiguchi be our production friends?”', effects:[flag('secretAlbumRole','animiguchi')], speaker:'rei',
        response:'The group, not one person. Ryan, Dave, Jack and Jake—four friends with one shared caption.' },
      { id:'sonic sam', line:' center sonic', lineExtra:' “Maybe another Sonic friend shows up too?”', effects:[flag('secretAlbumRole','sonic')], speaker:'sonic',
        response:'Sonic may arrive through the living room, but the Album Room is still and no bigger than a quiet front door.' }),
    say(208, 'rei', 'Four people, one album. The caption system may be broken, but the friends are intact.', 'caption'),
    say(208, 'tails', 'Okay, who broke the captions?', 'broken captions'),
    say(208, 'teto', 'Probably Tails.', 'teto blame'),
    say(208, 'tails', 'HEY!', 'tails protest'),
    story(208, 'The group walks inside. Seven Sonic friends are around the room, but the music plays at normal volume and no uninvited people take over.', 'band enter'),
    choice(208, 'vocaloid-choice',
      { id:'pop quiz', line:' vocaloids unite', lineExtra:' “Am I a Vocaloid or an UTAU?”', effects:[flag('secretVocaloid','pop')], speaker:'miku',
        response:'YES! And me? Originally UTAU, and later Synthesizer V! Acceptable!' },
      { id:'check first', line:'📋 “Maybe we should ask before assuming what group this is.”', effects:[flag('secretVocaloid','check')], speaker:'tails',
        response:'A good review. We can keep the Vocaloid facts and Teto facts separate.' }),
    say(208, 'bworple', 'my producer has arrived.', 'bworple producer'),
    story(208, 'Bworple’s music career remains pretend. His producer status is a caption, not an actual contract.', 'non-contract'),
    choice(211, 'door-choice',
      { id:'approved', line:'🚪 “Lune already approved them; why wait outside?”', effects:[flag('secretDoorState','opened')],
        response:'Waiting for the handle to turn! Their three-minute confusion, not Lune’s concern.' },
      { id:'handle test', line:' handle', lineExtra:' “Someone should try the handle.”', effects:[flag('secretDoorState','handle')],
        response:'A flashlight, a person and one old door. The handle works; no supernatural automation required.' }),
    say(211, 'tails', 'WE’VE BEEN STANDING HERE FOR THREE MINUTES BECAUSE NOBODY TRIED THE HANDLE?!', 'handle clue'),
    choice(212, 'handle-choice',
      { id:'Ryan opens', line:' handle', lineExtra:' “Let Ryan try the handle first.”', effects:[flag('secretDoorHandle','ryan')], speaker:'ryan',
        response:'I will open it. It is just a door, several people and one shared caption.' },
      { id:'ask lune', line:' key', lineExtra:' “Lune, are they approved?”', effects:[flag('secretDoorHandle','lune')], speaker:'rei',
        response:'Approved already. A secret code is not necessary; the handle still works.' }),
    story(212, 'Ryan grabs the handle. The door opens. Everyone is allowed and nobody is reduced to a dancing pair of doorknobs. Music plays at normal volume.', 'door open'),
    say(212, 'rei', 'The door-save point. The three-minute confusion can replay without repeating effects.', 'door-save'),
    say(212, 'rei', 'The door swings open.'),
    say(212, 'rei', "LUNE!!! THAT'S PERFECT!!! BLOOPER NUMBER ONE!!!", 'bloop-one'),
    { do:'blooper', id:'door' },
    say(214, 'rei', 'AND THE BEST PART? I’VE SET UP FOUR CAMERAS FOR THE REST OF THE SLEEPOVER!!!', 'cameras'),
    story(214, 'One camera slips off its tripod. It lands softly. Bworple catches it—no real safety incident or head bump.', 'tripod'),
    choice(214, 'cleanup-blopen-choice',
      { id:'blooper', line:'🎬 “Add the falling camera as Blooper One!”', effects:[flag('secretBlooper','one')], speaker:'rei',
        response:'BLOOPER NUMBER ONE! Slow motion, dramatic music, and a very squishy replay.' },
      { id:'save it', line:' camera', lineExtra:' “Maybe let the camera recover first.”', effects:[flag('secretBlooper','save')], speaker:'tails',
        response:'Instant replay later. It holds the camera and pauses the blooper safely.' }),
    { source:232, checkpointId:'join-animiguchi', do:'join', id:'ryan' },
    { source:232, checkpointId:'join-animiguchi2', do:'join', id:'dave' },
    { source:232, checkpointId:'join-animiguchi3', do:'join', id:'jack' },
    { source:232, checkpointId:'join-animiguchi4', do:'join', id:'jake' },
    story(232, 'With the cameras recovered and the door open, the friends move toward the ASSIGNMENT; the silver key from MP02 stays in the desk.', 'summary'),
    say(232, 'rei', 'Welcome, gentlemen. The silver key still has not opened any door.', 'welcome'),
    say(232, 'tails', 'I built a trust scanner, not a door-opening robot.', 'tails room'),
    say(232, 'rei', 'BLOOPER NUMBER TWOOOOOO!!!', 'second blooper'),
    { source:232, checkpointId:'complete', do:'done', id:'secret' },
  ];
  finalFix(steps);
  Object.assign(episode, {
    steps, dialogueStyle:'polished-two-choice', checkpointVersion:4,
    source:'MIKU 206-232; detailed polished adaptation with no forced entry, live scan, camera injury or new door solution',
    checkpointMigrations:{ 1:Array.from({length:121},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true})), 2:Array.from({length:121},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true})) },
    passport:'The trust scanner recognized friends and ducklings, Animiguchi arrived in full, and the blue door opened with cooperation.',
    revisit:'The small scanner is quiet, the blue door remains a choice and Daisy 2.0 stays restricted. Everyone got in without a headline.',
  });

})(window.LUNE_CONTENT);

function finalFix(steps) {
  steps.forEach((step,index) => {
    if (step.say && step.say.text === "Unused") step.say.text="PLACEHOLDER-REMOVED";
    step.checkpointId ||= `secret-step-${index}`;
  });
  // Replace the accidental bad text from generated guards.
  for (const step of steps) if (step.source === 287 && step.narrator) step.narrator = 'The cardboard breadship takes its time wobbling down like a loose stage prop.';
}
