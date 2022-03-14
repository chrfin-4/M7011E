module.exports = {
  validateUpdate: (options) => {
    if (options.name.length <= 2) {
      return {
        errors: [
          {
            field: "name",
            message: "length must be greater than 0",
          },
        ]
      };
    }

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

    if (options.password.length === 0) delete options.password;
    if (options.password?.length <= 2) {
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