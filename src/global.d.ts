declare class TemplateProcessor {}
declare class TemplateInstance {}

interface HTMLTemplateElement {
  createInstance(state?: any,
      processor?: TemplateProcessor,
      overrideDiagramCache?: boolean): TemplateInstance
}

