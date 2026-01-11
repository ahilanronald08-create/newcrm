import { Pagination, Box, PaginationItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const steps = ["/addlead", "/preference", "/additional"];

const StepPagination = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentStep = steps.indexOf(location.pathname) + 1;

  const [maxStepReached, setMaxStepReached] = useState(1);

  // Update maxstep reached
  useEffect(() => {
    if (currentStep > maxStepReached) {
      setMaxStepReached(currentStep);
      localStorage.setItem("maxStepReached", currentStep);
    }
  }, [currentStep]);

  // Load stored progress
  useEffect(() => {
    const savedStep = Number(localStorage.getItem("maxStepReached"));
    console.log(savedStep)
    if (savedStep) {
      setMaxStepReached(savedStep);
    }
  }, []);

  const handleChange = (event, value) => {
    if (value <= maxStepReached) {
      navigate(steps[value - 1]);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Pagination
        count={steps.length}
        page={currentStep}
        onChange={handleChange}
        shape="rounded"
        renderItem={(item) => (
          <PaginationItem
            {...item}
            disabled={item.page > maxStepReached}
          />
        )}
        sx={{
          "& .MuiPaginationItem-root": {
            color: "#262c67",
            borderColor: "#008000",
          },
          "& .Mui-selected": {
            backgroundColor: "#262c67 !important",
            color: "#ffffff",
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "#00800033",
          },
        }}
      />
    </Box>
  );
};

export default StepPagination;
