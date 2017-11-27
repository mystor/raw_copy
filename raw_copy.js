// XXX (TODO): Missing features: Copying files to the clipboard.

(function() {
  var glbl = this;

  /// Copy some data to the clipboard. This function can be called in two ways:
  ///
  /// // Copy a simple string to the clipboard.
  /// raw_copy("string data");
  ///
  /// // Copy a set of mime-types and values to the clipboard.
  /// raw_copy([["mime/type", "value"], ...]);
  ///
  /// This function will raise an exception if it failed to copy to the
  /// clipboard.
  ///
  /// This function will only work when called within a
  /// user-initiated-event-callback.
  function raw_copy(data) {
    if (typeof data == "string") {
      data = [["text/plain", data]];
    }

    // Validate that we don't have any duplicate MIME types.
    var seen = {};
    for (var i = 0; i < data.length; ++i) {
      if (seen[data[i][0]]) {
        throw new Error("Data array contains duplicated MIME type");
      }
      seen[data[i][0]] = true;
    }

    // An error which may have been generated during one of our callbacks which
    // we need to throw.
    var error = null;

    var invoked = false;
    function callback(event) {
      try {
        invoked = true;

        // Attempt to set the data on the clipboardData object.
        for (var i = 0; i < data.length; ++i) {
          var mime = data[i][0];
          var value = data[i][1];
          if (event.clipboardData) {
            event.clipboardData.setData(mime, value);
          } else {
            // In Internet Explorer, we need to use the non-standard clipboardData
            // global object instead of event.clipboardData, and can only support
            // some MIME types.
            if (mime == "text/plain") {
              glbl.clipboardData.setData("Text", value);
            } else {
              error = new Error("MIME type " + mime + " is not supported on Internet Explorer");
              return;
            }
          }
        }

        event.preventDefault();
      } catch (e) {
        error = e;
      }
    }

    document.body.addEventListener("copy", callback);

    var dummy;
    try {
      // Unfortunately, Internet Explorer and Safari require a valid input
      // selection to be able to copy text to the clipboard, so we need to set
      // up a dummy textarea offscreen with garbage data, and select it.
      //
      // NOTE: We should be able to skip this step on modern Chrome and Firefox
      // browsers, but for consistency across platforms I don't use UA detection
      // to do this.

      dummy = document.createElement("textarea");

      // Style the element to make adding it to the document as non-disruptive
      // as possible. This code is inspired by clipboard.js.
      dummy.style.border = "0";
      dummy.style.padding = "0";
      dummy.style.margin = "0";
      // Move the element out of screen horizontally.
      dummy.style.position = "absolute";
      dummy.style.left = '-9999px';

      var scrolltop = window.pageYOffset || document.documentElement.scrollTop;
      dummy.style.top = scrolltop + "px";
      dummy.setAttribute("readonly", "");

      // Fill the dummy element with a short, non-empty value to create a valid
      // copy selection.
      dummy.value = "a";
      document.body.appendChild(dummy);

      // Select that element.
      dummy.select();
      dummy.setSelectionRange(0, dummy.value.length);

      // We're now ready to perform the copy!
      var succeeded;
      try {
        succeeded = document.execCommand("copy");
      } catch (e) {
        succeeded = false;
      }

      // Check if it failed, and raise an exception in that case
      if (!succeeded) {
        throw new Error("ExecCommand copy failed");
      }

      if (!invoked) {
        throw new Error("This browser does not support the copy clipboard event");

        // XXX(todo): Fallback and try filling in dummy.value/re-execing here?
      }

      // If we got an error while the callback was running, re-throw it.
      if (error) {
        throw error;
      }
    } finally {
      document.body.removeEventListener("copy", callback);
      document.body.removeChild(dummy);
    }
  }

  // Export raw_copy if we can, otherwise we'll set it on the global.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = raw_copy;
  } else {
    glbl.raw_copy = raw_copy;
  }
})();
