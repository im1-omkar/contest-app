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
    })

}

export default validateSchema