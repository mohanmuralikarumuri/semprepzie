# Student Number Validation System

## Overview
The Semprepzie application implements a robust student validation system that ensures only authorized students can access the platform. This validation is based on the student numbers extracted from their college email addresses.

## How It Works

### Email Format
Students must use their college email in the format: `rollnumber@aitsrajampet.ac.in`

**Example:** `23701A05B8@aitsrajampet.ac.in`

### Student Number Extraction
The system extracts the last 4 characters from the email's local part (before @):
- From `23701A05B8@aitsrajampet.ac.in` → extracts `05B8`
- From `23701A0501@aitsrajampet.ac.in` → extracts `0501`

### Validation Process
1. **Domain Check**: Email must end with `@aitsrajampet.ac.in`
2. **Student Number Check**: Extracted student number must be in the authorized list
3. **Case Insensitive**: Student numbers are converted to uppercase for comparison

## Authorized Student Numbers

```javascript
const VALID_STUDENT_NUMBERS = [
    '0501', '0567', '0568', '0569', '0570', '0571', '0572', '0573', '0574', '0575',
    '0576', '0577', '0578', '0579', '0580', '0581', '0582', '0583', '0584', '0585',
    '0586', '0587', '0588', '0589', '0590', '0591', '0592', '0593', '0594', '0595',
    '0596', '0597', '0598', '0599', '05A0', '05A1', '05A2', '05A3', '05A4', '05A5',
    '05A6', '05A7', '05A8', '05A9', '05B0', '05B1', '05B2', '05B3', '05B4', '05B5',
    '05B6', '05B7', '05C3', '05B8', '05B9', '05C0', '05C1', '05C2', '05C4', '05C5',
    '05C6', '05C7', '05C8', '05C9', '05D0', '05D1', '0510', '0511', '0512', '0513'
];
```

## Implementation

### Frontend Validation
- **Location**: `frontend/src/utils/index.ts`
- **Functions**: 
  - `validateCollegeEmailShared(email: string): boolean`
  - `extractStudentNumberShared(email: string): string`
  - `getStudentIdFromEmailShared(email: string): string`

### Backend Validation
- **Location**: `backend/src/controllers/auth.controller.ts`
- **Functions**: Uses shared validation from `@semprepzie/shared`
- **Response**: Returns 403 status with specific error message for unauthorized students

### Example Validation Flow

#### ✅ Valid Student Email
```
Email: 23701A05B8@aitsrajampet.ac.in
Student Number: 05B8
Status: ✅ AUTHORIZED (05B8 is in the valid list)
Result: User can register/login
```

#### ❌ Invalid Student Email
```
Email: 23701A05XX@aitsrajampet.ac.in
Student Number: 05XX
Status: ❌ UNAUTHORIZED (05XX is not in the valid list)
Result: Registration/login blocked with error message
```

## Error Messages

### Frontend
- **Invalid Domain**: "Must use @aitsrajampet.ac.in email"
- **Unauthorized Student**: "Access denied: Student number \"05XX\" is not authorized"

### Backend
- **Unauthorized Student**: "Access denied: Student number \"05XX\" is not in the authorized list"

## Security Features

1. **Domain Restriction**: Only college emails accepted
2. **Whitelist Approach**: Only pre-approved student numbers allowed
3. **Case Insensitive**: Handles variations in student number formatting
4. **Dual Validation**: Checked on both frontend and backend
5. **Clear Error Messages**: Specific feedback for unauthorized access attempts

## Adding New Students

To authorize new students, add their student numbers to:
1. `shared/src/constants/index.ts` - VALID_STUDENT_NUMBERS array
2. Rebuild the shared package: `cd shared && npm run build`
3. Restart the application

## Testing Examples

### Valid Test Cases
```javascript
// These should be ALLOWED
validateCollegeEmailShared('23701A05B8@aitsrajampet.ac.in') // true
validateCollegeEmailShared('23701A0501@aitsrajampet.ac.in') // true
validateCollegeEmailShared('23701A05A0@aitsrajampet.ac.in') // true
```

### Invalid Test Cases
```javascript
// These should be BLOCKED
validateCollegeEmailShared('23701A05XX@aitsrajampet.ac.in') // false
validateCollegeEmailShared('student@gmail.com') // false
validateCollegeEmailShared('23701A0500@aitsrajampet.ac.in') // false (if 0500 not in list)
```

## Integration Points

1. **User Registration**: Validates before creating Firebase account
2. **User Login**: Validates before allowing authentication
3. **Password Reset**: Validates before sending reset email
4. **Protected Routes**: Additional validation for secure endpoints

This system ensures that only authorized AITS Rajampet students can access the educational platform while providing clear feedback for unauthorized access attempts.
