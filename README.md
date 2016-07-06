# Public Transportation App

Project #2 for the [Udacity Senior Web Developer Nanodegree](https://www.udacity.com/course/senior-web-developer-nanodegree--nd802)

## Project Brief

You will build an application that allows users to select a departure and arrival train station, and see a list of trains, times, and durations. A default train schedule will be provided that should be used when the application is offline. If a network connection exists, the application will query an endpoint that provides information about all arrival and departure times.

Requirements -

1. App includes all requirements, including departure and arrival times of trains.
1. App is equally functional on mobile and desktop, using responsive design to ensure its displayed in a useable state.
1. Application defaults to offline-first functionality, functioning if a network connection does not exist.
1. App includes a build process (such as Grunt or Gulp). Assets are minimized and concatenated as appropriate.

Bonus Points -

1. Minimize the amount of information that needs to be cached by caching only what the user access


## The Tube Planr

For this project I created [The Tube Planr](https://tplanr.ire.codes). I used Transport for London's API to handle the transport.

git subtree push --prefix dist origin gh-pages