export class TemplateExpression {
  constructor(public nodeIndex: number) {}
}

export class NodeTemplateExpression extends TemplateExpression {
  constructor(public nodeIndex: number, public value: string) {
    super(nodeIndex);
  }
}

export class AttributeTemplateExpression extends TemplateExpression {
  constructor(public nodeIndex: number,
      public attributeName: string,
      public strings: string[],
      public values: string[]) {
    super(nodeIndex);
  }
}

