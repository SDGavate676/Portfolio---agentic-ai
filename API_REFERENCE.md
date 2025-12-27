# API Reference & Developer Documentation

Complete technical documentation for developers.

## 📚 Table of Contents
1. [JavaScript Classes](#javascript-classes)
2. [localStorage API](#localstorage-api)
3. [Admin Panel API](#admin-panel-api)
4. [Configuration](#configuration)
5. [Customization](#customization)
6. [Troubleshooting](#troubleshooting)

## 🔷 JavaScript Classes

### PortfolioApp Class

Main class for the portfolio website.

#### Constructor
```javascript
new PortfolioApp()
```

Creates a new instance and initializes the app.

#### Methods

##### `init()`
```javascript
portfolio.init()
```
Initializes the application. Called automatically on DOMContentLoaded.

##### `loadTheme()`
```javascript
portfolio.loadTheme()
```
Loads theme preference from localStorage and applies it.

##### `applyTheme()`
```javascript
portfolio.applyTheme()
```
Applies the current theme (light/dark) to the DOM.

##### `toggleTheme()`
```javascript
portfolio.toggleTheme()
```
Toggles between light and dark mode.

**Returns**: None
**Side Effects**: Updates DOM, saves to localStorage

##### `loadPortfolioData()`
```javascript
const data = portfolio.loadPortfolioData()
```
Loads portfolio data from localStorage or returns defaults.

**Returns**: Object with portfolio structure

##### `savePortfolioData()`
```javascript
portfolio.savePortfolioData()
```
Saves current portfolio data to localStorage.

##### `navigateTo(page)`
```javascript
portfolio.navigateTo('about')
```
Navigates to a specific page.

**Parameters**:
- `page` (string): Page name ('home', 'about', 'experience', 'education', 'resume', 'contact')

**Returns**: None

##### `displayContent()`
```javascript
portfolio.displayContent()
```
Renders content for the current page to the DOM.

##### `getPageContent()`
```javascript
const html = portfolio.getPageContent()
```
Generates HTML content for the current page.

**Returns**: HTML string

##### `handleFormSubmit(event)`
```javascript
element.addEventListener('submit', (e) => portfolio.handleFormSubmit(e))
```
Handles contact form submission.

**Parameters**:
- `event` (Event): Form submit event

**Returns**: None

##### `showMessage(message, type)`
```javascript
portfolio.showMessage('Success!', 'success')
```
Displays a notification message.

**Parameters**:
- `message` (string): Message text
- `type` (string): 'success', 'error', 'warning' (default: 'success')

**Returns**: None

### AdminDashboard Class

Main class for the admin panel.

#### Constructor
```javascript
new AdminDashboard()
```

Creates admin instance and initializes dashboard.

#### Key Methods

##### `checkAuth()`
```javascript
admin.checkAuth()
```
Verifies user is logged in. Redirects to login if not.

##### `loadPortfolioData()`
```javascript
const data = admin.loadPortfolioData()
```
Loads portfolio data from localStorage.

**Returns**: Portfolio data object

##### `savePortfolioData()`
```javascript
admin.savePortfolioData()
```
Saves portfolio data to localStorage.

##### `switchSection(section, link)`
```javascript
admin.switchSection('profile', navLink)
```
Switches to a different admin section.

**Parameters**:
- `section` (string): Section name
- `link` (Element): Navigation link element

##### `saveProfile()`
```javascript
admin.saveProfile()
```
Saves profile information.

##### `saveAbout()`
```javascript
admin.saveAbout()
```
Saves about section information.

##### `saveExperience(event)`
```javascript
form.addEventListener('submit', (e) => admin.saveExperience(e))
```
Saves experience entry.

##### `saveEducation(event)`
```javascript
form.addEventListener('submit', (e) => admin.saveEducation(e))
```
Saves education entry.

##### `loadMessages()`
```javascript
admin.loadMessages()
```
Loads and displays contact form messages.

##### `saveTheme()`
```javascript
admin.saveTheme()
```
Saves theme customization.

##### `toggleDarkMode(event)`
```javascript
checkbox.addEventListener('change', (e) => admin.toggleDarkMode(e))
```
Toggles dark mode.

## 💾 localStorage API

### Data Structure

#### `portfolio-data`
```javascript
{
  profile: {
    name: string,
    title: string,
    bio: string,
    profilePhoto: string (base64 or URL),
    email: string,
    phone: string,
    location: string,
    socialLinks: {
      linkedin: string,
      github: string,
      instagram: string,
      twitter: string
    }
  },
  about: {
    description: string,
    background: string,
    skills: string[],
    interests: string[]
  },
  experience: [
    {
      id: number,
      title: string,
      company: string,
      startDate: string,
      endDate: string,
      description: string,
      skills: string[]
    },
    ...
  ],
  education: [
    {
      id: number,
      degree: string,
      institution: string,
      year: string,
      field: string,
      gpa: string
    },
    ...
  ],
  contact: {
    formSubmissions: [
      {
        name: string,
        email: string,
        subject: string,
        message: string,
        timestamp: string (ISO 8601)
      },
      ...
    ]
  },
  resume: string (base64) or null
}
```

#### `portfolio-theme`
```javascript
'light' | 'dark'
```

#### `portfolio-theme-colors`
```javascript
{
  primaryColor: string (hex),
  secondaryColor: string (hex),
  accentColor: string (hex),
  isDark: boolean
}
```

#### `admin-token`
```javascript
{
  token: string,
  userId: number,
  email: string,
  name: string,
  loginTime: string (ISO 8601),
  expiresAt: string (ISO 8601)
}
```

#### `admin-users`
```javascript
[
  {
    id: number,
    email: string,
    password: string (hashed),
    name: string,
    createdAt: string (ISO 8601)
  },
  ...
]
```

### Accessing Data

```javascript
// Read data
const data = JSON.parse(localStorage.getItem('portfolio-data'))

// Write data
localStorage.setItem('portfolio-data', JSON.stringify(data))

// Remove data
localStorage.removeItem('portfolio-data')

// Clear all
localStorage.clear()
```

## 🔐 Admin Panel API

### Login/Authentication

#### Login
```javascript
// Email: admin@portfolio.com
// Password: Admin123!
```

#### Session Management
```javascript
// Check if logged in
const token = localStorage.getItem('admin-token')
if (token) {
  const session = JSON.parse(token)
  const isExpired = new Date(session.expiresAt) < new Date()
}

// Logout
admin.logout()
// or manually:
localStorage.removeItem('admin-token')
```

### CRUD Operations

#### Create
```javascript
// Add experience
admin.portfolioData.experience.push({
  id: Date.now(),
  title: 'Job Title',
  company: 'Company',
  startDate: '2020',
  endDate: 'Present',
  description: 'Description',
  skills: ['Skill1', 'Skill2']
})
admin.savePortfolioData()

// Add education
admin.portfolioData.education.push({
  id: Date.now(),
  degree: 'Bachelor',
  institution: 'University',
  year: '2019',
  field: 'Computer Science',
  gpa: '3.8/4.0'
})
admin.savePortfolioData()
```

#### Read
```javascript
// Get profile
const profile = admin.portfolioData.profile

// Get experience list
const experiences = admin.portfolioData.experience

// Get education list
const education = admin.portfolioData.education

// Get messages
const messages = admin.portfolioData.contact.formSubmissions
```

#### Update
```javascript
// Update profile
admin.portfolioData.profile.name = 'New Name'

// Update experience
const exp = admin.portfolioData.experience.find(e => e.id === expId)
if (exp) {
  exp.title = 'New Title'
}

admin.savePortfolioData()
```

#### Delete
```javascript
// Delete experience
admin.portfolioData.experience = 
  admin.portfolioData.experience.filter(e => e.id !== expId)

// Delete education
admin.portfolioData.education = 
  admin.portfolioData.education.filter(e => e.id !== eduId)

// Delete message
admin.portfolioData.contact.formSubmissions = 
  admin.portfolioData.contact.formSubmissions.filter((m, i) => i !== msgIndex)

admin.savePortfolioData()
```

## ⚙️ Configuration

### Theme Colors

CSS Variables (editable via admin panel):
```css
--primary-color: #6366f1
--secondary-color: #ec4899
--accent-color: #f59e0b
--dark-bg: #0f172a
--light-bg: #ffffff
--dark-text: #1e293b
--light-text: #f8fafc
```

### Fonts

Google Fonts imported:
```css
'Poppins': 300, 400, 500, 600, 700, 800
'Playfair Display': 600, 700, 800
```

### Responsive Breakpoints

```css
Mobile: 320px - 480px
Tablet: 480px - 768px
Desktop: 768px+
```

### Animation Timings

```javascript
Smooth scroll: enabled
Page transitions: 0.3s
Hover effects: 0.3s
Animations: 0.6s - 1s
```

## 🎨 Customization Guide

### Change Color Scheme Programmatically

```javascript
// Change primary color
document.documentElement.style.setProperty('--primary-color', '#8b5cf6')

// Change secondary color
document.documentElement.style.setProperty('--secondary-color', '#06b6d4')

// Change accent color
document.documentElement.style.setProperty('--accent-color', '#ec4899')

// Save for persistence
const theme = {
  primaryColor: '#8b5cf6',
  secondaryColor: '#06b6d4',
  accentColor: '#ec4899'
}
localStorage.setItem('portfolio-theme-colors', JSON.stringify(theme))
```

### Add Custom Animations

```css
@keyframes customAnimation {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.element {
  animation: customAnimation 0.6s ease forwards;
}
```

### Add New Page

1. Create content in `getPageContent()`:
```javascript
getCustomContent() {
  return `<section><h2>Custom Page</h2>...</section>`
}
```

2. Add to navigation:
```html
<li><a href="#custom">Custom</a></li>
```

3. Update handler:
```javascript
if (page === 'custom') return this.getCustomContent()
```

### Connect External Service

#### Email API
```javascript
// In admin.js
const sendEmail = async (data) => {
  const response = await fetch('https://api.emailservice.com/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: data.email,
      subject: data.subject,
      message: data.message
    })
  })
  return response.json()
}
```

## 🐛 Troubleshooting

### Data Not Saving

**Problem**: Changes don't persist after reload.

**Solutions**:
1. Check localStorage quota: `console.log(localStorage.length)`
2. Verify save is called: `console.log(localStorage.getItem('portfolio-data'))`
3. Check browser storage settings
4. Try clearing cache

### Admin Login Issues

**Problem**: Cannot login to admin panel.

**Solutions**:
1. Verify credentials in `admin/login.html`
2. Clear localStorage: `localStorage.clear()`
3. Check browser console for errors
4. Try incognito mode

### Animations Not Working

**Problem**: Page transitions and animations are slow or not playing.

**Solutions**:
1. Check if animations are disabled in OS settings
2. Verify CSS file is loaded
3. Check browser performance
4. Reduce animation duration for testing

### Images Not Loading

**Problem**: Profile photo or other images don't display.

**Solutions**:
1. Check image path is correct
2. Verify file exists in folder
3. Check file size (< 10MB)
4. Use absolute path instead of relative
5. Check CORS if external URL

### Performance Issues

**Problem**: Site feels slow or laggy.

**Solutions**:
1. Optimize images with TinyPNG
2. Clear browser cache
3. Close other tabs/applications
4. Check network tab in DevTools
5. Test in different browser

### SEO Not Working

**Problem**: Site doesn't appear in search results.

**Solutions**:
1. Submit sitemap to Google Search Console
2. Update meta tags with real content
3. Wait for indexing (can take weeks)
4. Check Google Search Console for errors
5. Ensure site is public (robots.txt allows indexing)

## 📖 Code Examples

### Update Profile Photo
```javascript
const file = document.getElementById('profile-photo').files[0]
const reader = new FileReader()
reader.onload = (e) => {
  admin.portfolioData.profile.profilePhoto = e.target.result
  admin.savePortfolioData()
}
reader.readAsDataURL(file)
```

### Add New Experience
```javascript
admin.portfolioData.experience.push({
  id: Date.now(),
  title: 'Senior Developer',
  company: 'Tech Corp',
  startDate: '2023',
  endDate: 'Present',
  description: 'Led development of modern web apps',
  skills: ['React', 'Node.js', 'PostgreSQL']
})
admin.savePortfolioData()
admin.loadExperienceTable()
```

### Toggle Dark Mode
```javascript
const isDark = document.body.classList.toggle('dark-mode')
localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light')
```

### Get All Contact Messages
```javascript
const messages = admin.portfolioData.contact.formSubmissions
messages.forEach(msg => {
  console.log(`${msg.name}: ${msg.message}`)
})
```

---

**API Version**: 1.0.0
**Last Updated**: December 24, 2024
