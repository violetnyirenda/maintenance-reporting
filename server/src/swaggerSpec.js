const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Maintenance Reporting API',
    version: '1.0.0',
    description:
      'University maintenance reporting API. Register or login to get a JWT, then use Authorize in Swagger UI.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          detail: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['reporter', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'fullName'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@university.ac.zm' },
          password: { type: 'string', minLength: 6, example: 'password123' },
          fullName: { type: 'string', example: 'Jane Student' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@university.ac.zm' },
          password: { type: 'string', example: 'admin123' },
        },
      },
      Attachment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          reportId: { type: 'integer' },
          fileName: { type: 'string' },
          mimeType: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Report: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          reporterId: { type: 'integer' },
          reporterName: { type: 'string' },
          reporterEmail: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          category: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          status: { type: 'string', enum: ['pending', 'in_progress', 'resolved', 'closed'] },
          adminNotes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          attachments: {
            type: 'array',
            items: { $ref: '#/components/schemas/Attachment' },
          },
        },
      },
      CreateReportRequest: {
        type: 'object',
        required: ['title', 'description', 'location', 'category'],
        properties: {
          title: { type: 'string', example: 'Broken projector in Lab 3' },
          description: { type: 'string', example: 'Projector will not turn on.' },
          location: { type: 'string', example: 'Block B, Room 204' },
          category: { type: 'string', example: 'IT Equipment' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' },
        },
      },
      UpdateReportRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          category: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          status: { type: 'string', enum: ['pending', 'in_progress', 'resolved', 'closed'] },
          adminNotes: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register as reporter',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Registered',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Logged in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List reports',
        description: 'Reporters see own reports. Admins see all reports.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of reports',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reports: { type: 'array', items: { $ref: '#/components/schemas/Report' } },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Reports'],
        summary: 'Create report',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateReportRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { report: { $ref: '#/components/schemas/Report' } },
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/reports/{id}': {
      get: {
        tags: ['Reports'],
        summary: 'Get report by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Report detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { report: { $ref: '#/components/schemas/Report' } },
                },
              },
            },
          },
          403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Reports'],
        summary: 'Update report',
        description: 'Reporters can edit own pending reports. Admins can update status and admin notes.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateReportRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { report: { $ref: '#/components/schemas/Report' } },
                },
              },
            },
          },
          403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Reports'],
        summary: 'Delete report',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string', example: 'Report deleted' } },
                },
              },
            },
          },
          403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/reports/{id}/attachments': {
      post: {
        tags: ['Reports'],
        summary: 'Upload attachment',
        description: 'Images or PDF, max 5MB. Field name must be `file`.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { attachment: { $ref: '#/components/schemas/Attachment' } },
                },
              },
            },
          },
          400: { description: 'No file', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/reports/{id}/attachments/{attachmentId}': {
      get: {
        tags: ['Reports'],
        summary: 'Download attachment',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'attachmentId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'File download' },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

export default swaggerSpec;
