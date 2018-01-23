declare class TemplateProcessor {}
declare class TemplateInstance {}

interface HTMLTemplateElement {
  createInstance(processor?: TemplateProcessor,
      state?: any,
      overrideDiagramCache?: boolean): TemplateInstance
}

