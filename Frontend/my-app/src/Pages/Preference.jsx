import {
  Box,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  MenuItem,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import CommonModal from "../Components/CommonModal";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { green } from "@mui/material/colors";
import { useLead } from "../Contexts/LeadContext";
import StepPagination from "../Components/StepPagination";
const API_URL = "http://localhost:5000/api";
const drawerWidth = 320;

const Preference = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, userId, id } = location.state || {};
 

  const [isInputEmpty, setIsInputEmpty] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const currentYear = new Date().getFullYear().toString();
  const { leadDraft, setLeadDraft } = useLead();
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

useEffect(() => {
  if (leadDraft) {
    setFormData((prev) => ({ ...prev, ...leadDraft }));
  }
}, []);
const validateForm = () => {
  if (!formData.preferredcatagory || !formData.preferredcourse) {
    setModalMessage("Please fill all required fields");
    setOpenModal(true);
    return false;
  }

  // if (!/^\d{10}$/.test(formData.phone)) {
  //   setModalMessage("Please enter a valid 10-digit phone number");
  //   setOpenModal(true);
  //   return false;
  // }

  return true;
};


const handleNext = () => {
  if (!validateForm()) return;

  // ✅ Save Preference data to Context
  setLeadDraft((prev) => ({
    ...prev,
    ...formData,
  }));

  // ✅ Go to FINAL step
  navigate("/additional");
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

  // Dropdown data
  const [dropdownData, setDropdownData] = useState({
    categoryCourses: {},
    qualificationDepartments: {},
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await axios.get("./dropdownData.json");
        setDropdownData(response.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
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
            preferredcatagory: lead.preferredcatagory || "",
            modeoflearning: lead.modeoflearning || "Offline",
            preferredcourse: lead.preferredcourse || "",
            qualification: lead.qualification || "",
            collegename: lead.collegename || "",
            department: lead.department || "",
            graduationyear: lead.graduationyear || currentYear,
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
    preferredcatagory: "",
    modeoflearning: "Offline",
    preferredcourse: "",
    qualification: "",
    collegename: "",
    department: "",
    graduationyear: currentYear,
  });

  const updateLead = async (navigateTo) => {
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
        
        setTimeout(() => {
          if (navigateTo === "additional") {
            navigate("/additional", {
              state: { userId, fullName, showSuccessAlert: true },
            });
          } else if (navigateTo === "dashboard") {
            navigate("/dashboard");
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
    await updateLead("additional");
  };

 const handleSubmitClose = () => {
  setLeadDraft((prev) => ({
    ...prev,
    ...formData,
  }));
  navigate("/dashboard");
};


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "preferredcatagory") {
      setFormData({
        ...formData,
        [name]: value,
        preferredcourse: "",
      });
    } else if (name === "qualification") {
      setFormData({
        ...formData,
        [name]: value,
        department: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const courses = dropdownData?.categoryCourses?.[formData?.preferredcatagory || ""] || [];
  const departments = dropdownData?.qualificationDepartments?.[formData?.qualification || ""] || [];

  return (
    <Box >
        <CommonModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  title="Validation Error"
  message={modalMessage}
  buttonText="OK"
/>

         <Grid sx={{px:{xs:0 ,md:10},py:{xs:1,md:5}}}>
        <Paper elevation={6} sx={{ borderRadius: 3, p:{xs:2,md:5},mt:2 }} >
         <Grid sx={{textAlign:"center"}}>
          <Typography
            variant="overline"
            gutterBottom
            sx={{
              width: "100%",
              color: "#262c67 ",
              fontWeight: "bold",
              fontSize: { xs: "24px", sm: "30px", md: "50px" },
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
                mb: 5,
                fontSize: { xs: "24px", sm: "30px", md: "40px" },
              }}
            >
              Preference
            </Typography>
            
            <form  autoComplete="off">
              <Grid container spacing={{ xs: 2, md: 12 }} justifyContent="center">
                <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20} }}>
                    Preferred Category
                  </Typography>
                  <TextField
                    fullWidth
                    label="Select Preferred Category"
                    select
                    name="preferredcatagory"
                    value={formData.preferredcatagory}
                    onChange={handleChange}
                  >
                    {Object.keys(dropdownData?.categoryCourses || {}).map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Typography variant="h6" gutterBottom sx={{ color: "black",fontSize:{xs:18,md:20} ,fontWeight: "bold", mt: 3 }}>
                    Mode of Learning
                  </Typography>
                  <RadioGroup
                    row
                    name="modeoflearning"
                    value={formData.modeoflearning}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  >
                    <FormControlLabel value="Offline" control={<Radio />} label="Offline" />
                    <FormControlLabel value="Online" control={<Radio />} label="Online" />
                  </RadioGroup>
                </Grid>

                <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20}  }}>
                    Preferred Course
                  </Typography>
                  <TextField
                    fullWidth
                    label="Select Preferred Course"
                    select
                    name="preferredcourse"
                    value={formData.preferredcourse}
                    onChange={handleChange}
                    disabled={!formData.preferredcatagory}
                  >
                    {courses.map((course, index) => (
                      <MenuItem key={index} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color:"green",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: { xs: "20px", sm: "30px", md: "40px" },
                  mt: 2,
                  mb: 4,
                }}
              >
                Educational Details
              </Typography>
               
              <Grid container spacing={{ xs: 2, md: 12 }} justifyContent="center">
                <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold",fontSize:{xs:18,md:20}}}>
                    Qualification
                  </Typography>
                  <TextField
                    fullWidth
                    label="Select Qualification"
                    select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  >
                    {Object.keys(dropdownData?.qualificationDepartments || {}).map((qual) => (
                      <MenuItem key={qual} value={qual}>
                        {qual}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold", mt: 3,fontSize:{xs:18,md:20}}}>
                    College Name
                  </Typography>
                  <TextField
                    fullWidth
                    label="Enter College Name"
                    name="collegename"
                    value={formData.collegename}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 5, lg: 5 }} sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold", mt: 0,fontSize:{xs:18,md:20} }}>
                    Department
                  </Typography>
                  <TextField
                    fullWidth
                    label="Select Department"
                    select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!formData.qualification}
                  >
                    {departments.map((dept, idx) => (
                      <MenuItem key={idx} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Typography variant="h6" gutterBottom sx={{ color: "black", fontWeight: "bold", mt: 3,fontSize:{xs:18,md:20} }}>
                    Graduation Year
                  </Typography>
                  <TextField
                    fullWidth
                    label="Select Graduation Year"
                    select
                    name="graduationyear"
                    value={formData.graduationyear}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  >
                    {Array.from({ length: 20 }, (_, i) => {
                      const year = 2030 - i;
                      return (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
              </Grid>
            </form>
          </Box>
          
          <Box
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
                onClick={handleSubmitClose}
                sx={{
                  flex: 2,
                  width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
                  minWidth: "160px",
                  height: 40,
                  bgcolor: "#D32F2F",
                  fontSize: "13px",
                  fontWeight: "bold",
                  mt: 2,
                }}
              >
                Save & Close
              </Button>
              
              <Button
                variant="contained"
                type="button"
                onClick={()=>{
                  if(validateForm()){
                    handleNext();
                  }
                }}
                sx={{
                  flex: 1,
                  width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
                  minWidth: "160px",
                  height: 40,
                  bgcolor: "#008000",
                  fontSize: "13px",
                  mt: 2,
                }}
              >
              Continue
              </Button>
            </Box>
          </Box>
           <StepPagination></StepPagination>
        </Paper>
         
      </Grid>
    </Box>
  );
};

export default Preference;






// import {
//   Box,
//   Grid,
//   Typography,
//   TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Button,
//   MenuItem,
//   Stack,
//   Alert,
// } from "@mui/material";
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../firebase";
// import axios from "axios";

// const drawerWidth = 320;

// const Preference = () => {
//   const navigate = useNavigate();
//   const [isInputEmpty, setIsInputEmpty] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const location = useLocation();
//   const { fullName, userId, id } = location.state || {};

//   // Show success alert only once after navigation from Add Lead
//   useEffect(() => {
//     if (location.state && location.state.showSuccessAlert) {
//       setShowAlert(true);
//       // Remove showSuccessAlert from state after showing alert
//       const timeout = setTimeout(() => {
//         setShowAlert(false);
//         // Use navigate with replace:true to clear showSuccessAlert
//         navigate(window.location.pathname, {
//           replace: true,
//           state: { ...location.state, showSuccessAlert: undefined },
//         });
//       }, 2000);
//       return () => clearTimeout(timeout);
//     }
//   }, [location, navigate]);

//   // dropdown
//   const [dropdownData, setDropdownData] = useState({
//     categoryCourses: {},
//     qualificationDepartments: {},
//   });
//   useEffect(() => {
//     const fetchDropdownData = async () => {
//       try {
//         const response = await axios.get("./dropdownData.json");
//         setDropdownData(response.data);
//       } catch (error) {
//         console.error("Error fetching dropdown data:", error);
//       }
//     };

//     fetchDropdownData();
//   }, []);

//   useEffect(() => {
//     if (isInputEmpty) {
//       const timeout = setTimeout(() => setIsInputEmpty(false), 2000);
//       return () => clearTimeout(timeout);
//     }
//   }, [isInputEmpty]);

//   useEffect(() => {
//     const fetchLead = async () => {
//       if (!id) return;
//       try {
//         const docRef = doc(db, "userlead", id);
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const lead = docSnap.data();
//           setFormData({
//             preferredcatagory: lead.preferredcatagory || "",
//             modeoflearning: lead.modeoflearning || "Offline",
//             phopreferredcoursene: lead.preferredcourse || "",
//             qualification: lead.qualification || "",
//             collegename: lead.collegename || "",
//             department: lead.department || "",
//             graduationyear: lead.graduationyear || "",
//           });
//         } else {
//           console.log("No such document!");
//         }
//       } catch (error) {
//         console.error("Error fetching lead:", error);
//       }
//     };
//     fetchLead();
//   }, [id]);
//   const currentYear = new Date().getFullYear().toString(); // "2025"

//   const [formData, setFormData] = useState({
//     preferredcatagory: "",
//     modeoflearning: "Offline",
//     preferredcourse: "",
//     qualification: "",
//     collegename: "",
//     department: "",
//     graduationyear: currentYear,
//   });
//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     try {
//       await setDoc(doc(db, "userlead", userId), formData, { merge: true });

//       setFormData({
//         preferredcatagory: "",
//         modeoflearning: "Offline",
//         preferredcourse: "",
//         qualification: "",
//         collegename: "",
//         department: "",
//         graduationyear: "",
//       });

//       navigate("/additional", {
//         state: { userId, fullName, showSuccessAlert: true },
//       });
//     } catch (err) {
//       console.error("Error saving preference: ", err);
//       alert("Error: " + err.message);
//     }
//   };

//   const handleSubmitClose = async (event) => {
//     event.preventDefault();

//     const values = Object.values(formData);
//     if (values.includes("")) {
//       setIsInputEmpty(true);
//       return;
//     } else {
//       setShowAlert(true);
//     }

//     try {
//       await setDoc(doc(db, "userlead", userId), formData, { merge: true });

//       setFormData({
//         preferredcatagory: "",
//         modeoflearning: "Offline",
//         preferredcourse: "",
//         qualification: "",
//         collegename: "",
//         department: "",
//         graduationyear: "",
//       });

//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Error saving preference: ", err);
//       alert("Error: " + err.message);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "preferredcatagory") {
//       setFormData({
//         ...formData,
//         [name]: value,
//         preferredcourse: "",
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: value,
//       });
//     }
//     if (name === "qualification") {
//       setFormData({
//         ...formData,
//         [name]: value,
//         department: "",
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: value,
//       });
//     }
//   };

//   const courses =
//     dropdownData?.categoryCourses?.[formData?.preferredcatagory || ""] || [];
//   const departments =
//     dropdownData?.qualificationDepartments?.[formData?.qualification || ""] ||
//     [];

//   return (
//     <Box sx={{ display: "flex", minHeight: "100dvh" }}>
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 2,
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
//           {/* <Typography variant="overline" gutterBottom sx={{ width: '100%', color: '#440731', fontSize: '40px', fontWeight: 'bold', textAlign: { xs: 'center', lg: 'left' }, mt: { xs: '0px', md: '0px', lg: '0px' } }}>
//             {fullName}
//           </Typography> */}
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
//             mt: 6,
//           }}
//         >
//           <Typography
//             variant="overline"
//             gutterBottom
//             sx={{
//               width: "100%",
//               color: "#440731",
//               fontSize: "40px",
//               fontWeight: "bold",
//               textAlign: { xs: "center", lg: "left" },
//               pl: 5,
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
//               // mt: "5px",
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
//                 mb: 5,
//                 mt: 5,
//               }}
//             >
//               2. Preference
//             </Typography>
//             <form autoComplete="off">
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
//                     Preferred Category
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     label="Select Preferred Category"
//                     select
//                     name="preferredcatagory"
//                     value={formData.preferredcatagory}
//                     onChange={handleChange}
//                   >
//                     {Object.keys(dropdownData?.categoryCourses || {}).map(
//                       (cat) => (
//                         <MenuItem key={cat} value={cat}>
//                           {cat}
//                         </MenuItem>
//                       )
//                     )}
//                   </TextField>

//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold", mt: 3 }}
//                   >
//                     Mode of Learning
//                   </Typography>
//                   <RadioGroup
//                     row
//                     name="modeoflearning"
//                     value={formData.modeoflearning}
//                     onChange={handleChange}
//                     sx={{ mb: 2 }}
//                   >
//                     <FormControlLabel
//                       value="Offline"
//                       control={<Radio />}
//                       label="Offline"
//                     />
//                     <FormControlLabel
//                       value="Online"
//                       control={<Radio />}
//                       label="Online"
//                     />
//                   </RadioGroup>
//                 </Grid>

//                 <Grid
//                   size={{ xs: 10, md: 5, lg: 5 }}
//                   sx={{ display: "flex", flexDirection: "column" }}
//                 >
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold", mt: 0 }}
//                   >
//                     Preferred Course
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     label="Select Preferred Course"
//                     select
//                     name="preferredcourse"
//                     value={formData.preferredcourse}
//                     onChange={handleChange}
//                     disabled={!formData.preferredcatagory}
//                   >
//                     {courses.map((course, index) => (
//                       <MenuItem key={index} value={course}>
//                         {course}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>
//               </Grid>

//               <Typography
//                 variant="h3"
//                 gutterBottom
//                 sx={{
//                   color: "#440731",
//                   textAlign: "center",
//                   fontWeight: "bold",
//                   mt: 2,
//                   mb: 4,
//                 }}
//               >
//                 3. Educational Details
//               </Typography>

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
//                     Qualification
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     label="Select Qualification"
//                     select
//                     // search
//                     name="qualification"
//                     value={formData.qualification}
//                     onChange={handleChange}
//                   >
//                     {Object.keys(
//                       dropdownData?.qualificationDepartments || {}
//                     ).map((qual) => (
//                       <MenuItem key={qual} value={qual}>
//                         {qual}
//                       </MenuItem>
//                     ))}
//                   </TextField>

//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold", mt: 3 }}
//                   >
//                     College Name
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     label="Enter College Name"
//                     name="collegename"
//                     value={formData.collegename}
//                     onChange={handleChange}
//                     sx={{ mb: 2 }}
//                   />
//                 </Grid>

//                 <Grid
//                   size={{ xs: 10, md: 5, lg: 5 }}
//                   sx={{ display: "flex", flexDirection: "column" }}
//                 >
//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold", mt: 0 }}
//                   >
//                     Department
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     label="Select Department"
//                     select
//                     // search
//                     name="department"
//                     value={formData.department}
//                     onChange={handleChange}
//                     disabled={!formData.qualification}
//                   >
//                     {departments.map((dept, idx) => (
//                       <MenuItem key={idx} value={dept}>
//                         {dept}
//                       </MenuItem>
//                     ))}
//                   </TextField>

//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     sx={{ color: "black", fontWeight: "bold", mt: 3 }}
//                   >
//                     Graduation Year
//                   </Typography>
//                   <TextField
//                     fullWidth
//                     label="Select Graduation Year"
//                     select
//                     name="graduationyear"
//                     value={formData.graduationyear}
//                     onChange={handleChange}
//                     sx={{ mb: 2 }}
//                   >
//                     {Array.from({ length: 20 }, (_, i) => {
//                       const year = 2030 - i;
//                       return (
//                         <MenuItem key={year} value={year}>
//                           {year}
//                         </MenuItem>
//                       );
//                     })}
//                   </TextField>
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
//                 <Stack sx={{ width: "auto", fontSize: "13px", p: 0, mt: 1 }}>
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
//                 onClick={handleSubmitClose}
//                 sx={{
//                   flex: 2,
//                   width: { xs: "30%", sm: "30%", md: "30%", lg: "30%" },
//                   minWidth: "160px",
//                   height: 40,
//                   bgcolor: "#D32F2F",
//                   fontSize: "13px",
//                   fontWeight: "bold",
//                   mt: 2,
//                 }}
//               >
//                 Save & Close
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
//                 Save & Continue
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//       {/* <Value name={formData} /> */}
//     </Box>
//   );
// };

// export default Preference;
