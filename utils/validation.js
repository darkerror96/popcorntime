const fs = require("fs");
const { ObjectId } = require("mongodb");

module.exports = {
  checkId(id, varName) {
    id = this.checkString(id, varName);
    if (!ObjectId.isValid(id))
      throw `Error: ${varName} is an invalid object ID`;
    return id;
  },

  checkStringNoRegex(strVal, varName) {
    if (!strVal) throw `Error: You must provide value for ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    return strVal;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must provide value for ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: Empty text or text with just spaces is not valid for ${varName}`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    const regexNoSymbols = /^[a-zA-Z0-9À-ÖØ-öø-ÿ.,\-\'_! ]*$/;
    const regexHasAlphabets = /[a-zA-Z]/;
    if (!regexNoSymbols.test(strVal)) {
      throw `Error: Only alphabets, numbers, period, dash, and underscore are allowed for ${varName}`;
    }
    if (!regexHasAlphabets.test(strVal)) {
      throw `Error: No alphabets found in ${varName}`;
    }
    return strVal;
  },

  checkStringArray(arr, varName) {
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    if (arr.length == 0) throw `Error: The ${varName} array is empty`;
    for (i in arr) {
      arr[i] = this.checkString(arr[i], `${varName}[${i}]`);
    }
    return arr;
  },

  checkNumber(val, variableName, minValue, maxValue) {
    if (!val) {
      throw `Error: You must provide a number for ${variableName} between ${minValue} and ${maxValue}!`;
    }

    try {
      val = parseFloat(val);
    } catch (e) {
      throw `Error: ${
        variableName || "provided variable"
      } can't be parsed to a number`;
    }

    if (val < minValue) {
      throw `Error: ${
        variableName || "provided variable"
      } must not be lesser than ${minValue}`;
    }

    if (val > maxValue) {
      throw `Error: ${
        variableName || "provided variable"
      } must not be greater than ${maxValue}`;
    }
    return val;
  },

  checkPreferenceCategory(preferenceCategory) {
    if (!preferenceCategory) {
      throw `You must provide a value for preference category`;
    }
    if (
      preferenceCategory != "liked_genres" &&
      preferenceCategory != "disliked_genres" &&
      preferenceCategory != "liked_movies" &&
      preferenceCategory != "disliked_movies" &&
      preferenceCategory != "liked_actors" &&
      preferenceCategory != "disliked_actors" &&
      preferenceCategory != "liked_directors" &&
      preferenceCategory != "disliked_directors"
    ) {
      throw `You must provide a valid value for preference category`;
    }
    return preferenceCategory;
  },

  checkPosterFilePath(filePath, varName) {
    if (!filePath) throw `Error: You must supply value for ${varName}!`;
    if (typeof filePath !== "string")
      throw `Error: ${varName} must be a string!`;
    filePath = filePath.trim();
    if (filePath.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(filePath))
      throw `Error: "${filePath}" is not a valid value for ${varName} as it only contains digits`;

    if (this.isValidHttpUrl(filePath)) {
      return filePath;
    } else {
      try {
        if (!fs.existsSync(filePath))
          throw `Error: Image file does not exists at "${filePath}"`;
      } catch (e) {
        throw `Error: Image file does not exists at "${filePath}" : ${e}`;
      }
    }
    return filePath;
  },

  checkDate(strVal, varName) {
    if (!strVal) throw `Error: You must supply value for ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;

    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!regex.test(strVal)) {
      throw `Error: Valid ${varName} format = yyyy-MM-dd`;
    }
    return strVal;
  },

  isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  },

  checkUsername(username) {
    if (!username) throw `Error: You must supply value for username!`;
    if (typeof username !== "string") throw `Error: username must be a string!`;
    username = username.trim();
    if (username.length === 0)
      throw `Error: username cannot be an empty string or string with just spaces`;
    if (username.length < 4)
      throw `Error: username must be at least 4 characters long`;
    if (!isNaN(username))
      throw `Error: "${username}" is not a valid value for username as it only contains digits`;
    const regex = /^[a-zA-Z0-9_]*$/;
    if (!regex.test(username)) {
      throw `Error: Only letters, numbers, and underscore are allowed for username : ${username}`;
    }
    return username;
  },

  checkPassword(password) {
    if (!password) throw `Error: You must supply value for password!`;
    if (typeof password !== "string") throw `Error: password must be a string!`;
    password = password.trim();
    if (password.length === 0)
      throw `Error: password cannot be an empty string or string with just spaces`;
    if (password.length < 4)
      throw `Error: password must be at least 4 characters long`;
    if (!isNaN(password)) throw `Error: Password only contains digits`;
    return password;
  },

  checkEmail(email) {
    if (!email) throw `Error: You must supply value for email!`;
    if (typeof email !== "string") throw `Error: email must be a string!`;
    email = email.trim();
    if (email.length === 0)
      throw `Error: email cannot be an empty string or string with just spaces`;
    if (!isNaN(email)) throw `Error: Email only contains digits`;
    const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!regex.test(email)) {
      throw `Error: Invalid email format : ${email}`;
    }
    return email;
  },
};
