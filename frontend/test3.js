setTimeout(() => {

	const x = document.createElement('script')
	x.type = 'module'
	x.src = 'http://localhost:5000/test.js'
	document.body.appendChild(x)
}, 500)



