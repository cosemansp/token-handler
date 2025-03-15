# Review comments

- [ ] Should extend context, no more magic strings

```js
// org code


// improved
const extendContextMiddleware = createMiddleware<{
  Variables: {
    customProperty: string
  }
}>(async (c, next) => {
  c.set('customProperty', 'some value')
  await next()
});

app.use(extendContextMiddleware);

app.get('/example', (c) => {
  // simplified and typeSafe access to the context
  const customValue = c.var.customProperty
  return c.text(`Custom value: ${customValue}`)
})
```

- [ ] Could replace error logic to error handler, this would simplify error handling

```js
// org
if (!code || !state) {
  console.error('Invalid callback parameters');
  return ctx.redirect(`/auth/login?error=invalid_callback_parameters&error_description=Invalid callback parameters`);
}

// improved
if (!code || !state) {
  throw new AuthFlowError({ code: 'invalid_callback_parameters', desc: 'Invalid callback parameters'})
}

export const authErrorHandler = (err: Error, ctx: Context) => {
  if (err instanceof AuthFlowError) {
    console.error(err.code);
    const url = ctx.req.url;
    return ctx.redirect(`${c.req.url}?error=${err.code}&error_description=${err.desc}`);
  }
};

app.onError(authErrorHandler);
```



