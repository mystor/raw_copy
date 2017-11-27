# raw_copy

This module exports a single function: raw_copy. This function can be called in two ways:

```js
// Copy a simple string to the clipboard with the text/plain MIME type.
raw_copy("your string here");

// Copy a set of MIME type / value pairs to the clipboard.
// NOTE: Currently this API only supports copying text MIMEs. In the 
// future it may be extended to support copying File objects.
raw_copy([
  ["text/plain", "Hello"],
  ["text/html", "<span>Hello</span>"],
]);
```

This function will only work in user-initiated event callbacks, and will raise
an exception if the copy failed.

## Browser Support

I tried my best to support multiple browsers, but I didn't exhaustively test all
platforms. This function _should_ work in all browsers which support the
`document.execCommand("copy")` method in user-initiated event callbacks. If it
doesn't work on a specific platform which supports that API, please file a bug.
