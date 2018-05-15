
/**
 * Created by wuzhenquan on 2017/5/12.
 * npm install eslint-plugin-react -g
 * npm install eslint-plugin-jsx-a11y -g
 * npm install eslint-plugin-import -g
 */
module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "globals": {
        "window": true,
    },
    "extends": [
        "eslint:recommended",
        // "plugin:react/recommended"
    ],
    "parserOptions": { //启用对 ECMAScript 8 和 JSX 的支持
        "ecmaVersion": 8,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true,
            "classes": true
        },
        "sourceType": "module"
    },
    // "parser": "babel-eslint",
    // "plugins": [
    //     "react",
    //     "jsx-a11y",
    //     "import"
    // ],
    "rules": {
        "indent": [
            "off", // 缩进检查关掉
            "tab"
        ],
        // "linebreak-style": [
        //     "warn", // 推荐使用 Windows 换行符
        //     "windows"
        // ],
        "quotes": [
            "off", // 是否用双引号的检查关掉
            "double"
        ],
        // "semi": [
        //     "warn", // 推荐分号结尾, 其实我也不喜欢加分号
        //     "always"
        // ],
        "no-unused-vars": [ // 推荐不要出现未使用过的变量
            "warn",
            { "vars": "all", "args": "after-used" }
        ],
        "no-undef": 2,
        // "react/prop-types": "warn",
        "no-class-assign": "warn",
        "no-console": "warn",
    }
};