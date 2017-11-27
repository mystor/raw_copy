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

## Why use this library?

`raw_copy`, unlike other clipboard libraries such as `clipboard.js`, uses the
`copy` event handler in order to inject the clipboard data directly onto the
clipboard, rather than creating a dummy textarea node offscreen and filling it
with the data which we want to copy to the clipboard.

The text area approach, while simpler than the copy event handler approach, has
the disadvantage that copying large amounts of data to the clipboard can be very
slow. Copying an 8 MB block of text to the clipboard with a textarea can hang
for seconds doing layout while the text is being selected. In contrast the
`copy` event handler adds the text to the clipboard through much faster function
calls.

On my definitely-not-scientific tests (see `speed.html`) where I copy 8MB of
"a"s to the clipboard with both `clipboard.js` and `raw_copy`, my laptop
completed `raw_copy`'s copy in 214ms, while taking 5240ms to copy with
clipboard.js on Firefox.

## Browser Support

I tried my best to support multiple browsers, but I didn't exhaustively test all
platforms. This function _should_ work in all browsers which support the
`document.execCommand("copy")` method in user-initiated event callbacks. If it
doesn't work on a specific platform which supports that API, please file a bug.
