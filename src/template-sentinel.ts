export class TemplateSentinel {
  constructor(public nodeIndex: number) {}
}

export class NodeTemplateSentinel extends TemplateSentinel {
  constructor(public nodeIndex: number, public expression: string) {
    super(nodeIndex);
  }
}

export class AttributeTemplateSentinel extends TemplateSentinel {
  constructor(public nodeIndex: number,
      public attributeName: string,
      public strings: string[],
      public expressions: string[]) {
    super(nodeIndex);
  }
}

