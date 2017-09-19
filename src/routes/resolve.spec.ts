import { resolve } from './resolve';
import { expect } from 'chai';
import 'mocha';

describe('routes.resolve', () => {
  it('should resolve / to Home', () => {
    const resolution = resolve('/');
    expect(resolution).to.not.be.null;
    expect(resolution.component).to.not.be.null;
    expect(resolution.component.name).to.equal('Home');
  });

  it('should resolve /events/ to EventDetail', () => {
    const resolution = resolve('/events/some-event-url-here');
    expect(resolution).to.not.be.null;
    expect(resolution.component).to.not.be.null;
    expect(resolution.component.name).to.equal('EventDetail');
  });
});
