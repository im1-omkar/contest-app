import * as z from "zod";

const validateSchema = {

    createContest : z.object({
        title : z.string()
                 .min(2)
                 .max(100),
        description : z.string()
                       .max(1000),
        startTime : z.string()
                     .datetime(),
        endTime : z.string()
                   .datetime()
    }),

    addMCQ : z.object({
        questionText : z.string()
                        .max(1000),
        options : z.array(z.string().min(1)).max(10),
        correctOptionIndex : z.number().int().min(0),
        points : z.number().int().min(1).default(1)
    }),

    submitMCQ : z.object({
        selectedOptionIndex : z.number().int()
    })

}

export default validateSchema