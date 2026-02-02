import * as z from "zod";

const validateSchema = {
    submitDSAQuestion: z.object({
        code : z.string().min(1),
        language : z.enum(["javascript", "pythond", "cpp", "c", "java"])
    })
}

export default validateSchema;