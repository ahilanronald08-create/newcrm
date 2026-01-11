import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Grid,
  Paper,
} from "@mui/material";

const courses = [
  { id: 1, name: "Full Stack Development", fee: 60000 },
  { id: 2, name: "MERN Stack", fee: 45000 },
  { id: 3, name: "Python Backend", fee: 30000 },
];

const Payment = () => {
  const [course, setCourse] = useState("");
  const [fee, setFee] = useState("");
  const [paymentType, setPaymentType] = useState("full");
  const [months, setMonths] = useState("");
  const [advance, setAdvance] = useState("");

  const handleCourseChange = (e) => {
    const selected = courses.find(
      (c) => c.name === e.target.value
    );
    setCourse(e.target.value);
    setFee(selected.fee);
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    setPaymentType(value);

    if (value === "full") {
      setMonths("");
      setAdvance("");
    }
  };

  return (
    <Box display="flex" justifyContent="center" px={1} py={4}>
        <Grid  >
        <Typography
          textAlign="center"
          fontWeight="bold"
          color="green"
          sx={{ fontSize: { xs: 22, md: 32 }, mb: 4 }}
        >
          Payment Details
        </Typography>

        <Grid container spacing={3}>
          {/* Course */}
          <Grid item xs={12} md={6}>
            <Typography fontWeight="bold" mb={1}>
              Course
            </Typography>
            <TextField
              fullWidth
              select
              label="Select Course"
              value={course}
              onChange={handleCourseChange}
            >
              {courses.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Fee */}
          <Grid item xs={12} md={6}>
            <Typography fontWeight="bold" mb={1}>
              Course Fee
            </Typography>
            <TextField
              fullWidth
              label="Amount (₹)"
              value={fee}
              disabled
            />
          </Grid>

          {/* Payment Type */}
          <Grid item xs={12}>
            <Typography fontWeight="bold" mb={1}>
              Payment Type
            </Typography>
            <RadioGroup
              row
              value={paymentType}
              onChange={handlePaymentChange}
            >
              <FormControlLabel
                value="full"
                control={<Radio />}
                label="Full Payment"
              />
              <FormControlLabel
                value="emi"
                control={<Radio />}
                label="Monthly EMI"
              />
            </RadioGroup>
          </Grid>

          {/* EMI Months */}
          <Grid item xs={12} md={6}>
            <Typography fontWeight="bold" mb={1}>
              EMI Months
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="Number of Months"
              value={months}
              disabled={paymentType !== "emi"}
              onChange={(e) => setMonths(e.target.value)}
            />
          </Grid>

          {/* Advance */}
          <Grid item xs={12} md={6}>
            <Typography fontWeight="bold" mb={1}>
              Advance Amount
            </Typography>
            <TextField
              fullWidth
              label="Advance Amount (₹)"
              value={advance}
              disabled={paymentType !== "emi"}
              onChange={(e) => setAdvance(e.target.value)}
            />
          </Grid>

          {/* Submit */}
          <Grid item xs={12} textAlign="right">
            <Button
              variant="contained"
              sx={{
                bgcolor: "#008000",
                px: 5,
                height: 42,
                fontWeight: "bold",
                "&:hover": { bgcolor: "#006400" },
              }}
            >
              Save Payment
            </Button>
          </Grid>
        </Grid>
   </Grid>
    </Box>
  );
};

export default Payment;
