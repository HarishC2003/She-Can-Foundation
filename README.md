# She Can Foundation - Website Project

This repository contains the frontend and backend codebase for the She Can Foundation website.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+). Optimized for maximum performance and minimal load times without using heavy frameworks like React or CSS libraries like Tailwind.
- **Backend**: Node.js and Express.js
- **Database**: Supabase (PostgreSQL)

## Local Setup

Follow these instructions to run the application locally:

1. **Install Dependencies**
   Run the following command in the root directory:
   ```bash
   npm install
   ```

2. **Environment Variables**
   You need to set up the environment variables for Supabase. Create a `.env` file in the root directory (or ensure you have the required variables if it already exists). The required variables for `src/routes/contact.js` and other routes typically include:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Start the Development Server**
   Start the local Express backend which also serves the `public/` directory:
   ```bash
   npm run start:local
   ```
   The site should now be accessible at `http://localhost:3000` (or whatever port is defined in your `src/app.js`).

## Important Notes

> [!WARNING]
> **Mocked Donation Flow**
> Please note that the donation flow triggered by the `donateForm` is currently a **mocked/demo payment confirmation**. No real payment gateway (like Stripe or Razorpay) is integrated yet. Clicking "Confirm & Pay" will immediately show a success notification for demonstration purposes. This needs to be updated with a real payment provider before accepting actual funds.

## Features
- Interactive Modals for Donations and Volunteer registration.
- Functional Contact form integrated with Supabase (`contacts` table).
- Performance optimized frontend with lazy-loaded images, minimal footprint, and responsive design.
- Three.js particle background on the Hero section (automatically disables if user prefers reduced motion).
