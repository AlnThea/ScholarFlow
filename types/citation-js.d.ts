declare module '@citation-js/core' {
  export class Cite {
    constructor(data?: any, options?: any);
    format(format: string, options?: any): string;
    add(data: any): this;
    set(data: any): this;
    get(options?: any): any;
  }
}

declare module '@citation-js/plugin-csl' {
  const plugin: any;
  export default plugin;
}
