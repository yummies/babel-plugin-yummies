import getImportDeclarations from './getImportDeclarations';
import isHashImport from './isHashImport';
import YummifyChain from './YummifyChain';
import transformImportDeclaration from './transformImportDeclaration';

export default function({ Plugin }) {
    return new Plugin('yummies', {
        visitor: {
            ImportDeclaration(node, parent, scope, file) {
                const importNodes = getImportDeclarations(node, parent, scope, file);

                importNodes.forEach(importNode => {
                    if (importNode.declarations) {
                        importNode.declarations.forEach(declaration => {
                            if (isHashImport(declaration)) {
                                const yummifyChain = new YummifyChain(file.opts.filename);
                                const result = yummifyChain.get(declaration.init.arguments[0].value);

                                transformImportDeclaration(declaration, result);
                            }
                        });
                    }
                });

                return importNodes;
            }
        }
    });
}
