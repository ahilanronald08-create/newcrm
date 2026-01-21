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
  TablePagination,
  TextField,
  MenuItem,
  CircularProgress,
  Modal,
  Chip,
  Divider,
  Tooltip,
  LinearProgress,
  Stack,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { 
  Download, 
  Visibility, 
  Edit, 
  CheckCircle,
  Cancel,
  Schedule,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import onlineIcon from "../assets/online.png";
import offlineIcon from "../assets/offline.png";

const API_URL = "http://localhost:5000/api";

const Sales = () => {
  const navigate = useNavigate();



  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedPaymentType, setSelectedPaymentType] = useState("all");
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Monthly payment modal states
  const [monthlyPaymentModal, setMonthlyPaymentModal] = useState(false);
  const [selectedEMIPayment, setSelectedEMIPayment] = useState(null);
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const formatAmount = (value) => {
    if (value === null || value === undefined) return "0";
    return Number(value).toLocaleString("en-IN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    
    const formattedDate = date.toLocaleDateString("en-IN", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-IN", timeOptions);
    
    return `${formattedDate} at ${formattedTime}`;
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [selectedTab, selectedPaymentType]);
 const handleEdit = (lead) => {
   navigate("/additional", {
  state: {
    userId: lead._id,
    isEdit: true
  }
});

  };
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      alert("Session expired. Please login again.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (p) => {
    const fee = Number(p.courseFee || 0);
    const adv1 = Number(p.advance || 0);
    const adv2 = p.advanceTwoStatus === "paid" ? Number(p.advanceTwo || 0) : 0;
    const monthlyTotal = (p.monthlyPayments || []).reduce((sum, mp) => sum + Number(mp.amount || 0), 0);
    
    return Math.max(fee - adv1 - adv2 - monthlyTotal, 0);
  };

  const calculateMonthlyEMI = (p) => {
    if (p.paymentType !== "emi" || !p.months) return "-";
    return (calculateBalance(p) / p.months).toFixed(2);
  };

  const calculateProgress = (p) => {
    const fee = Number(p.courseFee || 0);
    const adv1 = Number(p.advance || 0);
    const adv2 = p.advanceTwoStatus === "paid" ? Number(p.advanceTwo || 0) : 0;
    const monthlyTotal = (p.monthlyPayments || []).reduce((sum, mp) => sum + Number(mp.amount || 0), 0);
    const totalPaid = adv1 + adv2 + monthlyTotal;
    return fee > 0 ? Math.round((totalPaid / fee) * 100) : 0;
  };

  const getTotalPaid = (p) => {
    const adv1 = Number(p.advance || 0);
    const adv2 = p.advanceTwoStatus === "paid" ? Number(p.advanceTwo || 0) : 0;
    const monthlyTotal = (p.monthlyPayments || []).reduce((sum, mp) => sum + Number(mp.amount || 0), 0);
    return adv1 + adv2 + monthlyTotal;
  };

  const handleOpenMonthlyPayment = (payment) => {
    setSelectedEMIPayment(payment);
    setMonthlyAmount("");
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod("cash");
    setTransactionId("");
    setMonthlyPaymentModal(true);
  };

  const handleAddMonthlyPayment = async () => {
    if (!monthlyAmount || monthlyAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const balance = calculateBalance(selectedEMIPayment);
    if (Number(monthlyAmount) > balance) {
      alert(`Amount cannot exceed balance of ₹${formatAmount(balance)}`);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const payload = {
        paymentId: selectedEMIPayment._id,
        amount: Number(monthlyAmount),
        paymentDate: paymentDate,
        paymentMethod: paymentMethod,
        transactionId: paymentMethod === "gpay" ? transactionId : undefined,
      };

      const res = await axios.post(
        `${API_URL}/payments/monthly`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        alert("Monthly payment added successfully!");
        setMonthlyPaymentModal(false);
        fetchPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const tabMatch =
      selectedTab === "all" ||
      p?.leadId?.modeoflearning === selectedTab;

    const typeMatch =
      selectedPaymentType === "all" ||
      p.paymentType === selectedPaymentType;

    return tabMatch && typeMatch;
  });

  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" align="center" fontWeight="bold" mb={2}
       color="#262c67"
       sx={{
         fontSize: { xs: "24px", sm: "30px", md: "40px" }
       }}>
        Sales
      </Typography>

      <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} centered>
        <Tab value="all" label={`All (${payments.length})`} />
        <Tab
          value="Online"
          label={
            <Box display="flex" gap={1}>
              <img src={onlineIcon} width={16} alt="" /> Online
            </Box>
          }
        />
        <Tab
          value="Offline"
          label={
            <Box display="flex" gap={1}>
              <img src={offlineIcon} width={16} alt="" /> Offline
            </Box>
          }
        />
      </Tabs>

      <Box mt={2} display="flex" justifyContent="space-between">
        <TextField
          select
          size="small"
          value={selectedPaymentType}
          onChange={(e) => setSelectedPaymentType(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="full">Full</MenuItem>
          <MenuItem value="emi">Monthly</MenuItem>
        </TextField>

        <Button variant="outlined"
         startIcon={<Download />}
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
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }} >
        <Table size="small">
          <TableHead sx={{ bgcolor: "green" }} >
            <TableRow>
              {[
                "S.No",
                "Name",
                "Phone",
                "Course",
                "Fee",
                "Type",
                "Adv 1",
                "Adv 2",
                "Balance",
                "Monthly",
                "Action",
              ].map((h) => (
                <TableCell key={h} sx={{ color: "#fff", fontWeight: "bold" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedPayments.map((p, i) => (
              <TableRow key={p._id} hover>
                <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                <TableCell>{p.leadId?.fullName}</TableCell>
                <TableCell>{p.leadId?.phone}</TableCell>
                <TableCell>{p.course}</TableCell>
                <TableCell>₹{formatAmount(p.courseFee)}</TableCell>

                <TableCell>
                  <Chip
                    label={p.paymentType.toUpperCase()}
                    color={p.paymentType === "full" ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>

                <TableCell>₹{formatAmount(p.advance || 0)}</TableCell>
               
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    
                    {p.advanceTwo > 0 && (
                      <Tooltip title={p.advanceTwoStatus === "paid" ? "Paid" : "Unpaid"}>
                        {p.advanceTwoStatus === "paid" ? (
                          <CheckCircle sx={{ color: "green", fontSize: 20 }} />
                        ) : (
                          <Schedule sx={{ color: "orange", fontSize: 20 }} />
                        )}
                      </Tooltip>
                    )}
                    <Typography variant="body2">
                      ₹{formatAmount(p.advanceTwo || 0)}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell sx={{ color: "red", fontWeight: "bold" }}>
                  ₹{formatAmount(calculateBalance(p))}
                </TableCell>

                <TableCell>
                  {p.paymentType === "emi" && calculateBalance(p) > 0 ? (
                    <Chip
                      label="Add"
                      icon={<Add />}
                      color="info"
                      size="small"
                      onClick={() => handleOpenMonthlyPayment(p)}
                      sx={{ cursor: "pointer" }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <IconButton onClick={() => setSelectedPayment(p)}>
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                     handleEdit(p.leadId)
                    }
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredPayments.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
      </TableContainer>

      {/* Monthly Payment Modal */}
      <Modal open={monthlyPaymentModal} onClose={() => setMonthlyPaymentModal(false)}>
        <Box
          sx={{
            bgcolor: "#fff",
            p: 3,
            width: { xs: "90%", md: 500 },
            mx: "auto",
            mt: "10%",
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2} color="green">
            Add Monthly Payment
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {selectedEMIPayment && (
            <>
              <Box mb={2}>
                <Typography variant="h6" color="text.primary"  >
                  Student: {selectedEMIPayment.leadId?.fullName}
                </Typography>
                <Typography variant="h6" color="text.primary">
                  Course: {selectedEMIPayment.course}
                </Typography>
                <Typography variant="body1" color="red" fontWeight="bold">
                  Remaining Balance: ₹{formatAmount(calculateBalance(selectedEMIPayment))}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ min: 0, max: calculateBalance(selectedEMIPayment) }}
              />

              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="gpay">GPay/UPI</MenuItem>
                <MenuItem value="bank">Bank Transfer</MenuItem>
              </TextField>

              {paymentMethod === "gpay" && (
                <TextField
                  fullWidth
                  label="Transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleAddMonthlyPayment}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : "Add Payment"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={() => setMonthlyPaymentModal(false)}
                >
                  Cancel
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Modal>

      {/* Payment Details Modal */}
      <Modal open={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
        <Box
          sx={{
            bgcolor: "#fff",
            p: 3,
            width: { xs: "90%", md: 550 },
            mx: "auto",
            mt: "3%",
            borderRadius: 3,
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2} sx={{ color: "green" }}>
            Payment Details
          </Typography>
          
          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Typography variant="h6" color="black" fontWeight="bold">
              Student Information
            </Typography>
            <Typography variant="body1" fontWeight="500">
              Name: {selectedPayment?.leadId?.fullName}
            </Typography>
            <Typography variant="body1"> Phone: {selectedPayment?.leadId?.phone}</Typography>
            <Typography>
              Email: {selectedPayment?.leadId?.email || "-"}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Typography variant="h6" color="black" fontWeight="bold">
              Course Information
            </Typography>
            <Typography fontWeight="500">
              Course: {selectedPayment?.course}
            </Typography>
            <Typography>
              Course Fee: ₹{formatAmount(selectedPayment?.courseFee)}
            </Typography>
            <Typography>
              Payment Type:{" "}
              <Chip
                label={selectedPayment?.paymentType?.toUpperCase()}
                color={
                  selectedPayment?.paymentType === "full" ? "success" : "warning"
                }
                size="small"
              />
            </Typography>
            {selectedPayment?.paymentType === "emi" && (
              <Typography>
                Duration: {selectedPayment?.months} months
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Typography variant="h6" color="black" fontWeight="bold" mb={2}>
              Payment Information
            </Typography>

            {selectedPayment?.advance > 0 && (
              <Box
                sx={{
                  
                  p: 2,
                
                  borderRadius: 2,
                  mb: 2,
                  border: "1px solid #4caf50",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="green">
                      Advance Payment 1
                    </Typography>
                    <Typography variant="h6" color="">
                      ₹{formatAmount(selectedPayment?.advance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(selectedPayment?.advanceDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {selectedPayment?.advanceTwo > 0 && (
              <Box
                sx={{
                  // bgcolor:
                  //   selectedPayment?.advanceTwoStatus === "paid"
                  //     ? "#9bdd9f"
                  //     : "#d65d5d",
                  p: 2,
                  
                  borderRadius: 2,
                  mb: 2,
                  border:
                    selectedPayment?.advanceTwoStatus === "paid"
                      ? "1px solid #4caf50"
                      : "1px solid #ca1d09",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6" color={selectedPayment?.advanceTwoStatus === "paid" ? "green" : "#6a150c"}>
                        Advance Payment 2
                      </Typography>
                      <Chip
                        label={selectedPayment?.advanceTwoStatus === "paid" ? "PAID" : "UNPAID"}
                        size="small"
                        color={selectedPayment?.advanceTwoStatus === "paid" ? "success" : "warning"}
                      />
                    </Stack>
                    <Typography variant="h6">
                      ₹{formatAmount(selectedPayment?.advanceTwo)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(selectedPayment?.advanceTwoDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Monthly Payments History */}
            {selectedPayment?.monthlyPayments && selectedPayment.monthlyPayments.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle1" color="text.secondary" fontWeight="bold" mb={1}>
                  Monthly Payments ({selectedPayment.monthlyPayments.length})
                </Typography>
                {selectedPayment.monthlyPayments.map((mp, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid #216c97",
                      mb: 1,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" fontWeight="600" color="#216c97">
                          Payment #{idx + 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(mp.paymentDate)}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="">
                        ₹{formatAmount(mp.amount)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" color="text.secondary" fontWeight="bold">
                Payment Method
              </Typography>
              <Typography variant="h6" textTransform="uppercase">
                {selectedPayment?.paymentMethodDetails?.method}
              </Typography>
              
              {selectedPayment?.paymentMethodDetails?.method === "gpay" && (
                <Typography variant="body1" color="text.secondary">
                  Transaction ID: {selectedPayment?.paymentMethodDetails?.transactionId}
                </Typography>
              )}
              
              {selectedPayment?.paymentMethodDetails?.method === "bank" && (
                <Box mt={1}>
                  <Typography variant="body1" color="text.secondary">
                    Acc: {selectedPayment?.paymentMethodDetails?.bankDetails?.accountNumber}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    IFSC: {selectedPayment?.paymentMethodDetails?.bankDetails?.ifscCode}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Holder: {selectedPayment?.paymentMethodDetails?.bankDetails?.accountHolder}
                  </Typography>
                </Box>
              )}
              
              {selectedPayment?.paymentMethodDetails?.method === "cash" && (
                <Typography variant="h6" color="success">
                  Amount: ₹{formatAmount(selectedPayment?.paymentMethodDetails?.cashAmount)}
                </Typography>
              )}
            </Box>

            <Card sx={{  border: "1px solid #545669" }}>
              <CardContent>
                <Grid container spacing={2} direction="column">
                  <Grid item xs={6}>
                    <Typography variant="h6"  color="green">
                      Total Paid
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      ₹{formatAmount(selectedPayment && getTotalPaid(selectedPayment))}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6"  color="red">
                      Balance
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      ₹{formatAmount(selectedPayment && calculateBalance(selectedPayment))}
                    </Typography>
                  </Grid>
                  {selectedPayment?.paymentType === "emi" && (
                    <Grid item xs={12}>
                      <Typography variant="h6"  color="text.primary">
                        Monthly
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        ₹{formatAmount(selectedPayment && calculateMonthlyEMI(selectedPayment))}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => setSelectedPayment(null)}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Sales;