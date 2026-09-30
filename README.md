# Smart Task Manager

A full-stack task management web application developed as part of the Full Stack Developer assignment.

## Features

- User Registration
- User Login
- View all users
- Create tasks
- Edit tasks
- Delete tasks
- Assign tasks to users
- Task priorities:
  - Low
  - Medium
  - High
- Task statuses:
  - To Do
  - In Progress
  - Done
- Task dependencies
- Blocked task detection
- Prevent task completion when its dependency is incomplete
- My Tasks view
- Blocked Tasks view
- Priority filtering
- Dashboard with task statistics
- Responsive user interface

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- JavaScript
- In-memory storage

## Project Structure

```text
Smart_Task_Manager/
│
├── backend/
│   ├── controllers/
│   ├── Data/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md