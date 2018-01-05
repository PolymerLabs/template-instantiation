declare class TemplateProcessor {}
declare class TemplateInstance {}

interface HTMLTemplateElement {
  createInstance(state: any): TemplateInstance
}

interface Document {
  defineTemplateType(typeName: string, processor: TemplateProcessor): void
}
