/* global FB */
export default {
  name: 'facebook',

  initialize: function() {
    var fbAsyncInit = function() {
      FB.init({
        appId      : '1646279588918669',
        xfbml      : true,
        version    : 'v2.3',
        fileUpload : true
      });
    };

    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    window.fbAsyncInit = fbAsyncInit;
  }
};
