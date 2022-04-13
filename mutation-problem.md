okay, slight issue

can't just fire once on page load, because substact uses react which will re-draw shit

so

what to do instead?

okay, so that's a fully general solution

anytime *anything* changes, go through and
	a. check to see if there's more decorations
	b. check that existing decorations are present and correct

there's two ways we can make this better
	a. only monitor the parent chain or something
	b. avoid the need for decorations 🤯
