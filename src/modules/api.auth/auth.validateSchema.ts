//export schema of signup -> a zod object
import * as z from "zod";

const validateSchema = {
    signup : z.object({
        name: z.string()
                .min(2,"atleast 2 chars should be present")
                .max(50,"max to max 50 chars are allowed"),
        email : z
                .string()
                .email("invalid mail format")
                .max(100, "Email too long"),
        password : z.string()
                    .min(8,"atleast 8 chars should be present")
                    .max(128,"pass too long"),
        role : z
                .enum(["contestee","creator"]).optional()
    }),

    signin: z.object({
        email: z.string()
                  .email("invalid email format")
                  .max(100,"too long email"),
        password: z.string()
                    .min(8,"atleast 8 chars should be present")
                    .max(128,"pass too long"),
    })
};

export default  validateSchema;

