'use strict';
// Editorial pass over registered story data, not engine control flow. The base
// scripts retain their source references; only playable choices/replies change.
(function ({ EPISODES }) {
  const reply = (say, text) => ({ say, text, flowEdit: 'Polished, choice-specific adaptation.' });
  const option = (label, say, text) => ({ label, reply: reply(say, text) });
  const scripts = {
    secret: [
      [option('🔎 “Everyone, try the scanner. Kaito—normal face!”', 'kaito', 'Normal face? But my dramatic face is ready!'), option('🌙 “Let’s check the room’s security together.”', 'tails', 'I’ll bring the tablet. Kaito, please don’t confuse the scanner.')],
      [option('🌙 “No big scanner. Everyone here is trusted.”', 'tails', 'The tiny trust scanner can handle that!'), option('🤝 “Keep the little scanner for trusted friends.”', 'rei', 'A hidden scanner instead of that enormous one? Let’s see!')],
      [option('🎵 “Bworple has a cover with Animiguchi?!”', 'bworple', 'bworple has been busy.'), option('📀 “Who put this Bworple album in the library?”', 'tails', 'An album? Let me check that title again!')],
      [option('🎸 “Animiguchi is the group, not one person!”', 'rei', 'Oh! I was counting the caption instead of the people!'), option('👥 “Look outside—there’s a whole band!”', 'tails', 'Four visitors! That explains the group caption.')],
      [option('💬 “They spoke together, so they share a caption.”', 'tails', 'Four voices in unison. I’ll fix the display.'), option('🎤 “Ryan, Dave, Jack and Jake—four people!”', 'rei', 'Four people! Thank you, Lune. Now the captions make sense.')],
      [option('🎵 “I thought you knew about Vocaloids!”', 'rei', 'I do! Wait—are you asking me?'), option('👋 Ask the group whether they know the singers.', 'rei', 'Vocaloid questions! I think I know this one!')],
      [option('😅 “I meant the group, Rei.”', 'rei', 'Oh! I answered somebody else’s question again!'), option('🎸 “That question was for Animiguchi.”', 'rei', 'Right! I’ll let our guests answer.')],
      [option('🚪 “They’re approved. Nobody tried the handle!”', 'tails', 'Access is already granted! Let’s check the door.'), option('🔓 “I already let them in. The door is unlocked!”', 'rei', 'Then what are they waiting for?!')],
      [option('🎬 “That’s blooper number one!”', 'rei', 'The door incident! What a start to the reel!'), option('📹 “Save that for the video!”', 'tails', 'I have the door footage ready for a replay.')],
    ],
  };

  // Keep two useful paths at wider choice points, retaining opt-outs. Values are
  // old option indices, so existing effects stay attached to their intended action.
  const keep = {
    'captain-duckula': { 1:[0,2], 3:[0,2] },
    'hug-alarm': { 0:[0,2], 1:[0,2] },
    slimmarchives: { 0:[0,1], 6:[0,1] },
    bworplevoice: { 3:[0,1], 4:[0,1] },
    'miku-cover': { 0:[0,2], 1:[0,1], 2:[0,2], 3:[0,1] },
    karmacam: { 1:[0,1], 6:[0,1], 7:[0,1] },
  };
  const responses = {
    slimmarchives: {
      0:[option('😂 Start with the silly sleepover skits.', 'tails', 'Skits first, then the concert screen and prank archive.'), option('📺 Start with the concert-screen story.', 'tails', 'The screen story first, then the silly skits and pranks.')],
      2:[option('💦 “Show us Kaito’s ice-water prank!”', 'tails', 'Ice-water prank queued up!'), option('🎞️ “Can we watch the prank archive?”', 'tails', 'Archive open. It begins with one very suspicious rubber duck.')],
      3:[option('🦆 “What happened in Kaito’s revenge?”', 'tails', 'The Duckinator 5000! Let’s watch.'), option('🟢 “Show us the slime part!”', 'tails', 'Here it comes—the Duckinator’s slime scene!')],
      6:[option('🚪 Step aside and warn Kaito about the bucket.', 'kaito', 'Thanks for the warning! That bucket is wobbling again!'), option('🧢 Ask Kaito to help redirect the bucket.', 'kaito', 'Together! Let’s try to keep it off the pillows.')],
      10:[option('🎤 “My robot part is my voice, not an antenna!”', 'rei', 'Your voice! You’re right, little brother.'), option('🥤 “Bworple, isn’t that your straw?”', 'bworple', 'yes. straw. very advanced straw technology.')],
    },
    bworplevoice: {
      0:[option('🎤 Call Miku by name instead of using the command word.', 'miku', 'Me? Did somebody say Vocaloids? Oh—wait!'), option('⚠️ Ask everyone to avoid the microphone’s trigger word.', 'miku', 'The word “Vocaloids”? Wait, I just said it!')],
      3:[option('🥤 “May I try the cherry-lime smoothie?”', 'bworple', 'first customer! one little taste of the edible jelly fizz.'), option('📋 “What’s on the menu?”', 'bworple', 'Cherry-Limeade Jelly Fizz, Lemon-Lime Slime Soda and Blueberry Bworple Blast.')],
      4:[option('⭐ “The minimum is one star, Teto!”', 'teto', 'Then ONE STAR OUT OF INFINITY!'), option('🥖 “Would a baguette improve the review?”', 'teto', 'No baguettes, no good review! One star out of infinity!')],
      5:[option('🥤 Call it “Bworple-slurpee” and invite a tasting.', 'rei', 'Edible jelly fizz only! The prank slime stays far away from the cups.'), option('🧃 Call it “Bworple-juice” and pack the mic away.', 'bworple', 'microphone off. smoothie business open.')],
    },
    kitchen: { 1:[option('🎬 Save the funny Kaito clip.', 'kaito', 'At least my ice cream survived the cleanup!'), option('📷 Keep the clip off the reel.', 'rei', 'Off the reel it stays. We can keep the kitchen cozy instead.')] },
    'miku-cover': {
      0:[option('🎤 “Can I make a Miku cover in my own style?”', 'miku', 'Yes! Your voice and your style.'), option('🎧 “Help me plan my own cover?”', 'miku', 'Absolutely. We can plan it together before trying anything.')],
      1:[option('🎵 Keep the familiar melody and make the voice Lune’s.', 'miku', 'Your voice can make that melody feel like yours.'), option('✨ Give the cover a new arrangement.', 'tails', 'A different arrangement! I can help set it up.')],
      2:[option('🎬 Make a pretend music video with the crew.', 'rei', 'Video plan ready. We’ll keep the performance inside our story.'), option('🎙️ Keep the demo audio-only.', 'miku', 'Audio only. No camera needed for the demo.')],
      3:[option('🎀 Invite Momo to sing backup.', 'momo', 'YES! I have been practicing my sparkly backup voice!'), option('👏 Ask Momo to cheer from the audience.', 'momo', 'Official cheer squad and blanket supervisor. I can do both!')],
    },
    karmacam: {
      2:[option('👽 Invite Shadow to inspect the toy UFO.', 'shadow', 'The spacecraft? I will inspect the design.'), option('🛸 Ask Tails what the UFO is carrying.', 'tails', 'Four tiny hats. I think Bworple has planned something.')],
      5:[option('🟢 Ask Knuckles about a washable slime prank.', 'knuckles', 'Washable, and only once. Then a towel.'), option('🧼 Ask Shadow to explain the prank to Knuckles.', 'shadow', 'Washable slime. Knuckles gets to agree before the rope moves.')],
      8:[option('🤝 Thank Shadow for trusting the warning.', 'shadow', 'A warning is better than a surprise bucket.'), option('🧼 Help Knuckles clean up.', 'knuckles', 'A towel! Finally, somebody with a good plan.')],
    },
    baguettecrisis: {
      0:[option('🥖 Help gather the baguettes before answering.', 'teto', 'Careful with the emergency baguettes!'), option('📱 Answer Gumi’s call.', 'gumi', 'Hello! I’ve got carrot news!')],
      2:[option('🧮 Ask Tails about the baguette equation.', 'tails', 'Bunny plus forty-seven baguettes? Calculator ready.'), option('🥖 “You’re not turning into bread, Teto.”', 'teto', 'Good. My baguettes and I would like that on record.')],
      3:[option('🔍 Inspect the cardboard breadship with Tails.', 'tails', 'Cardboard, tape and one baguette. Bworple’s engineering signature.'), option('📱 Show Bunny the breadship.', 'gumi', 'You have to show me that ridiculous spaceship!')],
      4:[option('💌 Make Bunny a get-well card with everyone.', 'miku', 'Everyone can add a little message!'), option('🥕 Choose a carrot-shaped get-well card.', 'rei', 'A paper carrot—no extra carrots for her tummy!')],
      5:[option('💥 Give the cardboard breadship a tiny smack.', 'teto', 'Away from my baguettes, please!'), option('🧺 Ask Tails to catch it in a blanket.', 'tails', 'Blanket ready. One soft landing coming up.')],
    },
  };

  for (const episode of EPISODES) {
    if (episode.id === 'first-ah' || episode.dialogueStyle === 'polished-two-choice') continue; // Individually reviewed in this style.
    const previous = episode.checkpointVersion || 1;
    const migrations = {};
    let turn = 0;
    episode.steps.forEach((step, index) => {
      step.checkpointId ||= `polish-${index}`;
      migrations[index] = { checkpointId: step.checkpointId, ...(step.choice ? { reask:true } : {}) };
      if (!step.choice) return;
      const old = step.choice;
      const selected = keep[episode.id]?.[turn] || [0,1];
      const replacement = scripts[episode.id]?.[turn] || responses[episode.id]?.[turn];
      step.choice = selected.map((oldIndex, i) => {
        const result = { ...old[oldIndex], ...(replacement?.[i] || {}) };
        delete result.original;
        delete result.context;
        // A same-intent choice keeps its effects. All edited choices get an
        // explicit response rather than a reaction to the unchosen option.
        if (!result.reply) throw new Error(`Missing polished response: ${episode.id} turn ${turn}`);
        return result;
      });
      step.flowEdit = 'Two polished choices; original transcript presentation superseded by user.';
      turn++;
    });
    episode.checkpointMigrations ||= {};
    // Earlier source-first releases also have pre-expansion numeric saves.
    // A stored reply must not turn into one of the newly worded player choices.
    if (previous > 1 && episode.legacyStepIds) {
      episode.checkpointMigrations[1] ||= {};
      episode.legacyStepIds.forEach((id, index) => {
        const prior = episode.checkpointMigrations[1][index];
        const target = episode.steps.find(s => s.checkpointId === (prior?.checkpointId || id));
        if (target) episode.checkpointMigrations[1][index] = {
          ...prior, checkpointId: target.checkpointId, ...(target.choice ? { reask:true } : {}),
        };
      });
    }
    episode.checkpointMigrations[previous] = migrations;
    episode.checkpointVersion = previous + 1;
    episode.dialogueStyle = 'polished-two-choice';
    episode.polishPassApplied = true;
  }

  // Keep the shared dialogue compatible with either chosen path. These are
  // flow edits to existing scenes, not new events or additional plot.
  function revise(id, find, text) {
    const step = EPISODES.find(e => e.id === id)?.steps.find(find);
    if (!step) throw new Error(`Missing dialogue flow edit: ${id}`);
    if (step.say) step.text = text;
    else step.narrator = text;
    step.flowEdit = 'Shared follow-through fits either polished choice.';
  }
  revise('karaoke', s => s.say === 'teto' && s.text.startsWith('ACCEPTABLE!!!'),
    'You got us laughing instead of arguing. But my drill hair is still fabulous.');
  // Miku Cover now has its own detailed pass; this line is disabled.
  // Baguette Crisis now has its own detailed script; old revision disabled.
  // The Slime Wars now has its own detailed script. Keep its completed revision lines disabled.
  // Bworple's Slime Company now has its own detailed script; keep its line disabled.
  // revise('bworplevoice', ...);
  // Karmacam now has own detailed script. revise disabled.
  // revise('karmacam', ...);
})(window.LUNE_CONTENT);
