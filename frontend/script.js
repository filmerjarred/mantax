let highlightButtonHTML, banButtonHTML, scoreHTML, styleHTML, reconcileButtonHTML
let mantaxData

const urlParams = new URLSearchParams(window.location.search);
const isAuthor = urlParams.get('is_author') === 'false' ? false : window._preloads.user.is_author

// todo: throttle

/* 
okay, here's what we do
we set up a mutation observer either
1. for every

*/

// new MutationObserver(function(mutations, observer) {
// 	console.log(mutations) 
// }).observe(document.body, {subtree:true, childList:true});

// add mutation observer to see if comment is added
// add mutation observer after page loaded
	// 


// re-run on pop-state
// add mutation observer to see if parent-list get's bonked

// add mutation observer to each comment

// 1 mutation observer to see if 

const userInfo = {
	substackUserId: window._preloads.user.id,
	email: window._preloads.user.email,
	substackSubscriptionId: window._preloads.user.subscription_id
}

async function go () {
	mantaxData = await getUserData()

	highlightButtonHTML = await (await fetch('http://localhost:5000/predict-highlight-button')).text()
	banButtonHTML = await (await fetch('http://localhost:5000/predict-ban-button')).text()
	scoreHTML = await (await fetch('http://localhost:5000/score')).text()
	reconcileButtonHTML = await (await fetch('http://localhost:5000/reconcile-button')).text()
	styleHTML = await (await fetch('http://localhost:5000/style.css')).text()

	// Inject our css into page
	const styleTag = document.createElement('style')
	styleTag.innerHTML = styleHTML
	document.body.appendChild(styleTag)

	// Inject "reconcile market" button onto any posts
	if (isAuthor) {
		const postMetaBlocks = document.querySelectorAll('.post-meta tr')
		postMetaBlocks.forEach(decoratePostMetadata)
	}

	await new Promise(resolve => {
		const interval = setInterval(() => {
			if(document.querySelectorAll('.comment').length) {
				clearInterval(interval)
				resolve()
			}
		}, 200)
	})

	decorateComments()
	// new MutationObserver(function(mutations, observer) {
	// 	decorateComments()
	// }).observe(document.body, {subtree:true, childList:true});
}

function decorateComments() {
	const comments = document.querySelectorAll('.comment')
	comments.forEach(decorateComment)
}

function decorateComment(comment) {
	// Don't decorate already decorated node
	if(comment._decorated) return
	comment._decorated = true

	// Don't decorate deleted comments
	const deletedText = comment.querySelector('.comment-body i')
	if(deletedText && deletedText.textContent === 'deleted') return

	// Don't decorate deleted nodes
	if(!document.body.contains(comment)) return

	const commentRest = comment.querySelector('.comment-rest')
	const commentActions = commentRest.querySelector('.comment-actions')

	// Append voting buttons to comment actions section
	const predictButtonsSpan = document.createElement('span')
	commentRest.insertBefore(predictButtonsSpan, commentActions)
	
	// remove prediction buttons if the user is the author
	// but keep the highlight button as it serves double duty to let
	// author mark comment as highlighted, as the context menu is a pain to alter
	const buttonHTML = isAuthor ? 
		highlightButtonHTML :
		highlightButtonHTML + banButtonHTML 

	predictButtonsSpan.innerHTML = buttonHTML
	predictButtonsSpan.classList = 'prediction-button-wrapper'

	new MutationObserver((mutations) => {
		if (!commentRest.children.length === 4) throw new Error('Unexpected')

		if (commentRest.children[2] !== predictButtonsSpan) {
			console.log('redraw')
			predictButtonsSpan.remove()
			commentRest.insertBefore(predictButtonsSpan, commentRest.querySelector('.comment-actions'))
		}

	}).observe(commentRest, {childList:true})

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
	const highlightButton = commentRest.querySelector('#highlight-button')
	
	const existingPrediction = mantaxData.predictions.find(p => p.substackCommentId === commentId)
	if (existingPrediction) {
		highlightButton.classList.add('highlighted')
	} else {
		highlightButton.addEventListener('click', () => highlightButton.classList.add('highlighted'))

		if (isAuthor) {
			highlightButton.addEventListener('click', () => markHighlighted({commentId, commenterUserId}))
		} else {
			highlightButton.addEventListener('click', () => makePrediction({predictedOutcome:'highlight', commentId, commenterUserId}))
			
			const banButton = commentRest.querySelector('#ban-button')
			banButton.addEventListener('click', () => makePrediction({predictedOutcome:'ban', commentId, commenterUserId}))
		}
	}

}

async function decoratePostMetadata(post) {
	const reconcileButton = document.createElement('td')
	const menuIcon = post.querySelector('.edit-icon')
	if (menuIcon) {
		post.insertBefore(reconcileButton, menuIcon)
	} else {
		post.appendChild(reconcileButton)
	}
	reconcileButton.outerHTML = reconcileButtonHTML

	let postId

	// TODO if window._preloads.post, then use that

	// if it's in the preloads, then use that

	// for some reason we need to re-select
	post.querySelector('.reconcile-button').addEventListener('click', async (e) => {
		if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
		if (e.stopPropagation) { e.stopPropagation(); }
		e.preventDefault();

		let postId
		if (window._preloads.post) {
			// If we're like, on a post then just use that
			postId = window._preloads.post.id
		} else {
			const commentsLinkElement = post.querySelector('td a[href*="/comments"')
			const postUrl = commentsLinkElement.href.replace(/\/comments$/, '')

			if (window._preloads.newPosts) {
				const newPost = window._preloads.newPosts.find(p => p.canonical_url === postUrl)
				postId = newPost && newPost.id
			}

			// if we still haven't found it, use a ajax call to get it directly
			if (!postId) {
				const postSlug = postUrl.match(/\/p\/(.*)$/)[1]
				const postStats = await (await fetch(`https://jarredfilmer.substack.com/api/v1/posts/${postSlug}`)).json()
				postId = postStats.id
			}
		}

		reconcilePost({postId})
	})
}

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

async function reconcilePost({postId}) {
	const data = {
		reconcileInfo: {
			substackPostId: postId
		},
		userInfo
	}

	await fetch('http://localhost:8080/reconcile', {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		},
	})
}

async function getUserData() {
	const response = await fetch('http://localhost:8080/user-data', {
		method: 'POST',
		body: JSON.stringify({
			userInfo,
			substackPostId: window._preloads.post.id,
		}),
		headers: {
			'Content-Type': 'application/json'
		},
	})

	return response.json()
}

go()