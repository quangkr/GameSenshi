import { auth } from 'firebaseInit'

const handleSignInWithEmailAndPassword = async (email, password) => {
	// sign in set local persistence by default, allowing user to auto sign in
	// https://firebase.google.com/docs/auth/web/auth-state-persistence?authuser=0

	return auth()
		.signInWithEmailAndPassword(email, password)
		.then(() => {}) // return undefined if login success
		.catch(err => {
			// Handle Errors here.
			switch (err.code) {
				case 'auth/invalid-email':
				case 'auth/user-disabled':
				case 'auth/user-not-found':
				case 'auth/wrong-password':
					return 'Invalid Email or Password'
				case 'auth/network-request-failed':
					return 'Network Failure'
				default:
					return 'Unexpected Error Code 2'
			}
		})
}

export default handleSignInWithEmailAndPassword
