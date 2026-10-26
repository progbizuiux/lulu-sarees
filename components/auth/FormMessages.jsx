// Small message pieces shared by the auth forms. Styles come from Bootstrap, already loaded by the template.

/** Error under a form field. Link it to the input with aria-describedby={id}. */
export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <span id={id} className="d-block text-danger small mt-1 text-start" role="alert">
      {message}
    </span>
  );
}

/** Message box above the submit button. */
export function FormAlert({ type = "danger", children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type} py-2 px-3 mb-3 small`} role={type === "danger" ? "alert" : "status"}>
      {children}
    </div>
  );
}

/**
 * Splits a mutation error into field errors and one general message.
 * Client-side errors win over server ones for the same field.
 */
export function readFormErrors(mutationError, clientErrors = {}) {
  const serverFieldErrors = mutationError?.fieldErrors ?? {};
  const fieldErrors = { ...serverFieldErrors, ...clientErrors };
  const general = mutationError && Object.keys(serverFieldErrors).length === 0 ? mutationError.message : null;
  return { fieldErrors, general };
}

/** Props that link an input to its error message for screen readers. */
export const errorProps = (id, message) =>
  message ? { "aria-invalid": true, "aria-describedby": id } : { "aria-invalid": false };
