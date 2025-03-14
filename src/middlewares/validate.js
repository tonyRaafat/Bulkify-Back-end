const dataMethod = ["body", "query", "headers", "params", "file", "files"];

export const validate = (schema) => {
  return (req, res, next) => {
    let arrayErr = [];
    dataMethod.forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });
        if (error?.details) {
          error.details.forEach((err) => {
            arrayErr.push(err.message);
          });
        }
      }
    });
    if (arrayErr.length != 0) {
      return res.status(400).json({ msg: "invalid input data", err: arrayErr });
    }
    next();
  };
};
