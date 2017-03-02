import { Sources, Sinks } from './definitions';
import { resolve } from './routes';
import { Stream } from 'xstream';
import { Layout } from './components/layout';

function main(sources: Sources): Sinks {
  const history$: Stream<Location> = sources.history.debug();
  const sinks$ =
    history$
      .map(route => resolve(route.hash))
      .map(resolution => resolution.component({...sources, ...resolution.sources}));
  return Layout({...sources, sinks$});
}

export default main;
