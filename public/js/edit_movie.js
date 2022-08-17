(function ($) {

    const editMovieForm = $('#editMovieForm'),
        result = $('#result'),
        movieName = $('#movieName'),
        movieSummary = $('#movieSummary'),
        movieGenres = $('#movieGenres'),
        movieDuration = $('#movieDuration'),
        movieReleaseDate = $('#movieReleaseDate'),
        movieCast = $('#movieCast'),
        movieDirector = $('#movieDirector');

    var file = "",
        fileName = "",
        fileSizeMB = -1;

    // image select event listener - triggers when user selects new image
    document.getElementById('moviePoster').addEventListener('change', (e) => {
        const fileList = e.target.files;
        file = fileList[0];
        fileName = fileList[0].name.trim();
        fileSizeMB = fileList[0].size / 1048000;
    });

    // delete movie button
    $('#deleteBtn').click(function () {
        try {
            result.hide();

            const pathname = window.location.pathname;
            let movieID = pathname.split("/movies/edit/");
            if (movieID.length == 2) {
                movieID = movieID[1].trim();
            } else {
                throw `Invalid Movie URL : ${pathname}`;
            }

            const movieData = {
                id: movieID
            };

            // DEL movie from DB
            let formData = new FormData();
            formData.append('movieData', JSON.stringify(movieData));

            fetch('http://localhost:3000/movies/delete', {
                    method: 'DELETE',
                    body: formData
                }).then(response => response.json())
                .then(json => {

                    if (json.status === 200) {
                        result.show();
                        result.html('<p class="success">Movie successfully deleted!</p>');
                    } else {
                        result.show();
                        result.html('<p class="error">Error deleting movie : ' + json.error + '</p>');
                    }
                });
        } catch (e) {
            result.show();
            result.html('<p class="error">' + e + '</p>');
        }
    });

    // form submit event
    editMovieForm.submit(function (event) {
        event.preventDefault();

        try {
            result.hide();

            const pathname = window.location.pathname;
            let movieID = pathname.split("/movies/edit/");
            if (movieID.length == 2) {
                movieID = movieID[1].trim();
            } else {
                throw `Invalid Movie URL : ${pathname}`;
            }

            let movieNameVal = movieName.val(),
                movieSummaryVal = movieSummary.val(),
                movieGenresVal = movieGenres.val(),
                movieDurationVal = movieDuration.val(),
                movieReleaseDateVal = movieReleaseDate.val(),
                movieCastArr = [],
                movieDirectorArr = [];

            // validate user inputs on client side
            movieID = checkString(movieID, "Movie ID");
            movieNameVal = checkStringNoRegex(movieNameVal, "Movie Name");
            movieSummaryVal = checkStringNoRegex(movieSummaryVal, "Summary");
            movieGenresVal = checkStringArray(movieGenresVal, "Genre");
            movieDurationVal = checkNumber(movieDurationVal, "Duration", 1, 5000);
            checkPoster(fileName, "Poster");
            movieReleaseDateVal = checkStringNoRegex(movieReleaseDateVal, "Release Date");
            movieCastArr = checkStringArray(movieCast.val(), "Cast");
            movieDirectorArr = checkStringArray(movieDirector.val(), "Director");

            const movieData = {
                id: movieID,
                name: movieNameVal,
                summary: movieSummaryVal,
                genres: movieGenresVal,
                duration: movieDurationVal,
                release_date: movieReleaseDateVal,
                cast: movieCastArr,
                director: movieDirectorArr
            };

            // POST movie data + poster to DB
            let formData = new FormData();
            formData.append('movieData', JSON.stringify(movieData));

            if (fileSizeMB !== -1) {
                formData.append('moviePoster', file);
            }

            fetch('http://localhost:3000/movies/edit', {
                    method: 'POST',
                    body: formData
                }).then(response => response.json())
                .then(json => {

                    if (json.status === 200) {
                        const movieURL = "http://localhost:3000/movies/" + json.movieID;

                        result.show();
                        result.html('<p class="success">Movie successfully updated! Click <a href=' + movieURL + '>here</a> to see updated page...</p>');
                    } else {
                        result.show();
                        result.html('<p class="error">Error updating movie : ' + json.error + '</p>');
                    }
                });
        } catch (e) {
            result.show();
            result.html('<p class="error">' + e + '</p>');
        }
    });

    // validation functions
    function checkString(strVal, varName) {
        if (!strVal) throw `Error: You must supply value for ${varName}!`;
        if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
        strVal = strVal.trim();
        if (strVal.length === 0) throw `Error: ${varName} cannot be an empty string or string with just spaces`;
        if (!isNaN(strVal)) throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
        const regex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ.,\-\'_! ]*$/;
        if (!regex.test(strVal)) throw `Only Alphabets, Numbers, Dot and Underscore allowed for ${varName}`;
        return strVal;
    }

    function checkStringNoRegex(strVal, varName) {
        if (!strVal) throw `Error: You must supply value for ${varName}!`;
        if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
        strVal = strVal.trim();
        if (strVal.length === 0) throw `Error: ${varName} cannot be an empty string or string with just spaces`;
        return strVal;
    }

    function checkNumber(val, varName, minValue, maxValue) {
        if (!val) throw `Error: You must supply value for ${varName}!`;

        try {
            val = parseInt(val, 10);
        } catch (e) {
            throw `${varName || "provided variable"} can't be parsed to a number`;
        }

        if (typeof val !== "number") throw `Error: ${varName} must be a number!`;
        if (val < minValue) throw `${varName || "provided variable"} must not be lesser than ${minValue}`;
        if (val > maxValue) throw `${varName || "provided variable"} must not be greater than ${maxValue}`;

        return val;
    }

    function checkStringArray(arr, varName) {
        if (!arr) throw `You must provide an array of ${varName}`;
        if (arr.length == 0) throw `Error: You must provide at least one ${varName}`;

        let array = [];
        for (let temp of arr.split(",")) {
            checkString(temp.trim(), varName + " element");
            array.push(temp.trim());
        }

        return array;
    }

    function checkPoster(poster, varName) {
        if (fileSizeMB !== -1) {
            if (!poster) throw `Error: You must supply value for ${varName}!`;
            if (typeof poster !== "string") throw `Error: ${varName} must be a string!`;
            poster = poster.trim();
            if (poster.length === 0) throw `Error: ${varName} cannot be an empty string or string with just spaces`;

            if (fileSizeMB > 2) throw `Error: You must select image with size less than 2 MB`;
        }
    }

})(window.jQuery);