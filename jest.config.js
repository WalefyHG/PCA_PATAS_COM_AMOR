module.exports = {
    preset: "jest-expo",
    setupFilesAfterEnv: [
        "@testing-library/jest-native/extend-expect",
        "<rootDir>/jest.setup.js"
    ],
    transform: {
        "^.+\\.[jt]sx?$": "babel-jest",
        "^.+\\.mjs$": "babel-jest"
    },
    transformIgnorePatterns: ["node_modules/(?!(jest-)?react-native|@react-native|@react-native-firebase|@firebase|firebase|expo(nent)?|@expo(nent)?|@unimodules|unimodules|react-native-.*|@react-navigation/.*)"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$"
    ,
    collectCoverageFrom: [
        "**/*.{ts,tsx}",
        "!**/node_modules/**",
        "!**/coverage/**",
        "!**/jest.setup.js",
        "!**/babel.config.js"
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    }
}
