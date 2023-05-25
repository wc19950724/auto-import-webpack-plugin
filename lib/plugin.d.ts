interface IgnoreConfig {
    path?: string;
    components?: Array<string | RegExp>;
}
type LibraryType = "element-ui";
type LogLevelType = "error" | "wran" | "info" | boolean;
interface Options {
    entry?: string;
    output?: string;
    ignore?: IgnoreConfig | string | Array<string | RegExp>;
    library?: LibraryType;
    logLevel?: LogLevelType;
}

declare class AutoImportPlugin {
    #private;
    constructor(options?: Options);
    apply(compiler: any): Promise<void>;
}

export { AutoImportPlugin, AutoImportPlugin as default };
