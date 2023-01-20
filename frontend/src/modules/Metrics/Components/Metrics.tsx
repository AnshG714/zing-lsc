import { useState } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { ReactComponent as LogoImg } from '@assets/img/lscicon.svg'
import { useCourseValue } from '@context/CourseContext'
import { useStudentValue } from '@context/StudentContext'
import { AccountMenu } from 'Dashboard/Components/AccountMenu'
import { Box, IconButton, SelectChangeEvent } from '@mui/material'
import { StatGrid } from './StatGrid'
import { MetricsTable } from './MetricsTable'
import { DropdownSelect } from '@core/Components'
import { DASHBOARD_PATH } from '@core/Constants'
import { Link } from 'react-router-dom'

export const Metrics = () => {
  const { courses } = useCourseValue()
  const { students } = useStudentValue()

  function isDateInThisWeek(date: Date) {
    const todayObj = new Date()
    const todayDate = todayObj.getDate()
    const todayDay = todayObj.getDay()
    // get first date of week
    const firstDayOfWeek = new Date(todayObj.setDate(todayDate - todayDay))
    // get last date of week
    const lastDayOfWeek = new Date(firstDayOfWeek)
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6)
    // if date is equal or within the first and last dates of the week
    return date >= firstDayOfWeek && date <= lastDayOfWeek
  }

  const collegeAbbreviations = require('@core/Questions/Questions.json')[0][
    'answers'
  ]
  const numStudentsInWeek = students.map((student) =>
    student.groups.filter((membership) =>
      isDateInThisWeek(membership.submissionTime)
    )
  )
  //calculate number of unique students who have made requests
  const numStudents = {
    number: students.length,
    title: 'UNIQUE STUDENTS',
    subtitle: 'made requests',
    thisWeek: numStudentsInWeek.length,
    showAdded: true,
  }
  const coursesInWeek: string[] = []

  numStudentsInWeek.forEach((member) => {
    member.forEach((memberships) => {
      if (coursesInWeek.indexOf(memberships.courseId) === -1) {
        coursesInWeek.push(memberships.courseId)
      }
    })
  })
  //calculate number of unique courses that have received requests
  const numCourses = {
    number: courses.length,
    title: 'UNIQUE COURSES',
    subtitle: 'received requests',
    thisWeek: coursesInWeek.length,
    showAdded: true,
  }
  //calculate total number of requests made by students
  const numRequests = {
    number: students.reduce(
      (total, student) => total + student.groups.length,
      0
    ),
    title: 'REQUESTS',
    subtitle: 'made in total',
    thisWeek: students.reduce(
      (total, student) =>
        total +
        student.groups.filter((membership) =>
          isDateInThisWeek(membership.submissionTime)
        ).length,
      0
    ),
    showAdded: true,
  }

  //calculate number of students matched into groups
  const numMatches = {
    number: courses.reduce(
      (courseTotal, course) =>
        courseTotal +
        course.groups.reduce(
          (groupTotal, group) => groupTotal + group.members.length,
          0
        ),
      0
    ),
    title: 'MATCHES',
    subtitle: 'made in total',
    thisWeek: 0,
    showAdded: false,
  }

  //calculate number of students matched into groups
  const numGroups = {
    number: courses.reduce((total, course) => total + course.groups.length, 0),
    title: 'GROUPS',
    subtitle: 'successfully made',
    thisWeek: 0,
    showAdded: false,
  }

  const stats = [numStudents, numRequests, numCourses, numMatches, numGroups]

  //this can be removed if there is a place to store an objectMap() function
  const localeMap = (obj: { [key: string]: Date } | undefined) => {
    if (!obj) {
      return undefined
    }
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v.toLocaleString()])
    )
  }

  const allStudents =
    courses.length && students.length // Just making sure this isn't calculated until the data is available
      ? students.flatMap((student) =>
          student.groups.map((membership) => {
            const course = courses.find(
              (c) => c.courseId === membership.courseId
            )!
            const group = course.groups.find(
              // undefined if student is unmatched
              (g) => g.groupNumber === membership.groupNumber
            )
            return {
              semester: course.roster,
              cornellEmail: student.email,
              name: student.name,
              college: student.college,
              year: student.year,
              course: course.names.join('/'),
              groupNumber:
                membership.groupNumber !== -1
                  ? `${course.names.join('/')}_${membership.groupNumber}`
                  : undefined,
              ...localeMap(group?.templateTimestamps),
              ...localeMap(membership.templateTimestamps),
            }
          })
        )
      : []
  const getUniqueValues = (arr: any) => {
    return arr.filter(
      (value: any, index: any, self: string | any[]) =>
        self.indexOf(value) === index
    )
  }
  const [selectedRoster, setSelectedRoster] = useState<string>('SP23')
  const chosenSemesterStudents = allStudents.filter(
    (e) => e.semester === selectedRoster
  )
  const collegeNames = getUniqueValues(allStudents.map((s) => s.college))

  const calculateStats = (college: string) => {
    const specificCollegeStudents = chosenSemesterStudents.filter(
      (s) => s.college === college
    )
    const uniqueStudents = getUniqueValues(
      specificCollegeStudents.map((s) => s.name)
    )
    const matches = specificCollegeStudents.reduce(
      (total, student) => (student?.groupNumber ? total + 1 : total),
      0
    )
    const createdGroups = specificCollegeStudents.filter((student) => {
      return student.groupNumber !== undefined
    })
    const groups = getUniqueValues(createdGroups.map((s) => s.groupNumber))
    return {
      rowName: collegeAbbreviations[college],
      students: uniqueStudents.length,
      requests: specificCollegeStudents.length,
      matches: matches,
      groups: groups.length,
    }
  }
  const handleSemesterChange = (event: SelectChangeEvent) => {
    setSelectedRoster(event.target.value)
  }

  return (
    <Box
      sx={{ pl: '5rem', pr: '5rem', display: 'flex', flexDirection: 'column' }}
    >
      <Box
        sx={{
          width: '100%',
          height: 'fit-content',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <IconButton
          color="secondary"
          component={Link}
          to={{
            pathname: DASHBOARD_PATH,
          }}
          sx={{
            border: 'none',
            alignSelf: 'flex-start',
          }}
          disableRipple
          disableFocusRipple
        >
          <LogoImg />
        </IconButton>

        <AccountMenu
          selectedRoster={selectedRoster}
          setSelectedRoster={setSelectedRoster}
          showMetricsLink={false}
          showDashboardLink={true}
        />
      </Box>
      <Box
        sx={{
          typography: 'h5',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Summary
      </Box>
      <StatGrid stats={stats} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          pl: '2rem',
          pr: '2rem',
        }}
      >
        <Box
          sx={{
            typography: 'h6',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          By College
        </Box>
        <DropdownSelect
          value={selectedRoster}
          onChange={handleSemesterChange}
          sx={{
            fontWeight: 'bold',
            alignSelf: 'flex-end',
          }}
        >
          <MenuItem value="SU22">Summer 2022</MenuItem>
          <MenuItem value="FA22">Fall 2022</MenuItem>
          <MenuItem value="WI23">Winter 2023</MenuItem>
          <MenuItem value="SP23">Spring 2023</MenuItem>
          <MenuItem value="SU23">Summer 2023</MenuItem>
        </DropdownSelect>
      </Box>
      <MetricsTable
        data={collegeNames.map((college: string) => calculateStats(college))}
      />
    </Box>
  )
}