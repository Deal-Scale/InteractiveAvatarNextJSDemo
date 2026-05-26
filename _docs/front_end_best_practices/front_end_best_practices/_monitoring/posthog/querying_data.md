user 3 actually upgraded from the free plan to the enterprise plan over this period. Despite this, the event they sent for when they viewed the docs still reflects that they were on the free plan at the time, and is thus filtered out.

In most cases, this is exactly what we want, as it means that we can update the properties for a person without worrying about messing up our past data points. However, if instead you do want to filter based on a person's current properties, you can do so by using pdi.person.properties.<property> in SQL or creating a cohort. Note that this is slower than filtering on person properties.
Filtering with cohorts

To show this, let's say we want to get all events for users who are currently on enterprise or premium plans.

To do this, we'll create a cohort called 'Paid users' that matches all persons who have their 'plan' property set as either premium or enterprise.

On the insight, we can then filter by the cohort, which would match the following events.
User ID	Event	Subscription plan (Property on each person)
1	clicked login	premium
2	refreshed table	premium
3	viewed docs	free
3	upgraded plan	enterprise
3	viewed dashboard	enterprise
Filtering on group properties

Group properties work the same way as person properties, and are stored on each event.