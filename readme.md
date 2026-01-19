# SaaS Starter Boilerplate

A comprehensive SaaS starter template built with **Next.js**, **Supabase**, and **Stripe**. Features include authentication, payments, admin panel, blog, email management, and comprehensive documentation.

## Features
- 🔐 Authentication with Supabase
- 💳 Payment processing with Stripe
- 📊 Admin dashboard
- 📝 Blog system
- 📧 Email management
- 📚 Built-in documentation

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/shreyvijayvargiya/build-saas.git
   cd buildsaas
   ```

   npm install
   # or
   yarn install
   

   Create a `.env.local` file in the root directory:

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key

   # Stripe Payments Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Resend Email Configuration
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_from_email@domain.com
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed the database

## Documentation

For detailed documentation, visit `/docs` in your browser after starting the development server, or check the documentation files in `public/docs/`.

The documentation covers:

- Getting started guide
- Architecture overview
- Authentication setup
- Payment integration
- Admin panel usage
- API documentation
- Database setup
- And more...

## Tech Stack

- **Next.js** - React framework
- **Supabase** - Backend and database
- **Stripe** - Payment processing
- **Tailwind CSS** - Styling
- **Redux** - State management

## License

MIT
