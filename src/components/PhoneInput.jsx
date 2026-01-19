import countryCodes from "../utils/countryCodes.json"; 
// [{ "code": "+91", "country": "India" }, ...]

const PhoneInput = ({ label, value, onChange }) => {
  const val = value || { countryCode: "+91", number: "" };

  return (
    <div style={{ marginBottom: "12px" }}>
      <label>{label}</label>
      <div style={{ display: "flex", gap: "8px" }}>
        <select
          value={val.countryCode}
          onChange={(e) => onChange({ ...val, countryCode: e.target.value })}
        >
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.country})
            </option>
          ))}
        </select>

        <input
          type="text"
          value={val.number}
          placeholder="Phone Number"
          onChange={(e) => onChange({ ...val, number: e.target.value })}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
