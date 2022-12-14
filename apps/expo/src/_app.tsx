import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TRPCProvider } from "./utils/api";

import { HomeScreen } from "./screens/home";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { tokenCache } from "./cache";
import SignInScreen from "./SignInScreen";

const clerk_frontend_api = "clerk.easy.cricket-4.lcl.dev";

export const App = () => {
  return (
    <ClerkProvider
      frontendApi={clerk_frontend_api}
      tokenCache={tokenCache} //THIS IS REQUIRED!!!!
    >
      <SignedIn>
        <TRPCProvider>
          <SafeAreaProvider>
            <HomeScreen />
            <StatusBar />
          </SafeAreaProvider>
        </TRPCProvider>
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
    </ClerkProvider>
  );
};
