'use client';
import { ReactNode } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemText, AppBar, Toolbar, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const drawerWidth = 240;

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const router = useRouter();
    const menuItems = [
        { name: 'Home', path: '/' },
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
            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap>
                        Data and Workflow Management Tool
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', mt: 8 },
                }}
            >
                <List>
                    {menuItems.map((item) => (
                        <ListItemButton key={item.name} onClick={() => router.push(item.path)}>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                {children}
            </Box>
        </Box>
    );
}
