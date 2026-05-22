export class LogoutUseCase {
  async execute(): Promise<void> {
    // Session cleanup is handled by Supabase Auth client-side
    return Promise.resolve();
  }
}
