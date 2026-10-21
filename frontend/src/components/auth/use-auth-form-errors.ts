"use client";

import { useState } from "react";
import type { AuthField, AuthFieldErrors, AuthFormState } from "@/lib/auth-form-state";

export function useAuthFormErrors(state: AuthFormState) {
  const [localErrors, setLocalErrors] = useState<AuthFieldErrors>({});
  const [edited, setEdited] = useState<{ state: AuthFormState; fields: AuthField[] }>({ state, fields: [] });
  const editedFields = edited.state === state ? edited.fields : [];

  function errorFor(field: AuthField) {
    return localErrors[field] ?? (editedFields.includes(field) ? undefined : state.fieldErrors[field]);
  }

  function clearField(field: AuthField) {
    setLocalErrors((current) => ({ ...current, [field]: undefined }));
    setEdited((current) => ({
      state,
      fields: [...new Set([...(current.state === state ? current.fields : []), field])],
    }));
  }

  return {
    errorFor,
    formError: editedFields.length ? null : state.formError,
    clearField,
    setLocalErrors,
  };
}
