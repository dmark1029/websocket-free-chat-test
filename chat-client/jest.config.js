const esModules = ["@react-leaflet", "react-leaflet"].join("|");

module.exports = {
    preset: "ts-jest",
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
    globals: {
        "ts-jest": {
        isolatedModules: true,
        },
    },
    setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
    moduleNameMapper: {
        "\\.css$": "identity-obj-proxy",
    },
    testEnvironment: "jsdom"
};
