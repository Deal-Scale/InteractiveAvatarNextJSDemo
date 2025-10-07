PostHog's architecture

Last updated: Mar 25, 2025
|
Edit this page

This section covers PostHog's data model, ingestion pipeline, ClickHouse setup and data querying. This page provides an overview of how PostHog is structured.

    For PostHog staff, you can see the very detailed diagram at http://runbooks/architecture/

Broad overview

There are only a few systems to consider.

    A website and API for users
    An API for client apps
    A plugin service for processing events on ingestion
    A worker service for processing events in response to triggers

Zooming closer

Adding detail reveals the flow between parts of the system.
Zoomed right in
No communication is needed into or out of this namespace other than the ingress controller for the app and collecting data.