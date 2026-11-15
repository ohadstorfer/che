// Sends one mail through the SES path of supabase/functions/_shared/email.ts.
//   SES_AWS_ACCESS_KEY_ID=... SES_AWS_SECRET_ACCESS_KEY=... \
//     deno run -A scripts/email/ses-test.ts [to]
// Default "to" is SES's success simulator, which works in the sandbox.
import { sendEmail } from "../../supabase/functions/_shared/email.ts";

const to = Deno.args[0] ?? "success@simulator.amazonses.com";
const out = await sendEmail({
  provider: "ses",
  to,
  subject: "Posta — SES test",
  text: "Hola! This mail went out through Amazon SES.",
  html: "<p>Hola! This mail went out through <b>Amazon SES</b>.</p>",
  headers: { "List-Unsubscribe": "<mailto:hola@postaspanish.com?subject=unsubscribe>" },
});
console.log(out);
if (!out.ok) Deno.exit(1);
