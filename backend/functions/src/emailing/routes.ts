import express from 'express'
import { logger } from 'firebase-functions'
import { createEmailAsJson, sendMails, updateEmailTimestamp } from './functions'

const router = express()

/* 

    /send endpoint in our backend server. 

    POST Req.body needs: 

      - emailAddress (admin/user email)
      - authToken (must match admin email account)
      - emailBody 
      - emailSubject
      - emailRcpts (student email string list )

    Returns: 
      SUCC -> res.data = 'Email send success.' 
      FAIL -> res.data = 'Email send failure.' 

    */
router.post('/send', (req, res) => {
  const { emailAddress, authToken, emailBody, emailSubject, emailRcpts } =
    req.body

  const message = createEmailAsJson(emailRcpts, emailSubject, emailBody)
  // console.log(JSON.stringify(message, null, '  '))

  sendMails(emailAddress, message, authToken)
    .then((result) => {
      if (result === 202) {
        logger.info(
          `Email sent successfully by ${emailAddress} to ${emailRcpts.toString()}`
        )
        res.json('Email send success.')
      } else {
        logger.error(
          `** Likely auth error ** : Email failed to send by  ${emailAddress} to ${emailRcpts.toString()}`
        )
        res.json('Email send failure.')
      }
    })
    .catch(() =>
      logger.error(
        `Email send request failed from ${emailAddress} to ${emailRcpts.toString()}`
      )
    )
})

// api root/email/timestamp
router.post('/timestamp', (req, res) => {
  const { courseId, groups } = req.body
  updateEmailTimestamp(courseId, groups)
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
