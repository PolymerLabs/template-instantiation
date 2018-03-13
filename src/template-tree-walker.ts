// Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
export const createTreeWalker = (node: Node) => document.createTreeWalker(
    node,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null as any,
    false);

