# TaskFlow v2 – Full Stack To-Do App (Auth + Profiles + Student/User tasks)

**Stack:** HTML/CSS/JS · Node.js + Express · MongoDB (Mongoose) · JWT + bcrypt

## Features
- Register / Login (JWT, passwords hashed with bcrypt)
- Two account types: **Student** and **User**
- Profile page: avatar, bio, phone, student details (college, course, year), task stats, change password
- Private tasks per account: add, edit (title + due date), delete, mark complete, filter
- Student tasks: Assignment / Exam / Project / Revision + subject
- User tasks: Personal / Work / Shopping / Bills
- Priority (low/medium/high) and due dates with overdue highlight

## Run
1. `npm install`
2. Edit `.env` (set a long random `JWT_SECRET`, and `MONGO_URI`)
3. `npm start` → http://localhost:3000 (redirects to login)

## API
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | no | create account |
| POST | /api/auth/login | no | get token |
| GET / PUT | /api/auth/me | yes | view / update profile |
| PUT | /api/auth/me/password | yes | change password |
| GET / POST | /api/tasks | yes | list / add tasks |
| PUT | /api/tasks/:id | yes | edit |
| PATCH | /api/tasks/:id/toggle | yes | complete / undo |
| DELETE | /api/tasks/:id | yes | delete |

## Design
Colors: navy #1E1B4B (text), indigo #4F46E5 (brand/actions), emerald #10B981 (done, student badge), amber #F59E0B (edit), rose #E11D48 (delete/high priority), background #F5F7FF.
Fonts: Poppins (headings/buttons), Inter (body), JetBrains Mono (counters, dates, role tags).
