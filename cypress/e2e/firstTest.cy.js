/**
 *   add in before each/all, TODO, go through this project and seperate everything into 
 * their proper IT and beforeeach(), this is rough draft
 */
describe('my first test', () =>{
  it('visit root page /', () =>{
    cy.visit("http://localhost:8080/")
  })
  it('visit page, test login', () => {
    cy.visit("http://localhost:8080/")
    cy.get('.button').click()
    cy.url().should('include', "/account/login")

    cy.get('#email').type('testing@email.com')
    cy.get('#email').should('have.value', 'testing@email.com' )

    cy.get('#password').type('Testingpassword1!') //create entirely new it (or possibly describe) for testing edge cases, ex)if i put in a password thats too short will the system throw the proper error
    cy.get('#password').should('have.value','Testingpassword1!')

    cy.get('.login__btn').click()
  });
  
})
describe('proper HTTP reponses, not logged in', () => {
  it('GET /login', () => {
    cy.request('GET', '/account/login/') 

  })
  it('GET /account/homepage', () => {
    cy.request('GET', '/account/homepage/')

  })
  it('GET /registration', () => {
    cy.request('GET', '/registration/') 

  })
  it('GET /password/forgot', () => {
    cy.request('GET', '/password/forgot')

  })
  
  
  
  
})