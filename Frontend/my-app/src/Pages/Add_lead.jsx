import {
  Box,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,

  Paper,
  useMediaQuery,
  Button,
  MenuItem,
  Alert,
  Stack,
 
} from "@mui/material";
import CommonModal from "../Components/CommonModal";
import StepPagination from "../Components/StepPagination";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useLead } from "../Contexts/LeadContext";

import { useNavigate, useLocation } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/LocalPhone";
import axios from 'axios';

const API_URL = "http://localhost:5000/api";

const drawerWidth = 320;
const Add_lead = () => {
    const theme=useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const location=useLocation();
    const navigate=useNavigate();
    const id =location.state?.id;
    const { leadDraft, setLeadDraft } = useLead();
    const [openModal, setOpenModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    // const handleOpen = () => setOpenModal(true);
    //   const handleClose = () => setOpenModal(false);
  
  useEffect(() => {
  if (leadDraft) {
    setFormData((prev) => ({ ...prev, ...leadDraft }));
  }
}, []);
const validateForm = () => {
  if (!formData.fullName.trim() || !formData.phone.trim()) {
    setModalMessage("Please fill all required fields");
    setOpenModal(true);
    return false;
  }

  if (!/^\d{10}$/.test(formData.phone)) {
    setModalMessage("Please enter a valid 10-digit phone number");
    setOpenModal(true);
    return false;
  }

  
  return true;
};

 const handleNext = () => {
   if (!validateForm()) return; 

 
  setLeadDraft((prev) => ({
    ...prev,
    ...formData,
  }));

  
  navigate("/preference");
};


  const[isInputEmpty,setIsInputEmpty]=useState(false);
    const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const calculateNextFollowUpDate = (baseDateString) => {
    const baseDate = new Date(baseDateString);
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + 2);
    if (nextDate.getDay() === 0) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate.toISOString().split("T")[0];
  };

   const [dropdownData, setDropdownData] = useState({
    awarenessChannels: [],
    leadStatuses: [],
    contactChannels: [],
    stages: [],
  });

   const [formData, setFormData] = useState({
    fullName: "",
    gender: "Male",
    phone: "",
    firstContactDate: today,
    nextFollowUpDate: calculateNextFollowUpDate(today),
    awarenessChannel: "",
    leadStatus: "New",
    contactChannel: "",
    stage: "",
    followUpRemarks: "",
  });
    useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await axios.get("/dropdownData.json");
        setDropdownData(response.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

   useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const lead = response.data.lead;
          setFormData({
            fullName: lead.fullName || "",
            gender: lead.gender || "Male",
            phone: lead.phone || "",
            firstContactDate: lead.firstContactDate || today,
            nextFollowUpDate: lead.nextFollowUpDate || calculateNextFollowUpDate(today),
            awarenessChannel: lead.awarenessChannel || "",
            leadStatus: lead.leadStatus || "New",
            contactChannel: lead.contactChannel || "",
            stage: lead.stage || "",
            followUpRemarks: lead.followUpRemarks || "",
          });
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        setErrorMessage("Error loading lead data");
      }
    };
    fetchLead();
  }, [id]);

   useEffect(() => {
    if (isInputEmpty) {
      const timeout = setTimeout(() => setIsInputEmpty(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isInputEmpty]);

 const formatDateToReadable = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };  

const saveLead = async () => {
  try {
    const token = localStorage.getItem("token");
    const today = new Date();

    const payload = {
      ...formData,
      firstContactDate: formatDateToReadable(formData.firstContactDate),
      nextFollowUpDate: formatDateToReadable(formData.nextFollowUpDate),
      lastupdate: today.toLocaleDateString("en-GB"),
    };

    let response;
    if (id) {
      response = await axios.put(`${API_URL}/leads/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      response = await axios.post(`${API_URL}/leads`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return response.data.success ? response.data.lead : null;
  } catch (error) {
    setIsInputEmpty(true);
    setErrorMessage("Error saving lead. Please try again.");
    return null;
  }
};


   const handleSubmit = async (event) => {
    event.preventDefault();
    const savedLead = await saveLead();
    
    if (savedLead) {
      navigate("/preference", {
        state: {
          userId: savedLead._id,
          fullName: savedLead.fullName,
          showSuccessAlert: true
        },
      });
    }
  };
  const handleSubmitClose = async (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const savedLead = await saveLead();
  if (savedLead) navigate("/dashboard");
};


  const handleSubmitNew = async (event) => {
    event.preventDefault();
    const savedLead = await saveLead();
    
    if (savedLead) {
      // Reset form
      const newToday = new Date().toISOString().split("T")[0];
      setFormData({
        fullName: "",
        gender: "Male",
        phone: "",
        firstContactDate: newToday,
        nextFollowUpDate: calculateNextFollowUpDate(newToday),
        awarenessChannel: "",
        leadStatus: "New",
        contactChannel: "",
        stage: "",
        followUpRemarks: "",
      });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "firstContactDate") {
      const updatedNextFollowUp = calculateNextFollowUpDate(value);
      setFormData({
        ...formData,
        [name]: value,
        nextFollowUpDate: updatedNextFollowUp,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  return (
    <Box >
      {/* Page Title */}
      {/* <Modal open={open} onClose={() => setOpenModal(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: "90%", sm: 400 },
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
      textAlign: "center",
    }}
  >
    <Typography variant="h6" color="error" fontWeight="bold">
      Validation Error
    </Typography>

    <Typography sx={{ mt: 2 }} >
      {modalMessage}
    </Typography>

    <Button
      variant="contained"
      sx={{ mt: 3 ,
        bgcolor:"green"
          
      }}
      
      onClick={() => setOpenModal(false)}
    >
      OK
    </Button>
  </Box>
</Modal> */}
       <CommonModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  title="Validation Error"
  message={modalMessage}
  buttonText="OK"
/>
      <Typography 
            gutterBottom
            sx={{
              width: "100%",
              color: "#262c67 ",
              fontWeight: "bold",
              mt:2
,              fontSize: { xs: "30px", sm: "30px", md: "50px" },
              textAlign: { xs: "center", lg: "center" },
              
            }}>
        {id ? "Edit Lead" : "Add Lead"}
      </Typography>
    <Grid sx={{px:{xs:0 ,md:10},py:{xs:1,md:5}}}>
      <Paper elevation={6} sx={{ borderRadius: 3, p:{xs:2,md:10}}}>
        {/* Section Title */}
        <Typography  sx={{
                color: "green",
                textAlign: "center",
                fontWeight: "bold",
               fontSize: { xs: "24px", sm: "30px", md: "40px" },
                mb: 3,
              }}>
           Profile
        </Typography>

        <Grid container size={{xs:12,md:6}} spacing={2}>
          {/* Full Name */}
          <Grid  size={{xs:12 ,md:6}}> 
          <form onSubmit={handleSubmit} autoComplete="off" >
          <Grid size={{xs:12 ,md:12}}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 2,fontSize:{xs:18,md:20}  }}
            >
              Full Name{" "}
              <Typography component="span" sx={{ color: "#EF233C" }}>
                *
              </Typography>
            </Typography>

           <TextField
                    fullWidth
                   size={isMobile?"small":"medium"}
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                    }}
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <PersonIcon style={{  marginRight: 4 }} />
                        Enter Name
                      </span>
                    }
                    sx={{ mb: 2 }}
                  />
          </Grid>

          {/* Gender */}
          <Grid size={{xs:12 ,md:12}}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 1,mt:2,fontSize:{xs:18,md:20} }}
            >
              Gender
            </Typography>

            <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    sx={{ mb: 4 }}
                  >
             
              <FormControlLabel
                value="male"
                control={<Radio />}
                label="Male"
              />
               <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>
            
          </Grid>
          <Grid size={{xs:12 ,md:12}}>
           <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "black", fontWeight: "bold", mb: 2,fontSize:{xs:18,md:20} }}
            >
                    Awareness Channel
                  </Typography>
         <TextField
                    fullWidth
                     size={isMobile?"small":"medium"}
                    label="Awareness Channel"
                    select
                    name="awarenessChannel"
                    value={formData.awarenessChannel}
                    onChange={handleChange}
                  >
                    {dropdownData.awarenessChannels.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
         <Typography variant="h6" sx={{ color: "gray", mb: 4,fontSize:{xs:18,md:20} }}>
                    How they heard about us
                  </Typography>
        </Grid>
        <Grid size={{xs:12 ,md:12}}>
            <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20}  }}
                  >
                    Lead Status
            </Typography>
              {dropdownData.leadStatuses.length > 0 && (
                    <TextField
                      fullWidth
                       size={isMobile?"small":"medium"}
                      label="Lead Status"
                      select
                      name="leadStatus"
                      value={formData.leadStatus || ""}
                      onChange={handleChange}
                      
                    >
                      {dropdownData.leadStatuses.map((item) => (
                        <MenuItem key={item.id} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
        </Grid>
        <Grid size={{xs:12,md:12}}>
             <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "black", fontWeight: "bold",mt:3,fontSize:{xs:18,md:20}  }}
                  >
                    Next Follow-up Date
            </Typography>
                <TextField
                    fullWidth
                     size={isMobile?"small":"medium"}
                    name="nextFollowUpDate"
                    value={formData.nextFollowUpDate}
                    onChange={handleChange}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    
                  />

        </Grid>
        </form>
        </Grid>
          <Grid  size={{xs:12 ,md:6}}> 
        <form onSubmit={handleSubmit}  autoComplete="off"  >
          <Grid size={{xs:12 ,md:12}}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 2,fontSize:{xs:18,md:20}  }}
            >
              Phone Number{" "}
              <Typography component="span" sx={{ color: "#EF233C" }}>
                *
              </Typography>
            </Typography>

           <TextField
                    fullWidth
                    name="phone"
                     size={isMobile?"small":"medium"}
                    value={formData.phone}
                     onChange={(e) => {
                      const input = e.target.value;
                       if (/^\d{0,10}$/.test(input)) {
                         setFormData({ ...formData, phone: input });
                      }
                     }}
                   error={formData.phone.length > 0 && formData.phone.length !== 10}
                    helperText={
                       formData.phone.length > 0 && formData.phone.length !== 10
                        ? "Phone number must be exactly 10 digits"
                         : ""
                     }
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <PhoneIcon style={{ marginRight: 4 }} />
                        Enter Phone Number
                      </span>
                    }
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 10,
                    }}
                    sx={{ mb: 3 }}
                  />
          </Grid>

          {/* Gender */}
          <Grid size={{xs:12 ,md:12}}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 2,fontSize:{xs:18,md:20}  }}
            >
            First Contact Date

            </Typography>
           <TextField
                    fullWidth
                     size={isMobile?"small":"medium"}
                    name="firstContactDate"
                    value={formData.firstContactDate}
                    onChange={handleChange}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 3 }}
                  />
       
            
          </Grid>
          <Grid size={{xs:12 ,md:12}}>
           <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "black", fontWeight: "bold", mb: 1,fontSize:{xs:18,md:20}  }}
            >
                     Contact  Channel
                  </Typography>
           <TextField
                    fullWidth
                    size={isMobile?"small":"medium"}
                    label="Contact Channel"
                    select
                    name="contactChannel"
                    value={formData.contactChannel}
                    onChange={handleChange}
                    sx={{ mb: 0 }}
                  >
                    {dropdownData.contactChannels.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
 <Typography variant="h6" gutterBottom sx={{ color: "gray", mb: 4,fontSize:{xs:18,md:20}  }}>
                    How they contact us
                  </Typography>
        </Grid>
        <Grid size={{xs:12 ,md:12}}>
              <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20}  }}
                  >
                    Stage
                  </Typography>
             <TextField
                    fullWidth
                     size={isMobile?"small":"medium"}
                    label="Stage"
                    select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    disabled={formData.leadStatus !== "In Progress"}
                  >
                    {dropdownData.stages.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
        </Grid>
        <Grid size={{xs:12 ,md:12}}>
               <TextField
                    fullWidth
                    label="Follow-up Remarks"
                    margin="normal"
                    multiline
                    rows={4}
                    name="followUpRemarks"
                     value={formData.followUpRemarks}
                     onChange={handleChange}
                  />

        </Grid>
        </form>
      
         <Box
              sx={{
                width: { xs: "100%", sm: "80%", md: "50%", lg: "auto" },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: {
                  xs: "center",
                  sm: "center",
                  md: "flex-end",
                  lg: "flex-end",
                },
                alignItems: "center",
                gap: 2,
              }}
            >
              {isInputEmpty && (
                
                <Stack sx={{ width: "auto", fontSize: "13px", p: 0 }}>
                  <Alert variant="filled" severity="error">
                    {errorMessage || "Please fill in all required fields."}
                  </Alert>
                </Stack>
              )}
              
              <Button
                variant="outlined"
                type="button"
                onClick={handleSubmitNew}
                sx={{
                  flex: 2,
                  width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
                  minWidth: "160px",
                  color:"#008000",
                  height: 40,
                  borderColor:"#008000",
                  fontSize: "13px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  mt: 1.3,
                  '&:hover': {
              backgroundColor: "#008000",
              color:'white'
            }
                }}
              >
                Save & Add New
              </Button>
              
              <Button
                variant="contained"
                color="error"
                type="button"
                onClick={handleSubmitClose}
                sx={{
                  flex: 2,
                  width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
                  minWidth: "160px",
                  height: 40,
                  bgcolor: '#e10712ff',
                  fontSize: "13px",
                  fontWeight: "bold",
                  mt: 1.3,
                }}
              >
                Save & Close
              </Button>
              
              <Button
                variant="contained"
                type="button"
                // onClick={handleNext}
                onClick={()=>{
                  if(validateForm()){
                    handleNext();
                  }
                }}
                sx={{
                  flex: 2,
                  width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
                  minWidth: "160px",
                  height: 40,
                  bgcolor: "#008000",
                  fontSize: "13px",
                  fontWeight: "bold",
                  mt: 1.3,
                }}
              >
                Continue
              </Button>
            </Box>
        </Grid>
        
        </Grid>
        <StepPagination/>
      </Paper>
      </Grid>
    </Box>
  );
};

export default Add_lead;
