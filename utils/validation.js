const { ObjectId } = require("mongodb");

module.exports = {
  checkId(id, varName) {
    id = this.checkString(id, varName);
    if (!ObjectId.isValid(id))
      throw `Error: ${varName} is an invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply value for ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    const regex = /^[a-zA-Z0-9.-_]*$/;
    if (!regex.test(strVal)) {
      throw `Only Alphabets, Numbers, Dot and Underscore allowed`;
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
    if (typeof val !== "number") {
      throw `${variableName || "provided variable"} is not a number`;
    }

    if (val < minValue) {
      throw `${
        variableName || "provided variable"
      } must not be lesser than ${minValue}`;
    }

    if (val > maxValue) {
      throw `${
        variableName || "provided variable"
      } must not be greater than ${maxValue}`;
    }
    return val;
  },
};
