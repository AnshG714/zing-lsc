import React, { useState, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import Grid from '@material-ui/core/Grid'
import {
  StyledContainer,
  StyledLogo,
  StyledLogoWrapper,
  StyledText,
} from 'EditZing/Styles/EditZing.style'
import { GroupGrid } from 'EditZing/Components/GroupGrid'
import { UnmatchedGrid } from './UnmatchedGrid'
import { Student } from 'EditZing/Types/Student'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  CourseInfo,
  CourseInfoResponse,
  CourseStudentDataResponse,
  Group,
} from 'EditZing/Types/CourseInfo'
import { API_ROOT, COURSE_API, MATCHING_API } from '@core/Constants'
import { useParams } from 'react-router-dom'

export const EditZing = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const [showError, setShowError] = useState(false)

  const [courseInfo, setCourseInfo] = useState<CourseInfo>()
  useEffect(() => {
    axios
      .get(`${API_ROOT}${COURSE_API}/${courseId}`)
      .then((res: AxiosResponse<CourseInfoResponse>) => {
        setCourseInfo(res.data.data)
      })
      .catch((error) => {
        console.error(error)
        setShowError(true)
      })
  }, [courseId])

  const [unmatchedStudents, setUnmatchedStudents] = useState<Student[]>([])
  const [studentGroups, setStudentGroups] = useState<Group[]>([])
  const [hasLoadedStudentData, setHasLoadedStudentData] = useState(false)
  useEffect(() => {
    axios
      .get(`${API_ROOT}${COURSE_API}/students/${courseId}`)
      .then((res: AxiosResponse<CourseStudentDataResponse>) => {
        setUnmatchedStudents(res.data.data.unmatched)
        setStudentGroups(res.data.data.groups)
        setHasLoadedStudentData(true)
      })
      .catch((error) => {
        console.error(error)
        setShowError(true)
      })
  }, [courseId])

  /** Add an unmatched student to a group */
  const moveStudentFromUnmatched = (
    student: Student,
    toGroupNumber: number
  ) => {
    setUnmatchedStudents(
      unmatchedStudents.filter((s) => s.email !== student.email)
    )
    setStudentGroups(
      studentGroups.map((group) =>
        group.groupNumber === toGroupNumber
          ? { ...group, memberData: [...group.memberData, student] }
          : group
      )
    )
    axios
      .post(`${API_ROOT}${MATCHING_API}/transfer/unmatched`, {
        courseId: courseId,
        studentEmail: student.email,
        groupNumber: toGroupNumber,
      })
      .catch((err) => console.error(err))
  }

  /** Move a student already in a group back to unmatched */
  const moveStudentToUnmatched = (
    student: Student,
    fromGroupNumber: number
  ) => {
    setUnmatchedStudents([...unmatchedStudents, student])
    setStudentGroups(
      studentGroups.map((group) =>
        group.groupNumber === fromGroupNumber
          ? {
              ...group,
              memberData: group.memberData.filter(
                (s) => s.email !== student.email
              ),
            }
          : group
      )
    )
    axios
      .post(`${API_ROOT}${MATCHING_API}/transfer/unmatch`, {
        courseId: courseId,
        studentEmail: student.email,
        groupNumber: fromGroupNumber,
      })
      .catch((err) => console.error(err))
  }

  /** Transfer a student from a group to another group */
  const moveStudentIntergroup = (
    student: Student,
    fromGroupNumber: number,
    toGroupNumber: number
  ) => {
    setStudentGroups(
      studentGroups.map((group) =>
        group.groupNumber === toGroupNumber
          ? { ...group, memberData: [...group.memberData, student] }
          : group.groupNumber === fromGroupNumber
          ? {
              ...group,
              memberData: group.memberData.filter(
                (s) => s.email !== student.email
              ),
            }
          : group
      )
    )
    axios
      .post(`${API_ROOT}${MATCHING_API}/transfer/intergroup`, {
        courseId: courseId,
        studentEmail: student.email,
        group1: fromGroupNumber,
        group2: toGroupNumber,
      })
      .catch((err) => console.error(err))
  }

  /** Move a student from some group (existing/unmatched) to a group */
  const moveStudent = (
    student: Student,
    fromGroupNumber: number,
    toGroupNumber: number
  ) => {
    if (fromGroupNumber !== toGroupNumber) {
      if (fromGroupNumber === -1) {
        moveStudentFromUnmatched(student, toGroupNumber)
      } else if (toGroupNumber === -1) {
        moveStudentToUnmatched(student, fromGroupNumber)
      } else {
        moveStudentIntergroup(student, fromGroupNumber, toGroupNumber)
      }
    }
  }

  return courseInfo && hasLoadedStudentData ? (
    <StyledContainer>
      <StyledLogoWrapper>
        <StyledLogo />
        <StyledText>{courseInfo.names.join(', ')}</StyledText>
      </StyledLogoWrapper>
      <DndProvider backend={HTML5Backend}>
        <Grid container spacing={1}>
          <UnmatchedGrid
            unmatchedStudents={unmatchedStudents}
            moveStudent={moveStudent}
          />
          {studentGroups.map((studentGroup, index) => (
            <GroupGrid
              key={index}
              studentList={studentGroup.memberData}
              groupNumber={studentGroup.groupNumber}
              moveStudent={moveStudent}
            />
          ))}
        </Grid>
      </DndProvider>
    </StyledContainer>
  ) : showError ? (
    <StyledContainer>
      <StyledText>Error: unable to edit course with id {courseId}</StyledText>
    </StyledContainer>
  ) : (
    <StyledContainer>
      <StyledText>Loading...</StyledText>
    </StyledContainer>
  )
}