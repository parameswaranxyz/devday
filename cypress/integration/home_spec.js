describe('home', () => {
  it('should have title DEVDAY', () => {
    cy.visit('/');
    cy.title().should('eq', 'DEVDAY');
  })
});
