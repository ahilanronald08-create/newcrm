import React, { useState, useEffect } from "react";
import {
 
  Button,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Modal,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
  Chip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility,
  Edit,
  Close,
} from "@mui/icons-material";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import EmailIcon from "@mui/icons-material/Email";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import axios from 'axios';
const API_URL = "http://localhost:5000/api";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    border: 0,
    "&:not(:first-of-type)": {
      borderRadius: "10px",
      marginLeft: "8px",
    },
    "&:first-of-type": {
      borderRadius: "10px",
    },
  },
  "& .MuiToggleButton-root": {
    textTransform: "none",
    fontWeight: 500,
    border: "none",
    padding: "8px 16px",
    backgroundColor: "white",
    color: "gray",
    height: "45px",
    minWidth: { xs: "90px", sm: "110px", md: "140px" },
    fontSize: { xs: "11px", sm: "12px", md: "13px" },
    "& svg": {
      marginRight: "6px",
      fontSize: { xs: "16px", sm: "18px" },
    },
    "&.Mui-selected": {
      backgroundColor: "green",
      color: "white",
      border: "none",
      borderRadius: "10px",
    },
    "&.Mui-selected:hover": {
      backgroundColor: "#006400",
    },
    "&:hover": {
      backgroundColor: "#90EE90",
      borderRadius: "10px",
      color: "green",
    },
  },
}));

const Follow_Up_Lead = () => {
  const [filter, setFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [openCallLogModal, setOpenCallLogModal] = useState(false);
  const [callLogs, setCallLogs] = useState([]);
  const [currentLead, setCurrentLead] = useState(null);
  const [openAddLogModal, setOpenAddLogModal] = useState(false);
  const [newLog, setNewLog] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLeads(response.data.leads);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      alert('Error loading leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchCallLogs = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/calllogs/lead/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCallLogs(response.data.callLogs);
      }
    } catch (error) {
      console.error("Error fetching call logs:", error);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenModal = (lead) => {
    setSelectedLead(lead);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedLead(null);
  };

  const handleOpenCallLogModal = (lead) => {
    setCurrentLead(lead);
    setOpenCallLogModal(true);
    fetchCallLogs(lead._id);
  };

  const handleEdit = (lead) => {
    navigate('/addlead', { state: { id: lead._id } });
  };

  const filteredLeads = leads.filter(
    (lead) =>
      (selectedTab === "all" || lead.modeoflearning === selectedTab) &&
      (filter === "all" || lead.leadStatus?.toLowerCase() === filter.toLowerCase())
  );

  const statusCount = (status) =>
    leads.filter(
      (lead) =>
        (selectedTab === "all" || lead.modeoflearning === selectedTab) &&
        lead.leadStatus?.toLowerCase() === status.toLowerCase()
    ).length;

  const totalCount =
    selectedTab === "all"
      ? leads.length
      : leads.filter((lead) => lead.modeoflearning === selectedTab).length;

  const handleSaveLog = async () => {
    if (!currentLead) return;

    try {
      const token = localStorage.getItem('token');
      
      const logData = {
        leadId: currentLead._id,
        name: currentLead.fullName,
        phone: currentLead.phone,
        event: newLog.event,
        followUpDate: newLog.followUpDate || '',
        remark: newLog.remark || ''
      };

      const response = await axios.post(`${API_URL}/calllogs`, logData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNewLog({});
        setOpenAddLogModal(false);
        fetchCallLogs(currentLead._id);
        fetchLeads();
        alert('Call log saved successfully');
      }
    } catch (error) {
      console.error('Error saving call log:', error);
      alert('Error saving call log');
    }
  };

  if (loading) {
    return (
      <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: "white" }}>
        <CircularProgress sx={{ color: 'green' }} />
      </Grid>
    );
  }

  return (
    <Grid sx={{ backgroundColor: "white"}} >
      {/* Title - Centered */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#262c67 ",
          fontWeight: "bold",
          fontSize: { xs: "24px", sm: "30px", md: "40px" },
          textAlign: "center",
          mb: 2,
          mt:2
        }}
      >
        Follow-up Lead
      </Typography>

      {/* Tabs */}
      <Grid sx={{ mb: 2, }} >
        <Tabs
       
          value={selectedTab}
          onChange={handleTabChange}
          textColor="inherit"
          TabIndicatorProps={{
            style: { backgroundColor: 'green' }
          }}
          variant="scrollable"
          scrollButtons="auto"
          centered
          sx={{
            minHeight: "40px",
            "& .MuiTab-root": {
              minHeight: "40px",
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 16px", md: "10px 20px" },
              color: "gray",
              "&.Mui-selected": {
                color: "green",
                fontWeight: "bold",
              },
              "&:hover": {
                color: "green",
                backgroundColor: "#f0f0f0",
              }
            }
          }}
        >
          <Tab value="all" label="All" />
          <Tab
            value="Online"
            label={
              <Grid sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img src="/src/assets/online.png" alt="Online" width={18} height={18} />
                Online
              </Grid>
            }
          />
          <Tab
            value="Offline"
            label={
              <Grid sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img src="/src/assets/offline.png" alt="Offline" width={18} height={18} />
                Offline
              </Grid>
            }
          />
        </Tabs>
      </Grid>

      {/* Filter + Export */}
      <Grid sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", lg: "row" },
        gap: 2, 
        mb: 2,
        alignItems: { xs: "stretch", lg: "center" } 
      }}>
        <Grid sx={{ 
          overflowX: "auto",
          display: 'flex',
          bgcolor: '#f5f5f5',
          borderRadius: '10px',
          p: 1,
          width: { xs: "100%", lg: "auto" },
        }}>
          <StyledToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="lead filter"
            size="small"
          >
            <ToggleButton value="all">
              <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
              <Grid component="span">All ({totalCount})</Grid>
            </ToggleButton>
            <ToggleButton value="New">
              <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
              <Grid component="span">New ({statusCount("New")})</Grid>
            </ToggleButton>
            <ToggleButton value="In Progress">
              <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
              <Grid component="span">Progress ({statusCount("In Progress")})</Grid>
            </ToggleButton>
            <ToggleButton value="Deferred">
              <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
              <Grid component="span">Deferred ({statusCount("Deferred")})</Grid>
            </ToggleButton>
            <ToggleButton value="Converted">
              <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
              <Grid component="span">Converted ({statusCount("Converted")})</Grid>
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Grid>

        <Grid sx={{ flexGrow: { lg: 1 } }} />
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />} 
          sx={{ 
            borderColor: "#008000",
            color:  "#008000",
            height: "45px",
            fontSize: { xs: '12px', sm: '13px' },
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: '120px' },
            '&:hover': {
              backgroundColor: "#008000",
              color:'white'
            }
          }}
        >
          Export
        </Button>
      </Grid>

      {/* Table */}
      <Grid sx={{ overflowX: "auto", width: "100%" }}>
        <TableContainer component={Paper} sx={{ GridShadow: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "green" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>S No</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Name</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Phone</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Course</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Next Follow-up</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Last Updated</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, index) => (
                  <TableRow 
                    key={lead._id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f0fff0',
                      }
                    }}
                  >
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>{lead.fullName || "-"}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>
                      {lead.phone ? lead.phone.replace(/(\d{5})(\d+)/, "$1 $2") : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>{lead.preferredcourse || "-"}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold' }}>{lead.leadStatus || "-"}</TableCell>
                    <TableCell sx={{ color: "red", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold' }}>{lead.nextFollowUpDate || "-"}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '11px' } }}>
                        <span style={{ color: "gray" }}>FCD: </span>{lead.firstContactDate || "-"}
                      </Typography>
                      <br />
                      <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '11px' } }}>
                        <span style={{ color: "gray" }}>LCD: </span>{lead.lastupdate || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleOpenCallLogModal(lead)}
                        size="small"
                        sx={{
                          '&:hover': {
                            color: 'green',
                            backgroundColor: '#f0fff0',
                          }
                        }}
                      >
                        <PermPhoneMsgIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenModal(lead)}
                        size="small"
                        sx={{
                          '&:hover': {
                            color: 'green',
                            backgroundColor: '#f0fff0',
                          }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleEdit(lead)}
                        size="small"
                        sx={{
                          '&:hover': {
                            color: 'green',
                            backgroundColor: '#f0fff0',
                          }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ fontSize: { xs: '12px', sm: '14px' }, py: 4 }}>
                    No leads found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Call Log Modal */}
      <Modal open={openCallLogModal} onClose={() => setOpenCallLogModal(false)}>
        <Grid sx={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
          bgcolor: "background.paper", 
          GridShadow: 24, 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 2, 
          width: { xs: '90%', sm: '80%', md: '600px' },
          maxWidth: '600px',
          maxHeight: '80vh', 
          overflow: 'auto' 
        }}>
          <Grid sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: '16px', md: '18px' }, color: 'green' }}>
              {currentLead?.fullName} ({currentLead?.phone})
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              sx={{ 
                backgroundColor: "green",
                fontSize: { xs: '11px', md: '13px' },
                '&:hover': {
                  backgroundColor: '#006400',
                }
              }} 
              onClick={() => setOpenAddLogModal(true)}
            >
              Log
            </Button>
          </Grid>

          <TableContainer component={Paper} sx={{ GridShadow: 1 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "green" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '12px' } }}>Date</TableCell>
                  <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '12px' } }}>Event</TableCell>
                  <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '12px' } }}>Follow-up</TableCell>
                  <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '12px' } }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {callLogs.length > 0 ? (
                  callLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell sx={{ fontSize: { xs: '10px', sm: '12px' } }}>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '10px', sm: '12px' } }}>{log.event}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '10px', sm: '12px' } }}>{log.followUpDate || "-"}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '10px', sm: '12px' } }}>{log.remark || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ fontSize: { xs: '11px', sm: '13px' }, py: 2 }}>
                      No call logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              mt: 2, 
              backgroundColor: "green",
              fontSize: { xs: '12px', md: '14px' },
              height: '40px',
              '&:hover': {
                backgroundColor: '#006400',
              }
            }} 
            onClick={() => setOpenCallLogModal(false)}
          >
            Close
          </Button>
        </Grid>
      </Modal>

      {/* Add Log Modal */}
      <Modal open={openAddLogModal} onClose={() => setOpenAddLogModal(false)}>
        <Grid sx={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
          bgcolor: "background.paper", 
          GridShadow: 24, 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 2, 
          width: { xs: '90%', sm: '400px' },
          maxWidth: '400px'
        }}>
          <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: '16px', md: '18px' }, color: 'green' }}>
              {currentLead?.fullName}
            </Typography>
            <IconButton 
              onClick={() => setOpenAddLogModal(false)} 
              size="small"
              sx={{
                '&:hover': {
                  color: 'green',
                  backgroundColor: '#f0fff0',
                }
              }}
            >
              <Close />
            </IconButton>
          </Grid>

          <TextField
            select
            fullWidth
            label="Event"
            value={newLog.event || ""}
            onChange={(e) => setNewLog({ ...newLog, event: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'green',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'green',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'green',
              }
            }}
          >
            <MenuItem value="Visit Scheduled">Visit Scheduled</MenuItem>
            <MenuItem value="Attended & Completed">Attended & Completed</MenuItem>
            <MenuItem value="Attended & Incomplete">Attended & Incomplete</MenuItem>
            <MenuItem value="Not Attended">Not Attended</MenuItem>
          </TextField>

          <TextField
            type="date"
            fullWidth
            label="Next Follow-up"
            InputLabelProps={{ shrink: true }}
            value={newLog.followUpDate || ""}
            onChange={(e) => setNewLog({ ...newLog, followUpDate: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'green',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'green',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'green',
              }
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks"
            value={newLog.remark || ""}
            onChange={(e) => setNewLog({ ...newLog, remark: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'green',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'green',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'green',
              }
            }}
          />

          <Grid sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button 
              onClick={() => setOpenAddLogModal(false)}
              sx={{
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              sx={{ 
                backgroundColor: "green",
                '&:hover': {
                  backgroundColor: '#006400',
                }
              }} 
              onClick={handleSaveLog}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Modal>

      {/* View Details Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Grid sx={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
          bgcolor: "background.paper", 
          GridShadow: 24, 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 2, 
          width: { xs: '90%', sm: '80%', md: '600px' },
          maxWidth: '600px',
          maxHeight: '80vh', 
          overflow: 'auto' 
        }}>
          <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: { xs: '16px', md: '18px' }, color: 'green' }}>
              Lead Details
            </Typography>
            <IconButton 
              onClick={handleCloseModal} 
              size="small"
              sx={{
                '&:hover': {
                  color: 'green',
                  backgroundColor: '#f0fff0',
                }
              }}
            >
              <Close />
            </IconButton>
          </Grid>

          {selectedLead && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Full Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.fullName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Phone</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.phone}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Email</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.email || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Course</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.preferredcourse || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Status</Typography>
                <Chip 
                  label={selectedLead.leadStatus} 
                  sx={{ 
                    backgroundColor: 'green', 
                    color: 'white',
                    fontSize: { xs: '10px', md: '12px' },
                    height: '24px'
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Mode</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.modeoflearning}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Next Follow-up</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main', fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.nextFollowUpDate}
                </Typography>
              </Grid>
            </Grid>
          )}

          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              mt: 2, 
              backgroundColor: "green",
              fontSize: { xs: '12px', md: '14px' },
              height: '40px',
              '&:hover': {
                backgroundColor: '#006400',
              }
            }} 
            onClick={handleCloseModal}
          >
            Close
          </Button>
        </Grid>
      </Modal>
    </Grid>
  );
};

export default Follow_Up_Lead;

// import React, { useState, useEffect } from "react";
// import {
//   Grid,
//   Button,
//   Typography,
//   Tabs,
//   Tab,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   ToggleButton,
//   ToggleButtonGroup,
//   Modal,
//   TextField,
//   MenuItem,
// } from "@mui/material";
// import {
//   Download as DownloadIcon,
//   Visibility,
//   Edit,
// } from "@mui/icons-material";
// import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
// import EmailIcon from "@mui/icons-material/Email";
// import { styled } from "@mui/material/styles";
// import {
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   doc,
//   query,
//   where,
// } from "firebase/firestore";
// import { db } from "../firebase";
// import { useNavigate } from "react-router-dom";

// const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
//   "& .MuiToggleButton-root": {
//     textTransform: "none",
//     fontWeight: 500,
//     border: "none",
//     padding: "6px 14px",
//     backgroundColor: "white",
//     color: "gray",
//     height: "50px",
//     width: "130px",
//     "& svg": {
//       marginRight: "6px",
//     },
//     "&.Mui-selected": {
//       backgroundColor: "#E0C7F3",
//       color: "#000",
//       border: "2px solid white",
//       borderRadius: "10px",
//     },
//     "&.Mui-selected:hover": {
//       backgroundColor: "#D3B2EF",
//     },
//     "&:hover": {
//       backgroundColor: "#F3E4FB",
//       border: "2px solid white",
//       borderRadius: "10px",
//     },
//   },
// }));

// const Follow_Up_Lead = () => {
//   const [filter, setFilter] = useState("all");
//   const [selectedTab, setSelectedTab] = useState("all");
//   const [leads, setLeads] = useState([]);
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [openCallLogModal, setOpenCallLogModal] = useState(false);
//   const [callLogs, setCallLogs] = useState([]);
//   const [currentLead, setCurrentLead] = useState(null);
//   const [openAddLogModal, setOpenAddLogModal] = useState(false);
//   const [newLog, setNewLog] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchLeads = async () => {
//       try {
//         const colRef = collection(db, "userlead");
//         const snapshot = await getDocs(colRef);
//         const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//         setLeads(data);
//       } catch (error) {
//         console.error("Failed to fetch leads:", error);
//       }
//     };

//     fetchLeads();
//   }, []);

//   // Fetch call logs for a specific lead
//   const fetchCallLogs = async (leadId) => {
//     try {
//       const q = query(collection(db, "calllogs"), where("leadId", "==", leadId));
//       const snapshot = await getDocs(q);
//       const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setCallLogs(logs);
//     } catch (error) {
//       console.error("Error fetching call logs:", error);
//     }
//   };

//   const handleFilterChange = (event, newFilter) => {
//     if (newFilter !== null) setFilter(newFilter);
//   };

//   const handleTabChange = (event, newValue) => {
//     setSelectedTab(newValue);
//   };

//   const handleOpenModal = (lead) => {
//     setSelectedLead(lead);
//     setOpenModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setSelectedLead(null);
//   };

//   const handleOpenCallLogModal = (lead) => {
//     setCurrentLead(lead);
//     setOpenCallLogModal(true);
//     fetchCallLogs(lead.id); // load logs for this lead
//   };

//   const filteredLeads = leads.filter(
//     (lead) =>
//       (selectedTab === "all" || lead.modeoflearning === selectedTab) &&
//       (filter === "all" ||
//         lead.leadStatus?.toLowerCase() === filter.toLowerCase())
//   );

//   const statusCount = (status) =>
//     leads.filter(
//       (lead) =>
//         (selectedTab === "all" || lead.modeoflearning === selectedTab) &&
//         lead.leadStatus?.toLowerCase() === status.toLowerCase()
//     ).length;

//   const totalCount =
//     selectedTab === "all"
//       ? leads.length
//       : leads.filter((lead) => lead.modeoflearning === selectedTab).length;

//   return (
//     <Grid sx={{ backgroundColor: "#E9CFF3", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
//       <Typography
//         variant="h4"
//         gutterBottom
//         sx={{
//           color: "#440731",
//           fontWeight: "bold",
//           fontSize: { xs: "30px", md: "50px" },
//           textAlign: { xs: "center", md: "left" },
//           mt: { lg: "33px" },
//         }}
//       >
//         Follow-up Lead
//       </Typography>

//       {/* Tabs */}
//       <Grid sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
//         <Tabs
//           value={selectedTab}
//           onChange={handleTabChange}
//           textColor="secondary"
//           indicatorColor="secondary"
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab value="all" label="All" sx={{ fontWeight: "bold" }} />
//           <Tab
//             value="Online"
//             label={
//               <Grid sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <img src="/src/assets/online.png" alt="Online" width={18} height={18} />
//                 Online
//               </Grid>
//             }
//             sx={{ fontWeight: "bold" }}
//           />
//           <Tab
//             value="Offline"
//             label={
//               <Grid sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <img src="/src/assets/offline.png" alt="Offline" width={18} height={18} />
//                 Offline
//               </Grid>
//             }
//             sx={{ fontWeight: "bold" }}
//           />
//         </Tabs>
//       </Grid>

//       {/* Filter + Export */}
//       <Grid sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
//         <StyledToggleButtonGroup
//           value={filter}
//           exclusive
//           onChange={handleFilterChange}
//           aria-label="lead filter"
//           size="small"
//         >
//           <ToggleButton value="all">
//             <EmailIcon fontSize="small" /> All ({totalCount})
//           </ToggleButton>
//           <ToggleButton value="New">
//             <EmailIcon fontSize="small" /> New ({statusCount("New")})
//           </ToggleButton>
//           <ToggleButton value="In Progress">
//             <EmailIcon fontSize="small" /> In Progress ({statusCount("In Progress")})
//           </ToggleButton>
//           <ToggleButton value="Deferred">
//             <EmailIcon fontSize="small" /> Deferred ({statusCount("Deferred")})
//           </ToggleButton>
//           <ToggleButton value="Converted">
//             <EmailIcon fontSize="small" /> Converted ({statusCount("Converted")})
//           </ToggleButton>
//         </StyledToggleButtonGroup>

//         <Grid sx={{ flexGrow: 1 }} />
//         <Button variant="contained" startIcon={<DownloadIcon />} sx={{ backgroundColor: "#853A93" }}>
//           Export
//         </Button>
//       </Grid>

//       {/* Table */}
//       <Grid sx={{ overflowX: "auto" }}>
//         <TableContainer component={Paper}>
//           <Table size="small">
//             <TableHead sx={{ backgroundColor: "#853A93", height: "60px" }}>
//               <TableRow>
//                 <TableCell sx={{ color: "white" }}>S No</TableCell>
//                 <TableCell sx={{ color: "white" }}>Name</TableCell>
//                 <TableCell sx={{ color: "white" }}>Phone</TableCell>
//                 <TableCell sx={{ color: "white" }}>Course</TableCell>
//                 <TableCell sx={{ color: "white" }}>Status</TableCell>
//                 <TableCell sx={{ color: "white" }}>Next Follow-up</TableCell>
//                 <TableCell sx={{ color: "white" }}>Last Updated</TableCell>
//                 <TableCell sx={{ color: "white" }}>Action</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredLeads.length > 0 ? (
//                 filteredLeads.map((lead, index) => (
//                   <TableRow key={lead.id}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell>{lead.fullName || "-"}</TableCell>
//                     <TableCell>
//                       {lead.phone ? lead.phone.replace(/(\d{5})(\d+)/, "$1 $2") : "-"}
//                     </TableCell>
//                     <TableCell>{lead.preferredcourse || "-"}</TableCell>
//                     <TableCell>{lead.leadStatus || "-"}</TableCell>
//                     <TableCell sx={{ color: "red" }}>{lead.nextFollowUpDate || "-"}</TableCell>
//                     <TableCell>
//                       <Typography variant="caption">
//                         <span style={{ color: "gray" }}>FCD: </span>{lead.nextFollowUpDate || "-"}
//                       </Typography>
//                       <br />
//                       <Typography variant="caption">
//                         <span style={{ color: "gray" }}>LCD: </span>{lead.lastupdate || "-"}
//                       </Typography>
//                     </TableCell>
//                     <TableCell>
//                       <IconButton onClick={() => handleOpenCallLogModal(lead)}>
//                         <PermPhoneMsgIcon fontSize="small" />
//                       </IconButton>
//                       <IconButton onClick={() => handleOpenModal(lead)}>
//                         <Visibility fontSize="small" />
//                       </IconButton>
//                       <IconButton>
//                         <Edit fontSize="small" />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center">
//                     No leads found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Grid>

//       {/* Call Log Modal */}
//       <Modal open={openCallLogModal} onClose={() => setOpenCallLogModal(false)}>
//         <Grid sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", GridShadow: 24, p: 4, borderRadius: 2, minWidth: 500 }}>
//           <Grid sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//             <Typography variant="h6" sx={{ fontWeight: "bold" }}>
//               {currentLead?.fullName} ({currentLead?.phone})
//             </Typography>
//             <Button variant="contained" size="small" sx={{ backgroundColor: "#853A93" }} onClick={() => setOpenAddLogModal(true)}>
//               Log
//             </Button>
//           </Grid>

//           <TableContainer component={Paper}>
//             <Table size="small">
//               <TableHead sx={{ backgroundColor: "#853A93" }}>
//                 <TableRow>
//                   <TableCell sx={{ color: "white" }}>Date</TableCell>
//                   <TableCell sx={{ color: "white" }}>Event</TableCell>
//                   <TableCell sx={{ color: "white" }}>Follow-up</TableCell>
//                   <TableCell sx={{ color: "white" }}>Remarks</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {callLogs.length > 0 ? (
//                   callLogs.map((log) => (
//                     <TableRow key={log.id}>
//                       <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
//                       <TableCell>{log.event}</TableCell>
//                       <TableCell>{log.followUpDate || "-"}</TableCell>
//                       <TableCell>{log.remark || "-"}</TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={4} align="center">
//                       No call logs found
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <Button variant="contained" sx={{ mt: 3, backgroundColor: "#853A93", display: "block", mx: "auto" }} onClick={() => setOpenCallLogModal(false)}>
//             Close
//           </Button>
//         </Grid>
//       </Modal>

//       {/* Add Log Modal */}
//       <Modal open={openAddLogModal} onClose={() => setOpenAddLogModal(false)}>
//         <Grid sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", GridShadow: 24, p: 4, borderRadius: 2, minWidth: 400 }}>
//           <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
//             {currentLead?.fullName} ({currentLead?.phone})
//           </Typography>

//           <TextField
//             select
//             fullWidth
//             label="Event"
//             value={newLog.event || ""}
//             onChange={(e) => setNewLog({ ...newLog, event: e.target.value })}
//             sx={{ mb: 2 }}
//           >
//             <MenuItem value="Visit Scheduled">Visit Scheduled</MenuItem>
//             <MenuItem value="Attended & Completed">Attended & Completed</MenuItem>
//             <MenuItem value="Attended & Incomplete">Attended & Incomplete</MenuItem>
//             <MenuItem value="Not Attended">Not Attended</MenuItem>
//           </TextField>

//           <TextField
//             type="date"
//             fullWidth
//             label="Next Follow-up"
//             InputLabelProps={{ shrink: true }}
//             value={newLog.followUpDate || ""}
//             onChange={(e) => setNewLog({ ...newLog, followUpDate: e.target.value })}
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             fullWidth
//             multiline
//             rows={3}
//             label="Remarks"
//             value={newLog.remark || ""}
//             onChange={(e) => setNewLog({ ...newLog, remark: e.target.value })}
//             sx={{ mb: 2 }}
//           />

//           <Grid sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
//             <Button onClick={() => setOpenAddLogModal(false)}>Cancel</Button>
//             <Button
//               variant="contained"
//               sx={{ backgroundColor: "#853A93" }}
//               onClick={async () => {
//                 if (!currentLead) return;

//                 const logData = {
//                   ...newLog,
//                   leadId: currentLead.id,
//                   name: currentLead.fullName,
//                   phone: currentLead.phone,
//                   createdAt: new Date().toISOString(),
//                 };

//                 await addDoc(collection(db, "calllogs"), logData);

//                 // Update lead info if needed
//                 await updateDoc(doc(db, "userlead", currentLead.id), {
//                   lastupdate: new Date().toISOString(),
//                   nextFollowUpDate: newLog.followUpDate || currentLead.nextFollowUpDate || null,
//                 });

//                 setNewLog({});
//                 setOpenAddLogModal(false);
//                 fetchCallLogs(currentLead.id); // refresh logs
//               }}
//             >
//               Save
//             </Button>
//           </Grid>
//         </Grid>
//       </Modal>
//     </Grid>
//   );
// };

// export default Follow_Up_Lead;



// // import React, { useState, useEffect } from 'react';
// // import {
// //   Grid,
// //   Button,
// //   Typography,
// //   Tabs,
// //   Tab,
// //   Paper,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableContainer,
// //   TableHead,
// //   TableRow,
// //   IconButton,
// //   ToggleButton,
// //   ToggleButtonGroup,
// //     Modal,
// //     TextField,
// //     MenuItem ,

// // } from '@mui/material';
// // import {
// //   Download as DownloadIcon,
// // } from '@mui/icons-material';
// // import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg';
// // import EmailIcon from '@mui/icons-material/Email';
// // import { styled } from '@mui/material/styles';
// // import { collection, getDocs } from 'firebase/firestore';
// // import { db } from '../firebase'; // Ensure firebase config is correct
// // import { useNavigate } from 'react-router-dom';
// // import { Visibility, Edit } from '@mui/icons-material';
// // import { addDoc, Timestamp } from 'firebase/firestore';


// // const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
// //   '& .MuiToggleButton-root': {
// //     textTransform: 'none',
// //     fontWeight: 500,
// //     border: 'none',
// //     padding: '6px 14px',
// //     backgroundColor: 'white',
// //     color: 'gray',
// //     height: '50px',
// //     width: '130px',
// //     '& svg': {
// //       marginRight: '6px',
// //     },
// //     '&.Mui-selected': {
// //       backgroundColor: '#E0C7F3',
// //       color: '#000',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //     '&.Mui-selected:hover': {
// //       backgroundColor: '#D3B2EF',
// //     },
// //     '&:hover': {
// //       backgroundColor: '#F3E4FB',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //   },
// // }));

// // const Follow_Up_Lead = () => {
// //   const [filter, setFilter] = useState('all');
// //   const [selectedTab, setSelectedTab] = useState('all');
// //   const [leads, setLeads] = useState([]);
// //     const [openModal, setOpenModal] = useState(false);
// //   const [selectedLead, setSelectedLead] = useState(null);
// //   const [openCallLogModal, setOpenCallLogModal] = useState(false);
// // const [callLogs, setCallLogs] = useState([]);
// // const [currentLog, setCurrentLog] = useState(null);
// // const [currentLead, setCurrentLead] = useState(null);
// // const [openAddLogModal, setOpenAddLogModal] = useState(false);
// // const [newLog, setNewLog] = useState({});
// //   const navigate=useNavigate();
// //   useEffect(() => {
// //     const fetchLeads = async () => {
// //       try {
// //         const colRef = collection(db, 'userlead');
// //         const snapshot = await getDocs(colRef);
// //         const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //         data.forEach((item)=>{
// //         // console.log("Lead Data = ",item.id)
// //         })

// //         setLeads(data);
// //       } catch (error) {
// //         console.error('Failed to fetch leads from Firestore:', error);
// //       }
// //     };

// //     fetchLeads();
// //   }, []);

// //   const handleFilterChange = (event, newFilter) => {
// //     if (newFilter !== null) setFilter(newFilter);
// //   };

// //   const handleTabChange = (event, newValue) => {
// //     setSelectedTab(newValue);
// //   };
// // const handleOpenModal = (lead) => {
// //     setSelectedLead(lead);
// //     setOpenModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setOpenModal(false);
// //     setSelectedLead(null);
// //   };

// // const handleCallLog = async (lead) => {
// //   try {
// //     // Create new call log document in Firestore
// //     const newLog = {
// //       leadId: lead.id,
// //       name: lead.fullName || '-',
// //       event: 'Follow-up Call',
// //       followUpDate: lead.nextFollowUpDate || '-',
// //       remark: lead.note || '-',
// //       createdAt: new Date().toISOString() // ✅ JavaScript date instead of Firebase Timestamp
// //     };

// //     await addDoc(collection(db, 'calllogs'), newLog);

// //     // Save to local state for showing in modal
// //     setCurrentLog(newLog);
// //     setCallLogs((prev) => [...prev, newLog]);

// //     // Open modal
// //     setOpenCallLogModal(true);
// //   } catch (error) {
// //     console.error('Error creating call log:', error);
// //   }
// // };

// //   const filteredLeads = leads.filter(
// //     (lead) =>
// //       (selectedTab === 'all' || lead.modeoflearning === selectedTab) &&
// //       (filter === 'all' || lead.leadStatus?.toLowerCase() === filter.toLowerCase())
// //   );

// //   const statusCount = (status) =>
// //     leads.filter(
// //       (lead) =>
// //         (selectedTab === 'all' || lead.modeoflearning === selectedTab) &&
// //         lead.leadStatus?.toLowerCase() === status.toLowerCase()
// //     ).length;

// //   const totalCount =
// //     selectedTab === 'all'
// //       ? leads.length
// //       : leads.filter((lead) => lead.modeoflearning === selectedTab).length;

// //   return (
// //     <Grid sx={{ backgroundColor: '#E9CFF3', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
// //       <Typography
// //         variant="h4"
// //         gutterBottom
// //         sx={{
// //           color: '#440731',
// //           fontWeight: 'bold',
// //           fontSize: { xs: '30px', md: '50px' },
// //           textAlign: { xs: 'center', md: 'left' },
// //           mt:{lg:'33px'}
// //         }}
// //       >
// //         Follow-up Lead
// //       </Typography>

// //       <Grid sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
// //         <Tabs
// //           value={selectedTab}
// //           onChange={handleTabChange}
// //           textColor="secondary"
// //           indicatorColor="secondary"
// //           variant="scrollable"
// //           scrollButtons="auto"
// //         >
// //           <Tab value="all" label="All" sx={{ fontWeight: 'bold' }} />
// //           <Tab
// //             value="Online"
// //             label={
// //               <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                 <img src="/src/assets/online.png" alt="Online" width={18} height={18} />
// //                 Online
// //               </Grid>
// //             }
// //             sx={{ fontWeight: 'bold' }}
// //           />
// //           <Tab
// //             value="Offline"
// //             label={
// //               <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                 <img src="/src/assets/offline.png" alt="Offline" width={18} height={18} />
// //                 Offline
// //               </Grid>
// //             }
// //             sx={{ fontWeight: 'bold' }}
// //           />
// //         </Tabs>
// //       </Grid>

// //       <Grid
// //         sx={{
// //           display: 'flex',
// //           flexDirection: { xs: 'column', md: 'row' },
// //           alignItems: 'flex-start',
// //           flexWrap: 'wrap',
// //           gap: 2,
// //           mb: 2,
// //         }}
// //       >
// //         <Grid sx={{ bgcolor: 'white', borderRadius: '10px' }}>
// //           <StyledToggleButtonGroup
// //             value={filter}
// //             exclusive
// //             onChange={handleFilterChange}
// //             aria-label="lead filter"
// //             size="small"
// //           >
// //             <ToggleButton value="all">
// //               <EmailIcon fontSize="small" /> All ({totalCount})
// //             </ToggleButton>
// //             <ToggleButton value="New">
// //               <EmailIcon fontSize="small" /> New ({statusCount('New')})
// //             </ToggleButton>
// //             <ToggleButton value="In Progress">
// //               <EmailIcon fontSize="small" /> In Progress ({statusCount('In Progress')})
// //             </ToggleButton>
// //             <ToggleButton value="Deferred">
// //               <EmailIcon fontSize="small" /> Deferred ({statusCount('Deferred')})
// //             </ToggleButton>
// //             <ToggleButton value="Converted">
// //               <EmailIcon fontSize="small" /> Converted ({statusCount('Converted')})
// //             </ToggleButton>
// //           </StyledToggleButtonGroup>
// //         </Grid>

// //         <Grid sx={{ flexGrow: 1 }} />

// //         <Button
// //           variant="contained"
// //           startIcon={<DownloadIcon />}
// //           sx={{
// //             backgroundColor: '#853A93',
// //             color: 'white',
// //             height: '36px',
// //             alignSelf: { xs: 'stretch', md: 'center' },
// //           }}
// //         >
// //           Export
// //         </Button>
// //       </Grid>

// //       <Grid sx={{ overflowX: 'auto' }}>
// //         <TableContainer component={Paper}>
// //           <Table size="small">
// //             <TableHead sx={{ backgroundColor: '#853A93', height: '60px' }}>
// //               <TableRow>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>S No</TableCell>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Name</TableCell>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Phone Number</TableCell>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Preferred Course</TableCell>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Status</TableCell>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Next Follow-up</TableCell>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Last Updated</TableCell>
// //                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Action</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {filteredLeads.length > 0 ? (
// //                 filteredLeads.map((lead, index) => (
// //                   <TableRow key={lead.id}>
// //                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{index + 1}</TableCell>
// //                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{lead.fullName || '-'}</TableCell>
// //                     {/* <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{lead.phone || '-'}</TableCell> */}
// //                     <TableCell sx={{ textAlign: 'left', fontWeight: 'bold' }}> {lead.phone ? lead.phone.replace(/(\d{5})(\d+)/, '$1 $2') : '-'}</TableCell>
// //                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{lead.preferredcourse || '-'}</TableCell>
// //                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>
// //                       <Typography fontWeight="bold" >
// //                         {lead.leadStatus || '-'}
// //                       </Typography>
// //                       <Typography variant="caption">{lead.note || ''}</Typography>
// //                     </TableCell>
// //                     <TableCell sx={{ color: 'red', fontWeight: 'bold',textAlign:'left' }}>
// //                       {lead.nextFollowUpDate || '-'}
// //                     </TableCell>
// //                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>
// //                       <Typography variant="caption" sx={{fontWeight:'bold'}}>
// //                        <span style={{color:'gray',fontWeight:'lighter'}}> FCD : </span>{lead.nextFollowUpDate || '-'}
// //                       </Typography>
// //                       <br />
// //                       <Typography variant="caption"sx={{fontWeight:'bold'}}>
// //                         <span style={{color:'gray',fontWeight:'lighter'}}>LCD : </span> {lead.lastupdate || '-'}
// //                       </Typography>
// //                     </TableCell>
// //                     <TableCell>
// //                        <IconButton
// //                           onClick={() => {
// //                             setCurrentLead(lead); // lead from your map loop
// //                             setOpenCallLogModal(true);
// //                           }}
// //                         >
// //                           <PermPhoneMsgIcon fontSize="small" />
// //                         </IconButton>

// //                       <IconButton onClick={() => handleOpenModal(lead)}><Visibility fontSize="small" /></IconButton>
// //                       <IconButton><Edit fontSize="small" /></IconButton>

// //                     </TableCell>
// //                   </TableRow>
// //                 ))
// //               ) : (
// //                 <TableRow>
// //                   <TableCell colSpan={8} align="center">
// //                     No leads found for selected filters.
// //                   </TableCell>
// //                 </TableRow>
// //               )}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Grid>
// //        {/* Modal */}
// // <Modal open={openModal} onClose={handleCloseModal}>
// //   <Grid
// //     sx={{
// //       position: 'absolute',
// //       top: '50%',
// //       left: '50%',
// //       transform: 'translate(-50%, -50%)',
// //       bgcolor: 'background.paper',
// //       GridShadow: 24,
// //       p: 4,
// //       borderRadius: 2,
// //       minWidth: 350,
// //       maxHeight: '80vh',
// //       overflowY: 'auto'
// //     }}
// //   >
// //     <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
// //       Lead Details
// //     </Typography>

// //     {selectedLead && (
// //       <Grid sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
// //         <Typography><strong>Name:</strong> {selectedLead.fullName || '-'}</Typography>
// //         <Typography><strong>Phone:</strong> {selectedLead.phone || '-'}</Typography>
// //         <Typography><strong>Preferred Course:</strong> {selectedLead.preferredcourse || '-'}</Typography>
// //         <Typography><strong>Status:</strong> {selectedLead.leadStatus || '-'}</Typography>
// //         <Typography><strong>Note:</strong> {selectedLead.note || '-'}</Typography>
// //         <Typography><strong>Mode of Learning:</strong> {selectedLead.modeoflearning || '-'}</Typography>
// //         <Typography><strong>Next Follow-up Date:</strong> {selectedLead.nextFollowUpDate || '-'}</Typography>
// //         <Typography><strong>Last Updated:</strong> {selectedLead.lastupdate || '-'}</Typography>
// //         <Typography><strong>Email:</strong> {selectedLead.email || '-'}</Typography>
// //         <Typography><strong>Address:</strong> {selectedLead.address || '-'}</Typography>
// //         <Typography><strong>Source:</strong> {selectedLead.source || '-'}</Typography>
// //       </Grid>
// //     )}

// //     <Button
// //       variant="contained"
// //       onClick={handleCloseModal}
// //       sx={{ mt: 3, display: 'block', mx: 'auto', backgroundColor: '#853A93' }}
// //     >
// //       Close
// //     </Button>
// //   </Grid>
// // </Modal>
// // {/* Call Log Modal */}
// // <Modal open={openCallLogModal} onClose={() => setOpenCallLogModal(false)}>
// //   <Grid
// //     sx={{
// //       position: 'absolute',
// //       top: '50%',
// //       left: '50%',
// //       transform: 'translate(-50%, -50%)',
// //       bgcolor: 'background.paper',
// //       GridShadow: 24,
// //       p: 4,
// //       borderRadius: 2,
// //       minWidth: 500
// //     }}
// //   >
// //     {/* Header */}
// //     <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
// //       <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        
// //         {currentLead?.fullName} ({currentLead?.phone})
// //       </Typography>
// //       <Button
// //         variant="contained"
// //         size="small"
// //         sx={{ backgroundColor: '#853A93' }}
// //         onClick={() => setOpenAddLogModal(true)}
// //       >
// //         Log
// //       </Button>
// //     </Grid>

// //     {/* Table */}
// //     <TableContainer component={Paper}>
// //       <Table size="small">
// //         <TableHead sx={{ backgroundColor: '#853A93' }}>
// //           <TableRow>
// //             <TableCell sx={{ color: 'white' }}>Call Date</TableCell>
// //             <TableCell sx={{ color: 'white' }}>Event</TableCell>
// //             <TableCell sx={{ color: 'white' }}>Follow-up Date</TableCell>
// //             <TableCell sx={{ color: 'white' }}>Remark</TableCell>
// //           </TableRow>
// //         </TableHead>
// //         <TableBody>
// //           {callLogs.map((log) => (
// //             <TableRow key={log.id}>
// //               <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
// //               <TableCell>{log.event}</TableCell>
// //               <TableCell>{log.followUpDate || '-'}</TableCell>
// //               <TableCell>{log.remark || '-'}</TableCell>
// //             </TableRow>
// //           ))}
// //         </TableBody>
// //       </Table>
// //     </TableContainer>

// //     <Button
// //       variant="contained"
// //       onClick={() => setOpenCallLogModal(false)}
// //       sx={{ mt: 3, backgroundColor: '#853A93', display: 'block', mx: 'auto' }}
// //     >
// //       Close
// //     </Button>
// //   </Grid>
// // </Modal>

// // {/* Add Log Modal */}
// // <Modal open={openAddLogModal} onClose={() => setOpenAddLogModal(false)}>
// //   <Grid
// //     sx={{
// //       position: 'absolute',
// //       top: '50%',
// //       left: '50%',
// //       transform: 'translate(-50%, -50%)',
// //       bgcolor: 'background.paper',
// //       GridShadow: 24,
// //       p: 4,
// //       borderRadius: 2,
// //       minWidth: 400
// //     }}
// //   >
// //     <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
// //       {currentLead?.fullName} ({currentLead?.phone})
// //     </Typography>

// //     {/* Event */}
// //     <TextField
// //       select
// //       fullWidth
// //       label="Event"
// //       value={newLog.event}
// //       onChange={(e) => setNewLog({ ...newLog, event: e.target.value })}
// //       sx={{ mb: 2 }}
// //     >
// //       <MenuItem value="Visit Scheduled">Visit Scheduled</MenuItem>
// //       <MenuItem value="Attended & Completed">Attended & Completed</MenuItem>
// //       <MenuItem value="Attended & Incomplete">Attended & Incomplete</MenuItem>
// //       <MenuItem value="Not Attended">Not Attended</MenuItem>
// //     </TextField>

// //     {/* Conditional Fields */}
// //     {newLog.event !== 'Visit Scheduled' && (
// //       <>
// //         <TextField
// //           type="date"
// //           fullWidth
// //           label="Next Follow-up Date"
// //           InputLabelProps={{ shrink: true }}
// //           value={newLog.followUpDate || ''}
// //           onChange={(e) => setNewLog({ ...newLog, followUpDate: e.target.value })}
// //           sx={{ mb: 2 }}
// //         />
// //         <TextField
// //           type="date"
// //           fullWidth
// //           label="Scheduled Visit Date"
// //           InputLabelProps={{ shrink: true }}
// //           value={newLog.scheduledVisitDate || ''}
// //           onChange={(e) => setNewLog({ ...newLog, scheduledVisitDate: e.target.value })}
// //           sx={{ mb: 2 }}
// //         />
// //       </>
// //     )}

// //     {/* Remarks */}
// //     <TextField
// //       fullWidth
// //       multiline
// //       rows={3}
// //       label="Remarks"
// //       value={newLog.remark || ''}
// //       onChange={(e) => setNewLog({ ...newLog, remark: e.target.value })}
// //       sx={{ mb: 2 }}
// //     />

// //     {/* Actions */}
// //     <Grid sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
// //       <Button onClick={() => setOpenAddLogModal(false)}>Cancel</Button>
// //       <Button
// //         variant="contained"
// //         sx={{ backgroundColor: '#853A93' }}
// //         onClick={async () => {
// //           // Save log to Firestore
// //           const logData = {
// //             ...newLog,
// //             leadId: currentLead.id,
// //             name: currentLead.name,
// //             phone: currentLead.phone,
// //             createdAt: new Date().toISOString(),
// //           };
// //           await addDoc(collection(db, 'calllogs'), logData);

// //           // If event is "Visit Scheduled" → update stage
// //           if (newLog.event === 'Visit Scheduled') {
// //             await updateDoc(doc(db, 'leads', currentLead.id), { stage: 'visit' });
// //           }

// //           setNewLog({});
// //           setOpenAddLogModal(false);
// //           fetchCallLogs(); // refresh logs
// //         }}
// //       >
// //         Save
// //       </Button>
// //     </Grid>
// //   </Grid>
// // </Modal>

// //     </Grid>
// //   );
// // };

// // export default Follow_Up_Lead;



// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import {
// //   Grid,
// //   Button,
// //   Typography,
// //   Tabs,
// //   Tab,
// //   Paper,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableContainer,
// //   TableHead,
// //   TableRow,
// //   IconButton,
// //   ToggleButton,
// //   ToggleButtonGroup,
// // } from '@mui/material';
// // import {
// //   Visibility,
// //   Edit,
// //   Download as DownloadIcon,
// //   BorderRight,
// // } from '@mui/icons-material';
// // import EmailIcon from '@mui/icons-material/Email';
// // import { styled } from '@mui/material/styles';
// // import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

// // // Styled Toggle Button Group
// // const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
// //   '& .MuiToggleButton-root': {
// //     textTransform: 'none',
// //     fontWeight: 500,
// //     border: 'none',
// //     // borderRadius: '0px',
// //     padding: '6px 14px',
// //     backgroundColor: 'white',
// //     color: 'gray',
// //     p: 2,
// //     height:'50px',
// //     gap:2,
// //     width:'130px',

// //     '& svg': {
// //       marginRight: '6px',
// //     },
// //     '&.Mui-selected': {
// //       backgroundColor: '#E0C7F3',
// //       color: '#000',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //     '&.Mui-selected:hover': {
// //       backgroundColor: '#D3B2EF',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //     '&:hover': {
// //       backgroundColor: '#F3E4FB',
// //       // border: '2px solid white',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //   },
// // }));

// // const Follow_Up_Lead = () => {
// //   const [filter, setFilter] = useState('all');
// //   const [selectedTab, setSelectedTab] = useState('all');
// //   const [leads, setLeads] = useState([]);

// //   useEffect(() => {
// //     axios
// //       .get('/leads.json')
// //       .then((res) => setLeads(res.data))
// //       .catch((err) => console.error('Failed to fetch leads:', err));
// //   }, []);

// //   const handleFilterChange = (event, newFilter) => {
// //     if (newFilter !== null) setFilter(newFilter);
// //   };

// //   const handleTabChange = (event, newValue) => {
// //     setSelectedTab(newValue);
// //   };

// //   const filteredLeads = leads.filter(
// //     (lead) =>
// //       (selectedTab === 'all' || lead.mode === selectedTab) &&
// //       (filter === 'all' || lead.status.toLowerCase() === filter.toLowerCase())
// //   );

// //   const statusCount = (status) =>
// //     leads.filter(
// //       (lead) =>
// //         (selectedTab === 'all' || lead.mode === selectedTab) &&
// //         lead.status.toLowerCase() === status.toLowerCase()
// //     ).length;

// //   const totalCount =
// //     selectedTab === 'all'
// //       ? leads.length
// //       : leads.filter((lead) => lead.mode === selectedTab).length;

// //   return (
// //     <Grid sx={{ backgroundColor:'#E9CFF3', minHeight: '100vh', p:{ xs: 2, md: 4 }}}>
// //       <Typography
// //         variant="h4"
// //         gutterBottom
// //         sx={{
// //           color: '#440731',
// //           fontWeight: 'bold',
// //           fontSize: { xs: '30px', md: '50px' },
// //           textAlign: { xs: 'center', md: 'left' },
// //         }}
// //       >
// //         Follow-up Lead
// //       </Typography>

// //       <Grid sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
// //         <Tabs
// //           value={selectedTab}
// //           onChange={handleTabChange}
// //           textColor="secondary"
// //           indicatorColor="secondary"
// //           variant="scrollable"
// //           scrollButtons="auto"
// //         >
// //           <Tab
// //             value="all"
// //             label={
// //               <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                 All
// //               </Grid>
// //             }
// //             sx={{ fontWeight: 'bold' }}
// //           />
// //           <Tab
// //             value="online"
// //             label={
// //               <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                 <img src="/src/assets/online.png" alt="Online" width={18} height={18} />
// //                 Online
// //               </Grid>
// //             }
// //             sx={{ fontWeight: 'bold' }}
// //           />
// //           <Tab
// //             value="offline"
// //             label={
// //               <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                 <img src="/src/assets/offline.png" alt="Offline" width={18} height={18} />
// //                 Offline
// //               </Grid>
// //             }
// //             sx={{ fontWeight: 'bold' }}
// //           />
// //         </Tabs>
// //       </Grid>

// //       <Grid
// //         sx={{
// //           display: 'flex',
// //           flexDirection: { xs: 'column', md: 'row' },
// //           alignItems: 'flex-start',
// //           flexWrap: 'wrap',
// //           gap: 2,
// //           mb: 2,
// //         }}
// //       >
// //         <Grid sx={{bgcolor:'white',borderRadius:'10px'}}>
// //         <StyledToggleButtonGroup
// //           value={filter}
// //           exclusive
// //           onChange={handleFilterChange}
// //           aria-label="lead filter"
// //           size="small"
// //         >
// //           <ToggleButton value="all" sx={{fontWeight:'bold'}}>
// //             <EmailIcon fontSize="small" /> All ({totalCount})
// //           </ToggleButton>
// //           <ToggleButton value="New">
// //             <EmailIcon fontSize="small" /> New ({statusCount('New')})
// //           </ToggleButton>
// //           <ToggleButton value="In-Progress">
// //             <EmailIcon fontSize="small" /> In Progress ({statusCount('In-Progress')})
// //           </ToggleButton>
// //           <ToggleButton value="Deferred">
// //             <EmailIcon fontSize="small" /> Deferred ({statusCount('Deferred')})
// //           </ToggleButton>
// //           <ToggleButton value="Converted">
// //             <EmailIcon fontSize="small" /> Converted ({statusCount('Converted')})
// //           </ToggleButton>
// //         </StyledToggleButtonGroup>
// //         </Grid>

// //         <Grid sx={{ flexGrow: 1 }} />

// //         <Button
// //           variant="contained"
// //           startIcon={<DownloadIcon />}
// //           sx={{
// //             backgroundColor: '#853A93',
// //             color: 'white',
// //             height: '36px',
// //             alignSelf: { xs: 'stretch', md: 'center' },
// //           }}
// //         >
// //           Export
// //         </Button>
// //       </Grid>

// //       <Grid sx={{ overflowX: 'auto' }}>
// //         <TableContainer component={Paper}>
// //           <Table size="small">
// //             <TableHead sx={{ backgroundColor: '#853A93',height:'60px' }}>
// //               <TableRow>
// //                 <TableCell sx={{ color: 'white', whiteSpace: 'nowrap' }}>S No</TableCell>
// //                 <TableCell sx={{ color: 'white' }}>Name</TableCell>
// //                 <TableCell sx={{ color: 'white' }}>Phone Number</TableCell>
// //                 <TableCell sx={{ color: 'white' }}>Preferred Course</TableCell>
// //                 <TableCell sx={{ color: 'white' }}>Status</TableCell>
// //                 <TableCell sx={{ color: 'white' }}>Next Follow-up</TableCell>
// //                 <TableCell sx={{ color: 'white' }}>Last Updated</TableCell>
// //                 <TableCell sx={{ color: 'white' }}>Action</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {filteredLeads.map((lead, index) => (
// //                 <TableRow key={lead.id}>
// //                   <TableCell>{index + 1}</TableCell>
// //                   <TableCell>{lead.name}</TableCell>
// //                   <TableCell>{lead.phone}</TableCell>
// //                   <TableCell>{lead.course}</TableCell>
// //                   <TableCell>
// //                     <Typography fontWeight="bold" color="#4A148C">
// //                       {lead.status}
// //                     </Typography>
// //                     <Typography variant="caption">{lead.note}</Typography>
// //                   </TableCell>
// //                   <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>
// //                     {lead.nextFollowUp}
// //                   </TableCell>
// //                   <TableCell>
// //                     <Typography variant="caption">
// //                       FCD : {lead.lastUpdated}
// //                     </Typography>
// //                     <br />
// //                     <Typography variant="caption">
// //                       LCD : {lead.lastUpdated}
// //                     </Typography>
// //                   </TableCell>
// //                   <TableCell>
// //                     <IconButton>
// //                       <img
// //                         src="/src/assets/View.png"
// //                         alt="View"
// //                         style={{ width: '16px', height: '16px' }}
// //                       />
// //                     </IconButton>
// //                     <IconButton>
// //                       <img
// //                         src="/src/assets/BiEdit.png"
// //                         alt="Edit"
// //                         width={18}
// //                         height={18}
// //                       />
// //                     </IconButton>
// //                   </TableCell>
// //                 </TableRow>
// //               ))}
// //               {filteredLeads.length === 0 && (
// //                 <TableRow>
// //                   <TableCell colSpan={8} align="center">
// //                     No leads found for selected filters.
// //                   </TableCell>
// //                 </TableRow>
// //               )}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Grid>
// //     </Grid>
// //   );
// // };

// // export default Follow_Up_Lead;




// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import {
// //   Grid,
// //   Button,
// //   Typography,
// //   Tabs,
// //   Tab,
// //   Paper,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableContainer,
// //   TableHead,
// //   TableRow,
// //   IconButton,
// //   ToggleButton,
// //   ToggleButtonGroup,
// // } from '@mui/material';
// // import {
// //   Visibility,
// //   Edit,
// //   Download as DownloadIcon,
// //   BorderRight,
// // } from '@mui/icons-material';
// // import EmailIcon from '@mui/icons-material/Email';
// // import { styled } from '@mui/material/styles';
// // import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

// // // Styled Toggle Button Group
// // const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
// //   '& .MuiToggleButton-root': {
// //     textTransform: 'none',
// //     fontWeight: 500,
// //     border: 'none',
// //     // borderRadius: '0px',
// //     padding: '6px 14px',
// //     backgroundColor: 'white',
// //     color: 'gray',
// //     p: 2,
// //     height:'50px',
// //     gap:2,
// //     width:'130px',

// //     '& svg': {
// //       marginRight: '6px',
// //     },
// //     '&.Mui-selected': {
// //       backgroundColor: '#E0C7F3',
// //       color: '#000',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //     '&.Mui-selected:hover': {
// //       backgroundColor: '#D3B2EF',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //     '&:hover': {
// //       backgroundColor: '#F3E4FB',
// //       // border: '2px solid white',
// //       border: '2px solid white',
// //       borderRadius: '10px',
// //     },
// //   },
// // }));

// // const Follow_Up_Lead = () => {
// //   const [filter, setFilter] = useState('all');
// //   const [selectedTab, setSelectedTab] = useState('all');
// //   const [leads, setLeads] = useState([]);

// //   useEffect(() => {
// //     axios
// //       .get('/leads.json')
// //       .then((res) => {
// //         setLeads(res.data);
// //       })
// //       .catch((err) => {
// //         console.error('Failed to fetch leads:', err);
// //       });
// //   }, []);

// //   const handleFilterChange = (event, newFilter) => {
// //     if (newFilter !== null) {
// //       setFilter(newFilter);
// //     }
// //   };

// //   const handleTabChange = (event, newValue) => {
// //     setSelectedTab(newValue);
// //   };

// //   const filteredLeads = leads.filter(
// //     (lead) =>
// //       (selectedTab === 'all' || lead.mode === selectedTab) &&
// //       (filter === 'all' || lead.status === filter)
// //   );

// //   const statusCount = (status) =>
// //     leads.filter(
// //       (lead) =>
// //         (selectedTab === 'all' || lead.mode === selectedTab) &&
// //         lead.status === status
// //     ).length;

// //   const totalCount =
// //     selectedTab === 'all'
// //       ? leads.length
// //       : leads.filter((lead) => lead.mode === selectedTab).length;

// //   return (
// //     <Grid sx={{ backgroundColor: '#E9CFF3', minHeight: '100vh', p: 3 }}>
// //       <Typography variant="h4"  gutterBottom sx={{color: '#440731',fontWeight:"bold",fontSize:'50px'}}>
// //         Follow-up Lead
// //       </Typography>

// //       <Grid sx={{ display: 'flex', gap: 2, mb: 2 }}>

// //       <Tabs
// //         value={selectedTab}
// //         onChange={handleTabChange}
// //         textColor="secondary"
// //         indicatorColor="secondary"
// //       >
// //         <Tab
// //           value="all"
// //           label={
// //             <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //               All
// //             </Grid>
// //           }
// //           sx={{ fontWeight: 'bold' }}
// //         />
// //         <Tab
// //           value="online"
// //           label={
// //             <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //              <img src="/src/assets/online.png" alt="Offline" width={18} height={18} />
// //               Online
// //             </Grid>
// //           }
// //           sx={{ fontWeight: 'bold' }}
// //         />
// //         <Tab
// //        value="offline"
// //     label={
// //       <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //         <img src="/src/assets/offline.png" alt="Offline" width={18} height={18} />
// //         Offline
// //       </Grid>
// //     }
// //           sx={{ fontWeight: 'bold' }}
// //         />
// //       </Tabs>

// //       </Grid>

// //       <Grid
// //         sx={{
// //           display: 'flex',
// //           alignItems: 'center',
// //           flexWrap: 'wrap',
// //           gap: 2,
// //           mb: 2,
// //           // bgcolor:'white'
// //         }}
// //       >
// //         <Grid sx={{bgcolor:'white',borderRadius:'10px'}}>
// //         <StyledToggleButtonGroup
// //           value={filter}
// //           exclusive
// //           onChange={handleFilterChange}
// //           aria-label="lead filter"
// //           size="small"
// //         >
// //           <ToggleButton value="all" sx={{fontWeight:'bold'}}>
// //             <EmailIcon fontSize="small" /> All ({totalCount})
// //           </ToggleButton>
// //           <ToggleButton value="New">
// //             <EmailIcon fontSize="small" /> New ({statusCount('New')})
// //           </ToggleButton>
// //           <ToggleButton value="In-Progress">
// //             <EmailIcon fontSize="small" /> In Progress ({statusCount('In-Progress')})
// //           </ToggleButton>
// //           <ToggleButton value="Deferred">
// //             <EmailIcon fontSize="small" /> Deferred ({statusCount('Deferred')})
// //           </ToggleButton>
// //           <ToggleButton value="Converted">
// //             <EmailIcon fontSize="small" /> Converted ({statusCount('Converted')})
// //           </ToggleButton>
// //         </StyledToggleButtonGroup>
// //         </Grid>


// //         <Grid flexGrow={1} />
// //         <Button
// //           variant="contained"
// //           startIcon={<DownloadIcon />}
// //           sx={{ backgroundColor: '#853A93', color: 'white', height: '36px' }}
// //         >
// //           Export
// //         </Button>
// //       </Grid>

// //       <TableContainer component={Paper}>
// //         <Table>
// //           <TableHead sx={{ backgroundColor: '#853A93' }}>
// //             <TableRow>
// //               <TableCell sx={{ color: 'white' }}>S No</TableCell>
// //               <TableCell sx={{ color: 'white' }}>Name</TableCell>
// //               <TableCell sx={{ color: 'white' }}>Phone Number</TableCell>
// //               <TableCell sx={{ color: 'white' }}>Preferred Course</TableCell>
// //               <TableCell sx={{ color: 'white' }}>Status</TableCell>
// //               <TableCell sx={{ color: 'white' }}>Next Follow-up</TableCell>
// //               <TableCell sx={{ color: 'white' }}>Last Updated</TableCell>
// //               <TableCell sx={{ color: 'white' }}>Action</TableCell>
// //             </TableRow>
// //           </TableHead>
// //           <TableBody >
// //             {filteredLeads.map((lead, index) => (
// //               <TableRow  key={lead.id}>
// //                 <TableCell>{index + 1}</TableCell>
// //                 <TableCell>{lead.name}</TableCell>
// //                 <TableCell>{lead.phone}</TableCell>
// //                 <TableCell>{lead.course}</TableCell>
// //                 <TableCell>
// //                   <Typography fontWeight="bold" color="#4A148C">
// //                     {lead.status}
// //                   </Typography>
// //                   <Typography variant="caption">{lead.note}</Typography>
// //                 </TableCell>
// //                 <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>
// //                   {lead.nextFollowUp}
// //                 </TableCell>
// //                 <TableCell>
// //                   <Typography variant="caption">
// //                     FCD : {lead.lastUpdated}
// //                   </Typography>
// //                   <br />
// //                   <Typography variant="caption">
// //                     LCD : {lead.lastUpdated}
// //                   </Typography>
// //                 </TableCell>
// //                 <TableCell>
// //                   <IconButton>
// //                     {/* <Visibility /> */}
// //                      <img src="/src/assets/View.png" alt="Offline" style={{ width:"16px", height:"16px"}} />
// //                   </IconButton>
// //                   <IconButton>
// //                     {/* <Edit /> */}
// //                      <img src="/src/assets/BiEdit.png" alt="Offline" width={18} height={18} />
// //                   </IconButton>
// //                 </TableCell>
// //               </TableRow>
// //             ))}
// //             {filteredLeads.length === 0 && (
// //               <TableRow>
// //                 <TableCell colSpan={8} align="center">
// //                   No leads found for selected filters.
// //                 </TableCell>
// //               </TableRow>
// //             )}
// //           </TableBody>
// //         </Table>
// //       </TableContainer>
// //     </Grid>
// //   );
// // };

// // export default Follow_Up_Lead;
