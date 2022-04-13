okay, slight issue

can't just fire once on page load, because substact uses react which will re-draw shit

so

what to do instead?

1. mutation observer on all
or
2. mutation observer on every element we care about maintaining an altered state for

when it fires, check to see if a set of checks are met, and if they are not then clear existing and re-enter


right, so problems

when react redraws it's liable to delete and re-draw the node being used
and worse it may... okay

1. watch everything
2. watch for removal and positioning, because two things can go wrong
	a. the parent node get's removed?


well it's interesting, because here it's like

a. you need to re-decorate the entire comment
b. you need to 


decorate comments needs
	a. the container element (to monitor for new)
	b. the containers (to monitor for removal?)

Q: Is there any way to monitor for re-decoration that....

what if we just did a full re-decoration
and just added a check