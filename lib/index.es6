import { transform, Transformer, types as t } from 'babel-core';
import { ImportDeclaration as OrigImportDeclaration } from 'babel-core/lib/babel/transformation/transformers/es6/modules.js';
import config from './config';
import ProcessRequire from './processRequire';

export default new Transformer('yummies', {
    ImportDeclaration(node, parent, scope, file) {
        const importNodes = OrigImportDeclaration(node, parent, scope, file);

        importNodes.forEach(importNode => {
            importNode.declarations.forEach(declaration => {
                if (
                    t.isIdentifier(declaration.init.callee, { name: 'require' }) &&
                    t.isLiteral(declaration.init.arguments[0]) &&
                    declaration.init.arguments[0].value.indexOf(config.prefix) === 0
                ) {
                    const processRequire = new ProcessRequire(file.opts.filename, config);
                    const result = processRequire.process(declaration.init.arguments[0].value);

                    declaration.init.arguments[0].value = 'yummies';

                    declaration.init = t.callExpression(
                        t.memberExpression(
                            declaration.init,
                            t.identifier(result.method),
                            false
                        ),
                        [
                            t.arrayExpression(
                                result.items.map(item => {
                                    return t.objectExpression([
                                        t.property(
                                            'init',
                                            t.literal('type'),
                                            t.literal(item.type)
                                        ),
                                        t.property(
                                            'init',
                                            t.literal('module'),
                                            t.callExpression(
                                                t.identifier('require'),
                                                [ t.literal(item.path) ]
                                            )
                                        )
                                    ]);
                                })
                            )
                        ]
                    )
                }
            });
        });

        return importNodes;
    }
});
