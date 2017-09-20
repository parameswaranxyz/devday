import { Sources, Sinks } from './definitions';
import { resolve } from './routes';
import { Stream } from 'xstream';
import { Layout } from './components/Layout';

export const main = (sources: Sources): Sinks => {
  const sinks$ = sources.history
      .map(route => resolve(route.pathname))
      .map(resolution => resolution.component({...sources, ...resolution.sources}));
  return Layout({...sources, sinks$});
};
