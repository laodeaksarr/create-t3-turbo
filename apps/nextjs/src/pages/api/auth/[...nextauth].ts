import NextAuth from "next-auth";

import { authOptions } from "@acme/auth";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default NextAuth(authOptions);