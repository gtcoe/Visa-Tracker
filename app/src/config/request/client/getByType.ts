import { ValidationSchema } from "../interface/request";

const getByType: ValidationSchema = {
    param: {
        type: {
            type: "string",
            required: true,
        }
    }
};

export default getByType;
