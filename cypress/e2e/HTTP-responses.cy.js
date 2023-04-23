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
    it('GET /password/forgot', () => {
        cy.request('GET', '/password/forgot').then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    it('GET /', () => {
        cy.request('GET', '/').then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    it('GET /account/content', () => {
        cy.request('GET', '/account/content').then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    it('GET /users', () => {
        cy.request('GET', '/users').then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    it('GET /h5p/new', () => {
        cy.request('GET', '/h5p/new').then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    it('GET /h5p/new', () => {
        cy.request('GET', '/h5p/new').then((res) => {
          expect(res.status).to.eq(200)
        })
      })
    
  })