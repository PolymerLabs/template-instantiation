export class TemplateRule {
  constructor(public nodeIndex: number) {}
}

export class NodeTemplateRule extends TemplateRule {
  constructor(public nodeIndex: number, public expression: string) {
    super(nodeIndex);
  }
}

export class AttributeTemplateRule extends TemplateRule {
  constructor(public nodeIndex: number,
      public attributeName: string,
      public strings: string[],
      public expressions: string[]) {
    super(nodeIndex);
  }
}

