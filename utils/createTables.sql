DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS "mantaxUsers";
DROP TYPE IF EXISTS PREDICTION;

CREATE TYPE PREDICTION AS ENUM ('ban', 'highlight');

CREATE TABLE "mantaxUsers" (
  	"userId" uuid PRIMARY KEY,
  	"createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"substackUserId" int8 NOT NULL,
	"substackSubscriptionId" int8 NOT NULL,
	"email" varchar(320) NOT NULL
);

CREATE TABLE predictions (
  	"predictionId" uuid  PRIMARY KEY,
  	"createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  	"userId" uuid REFERENCES "mantaxUsers" ("userId"),
	"substackCommentId" int8 NOT NULL,
	"substackPostId" int8 NOT NULL,
	"prediction" PREDICTION NOT NULL
);