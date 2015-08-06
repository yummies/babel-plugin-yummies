// https://github.com/babel/babel/blob/master/packages/babel/src/transformation/transformers/es6/modules.js

export default function(node, parent, scope, file) {
    // flow type
    if (node.importKind === 'type' || node.importKind === 'typeof') return;

    var nodes = [];

    if (node.specifiers.length) {
      for (var specifier of (node.specifiers: Array)) {
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
