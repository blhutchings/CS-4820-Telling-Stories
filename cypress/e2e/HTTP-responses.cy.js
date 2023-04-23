describe('proper HTTP reponses/redirects, NOT logged in', () => {
    it('GET /login', () => {
      cy.request('GET', '/account/login/').then((res) => {
        expect(res.status).to.eq(200)
      })
    })
    it('GET /registration', () => {
      cy.request('GET', '/registration').then((res) => {
        expect(res.status).to.eq(200)
      }) 
  
    })
    it('GET /password/forgot', () => {
      cy.request('GET', '/password/forgot').then((res) => {
        expect(res.status).to.eq(200)
      })
    })
    it('try to access login', () => { 
      cy.visit('http://localhost:8080/account/login')
      cy.url().should('include', '/account/login')
      })
    it('try to access registration', () => { 
      cy.visit('http://localhost:8080/registration')
      cy.url().should('include', '/registration')
      })
    
    
    
  })