import { Sources, Sinks } from '../definitions';

interface Component {
  (sources: Sources): Sinks;
}

export interface RouteResolution {
  path?: string;
  getComponent: () => Promise<Component>;
  sources?: any;
}

export interface RouteDefinitions extends Object {
    [path: string]: RouteDefinitions | any;
}

