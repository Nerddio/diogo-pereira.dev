// ESLint checks code correctness only. All formatting is owned by Prettier;
// eslint-config-prettier disables every ESLint rule that would conflict, so
// the two tools cannot fight over the same file.
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  prettier, // must stay last: it turns off conflicting rules
)
