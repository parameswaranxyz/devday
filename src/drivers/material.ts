import { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import 'material-design-lite';
import '../styles/material-icons.scss';

export class MaterialSource {
  constructor(refresh$: Stream<boolean>) {
    refresh$
      .compose(delay(30))
      .addListener({
        next: () => {
          const handler = (<any>window).componentHandler;
          if (handler == undefined) return;
          handler.upgradeAllRegistered();
        }
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
