import { Sources, Sinks } from './definitions';
import { routes } from './routes';
import { Location } from 'history';
import xs from 'xstream';
import switchPath from 'switch-path';
import { pluck } from './utils';
import { VNode } from '@cycle/dom';
import { RegistrationRequest } from './drivers/registrations';

function main(sources: Sources): Sinks {
  const history$: xs<Location> = sources.history;
  const component$ = history$.map(route => routes[route.pathname] as (sources: Sources) => Sinks);
  const sinks$ = component$.map(component => component(sources));
  return {
    dom: pluck<Sinks, VNode>(sinks$, 'dom'),
    routes: pluck<Sinks, string>(sinks$, 'routes'),
    events: pluck<Sinks, string>(sinks$, 'events'),
    prevent: pluck<Sinks, Event>(sinks$, 'prevent'),
    registrations: pluck<Sinks, RegistrationRequest>(sinks$, 'registrations'),
    history: pluck<Sinks, string>(sinks$, 'history')
  };
}

export default main;
