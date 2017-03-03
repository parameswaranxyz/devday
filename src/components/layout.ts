import { Sources, Sinks } from '../definitions';
import { Header } from './header';
import { Footer } from './footer';
import { Stream } from 'xstream';
import { VNode, div } from '@cycle/dom';
import { pluck } from '../utils';
import { RegistrationRequest } from '../drivers/registrations';

interface LayoutSources extends Sources {
  sinks$: Stream<Sinks>;
}

export function Layout(sources: LayoutSources): Sinks {
  const xs = Stream;
  const headerDom$ = Header().dom;
  const footerDom$ = Footer().dom;
  const sinks$ = sources.sinks$;
  const componentDom$ = pluck(sinks$, sinks => sinks.dom);
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
        ])
      ]));
  return {
    dom: vtree$,
    routes: pluck(sinks$, sinks => sinks.routes),
    events: pluck(sinks$, sinks => sinks.events),
    prevent: pluck(sinks$, sinks => sinks.prevent),
    registrations: pluck(sinks$, sinks => sinks.registrations),
    history: pluck(sinks$, sinks => sinks.history),
    material: pluck(sinks$, sinks => sinks.material)
  };
}
