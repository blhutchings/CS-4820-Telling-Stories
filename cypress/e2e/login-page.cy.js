/**
 * this testing spec uses an account created soley for testing purposes
 * testing@testing.com -- iGm2UALK!Eg@G.
 */
describe('various tests', () =>{
  
    it('text is properly inputted into forms', () => {
      cy.visit("http://localhost:8080/account/login")
      cy.get('#form2Example11').type('testing@email.com')
      cy.get('#form2Example11').should('have.value', 'testing@email.com' )
  
      cy.get('#form2Example22').type('Testingpassword1!') 
      cy.get('#form2Example22').should('have.value','Testingpassword1!')
  
      cy.get('.text-center > .btn').click()
    })
    it('invalid email', () => {
      cy.visit("http://localhost:8080/account/login")
      cy.get('#form2Example11').type('thisemailshouldntexist@testing.com')
      cy.get('#form2Example22').type('doesntMatter') 
      
      cy.get('.text-center > .btn').click()
      cy.contains('.alert-danger','User is not registered')
    })
    it('invalid password', () => {
      cy.visit("http://localhost:8080/account/login")
      cy.get('#form2Example11').type('testing@testing.com')
      cy.get('#form2Example22').type('wrongPassword') 
      cy.get('.text-center > .btn').click()

      cy.contains('.alert-danger','User is not registered')
    })
  })
  