import React, { FunctionComponent } from 'react'
import { StepTemplateProps } from 'Survey/Types'
import {
  StyledWrapper,
  StyledFullPanel,
} from 'Survey/Styles/StepTemplate.style'
import { ProgressBar } from '@core/Components/index'
import { IconButton, Box } from '@mui/material'
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material'

export const StepTemplate: FunctionComponent<StepTemplateProps> = ({
  isStepValid,
  stepNumber,
  totalSteps,
  gotoPrevStep,
  gotoNextStep,
  children,
  setShowError,
}) => {
  const handlePrev = () => {
    setShowError(false)
    gotoPrevStep()
  }

  const handleNext = () => {
    if (isStepValid) {
      setShowError(false)
      gotoNextStep()
    } else {
      setShowError(true)
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        width: '80%',
        height: '90%',
      }}
    >
      <ProgressBar step={stepNumber} total={totalSteps} />
      <StyledFullPanel>
        <StyledWrapper style={{ height: '85%', overflow: 'scroll' }}>
          {children}
        </StyledWrapper>

        <StyledWrapper
          style={{ height: '15%', color: '#815ed4', margin: '0% 2%' }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <IconButton className="next" onClick={handlePrev} color="secondary">
              <ArrowBack />
            </IconButton>
            <br />
            Prev
          </Box>

          <Box sx={{ marginLeft: 'auto', textAlign: 'center' }}>
            <IconButton
              className="next"
              onClick={handleNext}
              disabled={!isStepValid}
            >
              {stepNumber === totalSteps ? <Check /> : <ArrowForward />}
            </IconButton>
            <br />
            {stepNumber === totalSteps ? 'Finish!' : 'Next'}
          </Box>
        </StyledWrapper>
      </StyledFullPanel>
    </Box>
  )
}
