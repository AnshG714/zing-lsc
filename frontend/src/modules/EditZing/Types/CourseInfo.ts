import { string } from 'prop-types'
import { ResponseStudent, Student } from './Student'

// This interface does not contain all of the fields that are returned
export interface CourseInfo {
  roster: string
  names: string[]
  unmatched: string[]
}

export interface Timestamp {
  template: string
  timestamp: Date
}

export interface Group {
  groupNumber: number
  memberData: Student[]
  createTime: Date
  updateTime: Date
  templateTimestamps: {[key: string]: Date}
}

export interface ResponseGroup {
  groupNumber: number
  memberData: ResponseStudent[]
  createTime: string
  updateTime: string
  templateTimestamps: {[key: string]: string}
}

export interface CourseInfoResponse {
  success: boolean
  data: CourseInfo
}

export interface CourseStudentDataResponse {
  success: boolean
  data: {
    unmatched: ResponseStudent[]
    groups: ResponseGroup[]
  }
}

export type TemplateDataResponse = {
  id: string
  name: string
  type: 'group' | 'student'
  subject: string
  body: string
  modifyTime: Date
}[]