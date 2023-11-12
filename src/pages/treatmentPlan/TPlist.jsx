import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Button, Modal, TextField, InputAdornment, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import TPForm from "./TPform"; 
import { Link } from 'react-router-dom';
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from '../../firebase.config';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import PageviewIcon from '@mui/icons-material/Pageview';


const TPList = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%', // Use a percentage to make it responsive
    maxWidth: 1000, // You can also set a maxWidth
    bgcolor: 'background.paper',
    boxShadow: 20,
    p: 4,
    borderRadius: 2, // Optional: if you want rounded corners
  };
  
  const [open, setOpen] = useState(false);

  const handleAddNewPatient = () => {
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
  };

    const [patientsData, setPatientsData] = useState([]);

    // New state for search text
    const [searchText, setSearchText] = useState('');

    // Function to handle the search input change
    const handleSearchChange = (event) => {
      setSearchText(event.target.value);
    };

    const handleDelete = async (id) => {
      try {
        await deleteDoc(doc(db, "treatmentPlan", id));
        setPatientsData(patientsData.filter((item) => item.id !== id));
      } catch (err) {
        console.log(err);
      }
    };

    const handleUpdateTP = (newPatient) => {
      setPatientsData((currentPatients) => {
        const updatedPatients = [...currentPatients, newPatient];
        updatedPatients.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB; // Ascending order
        });
        return updatedPatients;
      });
    };
    
    // Generate filtered rows based on search text
    const filteredRows = searchText
      ? patientsData.filter((row) => {
          // Check if fullName exists and is a string before calling toLowerCase
          return row.fullName && typeof row.fullName === 'string' && row.fullName.toLowerCase().includes(searchText.toLowerCase());
        })
      : patientsData;

      useEffect(() => {
        const fetchData = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, "treatmentPlan"));
            let data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            // Sort by dateAdded in ascending order
            data.sort((a, b) => {
              const dateA = new Date(a.dateAdded);
              const dateB = new Date(b.dateAdded);
              return dateA - dateB;
            });
            setPatientsData(data);
          } catch (error) {
            console.error("Error fetching patient data: ", error);
          }
        };
        
        fetchData();
      }, []);

      const actionColumn = [
        {
          field: "action",
          headerName: "Action",
          flex: 2,
          renderCell: (params) => {
            return (
              <Grid className="cellAction" container spacing={3} margin={2}>
              {/* more details */}
              <Grid>
              <Box display="flex" justifyContent="center" xs={6} >
              <Link to={`/TPlist/${params.id}`} style={{ textDecoration: 'none' }}>
                <Button
                className = "moreDetails"
                  variant="contained"
                  style={{
                    backgroundColor: colors.greenAccent[600],
                    color: colors.grey[100],
                  }}
                >
                  More Details
                </Button>
                </Link>
              </Box>
              </Grid>

              {/* Delete */}
              <Grid marginLeft="2vh">
              <Box display="flex" justifyContent="center" xs={6} >
              <Link to={`/TPlist/${params.id}`} style={{ textDecoration: 'none' }}>
                <Button 
                className = "deleteButton"
                startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="error"
                //  onClick={() => handleDelete(params.row.id)}
                >
                  DELETE
                </Button>
                </Link>
                </Box>
                </Grid>


              </Grid>     
  
            );
          },
        },
      ];

// table columns
  const columns = [
    {
      field: 'caseNumber',
      headerName: 'Case Number',
      flex: 1,
    },
    {
      field: 'fullName', // This should match the field name in your Firestore documents for the patient's full name
      headerName: 'Full Name',
      flex: 1,
    },
    {
      field: 'status',
      headerName: 'Case Status',
      flex: 1,
      renderCell: (params) => (
        <Typography
          style={{
            color: params.value === 'End' ? 'lightcoral' : 'lightgreen', 
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dateAdded',
      headerName: 'Date Added',
      flex: 1,
      // Add a custom formatter if necessary to format the date
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
        return valueFormatted;
      },
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => (
          // view
          <Box display="flex" justifyContent="center" xs={6} >
          <Link to={`/TPlist/${params.id}`} style={{ textDecoration: 'none' }}>
            <Button
            className = "view"
            startIcon={<PageviewIcon />}
              variant="contained"
              style={{
               
                color: colors.greenAccent[600]
              }}
            >
              VIEW
            </Button>
            </Link>
          </Box>
        ),
      },
    {
      field: 'edit',
      headerName: '',
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Link to={`/inventoryList/${params.id}`} style={{ textDecoration: 'none' }}>
          <Button 
                className = "editButton"
                startIcon={<EditIcon />}
                variant="outlined"
                color="success"
                //  onClick={() => handleEdit(params.row.id)}
                >
                  EDIT
          </Button>
          </Link>
        </Box>
      ),
    },
    {
      field: 'delete', 
      headerName: '',
      flex: 1,
      renderCell: (params) => (
      <Box  display="flex" justifyContent="center">
          <Button 
                className = "deleteButton"
                startIcon={<DeleteIcon />}
                variant="outlined"
                  color="error"
                  onClick={() => handleDelete(params.row.id)}
                >
                  DELETE
          </Button>
    </Box>
      ),
    },
  ];
  columns.forEach(column => {
    if(column.field === 'status') {
      column.sortable = true;
    }
  });

 return (
<Box sx={{ flexGrow: 1, height: '100%', p: 3 }}>
      <Header title="Treatment Plan" subtitle="Treatment Plan List of PedTB patients" />
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', // Align items vertically
        p: 2,
      }}>
        <TextField 
          placeholder="Search Patients" 
          variant="outlined" 
          value={searchText} 
          onChange={handleSearchChange}
          sx={{ width: 550, backgroundColor: colors.blueAccent[700] , marginLeft: theme.spacing(-2) }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddNewPatient}
          style={{ 
            backgroundColor: colors.greenAccent[600],
            color: colors.grey[100],
            height: '50px', // Adjust based on your theme's input height
            marginLeft: theme.spacing(2)
          }}
        >
          Add New Data
        </Button>
      </Box>

 {/* Modal for the TPform */}
      <Modal
        open={open}
        onClose={handleCloseForm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
      <TPForm handleCloseForm={handleCloseForm} handleUpdateTP={handleUpdateTP} />

        </Box>
      </Modal>

      <Box sx={{
          height: 650, // Adjust based on your layout
          width: '100%',
          '& .MuiDataGrid-root': {
            border: `1px solid ${colors.primary[700]}`,
            color: colors.grey[100],
            backgroundColor: colors.primary[400], // Background color for the DataGrid
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${colors.primary[700]}`,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${colors.primary[700]}`,
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
          },
          '& .MuiCheckbox-root': {
            color: colors.greenAccent[200],
          },
          '& .MuiDataGrid-toolbarContainer': {
            color: colors.grey[100],
          },
        }}>
        <DataGrid
          rows={filteredRows} // Use filteredRows here
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sortingMode="client"
        />

      </Box>
    </Box>
  );
};

export default TPList;