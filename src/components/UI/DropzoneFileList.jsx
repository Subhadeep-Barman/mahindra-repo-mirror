import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import Dropzone from "../Dropzone";
import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";
import Cookies from "js-cookie";
import Spinner from './spinner'; // Ensure the path is correct
import showSnackbar from "../../utils/showSnackbar";
import { CloudUpload, Download } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const apiURL = import.meta.env.VITE_BACKEND_URL;

// Add helper function to truncate filenames
const truncateFilename = (filename) => {
  return filename.length > 30 ? filename.substring(0, 30) + '...' : filename;
};

const DropzoneFileList = ({
  buttonText,
  name,
  team,
  maxFiles,
  formData,
  setFormData,
  id,
  submitted,
  setSubmitted,
  openModal,
  handleOpenModal,
  handleCloseModal,
  disabled,
  formState = {},
  setFormState = {},
  onUpload = () => { },
  originalJobOrderId // <-- add this prop (optional, for clarity)
}) => {
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [verifiedFiles, setVerifiedFiles] = useState([]);

  const handleOpenViewModal = () => {
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
  };

  // Helper function to get attachments based on name and team
  const getAttachments = () => {
    if (name === "Special_adaptation") {
      return Array.isArray(formData?.calibrationTeam?.engineAdaptation?.Special_adaptation)
        ? formData.calibrationTeam.engineAdaptation.Special_adaptation
        : [];
    } else if (team && name) {
      return Array.isArray(formData[team]?.[name]) ? formData[team][name] : [];
    } else {
      return Array.isArray(formData[name]) ? formData[name] : [];
    }
  };

  const attachment = getAttachments();

  // Add uploaded file count
  const uploadedCount = Array.isArray(attachment) ? attachment.length : 0;

  const hasFiles = uploadedCount > 0;
  const buttonColor = hasFiles ? "#dc3545" : "#2D68C4"; // Red if has files, Blue if empty
  const buttonHoverColor = hasFiles ? "#c82333" : "#0056b3"; // Darker shades for hover

  const myJobOrderId = formData?.form_id
    ? formData?.form_id
    : formData?.job_order_id || (!id.startsWith("test") && id) || "";
  const myTestOrderId = formData?.test_id
    ? formData?.test_id
    : id.startsWith("test")
      ? id
      : "";

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper to get correct job_order_id and test_order_id for API calls
  const getJobAndTestOrderId = () => {
    const jobOrderId =
      formData?.originalJobOrderId ||
      formData?.form_id ||
      formData?.job_order_id ||
      (!id.startsWith("test") && id) ||
      "";
    const testOrderId =
      formData?.test_id ||
      formData?.test_order_id ||
      formData?.testOrderId ||
      (id.startsWith("test") ? id : "");
    return { jobOrderId, testOrderId };
  };

  // Check if files exist both in GCP and formData
  const checkFilesExist = async () => {
    const { jobOrderId, testOrderId } = getJobAndTestOrderId();

    try {
      setLoading(true);
      const response = await axios.get(`${apiURL}/check_files_GCP`, {
        params: {
          job_order_id: jobOrderId,
          test_order_id: testOrderId,
          attachment_type: name,
        },
        responseType: "json",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === true && response.data.files) {
        // Get attachment data
        const attachmentData = getAttachments();

        // Only keep files that exist in both the API response and attachmentData
        const apiFiles = response.data.files || [];
        const matchedFiles = attachmentData.filter(file =>
          apiFiles.some(apiFile => apiFile === file.path)
        );

        setVerifiedFiles(matchedFiles);
      } else {
        setVerifiedFiles([]);
      }
    } catch (error) {
      console.error("Error checking if files exist:", error);
      showSnackbar("Error checking files", "warning");
      setVerifiedFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Run file verification when viewing files
  useEffect(() => {
    if (viewModalOpen) {
      checkFilesExist();
    }
  }, [viewModalOpen]);

  const handleDownloadFiles = async (fileName = "") => {
    // Use the helper function to get correct job_order_id and test_order_id
    const { jobOrderId, testOrderId } = getJobAndTestOrderId();

    try {
      setLoading(true);

      const params = {
        job_order_id: jobOrderId,
        test_order_id: testOrderId,
        attachment_type: name,
      };

      if (fileName !== "") {
        params.filename = fileName;
      }

      // First try to get a signed URL (for single file downloads)
      const response = await axios.get(
        `${apiURL}/download_job_order_id/`,
        {
          params,
        }
      );

      // Check if the response contains a signed URL (for single file downloads)
      if (response.data && response.data.signed_url) {
        // Use the signed URL for direct download
        const downloadLink = document.createElement("a");
        downloadLink.href = response.data.signed_url;
        downloadLink.target = "_blank"; // Open in new tab to trigger download from signed URL
        downloadLink.style.display = "none";
        
        try {
          document.body.appendChild(downloadLink);
          downloadLink.click();
        } finally {
          document.body.removeChild(downloadLink);
        }
        
        showSnackbar("Download started!", "success");
      } else {
        // For multiple files or legacy response format (zip file)
        const blobResponse = await axios.get(
          `${apiURL}/download_job_order_id/`,
          {
            params,
            responseType: "blob",
            headers: {
              'accept': 'application/json',
            },
          }
        );

        const disposition = blobResponse.headers["content-disposition"];
        const downloadedFileName = disposition
          ? disposition.split("filename=")[1].replace(/"/g, "")
          : fileName || "downloaded_file";

        // Create blob URL safely
        const blob = new Blob([blobResponse.data], {
          type: blobResponse.headers["content-type"] || "application/octet-stream",
        });

        // Use more secure download method
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // For IE
          window.navigator.msSaveOrOpenBlob(blob, downloadedFileName);
        } else {
          // For modern browsers
          const blobUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");

          // Set link properties
          downloadLink.href = blobUrl;
          downloadLink.download = downloadedFileName;
          downloadLink.style.display = "none";

          // Download file and cleanup
          try {
            // Use click() directly without appendChild
            downloadLink.click();
          } finally {
            // Cleanup
            URL.revokeObjectURL(blobUrl);
          }
        }
        
        showSnackbar("Download successful!", "success");
      }
    } catch (error) {
      console.error("Download error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // More specific error messages
      if (error.response?.status === 404) {
        showSnackbar("File not found on server", "error");
      } else if (error.response?.status === 403) {
        showSnackbar("Access denied", "error");
      } else {
        showSnackbar("Download failed, please try again.", "warning");
      }

      console.error(
        `Download failed for job order ${jobOrderId} and test order ${testOrderId} in attachment type ${name}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button Section */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          marginRight: "0.5rem",
          marginTop: "1rem",
        }}
      >
        {!disabled && (
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{
              width: "100%",
              justifyContent: "center",
              textTransform: "none",
              marginBottom: "0.5rem",
              height: "50px",
              backgroundColor: buttonColor,
              color: "#fff",
              '&:hover': {
                boxShadow: `0 6px 20px ${hasFiles ? 'rgba(220, 53, 69, 0.6)' : 'rgba(0, 123, 255, 0.6)'}`,
                transform: "translateY(-2px)",
                backgroundColor: buttonHoverColor,
              },
              transition: "all 0.3s ease",
              position: "relative"
            }}
            disabled={disabled}
          >
            <CloudUpload
              style={{
                fontSize: "2rem",
                color: "#FFFFFF ",
                marginBottom: "5px",
                marginRight: "10px",
              }}
            />
            {buttonText}
            {/* Show uploaded file count */}
            <Chip
              label={uploadedCount}
              size="small"
              sx={{
                ml: 2,
                backgroundColor: "#fff", // white background
                color: uploadedCount === 0 ? "#333" : "#000000",
                fontWeight: "bold",
                borderRadius: "50%",     // make it circular
                width: 28,
                height: 28,
                minWidth: 0,
                ".MuiChip-label": {
                  padding: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }
              }}
            />
          </Button>
        )}
        {disabled && (
          <Button
            variant="contained"
            color={uploadedCount === 0 ? "inherit" : "primary"}
            onClick={handleOpenViewModal}
            sx={{
              width: "100%",
              justifyContent: "center",
              textTransform: "none",
              marginBottom: "0.5rem",
              height: "50px",
              backgroundColor: buttonColor,
              color: "#fff",
              '&:hover': {
                boxShadow: `0 6px 20px ${hasFiles ? 'rgba(220, 53, 69, 0.6)' : 'rgba(0, 123, 255, 0.6)'}`,
                transform: "translateY(-2px)",
                backgroundColor: buttonHoverColor,
              },
              transition: "all 0.3s ease",
              position: "relative"
            }}
          >
            {buttonText}
            <VisibilityIcon
              style={{
                fontSize: "1.5rem",
                color: "#FFFFFF",
                marginBottom: "1px",
                marginLeft: "10px",
              }}
            />
            {/* Show uploaded file count */}
            <Chip
              label={uploadedCount}
              size="small"
              sx={{
                ml: 2,
                backgroundColor: "#fff",
                color: hasFiles ? "#dc3545" : "#007bff", // Red text if has files, Blue if empty
                fontWeight: "bold",
                borderRadius: "50%",
                width: 28,
                height: 28,
                minWidth: 0,
                border: `2px solid ${hasFiles ? "#dc3545" : "#007bff"}`, // Matching border
                ".MuiChip-label": {
                  padding: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }
              }}
            />
          </Button>
        )}
        <Dropzone
          name={name}
          team={team}
          maxFiles={maxFiles}
          formData={formData}
          setFormData={setFormData}
          id={id}
          setSubmitted={setSubmitted}
          openDropzoneModal={openModal}
          handleCloseDropzoneModal={handleCloseModal}
          onUpload={onUpload}
          originalJobOrderId={formData?.originalJobOrderId || originalJobOrderId}
        // ^ Pass originalJobOrderId from formData or prop
        />
      </Box>
      <Box
        sx={{
          marginTop: "1rem",
          gap: "0.5rem",
        }}
      >
        <Dialog
          open={viewModalOpen}
          onClose={handleCloseViewModal}
          fullWidth
          maxWidth="md"
        >
          {loading && <Spinner loading={loading} />}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              backgroundColor: '#f0f0f0',
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#333',
                ml: 1
              }}
            >
              Uploaded Files
            </Typography>
            <Tooltip title="Download All" arrow>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDownloadFiles()}
                disabled={verifiedFiles.length === 0}
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Download sx={{ fontSize: "1.25rem" }} />
              </Button>
            </Tooltip>
          </Box>

          <DialogContent
            dividers
            sx={{
              padding: "20px",
              backgroundColor: '#fafafa'
            }}
          >
            {verifiedFiles?.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "200px",
                  backgroundColor: '#f0f0f0',
                  borderRadius: 2
                }}
              >
                <CloudUpload
                  sx={{
                    fontSize: "4rem",
                    color: hasFiles ? '#dc3545' : '#007bff'
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    ml: 2,
                    color: '#666'
                  }}
                >
                  No files uploaded
                </Typography>
              </Box>
            ) : (
              <Box>
                {verifiedFiles?.map((file, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                    sx={{
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" flex={1}>
                      <CloudUpload
                        sx={{
                          fontSize: "2rem",
                          color: "#2d7eff",
                          marginRight: "1rem",
                        }}
                      />
                      <Box>
                        <Tooltip title={file.path} arrow placement="top">
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: "#333",
                              marginBottom: "4px",
                            }}
                          >
                            {truncateFilename(file.path)}
                          </Typography>
                        </Tooltip>
                        {/* Show user and upload time if available */}
                        <Typography variant="body2" sx={{ color: "gray" }}>
                          {file.user ? `Uploaded by: ${file.user}` : ""}
                          {file.upload_time ? ` on ${new Date(file.upload_time).toLocaleString()}` : ""}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={formatSize(file.size)}
                      color="warning"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#ff7b00",
                        color: "#fff",
                        marginRight: "1rem",
                        padding: "8px",
                      }}
                    />

                    <Button
                      type="button"
                      startIcon={<Download />}
                      variant="contained"
                      color="primary"
                      onClick={() => handleDownloadFiles(file.path)}
                      sx={{
                        px: 2,
                        py: 1
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseViewModal}
              variant="outlined"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default DropzoneFileList;