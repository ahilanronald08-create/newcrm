import { Pagination, Box, PaginationItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const steps = ["/addlead", "/preference", "/additional"];

const StepPagination = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize from localStorage
  const [maxStepReached, setMaxStepReached] = useState(() => {
    const savedStep = localStorage.getItem("maxStepReached");
    return savedStep ? Number(savedStep) : 1;
  });

  const currentStep = steps.indexOf(location.pathname) + 1;

  // Update maxStepReached when currentStep increases
  useEffect(() => {
    if (currentStep > 0 && currentStep > maxStepReached) {
      setMaxStepReached(currentStep);
      localStorage.setItem("maxStepReached", currentStep.toString());
    }
  }, [currentStep, maxStepReached]);

  // Debug logging (remove after testing)
  useEffect(() => {
    console.log("Current Step:", currentStep);
    console.log("Max Step Reached:", maxStepReached);
    console.log("Current Path:", location.pathname);
  }, [currentStep, maxStepReached, location.pathname]);

  const handleChange = (event, value) => {
    // Only allow navigation to steps that have been reached
    if (value <= maxStepReached) {
      navigate(steps[value - 1]);
    }
  };

  // If current path is not in steps array, don't render pagination
  if (currentStep === 0) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Pagination
        count={steps.length}
        page={currentStep}
        onChange={handleChange}
        renderItem={(item) => (
          <PaginationItem
            {...item}
            disabled={item.page > maxStepReached}
          />
        )}
        sx={{
          "& .MuiPaginationItem-root": {
            width: 40,
            height: 40,
            borderRadius: "50%",
            color: "#262c67",
            border: "1px solid #008000",
            fontWeight: "bold",
          },
          "& .Mui-selected": {
            backgroundColor: "#262c67 !important",
            color: "#ffffff",
            borderRadius: "50%",
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "#00800033",
          },
          "& .Mui-disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
            backgroundColor: "#f5f5f5",
          },
        }}
      />
    </Box>
  );
};

export default StepPagination;