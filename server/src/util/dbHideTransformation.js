export const dbHideTransformation = function (doc, ret, options) {
  if (options.alwaysHide) {
    if (!options.hide) options.hide = ''
    options.hide = options.hide + ' ' + options.alwaysHide
  }

  if (options.hide) {
    options.hide.split(' ').forEach(function (prop) {
      delete ret[prop]
    })
  }
  return ret
}
