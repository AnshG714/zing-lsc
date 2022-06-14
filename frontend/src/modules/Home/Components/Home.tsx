import {
  StyledBackground,
  StyledLeftPanel,
  StyledRightPanel,
  StyledWhiteActionText,
} from 'Home/Styles/Home.style'
import { adminSignIn } from '@fire'
import { Box, Button, Typography } from '@mui/material'
import matchimg from '@assets/img/matching.svg'
import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <StyledBackground>
      <StyledLeftPanel>
        <Typography
          variant="h2"
          fontWeight={'600'}
          component="h1"
          sx={{ textAlign: 'left', mb: '3rem', color: 'white' }}
        >
          Connect students. <br />
          Create groups.
        </Typography>
        <Button
          color="secondary"
          variant="outlined"
          sx={{
            width: '14em',
            fontSize: { sm: 14, md: 22 },
            mb: '1em',
          }}
          onClick={() => {
            adminSignIn().catch(() => {})
          }}
        >
          LSC Admin Login
        </Button>
        <Button
          variant="outlined"
          component={Link}
          to="/survey"
          color="primary"
          sx={{
            width: '14em',
            fontSize: { sm: 14, md: 22 },
          }}
        >
          I'm a Student
        </Button>
      </StyledLeftPanel>
      <StyledRightPanel>
        <Box sx={{ mt: '12rem' }}>
          <img src={matchimg} alt="matching" width="65%" />
        </Box>
      </StyledRightPanel>
    </StyledBackground>
  )
}
