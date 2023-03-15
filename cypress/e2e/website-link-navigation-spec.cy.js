describe('Index render', () => {
  it('Renders page correctly', () => {
    cy.visit('http://localhost:8080')
  })
})

function backtrack(src){
  cy.visit('http://localhost:8080'+src)
}
/** The follow test will run tests to confirm all views load correctly when navigation links are clicked
Will also test navigation from different pages as a start pooint to ensure full navigation works as 
expected/desired*/

/**The below is begining of navigation from index/homepage before log in */

describe('Reload home page', () => {
  it('Reload page no cache', () => {
    backtrack('/')
    cy.reload()

    cy.reload(true)
  })
})

describe('views rendering correctly', () => {
it('link should refer to index page', () => {
  backtrack('/')
  cy.get(':nth-child(1) > .navbar__links')
    .should('have.attr', 'href').and('include', '/')
    .then((href) => {
      cy.visit('http://localhost:8080'+href)
    })
})

it('link should refer to Login page', () => {
  backtrack('/')
  cy.get('.button')
    .should('have.attr', 'href').and('include', '/login')
    .then((href) => {
      cy.visit('http://localhost:8080'+href)
    })
})

it('link should refer to H5P webpage', () => {
  backtrack('/')
  cy.get(':nth-child(2) > .navbar__links')
    .should('have.attr', 'href').and('include', 'https://h5p.org/')
    .then((href) => {
      cy.visit(href)
    })
})

it('link should refer to Demo page', () => {
  backtrack('/')
  cy.get(':nth-child(3) > .navbar__links')
    .should('have.attr', 'href').and('include', '/demo')
    .then((href) => {
      cy.visit('http://localhost:8080'+href)
    })
})
})

/**end */

/**The below is begining of navigation from Demo page before log in */

describe('Reload demo page', () => {
  it('Reload page no cache', () => {
    backtrack('/demo')
    cy.reload()

    cy.reload(true)
  })
})

describe('views rendering correctly', () => {
it('link should refer to home page', () => {
  backtrack('/demo')
  cy.get(':nth-child(1) > .navbar__links')
    .should('have.attr', 'href').and('include', '/')
    .then((href) => {
      cy.visit('http://localhost:8080'+href)
    })
})

it('link should refer to Login page', () => {
  backtrack('/demo')
  cy.get('.button')
    .should('have.attr', 'href').and('include', '/login')
    .then((href) => {
      cy.visit('http://localhost:8080'+href)
    })
})

it('link should refer to H5P webpage', () => {
  backtrack('/demo')
  cy.get(':nth-child(2) > .navbar__links')
    .should('have.attr', 'href').and('include', '/https://h5p.org/')
    .then((href) => {
      cy.visit(href)
    })
})

it('link should refer to Demo page', () => {
  backtrack('/demo')
  cy.get(':nth-child(3) > .navbar__links')
    .should('have.attr', 'href').and('include', '/demo')
    .then((href) => {
      cy.visit('http://localhost:8080'+href)
    })
})
})

/**end */

function login(username,password){
  cy.visit('http://localhost:8080/login')
  cy.visit("http://localhost:8080/login")
    cy.get('#form2Example11').type(username)
    cy.get('#form2Example11').should('have.value', username )

    cy.get('#form2Example22').type(password) 
    cy.get('#form2Example22').should('have.value',password)

    cy.get('.text-center > .btn').click()
  
}

/**The below is begining of navigation from User Home page once logged in using user 
 * navigation bar before log in */


/**end */