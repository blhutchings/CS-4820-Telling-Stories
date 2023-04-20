fs = require('fs');
const navBar = fs.readFileSync(__dirname + '/partial/_navHeaderUserHub.ejs', 'utf-8')
module.exports = async (model) => { return `  
<!DOCTYPE html>

<!--Main Homepage View-->
<!--Author-->
<!--Last Update: Sat Mar 4th-->

<!--The followning will go through changes to match H5P hub website look-->

<html lang="en">
  <head>
    <title>View</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/x-icon" href="/public/img/favicon.ico">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="/public/css/main.css">

    <script> 
        window.H5PIntegration = ${JSON.stringify(model.integration, null, 2)}
    </script>
    ${model.styles.map((style) => `<link rel="stylesheet" href="${style}">`).join('\n    ')}
    ${model.scripts.map((script) => `<script src="${script}"></script>`).join('\n    ')}

  </head>
  <body>
  <div class="body_container" style="width:100vw; margin:auto; background-color:#eaf7ff">
    <!--Navigation EJS Partial call do not remove-->
    ${navBar}

    <!--Hero Section-->
    <!--This Hero Section contains the Iframe for the H5P content creation.-->
    <div class="hero_container" style="width:100vh; margin:auto; background-color:#eaf7ff; text-align: center">
   
    <div class="h5p-iframe" style="padding-top: 6rem">
        <div class="h5p-content" data-content-id="${model.contentId}"></div>
        <a href="${model.downloadPath}">Download</button>
    </div>
    </div>

    <!--End of Hero Section-->
    <!--Service Section-->
    <div class="services">
      <h1>See what the hype is about</h1>
      <div class="services__container">
        <div class="services__card">
          <h2>Experience a better way</h2>
          <img src="/public/img/H5P-Logo.png" alt="" />
          <p>Improved for convenice</p>
          <button><a href="https://h5p.org/">Learn more</a></button>
        </div>
        <div class="services__card">
          <h2>Are you ready?</h2>
          <img
            src="/public/img/H5P-Content.png"
            style="width: 350px; height: 145px"
            alt=""
          />
          <p>Jump right in!</p>
          <button><a href="">Get Creating</a></button>
        </div>
      </div>
    </div>
    </div>

    <!--Navigation menu script do not remove-->
    <script src="../public/menu-toggle-transition.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.min.js"
      integrity="sha384-Atwg2Pkwv9vp0ygtn1JAojH0nYbwNJLPhwyoVbhoPwBhjQPR5VtM2+xf0Uwh9KtT"
      crossorigin="anonymous"
    ></script>
  </body>
</html>
`}