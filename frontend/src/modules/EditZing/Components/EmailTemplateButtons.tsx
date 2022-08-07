import { Box, Typography } from '@mui/material'
import { RadioButtons } from '@core/Components'
import { TemplateName } from 'EditZing/utils/emailTemplates'
import { TemplateRadioButtonsProps } from 'EditZing/Types/ComponentProps'
import { useState } from 'react'

export const EmailTemplateButtons = ({
  templates,
  selectedTemplate,
  setSelectedTemplate,
}: TemplateRadioButtonsProps) => {
  // we could include all, but designers advise to limit it to just these few for now
  // const activeTemplates = [
  //   TemplateName.MATCHED,
  //   TemplateName.CHECK_IN,
  //   TemplateName.ADD_STUDENT,
  // ]

  const [templateName, setTemplateName] = useState('')
  const templateNames = templates.map((template) => template.name)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const choice = event.target.value
    setTemplateName(choice)
    templates.forEach((template) => {
      if (template.name === choice) {
        setSelectedTemplate(template)
      }
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mt: '40px',
      }}
    >
      <Typography variant="h5" component="h5" fontWeight="800" mb="12px">
        Use an existing template:
      </Typography>
      <RadioButtons
        values={templateNames}
        onClick={handleChange}
        currentAnswer={templateName}
      />
    </Box>
  )
}
