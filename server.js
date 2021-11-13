const _ = require('lodash')
const cors = require('cors')
const uuid = require('uuid')
const express = require('express')
const bodyParser = require('body-parser')

const data = {
	users:[]
}

const app = express()

app.use(cors())
app.use(bodyParser.json());

app.post('/prediction', (req,res) => {
	// if mantax token provided
		// do authentication
	// else if substack identifiers provided
	const existingUser = _.find(users, {
		substackUserId,
		email,
		substackSubscriptionId
	})

	const user = existingUser || createUser(req.body)
		// create or get mantax account 
	
	const prediction = {
		mantaxUserId:user.mantaxUserId
		direction
	}

	console.log(req.body)
	// send back mantaxId as cookie if needed
	res.end()
})

function createUser(userInfo) {
	const user = {
		substackUserId,
		email,
		substackSubscriptionId,
		mantaxUserId: uuid.v4()
	}
	
	data.users.push(user)
	
	return user
}

app.listen(8080)