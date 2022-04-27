let predictHighlightHTML; let predictBanHTML; let scoreHTML; let styleHTML; let
   reconcileButtonHTML
let mantaxData

const urlParams = new URLSearchParams(window.location.search)
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
   substackSubscriptionId: window._preloads.user.subscription_id,
}

async function go() {
   mantaxData = await getUserData()

   predictHighlightHTML = await (await fetch('http://localhost:5000/predict-highlight-menu-item')).text()
   predictBanHTML = await (await fetch('http://localhost:5000/predict-ban-menu-item')).text()

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

   document.addEventListener('click', (e) => {
      if (e.target.classList.contains('comment-actions-menu')) {
         onActionDropdownClick(e.target)
      }
   })
}

async function onActionDropdownClick(actionsDropdown) {
   console.log('Dropdown clicked')

   const comment = (() => {
      let parent = actionsDropdown.parentElement
      while (
         parent !== null
			&& parent !== document.body
			&& !parent.matches('.comment')
      ) {
         parent = parent.parentElement
      }
      if (!parent) throw new Error('Cannot find comment element for action dropdown')
      return parent
   })()

   // Get commentId
   const commentAnchor = comment.querySelector('.comment-anchor').id
   const commentId = parseInt(commentAnchor.match(/comment-(\d*)/)[1])
   if (!commentId) {
      console.error(`Could not find comment id in: "${comment.innerHTML}"`)
      return
   }

   // Extract userId from comment
   const profileLink = comment.querySelector('.user-head a').href
   const commenterUserId = profileLink.match(/\/profile\/(\d*)-/)[1]
   if (!commenterUserId) {
      console.error(`Could not find user id in comment: "${comment.innerHTML}"`)
      return
   }

   const dropdownMenu = await waitForElm('ul.dropdown-menu.tooltip.comment-actions-dropdown.active .dropdown-menu-wrapper')

   if (dropdownMenu._decorated) return
   dropdownMenu._decorated = true

   // Append voting buttons to comment actions section
   const predictHighlight = document.createElement('li')
   dropdownMenu.appendChild(predictHighlight)
   predictHighlight.innerHTML = predictHighlightHTML

   const predictBan = document.createElement('li')
   dropdownMenu.appendChild(predictBan)
   predictBan.innerHTML = predictBanHTML

   const existingPrediction = mantaxData.predictions.find((p) => p.substackCommentId === commentId)
   if (existingPrediction) {
      predictHighlight.classList.add('highlighted')
   } else {
      predictHighlight.addEventListener('click', () => predictHighlight.classList.add('highlighted'))

      if (isAuthor) {
         predictHighlight.addEventListener('click', () => markHighlighted({ commentId, commenterUserId }))
      } else {
         predictHighlight.addEventListener('click', () => makePrediction({ predictedOutcome: 'highlight', commentId, commenterUserId }))

         predictBan.addEventListener('click', () => makePrediction({ predictedOutcome: 'ban', commentId, commenterUserId }))
      }
   }
}

function waitForElm(selector) {
   return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
         if (document.querySelector(selector)) {
            resolve(document.querySelector(selector))
            observer.disconnect()
         }
      })

      observer.observe(document.body, {
         childList: true,
         subtree: true,
         attributes: true,
      })

      if (document.querySelector(selector)) {
         return resolve(document.querySelector(selector))
	  	}
   })
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
      if (e.stopImmediatePropagation) { e.stopImmediatePropagation() }
      if (e.stopPropagation) { e.stopPropagation() }
      e.preventDefault()

      let postId
      if (window._preloads.post) {
         // If we're like, on a post then just use that
         postId = window._preloads.post.id
      } else {
         const commentsLinkElement = post.querySelector('td a[href*="/comments"')
         const postUrl = commentsLinkElement.href.replace(/\/comments$/, '')

         if (window._preloads.newPosts) {
            const newPost = window._preloads.newPosts.find((p) => p.canonical_url === postUrl)
            postId = newPost && newPost.id
         }

         // if we still haven't found it, use a ajax call to get it directly
         if (!postId) {
            const postSlug = postUrl.match(/\/p\/(.*)$/)[1]
            const postStats = await (await fetch(`https://jarredfilmer.substack.com/api/v1/posts/${postSlug}`)).json()
            postId = postStats.id
         }
      }

      reconcilePost({ postId })
   })
}

async function markHighlighted({ commentId, commenterUserId }) {
   const data = {
      highlightInfo: {
         substackCommentId: commentId,
         substackCommentUserId: commenterUserId,
         substackPostId: window._preloads.post.id,
      },
      userInfo,
   }

   await fetch('http://localhost:8080/highlight', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
      },
   })
}

async function makePrediction({ predictedOutcome, commentId, commenterUserId }) {
   const data = {
      predictionInfo: {
         predictedOutcome,
         substackCommentId: commentId,
         substackCommentUserId: commenterUserId,
         substackPostId: window._preloads.post.id,
      },
      userInfo,
   }

   await fetch('http://localhost:8080/prediction', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
		 },
   })
}

async function reconcilePost({ postId }) {
   const data = {
      reconcileInfo: {
         substackPostId: postId,
      },
      userInfo,
   }

   await fetch('http://localhost:8080/reconcile', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
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
         'Content-Type': 'application/json',
      },
   })

   return response.json()
}

go()
