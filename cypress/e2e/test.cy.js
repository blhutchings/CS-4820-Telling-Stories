describe('test login forms/credientals', () =>{
  it('text is properly inputted into forms', () => {
    cy.visit("http://localhost:8080/login")
    cy.get('#form2Example11').type('testing@email.com')
    cy.get('#form2Example11').should('have.value', 'testing@email.com' )

    cy.get('#form2Example22').type('Testingpassword1!') 
    cy.get('#form2Example22').should('have.value','Testingpassword1!')

    cy.get('.text-center > .btn').click()

    
  });
})