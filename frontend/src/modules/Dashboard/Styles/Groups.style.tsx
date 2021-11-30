import styled from 'styled-components'
import { ReactComponent as NoClassesIcon } from '@assets/img/noclassesicon.svg'
import { GenericHTMLProps, h2, StyledComponent, h3, h4 } from '@core'

const NoClasses = NoClassesIcon

export const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`

export const StyledTitle = styled.div`
  ${h2};
`

export const StyledGroupArea = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const StyledGroupCardArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`

export const StyledText = styled.div`
  ${h2};
  font-weight: 300;
  margin-top: 1rem;
`

export const StyledTextBox = styled.div`
  ${h4};
  text-align: center;
`

export const StyledSmallText = styled.div`
  ${h3};
  font-size: 1.3rem !important;
  width: 50%;
  height: 30%;
  word-wrap: break-word;
  margin: auto;
  text-align: center;
`
export const StyledClassesContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 5.5rem;
  flex-direction: row;
  flex-wrap: wrap;
`
export const StyledNoClasses = styled(NoClasses)`
  position: static;
  width: 295px;
  height: 300px;
  left: 0px;
  top: 0px;
  padding: 15px;
`