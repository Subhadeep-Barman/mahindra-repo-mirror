import { useState } from "react";

export default function ChennaiJobOrderForm() {
  const [form, setForm] = useState({
    project: "",
    vehicleBodyNumber: "",
    vehicleNumber: "",
    engineNumber: "",
    domain: "",
  });

  // Example options (replace with your actual data)
  const projectOptions = ["U352", "U952"];
  const vehicleBodyOptions = ["V.B.NO123456", "V.B.NO654321"];
  const vehicleNumberOptions = ["V.S.NO123456", "V.S.NO654321"];
  const engineNumberOptions = ["E.S.NO123456", "E.S.NO654321"];
  const domainOptions = ["OBD", "BOE", "SCR", "GENERAL"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    // handle form submission here
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      {/* Project */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          name="project"
          value={form.project}
          onChange={handleChange}
          required
          className="border rounded px-2 py-1"
        >
          <option value="">Select</option>
          {projectOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Vehicle Body Number */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">
          Vehicle Body Number <span className="text-red-500">*</span>
        </label>
        <select
          name="vehicleBodyNumber"
          value={form.vehicleBodyNumber}
          onChange={handleChange}
          required
          className="border rounded px-2 py-1"
        >
          <option value="">Select</option>
          {vehicleBodyOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Vehicle Number */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">
          Vehicle Number <span className="text-red-500">*</span>
        </label>
        <input
          name="vehicleNumber"
          value={form.vehicleNumber}
          onChange={handleChange}
          required
          placeholder="V.S.NO123456"
          className="border rounded px-2 py-1"
          list="vehicleNumberOptions"
        />
        <datalist id="vehicleNumberOptions">
          {vehicleNumberOptions.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      </div>

      {/* Engine Number */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">
          Engine Number <span className="text-red-500">*</span>
        </label>
        <input
          name="engineNumber"
          value={form.engineNumber}
          onChange={handleChange}
          required
          placeholder="E.S.NO123456"
          className="border rounded px-2 py-1"
          list="engineNumberOptions"
        />
        <datalist id="engineNumberOptions">
          {engineNumberOptions.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      </div>

      {/* Domain */}
      <div className="flex flex-col">
        <label className="text-xs font-semibold mb-1">
          Domain <span className="text-red-500">*</span>
        </label>
        <select
          name="domain"
          value={form.domain}
          onChange={handleChange}
          required
          className="border rounded px-2 py-1"
        >
          <option value="">Select</option>
          {domainOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </form>
  );
}