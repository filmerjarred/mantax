DROP TABLE IF EXISTS "mantaxUsers";
CREATE TABLE "mantaxUsers" (
  	"userId" uuid PRIMARY KEY,
  	"createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"substackUserId" int8 NOT NULL,
	"substackSubscriptionId" int8 NOT NULL,
	"email" varchar(320) NOT NULL,
	"isAdmin" bool DEFAULT false NOT NULL
);

DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS "outcomes";
DROP TYPE IF EXISTS OUTCOME_TYPE;
DROP TYPE IF EXISTS PREDICTION_STATUS;

CREATE TYPE OUTCOME_TYPE AS ENUM ('ban', 'highlight');
CREATE TYPE PREDICTION_STATUS AS ENUM ('pending', 'correct', 'wrong');

CREATE TABLE predictions (
  	"predictionId" uuid  PRIMARY KEY,
  	"createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  	"userId" uuid REFERENCES "mantaxUsers" ("userId"),
	"substackCommentId" int8 NOT NULL,
	"substackPostId" int8 NOT NULL,
	"substackCommentUserId" int8 NOT NULL,
	"predictedOutcome" OUTCOME_TYPE NOT NULL,
	"predictionStatus" PREDICTION_STATUS NOT NULL
);

CREATE TABLE outcomes (
  	"outcomeId" uuid  PRIMARY KEY,
  	"createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"outcomeType" OUTCOME_TYPE NOT NULL,
	"substackCommentId" int8 NOT NULL,
	"substackPostId" int8 NOT NULL,
	"substackCommentUserId" int8 NOT NULL
);
