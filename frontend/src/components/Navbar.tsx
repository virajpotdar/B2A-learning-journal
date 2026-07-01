import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  TextField,
  Avatar,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  DarkMode,
  LightMode,
  School,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useThemeMode } from '../theme/AppThemeProvider';
import { useSearch } from '../context/SearchContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleMode } = useThemeMode();
  const { openSearch } = useSearch();
  const { isAuthenticated, user } = useAuth0();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showBackButton = location.pathname !== '/journal' && location.pathname !== '/login' && isAuthenticated;

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ maxWidth: 1400, width: '100%', mx: 'auto', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {showBackButton && (
              <IconButton
                onClick={() => navigate(-1)}
                sx={{ mr: 0.5 }}
                size="small"
              >
                <ArrowBack />
              </IconButton>
            )}
            <School sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography
              variant="h6"
              component={Link}
              to={isAuthenticated ? '/journal' : '/login'}
              sx={{
                fontWeight: 800,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              LearnPath
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <TextField
                placeholder="Search learning paths, topics..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: 400,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 0 0 1px rgba(255,255,255,0.1)'
                          : '0 0 0 1px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 0 0 2px rgba(99, 102, 241, 0.5)'
                          : '0 0 0 2px rgba(99, 102, 241, 0.3)',
                    },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
           
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleMode} size="small">
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>

            {isAuthenticated ? (
              <>
                <Avatar
                  src={user?.picture}
                  onClick={handleProfileClick}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {getInitials(user?.name)}
                </Avatar>
                <ProfileDropdown
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={handleProfileClose}
                />
              </>
            ) : (
              !isMobile && (
                <Button component={Link} to="/login" variant="contained" size="small">
                  Login
                </Button>
              )
            )}

            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            <ListItemButton onClick={() => { openSearch(); setDrawerOpen(false); }}>
              <Search sx={{ mr: 2 }} />
              <ListItemText primary="Search" />
            </ListItemButton>
            {isAuthenticated && (
              <ListItemButton onClick={handleProfileClick}>
                <ListItemText primary="Profile" />
              </ListItemButton>
            )}
            {!isAuthenticated && (
              <ListItemButton component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
                <ListItemText primary="Login" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
