
let buttonHTML
let scoreHTML
console.log('alpha')
async function go () {
	buttonHTML = await (await fetch('http://localhost:5000/buttons')).text()
	scoreHTML = await (await fetch('http://localhost:5000/score')).text()
	
	const styleHTML = await (await fetch('http://localhost:5000/style.css')).text()
	const styleTag = document.createElement('style')
	styleTag.innerHTML = styleHTML
	document.body.appendChild(styleTag)

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
	const likeButton = commentActions.querySelector('span:nth-child(2)')
	const voteButtonsSpan = document.createElement('span')
	commentActions.insertBefore(voteButtonsSpan, likeButton)
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
	upVoteButton.addEventListener('click', () => {
		console.log('click', commenterUserId, commentId)
		makePrediction({prediction:'highlight', commentId, commenterUserId})
	})

	const downVoteButton = commentActions.querySelector('#down-vote-button')
	downVoteButton.addEventListener('click', () => {
		console.log('click', commenterUserId, commentId)
		makePrediction({prediction:'ban', commentId, commenterUserId})
	})
}


async function makePrediction({prediction, commentId, commenterUserId}) {
	const data = {
		predictionInfo: {
			prediction,
			substackCommentId: commentId,
			substackPostId: window._preloads.post.id,
		},
		userInfo: {
			substackUserId: window._preloads.user.id,
			email: window._preloads.user.email,
			substackSubscriptionId: window._preloads.user.subscription_id
		}
	}

	await fetch('http://localhost:8080/prediction', {
		method:'POST',
		body:JSON.stringify(data),
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
