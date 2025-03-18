const antfu = require('@antfu/eslint-config').default

module.exports = antfu()
// module.exports = {
//     extends: [
//       '@antfu'
//     ],
//     rules: {
//       // 自定义规则
//       'some-rule-id': 'off', // 禁用某个规则
//       'new-rule-id': ['error', { 'option': 'value' }] // 启用并配置新规则
//     }
//   };
