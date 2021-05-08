import express from 'express'
import { videoController } from '../controllers'

const video = express.Router()

/**
 * @api {get} /api/v1/video/:videoName Get a stream of the video "videoName"
 * @apiName Get Video
 * @apiPermission -
 *
 * @apiSuccess (206) stream of the video "videoName"
 * @apiError (422) {json} Unexpected error or video not found
 *           (416) {json} Wrong range
 */
video.get('/:videoName', videoController.getVideo)

module.exports = video
