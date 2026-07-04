import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import PDFDocument from 'pdfkit';
import FormData from 'form-data';

@Injectable()
export class SignNowService {
  private readonly logger = new Logger(SignNowService.name);
  private readonly baseUrl = 'https://api.signnow.com';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private get headers() {
    const apiKey = this.configService.get<string>('SIGNNOW_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('SignNow is not configured.');
    }
    // Assuming the user provided API key is a bearer token
    return {
      Authorization: `Bearer ${apiKey}`,
    };
  }

  /**
   * Generates a basic PDF from contract text terms.
   */
  async generateContractPdf(terms: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(20).text('Miners Hub Contract', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(terms);

        // Add some space at the bottom for signatures
        doc.moveDown(5);
        doc.text('Miner Signature:', 50);
        doc.text('Investor Signature:', 350, doc.y - 12); // Same line

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Uploads a document to SignNow.
   * @returns document_id
   */
  async uploadDocument(
    pdfBuffer: Buffer,
    fileName: string = 'Contract.pdf',
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', pdfBuffer, {
      filename: fileName,
      contentType: 'application/pdf',
    });

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/document`, formData, {
          headers: {
            ...this.headers,
            ...formData.getHeaders(),
          },
        }),
      );
      return data.id;
    } catch (err: any) {
      this.logger.error(
        'Failed to upload document to SignNow',
        err.response?.data || err.message,
      );
      throw new HttpException(
        'SignNow upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Adds signature fields to the uploaded document.
   */
  async addSignatureFields(documentId: string): Promise<void> {
    const payload = {
      fields: [
        {
          x: 50,
          y: 700,
          width: 200,
          height: 50,
          page_number: 0,
          role: 'Party1',
          required: true,
          type: 'signature',
        },
        {
          x: 350,
          y: 700,
          width: 200,
          height: 50,
          page_number: 0,
          role: 'Party2',
          required: true,
          type: 'signature',
        },
      ],
    };

    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.baseUrl}/document/${documentId}`,
          payload,
          {
            headers: {
              ...this.headers,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (err: any) {
      this.logger.error(
        'Failed to add fields to SignNow document',
        err.response?.data || err.message,
      );
      throw new HttpException(
        'SignNow field generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Creates embedded invites for both parties.
   */
  async createEmbeddedInvites(
    documentId: string,
    party1Email: string,
    party2Email: string,
  ): Promise<void> {
    const payload = {
      invites: [
        {
          email: party1Email,
          role: 'Party1',
          order: 1,
          auth_method: 'none',
        },
        {
          email: party2Email,
          role: 'Party2',
          order: 1,
          auth_method: 'none',
        },
      ],
    };

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v2/documents/${documentId}/embedded-invites`,
          payload,
          {
            headers: {
              ...this.headers,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (err: any) {
      this.logger.error(
        'Failed to create embedded invites',
        err.response?.data || err.message,
      );
      throw new HttpException(
        'SignNow invite creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Gets the embedded signing link for a specific email.
   */
  async getSigningLink(
    documentId: string,
    email: string,
    redirectUri?: string,
  ): Promise<string> {
    try {
      const { data: invitesData } = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/v2/documents/${documentId}/embedded-invites`,
          {
            headers: this.headers,
          },
        ),
      );

      const invite = invitesData.data.find((inv: any) => inv.email === email);
      if (!invite) {
        throw new Error(`No invite found for email ${email}`);
      }

      const payload: any = {
        auth_method: 'none',
        link_expiration: 30, // minutes
      };

      if (redirectUri) {
        payload.redirect_uri = redirectUri;
      }

      const { data: linkData } = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v2/documents/${documentId}/embedded-invites/${invite.id}/link`,
          payload,
          {
            headers: {
              ...this.headers,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return linkData.data.link;
    } catch (err: any) {
      this.logger.error(
        'Failed to generate signing link',
        err.response?.data || err.message,
      );
      throw new HttpException(
        'SignNow link generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Gets a document's details from SignNow
   */
  async getDocument(documentId: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/document/${documentId}`, {
          headers: this.headers,
        }),
      );
      return data;
    } catch (err: any) {
      this.logger.error(
        'Failed to fetch document from SignNow',
        err.response?.data || err.message,
      );
      throw new HttpException(
        'SignNow fetch document failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
