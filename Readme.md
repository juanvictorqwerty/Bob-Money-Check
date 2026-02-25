# Bob Money Check - School Fee Clearance System

## 📋 Overview

**Bob Money Check** is a web application that automates the school fee clearance process for educational institutions.

### The Problem

In many schools, students are required to visit the bursar at each exam period to manually check their payment receipts. This process is slow, repetitive, and creates long queues.

### The Solution

The application allows students to:
- Log in and enter their receipt data
- Automatically verify receipts against a Google Sheet database
- Receive clearance confirmation instantly
- Get clearance documents sent via email

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **Deployment** | Neon (Database), Vercel (Application) |
| **External Services** | Google Sheets API, Gmail SMTP |
| **Authentication** | JWT (JSON Web Tokens) |
| **Testing** | Jest |

---

## 🏗️ Architecture

### Database Schema

The application uses the following main tables:

```
users
├── id (UUID, Primary Key)
├── name (VARCHAR)
├── email (VARCHAR, Unique)
├── password (VARCHAR, Hashed)
└── role (VARCHAR) - "Student" or "Admin"

student
├── matricule (VARCHAR, Primary Key)
├── student_id (UUID, FK → users.id)
├── due_sum (INTEGER) - Amount student owes
└── excess_fees (INTEGER) - Excess paid amount

clearance
├── id (UUID, Primary Key)
├── userId (UUID, FK → users.id)
├── date (TIMESTAMP)
├── active (BOOLEAN)
└── usedReceipts (JSON) - Array of receipt data

clearancesIndex
├── userId (UUID, FK → users.id, Primary Key)
└── clearancesId (JSON) - Array of clearance IDs

token
├── id (UUID, Primary Key)
├── userId (UUID, FK → users.id)
├── token (VARCHAR) - JWT token
├── dateCreated (TIMESTAMP)
└── dateEnded (TIMESTAMP, Nullable)

usedReceipts
├── id (VARCHAR, Primary Key) - Receipt ID
├── paymentDate (TIMESTAMP, Primary Key)
├── userId (UUID, FK → users.id)
├── createdAt (TIMESTAMP)
└── clearanceId (UUID, FK → clearance.id)

RecoveryToken
├── id (UUID, Primary Key)
├── userId (UUID, FK → users.id)
├── recoveryCode (INTEGER)
├── created_at (TIMESTAMP)
└── isValid (BOOLEAN)
```

### Application Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Student   │────▶│  Next.js App │────▶│  Google Sheets  │
│   Login     │     │  (Frontend)  │     │  (Verification)│
└─────────────┘     └──────┬───────┘     └─────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL    │
                  │  (Neon DB)     │
                  └───────────────┘
```

---

## 📱 Features

### For Students

| Feature | Description |
|---------|-------------|
| **Sign Up** | Register with email, matricule, name, and password |
| **Login** | Secure authentication with JWT |
| **Submit Receipts** | Enter receipt ID and payment date for verification |
| **Auto Verification** | System checks Google Sheet for valid receipts |
| **View Clearances** | See all obtained clearances |
| **Email Clearance** | Send clearance PDF via email |
| **Profile Management** | Update name, email, password |
| **Excess Fees** | Use excess paid fees for clearance |

### For Administrators

| Feature | Description |
|---------|-------------|
| **View All Students** | See complete student database |
| **View All Clearances** | Monitor all clearance records |
| **View Used Receipts** | Track all receipts used for clearance |
| **Manual Clearance** | Grant clearance for exceptional cases |
| **Suspend Clearance** | Deactivate existing clearances |
| **Update Fees** | Modify student due fees |

---

## 📁 Project Structure

```
bob-money-check/
├── drizzle/                    # Database configuration
│   ├── schema.ts              # Database schema definitions
│   ├── relations.ts            # Table relationships
│   ├── meta/                   # Migration metadata
│   └── *.sql                   # Migration files
├── src/
│   ├── actions/               # Server Actions
│   │   ├── student.ts         # Student-related actions
│   │   └── admin.ts           # Admin-related actions
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── checkauth/     # Authentication verification
│   │   │   └── renewToken/    # Token renewal
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signUPnormal/
│   │   │   └── signUpAdmin/
│   │   ├── Account/           # Student account page
│   │   ├── admin/             # Admin dashboard
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── ReceiptInput.tsx
│   │   ├── AllClearances.tsx
│   │   ├── AllStudents.tsx
│   │   ├── AllUsedReceipts.tsx
│   │   └── ...
│   ├── utils/                 # Utility functions
│   │   ├── db.ts              # Database connection
│   │   ├── authFunction.ts    # Authentication utilities
│   │   ├── adminFuntions.ts  # Admin utilities
│   │   ├── manageStudents.ts # Student utilities
│   │   └── connectGSheet.ts # Google Sheets integration
│   ├── hooks/                 # Custom React hooks
│   └── middleware.ts          # Authentication middleware
├── public/                    # Static assets
├── package.json
└── drizzle.config.neon.ts     # Drizzle config for Neon
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL database (Neon)
- Google Cloud Project with Sheets API enabled

### Environment Variables

Create a `.env` file in the `bob-money-check/` directory:

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key

# Google Sheets API
GOOGLE_APPLICATION_KEY=your-google-api-key
SHEET_ID=your-google-sheet-id

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Registration
AdminSignUpKey=your-admin-signup-key
```

### Installation

```bash
# Navigate to project directory
cd bob-money-check

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Google Sheets Setup

The Google Sheet should have a "Receipts" sheet with the following columns:
- Column A: Receipt ID
- Column B: Payment Date (DD-MM-YYYY)
- Column C: Amount Paid

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Jest tests |

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 300-day expiration with httpOnly cookies
- **Role-Based Access**: Separate permissions for students and admins
- **SQL Injection Prevention**: Drizzle ORM parameterization
- **Email Verification**: Recovery codes for password reset
- **Multi-Device Logout**: Option to logout from all devices

---

## 📄 API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/checkauth` | POST | Verify JWT token validity |
| `/api/renewToken` | POST | Renew authentication token |

### Server Actions

The application uses Next.js Server Actions instead of traditional API routes:

- `signupStudent()` - Register new student
- `loginStudent()` - Authenticate student
- `checkValidClearance()` - Verify and create clearance
- `studentClearances()` - Get student's clearances
- `sendClearance()` - Email clearance PDF
- `giveExceptionalClearance()` - Admin manual clearance
- `GetAllStudents()` - Admin view all students
- `GetAllClearances()` - Admin view all clearances
- `ToggleClearance()` - Suspend/activate clearance

---

## 🧪 Testing

Run tests with:

```bash
pnpm test
```

Test files are located in:
- `src/components/__tests__/`
- Jest configuration in `jest.config.ts`

---

## 🚢 Deployment

### Database (Neon)

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Get your connection string
3. Set `DATABASE_URL` environment variable

### Application (Vercel)

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

---

## 📝 License

This project is for educational purposes.

---

## 👤 Author

Created for school administration automation.
