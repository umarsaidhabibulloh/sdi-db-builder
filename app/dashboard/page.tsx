'use client'
import { Box, Typography, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();

    const menuItems = [
        { name: 'API', path: '/api-page' },
        { name: 'Builder', path: '/builder' },
        { name: 'Models', path: '/models' },
    ];

    return (
            <Box textAlign="center" mt={5}>
                <Typography variant="h3" gutterBottom>
                    Welcome to Dashboard
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Navigate to your section
                </Typography>
                <Stack spacing={2} mt={4} direction="row" justifyContent="center">
                    {menuItems.map((item) => (
                        <Button key={item.name} variant="contained" size="large" onClick={() => router.push(item.path)}>
                            {item.name}
                        </Button>
                    ))}
                </Stack>
            </Box> 
    );
}
