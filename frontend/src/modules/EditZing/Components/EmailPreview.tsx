import { getBody } from '../utils/emailTemplates'
import { EmailPreviewProps } from 'EditZing/Types/ComponentProps'
import { Box } from '@mui/material'
import { Typography } from '@mui/material'
import { SxProps } from '@mui/material'

export const EmailPreview = ({ template, courseNames }: EmailPreviewProps) => {
  const TitleSx: SxProps = {
    color: 'essentials.6',
    backgroundColor: 'essentials.75',
    borderBottom: '0.5px solid #898992;',
    border: '0.5px solid',
    borderColor: 'essentials.50',
    padding: '16px',
    fontWeight: '900',
    borderRadius: '5px 5px 0px 0px;',
  }
  const BodyAndSubjectSx: SxProps = {
    color: 'essentials.75',
    backgroundColor: 'essentials.6',
    border: '0.5px solid',
    borderBottom: '0.5px solid #898992;',
    borderColor: 'essentials.50',
    padding: '16px',
  }

  // const body = getBody(templateName, courseNames.join(', '))
  const body = template.html
  return (
    <Box>
      <Box sx={TitleSx}>Email Preview</Box>
      <Box
        sx={{
          fontWeight: '900',
          ...BodyAndSubjectSx,
        }}
      >
        <Box display={'flex'} flexDirection={'row'}>
          <Typography fontWeight={800}>Subject: </Typography>&nbsp;
          <Typography>Study Partners!</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          maxHeight: '250px',
          overflowY: 'scroll',
          borderRadius: '0px 0px 5px 5px;',
          ...BodyAndSubjectSx,
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: body }}></div>
      </Box>
    </Box>
  )
}
