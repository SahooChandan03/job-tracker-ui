# Job Application Tracker

A modern, responsive React.js frontend for tracking job applications with a FastAPI backend. Built with Vite, React Router, TailwindCSS, and JWT authentication.

## 🚀 Features

### 🔐 Authentication
- **User Registration**: Email and password registration with validation
- **User Login**: Secure login with JWT token storage
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Logout**: Clear JWT and redirect to login

### 📊 Dashboard
- **Job Statistics**: Visual counters for each application status
- **Dual View Modes**: 
  - **Table View**: Traditional table layout with sorting and filtering
  - **Kanban View**: Drag-and-drop board organized by status
- **Advanced Filtering**: Search by company/position, filter by status
- **Sorting**: Sort by date applied or company name
- **Responsive Design**: Works perfectly on mobile and desktop

### ➕ Job Management
- **Add Jobs**: Complete form with company, position, status, and date
- **Edit Jobs**: Update existing job applications
- **Delete Jobs**: Confirmation dialog for safe deletion
- **Status Tracking**: Applied, Interview, Offer, Rejected

### 📝 Notes System
- **Add Notes**: Rich text notes with optional reminders
- **Delete Notes**: Remove notes with confirmation
- **Reminder Support**: Set datetime reminders for follow-ups

### 🎨 UI/UX Features
- **Dark Mode**: Toggle between light and dark themes
- **Modern Design**: Clean, professional interface
- **Responsive**: Mobile-first design approach
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **UI Components**: Headless UI, Heroicons
- **Drag & Drop**: react-beautiful-dnd
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **State Management**: React Context API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tracker-job
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Backend API URL
Update the API base URL in `src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Change to your FastAPI backend URL
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📋 API Endpoints

The frontend expects the following FastAPI endpoints:

### Authentication
- `POST /register` - User registration
- `POST /login` - User login

### Jobs
- `GET /jobs` - Get all jobs for authenticated user
- `GET /jobs/{id}` - Get specific job
- `POST /jobs` - Create new job
- `PUT /jobs/{id}` - Update job
- `DELETE /jobs/{id}` - Delete job

### Notes
- `GET /jobs/{id}/notes` - Get notes for a job
- `POST /jobs/{id}/notes` - Add note to job
- `DELETE /jobs/{id}/notes/{note_id}` - Delete note

## 🎯 Usage

### Getting Started
1. Register a new account or login with existing credentials
2. Add your first job application using the "Add Job" button
3. Track your applications using the dashboard
4. Add notes and reminders for important follow-ups

### Dashboard Features
- **Switch Views**: Toggle between table and Kanban views
- **Filter Jobs**: Use the search bar and status filter
- **Sort Results**: Sort by date or company name
- **Drag & Drop**: In Kanban view, drag jobs between status columns

### Job Management
- **View Details**: Click the eye icon to see full job details
- **Edit Jobs**: Click the pencil icon to modify job information
- **Delete Jobs**: Click the trash icon to remove jobs
- **Add Notes**: Use the notes section in job details

## 🎨 Customization

### Colors and Styling
The app uses TailwindCSS with custom status colors:
- **Applied**: Blue (`bg-blue-100 text-blue-800`)
- **Interview**: Orange (`bg-orange-100 text-orange-800`)
- **Offer**: Green (`bg-green-100 text-green-800`)
- **Rejected**: Red (`bg-red-100 text-red-800`)

### Dark Mode
Dark mode is automatically saved to localStorage and can be toggled via the navigation bar.

## 🚀 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your FastAPI backend is running
3. Ensure all API endpoints are properly configured
4. Check that JWT tokens are being handled correctly

## 🔮 Future Enhancements

- [ ] Export job data as CSV/PDF
- [ ] Email notifications for reminders
- [ ] Job application templates
- [ ] Interview scheduling integration
- [ ] Analytics and reporting
- [ ] Multi-user support
- [ ] Mobile app version
