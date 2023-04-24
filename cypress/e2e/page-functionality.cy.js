/**
 * this testing spec uses an account created soley for testing purposes
 * testing@testing.com -- iGm2UALK!Eg@G.
 */
describe('login page', () =>{
  
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

      cy.contains('.alert-danger','Wrong credential(s)')
    })
    it('user registered with system logs in', () => {
      cy.visit("http://localhost:8080/account/login")
      cy.get('#form2Example11').type('testing@testing.com')
      cy.get('#form2Example22').type('iGm2UALK!Eg@G.') 
      cy.get('.text-center > .btn').click()
      cy.url().should('include', "/account/content")
    })
    it('forgot password button works', () => {
      cy.visit("http://localhost:8080/account/login")
      cy.get('.text-muted').click()
      cy.url().should('include', "/password/forgot")

    })
    it('registration button works', () => {
      cy.visit("http://localhost:8080/account/login")
      cy.get('.d-flex > .btn').click()
      cy.url().should('include', "/registration")

    })
  })

  describe('registration page', () => {
    it('user doesnt enter anything, should throw error', () => {
        cy.visit("http://localhost:8080/registration")
        cy.get('.text-center > .btn').click()
        cy.get('.alert').should('be.visible')
    })
    it('user doesnt provide password', () => {
        cy.visit("http://localhost:8080/registration")
        cy.get(':nth-child(2) > #form2Example11').type('firstName')
        cy.get(':nth-child(3) > #form2Example11').type('lastName')
        cy.get(':nth-child(4) > #form2Example11').type('email@email.test')
       // cy.get('#form2Example22').type('Password1!') 
        cy.get(':nth-child(6) > #form2Example11').type('Password1!')
        cy.get('.text-center > .btn').click()
        cy.get('.alert').should('be.visible')
    })
    it('user doesnt confirm password', () => {
        cy.visit("http://localhost:8080/registration")
        cy.get(':nth-child(2) > #form2Example11').type('firstName')
        cy.get(':nth-child(3) > #form2Example11').type('lastName')
        cy.get(':nth-child(4) > #form2Example11').type('email@email.test')
        cy.get('#form2Example22').type('Password1!') 
        //cy.get(':nth-child(6) > #form2Example11').type('Password1!')
        cy.get('.text-center > .btn').click()
        cy.get('.alert').should('be.visible')
    })
    it('login button works', () => {
        cy.visit("http://localhost:8080/registration")
        cy.get('.d-flex > .btn').click()
        cy.url().should('include', "/account/login")

    })
    
 })

 describe('forgot password page', () => { 
  it('user can properly navigate to /password/reset from /', () => {
      cy.visit('http://localhost:8080')
      cy.get('.button').click()
      cy.get('.text-muted').click()
      cy.url().should('include', "/password/forgot")


  });
  it('form is showing right information', () => {
      cy.visit('http://localhost:8080/password/forgot')
      cy.get('#email').type('e@e')
      cy.get('#email').should('have.value','e@e')
  });
  it('entering email that is registered with system, alert visible, correct info', () => {
      cy.visit('http://localhost:8080/password/forgot') //maybe put this is a before each
      cy.get('#email').type('testing@testing.com')
      cy.get('.btn').click()
      cy.get('.alert').should('be.visible')
      cy.contains('.alert','A password reset link')
  });
  it('email that is NOT registered, alert visible, correct info', () => {
      cy.visit('http://localhost:8080/password/forgot')
      cy.get('#email').type('nonRegisteredEmail@fake')
      cy.get('.btn').click()
      cy.get('.alert').should('be.visible')
      cy.contains('.alert','Email is not registered')
  });
  it('login button works', () => {
      cy.visit('http://localhost:8080/password/forgot')
      cy.get('.button').click()
      cy.url().should('include', "/account/login")
  });
  

})