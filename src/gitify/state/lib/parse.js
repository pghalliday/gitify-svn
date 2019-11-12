import {
  DEFAULT_NAME,
  DEFAULT_EMAIL,
} from '../../../constants';

const AUTHOR_REGEX = new RegExp('([^<]*)<([^>]*)>');
const EMAIL_REGEX = new RegExp('([^@]*)@.*');

function author(author) {
  if (author) {
    let matches = author.match(AUTHOR_REGEX);
    if (matches) {
      return {
        name: matches[1].trim() || DEFAULT_NAME,
        email: matches[2].trim() || DEFAULT_EMAIL,
      };
    }
    matches = author.match(EMAIL_REGEX);
    if (matches) {
      return {
        name: matches[1].trim() || DEFAULT_NAME,
        email: author.trim() || DEFAULT_EMAIL,
      };
    }
    return {
      name: author.trim() || DEFAULT_NAME,
      email: DEFAULT_EMAIL,
    };
  }
  return {
    name: DEFAULT_NAME,
    email: DEFAULT_EMAIL,
  };
};

const parse = {
  author,
};
export default parse;
