import { DOMSource } from '@cycle/dom/xstream-typings';
import { RoutesSource } from './router';
import { Stream } from 'xstream';
import { VNode } from '@cycle/dom';

export interface Sources {
    dom: DOMSource;
    routes: RoutesSource;
}

export interface Sinks {
    dom: Stream<VNode>;
    routes: Stream<string>;
}