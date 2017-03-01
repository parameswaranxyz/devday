import xs from 'xstream';
import { VNode, header, h1, span, img, h2 } from '@cycle/dom';

interface HeaderSinks {
  dom: xs<VNode>;
}

const nouns = ['experiences', 'ideas', 'opinions', 'perspectives'];
const topics = ['technology', 'internet of things', 'cloud computing', 'arduino', 'databases'];

function renderHeader(noun: string, topic: string): VNode {
  return header([
    h1([
      span('.hidden', 'devday_'),
      img({ props: { src: 'images/logo.gif' } })
    ]),
    h2([
      'a monthly informal event for developers to share their ',
      span('.noun', noun),
      ' about ',
      span('.topic', topic)
    ])
  ]);
}

export function Header(): HeaderSinks {
  const noun$ = xs.periodic(1000)
    .startWith(0)
    .map(x => x % nouns.length)
    .map(i => nouns[i]);
  const topic$ = xs.periodic(3000)
    .startWith(0)
    .map(x => x % topics.length)
    .map(i => topics[i]);
  const vtree$ =
    xs.combine(noun$, topic$)
      .map(([noun, topic]) => renderHeader(noun, topic));
  return {
    dom: vtree$
  };
}
