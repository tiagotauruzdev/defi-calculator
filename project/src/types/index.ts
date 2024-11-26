export interface Inputs {
  initialBalance: number;
  currentBalance: number;
  dailyYield: number;
  simulationDays: number;
}

export interface Results {
  impermanentLoss: number;
  adjustedYield: number;
  pendingYield: number;
  projectedYield: number;
  estimatedApr: number;
}

export interface CalculatorProps {
  inputs: Inputs;
  setResults: (results: Results) => void;
}

export interface FooterLink {
  text: string;
  url: string;
}

export interface Config {
  wallet1Network: string;
  wallet1Address: string;
  wallet2Network: string;
  wallet2Address: string;
  wallet3Network: string;
  wallet3Address: string;
  footerText: string;
  footerLinks: FooterLink[];
  buyMeACoffeeText: string;
  colors: {
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
  };
  websiteUrl: string;
  websiteText: string;
}