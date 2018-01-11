const nonWhitespaceRe = /\S/;

export class TemplatePart {
  readonly expression: string;

  protected valueSetter: ValueSetter;
  protected fullyTemplatized: boolean;

  protected nodeIsFullyTemplatizable(node: Node): boolean {
    // TODO(cdata): What if parentNode is null?
    const { parentNode } = node;

    if (parentNode instanceof TemplateInstance) {
      return false;
    }

    let child = parentNode!.firstChild;

    while (child != null) {
      if (child !== node) {
        if (child.nodeType !== Node.TEXT_NODE ||
            nonWhitespaceRe.test((child as Text).data)) {
          return false;
        }
      }

      child = child.nextSibling;
    }

    return true;
  }

  constructor(valueSetter: ValueSetter) {
    this.valueSetter = valueSetter;
  }

  get value(): string | void {
    return this.valueSetter.value;
  }

  set value(value: string | void) {
    this.valueSetter.value = value;
  }
}

export abstract class ValueSetter {
  abstract get value(): string | void;
  abstract set value(value: string | void);
}
