import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CreateCapsuleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    unlock_date: new Date(),
    visibility: 'private'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call to create capsule
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Create Time Capsule
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Capsule Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Your Message"
            multiline
            rows={6}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            required
          />
          <DateTimePicker
            label="Unlock Date"
            value={formData.unlock_date}
            onChange={(newValue) => setFormData({ ...formData, unlock_date: newValue || new Date() })}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Visibility</InputLabel>
            <Select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="shared">Shared</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
          >
            Create Capsule
          </Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default CreateCapsuleForm;