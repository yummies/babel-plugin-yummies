import { transform, Transformer, types as t } from 'babel-core';
import { ImportDeclaration } from 'babel-core/lib/babel/transformation/transformers/es6/modules.js';

const prefix = '#';

export default new Transformer('yummies', {
    ImportDeclaration(node, parent, scope, file) {
        const importNodes = ImportDeclaration(node, parent, scope, file);

        importNodes.forEach(importNode => {
            importNode.declarations.forEach(declaration => {
                if (
                    t.isIdentifier(declaration.init.callee, { name: 'require' }) &&
                    t.isLiteral(declaration.init.arguments[0]) &&
                    declaration.init.arguments[0].value.indexOf(prefix) === 0
                ) {
                    declaration.init.arguments[0].value = 'yummies';

                    declaration.init = t.callExpression(
                        t.memberExpression(
                            declaration.init,
                            t.identifier('yummify'),
                            false
                        ),
                        [
                            t.arrayExpression([
                                t.objectExpression([
                                    t.property(
                                        'init',
                                        t.literal('a'),
                                        t.literal(1)
                                    ),
                                    t.property(
                                        'init',
                                        t.literal('b'),
                                        t.literal(2)
                                    )
                                ])
                            ])
                        ]
                    )
                }
            });
        });

        return importNodes;
    }
});
