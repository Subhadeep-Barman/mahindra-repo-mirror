// src/store/useStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import CryptoJS from "crypto-js"; // Add this import

// --- Security Notes ---
// 1. For local storage on Android, use Device Administration API's setStorageEncryption (not applicable in web).
// 2. For SD Card storage, use javax.crypto (not applicable in web).
// 3. Ensure shared preferences are not MODE_WORLD_READABLE (not applicable in web).
// 4. Avoid hardcoded encryption keys; use env or user/session-based keys.

// AES encryption key (should be set in environment variable, not hardcoded)
const USER_COOKIE_ENCRYPTION_KEY = import.meta.env.VITE_USER_COOKIE_ENCRYPTION_KEY || "default_key_change_me";

// Helper functions for encryption/decryption
function encryptData(data) {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), USER_COOKIE_ENCRYPTION_KEY).toString();
  } catch (e) {
    return "";
  }
}
function decryptData(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, USER_COOKIE_ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (e) {
    return {};
  }
}

// Define initial default values for jobOrderFormData
const initialJobOrderFormData = {
  calibrationTeam: {
    projectTeam: "",
    employeeUserId: "",
    userName: "",
    timestamp: "",
    typeOfEngine: "",
    typeOfTest: "",
    engineCode: "",
    engineNo: "",
    projectCode: "",
    gateway: "",
    typeOfActivity: "",
    subcategoryOfActivity: [],
    engineHW: {},
    engineAdaptation: {},
    engineLimitation: {},
    engineComponentDetails: [],
    wbsCode: "",
    preferredTestBed: "",
    equipmentRequired: "",
    tentativeStartDate: null,
    tentativeEndDate: null,
    totalDuration: 0,
    ccMember: "",
    creatorRemark: "",
    userDetailsAndTimestamp: "",
    hodRemark: "",
    approvedByHOD: "",
  },
  testBedTeam: {
    employeeUserId: "",
    userName: "",
    timestamp: "",
    allocatedTestBed: "",
    priority: "",
    testBedStatus: "",
    approvedStartDate: null,
    approvedEndDate: null,
    epaDate: null,
    userDetailsAndTimestamp: "",
    epaRequired: "",
    rejectRemark: "",
    testBedEngineer: [],
  },
  epaTeam: {
    employeeUserId: "",
    epaDate: null,
    epaHodRemark: "",
    userName: "",
    timestamp: "",
    epaStatus: "",
    epaJobData: [],
    remark: "",
    userDetailsAndTimestamp: "",
  },
  extensionForm: {
    timestamp: "",
    remarks: "",
    extensionDays: 0,
    extensionHours: 0,
    extensionApprovedByHOD: "",
    extensionApprovedByAdmin: "",
    userDetailsAndTimestamp: "",
  },
  calibrationTeamClose: {
    timestamp: "",
    referenceTest: [],
    remarks: "",
    calibrationAttachments: [],
    userDetailsAndTimestamp: "",
    closingStatus: "",
    closingRemark: "",
    rating: 0,
  },
  testBedTeamClose: {
    timestamp: "",
    referenceTest: [],
    remarks: "",
    totalRunHours: 0,
    testbedAttachments: [],
    userDetailsAndTimestamp: "",
  },
  historyData: {},
  jobOrderStatus: "",
  cloneStatus: false,
  clonedFromJO: "",
  createdAt: "",
};

// Define initial default values for testOrderFormData
const initialTestOrderFormData = {
  projectTeam: "",
  typeOfTest: "",
  typeOfTestDetailed: "",
  a2lAttachment: [],
  tokenOfPerf: "",
  datasetAttachment: [],
  referenceDataAttachment: [],
  asap3LabelAttachment: [],
  experimentAttachment: [],
  perfPowerTestAttachment: [],
  perfDvpAttachment: [],
  testObjective: "",
  hardwareChangeRequired: "No",
  numberOfHardware: 0,
  typeOfHardware: "",
  reasonForHardwareChange: "",
  hardwareDetails: [],
  dvpAttachment: [],
  buildLevel: [],
  protocolAttachment: [],
  resultFileAttachment: [],
  datFileAttachment: [],
  iFileAttachment: [],
  testbedReportAttachment: [],
  teardownReportAttachment: [],
  oilAnalysisReportAttachment: [],
  wearAnalysisReportAttachment: [],
  runHrs: 0,
  testBedRemarks: "",
  calibrationTeamUserDetailsAndTimestamp: "",
  testBedTeamUserDetailsAndTimestamp: "",
  // historyData: {},
  testOutcome: "",
  closingRemarks: "",
  closingUserDetailsAndTimestamp: "",
  testOrderStatus: "",
  job_order_id: "",
  subcategoryOfActivity: [], // Added field for the Subcategory Of Activity
};

const useStore = create(
  persist(
    (set, get) => ({
      isDarkMode: localStorage.getItem("theme-dark") === "true",
      setIsDarkMode: (val) => {
        localStorage.setItem("theme-dark", val);
        set({ isDarkMode: val });
        if (val) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      },
      jobOrderFormData: { ...initialJobOrderFormData }, // Initialize with default values
      setJobOrderFormData: (newData) =>
        set((state) => ({
          jobOrderFormData: { ...state.jobOrderFormData, ...newData },
        })),

      restoreJobOrderFormData: () =>
        set(() => ({
          jobOrderFormData: { ...initialJobOrderFormData },
        })),

      // State variables with JobOrder prefix
      backendJobOrderID: "",
      backendTestOrderID: "",
      JobOrderEngineCodes: [],
      JobOrderProjectCodes: [],
      JobOrderTestTypes: [],
      JobOrderActivityTypes: [],
      JobOrderActivitySubcategories: [],
      JobOrderSelectedEngineType: "",
      JobOrderTestBeds: [],
      JobOrderPerfActivityTypes: [],
      JobOrderPerfActivitySubcategories: [],
      JobOrderReferenceTestIds: {},
      JobOrderOriginalEngineCodes: [],
      JobOrderOriginalProjectCodes: [],
      JobOrderOriginalActivityTypes: [],
      JobOrderOriginalTestbedEngineer: [],
      JobOrderOriginalActivitySubcategories: [],
      employeeToken: [],
      JobOrderSubmittedCalibrationAttachments: false,
      JobOrderSubmittedTestBedAttachments: false,
      initialJobOrderFormData: { ...initialJobOrderFormData },

      // Actions to set state variables
      setBackendJobOrderID: (id) => {
        set({ backendJobOrderID: id });
      },
      setBackendTestOrderID: (id) => {
        set({ backendTestOrderID: id });
      },
      setJobOrderEngineCodes: (codes) => set({ JobOrderEngineCodes: codes }),
      setJobOrderProjectCodes: (codes) => set({ JobOrderProjectCodes: codes }),
      setJobOrderTestTypes: (types) => set({ JobOrderTestTypes: types }),
      setJobOrderActivityTypes: (types) =>
        set({ JobOrderActivityTypes: types }),
      setJobOrderActivitySubcategories: (subcategories) =>
        set({ JobOrderActivitySubcategories: subcategories }),
      setJobOrderSelectedEngineType: (type) =>
        set({ JobOrderSelectedEngineType: type }),
      setJobOrderTestBeds: (beds) => set({ JobOrderTestBeds: beds }),
      setJobOrderPerfActivityTypes: (types) =>
        set({ JobOrderPerfActivityTypes: types }),
      setJobOrderPerfActivitySubcategories: (subcategories) =>
        set({ JobOrderPerfActivitySubcategories: subcategories }),
      setJobOrderReferenceTestIds: (ids) =>
        set({ JobOrderReferenceTestIds: ids }),
      setJobOrderOriginalEngineCodes: (codes) =>
        set({ JobOrderOriginalEngineCodes: codes }),
      setJobOrderOriginalProjectCodes: (codes) =>
        set({ JobOrderOriginalProjectCodes: codes }),
      setJobOrderOriginalActivityTypes: (types) =>
        set({ JobOrderOriginalActivityTypes: types }),
      setJobOrderOriginalTestbedEngineer: (types) =>
        set({ JobOrderOriginalTestbedEngineer: types }),
      setJobOrderOriginalActivitySubcategories: (subcategories) =>
        set({ JobOrderOriginalActivitySubcategories: subcategories }),
      setEmployeeToken: (tokens) => set({ employeeToken: tokens }),
      setJobOrderSubmittedCalibrationAttachments: (submitted) =>
        set({ JobOrderSubmittedCalibrationAttachments: submitted }),
      setJobOrderSubmittedTestBedAttachments: (submitted) =>
        set({ JobOrderSubmittedTestBedAttachments: submitted }),

      // Modal state variables
      JobOrderIsEngineAdaptationModalOpen: false,
      setJobOrderIsEngineAdaptationModalOpen: (isOpen) =>
        set({ JobOrderIsEngineAdaptationModalOpen: isOpen }),

      JobOrderIsEngineHWModalOpen: false,
      setJobOrderIsEngineHWModalOpen: (isOpen) =>
        set({ JobOrderIsEngineHWModalOpen: isOpen }),

      JobOrderIsEngineLimitationModalOpen: false,
      setJobOrderIsEngineLimitationModalOpen: (isOpen) =>
        set({ JobOrderIsEngineLimitationModalOpen: isOpen }),

      JobOrderIsExtensionModalOpen: false,
      setJobOrderIsExtensionModalOpen: (isOpen) =>
        set({ JobOrderIsExtensionModalOpen: isOpen }),

      JobOrderIsEngineComponentDetailsModalOpen: false,
      setJobOrderIsEngineComponentDetailsModalOpen: (isOpen) =>
        set({ JobOrderIsEngineComponentDetailsModalOpen: isOpen }),

      JobOrderIsMailModalOpen: false,
      setJobOrderIsMailModalOpen: (isOpen) =>
        set({ JobOrderIsMailModalOpen: isOpen }),

      JobOrderTriggerSave: false,
      setJobOrderTriggerSave: (trigger) =>
        set({ JobOrderTriggerSave: trigger }),

      // Generated Form ID state
      JobOrderGeneratedFormId: "",
      setJobOrderGeneratedFormId: (formId) =>
        set({ JobOrderGeneratedFormId: formId }),

      // State and functions for testOrderFormData
      testOrderFormData: { ...initialTestOrderFormData }, // Initialize with default values
      setTestOrderFormData: (newData) =>
        set((state) => ({
          testOrderFormData: { ...state.testOrderFormData, ...newData },
        })),
      restoreTestOrderFormData: () =>
        set(() => ({
          testOrderFormData: { ...initialTestOrderFormData },
        })),

      // Snackbar state and actions
      snackbarOpen: false,
      clone: false,
      snackbarMessage: "",
      snackbarSeverity: "info",
      snackbarDuration: 2000,
      setSnackbarOpen: (open) => set({ snackbarOpen: open }),
      setClone: (val) => set({ clone: val }),
      setSnackbarMessage: (message) => set({ snackbarMessage: message }),
      setSnackbarSeverity: (severity) => set({ snackbarSeverity: severity }),
      setSnackbarDuration: (duration) => set({ snackbarDuration: duration }),

      // Loading state and actions for downloadFile in FileList
      loading: false,
      setLoading: (loading) => set({ loading }),

      // State and actions for the selected tab in Dashboard
      selectedTab: 0,
      setSelectedTab: (tab) => set({ selectedTab: tab }),

      // New formId state and setter
      formId: "",
      setFormId: (id) => set({ formId: id }),
      createJobOrderClicked: false,
      setCreateJobOrderClicked: (clicked) =>
        set({ createJobOrderClicked: clicked }),
      createTestOrderClicked: false,
      setCreateTestOrderClicked: (clicked) =>
        set({ createTestOrderClicked: clicked }),
      // New state for user cookie data instead of using Cookies
      userCookies: {},
      setUserCookieData: (data) => set({ userCookies: data }),
      getUserCookieData: () => {
        return get().userCookies;
      },
      clearUserCookieData: () => set({ userCookies: {} }), // Add this function

      // DataGrid filter models for persistence across tab switches
      userFilterModel: { items: [] },
      setUserFilterModel: (model) => set({ userFilterModel: model }),

      jobOrderFilterModel: { items: [] },
      setJobOrderFilterModel: (model) => set({ jobOrderFilterModel: model }),

      testOrderFilterModel: { items: [] },
      setTestOrderFilterModel: (model) => set({ testOrderFilterModel: model }),

      // --- Vehicle/Project/Domain Options State ---
      projectOptions: [],
      setProjectOptions: (options) => set({ projectOptions: options }),
      vehicleModelOptions: [],
      setVehicleModelOptions: (options) =>
        set({ vehicleModelOptions: options }),
      domainOptions: [],
      setDomainOptions: (options) => set({ domainOptions: options }),
      // --- Async Fetch Functions ---
      fetchProjects: async () => {
        try {
          const apiUrl = import.meta.env.VITE_BACKEND_URL;
          const response = await axios.get(`${apiUrl}/project-codes`);
          set({ projectOptions: response.data });
          return response.data;
        } catch (error) {
          set({ projectOptions: [] });
          return [];
        }
      },
      fetchVehicleModels: async () => {
        try {
          const apiUrl = import.meta.env.VITE_BACKEND_URL;
          const response = await axios.get(`${apiUrl}/vehicle-models`);
          set({ vehicleModelOptions: response.data });
          return response.data;
        } catch (error) {
          set({ vehicleModelOptions: [] });
          return [];
        }
      },
      fetchDomains: async () => {
        try {
          const apiUrl = import.meta.env.VITE_BACKEND_URL;
          const response = await axios.get(`${apiUrl}/domains`);
          set({ domainOptions: response.data });
          return response.data;
        } catch (error) {
          set({ domainOptions: [] });
          return [];
        }
      },
    }),
    {
      name: "user-cookie-storage", // key in localStorage
      // Only persist userCookies, not any authentication state
      partialize: (state) => {
        // Only encrypt userCookies
        return { userCookies: encryptData(state.userCookies) };
      },
      merge: (persistedState, currentState) => {
        let decryptedCookies = {};
        if (persistedState && persistedState.userCookies) {
          decryptedCookies = decryptData(persistedState.userCookies);
        }
        return {
          ...currentState,
          ...persistedState,
          userCookies: decryptedCookies,
        };
      },
    }
  )
);

export default useStore;
