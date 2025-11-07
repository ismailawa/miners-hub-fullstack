import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { expect } from '@jest/globals';
import { createAuthHeaders } from './auth.helper';
import { User } from '../../src/entities/user.entity';

/**
 * API Helper
 * 
 * Utilities for making API requests in tests
 */

export interface ApiRequestOptions {
  user?: Partial<User> | { id: string; role: string };
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string | number | boolean>;
}

/**
 * Make a GET request
 * 
 * @param app - NestJS application instance
 * @param path - API path (without /api prefix)
 * @param options - Request options
 * @returns Supertest response
 */
export function getRequest(
  app: INestApplication,
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (options.user) {
    Object.assign(headers, createAuthHeaders(options.user));
  }

  let url = `/api${path}`;
  if (options.query) {
    const queryString = new URLSearchParams(
      Object.entries(options.query).reduce(
        (acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>,
      ),
    ).toString();
    url += `?${queryString}`;
  }

  return request(app.getHttpServer()).get(url).set(headers);
}

/**
 * Make a POST request
 * 
 * @param app - NestJS application instance
 * @param path - API path (without /api prefix)
 * @param options - Request options
 * @returns Supertest response
 */
export function postRequest(
  app: INestApplication,
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.user) {
    Object.assign(headers, createAuthHeaders(options.user));
  }

  return request(app.getHttpServer())
    .post(`/api${path}`)
    .set(headers)
    .send(options.body || {});
}

/**
 * Make a PUT request
 * 
 * @param app - NestJS application instance
 * @param path - API path (without /api prefix)
 * @param options - Request options
 * @returns Supertest response
 */
export function putRequest(
  app: INestApplication,
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.user) {
    Object.assign(headers, createAuthHeaders(options.user));
  }

  return request(app.getHttpServer())
    .put(`/api${path}`)
    .set(headers)
    .send(options.body || {});
}

/**
 * Make a PATCH request
 * 
 * @param app - NestJS application instance
 * @param path - API path (without /api prefix)
 * @param options - Request options
 * @returns Supertest response
 */
export function patchRequest(
  app: INestApplication,
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.user) {
    Object.assign(headers, createAuthHeaders(options.user));
  }

  return request(app.getHttpServer())
    .patch(`/api${path}`)
    .set(headers)
    .send(options.body || {});
}

/**
 * Make a DELETE request
 * 
 * @param app - NestJS application instance
 * @param path - API path (without /api prefix)
 * @param options - Request options
 * @returns Supertest response
 */
export function deleteRequest(
  app: INestApplication,
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (options.user) {
    Object.assign(headers, createAuthHeaders(options.user));
  }

  return request(app.getHttpServer()).delete(`/api${path}`).set(headers);
}

/**
 * Assert successful response (2xx status)
 */
export function expectSuccessResponse(response: Response, statusCode: number = 200): void {
  expect(response.status).toBe(statusCode);
  expect(response.body).toBeDefined();
}

/**
 * Assert error response (4xx or 5xx status)
 */
export function expectErrorResponse(
  response: Response,
  statusCode: number = 400,
): void {
  expect(response.status).toBe(statusCode);
  expect(response.body).toBeDefined();
}

/**
 * Assert validation error response
 */
export function expectValidationError(response: Response): void {
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('message');
  expect(Array.isArray(response.body.message)).toBe(true);
}

/**
 * Assert unauthorized response
 */
export function expectUnauthorizedResponse(response: Response): void {
  expect(response.status).toBe(401);
}

/**
 * Assert forbidden response
 */
export function expectForbiddenResponse(response: Response): void {
  expect(response.status).toBe(403);
}

/**
 * Assert not found response
 */
export function expectNotFoundResponse(response: Response): void {
  expect(response.status).toBe(404);
}

