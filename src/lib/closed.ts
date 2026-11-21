import "server-only";
import { countResponses, type FormRow } from "./forms";

/** Returns a message when a published form should not accept responses. */
export async function closedReason(form: FormRow): Promise<string | null> {
  const def = form.published;
  if (!def) return "This form isn't published yet.";
  const s = def.settings;
  if (s.isClosed) return s.closedMessage;
  if (s.closeAt && Date.parse(s.closeAt) < Date.now()) return s.closedMessage;
  if (s.responseLimit && (await countResponses(form.id)) >= s.responseLimit) return s.closedMessage;
  return null;
}
