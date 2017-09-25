import { resolve } from './resolve';
import { expect } from 'chai';
import 'mocha';

describe('routes.resolve', function() {
  this.timeout(5000);
  it('should resolve / to Home', () => {
    const resolution = resolve('/');
    expect(resolution).to.not.be.null;
    return resolution.getComponent().then(component => {
      expect(component).to.not.be.null;
      expect(component.name).to.equal('Home');
    });
  });

  it('should resolve /events/ to EventDetail', () => {
    const resolution = resolve('/events/some-event-url-here');
    expect(resolution).to.not.be.null;
    return resolution.getComponent().then(component => {
      expect(component).to.not.be.null;
      expect(component.name).to.equal('EventDetail');
    });
  });

  it('should resolve /archive to Archive', () => {
    const resolution = resolve('/archive');
    expect(resolution).to.not.be.null;
    return resolution.getComponent().then(component => {
      expect(component).to.not.be.null;
      expect(component.name).to.equal('Archive');
    });
  });
});
