import React, { useEffect, useRef } from 'react'

// core components
import { IndexHeader, Footer, IndexNavbar } from 'components'

const IndexPage = props => {
	const wrapper = useRef(null)

	useEffect(() => {
		document.body.classList.add('index-page')
		document.documentElement.scrollTop = 0
		document.scrollingElement.scrollTop = 0
		wrapper.current.scrollTop = 0
		return () => {
			document.body.classList.remove('index-page')
		}
	}, [])

	return (
		<>
			<IndexNavbar />
			<div className='wrapper' ref={wrapper}>
				<IndexHeader />
				<div className='main'>{/* include stuff here in future */}</div>
				<Footer />
			</div>
		</>
	)
}

export default IndexPage
