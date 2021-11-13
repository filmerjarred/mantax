let buttonHTML
let scoreHTML

async function go () {
	buttonHTML = await (await fetch('http://localhost:5000/buttons')).text()
	scoreHTML = await (await fetch('http://localhost:5000/score')).text()

	// Get comments
	let comments
	await new Promise(resolve => {
		setInterval(() => {
			comments = document.querySelectorAll('.comment')
			if(comments.length) {
				resolve()
			}
		}, 200)
	})

	for (const comment of comments) {
		decorateComment(comment)
	}
}

function decorateComment(comment) {
	// Append voting buttons to comment actions section
	const commentActions = comment.querySelector('.comment-actions')
	const voteButtonsSpan = document.createElement('span')
	commentActions.prepend(voteButtonsSpan)
	voteButtonsSpan.outerHTML = buttonHTML

	// Append score to comment header
	const commentMeta = comment.querySelector('.comment-meta')
	const scoreSpan = document.createElement('span')
	commentMeta.insertBefore(scoreSpan, commentMeta.lastElementChild)
	scoreSpan.outerHTML = scoreHTML

	// Get commentId
	const commentAnchor = comment.querySelector('.comment-anchor').id
	const commentId = commentAnchor.match(/comment-(\d*)/)[1]
	if(!commentId){
		console.error(`Could not find comment id in: "${comment.innerHTML}"`)
		return
	}

	// Extract userId from comment
	const profileLink = comment.querySelector('.user-head a').href
	const commenterUserId = profileLink.match(/\/profile\/(\d*)-/)[1]
	if(!commenterUserId){
		console.error(`Could not find user id in comment: "${comment.innerHTML}"`)
		return
	}

	const upVoteButton = commentActions.querySelector('#up-vote-button')
	const downVoteButton = commentActions.querySelector('#down-vote-button')

	upVoteButton.addEventListener('click', () => {
		console.log('click', commenterUserId, commentId)
		makePrediction({direction:'up', commentId, commenterUserId})
	})
}

async function makePrediction({direction, commentId, commenterUserId}) {
	const prediction = {
		direction,
		commentId,
		commenterUserId,

		substackUserId: window._preloads.user.id,
		email: window._preloads.user.email,
		substackSubscriptionId: window._preloads.user.subscription_id
	}

	await fetch('http://localhost:8080/prediction', {
		method:'POST',
		body:JSON.stringify(prediction),
		headers: {
			'Content-Type': 'application/json'
		 },
	})
}

function identifyUser () {
	// look for the mantax cookie to identify the user, if cannot find then:
	// get the user id, email, and subscription id for the current logged in user (stripe id if we could get it too?)

}

console.clear()
go()
