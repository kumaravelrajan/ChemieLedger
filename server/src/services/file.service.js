import fs from 'fs'

const deleteFile = path => {
  try {
    fs.unlinkSync(path)
    return true
  } catch (err) {
    return false
  }
}

module.exports = {
  deleteFile
}
