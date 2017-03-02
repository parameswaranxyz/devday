import { Stream } from 'xstream';

export function pluck<T, U>(stream: Stream<T>, getter: (single: T) => Stream<U>): Stream<U> {
  return stream.map(str => getter(str) || Stream.empty()).flatten();
}

export const fadeInOutStyle = {
  opacity: '0', delayed: { opacity: '1' }
};

export function pad(n: string, width: number, z?: string): string {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
