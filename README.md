# mantax

- proof of concept for a prediction market to moderate comments by side loading a script through custom google tag manager

- gets the substack user id + email + subscription id of current logged in user through window._preloads to create a "mantax id" which holds the predictions the logged in user makes

- we can then give each user a calibration score when looking at comments

routes
	- POST /predict
		- Takes either the mantax id of the logged in user, or enough identifying information to make them a mantax account
		- Makes a prediction about whether a comment will be banned

	- GET /user_scores?article={article-id}
		- Gets all the scores for all the users who comment on this article, can use cloudflare workers to cache this json
		- And then for any users that have commented since the scores were cached, we can get the delta and re-cache it
		- And then update the cache anytime the predictions are reconciled

- GET /user_scores
		- Gets all the scores for all the users
		- Used to render the leaderboard

	- POST /reconcile
		- Will be a button on scott's dashboard
		- Gives the emails and userids of the subscription list + a list of bans to mantax server, which can then reconcile all predictions and update scores

	- GET /user
		- Gives back their own history, along with current amount of mantax bucks they have to spend on predictions

open questions
	- ❓ What's the cut off date for a prediction, i.e "I predict this comment will be banned within X days"
		- Maybe there needs to be a reconcile for each article that Scott hits
			- "I have banned and highlighted every comment I wish to in this article"

tables
	users
		mantaxid
		substack user id
		substack subscription id
		user email
		calibration_score
		mantax_bucks

	predictions
		comment id
		mantax id
		direction "ban / allow"

	highlights

	bans