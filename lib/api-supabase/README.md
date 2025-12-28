# Supabase API Methods

This directory contains Supabase API methods that mirror the Firestore API methods. These methods allow you to use Supabase as your database backend instead of Firestore.

## Setup

1. Install the Supabase client library:
```bash
npm install @supabase/supabase-js
```

2. Set up environment variables in your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

3. Run the SQL migration script to create the necessary tables:
   - Open your Supabase Dashboard
   - Go to SQL Editor
   - Run the `supabase-migrations.sql` file from the root directory

4. Set up Storage Bucket (for file uploads):
   - Go to Storage in Supabase Dashboard
   - Create a new bucket named `saas-starter-storage`
   - Make it public if you want public access to uploaded files
   - Or run the storage setup commands from the migration file

## Available API Methods

### Blogs (`blog.js`)
- `getAllBlogs(status?)` - Get all blogs, optionally filtered by status
- `getBlogById(id)` - Get a single blog by ID
- `createBlog(blogData)` - Create a new blog
- `updateBlog(id, blogData)` - Update an existing blog
- `deleteBlog(id)` - Delete a blog
- `publishBlog(id)` - Publish a draft blog
- `getBlogsByStatus(status)` - Get blogs by status

### Emails (`emails.js`)
- `getAllEmails()` - Get all emails
- `getEmailById(id)` - Get a single email by ID
- `createEmail(emailData)` - Create a new email
- `updateEmail(id, emailData)` - Update an existing email
- `deleteEmail(id)` - Delete an email
- `markEmailAsSent(id, recipients)` - Mark email as published/sent

### Subscribers (`subscribers.js`)
- `getAllSubscribers(status?)` - Get all subscribers, optionally filtered by status
- `getActiveSubscribers()` - Get active subscribers only
- `getSubscriberById(id)` - Get a single subscriber by ID
- `getSubscriberByEmail(email)` - Get subscriber by email
- `addSubscriber(subscriberData)` - Add a new subscriber
- `updateSubscriber(id, subscriberData)` - Update an existing subscriber
- `deleteSubscriber(id)` - Delete a subscriber
- `unsubscribeSubscriber(id)` - Unsubscribe a subscriber

### Users (`users.js`)
- `getAllUsers()` - Get all users
- `getUsersWithVerifiedEmails()` - Get users with verified emails
- `getUserById(id)` - Get user by ID
- `getUserByEmail(email)` - Get user by email
- `saveUser(userData)` - Create or update user
- `updateUserLastSignIn(id)` - Update user's last sign in time

### Upload (`upload.js`)
- `uploadFile(file, path)` - Upload a file to Supabase Storage
- `uploadImageFromDataUrl(dataUrl, path)` - Upload image from base64 data URL
- `uploadBannerImage(file, blogId?)` - Upload banner image for a blog
- `uploadContentImages(htmlContent, blogId?)` - Upload content images from HTML
- `uploadBlogImages(blogData, bannerFile?, blogId?)` - Upload all images for a blog

## Usage Example

```javascript
// Instead of importing from lib/api/blog.js
// import { getAllBlogs, createBlog } from '@/lib/api/blog';

// Import from lib/api-supabase/blog.js
import { getAllBlogs, createBlog } from '@/lib/api-supabase/blog';

// Use the same way
const blogs = await getAllBlogs('published');
const blogId = await createBlog({
  title: 'My Blog Post',
  slug: 'my-blog-post',
  content: '<p>Content here</p>',
  author: 'John Doe',
  status: 'draft'
});
```

## Database Schema

The Supabase tables mirror the Firestore collections:

- **blogs**: Stores blog posts with title, slug, content, author, status, etc.
- **emails**: Stores email templates and campaigns
- **subscribers**: Stores newsletter subscribers
- **teams**: Stores team members with roles
- **users**: Stores user information (optional, for user management)

## Notes

- All timestamps are stored as `TIMESTAMPTZ` (timestamp with timezone)
- UUIDs are used as primary keys instead of Firestore document IDs
- The `updated_at` field is automatically updated via database triggers
- Row Level Security (RLS) is enabled by default - adjust policies based on your needs
- Storage bucket must be created manually in Supabase Dashboard or via CLI

## Migration from Firestore

To switch from Firestore to Supabase:

1. Run the migration SQL script
2. Update your imports from `lib/api/*` to `lib/api-supabase/*`
3. Ensure environment variables are set
4. Test all functionality

The API method signatures are identical, so the migration should be straightforward.

