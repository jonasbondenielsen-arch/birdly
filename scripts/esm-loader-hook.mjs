// Selve oploesningen. Se scripts/esm-loader.mjs for hvorfor den findes.
export async function resolve(spec, ctx, next) {
  try {
    return await next(spec, ctx);
  } catch (e) {
    // ⚠️ KUN RELATIVE STIER UDEN UDVIDELSE. En pakke der ikke findes, skal
    // stadig fejle som den plejer — ellers skjuler hooken en aegte fejl.
    if (spec.startsWith(".") && !/\.[a-z]+$/i.test(spec)) {
      return await next(spec + ".js", ctx);
    }
    throw e;
  }
}
