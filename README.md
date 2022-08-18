# Flick Finder - A movie review app

## Set up

- Clone the project using `git clone https://github.com/darkerror96/popcorntime.git`
- Open terminal or command prompt inside `popcorntime` directory
- Run `npm install` to download node dependencies
- If database connection details are to be changed, open `config/settings.json` and update connection settings (By default, the app looks for a MongoDB instance on the same host)

## Run database seeding

- Open terminal or command prompt inside `popcorntime` directory
- Run `npm run seed` : This command will add a user, an admin and around 1900+ movies to MongoDB
- Dummy User : `johndoe` (pwd - `johndoe!Xop`)
- Dummy Admin : `admin` (pwd - `admin$Sgl`)

## Run project

- Open terminal or command prompt inside `popcorntime` directory
- Run `npm start` : This command starts the app and returns its endpoint (Usually http://localhost:3000)
- Open this endpoint on any web browser to use the app

## How to use the app

- From the homescreen, search for movies based on movie name, actor or director name and see details and reviews for movies
- From the navigation screen, open the 'Hall of fame' page for top-rated movies in the app
- Sign up or log in as a registered user to create a wishlist, add reviews for movies, reply, like or dislike reviews added by other users
- Sign up or log in as an admin to manually add a movie, edit or delete information on a movie

## Github link

https://github.com/darkerror96/popcorntime
