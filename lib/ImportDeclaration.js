// https://github.com/babel/babel/blob/master/src/babel/transformation/transformers/es6/modules.js
export default function(node, parent, scope, file) {
    // flow type
    if (node.isType) {
        return;
    }

    const nodes = [];

    if (node.specifiers.length) {
        for (const specifier of node.specifiers) {
            file.moduleFormatter.importSpecifier(specifier, node, nodes, scope);
        }
    } else {
        file.moduleFormatter.importDeclaration(node, nodes, scope);
    }

    if (nodes.length === 1) {
        // inherit `_blockHoist` - this is for `_blockHoist` in File.prototype.addImport
        nodes[0]._blockHoist = node._blockHoist;
    }

    return nodes;
}
