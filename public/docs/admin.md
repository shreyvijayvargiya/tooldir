# Admin Panel

The Admin Panel is a comprehensive content management system for SAAS Starter boilerplate. This document covers all admin features, components, and usage.

## Overview

The Admin Panel provides a centralized interface for managing:
- Blogs and content
- Email campaigns
- Subscribers
- Users and teams
- Customers and payments
- Messages and contact forms

**Location**: `app/admin/index.jsx`

**Route**: `/admin`

## Access Control

### Authentication Required

- Users must be authenticated via Firebase Auth
- Role is checked from Firestore `teams` collection
- Permissions are enforced based on role

### Role-Based Features

- **Admin**: Full access to all features
- **Editor**: Content management, email sending
- **Author**: Create/edit own content only
- **Viewer**: Read-only access

## Navigation

### Sidebar Navigation

**Sections**:
1. **Home**: Dashboard with statistics
2. **Blogs**: Blog post management
3. **Emails**: Email campaign management
4. **Subscribers**: Subscriber list management
5. **Users**: User management
6. **Customers**: Customer and subscription management
7. **Payments**: Payment records
8. **Messages**: Contact form messages

### Search

- **Shortcut**: `Cmd/Ctrl + K`
- **Component**: `app/admin/components/SearchModal.jsx`
- **Features**:
  - Search across all content types
  - Quick navigation
  - Keyboard shortcuts

## Home Tab

**Component**: `app/admin/components/HomeTab.jsx`

**Features**:
- Dashboard statistics
- Recent activity
- Quick actions
- Analytics overview

**Statistics Displayed**:
- Total blogs
- Total subscribers
- Total users
- Total customers
- Revenue metrics
- Recent payments

## Blogs Tab

**Component**: `app/admin/components/BlogTab.jsx`

### Features

1. **Blog List**
   - View all blogs
   - Filter by status (draft/published)
   - Search blogs
   - Sort by date

2. **Create Blog**
   - Click "Create New Blog"
   - Opens blog editor
   - Rich text editing with Tiptap

3. **Edit Blog**
   - Click on blog to edit
   - Update content, title, status
   - Save changes

4. **Delete Blog**
   - Delete button on blog card
   - Confirmation modal
   - Permanent deletion

5. **Publish/Unpublish**
   - Toggle publish status
   - Set published date
   - Update slug

### Blog Editor

**Location**: `pages/admin/editor/blog.jsx`

**Features**:
- Tiptap rich text editor
- Image upload
- Markdown support
- Character count
- Auto-save (optional)
- Preview mode

**Editor Extensions**:
- Bold, italic, underline
- Headings
- Lists (ordered, unordered)
- Links
- Images
- Blockquotes
- Code blocks
- Text alignment
- Colors
- Highlight

## Emails Tab

**Component**: `app/admin/components/EmailTab.jsx`

### Features

1. **Email List**
   - View all emails
   - Filter by status (draft/sent)
   - View recipient count
   - Search emails

2. **Create Email**
   - Rich text editor
   - Subject line
   - HTML content
   - Save as draft

3. **Send Email**
   - Send to subscribers
   - Send to users
   - Batch sending
   - Statistics tracking

4. **Email Templates**
   - Pre-built templates
   - Custom HTML
   - Responsive design

### Email Editor

**Location**: `pages/admin/editor/email.jsx`

**Features**:
- Tiptap editor
- HTML preview
- Send test email
- Schedule sending (future feature)

## Subscribers Tab

**Component**: `app/admin/components/SubscribersTab.jsx`

### Features

1. **Subscriber List**
   - View all subscribers
   - Filter by status (active/unsubscribed)
   - Search by email/name
   - Export list

2. **Add Subscriber**
   - Manual entry
   - Import from CSV (future)
   - Bulk import

3. **Manage Subscribers**
   - Unsubscribe
   - Resubscribe
   - Delete subscriber
   - Send email to subscriber

4. **Statistics**
   - Total subscribers
   - Active subscribers
   - Unsubscribed count
   - Growth chart

## Users Tab

**Component**: `app/admin/components/UsersTab.jsx`

### Features

1. **User List**
   - View all authenticated users
   - Filter by verification status
   - Search users
   - View user details

2. **User Management**
   - View user profile
   - See last sign-in
   - View provider (Google/Email)
   - Send email to user

3. **User Statistics**
   - Total users
   - Verified users
   - Users by provider

## Customers Tab

**Component**: `app/admin/components/CustomersTab.jsx`

### Features

1. **Customer List**
   - View all customers
   - Filter by subscription status
   - Search customers
   - View subscription details

2. **Customer Details**
   - Subscription plan
   - Payment status
   - Expiration date
   - Payment history

3. **Subscription Management**
   - Cancel subscription
   - View subscription details
   - Update customer info

4. **Statistics**
   - Total customers
   - Active subscriptions
   - Revenue metrics

## Payments Tab

**Component**: `app/admin/components/PaymentsTab.jsx`

### Features

1. **Payment List**
   - View all payments
   - Filter by status
   - Filter by customer
   - Search payments

2. **Payment Details**
   - Payment amount
   - Payment status
   - Customer information
   - Plan details
   - Payment date

3. **Statistics**
   - Total revenue
   - Successful payments
   - Failed payments
   - Revenue chart

## Messages Tab

**Component**: `app/admin/components/MessagesTab.jsx`

### Features

1. **Message List**
   - View all contact form messages
   - Filter by status (new/replied)
   - Search messages
   - Sort by date

2. **View Message**
   - Full message content
   - Sender information
   - Message date

3. **Reply to Message**
   - Reply via email
   - Include original message
   - Mark as replied
   - Send reply

## UI Components

### Modals

**Confirmation Modal**: `lib/ui/ConfirmationModal.jsx`
- Confirm destructive actions
- Customizable message
- Variant support (danger, info, etc.)

**Login Modal**: `lib/ui/LoginModal.jsx`
- Email/password sign in
- Google sign in
- Sign up option

**Search Modal**: `app/admin/components/SearchModal.jsx`
- Global search
- Keyboard navigation
- Quick actions

### Tables

**Table Skeleton**: `lib/ui/TableSkeleton.jsx`
- Loading state
- Consistent styling

### Forms

- Input validation
- Error handling
- Loading states
- Success feedback

## State Management

### React Query

- Server state caching
- Automatic refetching
- Optimistic updates
- Background sync

**Usage**:
```javascript
const { data, isLoading } = useQuery({
  queryKey: ['blogs'],
  queryFn: getAllBlogs
});
```

### Redux

- Global application state
- Subscription state
- User preferences
- Persisted state

### Local State

- Component-specific state
- UI toggles
- Form inputs
- Modal states

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: Open search modal
- `Esc`: Close modals
- `Enter`: Submit forms
- Arrow keys: Navigate lists

## Responsive Design

### Mobile Support

- Collapsible sidebar
- Touch-friendly buttons
- Responsive tables
- Mobile navigation

### Desktop Features

- Full sidebar
- Keyboard shortcuts
- Hover states
- Multi-column layouts

## Performance Optimizations

1. **Code Splitting**: Lazy load admin components
2. **Caching**: React Query caching
3. **Pagination**: Large lists paginated
4. **Debouncing**: Search input debounced
5. **Memoization**: Expensive computations memoized

## Error Handling

### Error States

- Network errors
- Validation errors
- Permission errors
- Not found errors

### Error Display

- Toast notifications
- Error messages
- Retry options
- Fallback UI

## Best Practices

1. **Permissions**: Always check before actions
2. **Validation**: Validate inputs
3. **Feedback**: Show loading/success states
4. **Confirmation**: Confirm destructive actions
5. **Error Handling**: Handle all errors gracefully
6. **Performance**: Optimize queries and renders
7. **Accessibility**: Use semantic HTML and ARIA

## Customization

### Adding New Tabs

1. Create component in `app/admin/components/`
2. Add route in `app/admin/index.jsx`
3. Add navigation item
4. Configure permissions

### Customizing Styles

- Tailwind CSS classes
- Custom components
- Theme configuration
- Responsive breakpoints

## Troubleshooting

### Common Issues

1. **Role not updating**: Clear cache, refresh
2. **Permissions denied**: Check role in teams collection
3. **Data not loading**: Check Firebase config
4. **Editor not working**: Check Tiptap dependencies

### Debug Mode

Enable debug logging:
```javascript
console.log('User role:', userRole);
console.log('Permissions:', permissions);
```

## Environment Variables

```env
# Required for admin panel
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase vars
```

## Future Enhancements

- Analytics dashboard
- Content scheduling
- Bulk operations
- Advanced search
- Custom fields
- Workflow management
- Team collaboration
- Activity logs

