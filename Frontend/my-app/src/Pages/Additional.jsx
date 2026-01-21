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
  InputAdornment,Modal,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import axios from "axios";
import { useLead } from "../Contexts/LeadContext";
import StepPagination from "../Components/StepPagination";
import gpay from "../assets/gpay.jpg";
import PhonePe from "../assets/phonepe-icon.webp"
import paytm from"../assets/paytm.png";
import Qrcodeimg from "../assets/Qrcodeimg.svg"

const API_URL = "http://localhost:5000/api";
const drawerWidth = 320;

const courses=[
  {id:1,name:"Full stack development", fee:60000},
  {id:2,name:"Mern stack development", fee:50000},
  {id:3,name:"Python Backend", fee:40000},
]
 
const AdditionalInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, userId, id,isEdit} = location.state || {};
  const isEditMode = location.state?.isEdit === true;
  const existingLeadId = location.state?.userId; 
  
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

  // Payment Method States
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showGpayDialog, setShowGpayDialog] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
  });
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [advanceStatus, setAdvanceStatus] = useState("unpaid"); // paid | unpaid
  const [advanceTwoStatus, setAdvanceTwoStatus] = useState("Unpaid"); 
  const [showCashModal, setShowCashModal] = useState(false);
  const[showgpayModal,setShowGpayModal]=useState(false);
  const[showBankModal,setShowBankModal]=useState(false);
  const [banks, setBanks] = useState([]);
  const[upiApps,setupiApps]=useState([]);
  const [showQrModal, setShowQrModal] = useState(false);

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

  const isAdvanceTwoEnabled = paymentType === "emi" && Number(advance) < 10000;

  const handleCourseChange = (e) => {
    const selected = courses.find((c) => c.name === e.target.value);
    setCourse(e.target.value);
    setfee(selected.fee);
  };

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

  // Payment Method Handlers

const handlePaymentMethodChange = (e) => {
  const method = e.target.value;
  setPaymentMethod(method);

  if (method === "cash") {
    setShowCashModal(true);
  }
   if(method==="gpay")
   {
    setShowGpayModal(true)
   }
   if(method==="bank"){
    setShowBankModal(true)
   }
};


  const handleGpayClick = () => {
    setShowGpayDialog(true);
  };

  const handleGpayClose = () => {
    setShowGpayDialog(false);
  };

  const handleGpayConfirm = () => {
    if (transactionId.trim()) {
      setShowGpayDialog(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleBankDetailsChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

 // In AdditionalInfo.jsx - Update handleFinalSave function

const handleFinalSave = async () => {
  try {

    // 🔍 VALIDATE ONLY IN CREATE MODE
    if (!isEdit) {
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
    }

    // 🔐 Payment method validation (both modes)
    if (!paymentMethod) {
      setErrorMessage("Please select a payment method");
      setIsInputEmpty(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Login expired. Please login again.");
      setIsInputEmpty(true);
      return;
    }

    let leadId = existingLeadId;

    // 🧾 CREATE or UPDATE LEAD
    if (isEdit) {
      await axios.put(
        `http://localhost:5000/api/leads/${existingLeadId}`,
        { ...leadDraft, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      const leadRes = await axios.post(
        `http://localhost:5000/api/leads`,
        { ...leadDraft, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      leadId = leadRes.data.lead._id;
    }

    // 📅 Format advanceTwoDate
    const formattedAdvanceTwoDate =
      advanceTwo > 0 && advanceTwoDate
        ? new Date(advanceTwoDate).toISOString()
        : null;

    // 💳 Payment Method Details
    let paymentMethodDetails = { method: paymentMethod };

    if (paymentMethod === "gpay") {
      paymentMethodDetails.transactionId = transactionId;
    } else if (paymentMethod === "bank") {
      paymentMethodDetails.bankDetails = bankDetails;
    } else if (paymentMethod === "cash") {
      paymentMethodDetails.cashAmount = cashReceived;
    }

    // 💰 CREATE or UPDATE PAYMENT
    const paymentPayload = {
      course,
      courseFee: fee,
      paymentType,
      months: paymentType === "emi" ? months : null,
      advance: advance || 0,
      advanceTwo: advanceTwo || 0,
      advanceTwoStatus,
      advanceTwoDate: formattedAdvanceTwoDate,
      paymentMethodDetails,
    };

    if (isEdit) {
      await axios.put(
        `${API_URL}/payments/lead/${leadId}`,
        paymentPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post(
        `${API_URL}/payments`,
        { leadId, ...paymentPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setLeadDraft({});
    navigate("/dashboard");

  } catch (error) {
    console.error(error);
    setErrorMessage(error.response?.data?.message || "Save failed");
    setIsInputEmpty(true);
  }
};

//show banks dropdown
useEffect(() => {
  axios
    .get("../dropdownData.json")
    .then((response) => {
      setDistricts(response.data.districts);
      setBanks(response.data.banks); // Add this line
      setupiApps(response.data.upiApps);
    })
    .catch((error) => {
      console.error("Error loading dropdown data:", error);
    });
}, []);

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
  const fetchPayment = async () => {
    if (!userId || !isEdit) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/payments/lead/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const p = res.data.payment;

        setCourse(p.course || "");
        setfee(p.courseFee || "");
        setPaymentType(p.paymentType || "full");
        setMonths(p.months || "");
        setAdvance(p.advance || "");
        setadvanceTwo(p.advanceTwo || "");
        setAdvanceTwoStatus(p.advanceTwoStatus || "Unpaid");
        setAdvanceTwoDate(
          p.advanceTwoDate ? p.advanceTwoDate.slice(0, 10) : ""
        );

        // Payment method
        setPaymentMethod(p.paymentMethodDetails?.method || "");

        if (p.paymentMethodDetails?.method === "gpay") {
          setTransactionId(p.paymentMethodDetails.transactionId || "");
        }

        if (p.paymentMethodDetails?.method === "bank") {
          setBankDetails(p.paymentMethodDetails.bankDetails || {});
        }

        if (p.paymentMethodDetails?.method === "cash") {
          setCashReceived(p.paymentMethodDetails.cashAmount || "");
        }
      }
    } catch (err) {
      console.error("Error fetching payment:", err);
    }
  };

  fetchPayment();
}, [userId, isEdit]);

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
      setFormData({
        email: "",
        location: "",
        fathername: "",
        dob: "",
        district: "",
        pincode: "",
        fatherphonename: "",
        fatheroccupation: "",
      });
      setCourse("");
      setfee("");
      setPaymentType("full");
      setMonths("");
      setAdvance("");
      setAdvanceDate("");
      setadvanceTwo("");
      setAdvanceTwoDate("");
      setPaymentMethod("");
      setTransactionId("");
      setBankDetails({ accountNumber: '', ifscCode: '', accountHolder: '' });
      setCashReceived("");
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
    <Box>
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
              
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold" }}>
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
                  
                  <Typography fontWeight="bold" mb={1} sx={{fontSize:{xs:18,md:20},color:paymentType!=='emi'?"grey":"black"}}>
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
                

                
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 5.5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20}}}>
                    Course Fee
                  </Typography>
                  <TextField
                    fullWidth
                    value={formatAmount(fee)}
                    label={fee?"":"course fee"}
                    sx={{ mb: 3 }}
                  />
                  
                  <FormControl fullWidth margin="normal" sx={{ mb: 3,fontSize:{xs:18,md:20} }}>
                    <Typography fontWeight="bold" mb={1} sx={{color:paymentType!=='emi'?"grey":"black"}}>
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
              
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20},color:(!isAdvanceTwoEnabled)?"grey":"black" }}>
                    Advance Amount 2
                  </Typography>
                  <TextField
                      fullWidth
                      value={advanceTwo}
                      disabled={!isAdvanceTwoEnabled}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, "");
                        if (/^\d*$/.test(value)) {
                          setadvanceTwo(value);
                        }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <TextField
                    select
                    variant="standard"
                    value={advanceTwoStatus}
                    onChange={(e) => setAdvanceTwoStatus(e.target.value)}
                    disabled={!isAdvanceTwoEnabled}
                    sx={{ minWidth: 90 }}
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </TextField>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField fullWidth type="date" value={advanceTwoDate} 
          onChange={(e) => setAdvanceTwoDate(e.target.value)} 
          disabled={!isAdvanceTwoEnabled} sx={{ mb: 3 }} />
                </Grid>
              </Grid>

              {/* Payment Method Selection */}
              <Box sx={{ mt: 4, mb: 4 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    color: "green",
                    textAlign: "center",
                    fontWeight: "bold",
                    mb: 3,
                    fontSize: { xs: "20px", sm: "24px", md: "30px" },
                  }}
                >
                  Select Payment Method
                </Typography>

                <Grid container justifyContent="center">
                    <Grid item xs={12}>
                      <RadioGroup
                        row
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        <Grid container spacing={3} justifyContent="center">
                          {/* GPay */}
                          <Grid item xs={12} md={4}>
                            <Paper
                              elevation={2}
                              sx={{
                                p: 2,
                                bgcolor: paymentMethod === "gpay" ? "#e8f5e9" : "white",
                                cursor: "pointer",
                              }}
                            >
                              <FormControlLabel
                                value="gpay"
                                control={<Radio />}
                                sx={{ width: "100%" }}
                                label={
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1,width:"100%" }}>
                                    <QrCode2Icon />
                                    <Typography>GPay/Upi </Typography>
                                  </Box>
                                }
                              />
                            </Paper>
                          </Grid>

                          {/* Bank */}
                          <Grid item xs={12} md={4}>
                            <Paper
                              elevation={2}
                              sx={{
                                p: 2,
                                bgcolor: paymentMethod === "bank" ? "#e8f5e9" : "white",
                                cursor: "pointer",
                              }}
                            >
                              <FormControlLabel
                                value="bank"
                                control={<Radio />}
                                sx={{ width: "100%" }}
                                label={
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1,width:"100px"}}>
                                    <AccountBalanceIcon />
                                    <Typography>Bank</Typography>
                                  </Box>
                                }
                              />
                            </Paper>
                          </Grid>

                          {/* Cash */}
                          <Grid item xs={12} md={4}>
                            <Paper
                              elevation={2}
                              sx={{
                                p: 2,
                                bgcolor: paymentMethod === "cash" ? "#e8f5e9" : "white",
                                cursor: "pointer",
                              }}
                            >
                              <FormControlLabel
                                value="cash"
                                control={<Radio />}
                                sx={{ width: "100%" }}
                                label={
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1,width:"100px" }}>
                                    <PaymentsIcon />
                                    <Typography>Cash</Typography>
                                  </Box>
                                }
                              />
                            </Paper>
                          </Grid>
                        </Grid>
                      </RadioGroup>
                    </Grid>
                </Grid>


                                      {/* GPay Details */}
                   
                     <Modal open={showgpayModal} onClose={() => setShowGpayModal(false)}>
                        <Box
                          sx={{
                            bgcolor: "#fff",
                            p: 3,
                            width: { xs: "90%", sm: 500, md: "50%" },
                            mx: "auto",
                            position: "relative",
                            top: "10%",
                            borderRadius: 2,
                            maxHeight: "80vh",
                            overflow: "auto",
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            gutterBottom 
                            sx={{ mb: 3, fontWeight: 'bold', color: '#262c67', textAlign: 'center' }}
                          >
                            UPI Payment
                          </Typography>

                          {/* UPI ID Display */}
                          <Box 
                            sx={{ 
                              bgcolor: '#f5f5f5', 
                              p: 2, 
                              borderRadius: 2, 
                              mb: 3,
                              textAlign: 'center'
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Pay to UPI ID
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: 'green',
                               
                              }}
                            >
                              ForturaTech@upi
                            </Typography>
                          </Box>

                          {/* UPI App Selection */}
                          <Typography variant="body1" gutterBottom sx={{ mb: 2, fontWeight: '600' }}>
                            Select UPI App
                          </Typography>
                          
                         
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            {upiApps.map((app) => (
                              <Grid size={{ xs: 6, sm: 4, md: 4 }} key={app.id}>
                                <Paper
                                  elevation={selectedUpiApp === app.name ? 3 : 1}
                                  sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    bgcolor: selectedUpiApp === app.name ? '#e8f5e9' : 'white',
                                    border: selectedUpiApp === app.name ? '2px solid green' : '2px solid transparent',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '100px',
                                    '&:hover': {
                                      bgcolor: '#f5f5f5',
                                      transform: 'translateY(-2px)',
                                    }
                                  }}
                                  onClick={() => {
                                      setSelectedUpiApp(app.name);
                                      setPaymentMethod("gpay");
                                      setShowQrModal(true);
                                    }}
                                >
                                  <img src={app.icon} alt={app.name} style={{ width: '40px', height: '40px', marginBottom: '8px', objectFit: 'contain' }} />
                                  <Typography variant="caption" sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
                                    {app.name}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>

                          {/* Transaction ID Input */}
                          <TextField
                            fullWidth
                            label="Enter Transaction ID / Reference Number"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g., 123456789012"
                            sx={{mb:3}}
                          />

                          {/* Instructions */}
                          {/* <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
                            <Typography variant="caption">
                              1. Open your UPI app<br/>
                              2. Send payment to <strong>company@upi</strong><br/>
                              3. Enter the transaction ID below
                            </Typography>
                          </Alert> */}

                          {/* Action Buttons */}
                          <Box sx={{ display: "flex",justifyContent:"end",gap:2 }}>
                            <Button
                              variant="contained"
                              sx={{ bgcolor: "green",  }}
                             
                              onClick={() => {
                                setShowGpayModal(false);
                                setShowAlert(true);
                                setTimeout(() => setShowAlert(false), 3000);
                              }}
                            >
                              Confirm Payment
                            </Button>

                            <Button
                              variant="contained"
                              sx={{ bgcolor: "red",  }}
                              onClick={() => {
                                setTransactionId("");
                                setSelectedUpiApp("");
                                setPaymentMethod("");
                                setShowGpayModal(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                     </Modal>

                    

                    {/* Bank Transfer Details */}
                     <Modal open={showBankModal} onClose={() => setShowBankModal(false)}>
                        <Box
                          sx={{
                            bgcolor: "#fff",
                            p: 3,
                            width: { xs: "90%", sm: 500 },
                            position: "relative",
                            top: "10%",
                            mx: "auto",
                            borderRadius: 2,
                            maxHeight: "80vh",
                            overflow: "auto",
                          }}
                        >
                          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: '#262c67' }}>
                            Enter Bank Transfer Details
                          </Typography>
                          <Grid container spacing={2}>
                            {/* Bank Selection Dropdown */}
                            <Grid size={12}>
                              <TextField
                                fullWidth
                                select
                                label="Select Bank"
                                value={bankDetails.selectedBank}
                                onChange={(e) => handleBankDetailsChange('selectedBank', e.target.value)}
                                required
                              >
                                <MenuItem value="">
                                  <em>Select a bank</em>
                                </MenuItem>
                                {banks.map((bank) => (
                                 
                                 <MenuItem key={bank.id} value={bank.name}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%",
                                      }}
                                    >
                                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                                        {bank.name}
                                      </Typography>

                                      <Box
                                        component="img"
                                        src={bank.icon}
                                        alt={bank.name}
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          objectFit: "contain",
                                        }}
                                      />
                                    </Box>
                                  </MenuItem>

                                 
                                ))}
                              </TextField>
                            </Grid>

                            {/* Account Holder Name */}
                            <Grid size={12}>
                              <TextField
                                fullWidth
                                label="Account Holder Name"
                                value={bankDetails.accountHolder}
                                onChange={(e) => handleBankDetailsChange('accountHolder', e.target.value)}
                                required
                              />
                            </Grid>

                            {/* Account Number */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="Account Number"
                                value={bankDetails.accountNumber}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d{0,18}$/.test(value)) {
                                    handleBankDetailsChange('accountNumber', value);
                                  }
                                }}
                                inputProps={{ inputMode: 'numeric' }}
                                required
                              />
                            </Grid>

                            {/* IFSC Code */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="IFSC Code"
                                value={bankDetails.ifscCode}
                                onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value.toUpperCase())}
                                inputProps={{ maxLength: 11 }}
                                required
                              />
                            </Grid>
                          </Grid>

                          {/* Action Buttons */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
                            <Button
                              variant="contained"
                              sx={{ bgcolor: "green", flex: 1 }}
                              disabled={
                                !bankDetails.selectedBank ||
                                !bankDetails.accountHolder ||
                                !bankDetails.accountNumber ||
                                !bankDetails.ifscCode
                              }
                              onClick={() => {
                                setShowBankModal(false);
                              }}
                            >
                              Confirm
                            </Button>

                            <Button
                              variant="contained"
                              sx={{ bgcolor: "red", flex: 1 }}
                              onClick={() => {
                                setBankDetails({
                                  selectedBank: '',
                                  accountNumber: '',
                                  ifscCode: '',
                                  accountHolder: '',
                                });
                                setPaymentMethod("");
                                setShowBankModal(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                     </Modal>

                    {/* Cash Details */}
                                    
                    <Modal open={showCashModal} onClose={() => setShowCashModal(false)}>

                    <Box
                      sx={{
                        bgcolor: "#fff",
                        p: 3,
                        width: 500,
                        mx: "auto",
                        position: "relative",
                        top: "20%",
                        mt: "5%",
                        borderRadius: 2,
                        maxHeight: "70vh",
                        overflow: "auto",
                      }}
                    >
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ mb: 2, fontWeight: "bold", color: "#262c67" }}
                      >
                        Cash Payment Details
                      </Typography>

                      <TextField
                        fullWidth
                        label="Amount Received (₹)"
                        value={formatAmount(cashReceived)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(value)) {
                            setCashReceived(value);
                          }
                        }}
                        sx={{ mb: 3 }}
                      />

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Button
                    variant="contained"
                    sx={{ bgcolor: "green" }}
                    disabled={!cashReceived || Number(cashReceived) <= 0}
                    onClick={() => {
                      setShowCashModal(false); // ✅ only close modal
                    }}
                  >
                    Confirm
                  </Button>


                      <Button
                    variant="contained"
                    sx={{ bgcolor: "red" }}
                    onClick={() => {
                      setCashReceived("");
                      setPaymentMethod("");   // cancel resets method
                      setShowCashModal(false);
                    }}
                  >
                    Cancel
                  </Button>

                      </Box>
                    </Box>
                  </Modal>

                
              
                </Box>
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
           {isEditMode ? "Update" : "Save"}
          </Button>
        </Grid>
      </Grid>
      <StepPagination/>
    </Paper>
  </Grid>
{/* 
  {/* GPay QR Code Dialog */}
   {/* <Dialog open={showGpayDialog} onClose={handleGpayClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: 24 }}>
      Scan QR Code to Pay
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        QR Code Display 
        <Box
          sx={{
            width: 250,
            height: 250,
            bgcolor: 'white',
            border: '2px solid #ddd',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
           <Box
              sx={{
                width: 250,
                height: 250,
                bgcolor: "white",
                border: "2px solid #ddd",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}>
            <QRCodeCanvas
              value={`upi://pay?pa=ForturaTech@upi&pn=ForturaTech&am=${advance || fee}&cu=INR`}
              size={200}
              level="H"
              includeMargin
         />
        </Box>

        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          UPI ID: company@upi
        </Typography>

        <TextField
          fullWidth
          label="Enter Transaction ID / Reference Number"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="e.g., 123456789012"
          sx={{ mt: 2 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Enter the transaction ID received after payment
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
      <Button onClick={handleGpayClose} variant="outlined">
        Cancel
      </Button>
      <Button
        onClick={handleGpayConfirm}
        variant="contained"
        color="primary"
        disabled={!transactionId.trim()}
      >
        Confirm Payment
      </Button>
    </DialogActions>
  </Dialog>  */}
   <Modal open={showQrModal} onClose={() => setShowQrModal(false)}>
  <Box
    sx={{
      bgcolor: "#fff",
      p: 3,
      width: { xs: "90%", sm: 400 },
      mx: "auto",
      mt: "10%",
      borderRadius: 2,
      minHeight: "40vh",
      textAlign: "center",
    }}
  >
    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
      Scan to Pay ({selectedUpiApp})
    </Typography>

    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mb: 2,
      }}
    >
     <img src={Qrcodeimg} alt="" />
    </Box>

    <Typography sx={{ mb: 1 }}>
      UPI ID: <strong>ForturaTech@upi</strong>
    </Typography>

    <Typography sx={{ mb: 2, color: "green", fontWeight: "bold" }}>
      Amount: ₹{formatAmount(advance || fee)}
    </Typography>

    <TextField
      fullWidth
      label="Transaction name"
      value={transactionId}
      onChange={(e) => setTransactionId(e.target.value)}
      sx={{ mb: 2 }}
    />

    <Box sx={{ display: "flex", gap: 2 }}>
      <Button
        fullWidth
        variant="contained"
        color="success"
        disabled={!transactionId}
        onClick={() => setShowQrModal(false)}
      >
        Confirm
      </Button>

      <Button
        fullWidth
        variant="contained"
        color="error"
        onClick={() => {
          setTransactionId("");
          setSelectedUpiApp("");
          setShowQrModal(false);
        }}
      >
        Cancel
      </Button>
    </Box>
  </Box>
</Modal>

</Box>);
};
export default AdditionalInfo;
