import { Sources, Sinks } from './definitions';
import { resolve } from './routes';
import { Stream } from 'xstream';
import { Layout } from './components/layout';

function main(sources: Sources): Sinks {
  const sinks$ =
    (sources.history as Stream<Location>)
      .map(route => resolve(route.hash))
      .map(resolution => resolution.component({...sources, ...resolution.sources}));
  return Layout({...sources, sinks$});
}

export default main;
