# Database Seeding Guide

This document explains how to populate your budget tracker database with test data.

## Overview

The seed script (`seed.ts`) creates a comprehensive set of interconnected test data including:

- **10 Users** - Diverse profiles with different preferences and currencies
- **20-50 Accounts** - Various account types (checking, savings, credit cards, etc.) for each user
- **100+ Categories** - Income and expense categories for all users
- **1500-3000 Transactions** - Realistic transaction history spanning the last year
- **10-30 Budgets** - Budget plans with category allocations and spending tracking
- **20-60 Goals** - Financial goals with varying priorities and target dates

## Features

### Realistic Data Generation
- **Random but realistic amounts**: Transactions range from $5-$500 for expenses and $500-$8000 for income
- **Date distribution**: Transactions spread across the last 12 months
- **Account balances**: Calculated based on transaction history
- **Interconnected data**: All foreign keys properly linked between collections

### Diverse Test Scenarios
- **Multiple currencies**: USD, EUR, GBP, CAD, AUD
- **Various account types**: Cash, checking, savings, credit cards, investments
- **Recurring transactions**: 10% of transactions are set as recurring
- **Budget tracking**: Budgets include allocated vs spent amounts
- **Goal progress**: Goals show various completion percentages

### Data Relationships
```
Users (1) → (Many) Accounts
Users (1) → (Many) Categories
Users (1) → (Many) Budgets
Users (1) → (Many) Goals

Accounts (1) → (Many) Transactions
Categories (1) → (Many) Transactions
Categories (Many) ← (Many) Budgets (via categories array)
```

## How to Run

### Prerequisites
1. Make sure MongoDB is running
2. Create a `.env` file with your MongoDB connection string:
   ```
   MONGODB_CONNECTION_STRING=mongodb://localhost:27017/budget-tracker
   ```

### Running the Seed Script

#### Development (with TypeScript)
```bash
npm run seed
```

#### Production (compiled JavaScript)
```bash
npm run build
npm run seed:prod
```

### Manual Execution
```bash
# Using ts-node directly
npx ts-node seed.ts

# Or compile first
npm run build
node dist/seed.js
```

## What the Script Does

1. **Connects to MongoDB** using your environment configuration
2. **Clears existing data** from all collections (⚠️ **Warning**: This will delete all existing data!)
3. **Creates users** with realistic profiles and preferences
4. **Generates categories** for income and expenses for each user
5. **Creates accounts** of various types for each user
6. **Generates transactions** with realistic amounts, dates, and descriptions
7. **Updates account balances** based on transaction history
8. **Creates budgets** with category allocations and spending tracking
9. **Generates goals** with target amounts and current progress

## Sample Data Characteristics

### Users
- Names: John Smith, Jane Doe, Alice Johnson, etc.
- Emails: Auto-generated based on names
- Currencies: Mixed (USD, EUR, GBP, CAD, AUD)
- Preferences: Random themes, date formats, budget periods

### Accounts
- Types: Cash, checking, savings, credit cards, investments
- Names: User-specific (e.g., "John's CHECKING", "Jane's SAVINGS")
- Balances: Calculated from transaction history
- Bank names: Major banks like Chase, Bank of America, Wells Fargo

### Categories
**Income Categories:**
- Salary, Freelance, Business Income, Investment Returns, etc.

**Expense Categories:**
- Groceries, Rent/Mortgage, Utilities, Transportation, Entertainment, etc.

### Transactions
- **Income**: $500-$8000 (salaries, freelance payments, etc.)
- **Expenses**: $5-$500 (daily expenses, bills, shopping)
- **Descriptions**: Realistic like "Grocery Shopping at Walmart", "Monthly Salary"
- **Payment Methods**: Cash, credit card, debit card, bank transfer

### Budgets
- **Periods**: Weekly, monthly, quarterly, yearly
- **Categories**: 3-8 expense categories per budget
- **Amounts**: $100-$1000 per category
- **Tracking**: Shows allocated vs spent amounts (some over budget)

### Goals
- **Types**: Emergency Fund, Vacation, New Car, House Down Payment, etc.
- **Amounts**: $500-$50,000
- **Progress**: Various completion percentages (0-80%)
- **Priorities**: Low, medium, high
- **Target Dates**: 3-24 months in the future

## Important Notes

⚠️ **Data Deletion Warning**: The seed script will delete ALL existing data in your database before creating new test data. Make sure to backup any important data before running.

🔄 **Idempotent**: You can run the seed script multiple times. Each run will recreate the entire dataset.

🔗 **Relationships**: All data is properly interconnected with valid ObjectId references between collections.

📊 **Volume**: The script creates a substantial amount of data suitable for testing pagination, filtering, and performance scenarios.

## Customization

You can modify the following arrays in `seed.ts` to customize the generated data:

- `userNames`: Add or change user names
- `bankNames`: Modify bank names
- `incomeCategories` / `expenseCategories`: Customize category types
- `transactionDescriptions`: Change transaction descriptions
- `goalNames`: Modify goal types

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running
- Check your `.env` file has the correct `MONGODB_CONNECTION_STRING`
- Verify the database name in `db.ts` matches your setup

### Permission Issues
- Make sure your MongoDB user has read/write permissions
- Check that the database specified in the connection string exists

### Memory Issues
- If you encounter memory issues with large datasets, you can reduce the `numTransactions` variable in the script

## Data Verification

After running the seed script, you can verify the data was created correctly by:

1. Checking the console output for the summary
2. Using MongoDB Compass or mongosh to browse the collections
3. Making API calls to your endpoints to test with the generated data
4. Running your application to see the data in action

The seed script provides a comprehensive dataset that will help you test all aspects of your budget tracker application!
