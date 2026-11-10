import { createServerFn } from "@tanstack/react-start";
import type { ConsultationInput, EnquiryInput } from "@/lib/schemas";

export const sendEnquiry = createServerFn({ method: "POST" })
  .validator((data: EnquiryInput) => data)
  .handler(async ({ data }) => {
    const { submitEnquiry } = await import("@/lib/server/forms");
    return submitEnquiry(data);
  });

export const sendConsultation = createServerFn({ method: "POST" })
  .validator((data: ConsultationInput) => data)
  .handler(async ({ data }) => {
    const { submitConsultation } = await import("@/lib/server/forms");
    return submitConsultation(data);
  });
