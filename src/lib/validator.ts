export function validator(
  value: string,
  type: string
): boolean | string {
  switch (type) {
    case "email":
      return validateEmail(value);
    case "password":
      return validatePassword(value);
    case "mobile":
      return validatePhone(value);
    case "name":
        return validateName(value);
    default:
      return '';
  }
}
function validateEmail(email: string): boolean | string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }
  return '';
}
function validatePassword(password: string): boolean | string {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return "Password must be at least 8 characters long, contain at least one letter, one number, and one special character";
    }
    return '';
}
function validatePhone(mobile: string): boolean | string {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(mobile)) {
        return "Phone number must be 10 digits long";
    }
    return '';
    }
function validateName(name: string): boolean | string {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
        return "Name can only contain letters and spaces";
    }
    return '';
}

// async function validatePostalCode(postalCode: string): Promise<boolean | string> {
//     try {
//         const result = await fetchDataJson<{ status: string; data: { data: any[] } }>(`postal-data?postal_code=${postalCode}`);
//         console.log(result.data.data)
//         if (result.status === "success" && result.data.data.length > 0) {
//             console.log('postal code valid');
//             return '';
//         }
//         return "Invalid postal code";
//     } catch (error) {
//         return "Error validating postal code";
//     }
// }