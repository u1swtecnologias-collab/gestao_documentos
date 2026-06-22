import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Login inicial
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at; // geralmente expira em 1 hora
      }

      // Se o token ainda não expirou, retorna o token atual (adicionando uma margem de segurança de 5 minutos)
      if (token.expiresAt && (Date.now() / 1000) < (token.expiresAt as number) - 300) {
        return token;
      }

      // Se expirou (ou está quase), tenta atualizar
      if (token.refreshToken) {
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.AUTH_GOOGLE_ID!,
              client_secret: process.env.AUTH_GOOGLE_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });

          const tokens = await response.json();

          if (!response.ok) throw tokens;

          token.accessToken = tokens.access_token;
          token.expiresAt = Math.floor(Date.now() / 1000 + tokens.expires_in);
          
          if (tokens.refresh_token) {
            token.refreshToken = tokens.refresh_token;
          }
        } catch (error) {
          console.error("Erro ao atualizar o Google Access Token:", error);
          token.error = "RefreshAccessTokenError";
        }
      }

      return token;
    },
    async session({ session, user, token }: any) {
      if (session.user) {
        session.user.id = user?.id || token?.sub;
        session.accessToken = token?.accessToken;
        
        // Fetch 'perfil' information from the db
        if (session.user.id) {
          const dbUser = await prisma.user.findUnique({ 
            where: { id: session.user.id }, 
            include: { perfil: true }
          });
          if (dbUser) {
            (session.user as any).perfilId = dbUser.perfilId;
            (session.user as any).perfilNome = dbUser.perfil?.nome;
          }
        }
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  events: {
    async createUser({ user }) {
      // By default, assign 'Consulta' profile to new users
      const consultaProfile = await prisma.perfil.findUnique({ where: { nome: 'Consulta' }});
      if (consultaProfile && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { perfilId: consultaProfile.id }
        });
      }
    }
  }
})
