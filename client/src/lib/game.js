/* Utilidades comunes para los componentes de juego. */
import { useApp } from '../stores/app.js';
import { Voice } from './voice.js';
import { Sfx } from './sfx.js';
import { showFeedback, praise, retry } from './feedback.js';
import { lettersForLevel } from '../content/lessons.js';

export function useGame(props, emit) {
  const app = useApp();
  const start = Date.now();
  const level = props.params?.level ?? app.level;
  const world = props.params?.world || app.profile?.favorite || null;

  function setInstruction(text, speakText) {
    const say = () => Voice.speak(speakText || text);
    emit('instruction', { text, say });
    if (app.settings.autoRead) setTimeout(say, 120);
    return say;
  }
  function finish(firstTry, extra = {}) {
    emit('done', { firstTry: !!firstTry, durationMs: Date.now() - start, ...extra });
  }
  function good(speakText) {
    Sfx.play('ok');
    showFeedback(praise());
    Voice.speak(speakText || praise());
  }
  function bad(speakText, speakIt = true) {
    Sfx.play('bad');
    showFeedback(retry(), true);
    if (speakIt) Voice.speak(speakText || retry());
  }
  return { app, level, world, setInstruction, finish, good, bad, letters: lettersForLevel(level) };
}
