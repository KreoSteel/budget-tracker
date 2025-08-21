import mongoose from 'mongoose';
import { connectDB } from './db';
import User from './models/user';
import Account from './models/account';
import Category from './models/category';
import Transaction from './models/transaction';
import Budget from './models/budget';
import Goal from './models/goal';

// Helper function to get random date within range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get random number within range
const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random decimal
const randomDecimal = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Sample data
const userNames = [
  'John Smith', 'Jane Doe', 'Alice Johnson', 'Bob Wilson', 'Emma Brown',
  'Michael Davis', 'Sarah Miller', 'David Garcia', 'Lisa Anderson', 'James Taylor'
];

const bankNames = [
  'Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One',
  'US Bank', 'PNC Bank', 'TD Bank', 'Fifth Third Bank', 'Regions Bank'
];

const incomeCategories = [
  'Salary', 'Freelance', 'Business Income', 'Investment Returns', 'Rental Income',
  'Bonus', 'Commission', 'Side Hustle', 'Dividends', 'Interest Income'
];

const expenseCategories = [
  'Groceries', 'Rent/Mortgage', 'Utilities', 'Transportation', 'Entertainment',
  'Dining Out', 'Shopping', 'Healthcare', 'Insurance', 'Education',
  'Travel', 'Fitness', 'Subscriptions', 'Personal Care', 'Home Improvement',
  'Gas', 'Car Maintenance', 'Phone Bill', 'Internet', 'Streaming Services'
];

const transactionDescriptions = {
  income: [
    'Monthly Salary', 'Freelance Project Payment', 'Consulting Fee', 'Investment Dividend',
    'Rental Property Income', 'Performance Bonus', 'Commission Payment', 'Side Project Income',
    'Interest Payment', 'Stock Sale Profit', 'Tax Refund', 'Cashback Reward'
  ],
  expense: [
    'Grocery Shopping at Walmart', 'Monthly Rent Payment', 'Electricity Bill',
    'Gas Station Fill-up', 'Netflix Subscription', 'Dinner at Restaurant',
    'Amazon Purchase', 'Coffee Shop', 'Uber Ride', 'Gym Membership',
    'Doctor Visit', 'Car Insurance', 'Phone Bill Payment', 'Internet Bill',
    'Clothing Purchase', 'Book Store', 'Movie Tickets', 'Parking Fee',
    'ATM Withdrawal', 'Online Course', 'Home Depot Purchase', 'Pharmacy',
    'Hair Salon', 'Car Repair', 'Flight Booking', 'Hotel Stay'
  ]
};

const goalNames = [
  'Emergency Fund', 'Vacation to Europe', 'New Car', 'House Down Payment',
  'Wedding Fund', 'Retirement Savings', 'Home Renovation', 'Education Fund',
  'Debt Payoff', 'Investment Portfolio', 'New Laptop', 'Christmas Gifts',
  'Medical Expenses', 'Business Investment', 'Kitchen Remodel'
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Account.deleteMany({});
    await Category.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    await Goal.deleteMany({});
    
    console.log('✅ Existing data cleared');

    // Create Users
    console.log('👥 Creating users...');
    const users = [];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    const themes = ['light', 'dark'];
    const budgetPeriods = ['weekly', 'monthly', 'yearly'];
    
    for (let i = 0; i < userNames.length; i++) {
      const user = new User({
        name: userNames[i],
        email: `${userNames[i].toLowerCase().replace(' ', '.')}@example.com`,
        password: 'password123', // In real app, this should be hashed
        preferences: {
          currency: currencies[randomNumber(0, currencies.length - 1)],
          dateFormat: Math.random() > 0.5 ? 'DD/MM/YYYY' : 'MM/DD/YYYY',
          budgetPeriod: budgetPeriods[randomNumber(0, budgetPeriods.length - 1)],
          theme: themes[randomNumber(0, themes.length - 1)]
        },
        isActive: Math.random() > 0.1 // 90% active users
      });
      await user.save();
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // Create Categories for each user
    console.log('📁 Creating categories...');
    const allCategories = [];
    const accountTypes = ['cash', 'checking', 'savings', 'credit_card', 'investment', 'other'];
    
    for (const user of users) {
      // Create income categories
      const userIncomeCategories = [];
      for (let i = 0; i < randomNumber(3, 6); i++) {
        const category = new Category({
          name: incomeCategories[i % incomeCategories.length],
          type: 'income',
          userId: user._id,
          isDefault: i === 0,
          isActive: true
        });
        await category.save();
        userIncomeCategories.push(category);
        allCategories.push(category);
      }

      // Create expense categories
      const userExpenseCategories = [];
      for (let i = 0; i < randomNumber(8, 15); i++) {
        const category = new Category({
          name: expenseCategories[i % expenseCategories.length],
          type: 'expense',
          userId: user._id,
          isDefault: i === 0,
          isActive: Math.random() > 0.05 // 95% active
        });
        await category.save();
        userExpenseCategories.push(category);
        allCategories.push(category);
      }
    }
    console.log(`✅ Created ${allCategories.length} categories`);

    // Create Accounts for each user
    console.log('🏦 Creating accounts...');
    const allAccounts = [];
    
    for (const user of users) {
      const numAccounts = randomNumber(2, 5);
      for (let i = 0; i < numAccounts; i++) {
        const accountType = accountTypes[i % accountTypes.length];
        const account = new Account({
          name: `${user.name.split(' ')[0]}'s ${accountType.replace('_', ' ').toUpperCase()}`,
          type: accountType,
          balance: randomDecimal(100, 15000),
          userId: user._id,
          currency: user.preferences?.currency || 'EUR',
          bankName: accountType !== 'cash' ? bankNames[randomNumber(0, bankNames.length - 1)] : undefined,
          isActive: Math.random() > 0.05 // 95% active
        });
        await account.save();
        allAccounts.push(account);
      }
    }
    console.log(`✅ Created ${allAccounts.length} accounts`);

    // Create Transactions
    console.log('💰 Creating transactions...');
    const allTransactions = [];
    const paymentMethods = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'];
    
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Start from 1 year ago
    const endDate = new Date();
    
    for (const user of users) {
      const userAccounts = allAccounts.filter(acc => acc.userId?.toString() === user._id.toString());
      const userCategories = allCategories.filter(cat => cat.userId?.toString() === user._id.toString());
      const incomeCategories = userCategories.filter(cat => cat.type === 'income');
      const expenseCategories = userCategories.filter(cat => cat.type === 'expense');
      
      const numTransactions = randomNumber(150, 300);
      
      for (let i = 0; i < numTransactions; i++) {
        const isIncome = Math.random() > 0.7; // 30% income, 70% expense
        const categories = isIncome ? incomeCategories : expenseCategories;
        const descriptions = isIncome ? transactionDescriptions.income : transactionDescriptions.expense;
        
        if (categories.length === 0 || userAccounts.length === 0) continue;
        
        const account = userAccounts[randomNumber(0, userAccounts.length - 1)];
        const category = categories[randomNumber(0, categories.length - 1)];
        
        const amount = isIncome 
          ? randomDecimal(500, 8000) 
          : randomDecimal(5, 500);
        
        const transaction = new Transaction({
          amount,
          description: descriptions[randomNumber(0, descriptions.length - 1)],
          type: isIncome ? 'income' : 'expense',
          accountId: account._id,
          categoryId: category._id,
          date: randomDate(startDate, endDate),
          paymentMethod: paymentMethods[randomNumber(0, paymentMethods.length - 1)],
          isRecurring: Math.random() > 0.9, // 10% recurring
          recurringDetails: Math.random() > 0.9 ? {
            frequency: ['monthly', 'weekly', 'yearly'][randomNumber(0, 2)],
            endDate: randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
            nextOccurrence: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            occurrences: Math.random() > 0.5 ? randomNumber(5, 24) : null
          } : undefined
        });
        
        await transaction.save();
        allTransactions.push(transaction);
      }
    }
    console.log(`✅ Created ${allTransactions.length} transactions`);

    // Create Budgets
    console.log('📊 Creating budgets...');
    const allBudgets = [];
    const budgetPeriods2 = ['weekly', 'monthly', 'quarterly', 'yearly'];
    
    for (const user of users) {
      const userCategories = allCategories.filter(cat => 
        cat.userId?.toString() === user._id.toString() && cat.type === 'expense'
      );
      
      const numBudgets = randomNumber(1, 3);
      
      for (let i = 0; i < numBudgets; i++) {
        const period = budgetPeriods2[randomNumber(0, budgetPeriods2.length - 1)];
        const startDate = new Date();
        startDate.setDate(1); // Start of current month
        
        let endDate = new Date(startDate);
        switch (period) {
          case 'weekly':
            endDate.setDate(endDate.getDate() + 7);
            break;
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case 'quarterly':
            endDate.setMonth(endDate.getMonth() + 3);
            break;
          case 'yearly':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        }
        
        // Select random categories for this budget
        const budgetCategoriesCount = Math.min(randomNumber(3, 8), userCategories.length);
        const selectedCategories = [];
        const shuffledCategories = [...userCategories].sort(() => 0.5 - Math.random());
        
        let totalAllocated = 0;
        for (let j = 0; j < budgetCategoriesCount; j++) {
          const category = shuffledCategories[j];
          const allocatedAmount = randomDecimal(100, 1000);
          const spentAmount = randomDecimal(0, allocatedAmount * 1.2); // Some might be over budget
          
          selectedCategories.push({
            categoryId: category._id,
            allocatedAmount,
            spentAmount
          });
          totalAllocated += allocatedAmount;
        }
        
        const budget = new Budget({
          userId: user._id,
          name: `${user.name.split(' ')[0]}'s ${period.charAt(0).toUpperCase() + period.slice(1)} Budget ${i + 1}`,
          period,
          startDate,
          endDate,
          totalAmount: totalAllocated,
          categories: selectedCategories,
          isActive: Math.random() > 0.1 // 90% active
        });
        
        await budget.save();
        allBudgets.push(budget);
      }
    }
    console.log(`✅ Created ${allBudgets.length} budgets`);

    // Create Goals
    console.log('🎯 Creating goals...');
    const allGoals = [];
    const priorities = ['low', 'medium', 'high'];
    
    for (const user of users) {
      const numGoals = randomNumber(2, 6);
      
      for (let i = 0; i < numGoals; i++) {
        const targetAmount = randomDecimal(500, 50000);
        const currentAmount = randomDecimal(0, targetAmount * 0.8); // Progress varies
        
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + randomNumber(3, 24));
        
        const goal = new Goal({
          userId: user._id,
          name: goalNames[randomNumber(0, goalNames.length - 1)],
          targetAmount,
          currentAmount,
          targetDate: Math.random() > 0.2 ? futureDate : undefined, // 80% have target dates
          description: `Save ${targetAmount} for ${goalNames[randomNumber(0, goalNames.length - 1)].toLowerCase()}`,
          priority: priorities[randomNumber(0, priorities.length - 1)],
          isActive: Math.random() > 0.05 // 95% active
        });
        
        await goal.save();
        allGoals.push(goal);
      }
    }
    console.log(`✅ Created ${allGoals.length} goals`);

    // Update account balances based on transactions
    console.log('🔄 Updating account balances...');
    for (const account of allAccounts) {
      const accountTransactions = allTransactions.filter(
        t => t.accountId?.toString() === account._id.toString()
      );
      
      let balance = 1000; // Starting balance
      for (const transaction of accountTransactions) {
        if (transaction.type === 'income') {
          balance += transaction.amount;
        } else {
          balance -= transaction.amount;
        }
      }
      
      account.balance = Math.max(balance, -5000); // Allow some negative balances for credit cards
      await account.save();
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
👥 Users: ${users.length}
🏦 Accounts: ${allAccounts.length}
📁 Categories: ${allCategories.length}
💰 Transactions: ${allTransactions.length}
📊 Budgets: ${allBudgets.length}
🎯 Goals: ${allGoals.length}
    `);

    // Close database connection
    await mongoose.connection.close();
    console.log('📱 Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
