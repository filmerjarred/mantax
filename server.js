require('dotenv').config()

const _ = require('lodash')
const cors = require('cors')
const uuid = require('uuid')
const express = require('express')
const bodyParser = require('body-parser')
const {createClient} = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const app = express()

app.use(cors())
app.use(bodyParser.json());

const MANTAX_COOKIE_KEY = 'mantaxUserId'

// assumes the existence of req.userInfo
async function getOrCreateUser (req, res) {
	const userQuery = supabase
		.from('mantaxUsers')
		.select(`userId, substackUserId, substackSubscriptionId, email, isAdmin`)

	const cookieUserId = req.cookies ? req.cookies[MANTAX_COOKIE_KEY] : null

	if (cookieUserId) {
		console.log('mantaxUserId', cookieUserId)
		userQuery.eq('userId', cookieUserId)
	} else {
		const userInfo = req.body.userInfo
		console.log('userInfo', userInfo)
		userQuery
			.eq('substackUserId', userInfo.substackUserId)
			.eq('substackSubscriptionId', userInfo.substackSubscriptionId)
			.eq('email', userInfo.email)
	}

	// Get user
	const { data: existingUsers, error: getUserError } = await userQuery
	if (getUserError) throw getUserError

	const existingUser = existingUsers[0]
	console.log(existingUser)
		
	if (existingUsers.length > 1) throw new Error('More than one user match')
	if (cookieUserId && existingUsers.length === 0) {
		throw new Error('Could not find match for mantax user id')
	}

	// Create user if none exists
	let user
	if(existingUser) {
		user = existingUser
	} else {
		user = await createUser(req.body.userInfo)
		res.cookie(MANTAX_COOKIE_KEY, user.userId)
	}

	return user
}

app.post('/highlight', async (req, res) => {
	try {
		console.log('highlight!', req.body)

		const user = await getOrCreateUser(req, res)

		if (user.isAdmin) {
			// Create outcome
			const outcomeInfo = req.body.highlightInfo
			const outcome = {
				outcomeId: uuid.v4(),
				userId: user.userId,
				type: 'highlight',
				substackCommentUserId: highlightInfo.substackCommentUserId,
				substackCommentId: highlightInfo.substackCommentId,
				substackPostId: highlightInfo.substackPostId,
				highlight: highlightInfo.highlight
			}

			const { error: insertOutcomeError } = await supabase.from('outcomes').insert([outcome])
			if (insertOutcomeError) throw insertOutcomeError
		} else {
			console.log('Unauthorised attempt at creating highlight')
			res.status(401)
		}

		res.end()
	} catch(e) {
		console.log(e)
	}
})

app.post('/prediction', async (req, res) => {
	try {
		console.log('prediction!', req.body)

		const user = await getOrCreateUser(req, res)
		
		// Create prediction
		const predictionInfo = req.body.predictionInfo
		const prediction = {
			userId: user.userId,
			predictionId: uuid.v4(),
			substackCommentUserId: predictionInfo.substackCommentUserId,
			substackCommentId: predictionInfo.substackCommentId,
			substackPostId: predictionInfo.substackPostId,
			prediction: predictionInfo.prediction
		}

		const { error: insertPredictionError } = await supabase
			.from('predictions')
			.insert([prediction])
		if (insertPredictionError) throw insertPredictionError

		res.end()
	} catch(e) {
		console.log(e)
	}
})

async function createUser(userInfo) {
	console.log('Creating user')

	const user = {
		userId: uuid.v4(),
		substackUserId: userInfo.substackUserId,
		email: userInfo.email,
		substackSubscriptionId: userInfo.substackSubscriptionId,
	}
	
	const { error } = await supabase
		.from('mantaxUsers')
		.insert([user])
	if (error) throw error
	
	return user
}

app.listen(8080, () => {
	console.log('Listening on port 8080')
})