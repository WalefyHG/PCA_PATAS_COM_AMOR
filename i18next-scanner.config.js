module.exports = {
    input: ['app/**/*.{js,ts,tsx}'],
    output: './locales',
    options: {
        debug: true,
        removeUnusedKeys: false,
        func: {
            list: ['t'],
            extensions: ['.js', '.ts', '.tsx'],
        },
        lngs: ['en', 'pt'],
        defaultLng: 'pt',
        defaultNs: 'translation',
        resource: {
            loadPath: 'locales/{{lng}}/{{ns}}.json',
            savePath: 'locales/{{lng}}/{{ns}}.json',
        },
    },
};
