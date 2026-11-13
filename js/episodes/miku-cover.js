'use strict';
// Playable Episode 15 / E07 - MIKU 233-238, polished adaptation.
// No reproduced lyrics or performance replacement.
(function ({ registerCharacter, registerEpisode }) {
  registerCharacter('momo', {
    name: 'MOMO',
    img: 'assets/characters/momo.jpg',
    color: '#ff9ecf',
    title: 'Laundry-Basket Backup Singer',
    bio: 'A cheerful friend who was definitely not hiding in the laundry basket. Loves backup vocals, tiny microphones, and comfortable blankets.',
  });

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
        effects:[flag(`coverChoice${checkpointId}`, option.id), ...(option.effects || [])],
        reply:{ ...say(source, option.speaker || 'miku', option.response), choiceResponse:option.id },
      })),
    };
  }
  const steps = [
    { source:233, checkpointId:'start', bg:'secret_room' },
    story(233, 'The karaoke machine glows in the corner of Lune’s room. Miku is already tapping out a beat on the moon bed.'),
    choice(233, 'cover-question',
      { id:'own-version', line:'🎤 “Can Lune make a Miku song with his own version?”', effects:[flag('coverQuestion','yes'), flag('coverOwnVersion',true)],
        response:'A Lune version? Your voice, your choices. Yes, of course you can make it your own.' },
      { id:'plan-first', line:'🎧 “Can I plan the cover before deciding whether I perform it?”', effects:[flag('coverQuestion','plan'), flag('coverPlanFirst',true)],
        response:'Planning first is very smart. We can talk structure, melody and comfort level before any camera or boombox.' }),
    say(233, 'miku', 'A Lune version?! Your voice, your style, your choices. I would love to hear it.', 'cover-offer', { ifFlag:'coverOwnVersion' }),
    say(233, 'rei', 'We can plan first and keep the performance optional, so no standing in the spotlight before you choose.', 'cover-plan', { ifFlag:'coverPlanFirst' }),
    story(233, 'Teto drops her baguette in excitement. Tails opens his laptop. Kaito, Bworple and Rin gather around, but nobody touches the machine yet.', 'room setup'),
    say(233, 'teto', 'Oh Vocaloids! A Lune cover! I just dropped my baguette in excitement.', 'baguette drop'),
    say(233, 'tails', 'I can help with robotic voice effects! Wait—Lune already has a robotic voice. Right. I forgot.', 'tails offer'),
    say(233, 'rei', 'Tails, that is the second time today. Lune’s voice is already exactly right, and we are not rewriting it.', 'voice rule'),
    say(233, 'miku', 'You can make your own version with your own voice and style. The performance belongs to you.', 'miku praise'),
    choice(233, 'style-choice',
      { id:'familiar', line:'🎵 “Keep the familiar melody and make it Lune’s.”', effects:[flag('coverStyle','familiar')],
        response:'A great direction. We can practice the chorus without recording anything until you are ready.' },
      { id:'new', line:'✨ “Give it a new arrangement.”', effects:[flag('coverStyle','new')], speaker:'tails',
        response:'A different arrangement! I can help set it up while you decide what your voice should do with it.' }),
    say(233, 'miku', 'The chorus only needs what you can give it. Your timing, your voice and your choice about performing it.', 'chorus'),
    choice(233, 'recording-choice',
      { id:'video', line:'🎬 “Pretend music video with the crew.”', effects:[flag('coverRecorded', true)],
        response:'Video plan ready. We will keep every camera decision in Lune’s control.' },
      { id:'audio-only', line:'🎙️ “Audio-only demo.”', effects:[flag('coverRecorded', false)],
        response:'Audio only. No camera, no clip and no group shot required.' }),
    story(233, 'Ryan, Dave, Jack and Jake from Animiguchi offer to help with sound, but nothing is recorded, published or licensed without Lune’s permission.', 'animiguchi'),
    choice(233, 'backup-choice',
      { id:'invite-momo', line:'🎀 “Can Momo sing backup?”', effects:[flag('coverInvitesMomo',true)], speaker:'momo',
        response:'Yes! I have been practicing my sparkly backup voice.' },
      { id:'group-hello', line:'💙 “Where is Momo? I hope she can hear the song.”', effects:[flag('coverInvitesMomo',false)], speaker:'momo',
        response:'Momo! Are we already singing? I was taking a little basket nap.' }),
    story(235, 'THUMP! THUMP! THUMP! The giant laundry basket starts wobbling beneath the karaoke machine.', 'laundry thump'),
    say(235, 'rin', 'UH... GUYS? WHY IS THE LAUNDRY BASKET MOVING?!', 'basket moving'),
    story(235, 'The lid pops open. Momo appears with a blanket on her head and a tiny pink microphone in her hand.', 'momo reveal'),
    say(235, 'momo', 'DID SOMEBODY SAY MY NAME?! I fell asleep in the laundry basket. It was wonderfully comfy!', 'momo hello'),
    say(235, 'rei', 'Momo! You missed the start of the cover planning.', 'momo late'),
    say(235, 'momo', 'Are we making a song? Can I sing backup? Please, please, please?', 'momo eager'),
    choice(235, 'momo-role-choice',
      { id:'backup', line:'🎀 “You are welcome to sing backup.”', effects:[flag('coverMomoRole','backup')], speaker:'momo',
        response:'YES! I have been practicing my sparkly backup voice!' },
      { id:'audience', line:'👏 “Cheer from the audience.”', effects:[flag('coverMomoRole','audience')], speaker:'momo',
        response:'Cheering squad and blanket supervisor! I am excellent at both and very good with cushions.' }),
    { source:235, checkpointId:'join-momo', do:'join', id:'momo' },
    say(236, 'rei', 'Boys can blush and sing Miku covers too. Lune is a boy, and his voice is his.', 'boy voice'),
    say(236, 'miku', 'Exactly. A cover belongs to the singer who knows his own voice.', 'miku praise2'),
    say(236, 'kaito', 'FINALLY! Another boy singer in the fort! Which means duets.', 'kaito boy'),
    say(236, 'len', 'EXCUSE ME?! I AM RIGHT HERE!', 'len objection'),
    choice(236, 'bworple-choice',
      { id:'cameo', line:'🟢 “Bworple can have a tiny cameo.”', effects:[flag('coverBworple','cameo')], speaker:'bworple',
        response:'I DEMAND A CAMEO. granted. pbbbbt.' },
      { id:'focus', line:'🎤 “Keep the spotlight on the singers.”', effects:[flag('coverBworple','focus')], speaker:'miku',
        response:'The singers keep center stage. Bworple can still do a very quiet pretend cameo in the wings.' }),
    story(237, 'They run through the song once. No lyrics are printed on the screen; the music is Lune’s to shape.', 'first run'),
    choice(237, 'replay-choice',
      { id:'take', line:'🎬 “Can I try one take and decide afterward?”', effects:[flag('coverTryTake', true)], speaker:'miku',
        response:'A small, careful take. We can edit and hold it until you say it is done.' },
      { id:'practice', line:'🌙 “No recording. I only want to practice.”', effects:[flag('coverTryTake', false)], speaker:'miku',
        response:'Practice only. That is a very healthy choice. We can hum, clap and keep it private.' }),
    story(238, 'The cover demo goes on the keepsake shelf only because Lune chooses it. Momo’s mic goes on or off by Lune’s hand.', 'demo decision'),
    story(238, 'Rei adds a headphones sticker to the Memory Book. The first Lune cover is saved safely.', 'headphones sticker'),
    { source:238, checkpointId:'complete', do:'done', id:'miku-cover' },
  ];
  steps.forEach((step, index) => { step.checkpointId ||= `cover-step-${index}`; });
  const rc = window.LUNE_CONTENT;
  rc.registerEpisode({
    id:'miku-cover', chapter:3, requiredFor:3, after:'secret', requires:['secret'],
    name:"Lune's Miku Cover", emoji:'🎤', desc:'Lune chooses how his own version of a Miku song should sound',
    badge:'NEW EPISODE', keepsake:'coverdemo', source:'MIKU 233-238; detailed polished adaptation',
    dialogueStyle:'polished-two-choice', checkpointVersion:4,
    passport:'Lune shaped the first cover in his own voice, Momo joined as backup or audience, and the demo stayed on the shelf because Lune chose it.',
    revisit:'The cover demo stays on the shelf because Lune chose it. Practice always comes first, and Momo is back in her blanket basket.',
    steps,
  });
  const episode = rc.EPISODES.find(part => part.id === 'miku-cover');
  episode.checkpointMigrations = {
    1:Array.from({length:34},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true})),
    2:Array.from({length:34},(_,i)=>({checkpointId:steps[Math.min(i,steps.length-1)].checkpointId,reask:true})),
  };

})(window.LUNE_CONTENT);
