import { Sources, Sinks } from './definitions';
import { routes } from './routes';
import { Location } from 'history';
import xs from 'xstream';
import switchPath from 'switch-path';
import { pluck } from './utils';
import { VNode } from '@cycle/dom';
import { RegistrationRequest } from './drivers/registrations';
import { Layout } from './components/layout';

function main(sources: Sources): Sinks {
  const history$: xs<Location> = sources.history;
  const component$ = history$.map(route => routes[route.pathname] as (sources: Sources) => Sinks);
  return Layout({...sources, component$});
}

export default main;
