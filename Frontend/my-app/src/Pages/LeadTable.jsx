import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Visibility, Edit } from '@mui/icons-material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const LeadTable = ({ filters = {} }) => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const colRef = collection(db, 'userlead');
        const conditions = [];

        if (filters.leadStatus) conditions.push(where('leadStatus', '==', filters.leadStatus));
        if (filters.graduationyear) conditions.push(where('graduationyear', '==', filters.graduationyear));
        if (filters.courseinterested) conditions.push(where('preferredcourse', '==', filters.courseinterested));
        if (filters.modeoflearning) conditions.push(where('modeoflearning', '==', filters.modeoflearning));
        if (filters.fullName) conditions.push(where('fullName', '==', filters.fullName));
        if (filters.phonenumber) conditions.push(where('phonenumber', '==', filters.phonenumber));

        const q = conditions.length > 0 ? query(colRef, ...conditions) : colRef;
        const querySnapshot = await getDocs(q);

        let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


        // Name filter - ignore spaces and case (search by fullName)
        if (filters.name?.trim()) {
          const nameInput = filters.name.replace(/\s+/g, '').toLowerCase();
          data = data.filter(lead =>
            lead.fullName &&
            lead.fullName.replace(/\s+/g, '').toLowerCase().includes(nameInput)
          );
        }

        // Phone filter - remove non-numeric characters and do partial match
        if (filters.phonenumber?.trim()) {
          const numberInput = filters.phonenumber.replace(/\D/g, '');
          data = data.filter(lead =>
            lead.phonenumber &&
            lead.phonenumber.replace(/\D/g, '').includes(numberInput)
          );
        }

     
        data = data.filter((doc) => {
          const date = new Date(doc.firstContactDate?.toDate?.() || doc.firstContactDate || '');

          // Create start and end date objects
          const start = filters.startdate ? new Date(filters.startdate) : null;
          const end = filters.enddate ? new Date(filters.enddate) : null;

          // Set times
          if (start) start.setHours(0, 0, 0, 0); // Start at midnight
          if (end) end.setHours(23, 59, 59, 999); // End of the day

          console.log("Start Date =", start);
          console.log("End Date =", end);

          if (start && date < start) return false;
          if (end && date > end) return false;
          return true;
        });


        setLeads(data);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      }
    };

    fetchLeads();
  }, [filters]);

  return (
    <Box sx={{ minHeight: '100vh', width: '100%' }}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#853A93', height: '60px' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>S No</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>Phone Number</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>Preferred Course</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>Next Follow-up</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>Last Updated</TableCell>
              <TableCell sx={{ color: 'white', textAlign: 'left', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <TableRow key={lead.id}>
                  <TableCell sx={{ textAlign: 'left',fontWeight:'bold' }}>{index + 1}</TableCell>
                  <TableCell sx={{ textAlign: 'left',fontWeight:'bold' }}>{lead.fullName || '-'}</TableCell>
                  <TableCell sx={{ textAlign: 'left',fontWeight:'bold' }}>{lead.phone || '-'}</TableCell>
                  <TableCell sx={{ textAlign: 'left',fontWeight:'bold' }}>{lead.preferredcourse || '-'}</TableCell>
                  <TableCell sx={{ textAlign: 'left',fontWeight:'bold' }}>
                    <Typography fontWeight="bold">{lead.leadStatus || '-'}</Typography>
                    <Typography variant="caption">{lead.note || ''}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'red', fontWeight: 'bold', textAlign: 'left' }}>
                    {lead.nextFollowUpDate || '-'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'left',fontWeight:'bold' }}>
                    <Typography variant="caption" sx={{fontWeight:'bold'}}>
                      <span style={{color:'gray',fontWeight:'lighter'}}> FCD : </span>{lead.nextFollowUpDate || '-'}
                      </Typography>
                    <br />
                    <Typography variant="caption"sx={{fontWeight:'bold'}}>
                      <span style={{color:'gray',fontWeight:'lighter'}}>LCD : </span> {lead.lastupdate || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>
                    <IconButton><Visibility fontSize="small" /></IconButton>
                    <IconButton><Edit fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">No leads found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeadTable;





