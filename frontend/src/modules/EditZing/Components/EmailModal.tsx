import { useState } from 'react'
import { ZingModal } from '@core/Components'
import { EmailModalProps } from '../Types/ComponentProps'
import { EmailModalContent } from './EmailModalContent'

export const EmailModal = ({
  selectedGroups,
  isEmailing,
  setIsEmailing,
}: EmailModalProps) => {
  return (
    // cannot use primarybutton props etc because of https://cornelldti.slack.com/archives/C03FG2U1V28/p1653692556464509
    // instead handle modal screen step transitions + buttons inside of child component
    <ZingModal
      open={isEmailing}
      onClose={() => setIsEmailing(!isEmailing)}
      containerWidth={'800px'}
      containerHeight={'550px'}
      children={<EmailModalContent selectedGroups={selectedGroups} />}
    />
  )
}
