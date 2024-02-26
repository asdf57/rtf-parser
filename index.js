import RTFParser from './rtf-parser.js';
import RTFDocument from './rtf-document.js';
import RTFInterpreter from './rtf-interpreter.js';

export function parseString(string, cb) {
  parse(cb).end(string);
}

export function parseStream(stream, cb) {
  stream.pipe(parse(cb));
}

export function parse(cb) {
  let errored = false;
  const errorHandler = (err) => {
    if (errored) return;
    errored = true;
    parser.unpipe(interpreter);
    interpreter.end();
    cb(err);
  };
  const document = new RTFDocument();
  const parser = new RTFParser();
  parser.once('error', errorHandler);
  const interpreter = new RTFInterpreter(document);
  interpreter.on('error', errorHandler);
  interpreter.on('finish', () => {
    if (!errored) cb(null, document);
  });
  parser.pipe(interpreter);
  return parser;
}
