'use client';
import { ReactNode } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemText, AppBar, Toolbar, Typography } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { DRAWER_WIDTH } from "@/app/providers/MuiProvider";

// const drawerWidth = 240;

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();   // current route
    const menuItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'API', path: '/api-page' },
        { name: 'Builder', path: '/builder' },
        { name: 'Models', path: '/models' },
        { name: 'Data Source', path: '/sources' },
        { name: 'Communication', path: '/communications' },
        { name: 'Users', path: '/users' },
        { name: 'Roles', path: '/roles' },
        { name: 'Usergroup', path: '/user-groups' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="subtitle1" noWrap>Data and Workflow Management Tool</Typography>
                    {/* small space, use IconButtons for actions */}
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>                    
                <List>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.name}
                            onClick={() => router.push(item.path)}
                            selected={pathname.startsWith(item.path)} // ✅ highlight active
                        >
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    ))}
                </List>
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 1,               // compact padding (was p:3)
                    // ml: `${DRAWER_WIDTH}px`, // ensures content doesn't hide under drawer
                    mt: "48px",         // matches AppBar height from theme
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
