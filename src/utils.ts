import { Stream } from 'xstream';

export function pluck<T,S>(stream: Stream<T>, propertyName: string): Stream<S> {
  return stream.map(str => str[propertyName]).flatten();
}
