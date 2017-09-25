import { Stream } from 'xstream';
import { DOMSource, VNode, a, button, i } from '@cycle/dom';
import isolate from '@cycle/isolate';
import './styles.scss';

interface Sources {
  dom: DOMSource;
}

interface Sinks {
  dom: Stream<VNode>;
  history: Stream<string>;
}

const ArchiveLinkComponent = ({ dom }: Sources): Sinks => {
  const click$ = dom.select('.more').events('click', { preventDefault: true });
  const props = { attrs: { href: '#', title: 'view all previous events' } };
  const vdom$ =
    Stream.of(
      a('.more', props, [
        'Past events',
        button([
          i('.material-icons', { props: { role: 'presentation' } }, 'arrow_forward')
        ])
      ])
    );
  return {
    dom: vdom$,
    history: click$.mapTo('/archive')
  };
};

export const ArchiveLink: (sources: Sources) => Sinks = sources => isolate(ArchiveLinkComponent)(sources);
