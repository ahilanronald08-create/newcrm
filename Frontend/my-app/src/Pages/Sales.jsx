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
} from "@mui/material";
import { Download, Visibility, Edit } from "@mui/icons-material";
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
  
  const formatAmount = (value) => {
    if (value === null || value === undefined) return "0";
    return Number(value).toLocaleString("en-IN");
  };

  // Format date and time
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

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [selectedTab, selectedPaymentType]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("PAYMENTS API RESPONSE 👉", res.data);

      if (res.data?.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error("FETCH PAYMENTS ERROR 👉", err);
      alert("Session expired. Please login again.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (p) => {
    const fee = Number(p.courseFee || 0);
    const paid = Number(p.advance || 0) + Number(p.advanceTwo || 0);
    return Math.max(fee - paid, 0);
  };

  const calculateMonthlyEMI = (p) => {
    if (p.paymentType !== "emi" || !p.months) return "-";
    return (calculateBalance(p) / p.months).toFixed(2);
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
      <Typography variant="h4" align="center" fontWeight="bold" mb={2}>
        Sales & Payment Details
      </Typography>

      {/* Tabs */}
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

      {/* Filters */}
      <Box mt={2} display="flex" gap={2}>
        <TextField
          select
          size="small"
          value={selectedPaymentType}
          onChange={(e) => setSelectedPaymentType(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="full">Full</MenuItem>
          <MenuItem value="emi">EMI</MenuItem>
        </TextField>

        <Button variant="outlined" startIcon={<Download />}>
          Export
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "green" }}>
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
                "EMI",
                "Action",
                
              ].map((h) => (
                <TableCell key={h} sx={{ color: "#fff" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedPayments.map((p, i) => (
              <TableRow key={p._id}>
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
                <TableCell>₹{formatAmount(p.advanceTwo || 0)}</TableCell>
                <TableCell sx={{ color: "red" }}>
                  ₹{formatAmount(calculateBalance(p))}
                </TableCell>
                <TableCell>{formatAmount(calculateMonthlyEMI(p))}</TableCell>

                <TableCell>
                  <IconButton onClick={() => setSelectedPayment(p)}>
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      navigate("/additional", {
                        state: { userId: p.leadId?._id },
                      })
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

      {/* Modal */}
      <Modal open={!!selectedPayment} onClose={() => setSelectedPayment(null)}>
        <Box
          sx={{
            bgcolor: "#fff",
            p: 3,
            width: 500,
            mx: "auto",
            mt: "5%",
            borderRadius: 2,
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2} sx={{color:"green"}}>
            Payment Details
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Student Information */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Student Information
            </Typography>
            <Typography fontWeight="500">
              Name: {selectedPayment?.leadId?.fullName}
            </Typography>
            <Typography>Phone: {selectedPayment?.leadId?.phone}</Typography>
            <Typography>
              Email: {selectedPayment?.leadId?.email || "-"}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Course Information */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
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
                EMI Duration: {selectedPayment?.months} months
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Payment Information */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Payment Information
            </Typography>
            
            {/* Advance 1 */}
            {selectedPayment?.advance > 0 && (
              <Box
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 1.5,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography fontWeight="500">
                  Advance Payment 1: ₹{formatAmount(selectedPayment?.advance)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDateTime(selectedPayment?.advanceDate)}
                </Typography>
              </Box>
            )}

            {/* Advance 2 */}
            {selectedPayment?.advanceTwo >=0 && (
              <Box
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 1.5,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography fontWeight="500">
                  Advance Payment 2: ₹{formatAmount(selectedPayment?.advanceTwo)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDateTime(selectedPayment?.advanceTwoDate)}
                </Typography>
              </Box>
            )}

            {/* Total Paid */}
            <Typography fontWeight="500" sx={{ mt: 1 }}>
              Total Paid: ₹
              {formatAmount(
                (selectedPayment?.advance || 0) +
                  (selectedPayment?.advanceTwo || 0)
              )}
            </Typography>

            {/* Balance */}
            <Typography color="error" fontWeight="bold">
              Balance: ₹
              {formatAmount(
                selectedPayment && calculateBalance(selectedPayment)
              )}
            </Typography>

            {/* Monthly EMI */}
            {selectedPayment?.paymentType === "emi" && (
              <Typography sx={{ mt: 1 }}>
                Monthly EMI: ₹
                {formatAmount(
                  selectedPayment && calculateMonthlyEMI(selectedPayment)
                )}
              </Typography>
            )}
          </Box>

          {/* <Divider sx={{ my: 2 }} />

          {/* Submission Date */}
          {/* <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Submitted on: {formatDateTime(selectedPayment?.createdAt)}
            </Typography>
          </Box> */} 

          <Button
            fullWidth
            sx={{ mt: 2, bgcolor: "green", color: "white" }}
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