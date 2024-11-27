export interface ThemeColors {
  primary: string;
  secondary: string;
  text: string;
  accent: string;
  textSecondary: string;
  lightGold: string;
  darkGold: string;
  white: string;
  background: string;
  backgroundSecondary: string;
  wallet1Background: string;
  wallet1Text: string;
  wallet1Border: string;
  wallet2Background: string;
  wallet2Text: string;
  wallet2Border: string;
  wallet3Background: string;
  wallet3Text: string;
  wallet3Border: string;
  websiteText: string;
  privacyLink: string;
  termsLink: string;
  footerText: string;
  buyMeACoffeeText: string;
}

export interface AppConfig {
  title: string;
  logo: string;
  description: string;
  footerText: string;
  buyMeACoffeeText: string;
  wallet1Network: string;
  wallet1Address: string;
  wallet2Network: string;
  wallet2Address: string;
  wallet3Network: string;
  wallet3Address: string;
  footerLinks: {
    text: string;
    url: string;
  }[];
  colors: ThemeColors;
  customTexts: {
    [key: string]: string;
  };
}

export const defaultConfig: AppConfig = {
  title: "DeFi Calculator",
  logo: "/logo.png",
  description: "Calculate your DeFi yields",
  footerText: " 2024 DeFi Calculator",
  buyMeACoffeeText: "Buy Me a Coffee",
  wallet1Network: "SOL",
  wallet1Address: "Baq8RTLnkRoPJCRrSh382ZimMW9uYqHCHC18EpdoZNyM",
  wallet2Network: "",
  wallet2Address: "",
  wallet3Network: "",
  wallet3Address: "",
  footerLinks: [
    { text: "Privacy Policy", url: "#" },
    { text: "Terms of Service", url: "#" }
  ],
  colors: {
    primary: "#FFB900",
    secondary: "#1D1E2D",
    text: "#EDF4F8",
    accent: "#E0820B",
    textSecondary: "#90C4E6",
    lightGold: "#EBD688",
    darkGold: "#DEB254",
    white: "#FFFFFF",
    background: "#191A1B",
    backgroundSecondary: "#333441",
    wallet1Background: "#333441",
    wallet1Text: "#EDF4F8",
    wallet1Border: "#1D1E2D",
    wallet2Background: "#333441",
    wallet2Text: "#EDF4F8",
    wallet2Border: "#1D1E2D",
    wallet3Background: "#333441",
    wallet3Text: "#EDF4F8",
    wallet3Border: "#1D1E2D",
    websiteText: "#EDF4F8",
    privacyLink: "#90C4E6",
    termsLink: "#90C4E6",
    footerText: "#EDF4F8",
    buyMeACoffeeText: "#E0820B"
  },
  customTexts: {
    poolDetails: "Pool Details",
    yieldSettings: "Yield Settings",
    initialBalance: "Initial Balance",
    currentBalance: "Current Balance",
    dailyYield: "Daily Yield",
    simulationDays: "Simulation Days",
    pendingYield: "Pending Yield (24h)",
    projectedYield: "Projected Yield",
    estimatedApr: "Estimated APR",
    monthlyApr: "Monthly APR",
    impermanentLoss: "Impermanent Loss",
    adjustedYield: "Adjusted Total Yield"
  }
};
