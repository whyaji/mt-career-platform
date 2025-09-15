# MT Career - Campus Hiring Form

A comprehensive multi-step form built with React, TypeScript, and Mantine UI for the Campus Hiring program at Politeknik LPP Yogyakarta.

## Features

- **Multi-step Form**: 3-step form with personal information, agreements, and summary
- **Form Validation**: Comprehensive validation for all required fields
- **Responsive Design**: Mobile-friendly design using Mantine UI components
- **Progress Tracking**: Visual progress indicator and step navigation
- **Form Summary**: Review all information before submission

## Form Steps

### Step 1: Personal Information

- Personal details (name, NIK, email, phone, birth date, gender)
- Address information (full address, city, postal code)
- Education details (program selection, university, major, GPA, graduation year)
- Marital status

### Step 2: Agreements

- Training and OJT agreement
- Employment and service bond agreement
- Diploma storage agreement

### Step 3: Summary

- Review all entered information
- Final submission

## Available Programs

1. **PKPP Estate** - Minimum D3 in Plantation, Agriculture and related fields
2. **PKPP KTU** - Minimum D3/S1 in Accounting & Taxation
3. **PKPP Mill** - Minimum S1 in Mechanical Engineering, Industrial Engineering, Electrical Engineering, Chemical Engineering

## Requirements

- Fresh graduate D3-S1 with minimum GPA 2.75
- Single (not married)
- Willing to be placed in operational sites around Central Kalimantan

## Technology Stack

- React 19
- TypeScript
- Mantine UI 8.3
- TanStack Router
- Vite

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start development server:

   ```bash
   bun run dev
   ```

3. Open your browser and navigate to the form

## Form Validation

The form includes comprehensive validation:

- Required field validation
- Email format validation
- Phone number format validation (Indonesian format)
- NIK validation (16 digits)
- GPA validation (minimum 2.75)
- Graduation year validation
- Agreement validation

## Components

- `FormHeader`: Company information and program details
- `PersonalInfoForm`: Personal and education information form
- `AgreementForm`: Terms and conditions agreement form
- `FormSummary`: Review and summary before submission
- `FormPagination`: Step navigation and progress indicator
