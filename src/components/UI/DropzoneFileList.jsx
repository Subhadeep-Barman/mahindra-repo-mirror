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
    let attachments = [];
    
    if (name === "Special_adaptation") {
      attachments = Array.isArray(formData?.calibrationTeam?.engineAdaptation?.Special_adaptation)
        ? formData.calibrationTeam.engineAdaptation.Special_adaptation
        : [];
    } else if (team && name) {
      attachments = Array.isArray(formData[team]?.[name]) ? formData[team][name] : [];
    } else {
      attachments = Array.isArray(formData[name]) ? formData[name] : [];
    }
    
    console.log(`DropzoneFileList: getAttachments for ${name}:`, attachments);
    return attachments;
  };

  const attachment = getAttachments();

  // Fix: Get uploaded file count from verified files instead of attachment array
  // This ensures the count reflects actual uploaded files on the server
  const uploadedCount = verifiedFiles.length > 0 ? verifiedFiles.length : Array.isArray(attachment) ? attachment.length : 0;

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

  // Enhanced function to get file details with metadata
  const getFileDetailsWithMetadata = async () => {
    const { jobOrderId, testOrderId } = getJobAndTestOrderId();

    console.log(`DropzoneFileList: Getting file details for ${name} - JobOrder: ${jobOrderId}, TestOrder: ${testOrderId}`);

    try {
      setLoading(true);
      
      // First, try to get files with metadata from a more detailed endpoint
      let detailedFiles = [];
      
      try {
        const detailResponse = await axios.get(`${apiURL}/get_file_details`, {
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
        
        if (detailResponse.data.status === true && detailResponse.data.files) {
          detailedFiles = detailResponse.data.files;
          console.log(`DropzoneFileList: Got detailed file info for ${name}:`, detailedFiles);
        }
      } catch (detailError) {
        console.log(`DropzoneFileList: Detailed endpoint not available, falling back to basic check for ${name}`);
      }

      // Fallback to the basic check_files_GCP endpoint
      if (detailedFiles.length === 0) {
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

        console.log(`DropzoneFileList: Basic API Response for ${name}:`, response.data);

        if (response.data.status === true && response.data.files) {
          detailedFiles = response.data.files;
        }
      }

      if (detailedFiles.length > 0) {
        // Get attachment data from formData
        const attachmentData = getAttachments();

        // Transform API files with better metadata handling
        const transformedFiles = detailedFiles.map(file => {
          // If file is a string (just filename), try to find metadata from attachmentData
          if (typeof file === 'string') {
            const localFileData = attachmentData.find(localFile => 
              localFile.path === file || localFile.name === file || localFile.filename === file
            );
            
            return {
              path: file,
              size: localFileData?.size || localFileData?.file_size || 0,
              user: localFileData?.user || localFileData?.uploaded_by || localFileData?.creator || localFileData?.created_by || 'Unknown',
              upload_time: localFileData?.upload_time || localFileData?.created_on || localFileData?.timestamp || null
            };
          }
          
          // If file is already an object, use it with fallbacks
          const transformedFile = {
            path: file.path || file.filename || file.name || file,
            size: file.size || file.file_size || 0,
            user: file.user || file.uploaded_by || file.creator || file.created_by || 'Unknown',
            upload_time: file.upload_time || file.created_on || file.timestamp || file.modified_on || null
          };

          // If still missing metadata, try to find from attachmentData
          if (transformedFile.user === 'Unknown' || transformedFile.size === 0) {
            const localFileData = attachmentData.find(localFile => 
              localFile.path === transformedFile.path || 
              localFile.name === transformedFile.path || 
              localFile.filename === transformedFile.path
            );
            
            if (localFileData) {
              transformedFile.size = transformedFile.size || localFileData.size || localFileData.file_size || 0;
              transformedFile.user = transformedFile.user === 'Unknown' ? 
                (localFileData.user || localFileData.uploaded_by || localFileData.creator || 'Unknown') : 
                transformedFile.user;
              transformedFile.upload_time = transformedFile.upload_time || 
                localFileData.upload_time || localFileData.created_on || localFileData.timestamp || null;
            }
          }

          return transformedFile;
        });

        // Try to get file sizes for files with 0 size
        const filesWithSizes = await Promise.all(transformedFiles.map(async (file) => {
          if (file.size === 0) {
            try {
              // Attempt to get file size from server
              const sizeResponse = await axios.head(`${apiURL}/download_job_order_id/`, {
                params: {
                  job_order_id: jobOrderId,
                  test_order_id: testOrderId,
                  attachment_type: name,
                  filename: file.path,
                },
              });
              
              const contentLength = sizeResponse.headers['content-length'];
              if (contentLength) {
                file.size = parseInt(contentLength, 10);
              }
            } catch (sizeError) {
              console.log(`Could not get size for ${file.path}`);
            }
          }
          return file;
        }));

        console.log(`DropzoneFileList: Final transformed ${filesWithSizes.length} files for ${name}:`, filesWithSizes);
        setVerifiedFiles(filesWithSizes);
      } else {
        console.log(`DropzoneFileList: No files found for ${name}`);
        setVerifiedFiles([]);
      }
    } catch (error) {
      console.error(`DropzoneFileList: Error getting file details for ${name}:`, error);
      showSnackbar("Error loading file details", "warning");
      setVerifiedFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Run file verification when viewing files OR on component mount to get accurate count
  useEffect(() => {
    if (viewModalOpen) {
      getFileDetailsWithMetadata();
    }
  }, [viewModalOpen]);

  // Add effect to check files on component mount to get accurate file count
  useEffect(() => {
    console.log(`DropzoneFileList: Component mounted for ${name}, formData:`, formData);
    const { jobOrderId, testOrderId } = getJobAndTestOrderId();
    if (jobOrderId) {
      getFileDetailsWithMetadata();
    }
  }, []);  // Run once on mount

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


      // Fix: Change the endpoint to match your curl command
      const response = await axios.get(
        `${apiURL}/download_job_order_id/`,
        {
          params,
          responseType: "blob",
          headers: {
            'accept': 'application/json',
          },
        }
      );

      const disposition = response.headers["content-disposition"];
      const downloadedFileName = disposition
        ? disposition.split("filename=")[1].replace(/"/g, "")
        : fileName || "downloaded_file";

      // Create blob URL safely
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
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
              border: "2px solid",
              borderColor: buttonColor,
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.95rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              '&:hover': {
                boxShadow: `0 6px 20px ${hasFiles ? 'rgba(220, 53, 69, 0.6)' : 'rgba(0, 123, 255, 0.6)'}`,
                transform: "translateY(-2px)",
                backgroundColor: buttonHoverColor,
                borderColor: buttonHoverColor,
              },
              '&:active': {
                transform: "translateY(0px)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
              position: "relative",
              cursor: "pointer"
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
              border: "2px solid",
              borderColor: buttonColor,
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.95rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              '&:hover': {
                boxShadow: `0 6px 20px ${hasFiles ? 'rgba(220, 53, 69, 0.6)' : 'rgba(0, 123, 255, 0.6)'}`,
                transform: "translateY(-2px)",
                backgroundColor: buttonHoverColor,
                borderColor: buttonHoverColor,
              },
              '&:active': {
                transform: "translateY(0px)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
              position: "relative",
              cursor: "pointer"
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
          handleCloseDropzoneModal={() => {
            handleCloseModal();
            // Refresh file count after modal closes
            const { jobOrderId, testOrderId } = getJobAndTestOrderId();
            if (jobOrderId) {
              setTimeout(() => getFileDetailsWithMetadata(), 500); // Small delay to ensure server sync
            }
          }}
          onUpload={onUpload}
          originalJobOrderId={formData?.originalJobOrderId || originalJobOrderId}
          userRole={formData?.userRole || "ProjectTeam"} // Pass user role for permission handling
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
                          {file.user && file.user !== 'Unknown' ? `Uploaded by: ${file.user}` : ""}
                          {file.upload_time ? ` on ${new Date(file.upload_time).toLocaleString()}` : ""}
                          {(!file.user || file.user === 'Unknown') && !file.upload_time ? "File metadata not available" : ""}
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