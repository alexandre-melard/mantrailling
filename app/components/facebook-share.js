import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ["btn", "btn-default", "btn-facebook", "facebook"],

  initFacebook: function () {
    var fbAsyncInit = function () {
      FB.init({
        appId: '1646279588918669',
        xfbml: true,
        version: 'v2.3',
        fileUpload: true
      });
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    window.fbAsyncInit = fbAsyncInit;
  }.on('didInsertElement'),

  click: function () {
    var me = this;
    this.command.send("map.screenshot.data.get", null, function(data) {
      var blob;
      try {
        var byteString = atob(data.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        blob = new Blob([ab], {type: 'image/png'});
      } catch (e) {
        console.log(e);
      }
      var fd = new FormData();
      fd.append("source", blob);
      var text = "Nom: " + $("#map-info-trail-name").text().trim();
      text += "\nNiveau: " + $("#map-info-trail-level").text().trim();
      text += "\nLongueur: " + $("#map-info-trail-length").text().trim();
      text += "\nNombre d'objets: " + $("#map-info-trail-items").text().trim();
      text += "\nGPS: " + $("#map-info-trail-location").text().trim();
      fd.append("message", text);
      var login = new Promise(function (resolve, fail) {
        FB.getLoginStatus(function (response) {
          if (response.status === 'connected') {
            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token
            // and signed request each expire
            resolve({userID: response.authResponse.userID, accessToken: response.authResponse.accessToken});
          } else {
            FB.login(function (response) {
              resolve({userID: response.authResponse.userID, accessToken: response.authResponse.accessToken});
            }, {scope: 'publish_actions'});
          }
        });
      }).then(function (auth) {
          $.ajax({
            url: "https://graph.facebook.com/" + auth.userID + "/photos?access_token=" + auth.accessToken,
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data) {
              console.log("success " + data);
              console.log("https://www.facebook.com/photo.php?fbid=" + data.id);
            },
            error: function (shr, status, data) {
              me.command.send("map.screenshot.error", {shr: shr, status: status, data: data});
              console.log("error " + data + " Status " + shr.status);
            }
          });
          me.command.send("map.screenshot.complete");
        }, function (reason) {
          console.log(reason);
        });
    });
  }
});

