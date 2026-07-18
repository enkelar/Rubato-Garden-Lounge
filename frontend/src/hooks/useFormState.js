import { useState } from "react";

// Small helper for form state: init once, update one field at a time
export function useFormState(initialValues) {
  const [form, setForm] = useState(initialValues);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return [form, set, setForm];
}

export default useFormState;