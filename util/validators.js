module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  //  Create empty errors object
  const errors = {};
  //  Make sure username is not empty else add error
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  //  Make sure email is not empty and is valid email address else add error
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }
  //  Make sure password is not empty and also matches confirmPassword else add error
  if (password === "") {
    errors.password = "Password must not empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  //  Create empty errors object
  const errors = {};
  //  Make sure username is not empty else add error
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  //  Make sure password is not empty else add error
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
