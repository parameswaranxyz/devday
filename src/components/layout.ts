import { Sources, Sinks } from '../definitions';
import { Header } from './header';
import { Footer } from './footer';
import xs from 'xstream';
import { div } from '@cycle/dom';
import { pluck } from '../utils';
import { RegistrationRequest } from '../drivers/registrations';

interface LayoutSources extends Sources {
  component$: xs<(sources: Sources) => Sinks>;
}

export function Layout(sources: LayoutSources): Sinks {
  const headerDom$ = Header().dom;
  const footerDom$ = Footer().dom;
  const sinks$ = sources.component$.map(component => component(sources));
  const sinksDom$ = sinks$.map(sink => sink.dom);
  const vtree$ = xs.combine(headerDom$, sinksDom$, footerDom$)
    .map(([headerDom, bodyDom, footerDom]) =>
      div('.devday.home', [
        div('.container', [
          div('.layout', [
            div('.content', [
              headerDom,
              bodyDom,
              footerDom
            ])
          ])
        ])
      ]));
  return {
    dom: vtree$,
    routes: pluck<Sinks, string>(sinks$, 'routes'),
    events: pluck<Sinks, string>(sinks$, 'events'),
    prevent: pluck<Sinks, Event>(sinks$, 'prevent'),
    registrations: pluck<Sinks, RegistrationRequest>(sinks$, 'registrations'),
    history: pluck<Sinks, string>(sinks$, 'history')
  };
}
