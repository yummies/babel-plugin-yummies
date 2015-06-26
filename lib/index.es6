import config from './config';
import ProcessRequire from './processRequire';
import ImportDeclaration from './ImportDeclaration';

export default babel => {
    const t = babel.types;

    return new babel.Transformer('yummies', {
        ImportDeclaration(node, parent, scope, file) {
            const importNodes = ImportDeclaration(node, parent, scope, file);

            importNodes.forEach(importNode => {
                if (importNode.declarations) {
                    importNode.declarations.forEach(declaration => {
                        if (
                            t.isIdentifier(declaration.init.callee, { name: 'require' }) &&
                            t.isLiteral(declaration.init.arguments[0]) &&
                            declaration.init.arguments[0].value.indexOf(config.prefix) === 0
                        ) {
                            const processRequire = new ProcessRequire(file.opts.filename, config);
                            const result = processRequire.process(declaration.init.arguments[0].value);

                            declaration.init.arguments[0].value = '@yummies/yummies';

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
                            );
                        }
                    });
                }
            });

            return importNodes;
        }
    });
};
