import { ServiceUnavailableException } from '@nestjs/common';
import { SignNowService } from './signnow.service';

describe('SignNowService', () => {
  function createService(ownerEmail?: string) {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'SIGNNOW_OWNER_EMAIL') return ownerEmail;
        if (key === 'SIGNNOW_API_KEY') return 'token';
        return undefined;
      }),
    };
    const httpService = {
      post: jest.fn(),
      put: jest.fn(),
      get: jest.fn(),
    };

    return new SignNowService(configService as any, httpService as any);
  }

  it('allows signer invites when no owner email is configured', () => {
    const service = createService();

    expect(() =>
      service.assertCanInviteSigners('investor@example.com', 'miner@example.com'),
    ).not.toThrow();
  });

  it('rejects signer invites when the SignNow owner is one of the signers', () => {
    const service = createService('investor@example.com');

    expect(() =>
      service.assertCanInviteSigners('Investor@Example.com', 'miner@example.com'),
    ).toThrow(ServiceUnavailableException);
  });
});
