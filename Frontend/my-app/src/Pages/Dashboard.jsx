import React, { useState, useEffect } from "react";
import {
  Box,
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
  TablePagination,
  TextField,
  MenuItem,
  CircularProgress,
  Modal,
  Grid,
  Chip,
} from "@mui/material";
import { Download as DownloadIcon, Visibility, Edit, Close } from "@mui/icons-material";
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

const Dashboard = () => {
  const [filter, setFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStage, setSelectedStage] = useState("all");
  const [stageOptions, setStageOptions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const navigate = useNavigate();

  // Fetch stages from JSON
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const response = await axios.get("/dropdownData.json");
        const stageList = response.data.stages || [];
        setStageOptions(["all", ...stageList]);
      } catch (error) {
        console.error("Error fetching stage data:", error);
      }
    };
    fetchStages();
  }, []);

  // Fetch leads from MongoDB
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
      alert('Error loading leads. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setSelectedStage("all");
      setPage(0);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSelectedStage("all");
    setPage(0);
  };

  const handleStageChange = (event) => {
    setSelectedStage(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (lead) => {
    navigate('/addlead', { state: { id: lead._id } });
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedLead(null);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesTab =
      selectedTab === "all" || lead.modeoflearning === selectedTab;
    const matchesStatus =
      filter === "all" ||
      lead.leadStatus?.toLowerCase() === filter.toLowerCase();
    const matchesStage =
      filter.toLowerCase() !== "in progress" ||
      selectedStage === "all" ||
      lead.stage === selectedStage;

    return matchesTab && matchesStatus && matchesStage;
  });

  const paginatedLeads = filteredLeads.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const statusCount = (status) =>
    leads.filter(
      (lead) =>
        (selectedTab === "all" || lead.modeoflearning === selectedTab) &&
        lead.leadStatus?.toLowerCase() === status.toLowerCase()
    ).length;

  const exportToCSV = () => {
    const csvRows = [];
    const headers = [
      "S No",
      "Name",
      "Phone",
      "Preferred Course",
      "Status",
      "Stage",
      "Next Follow-up",
      "Last Updated",
    ];
    csvRows.push(headers.join(","));

    filteredLeads.forEach((lead, index) => {
      const row = [
        index + 1,
        lead.fullName || "-",
        lead.phone || "-",
        lead.preferredcourse || "-",
        lead.leadStatus || "-",
        lead.stage || "-",
        lead.nextFollowUpDate || "-",
        lead.lastupdate || "-",
      ];
      csvRows.push(row.map((val) => `"${val}"`).join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const status = filter !== "all" ? filter : "All-Status";
    const tab = selectedTab !== "all" ? selectedTab : "All-Modes";
    const stage =
      filter.toLowerCase() === "in progress" && selectedStage !== "all"
        ? selectedStage
        : "All-Stages";

    const safeFileName = `leads_${status}_${tab}${
      filter.toLowerCase() === "in progress" ? `_${stage}` : ""
    }.csv`
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_\.]/gi, "");

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: "white" }}>
        <CircularProgress sx={{ color: 'green' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "white", p: { xs: 2, sm: 2, md: 3 } }}>
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
        }}
      >
        Dashboard
      </Typography>

      {/* Tabs - Responsive */}
      <Box sx={{ mb: 2, overflowX: "auto" }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          textColor="inherit"
          TabIndicatorProps={{
            style: { backgroundColor: 'green' }
          }}
          variant="scrollable"
          scrollButtons="auto"
        
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img src="/src/assets/online.png" alt="Online" width={18} height={18} />
                Online
              </Box>
            }
          />
          <Tab
            value="Offline"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img src="/src/assets/offline.png" alt="Offline" width={18} height={18} />
                Offline
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Filters - Responsive */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", lg: "row" },
        gap: 2, 
        mb: 2, 
        alignItems: { xs: "stretch", lg: "center" } 
      }}>
        <Box sx={{ 
          overflowX: "auto",
          display: 'flex',
          bgcolor: '#f5f5f5',
          borderRadius: '10px',
          p: 1,
          width: { xs: "100%", lg: "auto" },
        }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, width: '100%', gap: 1 }}>
            <Box sx={{ overflowX: 'auto', display: 'flex' }}>
              <StyledToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                aria-label="lead filter"
                size="small"
              >
                <ToggleButton value="New">
                  <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
                  <Box component="span">New ({statusCount('New')})</Box>
                </ToggleButton>
                <ToggleButton value="In Progress">
                  <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
                  <Box component="span">Progress ({statusCount('In Progress')})</Box>
                </ToggleButton>
                <ToggleButton value="Deferred">
                  <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
                  <Box component="span">Deferred ({statusCount('Deferred')})</Box>
                </ToggleButton>
                <ToggleButton value="Converted">
                  <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
                  <Box component="span">Converted ({statusCount('Converted')})</Box>
                </ToggleButton>
                <ToggleButton value="Lost">
                  <EmailIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} /> 
                  <Box component="span">Lost ({statusCount('Lost')})</Box>
                </ToggleButton>
              </StyledToggleButtonGroup>
            </Box>

            {filter.toLowerCase() === "in progress" && (
              <TextField
                select
                value={selectedStage}
                onChange={handleStageChange}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    width: { xs: '100%', sm: '180px' },
                    fontSize: { xs: '12px', md: '13px' },
                  },
                }}
                sx={{ 
                  width: { xs: '100%', sm: '180px' },
                }}
              >
                {stageOptions.map((stage) => (
                  <MenuItem
                    key={stage.id || stage}
                    value={stage.name || stage}
                    sx={{ 
                      fontSize: { xs: '12px', md: '13px' },
                      '&:hover': {
                        backgroundColor: '#90EE90',
                        color: 'green',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'green',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#006400',
                        }
                      }
                    }}
                  >
                    {stage === 'all' ? 'All Stages' : stage.name || stage}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </Box>

        <Box sx={{ flexGrow: { lg: 1 } }} />
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
          onClick={exportToCSV}
        >
          Export
        </Button>
      </Box>

      {/* Table - Responsive with horizontal scroll */}
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "green" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>S No</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Name</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Phone Number</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Preferred Course</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Status</TableCell>
                {filter.toLowerCase() === "in progress" && (
                  <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Stage</TableCell>
                )}
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Next Follow-up</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>Last Updated</TableCell>
                <TableCell sx={{ color: "white", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead, index) => (
                  <TableRow 
                    key={lead._id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f0fff0',
                      }
                    }}
                  >
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>{lead.fullName || "-"}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>
                      {lead.phone ? lead.phone.replace(/(\d{5})(\d+)/, "$1 $2") : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '11px', sm: '13px' } }}>{lead.preferredcourse || "-"}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" sx={{ fontSize: { xs: '11px', sm: '13px' } }}>
                        {lead.leadStatus || "-"}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '11px' }, color: 'gray' }}>
                        {lead.note || ""}
                      </Typography>
                    </TableCell>
                    {filter.toLowerCase() === "in progress" && (
                      <TableCell>
                        <Typography fontWeight="bold" color="green" sx={{ fontSize: { xs: '11px', sm: '13px' } }}>
                          {lead.stage || "Not Set"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell sx={{ color: "red", fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold' }}>
                      {lead.nextFollowUpDate || "-"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '11px' } }}>
                        <span style={{ color: "gray" }}>FCD:</span> {lead.firstContactDate || "-"}
                      </Typography>
                      <br />
                      <Typography variant="caption" sx={{ fontSize: { xs: '10px', sm: '11px' } }}>
                        <span style={{ color: "gray" }}>LCD:</span> {lead.lastupdate || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleView(lead)} 
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
                  <TableCell
                    colSpan={filter.toLowerCase() === "in progress" ? 9 : 8}
                    align="center"
                    sx={{ fontSize: { xs: '12px', sm: '14px' }, py: 4 }}
                  >
                    No leads found for selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredLeads.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: { xs: '11px', sm: '13px' }
              }
            }}
          />
        </TableContainer>
      </Box>

      {/* View Lead Modal - Responsive */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          width: { xs: '90%', sm: '80%', md: '600px' },
          maxWidth: '600px',
          maxHeight: { xs: '90vh', sm: '80vh' },
          overflow: 'auto',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
          </Box>

          {selectedLead && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Full Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.fullName || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Phone</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.phone || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Email</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.email || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Gender</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.gender || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Lead Status</Typography>
                <Chip 
                  label={selectedLead.leadStatus || '-'} 
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
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Stage</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.stage || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Preferred Course</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.preferredcourse || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Mode of Learning</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.modeoflearning || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Graduation Year</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.graduationyear || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>College</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.collegename || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>First Contact Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.firstContactDate || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Next Follow-up</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main', fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.nextFollowUpDate || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '10px', md: '12px' } }}>Follow-up Remarks</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '12px', md: '14px' } }}>
                  {selectedLead.followUpRemarks || '-'}
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
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;

// import React, { useState, useEffect } from "react";
// import {
//   Box,
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
//   TablePagination,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   TextField,
// } from "@mui/material";
// import { Download as DownloadIcon } from "@mui/icons-material";
// import EmailIcon from "@mui/icons-material/Email";
// import { styled } from "@mui/material/styles";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase";
// import { useNavigate } from "react-router-dom";
// import { Visibility, Edit } from "@mui/icons-material";
// import axios from "axios";

// const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
//   "& .MuiToggleButton-root": {
//     textTransform: "none",
//     fontWeight: 500,
//     border: "none",
//     padding: "6px 14px",
//     backgroundColor: "white",
//     color: "gray",
//     height: "50px",
//     width: "150px",
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

// const Dashboard = () => {
//   const [filter, setFilter] = useState("all");
//   const [selectedTab, setSelectedTab] = useState("all");
//   const [leads, setLeads] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [selectedStage, setSelectedStage] = useState("all");
//   const navigate = useNavigate();

//   const [stageOptions, setStageOptions] = useState([]);

//   useEffect(() => {
//     const fetchStages = async () => {
//       try {
//         const response = await axios.get("dropdownData.json");
//         const stageList = response.data.stages || [];
//         console.log("stages = ",stageList);

//         setStageOptions(["all", ...stageList]);
//       } catch (error) {
//         console.error("Error fetching stage data:", error);
//       }
//     };
//     fetchStages();
//   }, []);
//   useEffect(() => {
//     const fetchLeads = async () => {
//       try {
//         const colRef = collection(db, "userlead");
//         const snapshot = await getDocs(colRef);
//         const data = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setLeads(data);
//       } catch (error) {
//         console.error("Failed to fetch leads from Firestore:", error);
//       }
//     };
//     fetchLeads();
//   }, []);

//   const handleFilterChange = (event, newFilter) => {
//     if (newFilter !== null) {
//       setFilter(newFilter);
//       setSelectedStage("all"); // Reset stage when filter changes
//       setPage(0);
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setSelectedTab(newValue);
//     setSelectedStage("all"); // Reset stage when tab changes
//     setPage(0);
//   };

// const handleStageChange = (event) => {
//   setSelectedStage(event.target.value); 
//   setPage(0);
// };


//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const filteredLeads = leads.filter((lead) => {
//     const matchesTab =
//       selectedTab === "all" || lead.modeoflearning === selectedTab;
//     const matchesStatus =
//       filter === "all" ||
//       lead.leadStatus?.toLowerCase() === filter.toLowerCase();
//     const matchesStage =
//       filter.toLowerCase() !== "in progress" ||
//       selectedStage === "all" ||
//       lead.stage === selectedStage;

//     return matchesTab && matchesStatus && matchesStage;
//   });

//   const paginatedLeads = filteredLeads.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   const statusCount = (status) =>
//     leads.filter(
//       (lead) =>
//         (selectedTab === "all" || lead.modeoflearning === selectedTab) &&
//         lead.leadStatus?.toLowerCase() === status.toLowerCase()
//     ).length;

//   // const getStageCount = (stage) => {
//   //   return leads.filter(
//   //     (lead) =>
//   //       (selectedTab === 'all' || lead.modeoflearning === selectedTab) &&
//   //       lead.leadStatus?.toLowerCase() === 'in progress' &&
//   //       (stage === 'all' || lead.stage === stage)
//   //   ).length;
//   // };

//   const exportToCSV = () => {
//     const csvRows = [];
//     const headers = [
//       "S No",
//       "Name",
//       "Phone",
//       "Preferred Course",
//       "Status",
//       "Stage",
//       "Next Follow-up",
//       "Last Updated",
//     ];
//     csvRows.push(headers.join(","));

//     filteredLeads.forEach((lead, index) => {
//       const row = [
//         index + 1,
//         lead.fullName || "-",
//         lead.phone || "-",
//         lead.preferredcourse || "-",
//         lead.leadStatus || "-",
//         lead.stage || "-",
//         lead.nextFollowUpDate || "-",
//         lead.lastupdate || "-",
//       ];
//       csvRows.push(row.map((val) => `"${val}"`).join(","));
//     });

//     const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });

//     // 🏷️ Create a dynamic file name:
//     const status = filter !== "all" ? filter : "All-Status";
//     const tab = selectedTab !== "all" ? selectedTab : "All-Modes";
//     const stage =
//       filter.toLowerCase() === "in progress" && selectedStage !== "all"
//         ? selectedStage
//         : "All-Stages";

//     const safeFileName = `leads_${status}_${tab}${
//       filter.toLowerCase() === "in progress" ? `_${stage}` : ""
//     }.csv`
//       .replace(/\s+/g, "-") // Replace spaces with dashes
//       .replace(/[^a-z0-9-_\.]/gi, ""); // Remove any invalid characters

//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = safeFileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <Box
//       sx={{
//         backgroundColor: "#E9CFF3",
//         minHeight: "100vh",
//         p: { xs: 2, md: 4 },
//       }}
//     >
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
//         Dashboard
//       </Typography>

//       <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
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
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <img
//                   src="/src/assets/online.png"
//                   alt="Online"
//                   width={18}
//                   height={18}
//                 />
//                 Online
//               </Box>
//             }
//             sx={{ fontWeight: "bold" }}
//           />
//           <Tab
//             value="Offline"
//             label={
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <img
//                   src="/src/assets/offline.png"
//                   alt="Offline"
//                   width={18}
//                   height={18}
//                 />
//                 Offline
//               </Box>
//             }
//             sx={{ fontWeight: "bold" }}
//           />
//         </Tabs>
//       </Box>

//       <Box
//         sx={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: 2,
//           mb: 2,
//           alignItems: "center",
//         }}
//       >
//         <Box
//   sx={{
//     display: 'flex',
//     alignItems: 'center',
//     bgcolor: 'white',
//     borderRadius: '5px',
//     boxShadow: 1,
//     p: 0,
//   }}
// >
//   <StyledToggleButtonGroup
//     value={filter}
//     exclusive
//     onChange={handleFilterChange}
//     aria-label="lead filter"
//     size="small"
//     sx={{
//       borderTopRightRadius: 0,
//       borderBottomRightRadius: 0,
//       borderRadius: '10px 0 0 10px'
//     }}
//   >
//     <ToggleButton value="New"><EmailIcon fontSize="small" /> New ({statusCount('New')})</ToggleButton>
//     <ToggleButton value="In Progress"><EmailIcon fontSize="small" /> In Progress ({statusCount('In Progress')})</ToggleButton>
//     <ToggleButton value="Deferred"><EmailIcon fontSize="small" /> Deferred ({statusCount('Deferred')})</ToggleButton>
//     <ToggleButton value="Converted"><EmailIcon fontSize="small" /> Converted ({statusCount('Converted')})</ToggleButton>
//     <ToggleButton value="Lost"><EmailIcon fontSize="small" /> Lost ({statusCount('Lost')})</ToggleButton>
    
//   </StyledToggleButtonGroup>
//   {filter.toLowerCase() === "in progress" && (
//     <FormControl size="small" sx={{ minWidth: 200 }}>
//   <TextField
//     select
//     value={selectedStage}
//     onChange={handleStageChange}
//     variant="standard" // Removes background and border
//     InputProps={{
//       disableUnderline: true, // Removes the underline
//       sx: {
//         backgroundColor: 'transparent',
//         width: '200px',
//         fontSize: '14px',
//         paddingY: '4px',
//       },
//     }}
//     sx={{
//       width: '200px',
//     }}
//   >
//     {stageOptions.map((stage) => (
//   <MenuItem
//     key={stage.id || stage} 
//     value={stage.name || stage} 
//     sx={{ fontSize: '14px' }}
//   >
//     {stage === 'all' ? 'All Stages' : stage.name || stage}
//   </MenuItem>
// ))}

//   </TextField>
// </FormControl>

//   )}
// </Box>

 
//         <Box sx={{ flexGrow: 1 }} />
//         <Button
//           variant="contained"
//           startIcon={<DownloadIcon />}
//           sx={{ backgroundColor: "#853A93", color: "white", height: "36px" }}
//           onClick={exportToCSV}
//         >
//           Export
//         </Button>
//       </Box>

//       <Box sx={{ overflowX: "auto" }}>
//         <TableContainer component={Paper}>
//           <Table size="small">
//             <TableHead sx={{ backgroundColor: "#853A93", height: "60px" }}>
//               <TableRow>
//                 <TableCell sx={{ color: "white" }}>S No</TableCell>
//                 <TableCell sx={{ color: "white" }}>Name</TableCell>
//                 <TableCell sx={{ color: "white" }}>Phone Number</TableCell>
//                 <TableCell sx={{ color: "white" }}>Preferred Course</TableCell>
//                 <TableCell sx={{ color: "white" }}>Status</TableCell>
//                 {filter.toLowerCase() === "in progress" && (
//                   <TableCell sx={{ color: "white" }}>Stage</TableCell>
//                 )}
//                 <TableCell sx={{ color: "white" }}>Next Follow-up</TableCell>
//                 <TableCell sx={{ color: "white" }}>Last Updated</TableCell>
//                 <TableCell sx={{ color: "white" }}>Action</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedLeads.length > 0 ? (
//                 paginatedLeads.map((lead, index) => (
//                   <TableRow key={lead.id}>
//                     <TableCell>{page * rowsPerPage + index + 1}</TableCell>
//                     <TableCell>{lead.fullName || "-"}</TableCell>
//                     <TableCell>
//                       {lead.phone
//                         ? lead.phone.replace(/(\d{5})(\d+)/, "$1 $2")
//                         : "-"}
//                     </TableCell>
//                     <TableCell>{lead.preferredcourse || "-"}</TableCell>
//                     <TableCell>
//                       <Typography fontWeight="bold">
//                         {lead.leadStatus || "-"}
//                       </Typography>
//                       <Typography variant="caption">
//                         {lead.note || ""}
//                       </Typography>
//                     </TableCell>
//                     {filter.toLowerCase() === "in progress" && (
//                       <TableCell>
//                         <Typography fontWeight="bold" color="primary">
//                           {lead.stage || "Not Set"}
//                         </Typography>
//                       </TableCell>
//                     )}
//                     <TableCell sx={{ color: "red" }}>
//                       {lead.nextFollowUpDate || "-"}
//                     </TableCell>
//                     <TableCell>
//                       <Typography variant="caption">
//                         <span style={{ color: "gray" }}>FCD:</span>{" "}
//                         {lead.nextFollowUpDate || "-"}
//                       </Typography>
//                       <br />
//                       <Typography variant="caption">
//                         <span style={{ color: "gray" }}>LCD:</span>{" "}
//                         {lead.lastupdate || "-"}
//                       </Typography>
//                     </TableCell>
//                     <TableCell>
//                       <IconButton>
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
//                   <TableCell
//                     colSpan={filter.toLowerCase() === "in progress" ? 9 : 8}
//                     align="center"
//                   >
//                     No leads found for selected filters.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//           <TablePagination
//             component="div"
//             count={filteredLeads.length}
//             page={page}
//             onPageChange={handleChangePage}
//             rowsPerPage={rowsPerPage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             rowsPerPageOptions={[5, 10, 25, 50]}
//           />
//         </TableContainer>
//       </Box>
//     </Box>
//   );
// };

// export default Dashboard;




// import React, { useState, useEffect } from 'react';
// import {
//   Box,
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
// } from '@mui/material';
// import {
//   Download as DownloadIcon,
// } from '@mui/icons-material';
// import EmailIcon from '@mui/icons-material/Email';
// import { styled } from '@mui/material/styles';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase'; // Ensure firebase config is correct
// import { useNavigate } from 'react-router-dom';
// import { Visibility, Edit } from '@mui/icons-material';

// const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
//   '& .MuiToggleButton-root': {
//     textTransform: 'none',
//     fontWeight: 500,
//     border: 'none',
//     padding: '6px 14px',
//     backgroundColor: 'white',
//     color: 'gray',
//     height: '50px',
//     width: '150px',
//     '& svg': {
//       marginRight: '6px',
//     },
//     '&.Mui-selected': {
//       backgroundColor: '#E0C7F3',
//       color: '#000',
//       border: '2px solid white',
//       borderRadius: '10px',
//     },
//     '&.Mui-selected:hover': {
//       backgroundColor: '#D3B2EF',
//     },
//     '&:hover': {
//       backgroundColor: '#F3E4FB',
//       border: '2px solid white',
//       borderRadius: '10px',
//     },
//   },
// }));

// const Follow_Up_Lead = () => {
//   const [filter, setFilter] = useState('all');
//   const [selectedTab, setSelectedTab] = useState('all');
//   const [leads, setLeads] = useState([]);
//   const navigate=useNavigate();
//   useEffect(() => {
//     const fetchLeads = async () => {
//       try {
//         const colRef = collection(db, 'userlead');
//         const snapshot = await getDocs(colRef);
//         const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         data.forEach((item)=>{
//         console.log("Lead Data = ",item.id)
//         })

//         setLeads(data);
//       } catch (error) {
//         console.error('Failed to fetch leads from Firestore:', error);
//       }
//     };

//     fetchLeads();
//   }, []);

//   const handleFilterChange = (event, newFilter) => {
//     if (newFilter !== null) setFilter(newFilter);
//   };

//   const handleTabChange = (event, newValue) => {
//     setSelectedTab(newValue);
//   };

//   const filteredLeads = leads.filter(
//     (lead) =>
//       (selectedTab === 'all' || lead.modeoflearning === selectedTab) &&
//       (filter === 'all' || lead.leadStatus?.toLowerCase() === filter.toLowerCase())
//   );

//   const statusCount = (status) =>
//     leads.filter(
//       (lead) =>
//         (selectedTab === 'all' || lead.modeoflearning === selectedTab) &&
//         lead.leadStatus?.toLowerCase() === status.toLowerCase()
//     ).length;

//   const totalCount =
//     selectedTab === 'all'
//       ? leads.length
//       : leads.filter((lead) => lead.modeoflearning === selectedTab).length;

//   return (
//     <Box sx={{ backgroundColor: '#E9CFF3', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
//       <Typography
//         variant="h4"
//         gutterBottom
//         sx={{
//           color: '#440731',
//           fontWeight: 'bold',
//           fontSize: { xs: '30px', md: '50px' },
//           textAlign: { xs: 'center', md: 'left' },
//           mt:{lg:'33px'}
//         }}
//       >
//         Dashboard
//       </Typography>

//       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
//         <Tabs
//           value={selectedTab}
//           onChange={handleTabChange}
//           textColor="secondary"
//           indicatorColor="secondary"
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab value="all" label="All" sx={{ fontWeight: 'bold' }} />
//           <Tab
//             value="Online"
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <img src="/src/assets/online.png" alt="Online" width={18} height={18} />
//                 Online
//               </Box>
//             }
//             sx={{ fontWeight: 'bold' }}
//           />
//           <Tab
//             value="Offline"
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <img src="/src/assets/offline.png" alt="Offline" width={18} height={18} />
//                 Offline
//               </Box>
//             }
//             sx={{ fontWeight: 'bold' }}
//           />
//         </Tabs>
//       </Box>

//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           alignItems: 'flex-start',
//           flexWrap: 'wrap',
//           gap: 2,
//           mb: 2,
//         }}
//       >
//         <Box sx={{ bgcolor: 'white', borderRadius: '10px' }}>
//           <StyledToggleButtonGroup
//             value={filter}
//             exclusive
//             onChange={handleFilterChange}
//             aria-label="lead filter"
//             size="small"
//           >
//             {/* <ToggleButton value="all">
//               <EmailIcon fontSize="small" /> All ({totalCount})
//             </ToggleButton> */}
//             <ToggleButton value="New">
//               <EmailIcon fontSize="small" /> New ({statusCount('New')})
//             </ToggleButton>
//             <ToggleButton value="In Progress">
//               <EmailIcon fontSize="small" /> In Progress ({statusCount('In Progress')})
//             </ToggleButton>
//             <ToggleButton value="Deferred">
//               <EmailIcon fontSize="small" /> Deferred ({statusCount('Deferred')})
//             </ToggleButton>
//             {/* <ToggleButton value="Converted">
//               <EmailIcon fontSize="small" /> Converted ({statusCount('Converted')})
//             </ToggleButton> */}
//           </StyledToggleButtonGroup>
//         </Box>

//         <Box sx={{ flexGrow: 1 }} />

//         <Button
//           variant="contained"
//           startIcon={<DownloadIcon />}
//           sx={{
//             backgroundColor: '#853A93',
//             color: 'white',
//             height: '36px',
//             alignSelf: { xs: 'stretch', md: 'center' },
//           }}
//         >
//           Export
//         </Button>
//       </Box>

//       <Box sx={{ overflowX: 'auto' }}>
//         <TableContainer component={Paper}>
//           <Table size="small">
//             <TableHead sx={{ backgroundColor: '#853A93', height: '60px' }}>
//               <TableRow>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>S No</TableCell>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Name</TableCell>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Phone Number</TableCell>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Preferred Course</TableCell>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Status</TableCell>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Next Follow-up</TableCell>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Last Updated</TableCell>
//                 <TableCell sx={{ color: 'white' ,textAlign:'left' }}>Action</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredLeads.length > 0 ? (
//                 filteredLeads.map((lead, index) => (
//                   <TableRow key={lead.id}>
//                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{index + 1}</TableCell>
//                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{lead.fullName || '-'}</TableCell>
//                     {/* <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{lead.phone || '-'}</TableCell> */}
//                     <TableCell sx={{ textAlign: 'left', fontWeight: 'bold' }}> {lead.phone ? lead.phone.replace(/(\d{5})(\d+)/, '$1 $2') : '-'}</TableCell>
//                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>{lead.preferredcourse || '-'}</TableCell>
//                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>
//                       <Typography fontWeight="bold" >
//                         {lead.leadStatus || '-'}
//                       </Typography>
//                       <Typography variant="caption">{lead.note || ''}</Typography>
//                     </TableCell>
//                     <TableCell sx={{ color: 'red', fontWeight: 'bold',textAlign:'left' }}>
//                       {lead.nextFollowUpDate || '-'}
//                     </TableCell>
//                     <TableCell sx={{ textAlign:'left', fontWeight: 'bold'}}>
//                       <Typography variant="caption" sx={{fontWeight:'bold'}}>
//                        <span style={{color:'gray',fontWeight:'lighter'}}> FCD : </span>{lead.nextFollowUpDate || '-'}
//                       </Typography>
//                       <br />
//                       <Typography variant="caption"sx={{fontWeight:'bold'}}>
//                         <span style={{color:'gray',fontWeight:'lighter'}}>LCD : </span> {lead.lastupdate || '-'}
//                       </Typography>
//                     </TableCell>
//                     <TableCell>
//                       <IconButton><Visibility fontSize="small" /></IconButton>
//                       <IconButton><Edit fontSize="small" /></IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} align="center">
//                     No leads found for selected filters.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Box>
//     </Box>
//   );
// };

// export default Follow_Up_Lead;


