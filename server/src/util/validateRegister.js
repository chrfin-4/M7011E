module.exports = {
  validateRegister: (options) => {
    if (!options.email.includes("@")) {
      return {
        errors: [
          {
            field: "email",
            message: "invalid email",
          },
        ]
      };
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 2",
          },
        ]
      };
    }

    return null;
  }
};