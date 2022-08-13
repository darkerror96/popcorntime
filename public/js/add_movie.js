(function ($) {

    const addMovieForm = $('#addMovieForm'),
        result = $('#result'),
        movieName = $('#movieName'),
        movieSummary = $('#movieSummary'),
        movieGenres = document.querySelectorAll('.genresCheckbox'),
        movieDuration = $('#movieDuration'),
        moviePoster = $('#moviePoster'),
        movieReleaseDate = $('#movieReleaseDate'),
        movieCast = $('#movieCast'),
        movieDirector = $('#movieDirector');

    var file = "",
        fileName = "",
        fileSizeMB = 0;

    // image select event listener - triggers when user selects new image
    document.getElementById('moviePoster').addEventListener('change', (e) => {
        const fileList = e.target.files;
        file = fileList[0];
        fileName = fileList[0].name.trim();
        fileSizeMB = fileList[0].size / 1048000;
    });

    // form submit event
    addMovieForm.submit(function (event) {
        event.preventDefault();

        try {
            result.hide();

            const movieNameVal = movieName.val().trim(),
                movieSummaryVal = movieSummary.val().trim(),
                movieDurationVal = parseInt(movieDuration.val().trim()),
                movieReleaseDateVal = movieReleaseDate.val().trim();

            // validate user inputs on client side
            validateString("Movie Name", movieNameVal);
            validateString("Summary", movieSummaryVal);
            const movieGenresVal = validateGenre("Genre", movieGenres);
            validateNumber("Duration", movieDurationVal);
            validatePoster("Poster", fileName);
            validateString("Release Date", movieReleaseDateVal);
            const movieCastArr = validateStringArrays("Cast", movieCast.val().trim());
            const movieDirectorArr = validateStringArrays("Director", movieDirector.val().trim());

            const movieData = {
                name: movieNameVal,
                summary: movieSummaryVal,
                genres: movieGenresVal,
                duration: movieDurationVal,
                release_date: movieReleaseDateVal,
                cast: movieCastArr,
                director: movieDirectorArr
            };

            // POST movie data + poster to db
            let formData = new FormData();
            formData.append('moviePoster', file);
            formData.append('movieData', JSON.stringify(movieData));

            fetch('http://localhost:3000/shows/add', {
                    method: 'POST',
                    body: formData
                }).then(response => response.json())
                .then(json => {

                    addMovieForm.trigger('reset');

                    if (json.status === 201) {
                        const movieURL = "http://localhost:3000/shows/" + json.movieID;

                        result.show();
                        result.html('<p class="success"><a href=' + movieURL + '>' + movieNameVal + '</a> movie successfully added!</p>');
                    } else {
                        result.show();
                        result.html('<p class="error">Error adding movie. Please try again!</p>');
                    }
                });
        } catch (e) {
            result.show();
            result.html('<p class="error">' + e + '</p>');
        }
    });

    // validation functions
    function validateString(argName, argValue) {
        if (!argValue) throw 'User must provide valid ' + argName;
        if (typeof argValue !== 'string') throw argName + ' must be a string';
        if (!isNaN(argValue)) throw argName + ' must be a string';
        if (argValue.trim().length === 0) throw argName + ' cannot be an empty string or just spaces';
    }

    function validateGenre(argName, argValue) {
        let genres = [];
        argValue.forEach(function (elem) {
            if (elem.checked) {
                genres.push(elem.name.trim());
            }
        });

        if (genres.length === 0) {
            throw 'User must select at least one ' + argName;
        }

        return genres;
    }

    function validateNumber(argName, argValue) {
        if (!argValue) throw 'User must provide valid ' + argName;
        if (typeof argValue !== 'number') throw argName + ' must be a number';
        if (argValue <= 0) throw argName + ' must be a positive number';
    }

    function validatePoster(argName, argValue) {
        if (!argValue) throw 'User must select valid ' + argName;
        if (argValue.trim().length === 0) throw argName + ' file name cannot be an empty string or just spaces';
        if (fileSizeMB > 2) throw 'User must select image with size less than 2 MB';
    }

    function validateStringArrays(argName, argValue) {
        if (!argValue) throw 'User must provide valid ' + argName;
        if (argValue.length === 0) throw 'User must provide at least one ' + argName;

        let array = [];
        for (let temp of argValue.split(",")) {
            validateString(argName + " name", temp.trim());
            array.push(temp.trim());
        }

        return array;
    }
})(window.jQuery);