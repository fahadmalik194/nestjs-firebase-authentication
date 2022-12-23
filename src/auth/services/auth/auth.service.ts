import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly app: admin.app.App;

  constructor() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.app.auth().verifyIdToken(idToken);
  }
}
