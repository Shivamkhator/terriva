export const rpName = "Terriva"
export const rpID =
  process.env.NODE_ENV === "production"
    ? "terriva.vercel.app"
    : "localhost"

export const origin =
  process.env.NODE_ENV === "production"
    ? "https://terriva.vercel.app"
    : "http://localhost:3000"
