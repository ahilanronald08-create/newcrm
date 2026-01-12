import {
  Box,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Paper,
  Stack,
  Alert,
  Autocomplete,   
  FormControl,
  MenuItem,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import axios from "axios";
import { useLead } from "../Contexts/LeadContext";
import StepPagination from "../Components/StepPagination";
import Payment from "../Components/Payment";
const API_URL = "http://localhost:5000/api";
const drawerWidth = 320;




 const courses=[
    {id:1,name:"Full stack development", fee:60000},
    {id:2,name:"Mern stack development", fee:50000},
    {id:3,name:"Python Backend", fee:40000},
  ]
const AdditionalInfo = () => {

  //courses

 
  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, userId, id } = location.state || {};
  
  const locations = ["Nagercoil", "Other District"];
  const [isInputEmpty, setIsInputEmpty] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [districts, setDistricts] = useState([]);
 const { leadDraft, setLeadDraft } = useLead();
 const [course,setCourse]=useState("")
 const[fee,setfee]=useState();
 const[paymentType,setPaymentType]=useState("full")
 const [months,setMonths]=useState();
 const[advance,setAdvance]=useState();
 const[advanceTwo,setadvanceTwo]=useState()
const [advanceDate, setAdvanceDate] = useState("");
const [advanceTwoDate, setAdvanceTwoDate] = useState("");
const formatAmount = (value) => {
  if (!value) return "";
  return Number(value).toLocaleString("en-IN");
};

const getCurrentDateTime = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
const handleAdvanceChange = (e) => {
  const value = Number(e.target.value || 0);
  setAdvance(value);
}
const isAdvanceTwoEnabled =
  paymentType === "emi" && Number(advance) < 10000;

  const handleCourseChange = (e) => {
    const selected = courses.find(
      (c) => c.name === e.target.value
    );
    setCourse(e.target.value);
    setfee(selected.fee);
  };

// const handleAdvanceChange = (e) => {
//   const value = Number(e.target.value || 0);
//   setAdvance(value);

//   // Only for EMI
//   // if (paymentType === "emi" && fee) {
//   //   if (value < 10000) {
//   //     const balance = 10000 - value;
//   //     setadvanceTwo(balance > 0 ? balance : 0);
//   //   } else {
//   //     setadvanceTwo("");
//   //   }
//   // }
// };

const handleAdvanceTwoChange = (e) => {
  const value = Number(e.target.value);
  setadvanceTwo(value);

  
};

  const handlePaymentChange=(e)=>{
    const value=e.target.value
    setPaymentType(value)
    if(value==="full"){
      setMonths("")
      setAdvance("")
      setadvanceTwo("")
    }
  }


// Update the handleFinalSave function in AdditionalInfo component
// Replace the existing handleFinalSave with this:

// Update the handleFinalSave function in AdditionalInfo component
// Replace the existing handleFinalSave with this:

const handleFinalSave = async () => {
  try {
    // validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      setErrorMessage("Pincode must be 6 digits");
      setIsInputEmpty(true);
      return;
    }

    if (!/^\d{10}$/.test(formData.fatherphonename)) {
      setErrorMessage("Phone number must be 10 digits");
      setIsInputEmpty(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Login expired. Please login again.");
      setIsInputEmpty(true);
      return;
    }

    // Save Lead
    const leadRes = await axios.post(
      "http://localhost:5000/api/leads",
      {
        ...leadDraft,
        ...formData,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const leadId = leadRes.data.lead._id;

    // Prepare advanceTwoDate properly
    let formattedAdvanceTwoDate = null;
    if (advanceTwo > 0 && advanceTwoDate) {
      // The advanceTwoDate is in YYYY-MM-DD format from the date input
      // Convert it to ISO string with time
      formattedAdvanceTwoDate = new Date(advanceTwoDate + "T00:00:00").toISOString();
    }

    // Save Payment with proper date handling
    await axios.post(
      "http://localhost:5000/api/payments",
      {
        leadId,
        course,
        courseFee: fee,
        paymentType,
        months: paymentType === "emi" ? months : null,
        advance: advance || 0,
        advanceTwo: advanceTwo || 0,
        // Capture current date/time when advance is provided
        advanceDate: advance > 0 ? new Date().toISOString() : null,
        // Use the selected date for advance two
        advanceTwoDate: formattedAdvanceTwoDate,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setLeadDraft({});
    navigate("/dashboard");
  } catch (error) {
    console.error(error);
    setErrorMessage(error.response?.data?.message || "Save failed");
    setIsInputEmpty(true);
  }
};



  // Show success alert
  useEffect(() => {
    if (location.state && location.state.showSuccessAlert) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        navigate(window.location.pathname, {
          replace: true,
          state: { ...location.state, showSuccessAlert: undefined },
        });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [location, navigate]);

  // Load districts
  useEffect(() => {
    axios
      .get("../dropdownData.json")
      .then((response) => {
        setDistricts(response.data.districts);
      })
      .catch((error) => {
        console.error("Error loading districts:", error);
      });
  }, []);

  // Fetch existing lead data
  useEffect(() => {
    const fetchLead = async () => {
      if (!userId) return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/leads/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const lead = response.data.lead;
          setFormData({
            email: lead.email || "",
            location: lead.location || "",
            fathername: lead.fathername || "",
            dob: lead.dob || "",
            district: lead.district || "",
            pincode: lead.pincode || "",
            fatherphonename: lead.fatherphonename || "",
            fatheroccupation: lead.fatheroccupation || "",
          });
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
      }
    };
    fetchLead();
  }, [userId]);

  useEffect(() => {
    if (isInputEmpty) {
      const timeout = setTimeout(() => setIsInputEmpty(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isInputEmpty]);

  const [formData, setFormData] = useState({
    email: "",
    location: "",
    fathername: "",
    dob: "",
    district: "",
    pincode: "",
    fatherphonename: "",
    fatheroccupation: "",
   
    });

  const updateLead = async (navigateTo) => {
    // Validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      setErrorMessage("Pincode must be exactly 6 digits");
      setIsInputEmpty(true);
      return false;
    }

    if (!/^\d{10}$/.test(formData.fatherphonename)) {
      setErrorMessage("Phone number must be exactly 10 digits");
      setIsInputEmpty(true);
      return false;
    }

    if (!userId) {
      setErrorMessage("User ID not found. Please start from Add Lead page.");
      setIsInputEmpty(true);
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/leads/${userId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setShowAlert(true);
        setIsInputEmpty(false);
        setErrorMessage("");
        
        setTimeout(() => {
          if (navigateTo === "dashboard") {
            navigate("/dashboard");
          } else if (navigateTo === "addlead") {
            navigate("/addlead");
          }
        }, 500);
        
        return true;
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      setErrorMessage(error.response?.data?.message || "Error updating lead");
      setIsInputEmpty(true);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await updateLead("dashboard");
    
  };

  const handleSubmitNew = async (event) => {
    event.preventDefault();
    const success = await updateLead("addlead");
    
    if (success) {
      // Reset form
      setFormData({
        email: "",
        location: "",
        fathername: "",
        dob: "",
        district: "",
        pincode: "",
        fatherphonename: "",
        fatheroccupation: "",
        course: "",
        fee: "",
        paymentType: "full",
        months: "",
        advance: "",
        advanceDate: "",
        advanceTwo: "",
        advanceTwoDate: "",
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "location") {
      setFormData((prev) => ({
        ...prev,
        location: value,
        district: value === "Other District" ? prev.district : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDistrictChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      district: value ? value.name : "",
    }));
  };

  return (
   <Box >
         <Grid sx={{px:{xs:0 ,md:10},py:{xs:1,md:5}}}>
                  <Paper elevation={6} sx={{ borderRadius: 3, p:{xs:2,md:10}}}>
      
         <Grid sx={{textAlign:"center"}}>
                   <Typography
                     variant="overline"
                     gutterBottom
                     sx={{
                       width: "100%",
                       color: "#262c67 ",
                       fontWeight: "bold",
                      fontSize: { xs: "24px", sm: "30px", md: "40px" },
                      
                       
                     }}
                   >
                     {fullName}
                   </Typography>
                   </Grid>
          
          <Box
            sx={{
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: "green",
                  textAlign: "center",
                  fontWeight: "bold",
                  mb:4,
                 fontSize: { xs: "24px", sm: "30px", md: "40px" },
                          }}
                        >
               Additional Info
            </Typography>
            
            <form autoComplete="off">
              <Grid container spacing={{ xs: 2, md: 12 }} justifyContent="center">
                <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <MailOutlinedIcon style={{ fontSize: 20, marginRight: 4 }} />
                        Enter Email
                      </span>
                    }
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold", mt: 3,fontSize:{xs:18,md:20} }}>
                    Location
                  </Typography>
                  <RadioGroup
                    row
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    sx={{ mb: 6 }}
                  >
                    {locations.map((location, index) => (
                      <FormControlLabel
                        key={index}
                        value={location}
                        control={<Radio />}
                        label={location}
                      />
                    ))}
                  </RadioGroup>
                  
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                    PinCode
                  </Typography>
                  <TextField
                    fullWidth
                    name="pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d{0,6}$/.test(input)) {
                        setFormData({ ...formData, pincode: input });
                      }
                    }}
                    error={formData.pincode.length > 0 && formData.pincode.length !== 6}
                    helperText={
                      formData.pincode.length > 0 && formData.pincode.length !== 6
                        ? "Pincode must be exactly 6 digits"
                        : ""
                    }
                    label="Enter Pincode"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 6,
                    }}
                    sx={{ mb: 4 }}
                  />
                  
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                    Father's / Guardian Phone Number
                  </Typography>
                  <TextField
                    fullWidth
                    name="fatherphonename"
                    value={formData.fatherphonename}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d{0,10}$/.test(input)) {
                        setFormData({ ...formData, fatherphonename: input });
                      }
                    }}
                    error={
                      formData.fatherphonename.length > 0 &&
                      formData.fatherphonename.length !== 10
                    }
                    helperText={
                      formData.fatherphonename.length > 0 &&
                      formData.fatherphonename.length !== 10
                        ? "Phone number must be exactly 10 digits"
                        : ""
                    }
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <PhoneIcon style={{ fontSize: 20, marginRight: 4 }} />
                        Enter Father's / Guardian Phone Number
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

                <Grid size={{ xs: 12, md: 6, lg: 5.5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20}}}>
                    DOB
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.dob}
                    onChange={handleChange}
                    type="date"
                    name="dob"
                    sx={{ mb: 4 }}
                  />
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        color: formData.location === "Other District" ? "text.primary" : "text.disabled",
                        fontSize:{xs:18,md:20}
                      }}
                    >
                      Select District
                    </Typography>
                    <Autocomplete
                    options={districts}
                  getOptionLabel={(option) => option.name}
                  value={districts.find((d) => d.name === formData.district) || null}
                  onChange={handleDistrictChange}
                  disabled={formData.location !== "Other District"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select District"
                      variant="outlined"
                      fullWidth
                      disabled={formData.location !== "Other District"}
                    />
                  )}
                />
              </FormControl>
              
              <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                Father's Name / Guardian Name
              </Typography>
              <TextField
                fullWidth
                name="fathername"
                value={formData.fathername}
                onChange={handleChange}
                label="Enter Father's Name / Guardian Name"
                sx={{ mb: 4.2 }}
              />
              
              <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold", }}>
                Father's Occupation
              </Typography>
              <TextField
                fullWidth
                name="fatheroccupation"
                value={formData.fatheroccupation}
                onChange={handleChange}
                label="Enter Father's Occupation"
                sx={{ mb: 5 }}
              />
            </Grid>
          </Grid>
        </form>
         
      </Box>
      {/* Payment details */}
        <Box
            sx={{
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: "green",
                  textAlign: "center",
                  fontWeight: "bold",
                  mb:4,
                 fontSize: { xs: "24px", sm: "30px", md: "40px" },
                          }}
                        >
              Payment Details
            </Typography>
            
            <form autoComplete="off">
              <Grid container spacing={{ xs: 2, md: 12 }} justifyContent="center">
                <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                   Course
                  </Typography>
                 <TextField
                  fullWidth
                  select
                  label="Course"
                  value={course}
                  onChange={handleCourseChange}
                   sx={{ mb: 3 }}
                 >
                   {courses.map((item)=>(
                    <MenuItem key={item.id} value={item.name}>
                      {item.name}
                    </MenuItem>
                   ))}
                 </TextField>

                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold", mt: 3,fontSize:{xs:18,md:20} }}>
                   Payment Type
                  </Typography>
                  <RadioGroup
                    row
                    value={paymentType}
                    onChange={handlePaymentChange}
                     sx={{ mb: 3 }}
                  >
                  <FormControlLabel
                      value="full"
                      control={<Radio />}
                      label="Full Payment"
                   />
                    <FormControlLabel
                        value="emi"
                        control={<Radio />}
                        label="Monthly "
                    />
                   </RadioGroup>
                  
                   <Typography fontWeight="bold" mb={1} sx={{fontSize:{xs:18,md:20}}}>
                                Advance Amount
                              </Typography>
                              <TextField
                                  fullWidth
                                  label="Advance Amount (₹)"
                                  value={formatAmount(advance)}
                                  disabled={paymentType !== "emi"}
                                  onChange={handleAdvanceChange}
                                  sx={{ mb: 3 }}
                              />
                            {/* <TextField
                              fullWidth
                              type="datetime-local"
                             
                              value={advanceDate}
                              disabled
                              sx={{ mb: 3 }}
                            /> */}

                  
                  {/* <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                    Father's / Guardian Phone Number
                  </Typography>
                  <TextField
                    fullWidth
                    name="fatherphonename"
                    value={formData.fatherphonename}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (/^\d{0,10}$/.test(input)) {
                        setFormData({ ...formData, fatherphonename: input });
                      }
                    }}
                    error={
                      formData.fatherphonename.length > 0 &&
                      formData.fatherphonename.length !== 10
                    }
                    helperText={
                      formData.fatherphonename.length > 0 &&
                      formData.fatherphonename.length !== 10
                        ? "Phone number must be exactly 10 digits"
                        : ""
                    }
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <PhoneIcon style={{ fontSize: 20, marginRight: 4 }} />
                        Enter Father's / Guardian Phone Number
                      </span>
                    }
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 10,
                    }}
                    sx={{ mb: 3 }}
                  /> */}
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 5.5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20}}}>
                   course fee
                  </Typography>
                  <TextField
                    fullWidth
                    value={formatAmount(fee)}
                    label={fee?"":"course fee"}
                     sx={{ mb: 3 }}
                  />
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 3,fontSize:{xs:18,md:20} }}>
                    <Typography fontWeight="bold" mb={1}>
                                 Months
                                </Typography>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Number of Months"
                                  value={months}
                                  disabled={paymentType !== "emi"}
                                  onChange={(e) => setMonths(e.target.value)}
                                />
                  
              </FormControl>
              
              <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                Advance Amount 2
              </Typography>
                <TextField
                  fullWidth
                  value={advanceTwo}
                  disabled={!isAdvanceTwoEnabled}
                  onChange={(e)=>setadvanceTwo(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <TextField
                    fullWidth
                    type="date"
                    value={advanceTwoDate}
                    onChange={(e) => setAdvanceTwoDate(e.target.value)}
                    disabled={!isAdvanceTwoEnabled}
                    sx={{ mb: 3 }}
                />
                  {/* <TextField
                    fullWidth
                    value={formData.dob}
                    onChange={handleChange}
                    type="date"
                    disabled={!isAdvanceTwoEnabled}
                    name="dob"
                    sx={{ mb: 4 }}
                  /> */}

              
              {/* <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold", }}>
                Father's Occupation
              </Typography>
              <TextField
                fullWidth
                name="fatheroccupation"
                value={formData.fatheroccupation}
                onChange={handleChange}
                label="Enter Father's Occupation"
                sx={{ mb: 5 }}
              /> */}
            </Grid>
          </Grid>
        </form>
         
      </Box>
      <Grid
        sx={{
          width: "95%",
          display: "flex",
          justifyContent: {
            xs: "center",
            sm: "center",
            md: "center",
            lg: "flex-end",
          },
          alignItems: "center",
          my: 2,
          mb: 3,
        }}
      >
        <Grid
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
            <Stack sx={{ width: "auto", fontSize: "13px", p: 0, mt: 1 }}>
              <Alert variant="filled" severity="error">
                {errorMessage || "Please fill in all required fields."}
              </Alert>
            </Stack>
          )}
          {showAlert && (
            <Stack sx={{ width: "auto", fontSize: "13px", p: 0, mt: 1 }}>
              <Alert variant="filled" severity="success">
                Successfully Filled
              </Alert>
            </Stack>
          )}
          
          <Button
            variant="contained"
            color="error"
            type="button"
            onClick={handleSubmitNew}
            sx={{
              flex: 1,
              width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
              minWidth: "160px",
              height: 40,
              bgcolor: "#D32F2F",
              fontSize: "13px",
              textDecoration: "none",
              mt: 2,
            }}
          >
            Save & Add New
          </Button>
          
          <Button
            variant="contained"
            type="button"
            onClick={handleFinalSave}
            sx={{
              flex: 1,
              width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
              minWidth: "160px",
              height: 40,
              bgcolor: "green",
              fontSize: "13px",
              mt: 2,
            }}
          >
            Save
          </Button>
        </Grid>
        
      </Grid>
     <StepPagination/>
  </Paper>
</Grid>
</Box>

);
};
export default AdditionalInfo;

// import {
//   Box,
//   Grid,
//   Typography,
//   TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Button,
//   // MenuItem,
//   Stack,
//   Alert,
//   Autocomplete,
//   FormControl,
//   // InputLabel,
//   // Select,
// } from "@mui/material";
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
// import PhoneIcon from "@mui/icons-material/Phone";
// import { useLocation } from "react-router-dom";

// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../firebase";
// import axios from "axios";
// const drawerWidth = 320;

// const AdditionalInfo = () => {
//   const navigate = useNavigate();
//   const locations = ["Nagercoil", "Other District"];
//   const [isInputEmpty, setIsInputEmpty] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const location = useLocation();
//   const [districts, setDistricts] = useState([]);
//   const [radioDisabled, setRadioDisabled] = useState(false);
//   const { fullName, userId, id } = location.state || {};
//   useEffect(() => {
//     if (location.state && location.state.showSuccessAlert) {
//       setShowAlert(true);
//       const timeout = setTimeout(() => {
//         setShowAlert(false);
//         navigate(window.location.pathname, {
//           replace: true,
//           state: { ...location.state, showSuccessAlert: undefined },
//         });
//       }, 2000);
//       return () => clearTimeout(timeout);
//     }
//   }, [location, navigate]);
//   useEffect(() => {
//     axios
//       .get("../dropdownData.json")
//       .then((response) => {
//         setDistricts(response.data.districts);
//       })
//       .catch((error) => {
//         console.error("Error loading districts:", error);
//       });
//   }, []);
//   useEffect(() => {
//     if (isInputEmpty) {
//       const timeout = setTimeout(() => setIsInputEmpty(false), 2000);
//       return () => clearTimeout(timeout);
//     }
//   }, [isInputEmpty]);
//   useEffect(() => {
//     if (isInputEmpty) {
//       const timeout = setTimeout(() => setIsInputEmpty(false), 2000);
//       return () => clearTimeout(timeout);
//     }
//   }, [isInputEmpty]);

//   const [formData, setFormData] = useState({
//     email: "",
//     location: "",
//     fathername: "",
//     dob: "",
//     otherdistrict: "",
//     pincode: "",
//     fatherphonename: "",
//     fatheroccupation: "",
//   });

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (
//       !/^\d{6}$/.test(formData.pincode) ||
//       !/^\d{10}$/.test(formData.fatherphonename)
//     ) {
//       setIsInputEmpty(true);
//       return;
//     }

//     if (!userId) {
//       console.error("userId is undefined.");
//       alert(
//         "Error: user ID not found. Please go back and re-enter lead details."
//       );
//       return;
//     }

//     try {
//       await setDoc(
//         doc(db, "userlead", userId),
//         { ...formData },
//         { merge: true }
//       );

//       setFormData({
//         email: "",
//         location: "",
//         fathername: "",
//         dob: "",
//         otherdistrict: "",
//         pincode: "",
//         fatherphonename: "",
//         fatheroccupation: "",
//       });

//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Error saving additional info:", err);
//       alert("Error: " + err.message);
//     }
//   };
//   const handleSubmitNew = async (event) => {
//     event.preventDefault();

//     const values = Object.values(formData);
//     if (
//       values.includes("") ||
//       !/^\d{10}$/.test(formData.fatherphonename) ||
//       !/^\d{6}$/.test(formData.pincode)
//     ) {
//       setIsInputEmpty(true);
//       return;
//     } else {
//       setShowAlert(true);
//     }

//     if (!userId) {
//       console.error("userId is undefined.");
//       alert(
//         "Error: user ID not found. Please go back and re-enter lead details."
//       );
//       return;
//     }

//     try {
//       await setDoc(
//         doc(db, "userlead", userId),
//         { ...formData },
//         { merge: true }
//       );

//       console.log("Additional info saved:", formData);

//       setFormData({
//         email: "",
//         location: "",
//         fathername: "",
//         dob: "",
//         otherdistrict: "",
//         pincode: "",
//         fatherphonename: "",
//         fatheroccupation: "",
//       });

//       navigate("/addlead");
//     } catch (err) {
//       console.error("Error saving additional info:", err);
//       alert("Error: " + err.message);
//     }
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     if (name === "location") {
//       setFormData((prev) => ({
//         ...prev,
//         location: value,
//         // If Other District, keep values. Otherwise clear them.
//         district: value === "Other District" ? prev.district : "",
//         name: value === "Other District" ? prev.name : "",
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };
//   const handleDistrictChange = (event, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       district: value ? value.name : "",
//     }));
//   };
//   const handleNameChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       name: e.target.value,
//     }));
//   };

//   return (
//     <Box sx={{ display: "flex", minHeight: "100dvh" }}>
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 3,
//           backgroundColor: "#DEC9E9",
//           height: "auto",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "flex-start",
//           alignItems: "flex-start",
//           width: { drawerWidth },
//         }}
//       >
//         <Box sx={{ width: "100%" }}>
//           {/* <Typography variant="overline" gutterBottom sx={{ width: '100%', color: '#440731',fontSize:'40px', fontWeight: 'bold', textAlign: { xs: 'center', lg: 'left' }, mt: { xs: '0px', md: '0px', lg: '0px' },mb:20 }}>
//                         {fullName}
//                     </Typography> */}
//         </Box>

//         <Box
//           sx={{
//             backgroundColor: "#fff",
//             borderRadius: 2,
//             boxShadow: 3,
//             width: "100%",
//             height: "auto",
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "space-around",
//             alignItems: "center",
//           }}
//         >
//           <Typography
//             variant="overline"
//             // gutterBottom
//             sx={{
//               width: "100%",
//               paddingLeft: "40px",
//               color: "#440731",
//               fontSize: "40px",
//               fontWeight: "bold",
//               textAlign: { xs: "center", lg: "left" },
//               // ml: 10,
//             }}
//           >
//             {fullName}
//           </Typography>
//           <Box
//             sx={{
//               width: "95%",
//               height: "auto",
//               border: "1px solid #853A93",
//               borderRadius: "10px",
//               mt: "50px",
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//             }}
//           >
//             <Typography
//               variant="h3"
//               gutterBottom
//               sx={{
//                 color: "#440731",
//                 textAlign: "center",
//                 fontWeight: "bold",
//                 mb: 8,
//                 mt: 8,
//               }}
//             >
//               4. Additional Info
//             </Typography>
//             <form action="" autoComplete="off">
//               <Grid
//                 container
//                 spacing={{ xs: 2, md: 12 }}
//                 justifyContent="center"
//               >
//                 <Grid
//                   size={{ xs: 10, md: 5, lg: 5 }}
//                   sx={{ display: "flex", flexDirection: "column" }}
//                 >
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold" }}
//                   >
//                     Email
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     label={
//                       <span style={{ display: "flex", alignItems: "center" }}>
//                         <MailOutlinedIcon
//                           style={{ fontSize: 20, marginRight: 4 }}
//                         />
//                         Enter Email
//                       </span>
//                     }
//                     sx={{ mb: 2 }}
//                   />

//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold", mt: 3 }}
//                   >
//                     Location
//                   </Typography>
//                   <RadioGroup
//                     row
//                     name="location"
//                     value={formData.location}
//                     onChange={handleChange}
//                     sx={{ mb: 6 }}
//                   >
//                     {locations.map((location, index) => (
//                       <FormControlLabel
//                         key={index}
//                         value={location}
//                         control={<Radio />}
//                         label={location}
//                       />
//                     ))}
//                   </RadioGroup>
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold" }}
//                   >
//                     PinCode
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     name="pincode"
//                     value={formData.pincode}
//                     onChange={(e) => {
//                       const input = e.target.value;
//                       if (/^\d{0,6}$/.test(input)) {
//                         setFormData({ ...formData, pincode: input });
//                       }
//                     }}
//                     error={
//                       formData.pincode.length > 0 &&
//                       formData.pincode.length !== 6
//                     }
//                     helperText={
//                       formData.pincode.length > 0 &&
//                       formData.pincode.length !== 6
//                         ? "Pincode must be exactly 6 digits"
//                         : ""
//                     }
//                     label="Enter Pincode"
//                     inputProps={{
//                       inputMode: "numeric",
//                       pattern: "[0-9]*",
//                       maxLength: 6,
//                     }}
//                     sx={{ mb: 4 }}
//                   />
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold" }}
//                   >
//                     Father's / Guardian Phone Number
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     name="phone"
//                     value={formData.fatherphonename}
//                     onChange={(e) => {
//                       const input = e.target.value;
//                       if (/^\d{0,10}$/.test(input)) {
//                         setFormData({ ...formData, fatherphonename: input });
//                       }
//                     }}
//                     error={
//                       formData.fatherphonename.length > 0 &&
//                       formData.fatherphonename.length !== 10
//                     }
//                     helperText={
//                       formData.fatherphonename.length > 0 &&
//                       formData.fatherphonename.length !== 10
//                         ? "Phone number must be exactly 10 digits"
//                         : ""
//                     }
//                     label={
//                       <span style={{ display: "flex", alignItems: "center" }}>
//                         <PhoneIcon style={{ fontSize: 20, marginRight: 4 }} />
//                         Enter Father's / Guardian Phone Number
//                       </span>
//                     }
//                     inputProps={{
//                       inputMode: "numeric",
//                       pattern: "[0-9]*",
//                       maxLength: 10,
//                     }}
//                     sx={{ mb: 3 }}
//                   />
//                 </Grid>

//                 <Grid
//                   size={{ xs: 10, md: 6, lg: 5.5 }}
//                   sx={{ display: "flex", flexDirection: "column" }}
//                 >
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold" }}
//                   >
//                     DOB
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     value={formData.dob}
//                     onChange={handleChange}
//                     type="date"
//                     name="dob"
//                     sx={{ mb: 4 }}
//                   />
//                   {/* {formData.location === "Other District" && (
//                   <>
//                     <Typography
//                       variant="h6"
//                       gutterBottom
//                       sx={{ color: "black", fontWeight: "bold" }}
//                     >
//                       Select District
//                     </Typography>
//                     <TextField
//                       fullWidth
//                       select
//                       label="Other District"
//                       name="otherdistrict"
//                       value={formData.otherdistrict}
//                       onChange={handleChange}
//                       sx={{ mb: 4 }}
//                     >
//                       {districts.map((district, index) => (
//                         <MenuItem key={index} value={district.name}>
//                           {district.name}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </>
//                 )} */}
//                   <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
//                     <Typography
//                       variant="h6"
//                       gutterBottom
//                       sx={{ fontWeight: "bold", color: formData.location === "Other District" ? "text.primary" : "text.disabled", }}
                      
//                     >
//                       Select District
//                     </Typography>
//                     <Autocomplete
//                       options={districts}
//                       getOptionLabel={(option) => option.name}
//                       value={
//                         districts.find((d) => d.name === formData.district) ||
//                         null
//                       }
//                       onChange={handleDistrictChange}
//                       disabled={formData.location !== "Other District"}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="Select District"
//                           variant="outlined"
//                           fullWidth
//                           disabled={formData.location !== "Other District"} // also disables the label
//                         />
//                       )}
//                     />
//                   </FormControl>
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold" }}
//                   >
//                     Father's Name / Guardian Name
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     name="fathername"
//                     value={formData.fathername}
//                     onChange={handleChange}
//                     label="Enter Father's Name / Guardian Name"
//                     sx={{ mb: 4.2 }}
//                   />
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold" }}
//                   >
//                     Father's Occupation
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     name="fatheroccupation"
//                     value={formData.fatheroccupation}
//                     onChange={handleChange}
//                     label="Enter Father's Name / Guardian Name"
//                     sx={{ mb: 5 }}
//                   />
//                 </Grid>
//               </Grid>
//             </form>
//           </Box>
//           <Box
//             sx={{
//               width: "95%",
//               display: "flex",
//               justifyContent: {
//                 xs: "center",
//                 sm: "center",
//                 md: "center",
//                 lg: "flex-end",
//               },
//               alignItems: "center",
//               my: 2,
//               mb: 3,
//               // bgcolor:'gray'
//             }}
//           >
//             <Box
//               sx={{
//                 width: { xs: "100%", sm: "80%", md: "50%", lg: "auto" },
//                 display: "flex",
//                 flexDirection: { xs: "column", sm: "row" },
//                 justifyContent: {
//                   xs: "center",
//                   sm: "center",
//                   md: "flex-end",
//                   lg: "flex-end",
//                 },
//                 alignItems: "center",
//                 gap: 2,
//                 // bgcolor:'gray'
//               }}
//             >
//               {isInputEmpty && (
//                 <Stack
//                   sx={{
//                     width: "auto",
//                     fontSize: "13px",
//                     p: 0,
//                     mt: 1,
//                   }}
//                 >
//                   <Alert variant="filled" severity="error">
//                     Please fill in all required fields.
//                   </Alert>
//                 </Stack>
//               )}
//               {showAlert && (
//                 <Stack sx={{ width: "auto", fontSize: "13px", p: 0, mt: 1 }}>
//                   <Alert variant="filled" severity="success">
//                     Successfully Filled
//                   </Alert>
//                 </Stack>
//               )}
//               <Button
//                 variant="contained"
//                 color="error"
//                 type="button"
//                 onClick={handleSubmitNew}
//                 sx={{
//                   flex: 1,
//                   width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
//                   minWidth: "160px",
//                   height: 40,
//                   bgcolor: "#D32F2F",
//                   fontSize: "13px",
//                   textDecoration: "none",
//                   mt: 2,
//                 }}
//               >
//                 Save & Add New
//               </Button>
//               <Button
//                 variant="contained"
//                 type="button"
//                 onClick={handleSubmit}
//                 sx={{
//                   flex: 1,
//                   width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
//                   minWidth: "160px",
//                   height: 40,
//                   bgcolor: "green",
//                   fontSize: "13px",
//                   mt: 2,
//                 }}
//               >
//                 Save
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//       {/* <Value name={formData} /> */}
//     </Box>
//   );
// };

// export default AdditionalInfo;
