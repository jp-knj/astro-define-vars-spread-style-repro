# define:vars CSS variables are lost when style is forwarded through a spread

This is still reproducible on the Rust compiler after [withastro/compiler #1050](https://github.com/withastro/compiler/issues/1050) was closed because Go compiler development ended. The closing comment requested a Rust report if the issue remained reproducible.

## Reproduction

[Runnable reproduction](https://github.com/jp-knj/astro-define-vars-spread-style-repro)

```sh
git clone https://github.com/jp-knj/astro-define-vars-spread-style-repro.git
cd astro-define-vars-spread-style-repro
npm ci
npm run repro
```

The component forwards normal HTML props and uses a CSS variable:

```astro
---
const { id, ...props } = Astro.props;
const colour = 'yellow';
---
<div id={id} class="box" {...props}><slot /></div>
<style define:vars={{ colour }}>
  .box { border: 4px solid var(--colour); }
</style>
```

The page passes `style="background-color: green"` or `style={{ backgroundColor: 'green' }}` to that component.

## Expected and actual

Expected: the incoming style and the generated CSS variable coexist in one style attribute, matching the behavior of an explicit `style={style}` attribute.

Actual: the build succeeds, but emits two style attributes:

```html
<div style="background-color: green" style="--colour: yellow;">
```

The browser keeps the first attribute, so `--colour` is absent and the border disappears. In Chromium, both the string and object spread cases have computed border width `0px`; the no-style and explicit-style controls have `--colour: yellow` and a `4px` border. The repo includes the screenshot, browser observations, and build log.

## Workaround and source evidence

Destructure `style`, forward it as `style={style}`, and spread the other props. The explicit style path merges the values correctly.

In [compiler-rs main at `5627e84`](https://github.com/withastro/compiler-rs/blob/5627e84dad90d02809d27c9702aab9351b257781/crates/astro_codegen/src/printer/elements.rs#L577), `print_html_attributes` handles explicit styles with `print_style_with_define_vars`, but the spread path emits the incoming style independently and the later fallback adds `$$definedVars` as another attribute. That main commit has been inspected, not built; the runtime checks use the published versions below.

## Environment

- Astro: 7.4.2, default configuration
- `@astrojs/compiler-rs`: 0.5.2, pinned with an npm override and lockfile
- Node: 24.8.0
- npm: 11.6.0
- macOS arm64
