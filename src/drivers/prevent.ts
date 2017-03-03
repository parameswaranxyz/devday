import { Stream } from 'xstream';

export class PreventSource {
  constructor(event$: Stream<Event>) {
    const noop = () => {};
    event$.addListener({
      next: ev => {
        ev.preventDefault();
        ev.stopPropagation();
      },
      error: noop,
      complete: noop
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
