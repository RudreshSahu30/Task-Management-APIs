# Task Management REST API Documentation

## Overview
A RESTful API for managing tasks with in-memory storage. Built with Node.js, Express, and TypeScript.

## Base URL
```
http://localhost:3000
```

## Task Model

### Task Object Structure
```typescript
{
  id: string;              // UUID v4 auto-generated
  title: string;           // Required, 3-100 characters
  description?: string;    // Optional, max 500 characters
  status: TaskStatus;      // "pending" | "in-progress" | "completed" | "blocked"
  createdAt: Date;         // Auto-generated timestamp
  updatedAt: Date;         // Auto-updated timestamp
}
```

### Task Status Enum
- `pending` - Task is created but not yet started (default)
- `in-progress` - Task is currently being worked on
- `completed` - Task has been finished
- `blocked` - Task cannot proceed due to dependencies or issues

---

## API Endpoints

### 1. Get All Tasks
**GET** `/api/tasks`

Retrieves all tasks from the system.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "f9312e7d-1d33-43e2-9145-3bafac1199dd",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation",
      "status": "in-progress",
      "createdAt": "2026-02-20T10:26:41.181Z",
      "updatedAt": "2026-02-20T10:26:41.181Z"
    }
  ]
}
```

---

### 2. Get Single Task by ID
**GET** `/api/tasks/:id`

Retrieves a specific task by its unique identifier.

**Parameters:**
- `id` (path parameter) - UUID of the task

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "f9312e7d-1d33-43e2-9145-3bafac1199dd",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation",
    "status": "in-progress",
    "createdAt": "2026-02-20T10:26:41.181Z",
    "updatedAt": "2026-02-20T10:26:41.181Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Task with ID 'xxx' not found"
}
```

---

### 3. Create New Task
**POST** `/api/tasks`

Creates a new task with the provided data.

**Request Body:**
```json
{
  "title": "Task title",           // Required, 3-100 characters
  "description": "Task details",   // Optional, max 500 characters
  "status": "pending"              // Optional, defaults to "pending"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "f9312e7d-1d33-43e2-9145-3bafac1199dd",
    "title": "Task title",
    "description": "Task details",
    "status": "pending",
    "createdAt": "2026-02-20T10:26:41.181Z",
    "updatedAt": "2026-02-20T10:26:41.181Z"
  }
}
```

**Validation Errors:** `400 Bad Request`
```json
{
  "error": {
    "message": "Title is required and must be a string",
    "statusCode": 400
  }
}
```

---

### 4. Update Task
**PUT** `/api/tasks/:id`

Updates an existing task. Supports partial updates.

**Parameters:**
- `id` (path parameter) - UUID of the task

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "f9312e7d-1d33-43e2-9145-3bafac1199dd",
    "title": "Updated title",
    "description": "Updated description",
    "status": "completed",
    "createdAt": "2026-02-20T10:26:41.181Z",
    "updatedAt": "2026-02-20T10:30:15.432Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Task with ID 'xxx' not found"
}
```

---

### 5. Delete Task
**DELETE** `/api/tasks/:id`

Permanently removes a task from the system.

**Parameters:**
- `id` (path parameter) - UUID of the task

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Task with ID 'xxx' not found"
}
```

---

## Validation Rules

### Title
- **Required** for creating tasks
- Must be a string
- Minimum length: 3 characters
- Maximum length: 100 characters
- Automatically trimmed of whitespace

### Description
- **Optional**
- Must be a string if provided
- Maximum length: 500 characters
- Automatically trimmed of whitespace

### Status
- **Optional** for creating tasks (defaults to "pending")
- Must be one of: `pending`, `in-progress`, `completed`, `blocked`

### Task ID
- Must be a valid UUID v4 format
- Example: `f9312e7d-1d33-43e2-9145-3bafac1199dd`

---

## Error Handling

All errors follow a consistent format:

### Validation Errors (400)
```json
{
  "error": {
    "message": "Validation error message",
    "statusCode": 400
  }
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Resource not found message"
}
```

### Server Errors (500)
```json
{
  "error": {
    "message": "Internal Server Error",
    "statusCode": 500
  }
}
```

---

## Example Usage with cURL

### Create a task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive documentation for all endpoints",
    "status": "in-progress"
  }'
```

### Get all tasks
```bash
curl -X GET http://localhost:3000/api/tasks
```

### Get single task
```bash
curl -X GET http://localhost:3000/api/tasks/{task-id}
```

### Update a task
```bash
curl -X PUT http://localhost:3000/api/tasks/{task-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete a task
```bash
curl -X DELETE http://localhost:3000/api/tasks/{task-id}
```

---

## Architecture

### Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── health.controller.ts    # Health check endpoint
│   │   └── task.controller.ts      # Task CRUD operations
│   ├── middleware/
│   │   ├── errorHandler.ts         # Global error handling
│   │   └── taskValidation.ts       # Request validation
│   ├── models/
│   │   ├── task.model.ts           # Task interface & DTOs
│   │   └── task.store.ts           # In-memory data store
│   ├── routes/
│   │   ├── health.routes.ts        # Health check routes
│   │   └── task.routes.ts          # Task API routes
│   ├── app.ts                      # Express app configuration
│   └── server.ts                   # Server entry point
```

### Design Patterns
- **Modular Architecture**: Separation of concerns (routes, controllers, models, middleware)
- **Singleton Pattern**: Single instance of task store
- **DTO Pattern**: Data Transfer Objects for request/response validation
- **Middleware Chain**: Validation → Controller → Error Handler
- **RESTful Design**: Standard HTTP methods and status codes

### Performance Optimizations
- **Map-based Storage**: O(1) lookup time for task retrieval
- **UUID Generation**: Using Node.js crypto module (faster than external libraries)
- **Input Trimming**: Automatic whitespace removal for cleaner data

---

## Testing

All endpoints have been tested with the following scenarios:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Input validation (title length, status values, required fields)
- ✅ UUID format validation
- ✅ Error handling (404, 400, 500)
- ✅ Partial updates
- ✅ Default values (status defaults to "pending")
- ✅ All four status types: pending, in-progress, completed, blocked

---

## Future Enhancements

Potential improvements for production use:
- Add authentication and authorization
- Implement pagination for GET /api/tasks
- Add filtering and sorting capabilities
- Implement search functionality
- Add task priority field
- Add due dates and reminders
- Implement task assignment to users
- Add database persistence (PostgreSQL, MongoDB)
- Add unit and integration tests
- Implement rate limiting
- Add CORS configuration
- Add API versioning
- Add logging with Winston or Morgan
