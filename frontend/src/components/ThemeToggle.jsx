import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-secondary text-sm ${className}`.trim()}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
