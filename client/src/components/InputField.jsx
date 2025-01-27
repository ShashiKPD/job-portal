
const InputField = ({ name, type = "text", register, validation, error }) => {
  return (
    <>
    <input
      id={name}
      name={name}
      type={type}
      {...register(name, validation)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
    />
    {error && <p className="text-red-500">{error.message}</p>}
    </>
  );
};

export default InputField;
