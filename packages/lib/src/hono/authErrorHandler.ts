import { Context } from 'hono';
import { HonoOptions } from '../types';

export const authErrorHandler = (err: Error, ctx: Context<HonoOptions>) => {
  console.log('>>>>', err);
  // if (err instanceof OAuth2RequestError) {
  //   const referer = ctx.req.header('referer');
  //   if (referer) {
  //     return ctx.redirect(`${referer}?error=${err.code}&error_description=${err.description}&state=${err.state}`);
  //   }
  // }

  if (err instanceof ReferenceError) {
    const referer = ctx.req.header('referer');
    if (referer) {
      return ctx.redirect(`${referer}?error=reference_error&error_description=${err.message}`);
    }
    const url = new URL(ctx.req.url);
    return ctx.redirect(`${url.origin}?error=reference_error&error_description=${err.message}`);
  }

  return ctx.json({ code: 'InternalServerError', message: err.message, cause: err }, 500);
};
