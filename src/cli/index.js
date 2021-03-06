import {
  APPLICATION_VERSION,
} from '../constants';
import {
  help,
  parse,
} from './options';
import gitify from '../';

module.exports = function(argv) {
  const opts = parse(argv);
  // istanbul ignore next
  if (opts.version) {
    console.log(APPLICATION_VERSION);
    process.exit(0);
  }
  // istanbul ignore next
  if (opts.help) {
    process.stdout.write(help());
    process.exit(0);
  }
  return gitify.start(opts)
      .catch(
          // istanbul ignore next
          (error) => {
            console.error(error.stack);
          }
      );
};
