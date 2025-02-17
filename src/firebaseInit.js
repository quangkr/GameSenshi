import React from 'react'
import reactElementToJSXString from 'react-element-to-jsx-string'

//firebase
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/functions'
import 'firebase/storage'

// states
import { alertStore, authModalStore, userStore, signInStore } from 'state'
import * as allStore from 'state'

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_DATABASE_URL,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
}

firebase.initializeApp(firebaseConfig)

// load default storage bucket
const storageRef = firebase.storage().ref()

const auth = firebase.auth

// use device default language
auth().useDeviceLanguage()

const handleDifferentCredential = (auth, email, credential) => {
	auth()
		.fetchSignInMethodsForEmail(email)
		.then(async methods => {
			const getProvider = method => {
				switch (method) {
					case 'google.com':
						return 'GoogleAuthProvider'
					case 'facebook.com':
						return 'FacebookAuthProvider'
					case 'twitter.com':
						return 'TwitterAuthProvider'
					case 'password':
						return 'password'
					default:
						return undefined
				}
			}

			const getName = (
				string // remove .com and capitalized 1st letter
			) =>
				(string.charAt(0).toUpperCase() + string.slice(1)).replace('.com', '')

			const provider1 = getProvider(methods[0])
			const provider2 = getProvider(credential.signInMethod)
			const name1 = provider1 === 'password' ? email : getName(methods[0])
			const name2 =
				provider2 === 'password' ? email : getName(credential.signInMethod)
			// close modal if any
			await authModalStore.close()
			setTimeout(() => {
				const body = (
					<>
						It seem like you already registered with <b>{name1}</b>, we will try
						to link both of your <b>{name1}</b> and
						<b> {name2}</b> social login by signing you in with
						<b> {name1}</b> first then <b>{name2}. </b>
						<br />
						<br />
						Please click
						<b> Continue</b> to link your account.
					</>
				)

				const title = 'Linking Your Social Login'
				authModalStore.show(title, body, false, async () => {
					await authModalStore.close()
					if (provider1 === 'password') {
						signInStore.show(email, async () => {
							await signInStore.resetState()
							const body = (
								<>
									Linking<b> {name1} </b>to<b> {name2} </b>
									<br />
									<br />
									Please Wait...
								</>
							)
							const title = 'Linking Your Social Login'
							await authModalStore.show(title, body, true)
							auth()
								.currentUser.linkWithCredential(credential)
								.then(async () => {
									await authModalStore.close()
									alertStore.show('Social login linked successful!', 'success')
								})
								.catch(async () => {
									await authModalStore.close()
									alertStore.show('Social login linked unsuccessful!', 'danger')
								})
						})
					} else {
						// need to save this credential before hand in cache, remember delete it later.
						const body = reactElementToJSXString(
							<span>
								Please wait while we signing you in with
								<b> {name1}. </b>
								<br />
								<br />
								After that we will signing you in with
								<b> {name2}. </b>
							</span>
						)
						const title = 'Signing You In...'
						const restProps = {
							credential,
							provider2,
							name1,
							name2,
							isLinked: false,
						}
						authModalStore.setItemInSessionStorage(body, title, restProps)
						auth().signInWithRedirect(new auth[provider1]())
					}
				})
			}, 150)
			//continue on getRedirectResult event listener
		})
}

// user auth listener
auth().onAuthStateChanged(signInData => {
	authModalStore.onAuthStateChange()
	userStore.onAuthStateChanged(signInData)
	// reset all store if user sign out
	if (!signInData) {
		for (let store in allStore) {
			allStore[store].resetState && allStore[store].resetState()
		}
	}
})

// listener to get back sign in token from federated identity provider
auth()
	.getRedirectResult()
	.then(result => {
		// ! google unlink facebook: https://github.com/firebase/firebase-js-sdk/issues/569
		const showAlert = name2 => {
			alertStore.show(
				<span>
					Successfully linked your <strong>{name2}</strong> account!
				</span>,
				'success'
			)
		}
		const linkWithRedirect = provider2 => {
			result.user.linkWithRedirect(new auth[provider2]())
		}
		authModalStore.processRedirectResult(showAlert, linkWithRedirect)
	})
	.catch(err => {
		// remove this item whether it is success or not
		authModalStore.removeItemFromSessionStorage()
		const { code, credential, email } = err
		if (code === 'auth/account-exists-with-different-credential') {
			handleDifferentCredential(auth, email, credential)
		}
	})

const functions = firebase.functions()

export { functions, firebase, auth, storageRef, handleDifferentCredential }
