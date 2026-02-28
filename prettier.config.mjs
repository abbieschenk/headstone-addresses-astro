const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    printWidth: 120,
    singleQuote: true,
    plugins: ['prettier-plugin-astro'],
    overrides: [
        {
            files: '*.astro',
            options: {
                parser: 'astro',
            },
        },
    ],
};

export default config;
