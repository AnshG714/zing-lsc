import React from 'react'
import {
  IconButton,
  Box,
  TextField,
  InputLabel,
  FormHelperText,
} from '@mui/material'
import { ArrowForward } from '@mui/icons-material'
import {
  StyledContainer,
  StyledLeftPanel,
  StyledRightPanel,
  StyledFields,
  StyledWhiteActionText,
  StyledTeamPic,
  StyledTitleWrapper,
  StyledHeaderText,
  StyledWelcomeText,
  StyledErrorText,
} from 'Survey/Styles/StepBegin.style'
import { StyledLabelText } from 'Survey/Styles/Survey.style'
import { StepBeginProps } from 'Survey/Types'

export const StepBegin = ({
  name,
  email,
  setName,
  setEmail,
  gotoNextStep,
}: StepBeginProps) => {
  const textInputStyle = {
    marginBottom: '1rem',
    input: { color: 'purple.120', fontSize: '24px', fontWeight: '500' },
    '& .MuiInput-underline:before': { borderBottomColor: 'purple.75' },
  }

  const [isValidEmail, setIsValidEmail] = React.useState(true)
  const validEmail = /^\w+@cornell.edu$/

  return (
    <StyledContainer>
      <StyledLeftPanel>
        <StyledWhiteActionText>
          LSC can help match you with study partners for your classes!
        </StyledWhiteActionText>
        <StyledTeamPic />
      </StyledLeftPanel>
      <StyledRightPanel>
        <main>
          <StyledTitleWrapper>
            <StyledHeaderText>Hi,</StyledHeaderText>
            <StyledWelcomeText>Find study partners!</StyledWelcomeText>
          </StyledTitleWrapper>

          <StyledFields>
            <InputLabel htmlFor="user name">
              {' '}
              <StyledLabelText> Name: </StyledLabelText>{' '}
            </InputLabel>
            <TextField
              id="user name"
              variant="standard"
              aria-label="user name"
              placeholder="Martha E. Pollack"
              // variant="standard"
              sx={textInputStyle}
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
            <InputLabel htmlFor="user email">
              {' '}
              <StyledLabelText> Email: </StyledLabelText>{' '}
            </InputLabel>
            <TextField
              id="user email"
              variant="standard"
              aria-label="user email"
              value={email}
              sx={textInputStyle}
              type="email"
              onBlur={() => setIsValidEmail(validEmail.test(email))}
              placeholder="mep22@cornell.edu"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              error={!isValidEmail}
            />
            <FormHelperText id="email-helper-text" sx={{ fontColor: 'red' }}>
              {' '}
              <StyledErrorText>
                {isValidEmail ? ' ' : 'Invalid Email'}
              </StyledErrorText>
            </FormHelperText>
          </StyledFields>
          <Box
            sx={{
              marginLeft: 'auto',
              textAlign: 'center',
              color: 'purple.100',
              weight: 600,
            }}
          >
            <IconButton
              className="next"
              onClick={gotoNextStep}
              disabled={name === '' || email === '' || !isValidEmail}
              sx={{ boxShadow: 3 }}
              aria-label="Next button"
            >
              <ArrowForward />
            </IconButton>
            <br />
            Next
          </Box>
        </main>
      </StyledRightPanel>
    </StyledContainer>
  )
}
