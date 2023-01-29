import { AppAuthCodeflowModule } from './app-auth-codeflow.module';

describe('AppAuthCodeflowModule', () => {
  it('should have a forRoot method', () => {
    const result = AppAuthCodeflowModule.forRoot(null, false);
    expect(result).toBeTruthy();
  });
  it('should have a AuthCodeFlowServiceFactory method', () => {
    const result = AppAuthCodeflowModule.AuthCodeFlowServiceFactory(null, null);
    expect(result).toBeTruthy();
  });
});
