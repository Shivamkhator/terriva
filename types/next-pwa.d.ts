declare module "next-pwa" {
  import type { NextConfig } from "next"

  type WithPWA = (config: NextConfig) => NextConfig
  const withPWA: (options: any) => WithPWA

  export default withPWA
}
