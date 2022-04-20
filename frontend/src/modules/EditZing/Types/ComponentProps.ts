import { GridSize } from '@mui/material'
import { Student } from './Student'

export interface UnmatchedGridProps {
  unmatchedStudents: Student[]
  moveStudent: (
    studentToMove: Student,
    fromGroupNumber: number,
    toGroupNumber: number
  ) => void
  matchStudents: () => void
}

export interface GroupGridProps {
  studentList: Student[]
  groupNumber: number
  moveStudent: (
    studentToMove: Student,
    fromGroupNumber: number,
    toGroupNumber: number
  ) => void
  createTime: Date
  updateTime: Date
}

export interface StudentGridProps {
  student: Student
  groupNumber: number
  xsSize?: GridSize
  submissionTime: Date
}

export interface MatchLoadingProps {
  showMatchLoading: boolean
  isCurrentlyGrouping: boolean
  numberGrouping: number
  courseNames: string[]
  setShowMatchLoading: (arg: boolean) => void
}
