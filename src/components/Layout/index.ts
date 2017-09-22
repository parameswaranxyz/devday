import { Sources, Sinks } from '../../definitions';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Stream } from 'xstream';
import { VNode, div } from '@cycle/dom';
import { pluck } from '../../utils';
import { renderSnackbar } from '../../drivers/snackbars';
import '../../styles/material-icons.scss';
import './styles.scss';

interface LayoutSources extends Sources {
  sinks$: Stream<Sinks>;
}

export const Layout = (sources: LayoutSources): Sinks => {
  const xs = Stream;
  const headerDom$ = Header().dom;
  const footerDom$ = Footer().dom;
  const sinks$ = sources.sinks$;
  const componentDom$ = pluck(sinks$, sinks => sinks.dom);
  const snackbarDom = renderSnackbar();
  const vtree$ = xs.combine(headerDom$, componentDom$, footerDom$)
    .map(([headerDom, componentDom, footerDom]) =>
      div('.devday.home', [
        div('.container', [
          div('.layout', [
            div('.content', [
              headerDom,
              componentDom,
              footerDom
            ])
          ])
        ]),
        snackbarDom
      ]));
  return {
    dom: vtree$,
    events: pluck(sinks$, sinks => sinks.events),
    registrations: pluck(sinks$, sinks => sinks.registrations),
    history: pluck(sinks$, sinks => sinks.history),
    material: pluck(sinks$, sinks => sinks.material),
    talks: pluck(sinks$, sinks => sinks.talks),
    snackbars: pluck(sinks$, sinks => sinks.snackbars)
  };
};
