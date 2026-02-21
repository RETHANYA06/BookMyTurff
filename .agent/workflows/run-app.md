---
description: How to run the BookMyTurf application
---

Follow these steps to start both the backend server and the frontend development environment.

1. **Start the MongoDB Server**
   Ensure you have MongoDB running locally on `mongodb://127.0.0.1:27017`.

2. **Start the Backend Server**
   // turbo
   `node server/index.js`
   The server will run on `http://localhost:5000`.

3. **Start the Frontend Development Server**
   // turbo
   `npm run dev`
   The application will be available at `http://localhost:5173`.

4. **Initial Setup**
   - Navigate to `http://localhost:5173/register` to create a manager account and your first turf.
   - Go to the **Slot Control Panel** in the manager dashboard to auto-generate slots for the day.
   - Public users can then view and book your turf from the home page.
