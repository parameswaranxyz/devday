import { expect } from 'chai';

describe('registration_form', () =>  {

  beforeEach(() => {
    cy.visit('/');
  });
  
  it('should not submit empty form', () => {
    cy.get('.talk-registration')
      .trigger('mouseover')
      .trigger('click')
      .trigger('touchstart');

    cy.get('.talk-submit')
      .click();

    cy.get('#talk-title + label + span')
      .should('be.visible');
    
  });

});
