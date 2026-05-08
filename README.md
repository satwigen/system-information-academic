# Academic Presence System (APS)

A modern, minimalist web application for managing student attendance across multiple departments in an academic institution.

## Features

- **Dashboard** - Central hub with statistics and department overview
- **Attendance Tracking** - Mark student attendance with 4 status options (Present, Late, Sick, Absent)
- **Summary Reports** - Visual attendance reports per class with progress bars
- **Search & Filter** - Find students across all departments by name or NIM

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide-React
- **Language:** TypeScript
- **State:** React Context

## Departments

1. **Information Technology (IT)** - 3 classes, 30 students
2. **Informatics (INF)** - 3 classes, 30 students
3. **Digital Business (DB)** - 3 classes, 28 students

## Design

- **Theme:** Academic, clean, ultra-minimalist
- **Colors:** Midnight Navy (#1E293B), Slate Gray (#64748B), Electric Blue (#3B82F6)
- **Background:** Off-white (#F8FAFC)
- **UI:** Cards with subtle shadows, rounded-xl corners, Lucide-React icons

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── attendance/         # Attendance management
│   ├── reports/            # Summary reports
│   ├── search/             # Search & filter
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Dashboard
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── ui/                 # Reusable UI components
│   └── dashboard/          # Dashboard-specific components
├── context/                # React Context providers
└── lib/
    ├── data/               # Mock data for all departments
    ├── types.ts            # TypeScript interfaces
    └── utils.ts            # Utility functions
```
