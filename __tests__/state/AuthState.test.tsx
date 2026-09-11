import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth } from '../../src/services/context/AuthState';
import { supabase } from '../../src/services/supabase/client';

const mockUnsubscribe = jest.fn();

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

let capturedAuth: ReturnType<typeof useAuth> | null = null;

const TestComponent = () => {
  capturedAuth = useAuth();
  return null;
};

describe('AuthState Reliability Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedAuth = null;
    (supabase!.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('restores valid user session on startup and completes isLoading', async () => {
    const fakeSession = {
      user: { id: 'usr_100', email: 'test@example.com' },
    };
    (supabase!.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: fakeSession },
    });
    (supabase!.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({
        data: { id: 'usr_100', display_name: 'Walter', role: 'admin' },
        error: null,
      }),
    });

    await act(async () => {
      renderer.create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(capturedAuth?.isLoading).toBe(false);
    expect(capturedAuth?.isAuthenticated).toBe(true);
    expect(capturedAuth?.user?.id).toBe('usr_100');
    expect(capturedAuth?.role).toBe('admin');
  });

  it('handles null session on startup safely without crashing', async () => {
    (supabase!.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    await act(async () => {
      renderer.create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(capturedAuth?.isLoading).toBe(false);
    expect(capturedAuth?.isAuthenticated).toBe(false);
    expect(capturedAuth?.user).toBeNull();
    expect(capturedAuth?.role).toBe('user');
  });

  it('unsubscribes auth state listener on unmount', async () => {
    (supabase!.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    act(() => {
      component.unmount();
    });

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('performs signOut cleanly and clears user/profile state', async () => {
    (supabase!.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });
    (supabase!.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    await act(async () => {
      renderer.create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      await capturedAuth?.signOut();
    });

    expect(supabase!.auth.signOut).toHaveBeenCalled();
    expect(capturedAuth?.isAuthenticated).toBe(false);
    expect(capturedAuth?.user).toBeNull();
  });
});
