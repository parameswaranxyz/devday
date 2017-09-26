describe('home', () => {

  beforeEach(() => {
    cy.visit('/');
  });
  
  it('should have title DEVDAY', () => {
    cy.title().should('eq', 'DEVDAY');
  })

});
