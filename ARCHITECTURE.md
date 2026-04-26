# 🏗️ Component Architecture

## Visual Hierarchy

```
App
│
├── Login Page
│   └── Glass Card
│       ├── Brand Logo (Gradient)
│       ├── Email Input (Icon + Field)
│       ├── Password Input (Icon + Field)
│       ├── Submit Button (Gradient)
│       └── Register Link
│
├── Register Page
│   └── Glass Card
│       ├── Brand Logo (Gradient)
│       ├── Full Name Input (Icon + Field)
│       ├── Username Input (Icon + Field)
│       ├── Email Input (Icon + Field)
│       ├── Password Input (Icon + Field)
│       ├── Confirm Password Input (Icon + Field)
│       ├── Gender Selection (Button Toggle)
│       ├── Submit Button (Gradient)
│       └── Login Link
│
├── Home Page
│   └── Grid Layout
│       ├── Sidebar (Col 1)
│       │   ├── Header
│       │   │   ├── Title
│       │   │   └── Actions (Profile, Logout)
│       │   ├── Search Bar
│       │   │   ├── Search Icon
│       │   │   ├── Input Field
│       │   │   └── Clear Button
│       │   └── User List
│       │       ├── Section Label
│       │       └── User Items
│       │           ├── Avatar (with online dot)
│       │           ├── User Info
│       │           └── New Badge (conditional)
│       │
│       └── Message Container (Col 2)
│           ├── Header
│           │   ├── Back Button (mobile)
│           │   ├── User Info
│           │   │   ├── Avatar (with online dot)
│           │   │   └── Name + Status
│           │   └── Menu Button
│           │       └── Dropdown
│           │           └── Block/Unblock
│           ├── Block Warning (conditional)
│           ├── Messages Area
│           │   ├── Loading State
│           │   ├── Empty State
│           │   └── Message Bubbles
│           │       ├── Message Text
│           │       └── Timestamp
│           └── Input Area
│               ├── Text Input
│               └── Send Button
│
└── Profile Page
    └── Glass Card
        ├── Back Button
        ├── Header
        ├── Profile Picture (with online dot)
        ├── Form
        │   ├── Full Name Input (Icon + Field)
        │   ├── Username Input (Icon + Field)
        │   ├── Email Input (Icon + Field)
        │   └── Gender Select
        └── Actions
            ├── Save Button (Gradient)
            └── Delete Button (Red)
```

## Component Breakdown

### 🎨 Reusable Components

#### **Spinner** (`components/Loading.jsx`)
```jsx
<Spinner size="sm|md|lg" className="..." />
```
- Small: 16px (w-4 h-4)
- Medium: 32px (w-8 h-8)
- Large: 48px (w-12 h-12)

#### **LoadingScreen** (`components/Loading.jsx`)
```jsx
<LoadingScreen message="Loading..." />
```
- Full screen centered
- Spinner + message

#### **LoadingCard** (`components/Loading.jsx`)
```jsx
<LoadingCard message="Loading..." />
```
- Card-sized loading
- Spinner + message

#### **EmptyState** (`components/EmptyState.jsx`)
```jsx
<EmptyState 
  icon={FiIcon}
  title="No data"
  description="Description here"
  action={handleClick}
  actionLabel="Action"
/>
```
- Icon circle
- Title + description
- Optional action button

---

### 🎯 Page Components

#### **Login** (`Login/Login.jsx`)
**Props:** None
**State:** 
- userInput (email, password)
- loading

**Features:**
- Form validation
- Error handling
- Loading state
- Navigation to register

---

#### **Register** (`register/Register.jsx`)
**Props:** None
**State:**
- inputData (fullname, username, email, password, confpassword, gender)
- loading

**Features:**
- Form validation
- Password matching
- Gender selection
- Error handling
- Navigation to login

---

#### **Home** (`home/Home.jsx`)
**Props:** None
**State:**
- selectedUser
- isSidebarVisible

**Features:**
- Responsive layout
- Sidebar toggle (mobile)
- Grid system

---

#### **Sidebar** (`home/components/Sidebar.jsx`)
**Props:**
- onSelectUser (function)

**State:**
- searchInput
- searchUser
- chatUser
- loading
- selectedUserId
- newMessage

**Features:**
- User search
- Recent chats
- Online status
- New message badges
- Profile navigation
- Logout

---

#### **MessageContainer** (`home/components/MessageContainer.jsx`)
**Props:**
- onBackUser (function)

**State:**
- loading
- sending
- sendData
- isBlocked
- showMenu

**Features:**
- Message display
- Send messages
- Block/Unblock
- Empty states
- Loading states
- Auto-scroll
- Sound notifications

---

#### **Profile** (`home/components/Profile.jsx`)
**Props:** None
**State:**
- userInput (fullname, username, email, gender)
- loading
- deleting

**Features:**
- Profile editing
- Account deletion
- Form validation
- Loading states
- Navigation

---

## 🎨 Design Tokens

### Colors
```css
--primary: 262 83% 58%        /* Purple */
--secondary: 210 40% 96.1%    /* Light Gray */
--destructive: 0 84.2% 60.2%  /* Red */
--muted: 210 40% 96.1%        /* Muted Gray */
--border: 214.3 31.8% 91.4%   /* Border Gray */
```

### Spacing
```
xs: 4px   (p-1)
sm: 8px   (p-2)
md: 12px  (p-3)
lg: 16px  (p-4)
xl: 24px  (p-6)
2xl: 32px (p-8)
```

### Typography
```
xs: 12px   (text-xs)
sm: 14px   (text-sm)
base: 16px (text-base)
lg: 18px   (text-lg)
xl: 20px   (text-xl)
2xl: 24px  (text-2xl)
3xl: 30px  (text-3xl)
5xl: 48px  (text-5xl)
```

### Shadows
```
sm: shadow-sm
md: shadow-md
lg: shadow-lg
xl: shadow-xl
2xl: shadow-2xl
```

### Border Radius
```
sm: 4px    (rounded-sm)
md: 6px    (rounded-md)
lg: 8px    (rounded-lg)
xl: 12px   (rounded-xl)
2xl: 16px  (rounded-2xl)
full: 9999px (rounded-full)
```

---

## 🔄 State Management

### Zustand Store (`Zustand/useConversation.js`)
```javascript
{
  selectedConversation: null,
  setSelectedConversation: (conversation) => {},
  messages: [],
  setMessage: (messages) => {}
}
```

### Auth Context (`context/AuthContext.jsx`)
```javascript
{
  authUser: null,
  setAuthUser: (user) => {}
}
```

### Socket Context (`context/socketContext.jsx`)
```javascript
{
  socket: null,
  onlineUser: []
}
```

---

## 📱 Responsive Breakpoints

```javascript
// Tailwind Breakpoints
sm: '640px'   // Small devices
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

### Layout Behavior

**Mobile (< 768px)**
- Single column
- Toggle sidebar/messages
- Full width components

**Tablet (768px - 1024px)**
- Two columns (4/8 split)
- Sidebar always visible
- Compact spacing

**Desktop (> 1024px)**
- Two columns (3/9 split)
- Maximum width container
- Generous spacing

---

## 🎭 Animation Classes

```css
.animate-fade-in        /* Fade in effect */
.animate-slide-in-left  /* Slide from left */
.animate-slide-in-right /* Slide from right */
.animate-scale-in       /* Scale up effect */
.hover-lift             /* Lift on hover */
.glass                  /* Glassmorphism */
.gradient-text          /* Gradient text */
```

---

## 🚀 Performance Tips

1. **Use React.memo** for user list items
2. **Virtualize long lists** with react-window
3. **Lazy load images** with loading="lazy"
4. **Debounce search input** (300ms)
5. **Optimize re-renders** with useCallback
6. **Code split routes** with React.lazy

---

**This architecture supports scalability and maintainability! 🎉**
