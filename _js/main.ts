import { Sources, Sinks } from './definitions';
import archive from './archive';
import xs from 'xstream';

function main(sources: Sources): Sinks {
  const archiveSinks = archive(sources);

  const vdom$ = xs.merge(archiveSinks.dom);
  const route$ = xs.merge(archiveSinks.routes);
  const event$ = xs.merge(archiveSinks.events);
  return {
    dom: vdom$,
    routes: route$,
    events: event$ 
  };
}

export default main;
