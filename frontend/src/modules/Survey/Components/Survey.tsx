import React, { useState } from 'react'

import axios from 'axios'
import { Question } from '@core/Types'
import { API_ROOT, STUDENT_API } from '@core/Constants'
import {
  StyledContainer2 as QuestionBackground,
  StyledContainer3 as LoginBackground,
} from 'Survey/Styles/Survey.style'
import { StepTemplate } from 'Survey/Components/StepTemplate'
import { StepCourse } from 'Survey/Components/StepCourse'
import { StepRadio } from 'Survey/Components/StepRadio'
import { StepFinal } from 'Survey/Components/StepFinal'
import { SurveyData } from 'Survey/Components/FuncsAndConsts/SurveyFunctions'
import { SurveySubmissionResponse } from 'Survey/Types'
import { LoginCheck } from './LoginCheck'
import { useAuthValue } from '@auth/AuthContext'

export const Survey = () => {
  const [currStep, setCurrStep] = useState(1)

  // Final step data
  const [surveySubmissionResponse, setSurveySubmissionResponse] = useState<
    SurveySubmissionResponse | undefined
  >()
  const [surveyError, setSurveyError] = useState<string | null>(null)

  const { user } = useAuthValue()

  // For the progress spinner on the submission button
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false)

  // If there are custom questions the below will be a network call perhaps
  const questions: Question[] = require('@core/Questions/Questions.json')
  // import questions from '@core/Questions/Questions.json'
  const numSpecialQuestions = 1 // Course list
  const totalSteps = questions.length + numSpecialQuestions + 1

  // Form answer props
  const [courseList, setCourseList] = useState<string[]>([])
  const [answers, setAnswers] = useState(
    Array<string>(questions.length).fill('')
  ) // Will be in order of Qs

  const changeAnswer = (i: number, v: string) => {
    setAnswers(answers.map((value, index) => (index === i ? v : value)))
  }

  // last step's Next button handles sending data
  function finalNext() {
    setIsSubmittingSurvey(true)
    const mcData = Object.fromEntries(
      questions.map((question, index) => [question.questionId, answers[index]])
    )
    const surveyData: SurveyData = {
      courseCatalogNames: courseList,
      name: user!.displayName!,
      email: user!.email!,
      ...mcData,
    }
    console.log('Finished survey', surveyData)
    axios.post(`${API_ROOT}${STUDENT_API}/survey`, surveyData).then(
      (response: any) => {
        setIsSubmittingSurvey(false)
        console.log(response)
        setSurveySubmissionResponse(response.data.data)
        setCurrStep(currStep + 1)
      },
      (error: any) => {
        setIsSubmittingSurvey(false)
        console.log(error)
        setSurveyError(error.response.data.message)
        setCurrStep(currStep + 1)
      }
    )
  }

  const multipleChoiceIndex = currStep - numSpecialQuestions - 2
  const validCourseRe = /^[A-Z]{2,7} \d{4}$/
  const isStepValid =
    currStep === 2
      ? courseList.length > 0 && courseList.every((c) => validCourseRe.test(c))
      : answers[multipleChoiceIndex] !== ''

  return currStep === 1 ? (
    <LoginBackground>
      <LoginCheck
        gotoNextStep={() => setCurrStep((currStep) => currStep + 1)}
      ></LoginCheck>
    </LoginBackground>
  ) : currStep === totalSteps + 1 ? (
    // Form confirmation
    <QuestionBackground>
      <StepFinal
        success={surveyError === null}
        submissionResponse={surveySubmissionResponse!}
        errorMsg={surveyError != null ? surveyError : ''}
      />
    </QuestionBackground>
  ) : (
    <QuestionBackground>
      <StepTemplate
        isStepValid={isStepValid}
        isSubmittingSurvey={isSubmittingSurvey}
        stepNumber={currStep}
        totalSteps={totalSteps}
        gotoPrevStep={() => setCurrStep((currStep) => currStep - 1)}
        gotoNextStep={
          currStep === totalSteps
            ? finalNext
            : () => setCurrStep((currStep) => currStep + 1)
        }
      >
        {currStep === 2 ? ( // Course selection
          <StepCourse
            validCourseRe={validCourseRe}
            courses={courseList}
            setCourses={setCourseList}
          />
        ) : (
          // General multiple-choice
          <StepRadio
            currentAnswer={answers[multipleChoiceIndex]}
            question={questions[multipleChoiceIndex]}
            setAnswer={(arg) => changeAnswer(multipleChoiceIndex, arg)}
            key={String(currStep)}
          />
        )}
      </StepTemplate>
    </QuestionBackground>
  )
}
