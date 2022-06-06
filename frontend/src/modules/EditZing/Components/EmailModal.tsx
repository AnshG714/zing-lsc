// external imports
import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
// zing imports
import { getBody } from '../utils/emailTemplates'
import { ZingModal } from '@core/Components'
import { EmailModalProps } from '../Types/ComponentProps'
import { TemplateName } from 'EditZing/utils/emailTemplates'
import { EmailTemplateButtons } from 'EditZing/Components/EmailTemplateButtons'
import { EmailPreview } from 'EditZing/Components/EmailPreview'
import { sendEmail } from 'Emailing/Components/Emailing'
import { adminSignIn } from '@fire/firebase'
import Snackbar from '@mui/material/Snackbar'

export const EmailModal = ({
  selectedGroups,
  isEmailing,
  setIsEmailing,
  courseNames,
  setEmailSent,
  setEmailSentError,
}: EmailModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>(
    '' as TemplateName
  )
  const [step, setStep] = useState<number>(0)
  const titles = ['Select email template', 'Send emails']
  const title = titles[step]
  const [sendError, setSendError] = useState<boolean | null>(null)

  // ======= Send Email Helper Functions =======

  const groupEmails = async (group: any) => {
    const rcpts: string[] = []
    const members = group.memberData
    await members.forEach((mem: any) => {
      rcpts.push(mem.email)
    })
    return rcpts
  }

  const sendEmails = async () => {
    try {
      selectedGroups.forEach(async (group) => {
        const emailRcpts = await groupEmails(group)
        console.log(`rcpts r : ${emailRcpts}`)
        const emailBody = getBody(selectedTemplate, courseNames.join(', '))
        const emailSubject = 'Study Partners!'
        const emailItems = { emailSubject, emailRcpts, emailBody }
        const result = await sendEmail(emailItems)
        if (result === false) setSendError(true)
      })
      sendError ? setEmailSentError(true) : setEmailSent(true)
    } catch (e) {
      console.log(`error was ${e}`)
    }
    setIsEmailing(false)
  }

  // const sendMail = async () => {
  //   // console.log(emailItems())
  //   // await sendEmail(emailItems()).then((res) => {
  //   //   console.log(`email send return is: ${res}`)
  //   //   if (res) {
  //   //     setStep(2)
  //   //   } else setStep(3)
  //   // })
  // }

  const TemplateSelectedComponent = () => {
    return (
      <Box sx={{ marginTop: '0.25em', marginBottom: '0.5em' }}>
        <Typography variant="h5" component="h5">
          Template:{' '}
          <Box component="span" sx={{ fontWeight: 800 }}>
            {selectedTemplate}
          </Box>
        </Typography>
      </Box>
    )
  }

  const Step0 = () => {
    return (
      <Box>
        <EmailTemplateButtons
          selectedTemplate={selectedTemplate || ''}
          setSelectedTemplate={setSelectedTemplate}
        />
      </Box>
    )
  }

  const Step1 = () => {
    return (
      <Box>
        <TemplateSelectedComponent />
        <EmailPreview
          templateName={selectedTemplate}
          courseNames={courseNames}
        />
      </Box>
    )
  }

  /** Step 2
   *  Show email sent screen
   *  Close Button */
  const StepSent = () => {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: '40px',
          }}
        >
          <Typography variant="h5" fontWeight={'700'}>
            Email Sent! All done.
          </Typography>
        </Box>

        <Typography variant="body1" fontWeight={'700'}>
          Emails were successfully sent to the groups.
        </Typography>
      </>
    )
  }

  /** Step 3
   *  Show email send failure screen
   *  Try Again Button */
  const StepFailure = () => {
    return (
      <Box>
        <Typography variant="h5" component="h5" fontWeight={'700'}>
          Uh oh... Something went wrong when trying to send the email. Try to
          sign in one more time.{' '}
          <em> Will automatically attempt to send the email one more time. </em>
        </Typography>
        <Button
          onClick={() => {
            adminSignIn().then(() => sendEmails())
          }}
        >
          Try Again{' '}
        </Button>
      </Box>
    )
  }

  /** Step 4
   *  Show email send failure screen
   *  Try Again Button */
  const StepFinalFailure = () => {
    return (
      <Box>
        <Typography variant="h5" component="h5" fontWeight={'700'}>
          Failed again. Please attempt emailing manually. Sorry for the
          inconvience.
        </Typography>
        <Button
          onClick={() => {
            // adminSignIn().then(() => sendEmail())
            /**
             * TODO close button
             * */
          }}
        >
          Close{' '}
        </Button>
      </Box>
    )
  }

  const ProceedButton = () => {
    if (step === 0) {
      return (
        <Button
          onClick={() => {
            setStep(1)
          }}
          disabled={!selectedTemplate}
          sx={{ position: 'absolute', bottom: '24px', right: '24px' }}
        >
          Next
        </Button>
      )
    } else if (step === 2) {
      return (
        <Button
          onClick={() => {
            setIsEmailing(!isEmailing)
          }}
          sx={{ position: 'absolute', bottom: '24px', right: '24px' }}
        >
          Close
        </Button>
      )
    } else {
      return (
        <Button
          onClick={() => {
            // setIsEmailing(!isEmailing)
            sendEmails()
            console.log('sending email')
            // add something else here that actually sends the emails and a pop-up message saying that it's in-progress then done/fail etc.
          }}
          endIcon={<SendIcon />}
        >
          Send {selectedGroups.length} Emails
        </Button>
      )
    }
  }

  const BackButton = () => {
    if (step === 1) {
      return (
        <Button
          onClick={() => {
            setStep(0)
          }}
          color="inherit"
        >
          Back to templates
        </Button>
      )
    } else {
      return null
    }
  }

  return (
    <ZingModal
      open={isEmailing}
      onClose={() => setIsEmailing(!isEmailing)}
      containerWidth={'800px'}
      containerHeight={'630px'}
    >
      <ZingModal.Title onClose={() => setIsEmailing(!isEmailing)}>
        <Box display={'flex'} justifyContent={'center'} textAlign={'center'}>
          <Typography variant="h4" component="h4" fontWeight={'700'}>
            {title}
          </Typography>
        </Box>
      </ZingModal.Title>
      <ZingModal.Body>
        <Box sx={{ padding: '1rem 3.5rem 0 3.5rem' }}>
          {' '}
          <Typography
            variant="h5"
            component="h5"
            sx={{ display: 'flex', gap: 1 }}
          >
            <Box component="span">To:</Box>
            <Box component="span" sx={{ fontWeight: 900 }}>
              {selectedGroups
                .map(({ groupNumber }) => `Group ${groupNumber}`)
                .join(', ')}
            </Box>
          </Typography>
          {step === 0 && <Step0 />}
          {step === 1 && <Step1 />}
          {step === 2 && <StepSent />}
          {step === 3 && <StepFailure />}
          {step === 4 && <StepFinalFailure />}
        </Box>
      </ZingModal.Body>
      <ZingModal.Controls>
        <BackButton />
        <ProceedButton />
      </ZingModal.Controls>
    </ZingModal>
  )
}
