# Hook Contract

- Hook event: `article.render`
- Expected input: rendered article HTML and metadata from a future sandbox boundary
- Expected output: transformed HTML or no-op result
- Failure handling: hook failures are audit logged and must not break article rendering.
