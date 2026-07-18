import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { PrismaService } from '../prisma/prisma.service';

export interface CustomerProfile {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  picture: string | null;
  phone: string | null;
  verifiedUser: boolean;
}

@Injectable()
export class CustomerAuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify Firebase ID token and find/create the corresponding customer.
   */
  async findOrCreateFromFirebaseToken(
    idToken: string,
  ): Promise<CustomerProfile> {
    const decodedToken = await getAuth().verifyIdToken(idToken);

    return this.findOrCreateFromFirebase(decodedToken.uid, {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      phone_number: decodedToken.phone_number,
      email_verified: decodedToken.email_verified,
    });
  }

  /**
   * Find or create a Customer from a verified Firebase token.
   */
  async findOrCreateFromFirebase(
    firebaseUid: string,
    firebaseUser: {
      uid: string;
      email?: string;
      name?: string;
      picture?: string;
      phone_number?: string;
      email_verified?: boolean;
    },
  ): Promise<CustomerProfile> {
    let customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
    });

    if (!customer && firebaseUser.email) {
      const byEmail = await this.prisma.customer.findUnique({
        where: { email: firebaseUser.email },
      });

      if (byEmail) {
        customer = await this.prisma.customer.update({
          where: { id: byEmail.id },
          data: {
            firebaseUid,
            picture: firebaseUser.picture ?? byEmail.picture,
            verifiedUser: firebaseUser.email_verified ?? false,
          },
        });
      }
    }

    if (!customer) {
      const nameParts = (firebaseUser.name ?? '').split(' ');
      customer = await this.prisma.customer.create({
        data: {
          firebaseUid,
          email: firebaseUser.email ?? `${firebaseUid}@firebase.user`,
          firstName: nameParts[0] ?? null,
          lastName: nameParts.slice(1).join(' ') || null,
          picture: firebaseUser.picture ?? null,
          phone: firebaseUser.phone_number ?? null,
          verifiedUser: firebaseUser.email_verified ?? false,
        },
      });
    }

    return {
      id: customer.id,
      firebaseUid: customer.firebaseUid ?? firebaseUid,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      username: customer.username,
      picture: customer.picture,
      phone: customer.phone,
      verifiedUser: customer.verifiedUser,
    };
  }

  /**
   * Get customer profile from Firebase UID.
   */
  async getProfile(firebaseUid: string): Promise<CustomerProfile> {
    const customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    return {
      id: customer.id,
      firebaseUid: customer.firebaseUid ?? firebaseUid,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      username: customer.username,
      picture: customer.picture,
      phone: customer.phone,
      verifiedUser: customer.verifiedUser,
    };
  }
}
