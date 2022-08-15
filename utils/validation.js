const fs = require('fs');
const {
  ObjectId
} = require("mongodb");

module.exports = {
  checkId(id, varName) {
    id = this.checkString(id, varName);
    if (!ObjectId.isValid(id))
      throw `Error: ${varName} is an invalid object ID`;
    return id;
  },

  checkIdArray(arr, varName) {
    if (!arr || !Array.isArray(arr)) throw `You must provide an array of ${varName}`;
    if (arr.length == 0) throw `Error: The ${varName} array is empty`;
    for (i in arr) {
      arr[i] = this.checkId(arr[i], `${varName}[${i}]`);
    }
    return arr;
  },

  checkStringNoRegex(strVal, varName) {
    if (!strVal) throw `Error: You must provide value for ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
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
    const regex = /^[a-zA-Z0-9.,\-\'_! ]*$/;
    if (!regex.test(strVal)) {
      throw `Error: Only alphabets, numbers, period, dash, and underscore are allowed for ${varName} : ${strVal}`;
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
    try {
      val = parseInt(val, 10);
    } catch (e) {
      throw `${
        variableName || "provided variable"
      } can't be parsed to a number`;
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
    if (typeof filePath !== "string") throw `Error: ${varName} must be a string!`;
    filePath = filePath.trim();
    if (filePath.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(filePath))
      throw `Error: "${filePath}" is not a valid value for ${varName} as it only contains digits`;

    if (this.isValidHttpUrl(filePath)) {
      return filePath;
    } else {
      try {
        if (!fs.existsSync(filePath)) throw `Error: Image file does not exists at "${filePath}"`;
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

  checkReviews(reviews, varName) {
    if (!reviews || !Array.isArray(reviews)) throw `You must provide an array of ${varName}`;
    if (reviews.length == 0) throw `Error: The ${varName} array is empty`;

    for (i in reviews) {
      reviews[i].user_id = this.checkId(reviews[i].user_id, "User ID");
      reviews[i].timestamp = this.checkStringNoRegex(reviews[i].timestamp, "Timestamp");
      reviews[i].rating = this.checkNumber(reviews[i].rating, "Rating", 1, 10);
      reviews[i].comment = this.checkString(reviews[i].comment, "Comment");
      reviews[i].likes = this.checkIdArray(reviews[i].likes, "Likes");
      reviews[i].dislikes = this.checkIdArray(reviews[i].dislikes, "Dislikes");
    }

    return reviews;
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

};