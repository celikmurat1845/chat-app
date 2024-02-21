# Real-Time Chat Application

This application is a real-time chat application that allows users to communicate instantly.

## Getting Started

To get the application up and running, follow these steps:

1. Install the necessary dependencies:

   ## `npm install`

2. To use Husky for managing your commits, run:

   ## `npm run prepare`

3. Synchronize the database with:

   ## `npm run migrate:prisma`

4. Finally, start the application using:
   ## `npm start`
   or for development purposes:
   ## `npm run dev`

## Architecture

The application is developed as a monolith:

- Backend code can be found under the `server` folder.
- Frontend code resides in the `client` folder.

## Tech Stack

- **Backend**: Node.js, Express.js, and Socket.IO
- **Frontend**: React.js
- **Database Management**: SQLite with Prisma ORM
- **Code Quality**: ESLint and Prettier for linting and formatting
- **Commit Management**: Husky and lint-staged for maintaining code quality and managing commit messages
- **Security Measures**: Helmet and CORS packages for basic security enhancements
- **Protection Against Query Injections**: Utilizing Prisma ORM

For guidance on how to commit messages, refer to [https://github.com/conventional-changelog/commitlint/#what-is-commitlint] (https://github.com/conventional-changelog/commitlint/#what-is-commitlint). Example commit messages include:

- `feat: add prettier rules`
- `fix: eslint rules`

## Features

With this application, users can:

- Engage in real-time conversations with each other.
- Create chat rooms.
- Join existing chat rooms.
- Leave chat rooms they've joined.
- See which users are online.

Security measures include the use of `npm helmet` and `npm cors` packages to mitigate common web vulnerabilities and Prisma ORM to prevent query injections.

Note: The `.env` file is not included in the `.gitignore` file because it does not contain any sensitive data.
