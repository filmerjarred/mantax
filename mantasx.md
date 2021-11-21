todo
   - reconciliation
   
   - get it working in cloudflare with supabase

   - some kind of poll on displaying scores
      - all
      - only positive
      - not at all

mvp features
   - record bans and highlights
      - ✔ author can mark comment as highlighted
      - ✔ trigger process to add ban outcomes 
      - make /highlight idempotent

   - reconciliation
      - route ✔
      - 🔥 add button to post, archive list, and front-page

   - ✔ don't put predictions in for author

   - ✔ don't put predictions in for author deleted comments 

   - ✔ prediction buttons for banning and highlighting 
      - make prediction idempotent
         - serverside
         - clientside (with ui indication)
      
      - error if it's too late / don't show the button

      - account for more comments loading

   - back button

   - Make ban detection work for subscriber only posts
      - Store cookie on server?
      - Send bans when author hits reconcile?

   - make idempotent stored procs for these inserts and updates
      - or maybe just use the substack ids as primary keys and do upserts?

   - test it works on ASX using grease monkey

   - page feedback
      - mark on page if it's been reconciled / betting window closed

   - displaying scores
      - feedback predictions user has made

      - public leaderboard

      - public record for which comments have been banned or highlighted

      - private repository of all comments that have been predicted beyond a certain threshold

   - user authentication

   - test performance with and without on mobile and such

future potential features
   - auto-reconcile
      - if banning or highlightin happens on a post
         it starts a countdown mby?

   - user auth with auth0 and cloudflare
      - or mby just cloudflare?

   - prediction score next to commenters

   - using some kind of money (real or monopoly)

   - add "predictions" count

tooling I'm missing
   - types that translate into db
   - typechecking (runtime and designtime)
   - eslint
   - make a column change in 1 place and have it update everywhere
      - refactor providers for all usage locations

noodling
   okay

   so you can get the user's email address on the page
   and then you can confirm it
   can we turn an email address into a substack id / username?


   we need to be able to verify that the person predicting who *say* they own the substack profile
   actually owns it
   we could just link the logged in person
   with a mantax id forever more
   and track when people discover?


   1. person predicts
      - provides email
   2. if no mantax cookie
      3. "what is your email address"? enter email address (or glom from site)
         4. email sets cookie

   oh! we could inject a button on scott's dashboard, which would have access to
   the subscriber list and can verify the link between each subscribers
   email and substack id

   post /prediction
      - user id
      - email
      - subscription id
      - stripe user id


   "here is my subscription id, which is not public"

   - we can then verify that on scott's end


   okay

   so you could wait for the page to load

   and then be like
      - see what the ban looks like

      - add a button to each comment
         - predict "scott will ban this"

      - operations
         - make prediction

         - get user scores to display next to name
            - cache a json object of users and scores for the article

            - we need something to support the batch retrival of many scores given a set of keys

            - and then any comments that have been added in the mean time get requested and added to the cache

            - given the users on the page
            - give back all user scores
            - (might have to fire as users are loaded in)
         
         - get predictions for this user (so as to color)

         - update scores (cron)
            - could 

      - that prediction then goes into a db
         - postgrest?
         - cloud flare worker KV?

         - whatever has the most generous free tier?
         - whatever can be bundled with compute to calculate the new bans?
         - you'll want caching on the calls to get the predictions

      - and needs to be reconciled whenver scott does ban something

      - needs to display that persons record


      - each person who predicts needs to be put in the db, and a record of their predictions tracked over time


      - each person starts with 100 credits and can fund bets they like

      - if they get below 10 they get topped up at the end of every week?
