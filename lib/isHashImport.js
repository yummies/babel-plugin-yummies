import { types } from 'babel';

const prefix = '#';

export default function(declaration) {
    return types.isIdentifier(declaration.init.callee, { name: 'require' }) &&
           types.isLiteral(declaration.init.arguments[0]) &&
           declaration.init.arguments[0].value.indexOf(prefix) === 0;
}
