const { db } = require("../config");
const admin = require("firebase-admin");
const courseR = db.collection("courses");
const studentR = db.collection("students");
const mapCatalogNameToCrseId = require("../course/get_course_id");

async function removeStudentFromCourse(email, courseId, groupNumber) {
  const ref = courseR
    .doc(courseId)
    .collection("groups")
    .doc(groupNumber.toString());
  const data = (await ref.get()).data();
  if (data.members.length === 1 && data.members.includes(email)) {
    //second condition is a sanity check
    return ref.delete();
  } else {
    return ref.update({
      members: admin.firestore.FieldValue.arrayRemove(email),
    });
  }
}
//should_add compares inputted ids and existing ids to see which ones to add
function should_add(ids,existing_set) {
  const ids_to_add = new Array(); 
  for (let i = 0; i < ids.length; i ++ ) {
    if (!existing_set.has(ids[i])) {
        ids_to_add.push(ids[i]);
    }
  }
  return ids_to_add;
}
// Note: the error handling in this file is done the way it is so it is easier
// to decide response codes based on error type.
const addStudentSurveyResponse = async (
  name,
  email,
  preferredWorkingTime,
  college,
  year,
  courseCatalogNames,
  courseRef = courseR,
  studentRef = studentR
) => {
  // First, update the [student] collection to include the data for the new student
  const crseIds = await Promise.all(
    courseCatalogNames.map((name) => mapCatalogNameToCrseId(name))
  );
  const ref = studentRef
  .doc(email)
  const existing_crses = (await ref.get()).data().groups;
  const existing_set = new Set(existing_crses.map((crse) => crse.courseId));
  //creates the unioned array of courses
  const crses_to_add = should_add(crseIds,existing_set);
  crses_to_add.forEach((crse) => existing_crses.push({
    courseId: crse,
    groupNumber:-1
  }))


  const studentUpdate = await studentRef
    .doc(email)
    .set({
      name,
      college,
      year,
      preferredWorkingTime,
      groups: existing_crses
    })
    .catch((err) => {
      console.log(err);
      const e = new Error(`Error in processing studentUpdate for ${email}`);
      e.name = "processing_err";
      throw e;
    });

  
  // Next, update each course record to add this student
  const courseUpdates = courseCatalogNames.map((courseCatalogName, index) =>
    courseRef
      .doc(crseIds[index].toString()) // We want the courseID to allow for crosslisting
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
              console.log(err);
              const e = new Error(
                `Error in creating course in courseUpdate for course ${courseCatalogName}`
              );
              e.name = "processing_err";
              throw e;
            });
        } else {
          snapshot.ref
            .update({
              names: admin.firestore.FieldValue.arrayUnion(courseCatalogName),
            })
            .catch((err) => {
              console.log(err);
              const e = new Error(
                `Error in updating course in courseUpdate for course ${courseCatalogName}`
              );
              e.name = "processing_err";
              throw e;
            });
        }
        return snapshot.ref;
      })
      .then((snapshotRef) =>
        snapshotRef
          .update({
            unmatched: admin.firestore.FieldValue.arrayUnion(email),
          })
          .catch((err) => {
            console.log(err);
            const e = new Error(
              `Error in updating data for student ${email} in course ${courseCatalogName}`
            );
            e.name = "processing_err";
            throw e;
          })
      )
  );

  const allUpdates = courseUpdates.concat(studentUpdate);
  await Promise.all(allUpdates);
};

async function removeStudent(email) {
  const studentDocRef = studentR.doc(email);
  const data = (await studentDocRef.get()).data();
  if (!data) throw new Error(`Cannot find student ${email}`);
  const groups = data.groups;
  const courseUpdates = groups.map(({ courseId, groupNumber }) =>
    groupNumber !== -1
      ? removeStudentFromCourse(email, courseId, groupNumber)
      : undefined
  );
  await Promise.all([courseUpdates, studentDocRef.delete()].flat());
}
module.exports = { addStudentSurveyResponse, removeStudent };
