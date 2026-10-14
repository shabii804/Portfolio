import { useContext } from "react";
import { PortfolioContext } from "../context/portfolioContextObject";

// Convenience hook — kept in its own file so the Provider component file
// remains "components only" and Fast Refresh works correctly.
export const usePortfolio = () => useContext(PortfolioContext);
