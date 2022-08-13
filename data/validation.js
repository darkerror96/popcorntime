const {
    ObjectId
} = require('mongodb');
const fs = require('fs');

module.exports = {

    validateID(argName, argValue) {
        module.exports.validateString(argName, argValue);
        if (!ObjectId.isValid(argValue)) throw 'Invalid object ID';
    },

    validateString(argName, argValue) {
        if (!argValue) throw 'User must provide valid ' + argName;
        if (typeof argValue !== 'string') throw argName + ' must be a string';
        if (!isNaN(argValue)) throw argName + ' must be a string';
        if (argValue.trim().length === 0) throw argName + ' cannot be an empty string or just spaces';
    },

    validateNumber(argName, argValue) {
        if (!argValue) throw 'User must provide valid ' + argName;
        if (typeof argValue !== 'number') throw argName + ' must be a number';
        if (argValue <= 0) throw argName + ' must be a positive number';
    },

    validateArray(argName, argValue) {
        if (!argValue || !Array.isArray(argValue)) throw 'User must provide an array of ' + argName;
        if (argValue.length === 0) throw 'User must provide at least one ' + argName;

        for (let temp of argValue) {
            module.exports.validateString(argName + " name", temp);
        }
    },

    validatePosterFilePath(argName, argValue) {
        if (!argValue) throw 'User must provide valid ' + argName;
        if (typeof argValue !== 'string') throw argName + ' file path must be a string';
        if (!isNaN(argValue)) throw argName + ' file path must be a string';
        if (argValue.trim().length === 0) throw argName + ' file path cannot be an empty string or just spaces';

        try {
            if (!fs.existsSync(argValue)) throw 'Image file does not exists at "' + argValue + '"';
        } catch (e) {
            throw 'Image file does not exists at "' + argValue + '" : ' + e;
        }
    },

    validateAvgRating(argName, argValue) {
        if (!argValue) throw 'User must provide valid ' + argName;
        if (typeof argValue !== 'number') throw argName + ' must be a number';
        if (argValue < 0 || argValue > 10) throw argName + ' must be between 0 to 10';
    },

    // TODO : Enhance reviews validation
    validateReviews(argName, argValue) {
        if (!argValue || !Array.isArray(argValue)) throw 'User must provide an array of ' + argName;
        if (argValue.length === 0) throw 'User must provide at least one ' + argName;

        for (let temp of argValue) {
            module.exports.validateString(argName + " name", temp);
        }
    },

    validateMovieData(name, summary, genres, duration, release_date, cast, director) {
        try {
            module.exports.validateString("Movie Name", name);
            module.exports.validateString("Summary", summary);
            module.exports.validateArray("Genre", genres);
            module.exports.validateNumber("Duration", duration);
            module.exports.validateString("Release Date", release_date);
            module.exports.validateArray("Cast", cast);
            module.exports.validateArray("Director", director);
        } catch (e) {
            throw e;
        }
    }
};