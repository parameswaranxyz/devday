import { RouteResolution, RouteDefinitions } from './definitions';
import { Sources, Sinks } from '../definitions';
import { routes } from './routes';
import switchPath from 'switch-path';

function resolveImplementation(routes: RouteDefinitions, route: string): RouteResolution {
  const { path, value } = switchPath((route || '#/').replace('#',''), routes);
  const resolution = value as RouteResolution;
  return {
    path: path,
    component: resolution.component,
    sources: resolution.sources
  };
}

export const resolve = (route: string): RouteResolution => {
  return resolveImplementation(routes, route);
};
