import { Router } from 'express'
import { config } from 'dotenv'
import { logger } from 'firebase-functions'
import {
  getCourseInfo,
  getAllCourses,
  getStudentsForCourse,
  setFlagged,
  getCurrentSemester,
  setCurrentSemester,
  getAllSemesters,
  getSurveyStatus,
  setSurveyStatus,
} from './functions'

const router = Router()
config()

router.get('/:courseId', (req, res) => {
  const courseId = req.params.courseId
  getCourseInfo(courseId)
    .then((data) => res.status(200).send({ success: true, data }))
    .catch((err) => {
      console.log(err)
      res.status(400).send({ success: false, err: err.message })
    })
})

router.get('/', (_, res) => {
  getAllCourses()
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      logger.error(`Unexpected error getting all courses: ${err.message}`)
      res.status(500).send({ message: err.message })
    })
})

router.get('/students/:courseId', (req, res) => {
  const courseId = req.params.courseId
  getStudentsForCourse(courseId)
    .then((data) => res.status(200).send({ success: true, data }))
    .catch((err) => {
      console.log(err)
      res.status(400).send({ success: false, err: err.message })
    })
})

// Updates the flagged status in the database
router.post('/flagged', (req, res) => {
  const courseId = req.body.courseId
  const flag = req.body.flagged
  setFlagged(courseId, flag)
    .then((data) => res.status(200).send({ flagged: flag }))
    .catch((err) => {
      logger.error(`Unexpected error updating flagged status: ${err.message}`)
      res.status(500).send({ message: err.message })
    })
})

router.get('/semester/current', (_, res) => {
  getCurrentSemester()
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      const err_msg = `Unexpected error getting semester: ${err.msg}`
      logger.error(err_msg)
      res.status(500).send({ message: err_msg })
    })
})

router.post('/semester/current', (req, res) => {
  const { semester } = req.body
  setCurrentSemester(semester)
    .then(() => res.status(200).send({ success: true }))
    .catch((err) => {
      const err_msg = `Unexpected error change current semester to ${semester}: ${err.msg}`
      logger.error(err_msg)
      res.status(500).send({ message: err_msg })
    })
})

router.get('/semester/all', (_, res) => {
  getAllSemesters()
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      const err_msg = `Unexpected error getting all semesters: ${err.message}`
      logger.error(err_msg)
      res.status(500).send({ message: err_msg })
    })
})

router.get('/semester/survey', (_, res) => {
  getSurveyStatus()
    .then((data) => res.status(200).send(data))
    .catch((err) => {
      logger.error(`Unexpected error retrieving survey opening: ${err.message}`)
      res.status(500).send({ message: err.message })
    })
})

router.post('/semester/survey', (req, res) => {
  const semester = req.body
  setSurveyStatus(semester.surveyOpen)
    .then((data) => res.status(200).send({ surveyOpen: semester.surveyOpen }))
    .catch((err) => {
      logger.error(`Unexpected error retrieving survey opening: ${err.message}`)
      res.status(500).send({ message: err.message })
    })
})

export default router
