// frontend/src/components/UI/Spinner.jsx
import React from "react";
import { ClipLoader } from "react-spinners";
import "../../styles/Spinner.css";

const Spinner = ({ loading }) => {
  return (
    loading && (
      <div className="spinner-container">
        <div className="loader"></div>
        <div className="spinner-text">Loading...</div>
      </div>
    )
  );
};

export default Spinner;
