import { Request, Response, NextFunction } from 'express';

export interface PaginationQuery {
    page?: string;
    limit?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginationOptions {
    defaultLimit?: number;
    maxLimit?: number;
    validSortFields?: string[];
    defaultSort?: string;
    defaultOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
    page: number;
    limit: number;
    skip: number;
    sort: any;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
    success: boolean;
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    count: number;
    data: T[];
}

// Default pagination options
const defaultOptions: PaginationOptions = {
    defaultLimit: 10,
    maxLimit: 100,
    validSortFields: ['createdAt', 'updatedAt', 'name', 'date', 'amount'],
    defaultSort: 'createdAt',
    defaultOrder: 'desc'
};

export const paginationMiddleware = (options: PaginationOptions = {}) => {
    const config = { ...defaultOptions, ...options };
    
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page = '1', limit = config.defaultLimit?.toString(), sort = config.defaultSort, order = config.defaultOrder } = req.query as PaginationQuery;
            
            // Validate page parameter
            const pageNum = parseInt(page, 10);
            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({
                    error: "Invalid page parameter",
                    message: "Page must be a positive integer"
                });
            }
            
            // Validate limit parameter
            const limitNum = parseInt(limit!, 10);
            if (isNaN(limitNum) || limitNum < 1 || limitNum > config.maxLimit!) {
                return res.status(400).json({
                    error: "Invalid limit parameter",
                    message: `Limit must be between 1 and ${config.maxLimit}`
                });
            }
            
            // Validate sort parameter
            if (sort && !config.validSortFields!.includes(sort)) {
                return res.status(400).json({
                    error: "Invalid sort parameter",
                    message: `Sort field must be one of: ${config.validSortFields!.join(', ')}`,
                    validSortFields: config.validSortFields
                });
            }
            
            // Validate order parameter
            if (order && !['asc', 'desc'].includes(order)) {
                return res.status(400).json({
                    error: "Invalid order parameter",
                    message: "Order must be either 'asc' or 'desc'"
                });
            }
            
            // Build sort object
            const sortObj: any = {};
            sortObj[sort!] = order === 'desc' ? -1 : 1;
            
            // Calculate skip value
            const skip = (pageNum - 1) * limitNum;
            
            // Attach pagination info to request
            req.pagination = {
                page: pageNum,
                limit: limitNum,
                skip,
                sort: sortObj,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            };
            
            next();
        } catch (error) {
            return res.status(400).json({
                error: "Pagination validation failed",
                message: "Invalid pagination parameters"
            });
        }
    };
};

// Utility function to create paginated response
export const createPaginatedResponse = <T>(
    data: T[],
    pagination: PaginationResult,
    totalCount: number
): PaginatedResponse<T> => {
    const totalPages = Math.ceil(totalCount / pagination.limit);
    
    return {
        success: true,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            totalPages,
            totalCount,
            hasNextPage: pagination.page < totalPages,
            hasPrevPage: pagination.page > 1
        },
        count: data.length,
        data
    };
};

// Utility function to apply pagination to MongoDB queries
export const applyPagination = async <T>(
    query: any,
    pagination: PaginationResult,
    model: any
): Promise<{ data: T[]; totalCount: number }> => {
    const [data, totalCount] = await Promise.all([
        model.find(query)
            .sort(pagination.sort)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .lean(),
        model.countDocuments(query)
    ]);
    
    return { data, totalCount };
};

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            pagination?: PaginationResult;
        }
    }
}
