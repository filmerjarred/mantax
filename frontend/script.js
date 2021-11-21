let highlightButtonHTML, banButtonHTML, scoreHTML, styleHTML
let activeCommentActionMenu

// const isAuthor = window._preload.is_author
const isAuthor = false

const userInfo = {
	substackUserId: window._preloads.user.id,
	email: window._preloads.user.email,
	substackSubscriptionId: window._preloads.user.subscription_id
}

async function go () {
	highlightButtonHTML = await (await fetch('http://localhost:5000/predict-highlight-button')).text()
	banButtonHTML = await (await fetch('http://localhost:5000/predict-ban-button')).text()
	scoreHTML = await (await fetch('http://localhost:5000/score')).text()
	styleHTML = await (await fetch('http://localhost:5000/style.css')).text()

	// Inject css into page
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
	// Don't decorate deleted comments
	const deletedText = comment.querySelector('.comment-body i')
	if(deletedText && deletedText.textContent === 'deleted') return

	// Append voting buttons to comment actions section
	const commentActions = comment.querySelector('.comment-actions')
	const voteButtonsSpan = document.createElement('span')
	const replyButton = commentActions.querySelector('span:nth-child(2)')
	
	// Some blogs have the like button disabled
	commentActions.insertBefore(voteButtonsSpan, replyButton)
	
	// remove prediction buttons if the user is the author
	// but keep the highlight button as it serves double duty to let
	// author mark comment as highlighted, as the context menu is a pain to alter
	const buttonHTML = isAuthor ? 
		highlightButtonHTML :
		highlightButtonHTML + banButtonHTML 

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

	// Inject upvote - downvote into page
	const highlightButton = commentActions.querySelector('#highlight-button')
	
	if (isAuthor) {
		highlightButton.addEventListener('click', () => markHighlighted({commentId, commenterUserId}))
	} else {
		highlightButton.addEventListener('click', () => makePrediction({predictedOutcome:'highlight', commentId, commenterUserId}))
		
		const banButton = commentActions.querySelector('#ban-button')
		banButton.addEventListener('click', () => makePrediction({predictedOutcome:'ban', commentId, commenterUserId}))
	}
}

// Lets the author mark a comment as highlighted
async function markHighlighted({commentId, commenterUserId}) {
	const data = {
		highlightInfo: {
			substackCommentId: commentId,
			substackCommentUserId: commenterUserId,
			substackPostId: window._preloads.post.id,
		},
		userInfo
	}

	await fetch('http://localhost:8080/highlight', {
		method:'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		},
	})
}

async function makePrediction({predictedOutcome, commentId, commenterUserId}) {
	const data = {
		predictionInfo: {
			predictedOutcome,
			substackCommentId: commentId,
			substackCommentUserId: commenterUserId,
			substackPostId: window._preloads.post.id,
		},
		userInfo
	}

	await fetch('http://localhost:8080/prediction', {
		method:'POST',
		body: JSON.stringify(data),
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
