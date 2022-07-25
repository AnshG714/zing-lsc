import express from 'express'
import { logger } from 'firebase-functions'
import {
  sendStudEmails,
  updateEmailTimestamp,
  getRecipients,
} from './functions'

const router = express()

/**

    @.com/email/send endpoint in our backend server. 

    POST Req.body needs: 
      @param emailAddress (admin/user email)
      @param authToken (must match admin email account)
      @param emailBody 
      @param emailSubject
      @param emailRcpts (student email string list )

      @param courseId roster and 6-digit course id
      @param group group number 
      @param template string name

    @returns: 
      SUCC -> res.data = 'Email send success.' 
      FAIL -> res.data = 'Email send failure.' 

    */
router.post('/send', async (req, res) => {
  const {
    emailAddress,
    authToken,
    emailSubject,
    emailBody,
    courseId,
    group,
    template,
    indivEmail,
  } = req.body

  const emailRcpts = await getRecipients(courseId, group, indivEmail)

  sendStudEmails(
    emailAddress,
    authToken,
    emailSubject,
    emailBody,
    courseId,
    group,
    template,
    indivEmail
  )
    .then((result) => {
      if (result === 202) {
        logger.info(
          `Email sent successfully by ${emailAddress} to ${emailRcpts.toString()}`
        )
        res.status(200).json('Email send success.')
      } else {
        logger.error(
          `** Likely auth error ** : Email failed to send by ${emailAddress} to ${emailRcpts.toString()}`
        )
        res.status(400).json('Email send failure.')
      }
    })
    .catch(() => {
      logger.error(
        `Email send request failed from ${emailAddress} to ${emailRcpts.toString()}`
      )
      res.status(400)
    })
})

/** @.com/api root/email/timestamp
 *
 * @param courseId = string of 6-digit course code
 * @param groups = string [] of groups to be sent emails
 * @param template = is the name of the template of the email being sent. Matched emailTemplates.js names made by sean. Currently is the string value, may change to the variable value in future (less wordy).
 *
 * @yeilds email sent timestamp update in database
 */
router.post('/timestamp', (req, res) => {
  const { courseId, groups, template } = req.body
  updateEmailTimestamp(courseId, groups, template)
    .then(() => {
      logger.info(
        `Email time updated for groups ${groups.toString()} in course ${courseId}.`
      )
      res.status(200).json('Email Time updated')
    })
    .catch(() => {
      logger.warn(
        `Email time failed to update for groups ${groups.toString()} in course ${courseId}.`
      )
      res.status(400).json('ERROR: email Time update failure')
    })
})

export default router
