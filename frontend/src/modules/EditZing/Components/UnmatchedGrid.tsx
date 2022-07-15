import { Box } from '@mui/material'
import StudentCard from 'EditZing/Components/StudentCard'
import Grid, { GridSize } from '@mui/material/Grid'
import { UnmatchedGridProps } from 'EditZing/Types/ComponentProps'
import {
  StyledUnmatchedContainer,
  StyledUnmatchedTextWrapper,
  StyledUnmatchedText,
} from 'EditZing/Styles/StudentAndGroup.style'
import { useDrop } from 'react-dnd'
import { DnDStudentTransferType, STUDENT_TYPE } from 'EditZing/Types/Student'
import { MatchButton } from './MatchButton'

/** Where unmatched students live in the grid */
export const UnmatchedGrid = ({
  courseId,
  unmatchedStudents,
  moveStudent,
  matchStudents,
  handleAddStudent,
}: UnmatchedGridProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: STUDENT_TYPE,
    drop: (item: DnDStudentTransferType) => {
      moveStudent(item.studentToMove, item.groupNumber, -1)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })
  const xsSize: GridSize = 1

  return (
    <Grid item xs={12}>
      <StyledUnmatchedContainer
        ref={drop}
        style={{ opacity: isOver ? '0.6' : '1' }}
      >
        <StyledUnmatchedTextWrapper>
          <StyledUnmatchedText>
            Unmatched Students ({unmatchedStudents.length})
          </StyledUnmatchedText>
          <MatchButton label="Match" onClick={matchStudents} />
        </StyledUnmatchedTextWrapper>
        <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: '8px' }}>
          {unmatchedStudents.map((student, index) => (
            <StudentCard
              key={index}
              courseId={courseId}
              groupNumber={-1}
              student={student}
              xsSize={xsSize}
              handleAddStudent={handleAddStudent}
            />
          ))}
        </Box>
      </StyledUnmatchedContainer>
    </Grid>
  )
}
