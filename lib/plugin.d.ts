interface Options {
    entry?: string;
    output?: string;
    ignorePath?: string;
    resolvers?: "element-ui";
    logLevel?: "error" | "wran" | "info" | "none";
}

declare class AutoImportPlugin {
    #private;
    constructor(options?: Options);
    apply(compiler: any): Promise<void>;
}

export { AutoImportPlugin as default };
