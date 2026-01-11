import { Box, Grid, Typography, TextField, Button, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Chip, useTheme, useMediaQuery } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
const API_URL = "http://localhost:5000/api";


const Search_lead = () => {
  const theme=useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [categoryCourses, setCategoryCourses] = useState([]);
   const [dropdownData, setDropdownData] = useState({
  leadStatuses: [],
  categoryCourses: {}
});

  const [formData, setFormData] = useState({
    name: '',
    leadStatus: '',
    cohort: '',
    phonenumber: '',
    graduationyear: '',
    courseinterested: '',
    modeoflearning: '',
    startdate: '',
    enddate: '',
  });

  useEffect(() => {
    setLeadStatuses(dropdownData.leadStatuses || []);
    const allCourses = Object.values(dropdownData.categoryCourses || {}).flat();
    setCategoryCourses(allCourses);
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const searchLeads = async () => {
    const hasValue = Object.values(formData).some(v => v && v.toString().trim());
    
    if (!hasValue) {
      alert("Please enter at least one field to search.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          params.append(key, value);
        }
      });

      const response = await axios.get(`${API_URL}/leads/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLeads(response.data.leads);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching leads:', error);
      alert('Error searching leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      leadStatus: '',
      cohort: '',
      phonenumber: '',
      graduationyear: '',
      courseinterested: '',
      modeoflearning: '',
      startdate: '',
      enddate: '',
    });
    setShowResults(false);
    setLeads([]);
  };

  const handleEdit = (lead) => {
    navigate('/addlead', { state: { id: lead._id } });
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/leads/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          searchLeads();
          alert('Lead deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Error deleting lead. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'primary';
      case 'In Progress': return 'warning';
      case 'Closed': return 'success';
      default: return 'default';
    }
  };
  return (

    <Box >
          <Typography variant="h4" gutterBottom  sx={{
             
              color: "#262c67 ",
              fontWeight: "bold",
              mt:2,
              textAlign: { xs: "center", lg: "center" },
              fontSize: { xs: "24px", sm: "30px", md: "50px" },
            }}>
            Search Lead
        </Typography>
        <Grid sx={{px:{xs:0 ,md:10},py:{xs:1,md:5}}}>
             <Paper elevation={6} sx={{ borderRadius: 3, p:{xs:2,md:5} }}>
            
                  <Grid container size={{xs:12}} sx={{px:{xs:1,lg:5},py:{xs:1,lg:2}}} spacing={{xs:2,md:2}}>
                    <Grid  size={{xs:12,md:4}} >
                     <form action="">
                        <Grid size={{xs:12 ,md:12}} >
                                <Typography variant="h6" gutterBottom 
                                sx={{ color: 'black', fontWeight: 'bold', fontSize:{xs:18,md:20} }}>
                                    Name</Typography>
                            <TextField fullWidth name="name" value={formData.name} onChange={handleChange}
                            label={<span style={{ display: 'flex', alignItems: 'center' }}><SearchIcon style={{ fontSize: 20, marginRight: 4, }}  />Search by Name</span>}
                              sx={{ mb: 2 }}/>

                            <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>Lead Status</Typography>
                            <TextField fullWidth label="Lead Status" size={isMobile?"small":"medium"} select name="leadStatus" value={formData.leadStatus} onChange={handleChange} sx={{ mb: 2 }} >
                            {leadStatuses.map((status) => (<MenuItem key={status.id} value={status.name}>{status.name}</MenuItem>))}
                            </TextField>

                           
                        </Grid>
                        <Grid  size={{xs:12,md:12}} >
                             <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>Cohort</Typography>
                        <TextField fullWidth label="Cohort"  size={isMobile?"small":"medium"} select name="cohort" value={formData.cohort} onChange={handleChange} >
                            <MenuItem value="New">New</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                            </TextField>
                        </Grid>
                       
                     </form>
                     </Grid>
                     <Grid size={{xs:12,md:4}}>
                        {/* form 2 */}
                     <form action="">
                        <Grid size={{xs:12 ,md:12}} >
                           <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>Phone Number</Typography>
                <TextField fullWidth name="phonenumber"  value={formData.phonenumber} onChange={handleChange}
                  label={<span style={{ display: 'flex', alignItems: 'center' }}><PhoneIcon style={{ fontSize: 20, marginRight: 4 }} />Search by phone</span>}
                   sx={{ mb: 2 }}/>
                </Grid>
                        <Grid size={{xs:12 ,md:12}} >
                            <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>Graduation Year</Typography>
                           <TextField fullWidth label="Graduation Year" select name="graduationyear" value={formData.graduationyear} onChange={handleChange} sx={{ mb: 2 }}>
                             {Array.from({ length: 20 }, (_, i) => { const year = 2030 - i; return <MenuItem key={year} value={year}>{year}</MenuItem>; })}
                            </TextField>
                            </Grid>
                        <Grid size={{xs:12 ,md:12}} > 
                           <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>Start Date</Typography>
                           <TextField fullWidth name="startdate"  value={formData.startdate} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }}   />
                        </Grid>
                     </form>
                     </Grid>
                     <Grid size={{xs:12,md:4}}>
                     <form action="">
                        <Grid size={{xs:12 ,md:12}} >
                 <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>Course Interested</Typography>
                 <TextField fullWidth name="courseinterested"  size={isMobile?"small":"medium"} value={formData.courseinterested} onChange={handleChange} label="Course" select sx={{ mb: 2 }}>
                  {categoryCourses.map((course, index) => (<MenuItem key={index} value={course}>{course}</MenuItem>))}
                </TextField>
                 </Grid>
                        <Grid size={{xs:12 ,md:12}} >
                            <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>Mode of Learning</Typography>
                <TextField fullWidth select name="modeoflearning"  size={isMobile?"small":"medium"} value={formData.modeoflearning} onChange={handleChange} label="Mode" sx={{ mb: 2 }}>
                  <MenuItem value="Offline">Offline</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                </TextField>
                        </Grid>
                        <Grid size={{xs:12 ,md:12}} >
                            
                <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold',fontSize:{xs:18,md:20}  }}>End Date</Typography>
                <TextField fullWidth name="enddate" size={isMobile?"small":"medium"}  value={formData.enddate} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} />
                      </Grid>
                     </form>
                     </Grid>
                     <Grid container sx={{ width: '100%',  justifyContent: { xs: 'center', lg: 'flex-end' } }}>
                        
                        <Button variant="outlined" onClick={searchLeads} disabled={loading}  sx={{ minWidth: '100px', height: 40, fontSize: '13px', mr: 2,mt:2,borderColor:"#008000",color:"#008000" ,     
                        '&:hover': {
                          backgroundColor: "#008000",
                          color:'white'
                        }}}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                        </Button>
            <Button onClick={handleClear}  sx={{ minWidth: '100px', height: 40, fontSize: '13px', fontWeight: 'bold', bgcolor: '#e10712ff',mr: 2, mt:2,color: 'white' }}>
              Clear
            </Button>
          </Grid>
          {showResults && (
          <TableContainer component={Paper} sx={{ width: '100%', boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#853A93' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mode</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Year</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="h6" color="text.secondary" sx={{ py: 4,fontSize:{xs:18,md:20}  }}>
                        No leads found matching your search criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead._id} hover>
                      <TableCell>{lead.fullName}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        <Chip 
                          label={lead.leadStatus} 
                          color={getStatusColor(lead.leadStatus)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{lead.preferredcourse || '-'}</TableCell>
                      <TableCell>{lead.modeoflearning || '-'}</TableCell>
                      <TableCell>{lead.graduationyear || '-'}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(lead)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(lead._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Grid sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" sx={{fontSize:{xs:18,md:20} }}>Total Results: {leads.length}</Typography>
            </Grid>
          </TableContainer>
        )}
                  </Grid>
            
        </Paper>
        </Grid>
    </Box>

  )
}

export default Search_lead