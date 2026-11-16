
import GitHubProvider from "next-auth/providers/github";

export function isAdmin(email) {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes((email || "").toLowerCase());
}

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        session.user.isAdmin = isAdmin(session.user.email);
      }

      return session;
    },
  },
};
