import { types } from 'babel';

export default function(declaration, result) {
    declaration.init.arguments[0].value = '@yummies/yummies/build/chain';

    declaration.init = types.callExpression(
        types.memberExpression(
            declaration.init,
            types.identifier(result.method),
            false
        ),
        [
            types.arrayExpression(
                result.chain.map(item => {
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
