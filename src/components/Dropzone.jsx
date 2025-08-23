import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  LinearProgress,
  Chip,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl
} from "@mui/material";
import axios from "axios";
import Spinner from "./UI/spinner"; // Ensure the path is correct
import useStore from "../store/useStore";
import {
  CloudUpload,
  Delete,
  Download,
  VerifiedUser,
  CheckCircle,
  HighlightOff
} from "@mui/icons-material";
import showSnackbar from "../utils/showSnackbar";

const formatSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Add helper function to truncate filenames
const truncateFilename = (filename) => {
  return filename.length > 30 ? filename.substring(0, 30) + '...' : filename;
};

const apiURL = import.meta.env.VITE_BACKEND_URL;
const CHUNK_SIZE = 64 * 1024 * 1024;

// Add allowed file extensions mapping for different upload types
const ALLOWED_EXTENSIONS_MAP = {
  // Test Order Form attachments
  default: [
    'atfx',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'xlsm',
    'xlsb',
    'ppt',
    'pptx',
    'txt',
    'csv',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'mp4',
    'avi',
    'mov',
    'wmv',
    'mkv',
    'hex',
    'zip',
    'a2l',
    'dbc',
    'exp',
    'exp64',
    'lab',
    'udl',
    'mdf',
    'mf4',
    'dat'
  ]
};

// Helper function to get file extension
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Helper function to check if file extension is allowed
const isFileExtensionAllowed = (filename, attachmentType) => {
  const extension = getFileExtension(filename);
  const allowedExtensions = ALLOWED_EXTENSIONS_MAP[attachmentType] || ALLOWED_EXTENSIONS_MAP.default;
  return allowedExtensions.includes(extension);
};

// Helper function to format extensions for display
const formatExtensionsForDisplay = (extensions) => {
  return extensions.map(ext => `.${ext}`).join(', ');
};

const Dropzone = ({
  openDropzoneModal,
  handleCloseDropzoneModal,
  name,
  maxFiles,
  formData,
  setFormData,
  team,
  id,
  setSubmitted,
  onUpload,
  originalJobOrderId,
  userRole // Add this prop
}) => {
  const [files, setFiles] = useState([]);
  const [newfiles, setNewfiles] = useState([]);
  const [newFilesandSize, setNewFilesandSize] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const { loading, setLoading } = useStore();
  const userCookies = useStore.getState().getUserCookieData();
  const jwtToken = userCookies.token; // Get JWT token from cookies
  const [uploaded, setUploaded] = useState(false);
  const [filename, setFilename] = useState("");
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef(null);
  const [headerTotalSize, setHeaderTotalSize] = useState(0);
  const [myJobOrderId, setMyJobOrder] = useState("");
  const [myTestOrderId, setMyTestOrder] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Add this helper function to sanitize Excel files
  const sanitizeExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      // Check file extension
      const fileName = file.name.toLowerCase();
      const validExcelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb', '.csv'];
      const isExcelFile = validExcelExtensions.some(ext => fileName.endsWith(ext));

      if (!isExcelFile) {
        // Not an Excel file, no need to sanitize
        resolve(file);
        return;
      }
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          // Check for malicious content in the first few bytes
          const headerBytes = new Uint8Array(event.target.result).slice(0, 100);
          const headerString = Array.from(headerBytes)
            .map(byte => String.fromCharCode(byte))
            .join('');

          // Check for potentially dangerous content
          const dangerousPatterns = [
            'ActiveX',
            'VBScript',
            'JScript',
            'DDEAUTO',
            'MSEXCEL',
            'powershell',
            'cmd.exe',
            'exec(',
            'shell',
            '<script',
            'IMPORTFROM',
            '=cmd|',
            '=cmd/',
            '=cmd',
            'IEX',
            'Invoke-Expression',
            'wget',
            'curl',
            'Net.WebClient',
            'DownloadString',
            'DownloadFile',
            'Start-Process',
            'iwr ',
            'WebRequest',
            '.ps1',
            '-enc',
            '-encodedcommand',
            '-e ',
            'bypass',
            '-nop',
            '-ExecutionPolicy',
            'FromBase64String',
            'ExecuteExcel4Macro'
          ];

          // More robust pattern detection using regex to catch obfuscated commands
          const containsDangerousContent = dangerousPatterns.some(pattern =>
            headerString.toLowerCase().includes(pattern.toLowerCase())
          );

          // Additional regex checks for common formula injection patterns
          //currently restricting from uploading excel files with formula injection
          const formulaRegexPatterns = [
            //   /=cmd\s*\/?['\/]/, // Catches =cmd/'/ variants
            //   /=\s*\w+\s*\(/,    // Catches formulas with functions
            //   /\|\s*\w+/,        // Catches piped commands
            //   /\+\s*\w+/,        // Catches concatenated commands
            //   /\&\s*\w+/,        // Catches concatenated commands
          ];

          const containsMaliciousFormula = formulaRegexPatterns.some(regex =>
            regex.test(headerString.toLowerCase())
          );

          if (containsDangerousContent || containsMaliciousFormula) {
            console.error(`Dangerous content detected in Excel file ${file.name}`);
            reject(new Error(`Excel file contains potentially malicious content`));
            return;
          }

          // Check more than just the first 100 bytes
          if (event.target.result.byteLength > 100) {
            // Sample data from various parts of the file
            const checkPoints = [
              0, // Start
              Math.floor(event.target.result.byteLength / 3), // ~1/3 through
              Math.floor(event.target.result.byteLength * 2 / 3) // ~2/3 through
            ];

            for (const offset of checkPoints) {
              const sampleSize = Math.min(1024, event.target.result.byteLength - offset);
              const sampleBytes = new Uint8Array(event.target.result).slice(offset, offset + sampleSize);
              const sampleString = Array.from(sampleBytes)
                .map(byte => String.fromCharCode(byte))
                .join('');

              if (dangerousPatterns.some(pattern => sampleString.toLowerCase().includes(pattern.toLowerCase())) ||
                formulaRegexPatterns.some(regex => regex.test(sampleString.toLowerCase()))) {
                console.error(`Dangerous content detected deeper in Excel file ${file.name}`);
                reject(new Error(`Excel file contains potentially malicious content`));
                return;
              }
            }
          }
          resolve(file);
        } catch (error) {
          console.error(`Error sanitizing Excel file: ${error}`);
          reject(new Error(`Error validating Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error(`Error reading Excel file`));
      };

      // Read the first chunk of the file to check headers
      const blob = file.slice(0, 8192); // Read first 8KB
      reader.readAsArrayBuffer(blob);
    });
  };

  // Fix: Always allow file selection, even if myJobOrderId is not set, but warn on upload
  const onTemplateSelect = async (e) => {
    const files = e.files || [];
    const validFiles = [];
    const invalidFiles = [];

    // Check if adding new files would exceed maxFiles limit
    if (maxFiles && files.length + newfiles.length + (formData[name]?.length || 0) > maxFiles) {
      showSnackbar(`Maximum ${maxFiles} files allowed`, "warning");
      return;
    }

    // Validate each file
    for (const file of files) {
      if (isFileExtensionAllowed(file.name, name)) {
        // For Excel files, perform additional security checks
        if (file.name.toLowerCase().match(/\.(xlsx|xls|xlsm|xlsb|csv)$/)) {
          try {
            await sanitizeExcelFile(file);
            validFiles.push(file);
          } catch (error) {
            showSnackbar(`${file.name}: ${error.message}`, "error");
            continue;
          }
        } else {
          validFiles.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    }

    // Show warning for invalid files
    if (invalidFiles.length > 0) {
      const allowedExtensions = ALLOWED_EXTENSIONS_MAP[name] || ALLOWED_EXTENSIONS_MAP.default;
      showSnackbar(
        `Invalid file type(s): ${invalidFiles.join(', ')}. Allowed types: ${formatExtensionsForDisplay(allowedExtensions)}`,
        "warning"
      );
    }

    // Check for duplicate files
    const uniqueFiles = validFiles.filter(
      (file) => !newfiles.some((existingFile) => existingFile.name === file.name)
    );

    // Update file lists and sizes
    if (uniqueFiles.length > 0) {
      const addedSize = uniqueFiles.reduce((total, file) => total + file.size, 0);
      setNewfiles((prev) => [...prev, ...uniqueFiles]);
      setHeaderTotalSize((prev) => prev + addedSize);
      // logger?.info?.(`Selected files: ${JSON.stringify(uniqueFiles)}`);
      setSubmitted?.(false);
      setIsValidated?.(false);
    }
  };
  // Helper to get correct job_order_id and test_order_id for upload
  const getJobAndTestOrderId = () => {
    const jobOrderId =
      originalJobOrderId ||
      formData?.originalJobOrderId ||
      formData?.form_id ||
      formData?.job_order_id ||
      (!id.startsWith("test") && id) ||
      "";

    // Prefer test_order_id from formData
    const testOrderId =
      formData?.test_id ||
      formData?.test_order_id ||
      formData?.testOrderId ||
      (id.startsWith("test") ? id : "");

    return { jobOrderId, testOrderId };
  };

  const uploadFileInChunks = async (file) => {
    // Use helper to get correct jobOrderId and testOrderId
    const { jobOrderId, testOrderId } = getJobAndTestOrderId();

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let sess_idt = null;

      // Show progress bar at 0% before starting
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formDataPayload = new FormData();
        formDataPayload.append("chunk", new File([chunk], file.name));
        formDataPayload.append("file_name", file.name);
        formDataPayload.append("chunk_index", chunkIndex);
        formDataPayload.append("total_chunks", totalChunks);
        // Use correct jobOrderId and testOrderId
        formDataPayload.append("job_order_id", jobOrderId);
        formDataPayload.append("test_order_id", testOrderId);
        formDataPayload.append("attachment_type", name);
        formDataPayload.append("user", userCookies?.userName || "unknown");
        // Always send sess_idt after first chunk
        if (sess_idt) {
          formDataPayload.append("sess_idt", sess_idt);
        }

        try {
          const response = await axios.post(
            `${apiURL}/upload_chunk`,
            formDataPayload,
            {
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                setUploadProgress((prev) => ({ ...prev, [file.name]: percent }));
              },
            }
          );
          // Set sess_idt after first response
          if (!sess_idt && response.data.sess_idt) {
            sess_idt = response.data.sess_idt;
          }

          if (response.data.completed) {
            const uploadedFile = [{
              path: file.name,
              size: file.size,
              user: response.data.user,
              upload_time: response.data.upload_time
            }];

            let updatedFormData = { ...formData };
            if (team) {
              const existing = formData[team]?.[name] || [];
              updatedFormData = {
                ...formData,
                [team]: {
                  ...formData[team],
                  [name]: [...existing, ...uploadedFile],
                },
              };
            } else {
              const existing = formData[name] || [];
              updatedFormData = {
                ...formData,
                [name]: [...existing, ...uploadedFile],
              };
            }
            setFormData(updatedFormData);
            setNewfiles((prev) => prev.filter((f) => f.name !== file.name));
            setFiles((prev) => [...uploadedFile, ...prev]);
            // Remove progress bar after file is fully uploaded
            setUploadProgress((prev) => {
              const updated = { ...prev };
              delete updated[file.name];
              return updated;
            });
          }
        } catch (error) {
          console.error(`Error uploading chunk ${chunkIndex}:`, error);
          showSnackbar(`Upload failed for ${file.name}: ${error.message}`, "error");
          // Remove progress bar on error
          setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[file.name];
            return updated;
          });
          return;
        }
      }
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      showSnackbar(`Upload failed for ${file.name}: ${error.message}`, "error");
      setNewfiles((prev) => prev.filter((f) => f.name !== file.name));
      // Remove progress bar on error
      setUploadProgress((prev) => {
        const updated = { ...prev };
        delete updated[file.name];
        return updated;
      });
      return;
    }
  };


  const onTemplateUpload = async () => {
    if (newfiles.length === 0) {
      showSnackbar("No new files to upload!", "warning");
      return;
    }
    setLoading(true);
    for (const file of newfiles) {
      await uploadFileInChunks(file);
    }
    setLoading(false);

    // Call the onUpload callback after upload completes
    if (onUpload) {
      await onUpload();
    }
  };

  const onTemplateRemove = async (file, isNewFile) => {
    if (isNewFile) {
      // Handle removal of newly selected files that haven't been uploaded yet
      setNewfiles((prevFiles) =>
        prevFiles.filter((f) => !(f.name === file.name && f.size === file.size))
      );

      setNewFilesandSize((prevFiles) =>
        prevFiles.filter((f) => !(f.path === file.name && f.size === file.size))
      );

      setHeaderTotalSize((prevTotalSize) => prevTotalSize - file.size);
    } else {
      try {
        setLoading(true);
        const res = await axios.delete(`${apiURL}/delete-file`, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          data: {
            job_order_id: myJobOrderId,
            test_order_id: myTestOrderId,
            attachment_type: name,
            filename: file.path,
          },
        });

        // Update both local state and parent component state
        const updatedFiles = files.filter(
          (f) => !(f.path === file.path && f.size === file.size)
        );
        setFiles(updatedFiles);

        // Remove all "Special_adaptation" and calibrationTeam/engineAdaptation logic
        if (team) {
          setFormData({
            ...formData,
            [team]: {
              ...formData[team],
              [name]: updatedFiles
            }
          });
        } else {
          setFormData({
            ...formData,
            [name]: updatedFiles
          });
        }

        setHeaderTotalSize((prevTotalSize) => prevTotalSize - file.size);
      } catch (error) {
        showSnackbar("File deletion failed. Please try again.", "warning");
        console.error("Delete error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear all selected files
  const onTemplateClear = () => {
    setNewFilesandSize([]);
    setNewfiles([]);
    setHeaderTotalSize(0);
  };

  const validateFiles = async () => {
    const formDatas = new FormData();
    newfiles.forEach((file) => {
      formDatas.append("files", file);
    });

    formDatas.append("job_order_id", myJobOrderId);
    formDatas.append("test_order_id", myTestOrderId);
    formDatas.append("attachment_type", name);

    // logger.info(
    //   `Validating files for job order ${myJobOrderId} and test order ${myTestOrderId} in attachment type ${name}`
    // );
    try {
      setLoading(true);
      setIsValidated(true);

      let mainUrl = import.meta.env.VITE_DATA_VALIDATION_URL;
      let url;

      if (jwtToken) {
        const path = `DBMRS/uploads/${import.meta.env.VITE_GCP_UPLOAD_FOLDER_NAME
          }/${myJobOrderId}/${myTestOrderId}/${name}`;
        url = `${mainUrl}report=${path}&file=${filename}`;

      } else {
        url = `${mainUrl}?username=admin&password=Dval@123&report=test-folder`;
        showSnackbar(
          "JWT Token is missing. Please log in to proceed.",
          "warning"
        );
      }
      window.open(url, "_blank");
      // logger.info(`Redirecting to data validation URL: ${url}`);

    } catch (error) {
      console.error("Validation error:", error);
      showSnackbar("Validation failed", "warning");
      // logger.error(
      //   `Validation failed for job order ${myJobOrderId} and test order ${myTestOrderId} in attachment type ${name}`
      // );
      console.error(
        `Validation failed for job order ${myJobOrderId} and test order ${myTestOrderId} in attachment type ${name}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFiles = async (fileName = "") => {
    try {
      setLoading(true);

      const params = {
        job_order_id: myJobOrderId,
        test_order_id: myTestOrderId,
        attachment_type: name,
      };

      if (fileName !== "") {
        params.filename = fileName;
      }

      const response = await axios.get(
        `${apiURL}/testorders/download_job_order_id/`,
        {
          params,
          responseType: "blob",
        }
      );

      const disposition = response.headers["content-disposition"];
      const downloadedFileName = disposition
        ? disposition.split("filename=")[1].replace(/"/g, "")
        : "downloaded_file";

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
      showSnackbar("Download failed, please try again.", "warning");
      console.error(
        `Download failed for job order ${myJobOrderId} and test order ${myTestOrderId} in attachment type ${name}`
      );
    } finally {
      setLoading(false);
    }
  };

  const checkFilesExist = async () => {
    // Use the helper to get correct IDs
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
        // Merge API files with formData to get user/upload_time
        const apiFiles = response.data.files || [];
        let formFiles = [];
        if (team) {
          formFiles = formData[team]?.[name] || [];
        } else {
          formFiles = formData[name] || [];
        }
        console.log("API files from backend:", apiFiles);
        console.log("Form files from formData:", formFiles);

        // For each API file, try to find matching file in formData for user/upload_time
        const transformedFiles = apiFiles.map(apiFile => {
          let fileObj = {};
          if (typeof apiFile === 'string') {
            // Try to find in formFiles by path/filename
            const match = formFiles.find(f => f.path === apiFile || f.filename === apiFile || f.name === apiFile);
            console.log("Matching form file for API file (string):", apiFile, match);
            fileObj = {
              path: apiFile,
              size: match?.size || 0,
              user: match?.user || match?.uploaded_by || 'Unknown',
              upload_time: match?.upload_time || match?.created_on || null,
              isValidated: match?.isValidated
            };
          } else {
            // If API returns object, merge with formFiles if possible
            const match = formFiles.find(f => f.path === (apiFile.path || apiFile.filename || apiFile.name));
            console.log("Matching form file for API file (object):", apiFile, match);
            fileObj = {
              path: apiFile.path || apiFile.filename || apiFile.name,
              size: apiFile.size || match?.size || 0,
              user: apiFile.user || apiFile.uploaded_by || match?.user || match?.uploaded_by || 'Unknown',
              upload_time: apiFile.upload_time || apiFile.created_on || match?.upload_time || match?.created_on || null,
              isValidated: apiFile.isValidated ?? match?.isValidated
            };
          }
          console.log("Transformed file object:", fileObj);
          return fileObj;
        });

        console.log("Transformed files to display:", transformedFiles);

        // Set the files to display
        setFiles(transformedFiles);

        // Calculate total size
        const _totalSize = transformedFiles.reduce(
          (acc, file) => acc + (file.size || 0),
          0
        );
        setHeaderTotalSize(_totalSize);
        setUploaded(true);

        // Update formData to sync with what's actually on the server
        let updatedFormData = { ...formData };
        if (team) {
          updatedFormData = {
            ...formData,
            [team]: {
              ...formData[team],
              [name]: transformedFiles,
            },
          };
        } else {
          updatedFormData = {
            ...formData,
            [name]: transformedFiles,
          };
        }
        console.log("Updated formData after merging files:", updatedFormData);
        setFormData(updatedFormData);

        if (name === "resultFileAttachment") {
          setIsValidated(true);
        }
      } else {
        console.log("No files found or status is false from backend.");
        setFiles([]);
        setHeaderTotalSize(0);
        setUploaded(false);
      }
    } catch (error) {
      console.error("Error checking if files exist:", error);
      setUploaded(false);
      setFiles([]);
      setHeaderTotalSize(0);
      console.error(
        `Error checking if files exist for job order ${jobOrderId} and test order ${testOrderId} in attachment type ${name}`
      );
    } finally {
      setLoading(false);
    }
  };

  const prevOpenDropzoneModal = useRef(false);

  useEffect(() => {
    // Only call checkFilesExist when modal is opened (false -> true)
    if (!prevOpenDropzoneModal.current && openDropzoneModal) {
      // Use the helper function to get correct IDs
      const { jobOrderId, testOrderId } = getJobAndTestOrderId();

      setMyJobOrder(jobOrderId);
      setMyTestOrder(testOrderId);

      // Check files if we have a job order ID (test order ID can be empty for some cases)
      if (jobOrderId) {
        checkFilesExist();
      } else {
        console.warn("No jobOrderId found, cannot check files");
      }
    }
    prevOpenDropzoneModal.current = openDropzoneModal;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDropzoneModal]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Optionally add drag over styles
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onTemplateSelect({ files: droppedFiles });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    onTemplateSelect({ files: selectedFiles });
  };

  const updateFileValidationStatus = (file, status) => {
    // Get the current files array based on attachment type
    let updatedFiles = [];
    let currentFiles = [];

    if (team) {
      currentFiles = formData[team]?.[name] || [];
    } else {
      currentFiles = formData[name] || [];
    }

    // Update the validation status of the specific file
    updatedFiles = currentFiles.map(f => {
      if (f.path === file.path) {
        return { ...f, isValidated: status };
      }
      return f;
    });

    // Update the formData based on attachment type
    if (team) {
      setFormData({
        ...formData,
        [team]: {
          ...formData[team],
          [name]: updatedFiles
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: updatedFiles
      });
    }
  };

  // Update file input to show allowed extensions
  const getAllowedExtensions = () => {
    const extensions = ALLOWED_EXTENSIONS_MAP[name] || ALLOWED_EXTENSIONS_MAP.default;
    return extensions.map(ext => `.${ext}`).join(',');
  };

  // Helper function to determine if user can upload/modify files
  const canModifyFiles = () => {
    // Project Team attachments: only Project Team can upload/modify
    if (team === 'projectTeam') {
      return userRole !== 'TestEngineer';
    }

    // Test Engineer attachments: only Test Engineers can upload/modify
    if (team === 'testTeam' || name.includes('test') || name.includes('result')) {
      return userRole === 'TestEngineer';
    }

    // Default: allow modification for non-Test Engineers
    return userRole !== 'TestEngineer';
  };

  // Helper function to determine if user can view files
  const canViewFiles = () => {
    // All users can view all files
    return true;
  };

  return (
    <>
      <Dialog
        open={openDropzoneModal}
        onClose={handleCloseDropzoneModal}
        maxWidth="md"
        fullWidth
      >
        <Spinner loading={loading} />
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          {canModifyFiles() ? "Upload Files" : "View Files"}
        </DialogTitle>
        <Box
          sx={{
            position: 'relative',
            pointerEvents: loading ? 'none' : 'auto',
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              }}
            />
          )}
          <DialogContent dividers sx={{ padding: "20px" }}>
            {/* Render Previously Uploaded Files */}
            {files.length > 0 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2
                  }}
                >
                  <Typography variant="h6">
                    Files Already Uploaded
                  </Typography>

                  <Tooltip title="Download All" arrow>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleDownloadFiles()}
                      disabled={files.length === 0}
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

                {files?.map((file, index) => (
                  <Box
                    key={index}
                    mb={1.5}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        borderColor: "#bdbdbd",
                      }
                    }}
                  >
                    {/* File info section */}
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderBottom: file.isValidated !== undefined ? "1px dashed #e0e0e0" : "none"
                      }}
                    >
                      {/* File icon and name */}
                      <Box display="flex" alignItems="center" flex={1}>
                        <CloudUpload
                          sx={{
                            fontSize: "1.8rem",
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
                                marginBottom: "2px",
                              }}
                            >
                              {truncateFilename(file.path)}
                            </Typography>
                          </Tooltip>
                          <Typography variant="body2" sx={{ color: "gray" }}>
                            {file.user ? `Uploaded by: ${file.user}` : ""}
                            {file.upload_time ? ` on ${new Date(file.upload_time).toLocaleString()}` : ""}
                          </Typography>
                        </Box>

                        {/* Validation status */}
                        {file.isValidated !== undefined && (
                          <Box ml={1}>
                            {file.isValidated ? (
                              <Tooltip title="Validated: Yes" arrow>
                                <CheckCircle sx={{ color: 'green', fontSize: '1.2rem' }} />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Validated: No" arrow>
                                <HighlightOff sx={{ color: 'red', fontSize: '1.2rem' }} />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* File Size */}
                      <Chip
                        label={formatSize(file.size)}
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "#ff7b00",
                          color: "#fff",
                          borderRadius: "16px",
                          height: "28px",
                          ml: 1
                        }}
                      />

                      {/* Action buttons */}
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{ ml: 2 }}
                      >
                        {/* Validate Button - only for calibration team with specific files */}
                        {canModifyFiles() && (
                          name === "resultFileAttachment" &&
                          formData.projectTeam === "calibration" &&
                          (file.path.endsWith(".csv") || file.path.endsWith(".atfx") || file.path.endsWith(".ATFx"))
                        ) && (
                            <Tooltip title="Validate file" arrow>
                              <Button
                                variant="contained"
                                color="info"
                                size="small"
                                onClick={() => {
                                  setFilename(file.path);
                                  validateFiles();
                                }}
                                sx={{
                                  minWidth: "40px",
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  mr: 1
                                }}
                              >
                                <VerifiedUser />
                              </Button>
                            </Tooltip>
                          )}

                        {/* Download Button - always available */}
                        <Tooltip title="Download file" arrow>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleDownloadFiles(file.path)}
                            sx={{
                              minWidth: "40px",
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              mr: 1
                            }}
                          >
                            <Download />
                          </Button>
                        </Tooltip>

                        {/* Delete Button - only if user can modify */}
                        {canModifyFiles() && (
                          <Tooltip title="Delete file" arrow>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => onTemplateRemove(file, false)}
                              sx={{
                                minWidth: "40px",
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%"
                              }}
                            >
                              <Delete />
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {/* Validation controls - only for result files and if user can modify */}
                    {canModifyFiles() && name === "resultFileAttachment" && (
                      <Box
                        sx={{
                          p: 1,
                          backgroundColor: "#f0f7ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, ml: 1 }}>
                          Validation Status:
                        </Typography>

                        <FormControl>
                          <RadioGroup
                            row
                            value={file.isValidated === undefined ? "" : (file.isValidated ? "yes" : "no")}
                            onChange={(e) => {
                              const value = e.target.value === "yes";
                              updateFileValidationStatus(file, value);
                            }}
                          >
                            <FormControlLabel
                              value="yes"
                              control={
                                <Radio
                                  size="small"
                                  sx={{
                                    color: '#4caf50',
                                    '&.Mui-checked': { color: '#4caf50' }
                                  }}
                                />
                              }
                              label={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: '#4caf50'
                                  }}
                                >
                                  Valid
                                </Typography>
                              }
                            />
                            <FormControlLabel
                              value="no"
                              control={
                                <Radio
                                  size="small"
                                  sx={{
                                    color: '#f44336',
                                    '&.Mui-checked': { color: '#f44336' }
                                  }}
                                />
                              }
                              label={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: '#f44336'
                                  }}
                                >
                                  Invalid
                                </Typography>
                              }
                            />
                          </RadioGroup>
                        </FormControl>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* File upload section - only show if user can modify */}
            {canModifyFiles() && (
              <>
                <br />
                <Typography variant="h6">Drop your Files</Typography>
                <Box
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  sx={{
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    color: "#aaa",
                    cursor: "pointer",
                    marginBottom: "20px",
                  }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <CloudUpload
                    style={{
                      fontSize: "3rem",
                      color: "#2d7eff",
                      marginBottom: "10px",
                    }}
                  />
                  <Typography variant="body1">
                    Drag and Drop Files Here or Click to Select
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    accept={getAllowedExtensions()}
                    onChange={handleFileChange}
                  />
                </Box>

                {/* Selected files for upload */}
                {newfiles.length > 0 && (
                  <Box>
                    {newfiles.map((file, index) => (
                      <Box key={index}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={1}
                          sx={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <Tooltip title={file.name} arrow placement="top">
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {truncateFilename(file.name)}
                            </Typography>
                          </Tooltip>

                          <Chip
                            label={formatSize(file.size)}
                            color="warning"
                            sx={{
                              fontWeight: "bold",
                              backgroundColor: "#ff7b00",
                              color: "#fff",
                              marginRight: "30px",
                              paddingLeft: "8px",
                            }}
                          />

                          <Button
                            startIcon={<Delete />}
                            size="small"
                            color="error"
                            onClick={() => onTemplateRemove(file, true)}
                          >
                          </Button>
                        </Box>
                        {uploadProgress[file.name] !== undefined && (
                          <LinearProgress
                            variant="determinate"
                            value={uploadProgress[file.name]}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Upload buttons */}
                {newfiles.length > 0 && (
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onTemplateUpload}
                      sx={{ mr: 2 }}
                    >
                      Upload
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={onTemplateClear}
                    >
                      Clear
                    </Button>
                  </Box>
                )}
              </>
            )}

            {/* Read-only message for users who can't modify */}
            {!canModifyFiles() && files.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="textSecondary">
                  No files uploaded yet. You have view-only access to these attachments.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleCloseDropzoneModal();
                setNewfiles([]);
                setNewFilesandSize([]);
                setHeaderTotalSize(0);
                setTotalSize(0);
              }}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default Dropzone;