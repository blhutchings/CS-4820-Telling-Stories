
/**
 *   add in before each/all, TODO, go through this project and seperate everything into 
 * their proper IT and beforeeach(), this is rough draft
 */
describe('test login forms/credientals', () =>{
  
  it('text is properly inputted into forms', () => {
    cy.visit("http://localhost:8080/account/login")
    cy.get('#form2Example11').type('testing@email.com')
    cy.get('#form2Example11').should('have.value', 'testing@email.com' )

    cy.get('#form2Example22').type('Testingpassword1!') 
    cy.get('#form2Example22').should('have.value','Testingpassword1!')

    cy.get('.text-center > .btn').click()
  });
  it('invalid email', () => {
    cy.visit("http://localhost:8080/account/login")
    cy.get('#form2Example11').type('thisemailshouldntexist@testing.com')
    cy.get('#form2Example22').type('doesntMatter') 
    
    cy.get('.text-center > .btn').click()
  });
  it('invalid password', () => {
    cy.visit("http://localhost:8080/account/login")
    cy.get('#form2Example11').type('t@t')
    cy.get('#form2Example22').type('wrongPassword') 
    
    cy.get('.text-center > .btn').click()
  });
})




//this and the next testings suite use credientals from two testing accounts located in the important 'User' db table
//t@t = admin, e@e = not admin, see docs for more information
describe('proper HTTP reponses/redirects, logged in', ()=>{ 
  beforeEach(()=>{
    cy.visit("http://localhost:8080/account/login")
    cy.get('#form2Example11').type('t@t')
    cy.get('#form2Example22').type('YP@5A.AW#X7tx2')

    cy.get('.text-center > .btn').click()
    
  })
  it('properly logged in', () => {
    cy.url().should('include', "/account/homepage")
  });
  it('try to access registration', () => { //todo, refactor this
    cy.visit('http://localhost:8080/registration')
    cy.url().should('include', '/account/homepage')
  });                                              


})
describe('proper HTTP reponses/redirects, NOT logged in', () => {
  it('GET /login', () => {
    cy.request('GET', '/account/login/').then((res) => {
      expect(res.status).to.eq(200)
    })
  })
  it('GET /account/homepage', () => { //TODO: this should fail, not sure whys it isnt, can verify via command line by running:  curl http://localhost:8080/account/homepage
    cy.request('GET', '/account/homepage/').then((res) => {
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

  it('try to access homepage', () => { //TODO: if you try to render/visit the page not logged in you should be redirected which is a 302 status code
    cy.visit('http://localhost:8080/account/homepage')
    cy.url().should('include', '/login')
    })
  it('try to access login', () => { 
    cy.visit('http://localhost:8080/account/login')
    cy.url().should('include', '/account/login')
    })
  it('try to access registration', () => { 
    cy.visit('http://localhost:8080/registration')
    cy.url().should('include', '/registration')
    })
  it('try to access users page', () => { //auth.checkAuthenticated is redirected any non logged in user to /login
    cy.visit('http://localhost:8080/users')
    cy.url().should('include', '/account/login')
    })
  
  
  
})

describe('button functionality', () => {
  it('index login', () => {
    cy.visit("http://localhost:8080/")
    cy.get('.button').click()
    cy.url().should('include', "/account/login")
  });

})






describe('test database functions', () => {
  it('add user', () => {
    cy.visit("http://localhost:8080/")
  });

})

describe('visual stuff', () => {
    it('test root /', () => {
      cy.get('body')
      cy.m
    }); 
  })

/**
 * ideas for further tests: test cookies/session, edge cases (registration page, test passwords that dont match, password that is too short)(log in page, incorrect password)
 */