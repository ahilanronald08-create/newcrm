import PropTypes from 'prop-types';
import {
  Grid,
  CssBaseline,
  Drawer,
  List,
  
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  IconButton,
  Typography,
  Avatar,
  Button,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ClearIcon from '@mui/icons-material/Clear';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Logos from '../assets/rectangle.jpeg';
import Logo1 from "../assets/setting.png";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const drawerWidth = 260; // Changed from 320 to 260

function ResponsiveDrawer(props) {
  const { window, children } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false); // Changed from true to false
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const[Page,setPage]=useState(0);
  

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    const storedName = localStorage.getItem("userName");
    
    if (storedEmail) {
      setEmail(storedEmail);
      setUsername(storedName || storedEmail.split("@")[0]);
    }
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDesktopDrawerToggle = () => setDesktopOpen(!desktopOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate("/", { replace: true });
  };

  const menuItems = [
    { icon: DashboardCustomizeOutlinedIcon, label: 'Dashboard', path: '/dashboard', color: 'red' },
    { icon: AddReactionOutlinedIcon, label: 'Add Lead', path: '/addlead', color: 'red' },
    { icon: SearchOutlinedIcon, label: 'Search Lead', path: '/searchlead', color: 'red' },
    { icon: SendOutlinedIcon, label: 'Follow-up', path: '/followuplead', color: 'red' },
    { icon: PaymentsOutlinedIcon, label: 'Sales', path: '/sales', color: 'red' },
  ];

  const drawerContent = (
    <Box
      sx={{
        color: 'black',
        height:"100%",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      {/* Logo & Menu */}
      <Grid>
        <Grid sx={{ p: 2, mt: 5, textAlign: 'center' }}> {/* Changed mt from 6 to 4 */}
          <img src={Logos} alt="Logo" style={{ maxWidth: '80%', height: 'auto' }} /> {/* Changed from 90% to 80% */}
        </Grid>

        <List sx={{ ml: 1.5 }}> {/* Changed from 2 to 1.5 */}
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    px: 1.5, // Changed from 2 to 1.5
                    py: 1, // Added for less vertical padding
                    '&.Mui-selected': {
                      backgroundColor: "#008000",
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      color: 'green',
                      '& .MuiSvgIcon-root': { color: 'green' }
                    },
                  }}
                >
                  <item.icon sx={{ 
                    marginRight: 1, 
                    color: isSelected ? 'white' : 'inherit',
                    fontSize: '24px' // Changed from 28px to 24px
                  }} />
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant: 'body1' }} // Changed from h6 to body1
                    sx={{ mb: 0 }} // Changed from 1 to 0
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Grid>

      {/* User Info & Logout */}
      <Grid sx={{ p: 1.5 }}> {/* Changed from 2 to 1.5 */}
        <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}> {/* Changed gap and mb from 2 to 1.5 */}
          <Avatar alt={username} src={Logo1} sx={{ width: 40}} /> {/* Changed from 50 to 40 */}
          <Grid>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}> {/* Changed from h6, added fontSize */}
              {username || "Guest"}
            </Typography>
            <Typography variant="body2" sx={{ color: 'black' }}> {/* Added fontSize */}
              {email || "guest@example.com"}
            </Typography>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            bgcolor: "#008000",
            '&:hover': { bgcolor: '#e10712ff' },
             '&:active': {
      bgcolor: '#e10712ff', // Mobile tap
    },
    '&:focus-visible': {
      bgcolor: '#e10712ff',
    },
            width: '100%',
            textTransform: 'none',
            fontWeight: 'bold',
            py: 0.8, // Added for smaller button
            // Added for smaller text
          }}
        >
          Logout
        </Button>
      </Grid>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
  <Box sx={{ display: 'flex', width: '100vw', overflowX: 'hidden' }}>


      <CssBaseline />
      
      {/* Top AppBar with Hamburger Menu */}
      <AppBar
        position="fixed"
        sx={{
          height:64,
          
          width: { 
            xs: '100%',
            lg: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%'
          },
          ml: { 
            lg: desktopOpen ? `${drawerWidth}px` : 0
          },
          bgcolor:"#008000",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        
        <Toolbar>
         
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xs: 'block', lg: 'none' } }}
          >
            <MenuIcon/>
          </IconButton>

          {/* Desktop Toggle Button */}
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDesktopDrawerToggle}
            sx={{ mr: 2, display: { xs: 'none', lg: 'block' }}}

          >
            {desktopOpen ? <ClearIcon/>  : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" noWrap component="div"   >
            Lead Management System
          </Typography>
        
        </Toolbar>
       
      </AppBar>

      <Grid 
        component="nav" 
        sx={{ 
          width: { 
            lg: desktopOpen ? drawerWidth : 0 
          }, 
          flexShrink: { lg: 0 } 
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
          width: drawerWidth,
          height: '100vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
}

          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer - Only shows when desktopOpen is true */}
   <Drawer
  variant="permanent"
  sx={{
    display: { xs: 'none', lg: desktopOpen ? 'block' : 'none' },
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      position: 'fixed',   // 🔥 KEY FIX
      left: 0,
    },
  }}
>
  


          {drawerContent}
        </Drawer>
      </Grid>

      {/* Main Content */}
   <Box
  component="main"
  sx={{
    flexGrow: 1,
    mt: { xs: '56px', sm: '64px' },
    height: {
      xs: 'calc(100dvh - 56px)',
      sm: 'calc(100dvh - 64px)',
    },
    overflow: 'auto',
    px: { xs: 1.5, sm: 2 },

  }}
>
  {children}
</Box>

    </Box>

  );
}

ResponsiveDrawer.propTypes = {
  window: PropTypes.func,
  children: PropTypes.node,
};

export default ResponsiveDrawer;



