import { Stream } from 'xstream';

export function pluck<T,U>(stream: Stream<T>, getter: (single: T) => Stream<U>): Stream<U> {
  return stream.map(str => getter(str) || Stream.empty()).flatten();
}
