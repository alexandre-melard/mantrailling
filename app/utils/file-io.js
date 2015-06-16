/**
 * Created by alex on 25/05/2015.
 */
export default {
  write: function (data, fileName, format) {
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([data], {type: 'application/mantralling'}));
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
