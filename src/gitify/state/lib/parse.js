const AUTHOR_REGEX = new RegExp('([^<]*)<([^>]*)>');
const EMAIL_REGEX = new RegExp('([^@]*)@.*');

function author(author) {
  if (author) {
    let matches = author.match(AUTHOR_REGEX);
    if (matches) {
      return {
        name: matches[1].trim(),
        email: matches[2].trim(),
      };
    }
    matches = author.match(EMAIL_REGEX);
    if (matches) {
      return {
        name: matches[1].trim(),
        email: author.trim(),
      };
    }
    return {
      name: author.trim(),
    };
  }
  return {};
};

const parse = {
  author,
};
export default parse;
