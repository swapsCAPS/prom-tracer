module.exports = {
  extends: [ 'standard' ],
  plugins: [ 'align-assignments' ],
  env:     { browser: true, node: true, mocha: true },
  rules:   {
    indent:                                [ 'warn', 2 ],
    'promise/param-names':                 [ 'warn', 'always' ],
    'array-bracket-spacing':               [ 'warn', 'always' ],
    'comma-dangle':                        [ 'warn', 'always-multiline' ],
    'key-spacing':                         [ 'warn', { align: 'value' } ],
    'no-unused-vars':                      [ 'warn', { vars: 'all' } ],
    'no-multi-spaces':                     'off',
    'padded-blocks':                       [ 'warn', 'never' ],
    'align-assignments/align-assignments': [ 'warn', { requiresOnly: false } ],
    quotes:                                [ 'warn', 'single', { avoidEscape: true } ],
  },
}
