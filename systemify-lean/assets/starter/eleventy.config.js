// Eleventy turns src/ into plain HTML in _site/. No JavaScript framework ships.
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/js');
  return { dir: { input: 'src', output: '_site' }, templateFormats: ['njk', 'md', 'html'] };
}
