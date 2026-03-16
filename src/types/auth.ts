export type IdentityFile = {
  accessTokens: {
    jwt: string,
    refreshToken: string,
  },
  originalAuthProvider: string,
  platformId: string
}