const AUTHOR_REGEX = new RegExp('([^<]*)<([^>]*)>');

export const exportObject = (object) => object.export();
export const importObject = (Class) => (exported) => new Class({
  exported,
});

export function parseAuthor(author) {
  if (author) {
    const matches = author.match(AUTHOR_REGEX);
    if (matches) {
      return {
        name: matches[1].trim(),
        email: matches[2].trim(),
      };
    }
    return {
      name: author.trim(),
    };
  }
  return {};
};
