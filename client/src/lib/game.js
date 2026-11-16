/* Utilidades comunes para los componentes de juego. */
import { useApp } from '../stores/app.js';
import { Voice } from './voice.js';
import { Sfx } from './sfx.js';
import { showFeedback, praise, retry } from './feedback.js';
import { lettersForLevel, knownForLevel } from '../content/lessons.js';
import { setKnownLetters } from './content.js';

export function useGame(props, emit) {
  const app = useApp();
  const start = Date.now();
  const level = props.params?.level ?? app.level;
  const world = props.params?.world || app.profile?.favorite || null;
  // letras ya enseñadas: las de la lección, o las del nivel en el modo libre
  const known = props.params?.known === undefined ? knownForLevel(level) : props.params.known;
  setKnownLetters(known);

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
  return { app, level, world, known, setInstruction, finish, good, bad, letters: lettersForLevel(level) };
}
