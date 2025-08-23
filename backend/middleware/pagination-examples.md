# Global Pagination Usage Examples

## 🔧 **How to Use Global Pagination in Any Controller**

### **1. Apply Middleware to Routes**

```typescript
// In your route file (e.g., accounts.ts)
import { paginationMiddleware } from "../middleware/pagination";

const router = Router();

// Custom pagination options for accounts
const accountPagination = paginationMiddleware({
    defaultLimit: 15,
    maxLimit: 50,
    validSortFields: ['name', 'balance', 'createdAt', 'updatedAt'],
    defaultSort: 'name',
    defaultOrder: 'asc'
});

// Apply to specific routes
router.get("/", accountPagination, accountsControllers.getAllAccounts);
```

### **2. Update Controller to Use Pagination**

```typescript
// In your controller (e.g., accounts.ts)
import { createPaginatedResponse, applyPagination } from "../middleware/pagination";

export const accountsControllers = {
    getAllAccounts: async (req: Request, res: Response) => {
        try {
            // Build your query
            const query: any = {};
            if (req.query.userId) {
                query.userId = new ObjectId(req.query.userId as string);
            }
            if (req.query.type) {
                query.type = req.query.type;
            }
            
            // Use global pagination from middleware
            if (!req.pagination) {
                return res.status(400).json({
                    error: "Pagination middleware not applied",
                    message: "Please ensure pagination middleware is applied to this route"
                });
            }

            // Apply pagination to your model
            const { data, totalCount } = await applyPagination(
                query,
                req.pagination,
                Account // Your Mongoose model
            );
            
            if (!data || data.length === 0) {
                return res.status(404).json({ 
                    error: "No accounts found",
                    message: "No accounts match the specified criteria"
                });
            }

            // Create paginated response
            const response = createPaginatedResponse(data, req.pagination, totalCount);
            res.json(response);
        } catch (error) {
            console.error("Error fetching accounts", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch accounts"
            });
        }
    }
};
```

### **3. Different Pagination Configurations**

#### **For Categories (Small datasets)**
```typescript
const categoryPagination = paginationMiddleware({
    defaultLimit: 10,
    maxLimit: 25,
    validSortFields: ['name', 'type', 'createdAt'],
    defaultSort: 'name',
    defaultOrder: 'asc'
});
```

#### **For Transactions (Large datasets)**
```typescript
const transactionPagination = paginationMiddleware({
    defaultLimit: 20,
    maxLimit: 100,
    validSortFields: ['date', 'amount', 'description', 'createdAt'],
    defaultSort: 'date',
    defaultOrder: 'desc'
});
```

#### **For Users (Medium datasets)**
```typescript
const userPagination = paginationMiddleware({
    defaultLimit: 15,
    maxLimit: 50,
    validSortFields: ['name', 'email', 'createdAt'],
    defaultSort: 'name',
    defaultOrder: 'asc'
});
```

### **4. API Usage Examples**

#### **Basic Pagination**
```
GET /api/accounts?page=1&limit=10
```

#### **With Sorting**
```
GET /api/accounts?page=2&limit=15&sort=balance&order=desc
```

#### **With Filters**
```
GET /api/accounts?userId=123&type=checking&page=1&limit=20&sort=createdAt&order=desc
```

### **5. Response Format**

All paginated endpoints return the same consistent format:

```json
{
    "success": true,
    "pagination": {
        "page": 1,
        "limit": 20,
        "totalPages": 5,
        "totalCount": 100,
        "hasNextPage": true,
        "hasPrevPage": false
    },
    "count": 20,
    "data": [...]
}
```

### **6. Benefits of Global Pagination**

✅ **Consistent API responses** across all endpoints  
✅ **Reusable middleware** - no code duplication  
✅ **Easy to maintain** - change pagination logic in one place  
✅ **Flexible configuration** per route/controller  
✅ **Built-in validation** of pagination parameters  
✅ **TypeScript support** with proper interfaces  
✅ **Performance optimized** with MongoDB skip/limit  

### **7. Error Handling**

The middleware automatically handles:
- Invalid page numbers
- Invalid limit values
- Invalid sort fields
- Invalid order values
- Missing pagination parameters

All with proper HTTP status codes and error messages.
