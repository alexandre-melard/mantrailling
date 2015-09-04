/**
 * Created by alex on 25/05/2015.
 */
export default {
  write: function (data, fileName, format, mime) {
    if (Ember.isEmpty(mime)) {
      mime = 'application/mantralling';
    }
    var a = document.createElement("a");
    var blob = data;
    if (mime === "image/png") {
      data = atob( data.substring( "data:image/png;base64,".length ) );
      var asArray = new Uint8Array(data.length);

      for( var i = 0, len = data.length; i < len; ++i ) {
        asArray[i] = data.charCodeAt(i);
      }
      blob = asArray.buffer;
    }
    a.href = window.URL.createObjectURL(new Blob([blob], {type: mime}));
    a.download = fileName + '.' + format.toLowerCase();
    a.click();
  },

  read: function (type, resolve, fail) {
    $('#input-file-' + type).on("change", function (evt) {
      // Check for the various File API support.
      $('#input-file-' + type).off("change");
      if (window.File && window.FileReader) {
        // Great success! All the File APIs are supported.
        var f = evt.target.files[0];
        console.log('importing ' + f.name + " as " + f.type);

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function () {
          return function (e) {
            resolve(e.target.result);
          };
        })(f);
        // Read in the image file as a text file.
        reader.readAsText(f);
      } else {
        fail('The File APIs are not fully supported in this browser.');
      }
    });
    $('#input-file-' + type).click();
  }
};
