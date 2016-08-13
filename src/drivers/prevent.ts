import { Stream } from 'xstream';

export class PreventSource {
  constructor(event$: Stream<Event>) {
    const xs = Stream;
    event$.addListener({
      next: ev => {
        ev.preventDefault();
        ev.stopPropagation();
      },
      error: () => { },
      complete: () => { }
    });
  }
}

export function makePreventDriver(): (event$: Stream<Event>) => PreventSource {
  function preventDriver(event$: Stream<Event>) {
    return new PreventSource(event$);
  }
  return preventDriver;
}

export default makePreventDriver;
