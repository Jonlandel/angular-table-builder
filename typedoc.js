module.exports = {
    mode: 'file',
    out: 'docs',
    theme: 'default',
    ignoreCompilerErrors: true,
    excludePrivate: true,
    excludeProtected: true,
    excludeNotExported: 'true',
    excludeExternals: true,
    target: 'ES5',
    moduleResolution: 'node',
    hideGenerator: true,
    stripInternal: 'true',
    suppressExcessPropertyErrors: 'true',
    suppressImplicitAnyIndexErrors: 'true',
    module: 'commonjs',
    readme: 'README.md',
    exclude: [
        '**/*.spec.ts',
        '**/*.module.ts',
        '**/*.config.ts',
        '**/*.tokens.ts',
        '**/*.class.ts',
        '**/*.interfaces.ts',
        '**/*.directive.ts',
        '**/*.animation.ts',
        '**/*.component.ts',
        '**/*.js'
    ]
};
