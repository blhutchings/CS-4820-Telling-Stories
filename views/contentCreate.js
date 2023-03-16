
fs = require('fs');
const navBar = fs.readFileSync(__dirname + '/partial/_navHeaderUserHub.ejs',  'utf-8')
/**please note the below is work under progress, DO NOT DELETE THE _NAVHEADERADMIN PARTIAL, you can remove its usage*/
const secondaryNavbar = fs.readFileSync(__dirname + '/partial/_navHeaderAdmin.ejs', 'utf-8')
module.exports = async (model) => { return `
<!DOCTYPE html>

<!--Main Homepage View-->
<!--Author-->
<!--Last Update: Sat Mar 4th-->

<!--The followning will go through changes to match H5P hub website look-->

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
    />

    <link rel="stylesheet" href="/public/css/main.css" />
    <script> 
        window.H5PIntegration = parent.H5PIntegration || ${JSON.stringify(model.integration, null, 2)}
    </script>
    
    ${model.styles.map((styles) => `<link rel="stylesheet" href="${styles}">`).join('\n    ')}
    ${model.scripts.map((script) => `<script src="${script}"></script>`).join('\n    ')}
    
    <title>Home</title>
  </head>
  <body>
  <div class="body_container" style="width:100vw; margin:auto; background-color:#eaf7ff">
    <!--Navigation EJS Partial call do not remove-->
    ${navBar}
   
    <div class="hero_container" style="width:100vw; margin:auto; background-color:#eaf7ff; text-align: center">
    <!--Hero Section-->
    <!--This Hero Section contains the Iframe for the H5P content creation.-->
    <!--Iframe for H5P creator-->
    <div class="iframe_container" style="width:960px; display:inline-block; margin: 0 auto">
    <section class="h-100" style="padding-top: 6rem; padding-bottom: 5rem; height:10px">
        <form method="post" enctype="multipart/form-data" id="h5p-content-form">
          <div id="post-body-content">
            <div class="h5p-create">
                <div class="h5p-editor"></div>
            </div>
          </div>
          <div clas="button-parent" style="display: flex">
          <input id="save-h5p" type="submit" name="submit" value="Save" class="button button-primary" style="width: 100px;">
          <input id="cancel-h5p" type="submit" name="submit" value="Cancel" class="btn btn-outline-secondary" style="width: 100px; margin-left:1rem; border-radius: 50px">
        </div>
          </form>
    </section>
    </div>
    </div>
    <!--End of Hero Section-->

    <!--Service Section-->
    <div class="services">
      <h1>See what the hype is about</h1>
      <div class="services__container">
        <div class="services__card">
          <h2>Experience a better way</h2>
          <div class="services__img__container">
            <img src="/public/img/H5P-Logo.png" alt="" />
          </div>
          <p>Improved for convenice</p>
          <button><a href="https://h5p.org/">Learn more</a></button>
        </div>
        <div class="services__card">
          <h2>Are you ready?</h2>
          <div class="services__img__container">
            <img
              src="/public/img/H5P-Content.png"
              style="width: 350px; height: 145px"
              alt=""
            />
          </div>
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

    <script>
      var ns = H5PEditor;
      (function($) {
          H5PEditor.init = function() {
              H5PEditor.$ = H5P.jQuery;
              H5PEditor.basePath = H5PIntegration.editor.libraryUrl;
              H5PEditor.fileIcon = H5PIntegration.editor.fileIcon;
              H5PEditor.ajaxPath = H5PIntegration.editor.ajaxPath;
              H5PEditor.filesPath = H5PIntegration.editor.filesPath;
              H5PEditor.apiVersion = H5PIntegration.editor.apiVersion;
              H5PEditor.contentLanguage = H5PIntegration.editor.language;
              // Semantics describing what copyright information can be stored for media.
              H5PEditor.copyrightSemantics = H5PIntegration.editor.copyrightSemantics;
              H5PEditor.metadataSemantics = H5PIntegration.editor.metadataSemantics;
              // Required styles and scripts for the editor
              H5PEditor.assets = H5PIntegration.editor.assets;
              // Required for assets
              H5PEditor.baseUrl = '';
              if (H5PIntegration.editor.nodeVersionId !== undefined) {
                  H5PEditor.contentId = H5PIntegration.editor.nodeVersionId;
              }
              var h5peditor;
              var $type = $('input[name="action"]');
              var $upload = $('.h5p-upload');
              var $create = $('.h5p-create').hide();
              var $editor = $('.h5p-editor');
              var $library = $('input[name="library"]');
              var $params = $('input[name="parameters"]');
              var library = $library.val();
              // $type.change(function () {
              //   if ($type.filter(':checked').val() === 'upload') {
              //     $create.hide();
              //     $upload.show();
              //   }
              //   else {
              $upload.hide();
              if (h5peditor === undefined) {
                  if(H5PEditor.contentId){
                      $.ajax({
                          error: function(res) {
                              h5peditor = new ns.Editor(undefined, undefined, $editor[0]);
                              $create.show();
                          },
                          success: function(res) {
                              h5peditor = new ns.Editor(
                                  res.library,
                                  JSON.stringify(res.params),
                                  $editor[0]
                              );
                              $create.show();
                              // $type.change();
                          },
                          type: 'GET',
                          url: '${model.urlGenerator.parameters()}/' + H5PEditor.contentId + window.location.search
                      });
                  } else {
                      h5peditor = new ns.Editor(undefined, undefined, $editor[0]);
                      $create.show();
                  }
              }
              $create.show();
              //   }
              // });
              if ($type.filter(':checked').val() === 'upload') {
                  $type.change();
              } else {
                  $type
                      .filter('input[value="create"]')
                      .attr('checked', true)
                      .change();
              }
              $('#h5p-content-form').submit(function(event) {
                  if (h5peditor !== undefined) {
                      var params = h5peditor.getParams();
                      if (params.params !== undefined) {
                          // Validate mandatory main title. Prevent submitting if that's not set.
                          // Deliberately doing it after getParams(), so that any other validation
                          // problems are also revealed
                          // if (!h5peditor.isMainTitleSet()) {
                          // }
                          // Set main library
                          $library.val(h5peditor.getLibrary());
                          // Set params
                          $params.val(JSON.stringify(params));
                          $.ajax({
                              data: JSON.stringify({
                                  library: h5peditor.getLibrary(),
                                  params
                              }),
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              type: 'POST'
                          }).then((result) => {
                              const parsedResult = JSON.parse(result)
                              if(parsedResult.contentId) {
                                  window.location.href = '${model.urlGenerator.play()}/' + parsedResult.contentId;
                              }
                          });
                          return event.preventDefault();
                          // TODO - Calculate & set max score
                          // $maxscore.val(h5peditor.getMaxScore(params.params));
                      }
                  }
              });
              // Title label
              var $title = $('#h5p-content-form #title');
              var $label = $title.prev();
              $title
                  .focus(function() {
                      $label.addClass('screen-reader-text');
                  })
                  .blur(function() {
                      if ($title.val() === '') {
                          $label.removeClass('screen-reader-text');
                      }
                  })
                  .focus();
              // Delete confirm
              $('.submitdelete').click(function() {
                  return confirm(H5PIntegration.editor.deleteMessage);
              });
          };
          H5PEditor.getAjaxUrl = function(action, parameters) {
              var url = H5PIntegration.editor.ajaxPath + action;
              if (parameters !== undefined) {
                  for (var property in parameters) {
                      if (parameters.hasOwnProperty(property)) {
                          url += '&' + property + '=' + parameters[property];
                      }
                  }
              }
              url += window.location.search.replace(/\\?/g, '&');
              return url;
          };
          H5PEditor.enableContentHub = H5PIntegration.editor.enableContentHub
              || false;
          
          $(document).ready(H5PEditor.init);
      })(H5P.jQuery);
      </script>
  </body>
</html>
`}