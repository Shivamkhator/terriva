import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, hashEmail } from "@/lib/crypto";

import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  VerificationToken,
} from "@auth/core/adapters";

export function EncryptedPrismaAdapter(): Adapter {
  const base = PrismaAdapter(prisma);

  return {
    ...base,

    // ───────── USERS ─────────
    async createUser(user: Omit<AdapterUser, "id">) {
      const created = await prisma.user.create({
        data: {
          emailEnc: user.email ? encrypt(user.email) : null,
          emailHash: user.email ? hashEmail(user.email) : null,
          nameEnc: user.name ? encrypt(user.name) : null,
          emailVerified: user.emailVerified,
        },
      });

      return {
        id: created.id,
        email: user.email!,
        name: user.name ?? null,
        emailVerified: created.emailVerified,
        image: user.image ?? null,
      };
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;

      return {
        id: user.id,
        email: user.emailEnc ? decrypt(user.emailEnc) : "",
        name: user.nameEnc ? decrypt(user.nameEnc) : null,
        emailVerified: user.emailVerified,
        image: null,
      };
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({
        where: { emailHash: hashEmail(email) },
      });
      if (!user) return null;

      return {
        id: user.id,
        email,
        name: user.nameEnc ? decrypt(user.nameEnc) : null,
        emailVerified: user.emailVerified,
        image: null,
      };
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailEnc: user.email ? encrypt(user.email) : undefined,
          emailHash: user.email ? hashEmail(user.email) : undefined,
          nameEnc: user.name ? encrypt(user.name) : undefined,
          emailVerified: user.emailVerified,
        },
      });

      return {
        id: updated.id,
        email:
          user.email ?? (updated.emailEnc ? decrypt(updated.emailEnc) : ""),
        name: user.name ?? (updated.nameEnc ? decrypt(updated.nameEnc) : null),
        emailVerified: updated.emailVerified,
        image: user.image ?? null,
      };
    },

    // ───────── MAGIC LINK ─────────
    async createVerificationToken(token: VerificationToken) {
      await prisma.verificationToken.create({
        data: {
          identifierHash: hashEmail(token.identifier),
          token: token.token,
          expires: token.expires,
        },
      });

      return token; // must return normal shape
    },

    async useVerificationToken(params) {
      const token = await prisma.verificationToken.findUnique({
        where: {
          identifierHash_token: {
            identifierHash: hashEmail(params.identifier),
            token: params.token,
          },
        },
      });

      if (!token) return null;

      await prisma.verificationToken.delete({
        where: {
          identifierHash_token: {
            identifierHash: hashEmail(params.identifier),
            token: params.token,
          },
        },
      });

      return {
        identifier: params.identifier,
        token: token.token,
        expires: token.expires,
      };
    },

    // ───────── GOOGLE / OAUTH ─────────
    async linkAccount(account: AdapterAccount) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountIdHash: hashEmail(account.providerAccountId),
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state
            ? String(account.session_state)
            : null,
        },
      });

      return account;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountIdHash: {
            provider,
            providerAccountIdHash: hashEmail(providerAccountId),
          },
        },
        include: { user: true },
      });

      if (!account) return null;

      return {
        id: account.user.id,
        email: account.user.emailEnc ? decrypt(account.user.emailEnc) : "",
        name: account.user.nameEnc ? decrypt(account.user.nameEnc) : null,
        emailVerified: account.user.emailVerified,
        image: null,
      };
    },
  };
}
