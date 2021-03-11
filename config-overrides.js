const { alias } = require('react-app-rewire-alias')

module.exports = function override(config) {
    alias({
        '@scss/pages': 'src/theme/scss/pages',
        '@scss': 'src/theme/scss',
        '@pages': 'src/pages',
        '@components': 'src/components',
        '@assets': 'src/assets',
        '@images': 'src/theme/images',
        '@utils': 'src/utils'
    })(config)

    return config
}
