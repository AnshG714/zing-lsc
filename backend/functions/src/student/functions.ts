import { db } from '../config'
import admin from 'firebase-admin'
const courseR = db.collection('courses')
const studentR = db.collection('students')
import mapCatalogNameToCourseId from '../course/get_course_id'

async function removeStudentFromCourse(
  email: any,
  courseId: string,
  groupNumber: any
) {
  const ref = courseR
    .doc(courseId)
    .collection('groups')
    .doc(groupNumber.toString())
  const data: any = (await ref.get()).data()
  if (data.members.length === 1 && data.members.includes(email)) {
    //second condition is a sanity check
    return ref.delete()
  } else {
    return ref.update({
      members: admin.firestore.FieldValue.arrayRemove(email),
    })
  }
}

// Note: the error handling in this file is done the way it is so it is easier
// to decide response codes based on error type.
const addStudentSurveyResponse = async (
  name: string,
  email: string,
  college: string,
  year: string,
  courseCatalogNames: string[],
  courseRef = courseR,
  studentRef = studentR
) => {
  // First, update the [student] collection to include the data for the new student
  // Converts to set first to eliminate duplicates, then converts to list
  const courseIds = await Promise.all(
    courseCatalogNames.map((name) => mapCatalogNameToCourseId(name, 'SP22'))
  )

  const existingData = (await studentRef.doc(email).get()).data() //gets all the existing data
  //studentCrses becomes courseIds of existingData.groups if available, otherwise []
  const existingCourses = existingData ? existingData.groups : [] //gets the existing courses
  const existingCourseIds = existingCourses.map(
    (crse: { courseId: string }) => crse.courseId
  )
  const crsesToAdd: any[] = [] // consists of map of {courseId: crse, group: -1}
  const crseCatalogsToUpdate: any[] = []
  courseIds.forEach((crse, index) => {
    if (!existingCourseIds.includes(crse) && !crsesToAdd.includes(crse)) {
      //goes through submitted course IDs, check if already existing
      crsesToAdd.push(crse)
      crseCatalogsToUpdate.push(courseCatalogNames[index])
    }
  })

  crsesToAdd.forEach((crse) =>
    existingCourses.push({
      courseId: crse,
      groupNumber: -1,
    })
  )

  const studentUpdate = studentRef
    .doc(email)
    .set({
      name,
      college,
      year,
      groups: existingCourses,
      submissionTime: admin.firestore.FieldValue.serverTimestamp(),
    })
    .catch((err) => {
      console.log(err)
      const e = new Error(`Error in processing studentUpdate for ${email}`)
      e.name = 'processing_err'
      throw e
    })

  // Next, update each course record to add this student
  const courseUpdates = crseCatalogsToUpdate.map((courseCatalogName, index) =>
    courseRef
      .doc(crsesToAdd[index].toString()) // We want the courseID to allow for crosslisting
      .get()
      .then((snapshot) => {
        // create a record for this course if it doesn't exist already.
        if (!snapshot.exists) {
          return snapshot.ref
            .set({
              unmatched: [],
              names: [courseCatalogName],
              lastGroupNumber: 0,
            })
            .then(() => snapshot.ref)
            .catch((err) => {
              console.log(err)
              const e = new Error(
                `Error in creating course in courseUpdate for course ${courseCatalogName}`
              )
              e.name = 'processing_err'
              throw e
            })
        } else {
          snapshot.ref
            .update({
              names: admin.firestore.FieldValue.arrayUnion(courseCatalogName),
            })
            .catch((err) => {
              console.log(err)
              const e = new Error(
                `Error in updating course in courseUpdate for course ${courseCatalogName}`
              )
              e.name = 'processing_err'
              throw e
            })
        }
        return snapshot.ref
      })
      .then((snapshotRef) =>
        snapshotRef
          .update({
            unmatched: admin.firestore.FieldValue.arrayUnion(email),
          })
          .catch((err) => {
            console.log(err)
            const e = new Error(
              `Error in updating data for student ${email} in course ${courseCatalogName}`
            )
            e.name = 'processing_err'
            throw e
          })
      )
  )

  const allUpdates = [...courseUpdates, studentUpdate]
  await Promise.all(allUpdates)
}

async function removeStudent(email: string) {
  const studentDocRef = studentR.doc(email)
  const data = (await studentDocRef.get()).data()
  if (!data) throw new Error(`Cannot find student ${email}`)
  const groups = data.groups
  const courseUpdates = groups.map(({ courseId, groupNumber }: any) =>
    groupNumber !== -1
      ? removeStudentFromCourse(email, courseId, groupNumber)
      : undefined
  )
  await Promise.all([courseUpdates, studentDocRef.delete()].flat())
}

export { addStudentSurveyResponse, removeStudent }
