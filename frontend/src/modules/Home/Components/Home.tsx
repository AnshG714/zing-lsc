import React from 'react'
import { useHistory } from 'react-router-dom'
import {
  StyledBackground,
  StyledContainer,
  StyledHeaderText,
  StyledLeftPanel,
  StyledRightPanel,
  StyledWelcomeText,
  StyledWhiteActionText,
} from 'Home/Styles/Home.style'
import Button from '@mui/material/Button'
import { signInWithGoogle, signInWithMicrosoft } from '@fire'
import { ReactComponent as Google } from '@assets/img/googleicon.svg'
import { ReactComponent as Microsoft } from '@assets/img/microsofticon.svg'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import { Box } from '@mui/material'
import teacher from '@assets/img/teacher.svg'

function GoogleIcon(props: SvgIconProps) {
  return <SvgIcon inheritViewBox component={Google} {...props} />
}

function MicrosoftIcon(props: SvgIconProps) {
  return <SvgIcon inheritViewBox component={Microsoft} {...props} />
}

export const Home = () => {
  const history = useHistory()
  return (
    <StyledBackground>
      <StyledContainer>
        <StyledLeftPanel>
          <StyledWhiteActionText>
            Connect students, create groups
          </StyledWhiteActionText>
          <Box sx={{ maxWidth: '100%', mt: 8 }}>
            <img src={teacher} alt="teacher" width="100%" />
          </Box>
        </StyledLeftPanel>
        <StyledRightPanel>
          <Box display="flex" flexDirection="column" mt={-10} zIndex={1}>
            <StyledHeaderText>Hi,</StyledHeaderText>
            <StyledWelcomeText>
              Let's form study partner groups!
            </StyledWelcomeText>
          </Box>
          {/* <Box sx={{ zIndex: 2 }}>
            <Button
              startIcon={<GoogleIcon />}
              sx={{
                pl: 3,
                background:
                  'linear-gradient(288.93deg, #C693EE 2.66%, #7C5ED3 69.33%)',
                fontSize: { sm: 14, md: 22 },
              }}
              onClick={() => {
                signInWithGoogle().then(() => {
                    history.push('/dashboard')
                  }).catch(() => {})
              }}
            >
              Log In with Google
            </Button>
          </Box> */}
          <Box sx={{ zIndex: 2 }}>
            <Button
              startIcon={<MicrosoftIcon />}
              sx={{
                px: 3,
                background:
                  'linear-gradient(288.93deg, #C693EE 2.66%, #7C5ED3 69.33%)',
                fontSize: { sm: 14, md: 22 },
              }}
              onClick={() => {
                signInWithMicrosoft()
                  .then(() => {
                    history.push('/dashboard')
                  })
                  .catch(() => {})
              }}
            >
              Staff Login
            </Button>
          </Box>
        </StyledRightPanel>
      </StyledContainer>
    </StyledBackground>
  )
}
