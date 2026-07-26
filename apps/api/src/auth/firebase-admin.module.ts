import { Global, Module } from '@nestjs/common';
import {
  initializeApp,
  cert,
  getApps,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const FIREBASE_APP = 'FIREBASE_APP';
export const FIRESTORE = 'FIRESTORE';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_APP,
      useFactory: () => {
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (getApps().length === 0) {
          if (serviceAccountEnv) {
            return initializeApp({
              credential: cert(JSON.parse(serviceAccountEnv) as ServiceAccount),
            });
          } else if (process.env.FIREBASE_PROJECT_ID) {
            return initializeApp({
              projectId: process.env.FIREBASE_PROJECT_ID,
            });
          } else {
            throw new Error(
              'Firebase Admin: set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID env var',
            );
          }
        }

        return getApps()[0];
      },
    },
    {
      provide: FIRESTORE,
      useFactory: (app: App) => getFirestore(app),
      inject: [FIREBASE_APP],
    },
  ],
  exports: [FIREBASE_APP, FIRESTORE],
})
export class FirebaseAdminModule {}
