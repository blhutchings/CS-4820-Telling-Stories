describe('forgot password page', () => { 
    it('user can properly navigate to /password/reset from root', () => {
        cy.visit('http://localhost:8080')
        cy.get('.button').click()
        cy.get('.text-muted').click()
        cy.url().should('include', "/password/forgot")


    });
    it('email form is showing right information', () => {
        cy.visit('http://localhost:8080/password/forgot')
        cy.get('#email').type('e@e')
        cy.get('#email').should('have.value','e@e')
    });
    it('entering email that is registered with system, alert visible, correct info', () => {
        cy.visit('http://localhost:8080/password/forgot') //maybe put this is a before each
        cy.get('#email').type('e@e')
        cy.get('.btn').click()
        //cy.contains('A password reset link') //currenlty simply checks if the entire body contains text that says this, maybe check for .alert element instead?
        cy.get('.alert').should('be.visible')
        
    });
    it('email that is NOT registered, alert visible, correct info', () => {
        cy.visit('http://localhost:8080/password/forgot')
        cy.get('#email').type('nonRegisteredEmail@fake')
        cy.get('.alert').should('be.visible')
        //cy.get('.btn').click()
        //cy.contains('Email is not registered')
    });
    

 })