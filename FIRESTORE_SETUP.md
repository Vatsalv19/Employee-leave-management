# Firebase Setup Guide

This project uses Firebase Authentication and Firestore. Follow these steps to set it up:

## Prerequisites

- Firebase project already created (you have the credentials in `.env`)

---

## Step 1: Enable Firebase Authentication

**⚠️ IMPORTANT: You must do this first before you can login!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `employee-leave-managemen-6d86c`
3. In the left sidebar, click on **"Authentication"**
4. Click on the **"Sign-in method"** tab
5. Click on **"Email/Password"**
6. **Enable** the toggle for "Email/Password"
7. Click **"Save"**

Direct link: https://console.firebase.google.com/project/employee-leave-managemen-6d86c/authentication/providers

---

## Step 2: Enable Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `employee-leave-managemen-6d86c`
3. In the left sidebar, click on **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select your preferred Cloud Firestore location (e.g., `asia-south1` for India)
7. Click **"Enable"**

Direct link: https://console.firebase.google.com/project/employee-leave-managemen-6d86c/firestore

---

## Step 3: Register Your First User

Since the mock users in the database don't have Firebase Auth accounts, you need to:

1. Go to the **Register** page in the app (`/register`)
2. Create a new account with your email and password
3. Login with your new credentials

**Note:** The "Quick Login" demo users won't work until you create them in Firebase Auth.

---

## Step 4: (Optional) Create Demo Users in Firebase Auth

If you want the demo quick-login to work:

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Create these users:
   - `vatsal@company.com` / `password123` (Employee)
   - `rahul@company.com` / `password123` (Manager)
   - `admin@company.com` / `admin123` (Admin)

---

## Firestore Collections

The app uses the following collections:

| Collection | Description |
|------------|-------------|
| `users` | Employee/admin user profiles |
| `leaveRequests` | Leave applications |
| `leaveBalances` | Leave balance per user per leave type |
| `notifications` | User notifications |
| `holidays` | Company holidays |
| `departments` | Department information |
| `leaveTypes` | Types of leaves (Sick, Casual, etc.) |
| `policies` | Leave policies |
| `settings` | Company-wide settings |

## Initial Data Seeding

The app no longer auto-seeds runtime data from local mock files. Populate your Firestore collections directly (or via an admin script) for production-like behavior.

## Troubleshooting

### Error: CONFIGURATION_NOT_FOUND
This means Firestore hasn't been enabled yet. Follow Step 1 above.

### Error: Missing or insufficient permissions
Make sure you're authenticated and the Firestore rules allow access.

### Error: Index required
The console will provide a link to create the required index. Click it and create the index, or deploy the `firestore.indexes.json` file.

## Environment Variables

Make sure these are set in your `.env` file:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```
