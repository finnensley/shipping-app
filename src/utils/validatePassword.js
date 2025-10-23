export const validatePassword = (password) => {
  // 2️⃣ Password validation
  const pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  return pattern.test(password);
};