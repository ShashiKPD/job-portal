
const InputLabel = ({ label, name }) => {
  return (
    <label htmlFor={name} className="block mb-2 text-md font-medium text-slate-500">
      {label}
    </label>
  );
};

export default InputLabel;
