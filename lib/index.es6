import { types } from 'babel';

import config from './config';
import ProcessRequire from './processRequire';
import getImportDeclarations from './getImportDeclarations';

function isHashImport(declaration) {
    return types.isIdentifier(declaration.init.callee, { name: 'require' }) &&
           types.isLiteral(declaration.init.arguments[0]) &&
           declaration.init.arguments[0].value.indexOf(config.prefix) === 0;
}

function chainToAST(chain) {
    return types.arrayExpression(
        chain.map(item => {
            return types.objectExpression([
                types.property(
                    'init',
                    types.literal('type'),
                    types.literal(item.type)
                ),
                types.property(
                    'init',
                    types.literal('module'),
                    types.callExpression(
                        types.identifier('require'),
                        [ types.literal(item.path) ]
                    )
                )
            ]);
        })
    );
}

export default function({ Plugin }) {
    return new Plugin('yummies', {
        visitor: {
            ImportDeclaration(node, parent, scope, file) {
                const importNodes = getImportDeclarations(node, parent, scope, file);

                importNodes.forEach(importNode => {
                    if (importNode.declarations) {
                        importNode.declarations.forEach(declaration => {
                            if (isHashImport(declaration)) {
                                const processRequire = new ProcessRequire(file.opts.filename, config);
                                const result = processRequire.process(declaration.init.arguments[0].value);

                                declaration.init.arguments[0].value = '@yummies/yummies/build/chain';

                                declaration.init = types.callExpression(
                                    types.memberExpression(
                                        declaration.init,
                                        types.identifier(result.method),
                                        false
                                    ),
                                    [
                                        chainToAST(result.items)
                                    ]
                                );
                            }
                        });
                    }
                });

                return importNodes;
            }
        }
    });
}
