import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CreateCapsuleForm from '../components/CreateCapsuleForm';

const CreateCapsulePage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Time Capsule
        </Typography>
        <CreateCapsuleForm />
      </Box>
    </Container>
  );
};

export default CreateCapsulePage;