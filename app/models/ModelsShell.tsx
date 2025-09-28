// app/models/ModelsShell.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const drawerWidth = 280;

export default function ModelsShell({
  models,
  children,
}: {
  models: { name: string }[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    // <div>
      // <Toolbar sx={{ px: 2 }}>
      //   <Typography variant="h6" noWrap>
      //     🛠️ DB Builder
      //   </Typography>
      // </Toolbar>
      // <Divider />
      <List>
        {models.length === 0 ? (
          <ListItem>
            <ListItemText primary="No models yet" />
          </ListItem>
        ) : (
          models.map((m) => {
            const href = `/models/${encodeURIComponent(m.name)}`;
            const selected = pathname === href;
            return (
              <ListItem key={m.name} disablePadding>
                {/* NextLink + MUI integration: component={NextLink as any} */}
                <ListItemButton
                  component={NextLink as any}
                  href={href}
                  selected={selected}
                >
                  <ListItemText primary={m.name} />
                </ListItemButton>
              </ListItem>
            );
          })
        )}
      </List>
    // </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "80vh" }}>
      {/* <CssBaseline /> */}
      {/* <AppBar
        position="fixed"
        color="primary"
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }} // show on mobile
            aria-label="menu"
            size="large"
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div">
            Database Models
          </Typography>
        </Toolbar>
      </AppBar> */}
      <Box
        // component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        // aria-label="mailbox folders"
      >
        {/* Permanent drawer for md+ */}
        {/* <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
        > */}
          {/* toolbar for spacing under AppBar */}
          {/* <Toolbar /> */}
          {drawer}
        {/* </Drawer> */}

        {/* Temporary drawer for mobile */}
        {/* <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer> */}
      </Box>

      

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        {/* spacing to account for fixed AppBar */}
        {/* <Toolbar /> */}
        {children}
      </Box>
    </Box>
  );
}
