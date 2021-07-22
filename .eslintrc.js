// .eslintrc.js
module.exports = {
    // 현재 eslintrc 파일을 기준으로 ESLint 규칙을 적용
    root: true,

    "env": {
        "browser": true
    },
    "globals": {
        "PIXI": true,
        "module": true,
        "require": true
    },
    // 추가적인 규칙들을 적용
    extends: [
        'eslint:recommended',
        'plugin:vue/essential',
        'prettier',
        'plugin:prettier/recommended',
    ],
    // parser: '@typescript-eslint/parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2017,
        sourceType: 'module',
      },
    // 코드 정리 플러그인 추가
    plugins: [
        'prettier',
        '@typescript-eslint'
    ],
    // 사용자 편의 규칙 추가
    rules: {
        'prettier/prettier': [
            'error',
            // 아래 규칙들은 개인 선호에 따라 prettier 문법 적용
            // https://prettier.io/docs/en/options.html
            {
                singleQuote: true,
                semi: true,
                useTabs: true,
                tabWidth: 2,
                trailingComma: 'all',
                printWidth: 80,
                bracketSpacing: true,
                arrowParens: 'avoid',
                endOfLine: 'auto',

            },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        "no-unused-vars": 1,  // 0 이면 경고/알림 사라짐, 1 이면 경고만뜸, 2 빨간줄생성
        "no-console": 'off',     // console 써도 노란줄 생성 안되게끔
        // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
};
