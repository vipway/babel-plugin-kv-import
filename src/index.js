import { join } from 'path';
module.exports = function(babel) {
  const { types } = babel;
  return {
    visitor: {
      CallExpression(path, state) {
        const { node, opts } = path;
        const file = (path && path.hub && path.hub.file) || (state && state.file);
        const { name } = node.callee;
        if (types.isIdentifier(node.callee, { name: 'require' }) && node.arguments && node.arguments.length === 1) {
          const source = node.arguments[0];
          if (types.isStringLiteral(source, { value: opts.libraryName })) {
            throw path.buildCodeFrameError(
              `require('${opts.libraryName}') is not allowed, use import { ... } from '${opts.libraryName}'`
            );
          }
        }
      },
      ImportDeclaration(path, state) {
        const { node } = path;
        if (!node) return;
        const { opts } = state;
        const { value } = node.source;
        const libraryName = opts.libraryName;
        if (value === libraryName) {
          const replacement = node.specifiers.reduce((r, spec) => {
            if (types.isImportSpecifier(spec)) {
              return r.concat(buildImportReplacement(spec, types, state, path));
            }
          }, []);
          path.replaceWithMultiple(replacement);
        }
      }
    }
  };
};

function winPath(path) {
  return path.replace(/\\/g, '/');
}

function checkValue(value) {
  return value === undefined || value === null || value === '';
}

function buildImportReplacement(specifier, types, state) {
  initOptionNecessary(state);
  const { opts } = state;
  const importedName = specifier.imported.name;
  const localName = specifier.local.name;
  const replacement = [];
  let replacePath = winPath(join(opts.libraryName, opts.libraryDirectory, importedName.toLowerCase()));
  if (opts.customName) {
    if (typeof opts.customName === 'function') {
      replacePath = winPath(opts.customName(importedName));
    } else {
      throw new Error('customName must be function');
    }
  }

  // js
  replacement.push(
    types.importDeclaration(
      [types.importDefaultSpecifier(types.identifier(localName))],
      types.stringLiteral(replacePath)
    )
  );

  // style
  if (opts.style === true) {
    replacement.push(
      types.importDeclaration([], types.stringLiteral(join(replacePath, `${importedName.toLowerCase()}.css`)))
    );
  } else if (opts.style === 'less') {
    replacement.push(
      types.importDeclaration([], types.stringLiteral(winPath(join(replacePath, `${importedName.toLowerCase()}.less`))))
    );
  } else if (typeof opts.style === 'function') {
    types.importDeclaration([], types.stringLiteral(winPath(opts.style(importedName))));
  }

  return replacement;
}

// init option
function initOptionNecessary(state) {
  let { opts } = state;
  if (Array.isArray(opts)) {
    opts.forEach((o, index) => {
      if (checkValue(opts.libraryName)) {
        throw new Error('libraryName should be provided');
      }
      Object.assign(opts[index], {
        libraryDirectory: o.libraryDirectory || 'lib',
        style: o.style === undefined ? true : o.style
      });
    });
  } else {
    if (checkValue(opts.libraryName)) {
      throw new Error('libraryName should be provided');
    }
    Object.assign(opts, {
      libraryDirectory: opts.libraryDirectory || 'lib',
      style: opts.style === undefined ? true : opts.style
    });
  }
}
