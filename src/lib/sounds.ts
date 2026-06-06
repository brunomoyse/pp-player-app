// Achievement-unlock sound effects, played via expo-audio.
//
// expo-audio plays `require()`d bundle assets. Drop e.g. an `unlock.mp3` and
// `legendary.mp3` under `assets/sounds/` and point these at them:
//   export const UNLOCK_SOUND = require('../../assets/sounds/unlock.mp3');
// Until an asset is bundled they stay null and playback is skipped (the haptic
// and visual still fire).

export const UNLOCK_SOUND: number | null = null;
export const LEGENDARY_SOUND: number | null = null;
