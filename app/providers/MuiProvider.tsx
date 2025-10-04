// app/providers/MuiProvider.tsx
"use client";

import React, { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const DRAWER_WIDTH = 200; // tweak: 180..220

const theme = createTheme({
  typography: {
    fontSize: 13, // base font slightly smaller
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // optional: tighter text rendering
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },

    // AppBar & Toolbar — shorter header
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 48,
          paddingLeft: 8,
          paddingRight: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: 48,
        },
      },
    },

    // Drawer width & list density
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: DRAWER_WIDTH,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 12,
          paddingRight: 12,
        },
      },
    },

    // Buttons & IconButtons
    MuiButton: {
      defaultProps: { size: "small", disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          padding: "4px 8px",
          borderRadius: 6,
          minWidth: 64,
        },
      },
    },
    MuiIconButton: {
      defaultProps: { size: "small" },
    },

    // Inputs
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },

    // Cards
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "8px 12px",
        },
      },
    },

    // Dialog (smaller padding)
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 8,
          padding: 8,
          maxWidth: 640,
          borderRadius: 8,
        },
      },
    },

    // Tables — small, tighter cells
    MuiTable: {
      defaultProps: { size: "small" },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "6px 10px",
          fontSize: "0.88rem",
        },
      },
    },

    // Dividers / List items subtle
    MuiDivider: {
      styleOverrides: {
        root: { marginTop: 6, marginBottom: 6 },
      },
    },
  },
});

export default function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
