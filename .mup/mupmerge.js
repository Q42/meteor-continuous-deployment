var fs = require('fs'),
  path = require('path'),
  envName = process.argv[2];

var main = readFileSync( './mup.private.json', 'utf8' ),
  env = readFileSync( './' + envName + '/mup.settings.json', 'utf8'),
  priv = readFileSync('./' + envName + '/mup.private.json', 'utf8');

var firstMerge = deepmerge(main, env),
  finalMerge = deepmerge(firstMerge, priv);
writeFileSync('./' + envName + '/mup.json', finalMerge);

/**
 * Thank you interwebs!
 * The functions below are extracted from
 * https://github.com/KyleAMathews/deepmerge
 * and https://github.com/jprichardson/node-jsonfile
 */

function deepmerge(target, src) {
  var array = Array.isArray(src);
  var dst = array && [] || {};

  if (array) {
    target = target || [];
    dst = dst.concat(target);
    src.forEach(function(e, i) {
      if (typeof dst[i] === 'undefined') {
        dst[i] = e;
      } else if (typeof e === 'object') {
        dst[i] = deepmerge(target[i], e);
      } else {
        if (target.indexOf(e) === -1) {
          dst.push(e);
        }
      }
    });
  } else {
    if (target && typeof target === 'object') {
      Object.keys(target).forEach(function (key) {
        dst[key] = target[key];
      })
    }
    Object.keys(src).forEach(function (key) {
      if (typeof src[key] !== 'object' || !src[key]) {
        dst[key] = src[key];
      }
      else {
        if (!target[key]) {
          dst[key] = src[key];
        } else {
          dst[key] = deepmerge(target[key], src[key]);
        }
      }
    });
  }
  return dst;
}

function readFileSync (file, options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {encoding: options}
  }

  var shouldThrow = 'throws' in options ? options.throws : true;
  var content = fs.readFileSync(file, options);

  try {
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = file + ': ' + err.message;
      throw err
    } else {
      return null
    }
  }
}

function writeFileSync (file, obj, options) {
  options = options || {};

  var spaces = typeof options === 'object' && options !== null
    ? 'spaces' in options
    ? options.spaces : this.spaces
    : this.spaces

  var str = JSON.stringify(obj, options.replacer, spaces) + '\n';
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}
