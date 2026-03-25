export const shimmerGrammar = {
    name: 'Shimmer',
    scopeName: 'source.shimmer',
    patterns: [
      // 注释
      {
        name: 'comment.line.double-slash.shimmer',
        match: '//.*$'
      },
      {
        name: 'comment.block.shimmer',
        begin: '/\\*',
        end: '\\*/'
      },
      // 关键字
      {
        name: 'keyword.control.shimmer',
        match: '\\b(if|else|elif|for|in|while|switch|case|break|next|return|range)\\b'
      },
      {
        name: 'storage.type.shimmer',
        match: '\\b(var|val|global|client|server|async)\\b'
      },
      {
        name: 'variable.language.shimmer',
        match: '\\b(self|tmp)\\b'
      },
      {
        name: 'constant.language.shimmer',
        match: '\\b(true|false)\\b'
      },
      {
        name: 'entity.name.function.shimmer',
        match: '\\b(Shimmer|Math)\\b'
      },
      // 字符串
      {
        name: 'string.quoted.triple.shimmer',
        begin: '"""',
        end: '"""',
        patterns: [
          {
            name: 'constant.character.escape.shimmer',
            match: '\\\\.'
          }
        ]
      },
      {
        name: 'string.quoted.double.shimmer',
        begin: '"',
        end: '"',
        patterns: [
          {
            name: 'constant.character.escape.shimmer',
            match: '\\\\.'
          }
        ]
      },
      {
        name: 'string.quoted.single.shimmer',
        begin: '\'',
        end: '\''
      },
      // 数字
      {
        name: 'constant.numeric.float.shimmer',
        match: '\\b\\d*\\.\\d+([eE][+-]?\\d+)?\\b'
      },
      {
        name: 'constant.numeric.hex.shimmer',
        match: '\\b0[xX][0-9a-fA-F]+\\b'
      },
      {
        name: 'constant.numeric.integer.shimmer',
        match: '\\b\\d+\\b'
      },
      // 操作符
      {
        name: 'keyword.operator.shimmer',
        match: '->|[=!<>~]=|[<>]|~~|&&|\\|\\||!|[+\\-*/%]=|[+\\-*/%]|\\+\\+|--'
      }
    ],
    repository: {
      comments: {
        patterns: [
          {
            name: 'comment.line.double-slash.shimmer',
            match: '//.*$'
          },
          {
            name: 'comment.block.shimmer',
            begin: '/\\*',
            end: '\\*/'
          }
        ]
      },
      keywords: {
        patterns: [
          {
            name: 'keyword.control.shimmer',
            match: '\\b(if|else|elif|for|in|while|switch|case|break|next|return)\\b'
          },
          {
            name: 'storage.type.shimmer',
            match: '\\b(var|val|global|client|server|async)\\b'
          },
          {
            name: 'variable.language.shimmer',
            match: '\\b(self|tmp)\\b'
          }
        ]
      },
      strings: {
        patterns: [
          {
            name: 'string.quoted.triple.shimmer',
            begin: '"""',
            end: '"""'
          },
          {
            name: 'string.quoted.double.shimmer',
            begin: '"',
            end: '"'
          },
          {
            name: 'string.quoted.single.shimmer',
            begin: '\'',
            end: '\''
          }
        ]
      },
      numbers: {
        patterns: [
          {
            name: 'constant.numeric.float.shimmer',
            match: '\\b\\d*\\.\\d+([eE][+-]?\\d+)?\\b'
          },
          {
            name: 'constant.numeric.hex.shimmer',
            match: '\\b0[xX][0-9a-fA-F]+\\b'
          },
          {
            name: 'constant.numeric.integer.shimmer',
            match: '\\b\\d+\\b'
          }
        ]
      },
      operators: {
        patterns: [
          {
            name: 'keyword.operator.shimmer',
            match: '->|[=!<>~]=|[<>]|~~|&&|\\|\\||!|[+\\-*/%]=|[+\\-*/%]|\\+\\+|--'
          }
        ]
      }
    }
  };