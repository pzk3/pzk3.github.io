/**
 * This module parses user defined vector field code.
 */

import bus from '../bus';
import pragmaParse from './pragmaParser';

// This is naive parser that is being used until the real `glsl-parser`
// is loaded asynchronously. This parser assumes there are no errors
// TODO: maybe I should be more careful here?
var glslParser = {
  check(code) {
    return {
      code,
      log: {
        errorCount: 0
      }
    };
  }
};

// glsl-parser is ~179KB uncompressed, we don't want to wait until it is downloaded.
// So we load it asynchronously...
require.ensure('glsl-parser', () => {
  // ... and replace the naive parser with the real one, when ready.
  glslParser = require('glsl-parser');

  // notify interested parties, so that they can recheck code if they wish.
  bus.fire('glsl-parser-ready'); 
});

var vectorFieldGlobals = `
import {
  float PI;
  float snoise(vec2 v);
  float frame;
  vec4 cursor;
  vec2 rotate(vec2 p,float a);
  float audio(float index);
  float rand(const vec2 co);
  sampler2D input0;
  sampler2D input1;
}`;

/**
 * Given a string, verifies that it is a valid glsl code for a vector field,
 * and then returns code + log.
 * 
 * @param {String} vectorFieldCode 
 */
export default function getParsedVectorFieldFunction(vectorFieldCode) {
  // TODO: what if we want to support 3d?
  return pragmaParse(vectorFieldCode).then(pragmaParseResult => {
    if (pragmaParseResult.error) {
      return pragmaParseResult;
    }

    vectorFieldCode = pragmaParseResult.getCode();

    var parserResult = glslParser.check(vectorFieldCode, { globals: vectorFieldGlobals });
    parserResult.code = vectorFieldCode;

    if (parserResult.log.errorCount) parserResult.error = parserError(parserResult.log);

    return parserResult;
  });
}

function parserError(log) {
  let diag = log.diagnostics[0];
  // TODO probably need to check kind (errors are 0, warnings are 1)
  let firstError = diag.range;
  let lineColumn = firstError.lineColumn();
  let source = firstError.source;
  let offset = source._lineOffsets[lineColumn.line]
  let line = source.contents.substr(offset,  lineColumn.column);
  line += source.contents.substring(firstError.start, firstError.end);
  let prefix = 'Line ' + lineColumn.line + ': ';
  let diagText = diag.text;
  return {
    error: 
      prefix + line + '\n' +
      whitespace(prefix.length) + whitespace(lineColumn.column) + '^',
    errorDetail: diagText,
    isFloatError: isFloatError(diagText)
  };
}

function isFloatError(diagText) {
  return diagText.indexOf('"int"') > -1 &&
    diagText.indexOf('"float"')  > -1;
}

function whitespace(length) {
  return new Array(length + 1).join(' ');
}
