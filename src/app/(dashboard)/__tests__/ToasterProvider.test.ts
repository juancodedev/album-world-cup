import { ToasterProvider } from '../ToasterProvider';

describe('ToasterProvider', () => {
  it('should be a function (React component)', () => {
    expect(typeof ToasterProvider).toBe('function');
  });

  it('should have displayName or name matching the export', () => {
    expect(ToasterProvider.name).toBe('ToasterProvider');
  });
});
