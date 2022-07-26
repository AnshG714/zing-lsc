import { useEffect, useState } from 'react'
import axios, { AxiosResponse } from 'axios'
import { getDownloadURL, ref } from 'firebase/storage'
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { templatesBucket } from '@fire/firebase'
import { API_ROOT, EMAIL_PATH } from '@core/Constants'
import {
  EmailTemplate,
  EmailTemplatesResponse,
  responseEmailTemplateToEmailTemplate,
} from '@core/Types'

export const TemplateEditor = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const [templateName, setTemplateName] = useState('')
  const [templateType, setTemplateType] = useState<'group' | 'student'>('group')
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateHtml, setTemplateHtml] = useState('')

  const resetForm = (template: EmailTemplate) => {
    setTemplateName(template.name)
    setTemplateType(template.type)
    setTemplateSubject(template.subject)
    setTemplateHtml(template.html)
  }

  const changeSelectedTemplate = (template: EmailTemplate) => {
    // Don't reset form if currently selected list item is clicked
    if (template.id !== selectedTemplateId) {
      setSelectedTemplateId(template.id)
      resetForm(template)
    }
  }

  useEffect(() => {
    axios
      .get(`${API_ROOT}${EMAIL_PATH}/templates`)
      .then(async (res: AxiosResponse<EmailTemplatesResponse>) => {
        const templates = await Promise.all(
          res.data.data
            .map(responseEmailTemplateToEmailTemplate)
            .map(async (template) => {
              // Download the HTML for the email body in Cloud Storage bucket
              const url = await getDownloadURL(
                ref(templatesBucket, template.body)
              )
              const html = (await axios.get(url)).data as string
              return { ...template, html }
            })
        )
        setTemplates(templates)
        const mostRecentModifiedTemplate = templates.reduce((p, c) =>
          p.modifyTime.valueOf() > c.modifyTime.valueOf() ? p : c
        )
        setSelectedTemplateId(mostRecentModifiedTemplate.id)
        resetForm(mostRecentModifiedTemplate)
      })
      .catch((error) => console.error(error))
  }, [])

  return (
    <Box p={4}>
      <Typography variant="h4" component="h1" mb={4}>
        Template Editor
      </Typography>
      <Box component="main" display="flex" gap={4}>
        <List sx={{ minWidth: 400 }}>
          {[...templates]
            .sort((a, b) => b.modifyTime.valueOf() - a.modifyTime.valueOf())
            .map((template) => (
              <ListItemButton
                key={template.id}
                selected={template.id === selectedTemplateId}
                onClick={() => changeSelectedTemplate(template)}
              >
                <ListItemText>{template.name}</ListItemText>
              </ListItemButton>
            ))}
        </List>
        <Box
          component="form"
          display="grid"
          gridTemplateColumns="1fr 1fr"
          rowGap={2}
          columnGap={4}
          flexGrow={1}
        >
          <TextField
            label="Template Name"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            sx={{ gridColumn: 1 }}
          />
          <TextField
            label="Type"
            select
            value={templateType}
            onChange={(event) =>
              setTemplateType(event.target.value as 'group' | 'student')
            }
            sx={{ gridColumn: 1 }}
          >
            <MenuItem value="group">
              Group (shared email to all group members)
            </MenuItem>
            <MenuItem value="student">Student (one email per student)</MenuItem>
          </TextField>
          <TextField
            label="Email Subject"
            value={templateSubject}
            onChange={(event) => setTemplateSubject(event.target.value)}
            sx={{ gridColumn: 1 }}
          />
          <Box sx={{ gridColumn: 2, alignSelf: 'center', display: 'flex' }}>
            <Typography sx={{ fontWeight: 'bold', mr: 1 }}>Subject:</Typography>
            <Typography>{templateSubject}</Typography>
          </Box>
          <TextField
            label="Email Body (HTML)"
            multiline
            minRows={10}
            value={templateHtml}
            onChange={(event) => setTemplateHtml(event.target.value)}
            sx={{ gridColumn: 1 }}
            InputProps={{ sx: { fontFamily: 'monospace' } }}
          />
          <Box sx={{ gridColumn: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Body:</Typography>
            <Typography
              dangerouslySetInnerHTML={{ __html: templateHtml }}
              sx={{ gridColumn: 2 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
