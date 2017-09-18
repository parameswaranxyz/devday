import { Stream } from 'xstream';
import 'material-design-lite';

export class MaterialSource {
  constructor(refresh$: Stream<boolean>) {
    const noop = () => {};
    refresh$.addListener({
      next: () => (<any>window).componentHandler.upgradeDom(),
      error: noop,
      complete: noop
    });
  }
}

export function makeMaterialDriver(): (request$: Stream<boolean>) => MaterialSource {
  function materialDriver(request$: Stream<boolean>) {
    return new MaterialSource(request$);
  }
  return materialDriver;
}

export default makeMaterialDriver;
