import { createContext } from "react";

// Context object — kept separate from the Provider component so that
// Fast Refresh works correctly during development.
export const PortfolioContext = createContext(null);
