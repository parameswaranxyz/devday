import { Sources, Sinks } from './definitions';
import home from './home';
import archive from './archive';
import event from './event';
import xs from 'xstream';

function main(sources: Sources): Sinks {
  const homeSinks = home(sources);
  const archiveSinks = archive(sources);
  const eventSinks = event(sources);
  const vdom$ = xs.merge(homeSinks.dom, archiveSinks.dom, eventSinks.dom);
  const route$ = xs.merge(homeSinks.routes, archiveSinks.routes, eventSinks.routes);
  const event$ = xs.merge(homeSinks.events, archiveSinks.events, eventSinks.events);
  return {
    dom: vdom$,
    routes: route$,
    events: event$ 
  };
}

export default main;
