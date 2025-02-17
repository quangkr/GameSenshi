// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
import 'firebaseInit'
import * as functions from 'firebase-functions' // https://stackoverflow.com/questions/51118943/cannot-read-property-https-of-undefined-error-in-firebase-functions
import * as admin from 'firebase-admin'
import '@babel/polyfill' // https://stackoverflow.com/questions/49253746/error-regeneratorruntime-is-not-defined-with-babel-7
import { handleSignUpWithEmailAndPassword } from 'api'
import { SIGN_UP_ON_SUBMIT } from 'constantValues'

admin.initializeApp()

// unable to use property accessor in es6 non default export, revert to es5 exports statement
exports[SIGN_UP_ON_SUBMIT] = functions.https.onCall(
	handleSignUpWithEmailAndPassword
)
