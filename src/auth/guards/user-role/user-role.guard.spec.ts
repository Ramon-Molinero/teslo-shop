import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new UserRoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when valid roles are not required', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(null); // No roles set on the handler

    const context = createMockContext({
      user: { roles: ['user'], fullName: 'Test User' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has a valid role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']); // Valid role: admin

    const context = createMockContext({
      user: { roles: ['admin'], fullName: 'Test User' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user does not have a valid role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']); // Valid role: admin

    const context = createMockContext({
      user: { roles: ['user'], fullName: 'Test User' },
    });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('User Test User with roles: user, is not allowed to access this resource'),
    );
  });

  it('should throw BadRequestException if user is not present', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']); // Valid role: admin

    const context = createMockContext({
      user: null, // No user object
    });

    expect(() => guard.canActivate(context)).toThrow(
      new BadRequestException('User not found'),
    );
  });
});

// Helper function to create a mock execution context
function createMockContext(mockData: { user?: any }): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: mockData.user,
      }),
    }),
  } as unknown as ExecutionContext;
}
