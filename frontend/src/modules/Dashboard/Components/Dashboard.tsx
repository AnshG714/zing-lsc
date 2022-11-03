import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { ReactComponent as LogoImg } from '@assets/img/lscicon.svg'
import {
  StyledContainer,
  StyledHeaderMenu,
} from 'Dashboard/Styles/Dashboard.style'
import { CourseGrid } from 'Dashboard/Components/CourseGrid'
import { KeyboardArrowDown } from '@mui/icons-material'
import { logOut } from '@fire'
import { useAuthValue } from '@auth'
import { Box, IconButton, SelectChangeEvent } from '@mui/material'
import { DropdownSelect } from '@core/Components'
import { useCourseValue } from '@context/CourseContext'
import { useStudentValue } from '@context/StudentContext'
import { Course } from '@core/Types'
import { CSVLink } from 'react-csv'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ClearIcon from '@mui/icons-material/Clear'

type SortOrder = 'newest-requests-first' | 'classes-a-z' | 'classes-z-a'
type FilterOption =
  | 'no-filter'
  | 'unmatchable'
  | 'newly-matchable'
  | 'matchable'
  | 'no-check-in-email'
  | 'no-no-match-email'

export const Dashboard = () => {
  const { user } = useAuthValue()
  const { courses } = useCourseValue()
  const { students } = useStudentValue()
  const [filteredOption, setFilteredOption] = useState<FilterOption>(
    'no-filter'
  )
  const [sortedOrder, setSortedOrder] = useState<SortOrder>(
    'newest-requests-first'
  )
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const csvCourses = courses.map((course) => ({
    semester: course.roster,
    course: course.names.join('/'),
  }))

  //this can be removed if there is a place to store an objectMap() function
  const localeMap = (obj: { [key: string]: Date } | undefined) => {
    if (!obj) {
      return undefined
    }
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v.toLocaleString()])
    )
  }

  const csvStudents =
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
              dateRequested: membership.submissionTime.toLocaleString(),
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
              notes: membership.notes,
            }
          })
        )
      : []

  const [rostorAnchorEl, setRosterAnchorEl] = useState<null | HTMLElement>(null)
  const openRoster = Boolean(rostorAnchorEl)
  const handleRosterClick = (event: React.MouseEvent<HTMLElement>) => {
    setRosterAnchorEl(event.currentTarget)
  }
  const handleRosterClose = () => {
    setRosterAnchorEl(null)
  }

  //Helper function to check if a given course has any groups without check-in emails
  function hasUnsentCheckIns(c: Course) {
    return c.groups.some((group) => !group.templateTimestamps['check-in'])
  }

  //Helper function that returns true if the student doesn't have a no match email
  function studentHasUnsentNoMatch(smail: string, courseId: string) {
    const student = students.find((s) => s.email === smail)
    if (!student) {
      throw Error(`Student with email ${smail} not found`)
    }
    const group = student.groups.find((g) => g.courseId === courseId)
    if (!group) {
      throw Error(`Student with email ${smail} not found in course ${courseId}`)
    }
    return !group.templateTimestamps['no-match-yet']
  }

  //Helper function that returns true if an unmatched student in a course doesn't have a no match email
  function hasUnsentNoMatch(c: Course) {
    return c.unmatched.some((email) =>
      studentHasUnsentNoMatch(email, c.courseId)
    )
  }
  // (a,b) = -1 if a before b, 1 if a after b, 0 if equal
  function filtered(courseInfo: Course[], menuValue: FilterOption) {
    switch (menuValue) {
      case 'no-filter':
        return courseInfo
      case 'unmatchable':
        return [...courseInfo].filter(
          (course, _) =>
            course.lastGroupNumber === 0 && course.unmatched.length === 1
        )
      case 'newly-matchable':
        return [...courseInfo].filter(
          (course, _) =>
            course.lastGroupNumber === 0 && course.unmatched.length > 1
        )
      case 'matchable':
        return [...courseInfo].filter(
          (course, _) =>
            (course.lastGroupNumber > 0 && course.unmatched.length > 0) ||
            (course.lastGroupNumber === 0 && course.unmatched.length > 1)
        )
      case 'no-check-in-email':
        return courseInfo.filter(hasUnsentCheckIns)
      case 'no-no-match-email':
        return courseInfo.filter(hasUnsentNoMatch)
      default:
        return courseInfo
    }
  }
  // (a,b) = -1 if a before b, 1 if a after b, 0 if equal
  function sorted(courseInfo: Course[], menuValue: SortOrder) {
    switch (menuValue) {
      case 'newest-requests-first':
        return [...courseInfo].sort(
          (a, b) =>
            b.latestSubmissionTime.valueOf() - a.latestSubmissionTime.valueOf()
        )
      case 'classes-a-z':
        return [...courseInfo].sort((a, b) => {
          return a.names[0].localeCompare(b.names[0], undefined, {
            numeric: true,
          })
        })
      case 'classes-z-a':
        return [...courseInfo].sort((a, b) => {
          return b.names[0].localeCompare(a.names[0], undefined, {
            numeric: true,
          })
        })
      default:
        return courseInfo
    }
  }

  const handleSortedChange = (event: SelectChangeEvent) => {
    setSortedOrder(event.target.value as SortOrder)
  }
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilteredOption(event.target.value as FilterOption)
  }

  const [selectedRoster, setSelectedRoster] = useState<string>('FA22')

  const [message, setMessage] = useState('')

  const handleSearch = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setMessage(event.target.value)
    console.log('search is:', event.target.value)
  }

  const filteredCourses = filtered(
    sorted(
      courses.filter((c) => c.roster === selectedRoster),
      sortedOrder
    ),
    filteredOption
  ).filter((d) =>
    d.names.find((e) => {
      return e.includes(message.toUpperCase())
    })
  )

  return (
    <StyledContainer>
      <StyledHeaderMenu>
        <LogoImg />

        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box
                sx={{
                  fontWeight: 'bold',
                  color: 'essentials.75',
                  padding: 1,
                  margin: 1,
                }}
              >
                Filter:
              </Box>
              <DropdownSelect
                value={filteredOption}
                onChange={handleFilterChange}
                sx={{
                  padding: 0,
                  margin: 0,
                  fontWeight: 'bold',
                  maxWidth: '250px',
                }}
              >
                <MenuItem value="no-filter">None</MenuItem>
                <MenuItem value="unmatchable">Unmatchable</MenuItem>
                <MenuItem value="newly-matchable">Newly matchable</MenuItem>
                <MenuItem value="matchable">Matchable</MenuItem>

                <MenuItem value="no-check-in-email">
                  Unsent Check-in Emails
                </MenuItem>
                <MenuItem value="no-no-match-email">
                  Unsent No Match Emails
                </MenuItem>
              </DropdownSelect>
            </Box>

            <Box
              sx={{
                fontWeight: 'bold',
                color: 'essentials.75',
                padding: 1,
                margin: 1,
                maxWidth: '300px',
              }}
            >
              Sort:
            </Box>
            <DropdownSelect
              value={sortedOrder}
              onChange={handleSortedChange}
              sx={{
                padding: 0,
                margin: 0,
                fontWeight: 'bold',
                maxWidth: '250px',
              }}
            >
              <MenuItem value="newest-requests-first">
                Newest requests first
              </MenuItem>
              <MenuItem value="classes-a-z">Classes A-Z</MenuItem>
              <MenuItem value="classes-z-a">Classes Z-A</MenuItem>
            </DropdownSelect>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box
              sx={{
                fontWeight: 'bold',
                color: 'essentials.75',
                padding: 1,
                margin: 1,
              }}
            >
              Search:
            </Box>
            <TextField
              id="search-bar"
              label="Search for a course"
              variant="outlined"
              sx={{
                padding: 0,
                margin: 0,
                width: 200,
                maxWidth: '250px',
              }}
              value={message}
              onChange={handleSearch}
              InputProps={{
                endAdornment: message ? (
                  <IconButton size="small" onClick={() => setMessage('')}>
                    <ClearIcon />
                  </IconButton>
                ) : undefined,
              }}
            />
          </Box>
        </Box>
        <Button
          id="logout-button"
          aria-controls="logout-menu"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          endIcon={<KeyboardArrowDown />}
          variant="text"
          disableRipple
        >
          {user?.displayName}
        </Button>
        <Menu
          id="logout-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'logout-button',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <CSVLink data={csvCourses} filename={`export-courses-${Date.now()}`}>
            <MenuItem>Export CSV (Courses)</MenuItem>
          </CSVLink>
          <CSVLink
            data={csvStudents}
            filename={`export-students-${Date.now()}`}
          >
            <MenuItem>Export CSV (Students)</MenuItem>
          </CSVLink>
          <MenuItem onClick={handleRosterClick}>
            <ChevronLeftIcon sx={{ color: 'essentials.75', ml: -1 }} />
            Switch Semester
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose()
              logOut()
            }}
          >
            Log Out
          </MenuItem>
        </Menu>
        <Menu
          anchorEl={rostorAnchorEl}
          open={openRoster}
          onClick={handleRosterClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            mt: -1.5,
          }}
        >
          <MenuItem onClick={() => setSelectedRoster('SU22')}>
            Summer 2022
          </MenuItem>
          <MenuItem onClick={() => setSelectedRoster('FA22')}>
            Fall 2022
          </MenuItem>
          <MenuItem onClick={() => setSelectedRoster('WI22')}>
            Winter 2022
          </MenuItem>
          <MenuItem onClick={() => setSelectedRoster('SP23')}>
            Spring 2023
          </MenuItem>
        </Menu>
      </StyledHeaderMenu>
      <CourseGrid courses={filteredCourses} />
    </StyledContainer>
  )
}
