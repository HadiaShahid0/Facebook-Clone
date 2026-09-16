# Facebook Clone

A full-stack **Facebook Clone** built with **React.js** and **Supabase**. This project recreates common social media features such as authentication, profiles, posts, comments, likes, friends, real-time chat, notifications, blocking, reporting, and admin moderation.

## 🚀 Features

### 🔐 Authentication

* User registration and login
* Supabase Authentication
* Protected routes
* User session management
* Admin authentication and access control

### 👤 Profile

* View user profiles
* Update profile information
* Upload profile and cover images
* View user's posts
* Profile navigation

### 📝 Posts

* Create text and image posts
* Public and friends-only posts
* Like and unlike posts
* Save and unsave posts
* Share posts
* View individual posts
* Infinite scrolling feed

### 💬 Comments

* Add comments to posts
* Reply to comments
* Multi-level comment replies
* Like and unlike comments
* View all comments
* Mention users in replies

### 👥 Friends

* Send friend requests
* Accept friend requests
* Reject friend requests
* View friends
* Remove friends
* User search

### 🚫 Blocking

* Block users
* Unblock users
* View blocked users
* Blocked users are restricted from interacting with each other

### 💬 Chat

* Real-time messaging
* Chat with friends
* Message requests for non-friends
* Accept or reject message requests
* Message notifications
* Unread message count
* Real-time message updates

### 🔔 Notifications

* Friend request notifications
* Friend request accepted/rejected notifications
* Like notifications
* Comment notifications
* Message notifications
* Message request notifications
* Real-time notification updates
* Unread notification counter

### 🚨 User Reporting

* Report users
* Select report category
* Add report reason and description
* Admin report management
* Dismiss reports
* Temporary account suspension
* Permanent account suspension
* Restore suspended accounts

### 🛡️ Admin Dashboard

* Admin dashboard
* Total users count
* Total reports
* Pending reports
* Suspended users
* Reported users
* View user reports
* Moderate reported accounts
* Real-time dashboard updates

### 🔒 Security

* Supabase Row Level Security (RLS)
* Storage RLS policies
* Protected routes
* Admin-only routes
* User blocking restrictions
* Account suspension restrictions
* Supabase Authorization

### ⚡ Real-Time Features

Supabase Realtime is used for live updates including:

* New posts
* Comments
* Likes
* Friend requests
* Notifications
* Messages
* User reports
* Account suspension/restoration
* Admin dashboard updates

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Bootstrap 5
* React Feather
* Vite

### Backend / Database

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage
* Supabase Realtime
* Row Level Security (RLS)

## 📁 Project Structure

```text
src/
├── components/
│   └── layout/
│   └── common/
│
├── features/
│   ├── admin/
│   ├── auth/
│   ├── users/
│
├── services/
│
├── utils/
│   └── supabase.js
│
├── routes/
│
└── App.jsx
```

The project follows a **feature-based folder structure**, keeping components, services, and logic organized by functionality.

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/HadiaShahid0/Facebook-Clone.git
```

### 2. Navigate to the project

```bash
cd Facebook-Clone
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create a Supabase project

Create a project in Supabase and configure:

* Authentication
* PostgreSQL database
* Storage buckets
* Realtime
* Row Level Security policies
* Storage Bucket RLS policies

Supabase provides Auth, Database, Storage, and Realtime functionality for React applications.

### 5. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit your private credentials to GitHub.

### 6. Start the development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## 🗄️ Supabase

The application uses Supabase for:

| Service       | Purpose                        |
| ------------- | ------------------------------ |
| Supabase Auth | User authentication            |
| PostgreSQL    | Application database           |
| Storage       | Profile, cover and post images |
| Realtime      | Live application updates       |
| RLS           | Database and storage security  |

## 🔄 Application Flow

```text
User
 │
 ├── Authentication
 │
 ├── Home Feed
 │    ├── Create Post
 │    ├── Like
 │    ├── Comment
 │    ├── Reply
 │    ├── Save
 │    └── Share
 │
 ├── Friends
 │    ├── Friend Requests
 │    ├── Friends List
 │    └── Block / Unblock
 │
 ├── Chat
 │    ├── Message Request
 │    ├── Accept / Reject
 │    └── Real-Time Messages
 │
 ├── Notifications
 │
 ├── Profile
 │    └── Report Users
 │
 └── Admin
      ├── Reports
      ├── Suspended Users
      ├── User Moderation
      └── Dashboard
```

## 🔐 Security

This project uses Supabase **Row Level Security (RLS)** to control access to database records and Storage resources.

Authentication is handled by Supabase Auth, while application permissions such as user and admin access are enforced through the application's route and database security rules.

## 📱 Responsive Design

The application is designed to work across:

* Desktop
* Tablet
* Mobile

The project includes responsive navigation and layouts for smaller screens.

## 🎯 Project Purpose

This project was created to practice and demonstrate:

* React.js development
* Feature-based project architecture
* Supabase integration
* Authentication
* PostgreSQL database operations
* Row Level Security
* Supabase Storage
* Real-time applications
* Social media functionality
* User moderation
* Admin dashboard development

## 📌 Future Improvements

Possible future improvements include:

* Media messages in chat
* Add notification system on admin side
* Advanced admin analytics
* Deployment and production optimization

## 👩‍💻 Author

**Hadia Shahid**

GitHub:
https://github.com/HadiaShahid0
