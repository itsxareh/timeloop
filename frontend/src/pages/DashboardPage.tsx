import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4">
            Welcome back, {user?.username}!
          </Typography>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>
        
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                    Time Capsules
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                    Create messages for your future self
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/create')}>
                    Create Capsule
                    </Button>
                </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                    My Capsules
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                    View your locked and unlocked capsules
                    </Typography>
                    <Button variant="outlined">View All</Button>
                </CardContent>
                </Card>
            </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;