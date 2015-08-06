import config from './config';
import ProcessRequire from './processRequire';
import ImportDeclaration from './ImportDeclaration';

export default babel => {
    const types = babel.types;

    return new babel.Transformer('yummies', {
        ImportDeclaration(node, parent, scope, file) {
            const importNodes = ImportDeclaration(node, parent, scope, file);

            importNodes.forEach(importNode => {
                if (importNode.declarations) {
                    importNode.declarations.forEach(declaration => {
                        if (
                            types.isIdentifier(declaration.init.callee, { name: 'require' }) &&
                            types.isLiteral(declaration.init.arguments[0]) &&
                            declaration.init.arguments[0].value.indexOf(config.prefix) === 0
                        ) {
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
                                    types.arrayExpression(
                                        result.items.map(item => {
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
                                    )
                                ]
                            );
                        }
                    });
                }
            });

            return importNodes;
        }
    });
};
