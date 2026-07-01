import { Box, Container, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchSection() {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <TextField
          fullWidth
          placeholder="Search topics, categories, or skills..."
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 600,
            mx: 'auto',
            display: 'block',
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'white',
            },
          }}
        />
      </Container>
    </Box>
  );
}
