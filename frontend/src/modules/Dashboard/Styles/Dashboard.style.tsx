import styled from 'styled-components'
import { ReactComponent as LogoImg } from '@assets/img/lscicon.svg'
// import { ReactComponent as NoClassesIcon } from '@assets/img/noclassesicon.svg'
import { BsChevronDown } from 'react-icons/bs'
import { colors, StyledComponent, h4, h3 } from '@core'

const Logo = LogoImg

// const NoClasses = NoClassesIcon

export const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${colors.lightpurple};
  box-shadow: -10px -10px 150px rgba(0, 0, 0, 0.05),
    10px 10px 150px rgba(0, 0, 0, 0.05);
  border-radius: 30px;

  display: flex;
  flex-direction: column;
`

export const StyledLogo = styled(Logo)``

export const StyledOuterContainer = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  padding: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const StyledHeaderMenu = styled.div`
  height: fit-content;

  padding: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const StyledName = styled.div`
  ${h4};
  font-weight: 600;
  color: ${colors.darkpurple};

  display: flex;
  align-items: center;
`

export const StyledArrowDown = styled(BsChevronDown)`
  margin-left: 0.2rem;
  cursor: pointer;
`

export const StyledModalContainer = styled.div`
  outline: 0;
  width: 80%;
  height: 95%;
  overflow: auto;
`
