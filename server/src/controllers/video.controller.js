import {
  ERROR_VIDEO_NOT_FOUND
} from '../util/errorMessages'
import fs from 'fs'
import path from 'path'

const getVideo = async (req, res, next) => {
  let videoName = req.params.videoName
  let file = path.resolve(__dirname, '../assets/videos/' + videoName + '.mp4')
  fs.stat(file, function (err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(422).json({
          errors: [{ location: 'params', msg: ERROR_VIDEO_NOT_FOUND, param: 'name' }]
        })
      }
      return next(err)
    }
    let range = req.headers.range
    if (!range) {
      let err = new Error('Wrong range')
      err.status = 416
      return next(err)
    }

    let positions = range.replace(/bytes=/, '').split('-')
    let start = parseInt(positions[0], 10)
    let fileSize = stats.size

    let end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1

    let chunksize = (end - start) + 1
    let head = {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    }
    res.writeHead(206, head)

    let streamPosition = {
      start: start,
      end: end
    }
    let stream = fs.createReadStream(file, streamPosition)

    stream.on('open', function () {
      stream.pipe(res)
    })
    stream.on('error', function (err) {
      return next(err)
    })
  })
}

module.exports = {
  getVideo
}
