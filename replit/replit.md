# Singapore Growth Companies Dashboard

## Overview

This is a full-stack web application built to analyze and visualize Singapore's fastest-growing companies. The application processes CSV data about company performance metrics and provides interactive dashboards with charts, tables, and filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
User wants ability to upload their own CSV files instead of using pre-loaded data.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Data Processing**: PapaParse for CSV parsing
- **Session Management**: In-memory storage with PostgreSQL session store

### Key Components

#### Data Layer
- **Schema Definition**: Zod schemas for type-safe data validation
- **Company Model**: Tracks rank, name, sector, growth metrics, revenue, employees, and founding year
- **Filter System**: Multi-dimensional filtering by year, sector, founding year range, and search terms

#### UI Components
- **Dashboard**: Main application interface with sidebar navigation
- **Charts**: Multiple visualization types (bar charts, scatter plots, pie charts)
- **Data Table**: Sortable and searchable company listings
- **Company Detail Modal**: In-depth company information with historical data
- **Filters Sidebar**: Interactive controls for data filtering

#### Data Processing
- **CSV Parser**: Handles multiple CSV formats across different years
- **Data Transformation**: Converts raw CSV data to typed company objects
- **Filtering Engine**: Real-time data filtering based on user selections
- **Export Functionality**: CSV export of filtered results

### Data Flow

1. **Data Ingestion**: CSV files are parsed using PapaParse
2. **Data Validation**: Raw data is validated against Zod schemas
3. **State Management**: React Query manages data fetching and caching
4. **User Interaction**: Filter changes trigger data re-computation
5. **Visualization**: Processed data flows to chart components via props
6. **Export**: Filtered data can be exported as CSV files

### External Dependencies

#### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **papaparse**: CSV parsing library
- **recharts**: React charting library
- **wouter**: Lightweight routing

#### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

#### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js

### Deployment Strategy

#### Development Setup
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx for TypeScript execution with nodemon-like behavior
- **Database**: Drizzle migrations with push command
- **Environment**: Replit-optimized with development banners

#### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: PostgreSQL with connection pooling
- **Deployment**: Single process serving both API and static files

#### Configuration Management
- **Database URL**: Environment variable for PostgreSQL connection
- **Build Output**: Separate directories for client and server builds
- **Static Assets**: Express serves built frontend from `/dist/public`

### Architecture Decisions

#### Database Choice
- **Decision**: PostgreSQL with Drizzle ORM
- **Rationale**: Type safety, SQL flexibility, and serverless compatibility
- **Alternative**: MongoDB was considered but SQL better suited for structured company data

#### State Management
- **Decision**: React Query + React hooks
- **Rationale**: Excellent caching, background updates, and minimal boilerplate
- **Alternative**: Redux was considered but deemed overkill for this use case

#### Component Library
- **Decision**: shadcn/ui with Radix UI primitives
- **Rationale**: Accessibility-first, customizable, and modern design system
- **Alternative**: Material-UI was considered but shadcn/ui offers better customization

#### Chart Library
- **Decision**: Recharts
- **Rationale**: React-native, good TypeScript support, and flexible API
- **Alternative**: Chart.js was considered but Recharts integrates better with React

#### CSV Processing
- **Decision**: Client-side parsing with PapaParse
- **Rationale**: Reduces server load and enables real-time data manipulation
- **Alternative**: Server-side processing was considered but client-side offers better UX

## Recent Changes

### CSV Upload Feature (January 2025)
- **Added**: CSV file upload component allowing users to upload their own data files
- **Features**: 
  - Multi-file upload support
  - Automatic year detection from filename
  - Manual year assignment option
  - File validation and error handling
  - Progress tracking during processing
  - Integration with existing dashboard filters and visualizations
- **Technical Implementation**:
  - Created `CSVUpload` component with drag-and-drop interface
  - Modified dashboard state management to handle uploaded data
  - Enhanced data loading to merge uploaded files with existing data
  - Added file status tracking (pending, processing, success, error)
  - Removed pre-loaded CSV data to start with clean slate
  - Added proper empty state messaging for initial app load

### CSV Processing Bug Fix & Pagination (January 2025)
- **Fixed**: CSV parsing bug that was losing rows during processing
- **Improved**: Column detection to handle different CSV formats across years
- **Enhanced**: Revenue and employee data parsing with flexible column matching
- **Added**: Pagination to company table with 25 items per page
- **Features**:
  - Automatic detection of revenue and employee columns by year
  - Support for different column naming conventions (e.g., "Absolute growth rate (in %)")
  - Improved error handling and row validation
  - Console logging for debugging parsed row counts
  - Full pagination controls with page numbers and navigation